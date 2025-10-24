import { ErrorHandler, Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private toast: ToastService) {}

  handleError(error: any): void {
    // Log to console (could be sent to remote logging)
    console.error('GlobalErrorHandler caught error', error);

    // Friendly toast for users (keep message generic)
    try {
      this.toast.show('An unexpected error occurred');
    } catch (e) {
      // swallow
    }
  }
}
