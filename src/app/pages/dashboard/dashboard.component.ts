import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpensesService, Expense } from '../../shared/expenses.service';
import { LoadingService } from '../../shared/loading.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpensesService, LoadingService],
})
export class DashboardComponent {
  // Services
  router = inject(Router);
  private expensesService = inject(ExpensesService);
  private loadingService = inject(LoadingService);
  userService = inject(UserService);

  // State
  totalBalance = signal<number>(0);
  income = signal<number>(0);
  expenses = signal<number>(0);
  allExpenses = signal<Expense[]>([]); // All expenses from API/cache
  filteredExpenses = signal<Expense[]>([]); // After applying filter
  displayedExpenses = signal<Expense[]>([]); // Paginated subset for display

  page = signal<number>(1);
  limit = 10;
  hasMore = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Period selector
  periodOptions = ['Last 7 Days', 'This Month', 'This Year', 'All Time'];
  selectedPeriod = signal<string>('This Month');
  ngOnInit() {
    this.loadAllExpenses();
    this.loadPersistedFilter();
  }

  /**
   * Navigate to add expense page
   */
  navigate() {
    this.router.navigate(['/add-expense']);
  }

  /**
   * Load persisted filter from localStorage
   */
  private loadPersistedFilter() {
    try {
      const saved = localStorage.getItem('dashboard:filter');
      if (saved) {
        this.selectedPeriod.set(saved);
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Handle period filter change
   */
  onPeriodChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.selectedPeriod.set(val);

    // Persist filter selection
    try {
      localStorage.setItem('dashboard:filter', val);
    } catch (e) {
      // ignore
    }

    // Reset pagination and reload with filter
    this.page.set(1);
    this.displayedExpenses.set([]);
    this.applyFilterAndPagination();
  }

  /**
   * Load all expenses from cache/API
   */
  loadAllExpenses() {
    this.isLoading.set(true);
    this.error.set(null);

    this.expensesService.paginatedList(1, 1000).subscribe({
      next: (expenses: any) => {
        this.allExpenses.set(expenses);
        this.applyFilterAndPagination();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load expenses', err);
        this.error.set('Failed to load expenses. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Apply period filter and pagination
   */
  private applyFilterAndPagination() {
    const all = this.allExpenses();
    const filtered = this.filterByPeriod(all);
    this.filteredExpenses.set(filtered);

    // Calculate summary
    this.calculateSummary(filtered);

    // Load first page
    this.loadMoreExpenses();
  }

  /**
   * Filter expenses by selected period
   */
  private filterByPeriod(expenses: Expense[]): Expense[] {
    const now = new Date();
    const period = this.selectedPeriod();
    let startDate: Date | null = null;

    switch (period) {
      case 'Last 7 Days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'This Year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'All Time':
        startDate = null;
        break;
    }

    return expenses.filter((expense) => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      if (isNaN(expenseDate.getTime())) return false;
      if (!startDate) return true;
      return expenseDate >= startDate;
    });
  }

  /**
   * Calculate income, expenses, and balance summary
   */
  private calculateSummary(expenses: Expense[]) {
    let totalIncome = 0;
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      const amount = expense.amountUsd ?? expense.amount ?? 0;

      // Assuming positive amounts are income, negative are expenses
      // Adjust this logic based on your data model
      if (amount > 0) {
        totalIncome += amount;
        totalExpenses += amount; // All amounts are expenses in this case
      } else {
        totalExpenses += Math.abs(amount);
      }
    });

    this.income.set(Number(totalIncome.toFixed(2)));
    this.expenses.set(Number(totalExpenses.toFixed(2)));
    this.totalBalance.set(Number((totalIncome - totalExpenses).toFixed(2)));
  }

  /**
   * Load more expenses (pagination)
   */
  loadMoreExpenses() {
    const filtered = this.filteredExpenses();
    const currentPage = this.page();
    const startIdx = (currentPage - 1) * this.limit;
    const endIdx = startIdx + this.limit;

    const newExpenses = filtered.slice(startIdx, endIdx);

    if (newExpenses.length > 0) {
      const current = this.displayedExpenses();
      this.displayedExpenses.set([...current, ...newExpenses]);
      this.page.set(currentPage + 1);
    }

    // Check if there are more expenses to load
    this.hasMore.set(endIdx < filtered.length);
  }

  /**
   * Handle infinite scroll
   */
  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      if (this.hasMore() && !this.isLoading()) {
        this.loadMoreExpenses();
      }
    }
  }

  /**
   * Get category icon emoji
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      groceries: '🛒',
      entertainment: '🎬',
      gas: '⛽',
      shopping: '🛍️',
      news: '📰',
      transport: '🚗',
      rent: '🏠',
      food: '🍔',
      healthcare: '⚕️',
      utilities: '💡',
      education: '📚',
      travel: '✈️',
    };
    return icons[category.toLowerCase()] || '💰';
  }
}
