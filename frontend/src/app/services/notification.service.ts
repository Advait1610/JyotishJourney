import { Injectable, signal, inject, DestroyRef, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification, PageResponse } from '../models/blog.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = `${environment.apiUrl}/blogs/notifications`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private _unreadCount = signal(0);
  private _notifications = signal<AppNotification[]>([]);
  private _currentPage = 0;
  private _lastPage = false;
  private pollTimer: any = null;

  readonly unreadCount = computed(() => this._unreadCount());
  readonly notifications = computed(() => this._notifications());

  startPolling(): void {
    this.stopPolling();
    this.refreshUnreadCount();
    this.pollTimer = setInterval(() => {
      if (this.auth.isLoggedIn()) {
        this.refreshUnreadCount();
      }
    }, 30000);

    this.destroyRef.onDestroy(() => this.stopPolling());
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  refreshUnreadCount(): void {
    if (!this.auth.isLoggedIn()) {
      this._unreadCount.set(0);
      return;
    }
    this.http.get<{ count: number }>(`${this.API}/unread-count`).subscribe({
      next: (res) => this._unreadCount.set(res.count),
      error: () => {}
    });
  }

  loadNotifications(reset = false): void {
    if (reset) {
      this._currentPage = 0;
      this._lastPage = false;
      this._notifications.set([]);
    }
    if (this._lastPage) return;

    const params = new HttpParams()
      .set('page', String(this._currentPage))
      .set('size', '15');

    this.http.get<PageResponse<AppNotification>>(this.API, { params }).subscribe({
      next: (page) => {
        const current = this._currentPage === 0 ? [] : this._notifications();
        this._notifications.set([...current, ...page.content]);
        this._lastPage = page.last;
        this._currentPage++;
      },
      error: () => {}
    });
  }

  loadMore(): void {
    this.loadNotifications();
  }

  get hasMore(): boolean {
    return !this._lastPage;
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/read`, {});
  }

  markAllRead(): void {
    this.http.put<void>(`${this.API}/read-all`, {}).subscribe({
      next: () => {
        this._unreadCount.set(0);
        this._notifications.update(list =>
          list.map(n => ({ ...n, read: true }))
        );
      },
      error: () => {}
    });
  }

  markOneRead(id: number): void {
    this.markAsRead(id).subscribe({
      next: () => {
        this._notifications.update(list =>
          list.map(n => n.id === id ? { ...n, read: true } : n)
        );
        this._unreadCount.update(c => Math.max(0, c - 1));
      },
      error: () => {}
    });
  }

  reset(): void {
    this._unreadCount.set(0);
    this._notifications.set([]);
    this._currentPage = 0;
    this._lastPage = false;
    this.stopPolling();
  }
}
