import { Injectable } from '@angular/core';

export interface OutboxItem {
  id?: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body?: any;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private key = 'offline:outbox';

  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  push(item: OutboxItem) {
    const list = this.getOutbox();
    list.push({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
    localStorage.setItem(this.key, JSON.stringify(list));
  }

  getOutbox(): OutboxItem[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      return JSON.parse(raw) as OutboxItem[];
    } catch (e) {
      return [];
    }
  }

  clearOutbox() {
    localStorage.removeItem(this.key);
  }

  removeItem(id: string) {
    const list = this.getOutbox().filter((i) => i.id !== id);
    localStorage.setItem(this.key, JSON.stringify(list));
  }
}
