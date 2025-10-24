import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineService } from './offline.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Category {
  id: string;
  label: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = 'http://localhost:3001/categories';

  // Fallback dummy data
  private dummyCategories: Category[] = [
    { id: 'groceries', label: 'Groceries', icon: 'fas fa-shopping-cart' },
    { id: 'entertainment', label: 'Entertainment', icon: 'fas fa-film' },
    { id: 'gas', label: 'Gas', icon: 'fas fa-gas-pump' },
    { id: 'shopping', label: 'Shopping', icon: 'fas fa-shopping-bag' },
    { id: 'transport', label: 'Transport', icon: 'fas fa-car' },
    { id: 'rent', label: 'Rent', icon: 'fas fa-home' },
    { id: 'food', label: 'Food', icon: 'fas fa-utensils' },
    { id: 'healthcare', label: 'Healthcare', icon: 'fas fa-heart' },
  ];

  constructor(private http: HttpClient, private offline: OfflineService) {}

  list(): Observable<Category[]> {
    if (!this.offline.isOnline()) {
      const cached = this.getCached();
      return of(cached.length > 0 ? cached : this.dummyCategories);
    }

    return this.http.get<Category[]>(this.base).pipe(
      tap((v) => this.cache(v)),
      catchError((_) => {
        const cached = this.getCached();
        return of(cached.length > 0 ? cached : this.dummyCategories);
      })
    );
  }

  getCached(): Category[] {
    try {
      const raw = localStorage.getItem('cache:categories');
      if (!raw) return [];
      return JSON.parse(raw) as Category[];
    } catch (e) {
      return [];
    }
  }

  cache(list: Category[]) {
    try {
      localStorage.setItem('cache:categories', JSON.stringify(list));
    } catch (e) {
      // noop
    }
  }
}
