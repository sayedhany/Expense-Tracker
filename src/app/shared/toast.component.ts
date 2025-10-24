import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 space-y-2">
      <div *ngFor="let t of toasts()" class="bg-black text-white px-4 py-2 rounded shadow">
        {{ t.message }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private toast = inject(ToastService);
  toasts = this.toast.toasts;
}
