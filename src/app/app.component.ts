import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast.component';
import { inject } from '@angular/core';
import { OfflineService } from './shared/offline.service';
import { ExpensesService } from './shared/expenses.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Expense-Tracker';
  private offline = inject(OfflineService);
  private expensesService = inject(ExpensesService);

  constructor() {
    // attempt sync when the browser goes online
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('online', () => {
        // try to sync outbox
        this.expensesService.syncOutbox().catch((e) => console.warn(e));
      });
    }
    // also try immediate sync if online
    if (this.offline.isOnline()) {
      this.expensesService.syncOutbox().catch((e) => console.warn(e));
    }
  }
}
