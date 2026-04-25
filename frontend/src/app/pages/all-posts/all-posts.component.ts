import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BlogCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="posts-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">All Posts</h1>
          <p class="page-subtitle">Explore the celestial wisdom shared by our community</p>
        </div>

        <!-- Search & Filters Bar -->
        <div class="controls-bar">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by title or author..."
            />
            @if (searchQuery) {
              <button class="clear-btn" (click)="clearSearch()">&#10005;</button>
            }
          </div>

          <div class="filter-group">
            <label class="filter-label">Sort by</label>
            <div class="sort-options">
              @for (option of sortOptions; track option.value) {
                <button
                  class="sort-btn"
                  [class.active]="currentSort === option.value"
                  (click)="onSortChange(option.value)">
                  {{ option.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Trending Section -->
        @if (!searchQuery && trendingBlogs.length > 0) {
          <section class="trending-section">
            <h2 class="section-heading">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              Trending This Week
            </h2>
            <div class="trending-grid">
              @for (blog of trendingBlogs; track blog.id) {
                <app-blog-card [blog]="blog" />
              }
            </div>
          </section>
        }

        <!-- Divider -->
        @if (!searchQuery && trendingBlogs.length > 0) {
          <div class="section-divider"></div>
        }

        <!-- Results Header -->
        <div class="results-header">
          <h2 class="section-heading">
            @if (searchQuery) {
              Results for "{{ searchQuery }}"
              <span class="result-count">({{ totalElements }} found)</span>
            } @else {
              All Posts
            }
          </h2>
        </div>

        <!-- Blog Grid -->
        @if (loading && currentPage === 0) {
          <app-loading-spinner mode="fullpage" message="Fetching posts..." />
        } @else if (blogs.length === 0) {
          <div class="empty-state">
            @if (searchQuery) {
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3>No results found</h3>
              <p>Try a different search term or clear the search.</p>
              <button class="btn-outline" (click)="clearSearch()">Clear Search</button>
            } @else {
              <svg class="empty-star" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <h3>No posts yet</h3>
              <p>The stars are waiting for the first story to be told.</p>
            }
          </div>
        } @else {
          <div class="blog-grid">
            @for (blog of blogs; track blog.id) {
              <app-blog-card [blog]="blog" />
            }
          </div>

          @if (!lastPage) {
            <div class="load-more">
              <button class="btn-outline" (click)="loadMore()" [disabled]="loadingMore">
                {{ loadingMore ? 'Loading...' : 'Load More Posts' }}
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .posts-page {
      padding: 40px 0 80px;
      position: relative;
      z-index: 1;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
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

    /* Controls Bar */
    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;
      margin-bottom: 40px;
      padding: 24px;
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 16px;
    }

    .search-box {
      flex: 1;
      min-width: 260px;
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 14px;
        color: var(--jj-text-muted);
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 12px 40px 12px 42px;
        background: var(--jj-bg-surface);
        border: 1px solid var(--jj-border);
        border-radius: 30px;
        color: var(--jj-text);
        font-size: 1rem;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: var(--jj-primary-light);
          box-shadow: 0 0 15px rgba(106, 13, 173, 0.15);
        }

        &::placeholder { color: var(--jj-text-muted); }
      }

      .clear-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: var(--jj-text-muted);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 4px 8px;
        border-radius: 50%;
        transition: all 0.2s;

        &:hover { color: var(--jj-text-bright); background: var(--jj-bg-surface); }
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-label {
      font-size: 0.8rem;
      color: var(--jj-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .sort-options {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .sort-btn {
      padding: 8px 16px;
      border-radius: 25px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      color: var(--jj-text-muted);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;

      &:hover {
        border-color: var(--jj-primary-light);
        color: var(--jj-text);
      }

      &.active {
        background: var(--jj-primary);
        border-color: var(--jj-primary);
        color: white;
      }
    }

    /* Trending Section */
    .trending-section { margin-bottom: 20px; }

    .section-heading {
      font-size: 1.5rem;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;

      svg { color: var(--jj-accent); }

      .result-count {
        font-size: 0.9rem;
        color: var(--jj-text-muted);
        font-weight: 400;
        font-family: 'Inter', sans-serif;
      }
    }

    .trending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      align-items: stretch;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--jj-border), transparent);
      margin: 40px 0;
    }

    /* Results */
    .results-header { margin-bottom: 24px; }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      align-items: stretch;
    }

    .load-more {
      text-align: center;
      margin-top: 40px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;

      .empty-icon, .empty-star {
        display: block;
        margin: 0 auto 16px;
        color: var(--jj-text-muted);
        opacity: 0.4;
      }

      .empty-star { font-size: 3rem; }

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

    @media (max-width: 992px) {
      .blog-grid, .trending-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
      .controls-bar { padding: 20px; }
    }

    @media (max-width: 768px) {
      .posts-page { padding: 24px 0 60px; }
      .page-title { font-size: 1.8rem; }
      .page-subtitle { font-size: 0.95rem; }
      .page-header { margin-bottom: 24px; }
      .controls-bar { flex-direction: column; padding: 16px; gap: 14px; margin-bottom: 24px; }
      .search-box { min-width: 100%; }
      .blog-grid, .trending-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
      .section-heading { font-size: 1.2rem; margin-bottom: 16px; }
      .section-divider { margin: 24px 0; }
    }

    @media (max-width: 576px) {
      .posts-page { padding: 16px 0 40px; }
      .page-title { font-size: 1.5rem; }
      .page-subtitle { font-size: 0.85rem; }
      .controls-bar { padding: 14px; border-radius: 12px; }
      .search-box input { padding: 10px 36px 10px 38px; font-size: 0.9rem; }
      .sort-btn { padding: 6px 12px; font-size: 0.8rem; }
      .blog-grid, .trending-grid { grid-template-columns: 1fr; }
      .empty-state { padding: 50px 16px; }
      .load-more { margin-top: 24px; }
    }

    @media (max-width: 360px) {
      .page-title { font-size: 1.3rem; }
      .sort-options { gap: 4px; }
      .sort-btn { padding: 5px 10px; font-size: 0.75rem; }
    }
  `]
})
export class AllPostsComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  trendingBlogs: Blog[] = [];
  loading = true;
  loadingMore = false;
  currentPage = 0;
  lastPage = false;
  totalElements = 0;

  searchQuery = '';
  currentSort = 'newest';

  sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'A - Z', value: 'alpha-asc' },
    { label: 'Z - A', value: 'alpha-desc' },
    { label: 'Most Liked', value: 'likes' },
  ];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getHotBlogs().subscribe({
      next: (blogs) => this.trendingBlogs = blogs,
      error: () => {}
    });

    this.loadBlogs();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.resetAndLoad();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.resetAndLoad();
  }

  onSortChange(sort: string): void {
    if (this.currentSort === sort) return;
    this.currentSort = sort;
    this.resetAndLoad();
  }

  loadMore(): void {
    this.loadingMore = true;
    this.currentPage++;
    this.loadBlogs();
  }

  private resetAndLoad(): void {
    this.blogs = [];
    this.currentPage = 0;
    this.lastPage = false;
    this.loading = true;
    this.loadBlogs();
  }

  private loadBlogs(): void {
    const { sortBy, order } = this.getSortParams();

    this.blogService.getBlogs(
      this.currentPage, 12, sortBy, order,
      this.searchQuery || undefined
    ).subscribe({
      next: (page) => {
        this.blogs = this.currentPage === 0 ? page.content : [...this.blogs, ...page.content];
        this.lastPage = page.last;
        this.totalElements = page.totalElements;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  private getSortParams(): { sortBy: string; order: string } {
    switch (this.currentSort) {
      case 'oldest':    return { sortBy: 'createdAt', order: 'asc' };
      case 'alpha-asc': return { sortBy: 'title', order: 'asc' };
      case 'alpha-desc': return { sortBy: 'title', order: 'desc' };
      case 'likes':     return { sortBy: 'likeCount', order: 'desc' };
      default:          return { sortBy: 'createdAt', order: 'desc' };
    }
  }
}
