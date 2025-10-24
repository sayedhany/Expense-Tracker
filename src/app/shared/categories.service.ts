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

  constructor(private http: HttpClient, private offline: OfflineService) {}

  list(): Observable<Category[]> {
    if (!this.offline.isOnline()) return of(this.getCached());

    return this.http.get<Category[]>(this.base).pipe(
      tap((v) => this.cache(v)),
      catchError((_) => of(this.getCached()))
    );
  }

  getCached() {
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
