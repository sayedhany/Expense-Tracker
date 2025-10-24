import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();
  private id = 1;

  show(message: string, timeout = 2500) {
    const t = { id: this.id++, message };
    this._toasts.update((arr) => [...arr, t]);
    setTimeout(() => this.dismiss(t.id), timeout);
  }

  dismiss(id: number) {
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }
}
