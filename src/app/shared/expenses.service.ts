import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineService, OutboxItem } from './offline.service';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Expense {
  id?: number;
  category: string;
  amount: number;
  currency?: string;
  amountUsd?: number;
  date: string;
  receipt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private base = 'http://localhost:3001/expenses';

  // Fallback dummy data
  private dummyExpenses: Expense[] = [
    {
      id: 1,
      category: 'groceries',
      amount: 120,
      currency: 'USD',
      amountUsd: 120,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 2,
      category: 'gas',
      amount: 50,
      currency: 'USD',
      amountUsd: 50,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 3,
      category: 'entertainment',
      amount: 45,
      currency: 'USD',
      amountUsd: 45,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 4,
      category: 'shopping',
      amount: 200,
      currency: 'USD',
      amountUsd: 200,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 5,
      category: 'transport',
      amount: 35,
      currency: 'USD',
      amountUsd: 35,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 6,
      category: 'food',
      amount: 85,
      currency: 'USD',
      amountUsd: 85,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
    {
      id: 7,
      category: 'rent',
      amount: 1200,
      currency: 'USD',
      amountUsd: 1200,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      receipt: null,
    },
  ];

  constructor(private http: HttpClient, private offline: OfflineService) {}

  list(): Observable<Expense[]> {
    // Deprecated: use paginatedList for infinite scroll
    return this.paginatedList(1, 10);
  }

  paginatedList(page: number, limit: number): Observable<Expense[]> {
    const cached = this.getCachedList();
    const dataSource = cached.length > 0 ? cached : this.dummyExpenses;

    if (!this.offline.isOnline()) {
      return of(dataSource.slice((page - 1) * limit, page * limit));
    }

    const params = {
      _page: page.toString(),
      _limit: limit.toString(),
      _sort: 'date',
      _order: 'desc',
    };

    return this.http.get<Expense[]>(this.base, { params }).pipe(
      tap((v) => {
        // Cache all pages
        if (page === 1) {
          this.cacheList(v);
        }
      }),
      catchError((_) => {
        // Return cached or dummy data on error
        return of(dataSource.slice((page - 1) * limit, page * limit));
      })
    );
  }

  getCachedList(): Expense[] {
    try {
      const raw = localStorage.getItem('cache:expenses');
      if (!raw) return [];
      return JSON.parse(raw) as Expense[];
    } catch (e) {
      return [];
    }
  }

  cacheList(list: Expense[]) {
    try {
      localStorage.setItem('cache:expenses', JSON.stringify(list));
    } catch (e) {
      // noop
    }
  }

  async add(expense: Expense) {
    const current = this.getCachedList();

    // helper to enqueue and return a local copy
    const enqueueAndReturnLocal = (exp: Expense) => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const bodyWithLocal = { ...exp, _localId: localId } as any;
      const item: OutboxItem = {
        url: this.base,
        method: 'POST',
        body: bodyWithLocal,
        createdAt: Date.now(),
      };
      this.offline.push(item);
      const toSave = { ...exp, id: localId } as any;
      this.cacheList([toSave, ...current]);
      return Promise.resolve(toSave as Expense);
    };

    // if offline, enqueue
    if (!this.offline.isOnline()) {
      return enqueueAndReturnLocal(expense);
    }

    // try posting; on failure enqueue and return local copy
    try {
      const res = await firstValueFrom(this.http.post<Expense>(this.base, expense));
      // refresh cache
      const currentAfter = this.getCachedList();
      this.cacheList([res, ...currentAfter]);
      return res;
    } catch (err) {
      console.warn('POST failed, enqueuing for later sync', err);
      return enqueueAndReturnLocal(expense);
    }
  }

  /** Attempt to sync queued outbox operations when online */
  async syncOutbox() {
    const items = this.offline.getOutbox();
    for (const it of items) {
      try {
        if (it.method === 'POST') {
          const res: any = await firstValueFrom(this.http.post(it.url, it.body));
          // if the outbox body included a _localId, reconcile the cached item
          const localId = it.body && it.body._localId;
          if (localId && res && res.id) {
            try {
              const cached = this.getCachedList();
              const updated = cached.map((c) => (c.id === localId ? res : c));
              this.cacheList(updated);
            } catch (e) {
              // noop
            }
          }
        }
        this.offline.removeItem(it.id!);
      } catch (e) {
        // stop on first failure to avoid tight loop
        console.warn('Failed to sync outbox item', it, e);
        break;
      }
    }
  }

  /**
   * Fetch latest exchange rates (base USD) and return array of currency codes
   */
  getRates(): Observable<any> {
    const key = 'cache:rates';
    if (!this.offline.isOnline()) {
      try {
        const raw = localStorage.getItem(key);
        return of(raw ? JSON.parse(raw) : null);
      } catch (e) {
        return of(null);
      }
    }
    return this.http.get<any>('https://open.er-api.com/v6/latest/USD').pipe(
      tap((r) => {
        try {
          localStorage.setItem(key, JSON.stringify(r));
        } catch (e) {
          // noop
        }
      }),
      catchError((_) => {
        try {
          const raw = localStorage.getItem(key);
          return of(raw ? JSON.parse(raw) : null);
        } catch (e) {
          return of(null);
        }
      })
    );
  }
}
