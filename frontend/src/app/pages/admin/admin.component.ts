import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="admin-page">
      <div class="container">
        <header class="admin-header">
          <div>
            <h1 class="page-title">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Admin Panel
            </h1>
            <p class="page-subtitle">Review and manage pending blog submissions</p>
          </div>
          <div class="pending-badge" *ngIf="pendingBlogs.length > 0">
            {{ totalPending }} Pending
          </div>
        </header>

        @if (loading) {
          <app-loading-spinner mode="fullpage" message="Loading pending posts..." />
        } @else if (pendingBlogs.length === 0) {
          <div class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h3>All caught up!</h3>
            <p>No pending posts to review right now.</p>
          </div>
        } @else {
          <div class="posts-list">
            @for (blog of pendingBlogs; track blog.id) {
              <div class="post-card" [class.actioning]="actioningId === blog.id" [class.expanded]="expandedId === blog.id">
                <div class="post-summary" (click)="toggleExpand(blog.id)">
                  <div class="post-info">
                    <div class="post-header">
                      <h3 class="post-title">{{ blog.title }}</h3>
                      <span class="status-badge pending">PENDING</span>
                    </div>
                    <div class="post-meta">
                      <span class="author">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {{ blog.authorName }}
                      </span>
                      <span class="date">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ blog.createdAt | date:'medium' }}
                      </span>
                    </div>
                    @if (expandedId !== blog.id) {
                      <p class="post-snippet">{{ getSnippet(blog.description) }}</p>
                    }
                    @if (blog.tags?.length) {
                      <div class="post-tags">
                        @for (tag of blog.tags; track tag) {
                          <span class="tag">{{ tag }}</span>
                        }
                      </div>
                    }
                  </div>
                  <div class="expand-hint">
                    <svg [class.rotated]="expandedId === blog.id" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                @if (expandedId === blog.id) {
                  <div class="post-full-content">
                    @if (blog.coverImageUrl) {
                      <img [src]="blog.coverImageUrl" class="full-cover" alt="Cover image" />
                    }
                    <div class="full-body" [innerHTML]="blog.description"></div>
                  </div>
                }

                <div class="post-actions-bar">
                  <button class="btn-review" (click)="toggleExpand(blog.id); $event.stopPropagation()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ expandedId === blog.id ? 'Collapse' : 'Review Full Post' }}
                  </button>
                  <div class="action-btns">
                    <button class="btn-approve" (click)="approve(blog.id); $event.stopPropagation()" [disabled]="actioningId === blog.id">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve
                    </button>
                    <button class="btn-reject" (click)="reject(blog.id); $event.stopPropagation()" [disabled]="actioningId === blog.id">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (!lastPage) {
            <div class="load-more">
              <button class="btn-outline" (click)="loadMore()" [disabled]="loadingMore">
                {{ loadingMore ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 40px 0;
      min-height: 70vh;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }

    .page-title {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .page-subtitle {
      color: var(--jj-text-muted);
      font-size: 1rem;
    }

    .pending-badge {
      background: rgba(243, 156, 18, 0.15);
      color: var(--jj-accent);
      border: 1px solid rgba(243, 156, 18, 0.3);
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--jj-text-muted);

      svg { opacity: 0.4; margin-bottom: 16px; }
      h3 { margin-bottom: 8px; color: var(--jj-text-bright); }
    }

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .post-card {
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 12px;
      backdrop-filter: blur(6px);
      transition: opacity 0.3s, border-color 0.3s;
      overflow: hidden;

      &.actioning {
        opacity: 0.5;
        pointer-events: none;
      }

      &.expanded {
        border-color: var(--jj-primary);
      }
    }

    .post-summary {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover { background: rgba(255,255,255,0.02); }
    }

    .post-info {
      flex: 1;
      min-width: 0;
    }

    .expand-hint {
      flex-shrink: 0;
      padding-top: 4px;
      color: var(--jj-text-muted);
      transition: color 0.2s;

      svg {
        transition: transform 0.3s ease;
        &.rotated { transform: rotate(180deg); }
      }
    }

    .post-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .post-title {
      font-family: 'Cinzel', serif;
      font-size: 1.15rem;
      margin: 0;
      color: var(--jj-text-bright);
    }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: 10px;
      text-transform: uppercase;

      &.pending {
        background: rgba(243, 156, 18, 0.15);
        color: var(--jj-accent);
      }
    }

    .post-meta {
      display: flex;
      gap: 18px;
      font-size: 0.85rem;
      color: var(--jj-text-muted);
      margin-bottom: 10px;

      span {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }

    .post-snippet {
      font-size: 0.9rem;
      color: var(--jj-text-muted);
      line-height: 1.5;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .post-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;

      .tag {
        font-size: 0.75rem;
        padding: 2px 10px;
        border-radius: 12px;
        background: rgba(106, 13, 173, 0.15);
        color: var(--jj-primary-light);
      }
    }

    /* Full content preview */
    .post-full-content {
      padding: 0 24px;
      border-top: 1px solid var(--jj-border);
      animation: slideDown 0.3s ease;

      .full-cover {
        max-width: 100%;
        width: auto;
        height: auto;
        border-radius: 10px;
        margin: 20px auto;
        display: block;
        object-fit: contain;
      }

      .full-body {
        font-family: 'Lora', serif;
        font-size: 1.05rem;
        line-height: 1.9;
        color: var(--jj-text);
        padding-bottom: 10px;
        overflow-wrap: break-word;
        word-break: break-word;
        max-width: 100%;
        overflow: hidden;
      }
    }

    ::ng-deep .full-body img {
      max-width: 100% !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      object-fit: contain;
      border-radius: 8px;
      margin: 16px auto;
    }

    ::ng-deep .full-body h2, ::ng-deep .full-body h3 {
      font-family: 'Cinzel', serif;
      color: var(--jj-text-bright);
      margin: 28px 0 14px;
    }

    ::ng-deep .full-body blockquote {
      border-left: 3px solid var(--jj-primary);
      padding: 10px 20px;
      margin: 20px 0;
      background: rgba(106, 13, 173, 0.05);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: var(--jj-text-muted);
    }

    ::ng-deep .full-body ul, ::ng-deep .full-body ol {
      padding-left: 24px;
      margin: 12px 0;
    }

    ::ng-deep .full-body a {
      color: var(--jj-primary-light);
      text-decoration: underline;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 5000px; }
    }

    /* Bottom actions bar */
    .post-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      border-top: 1px solid var(--jj-border);
      gap: 12px;
    }

    .action-btns {
      display: flex;
      gap: 8px;
    }

    .btn-review {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--jj-border);
      background: rgba(255,255,255,0.03);
      color: var(--jj-text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--jj-primary);
        color: var(--jj-primary-light);
        background: rgba(106, 13, 173, 0.08);
      }
    }

    .btn-approve, .btn-reject {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-approve {
      background: rgba(39, 174, 96, 0.1);
      border-color: rgba(39, 174, 96, 0.3);
      color: var(--jj-success);

      &:hover:not(:disabled) {
        background: rgba(39, 174, 96, 0.2);
        border-color: var(--jj-success);
      }
    }

    .btn-reject {
      background: rgba(231, 76, 60, 0.1);
      border-color: rgba(231, 76, 60, 0.3);
      color: var(--jj-danger);

      &:hover:not(:disabled) {
        background: rgba(231, 76, 60, 0.2);
        border-color: var(--jj-danger);
      }
    }

    .load-more {
      text-align: center;
      margin-top: 30px;
    }

    @media (max-width: 768px) {
      .admin-page { padding: 24px 0; }
      .admin-header { flex-direction: column; gap: 12px; margin-bottom: 24px; }
      .page-title { font-size: 1.5rem; }
      .post-summary { padding: 18px; }
      .post-meta { flex-wrap: wrap; gap: 10px; }
      .post-actions-bar { flex-direction: column; padding: 14px 18px; }
      .action-btns { width: 100%; }
      .btn-review { width: 100%; justify-content: center; }
      .btn-approve, .btn-reject { flex: 1; justify-content: center; }
      .post-full-content { padding: 0 18px; }
    }

    @media (max-width: 480px) {
      .admin-page { padding: 16px 0; }
      .page-title { font-size: 1.3rem; gap: 8px; }
      .page-title svg { width: 22px; height: 22px; }
      .page-subtitle { font-size: 0.85rem; }
      .post-card { border-radius: 10px; }
      .post-summary { padding: 14px; }
      .post-title { font-size: 1rem; }
      .post-meta { font-size: 0.8rem; gap: 8px; }
      .post-snippet { font-size: 0.85rem; }
      .post-actions-bar { padding: 12px 14px; }
      .action-btns { flex-direction: column; }
      .btn-approve, .btn-reject { width: 100%; justify-content: center; padding: 10px 14px; }
      .btn-review { font-size: 0.8rem; padding: 8px 12px; }
      .pending-badge { padding: 6px 14px; font-size: 0.8rem; }
      .empty-state, .loading-state { padding: 50px 16px; }
      .post-full-content { padding: 0 14px; }
      .post-full-content .full-body { font-size: 0.95rem; line-height: 1.75; }
    }

    @media (max-width: 360px) {
      .page-title { font-size: 1.15rem; }
      .post-title { font-size: 0.95rem; }
    }
  `]
})
export class AdminComponent implements OnInit {
  pendingBlogs: Blog[] = [];
  loading = true;
  loadingMore = false;
  currentPage = 0;
  lastPage = false;
  totalPending = 0;
  actioningId: number | null = null;
  expandedId: number | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  loadPending(): void {
    this.blogService.getPendingBlogs(this.currentPage).subscribe({
      next: (page) => {
        this.pendingBlogs = [...this.pendingBlogs, ...page.content];
        this.lastPage = page.last;
        this.totalPending = page.totalElements;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore(): void {
    this.loadingMore = true;
    this.currentPage++;
    this.loadPending();
  }

  approve(id: number): void {
    this.actioningId = id;
    this.blogService.approveBlog(id).subscribe({
      next: () => this.removePost(id),
      error: () => this.actioningId = null
    });
  }

  reject(id: number): void {
    this.actioningId = id;
    this.blogService.rejectBlog(id).subscribe({
      next: () => this.removePost(id),
      error: () => this.actioningId = null
    });
  }

  private removePost(id: number): void {
    this.pendingBlogs = this.pendingBlogs.filter(b => b.id !== id);
    this.totalPending = Math.max(0, this.totalPending - 1);
    this.actioningId = null;
  }

  getSnippet(html: string): string {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }
}
