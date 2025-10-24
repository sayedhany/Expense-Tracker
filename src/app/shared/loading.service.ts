import { signal, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = signal(false);
  loading = this._loading.asReadonly();

  show() {
    this._loading.set(true);
  }

  hide() {
    this._loading.set(false);
  }

  async simulate<T>(fn: () => Promise<T>, delay = 1200) {
    try {
      this.show();
      const result = await new Promise<T>((resolve) => setTimeout(() => fn().then(resolve), delay));
      return result;
    } finally {
      this.hide();
    }
  }
}
