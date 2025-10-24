import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { LoadingService } from '../../shared/loading.service';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';
import { ExpensesService, Expense } from '../../shared/expenses.service';
import { CategoriesService, Category } from '../../shared/categories.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoadingService, ExpensesService, CategoriesService],
})
export class AddExpenseComponent {
  // Figma-like category colors
  categoryBgColor(id: string): string {
    switch (id) {
      case 'groceries':
        return '#e0e7ff'; // blue-50
      case 'entertainment':
        return '#dbeafe'; // blue-100
      case 'gas':
        return '#fee2e2'; // red-100
      case 'shopping':
        return '#fef9c3'; // yellow-100
      case 'news':
        return '#f3f4f6'; // gray-100
      case 'transport':
        return '#ede9fe'; // purple-100
      case 'rent':
        return '#fef3c7'; // orange-100
      default:
        return '#f3f4f6'; // gray-100
    }
  }

  categoryIconColor(id: string): string {
    switch (id) {
      case 'groceries':
        return '#2563eb'; // blue-600
      case 'entertainment':
        return '#2563eb'; // blue-600
      case 'gas':
        return '#ef4444'; // red-500
      case 'shopping':
        return '#f59e42'; // yellow-500
      case 'news':
        return '#6b7280'; // gray-500
      case 'transport':
        return '#7c3aed'; // purple-600
      case 'rent':
        return '#f59e42'; // orange-500
      default:
        return '#6b7280'; // gray-500
    }
  }
  form: FormGroup;
  loading = signal(false);
  selectedCategory = signal<string | null>(null);
  categories = signal<Category[]>([]);
  currencies = signal<string[]>(['USD', 'EUR', 'GBP', 'EGP']);
  receiptPreview = signal<string | null>(null);
  receiptFileName = signal<string | null>(null);
  conversionRate = signal<number | null>(null);
  convertedAmount = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private toast: ToastService,
    private router: Router,
    private location: Location,
    private expenses: ExpensesService,
    private categoriesService: CategoriesService
  ) {
    this.form = this.fb.group({
      category: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      receipt: [null],
    });

    // Watch amount and currency changes for live conversion
    this.form.get('amount')?.valueChanges.subscribe(() => this.updateConversion());
    this.form.get('currency')?.valueChanges.subscribe(() => this.updateConversion());
  }

  ngOnInit(): void {
    this.categoriesService.list().subscribe((cats: Category[]) => this.categories.set(cats));

    // load currencies from external API
    this.expenses.getRates().subscribe({
      next: (res: any) => {
        if (res && res.rates) {
          const codes = Object.keys(res.rates).sort();
          this.currencies.set(codes);
          // if current currency not in list, set to base
          const current = this.form.get('currency')?.value;
          if (!codes.includes(current)) {
            this.form.get('currency')?.setValue(res.base_code || 'USD');
          }
        }
      },
      error: (err: any) => {
        console.warn('Failed to load currency rates, using fallback', err);
        // keep default fallback array
      },
    });
  }

  /**
   * Update live currency conversion preview
   */
  private async updateConversion() {
    const amount = this.form.get('amount')?.value;
    const currency = this.form.get('currency')?.value;

    if (!amount || amount <= 0 || !currency || currency === 'USD') {
      this.convertedAmount.set(null);
      this.conversionRate.set(null);
      return;
    }

    try {
      const res: any = await this.expenses.getRates().toPromise();
      if (res && res.rates && res.rates[currency]) {
        const rate = res.rates[currency];
        this.conversionRate.set(rate);
        const usdAmount = amount / rate;
        this.convertedAmount.set(Number(usdAmount.toFixed(2)));
      }
    } catch (err) {
      console.warn('Failed to fetch conversion rate', err);
    }
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.receiptPreview.set(null);
      this.receiptFileName.set(null);
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.show('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('File size must be less than 5MB');
      return;
    }

    this.receiptFileName.set(file.name);

    const base64 = await this.readFileAsBase64(file);
    this.receiptPreview.set(base64);
    this.form.get('receipt')?.setValue(base64);

    try {
      // clear input so browser doesn't complain about programmatic value changes
      input.value = '';
    } catch (e) {
      // ignore if environment doesn't allow
    }
  }

  /**
   * Remove uploaded receipt
   */
  removeReceipt() {
    this.receiptPreview.set(null);
    this.receiptFileName.set(null);
    this.form.get('receipt')?.setValue(null);
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  goBack() {
    this.location.back();
  }

  chooseCategory(id: string) {
    this.selectedCategory.set(id);
    this.form.get('category')?.setValue(id);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please fill all required fields');
      return;
    }

    this.loading.set(true);
    this.loadingService.show();

    try {
      const formVal = { ...this.form.value } as any;

      // compute numeric amount
      const amountNum = Number(formVal.amount);

      // fetch latest rates and compute USD equivalent
      let amountUsd: number | null = null;
      const currency = (formVal.currency || 'USD') as string;

      if (currency === 'USD') {
        amountUsd = Number(amountNum.toFixed(2));
      } else {
        try {
          const res: any = await this.expenses.getRates().toPromise();
          if (res && res.rates) {
            const rates = res.rates as Record<string, number>;
            const rate = rates[currency];

            if (rate && typeof rate === 'number') {
              amountUsd = Number((amountNum / rate).toFixed(2));
            } else {
              this.toast.show(`Unable to convert ${currency} to USD`);
              amountUsd = amountNum; // Fallback to original amount
            }
          }
        } catch (err) {
          console.warn('Failed to fetch rates for conversion', err);
          this.toast.show('Currency conversion unavailable, saving without conversion');
          amountUsd = amountNum;
        }
      }

      const payload: Expense = {
        category: formVal.category,
        amount: amountNum,
        currency,
        amountUsd: amountUsd ?? undefined,
        date: formVal.date,
        receipt: formVal.receipt || null,
      };

      await this.expenses.add(payload);

      this.toast.show('✅ Expense added successfully');

      // Reset form
      this.form.reset({
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
      });
      this.selectedCategory.set(null);
      this.receiptPreview.set(null);
      this.receiptFileName.set(null);
      this.convertedAmount.set(null);
      this.conversionRate.set(null);

      // Navigate back to dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    } catch (err) {
      console.error('Save failed', err);
      this.toast.show('❌ Failed to save expense');
    } finally {
      this.loading.set(false);
      this.loadingService.hide();
    }
  }
}
