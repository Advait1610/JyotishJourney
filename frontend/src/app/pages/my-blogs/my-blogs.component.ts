import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-my-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule, BlogCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="my-blogs-page">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">My Blogs</h1>
          <p class="page-subtitle">All your published, pending, and rejected posts in one place</p>
        </div>

        <!-- Status Filter -->
        <div class="filter-bar">
          <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">
            All <span class="count">({{ blogs.length }})</span>
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'APPROVED'" (click)="setFilter('APPROVED')">
            <span class="status-dot approved"></span> Published <span class="count">({{ countByStatus('APPROVED') }})</span>
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'PENDING'" (click)="setFilter('PENDING')">
            <span class="status-dot pending"></span> Pending <span class="count">({{ countByStatus('PENDING') }})</span>
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
            <span class="status-dot rejected"></span> Rejected <span class="count">({{ countByStatus('REJECTED') }})</span>
          </button>
        </div>

        @if (error) {
          <div class="error-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <h3>Failed to load your blogs</h3>
            <p>{{ error }}</p>
            <button class="btn-outline" (click)="retry()">Try Again</button>
          </div>
        } @else if (loading && currentPage === 0) {
          <app-loading-spinner mode="fullpage" message="Loading your blogs..." />
        } @else if (filteredBlogs.length === 0) {
          <div class="empty-state">
            @if (blogs.length === 0) {
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              <h3>You haven't written any blogs yet</h3>
              <p>Start sharing your knowledge with the community.</p>
              <a routerLink="/create-blog" class="btn-primary">Create Your First Blog</a>
            } @else {
              <h3>No {{ activeFilter.toLowerCase() }} blogs</h3>
              <p>You don't have any blogs with this status.</p>
            }
          </div>
        } @else {
          <div class="blog-grid">
            @for (blog of filteredBlogs; track blog.id) {
              <div class="blog-card-wrapper">
                <div class="status-badge" [class]="blog.status.toLowerCase()">
                  {{ blog.status === 'APPROVED' ? 'Published' : blog.status === 'PENDING' ? 'Pending Review' : 'Rejected' }}
                </div>
                <app-blog-card [blog]="blog" />
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
    :host { display: block; }

    .my-blogs-page {
      padding: 40px 0 80px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: var(--jj-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      color: var(--jj-text-muted);
      font-family: 'Lora', serif;
      font-size: 1.1rem;
    }

    .filter-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 32px;
      padding: 16px 20px;
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 14px;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 25px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      color: var(--jj-text-muted);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--jj-primary-light);
        color: var(--jj-text);
      }

      &.active {
        background: var(--jj-primary);
        border-color: var(--jj-primary);
        color: white;
      }

      .count {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.approved { background: #27ae60; }
      &.pending { background: #f39c12; }
      &.rejected { background: #e74c3c; }
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      align-items: stretch;
    }

    .blog-card-wrapper {
      position: relative;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      backdrop-filter: blur(8px);

      &.approved {
        background: rgba(39, 174, 96, 0.2);
        color: #27ae60;
        border: 1px solid rgba(39, 174, 96, 0.3);
      }
      &.pending {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        border: 1px solid rgba(243, 156, 18, 0.3);
      }
      &.rejected {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
      }
    }

    .load-more {
      text-align: center;
      margin-top: 40px;
    }

    .empty-state, .error-state {
      text-align: center;
      padding: 80px 20px;

      svg {
        display: block;
        margin: 0 auto 16px;
        color: var(--jj-text-muted);
        opacity: 0.4;
      }

      h3 {
        color: var(--jj-text-muted);
        margin-bottom: 8px;
        font-size: 1.3rem;
      }

      p {
        color: var(--jj-text-muted);
        opacity: 0.7;
        margin-bottom: 20px;
      }
    }

    .error-state {
      h3 { color: var(--jj-danger, #e74c3c); }
      p { font-size: 0.9rem; }
      svg { opacity: 0.7; color: var(--jj-danger, #e74c3c); }
    }

    @media (max-width: 768px) {
      .my-blogs-page { padding: 24px 0 60px; }
      .page-title { font-size: 1.8rem; }
      .page-subtitle { font-size: 0.95rem; }
      .filter-bar { padding: 12px 14px; gap: 6px; margin-bottom: 24px; }
      .filter-btn { padding: 6px 14px; font-size: 0.85rem; }
      .blog-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    }

    @media (max-width: 576px) {
      .my-blogs-page { padding: 16px 0 40px; }
      .page-title { font-size: 1.5rem; }
      .filter-bar { flex-direction: column; }
      .filter-btn { justify-content: center; }
      .blog-grid { grid-template-columns: 1fr; }
      .empty-state { padding: 50px 16px; }
    }
  `]
})
export class MyBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  loading = true;
  loadingMore = false;
  currentPage = 0;
  lastPage = false;
  activeFilter = 'all';
  error = '';

  constructor(
    private blogService: BlogService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  countByStatus(status: string): number {
    return this.blogs.filter(b => b.status === status).length;
  }

  retry(): void {
    this.error = '';
    this.loading = true;
    this.blogs = [];
    this.filteredBlogs = [];
    this.currentPage = 0;
    this.loadBlogs();
  }

  loadMore(): void {
    this.loadingMore = true;
    this.currentPage++;
    this.loadBlogs();
  }

  private loadBlogs(): void {
    this.blogService.getMyBlogs(this.currentPage).subscribe({
      next: (page) => {
        this.blogs = this.currentPage === 0 ? page.content : [...this.blogs, ...page.content];
        this.lastPage = page.last;
        this.loading = false;
        this.loadingMore = false;
        this.applyFilter();
      },
      error: (err) => {
        this.loading = false;
        this.loadingMore = false;
        this.error = err.error?.error || err.message || 'Something went wrong. Please try again.';
      }
    });
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredBlogs = this.blogs;
    } else {
      this.filteredBlogs = this.blogs.filter(b => b.status === this.activeFilter);
    }
  }
}
