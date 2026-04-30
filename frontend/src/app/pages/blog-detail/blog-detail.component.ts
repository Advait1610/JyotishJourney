import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog, Comment } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, DatePipe],
  template: `
    @if (loading) {
      <app-loading-spinner mode="fullpage" message="Loading blog..." />
    } @else if (blog) {
      <article class="blog-detail">
        <!-- Cover Image -->
        @if (blog.coverImageUrl?.trim() && !coverImgError) {
          <div class="cover-image" (click)="openLightbox(blog.coverImageUrl)">
            <img [src]="blog.coverImageUrl" [alt]="blog.title" (error)="coverImgError = true" />
            <div class="cover-overlay"></div>
            <span class="click-hint">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              Click to view full image
            </span>
          </div>
        } @else {
          <div class="cover-image default-cover">
            <svg viewBox="0 0 1200 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="dn1" cx="25%" cy="35%"><stop offset="0%" stop-color="rgba(106,13,173,0.5)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
                <radialGradient id="dn2" cx="75%" cy="65%"><stop offset="0%" stop-color="rgba(243,156,18,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
                <radialGradient id="dn3" cx="55%" cy="30%"><stop offset="0%" stop-color="rgba(40,60,150,0.3)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
                <radialGradient id="dsg" cx="50%" cy="50%"><stop offset="0%" stop-color="#ffe680"/><stop offset="40%" stop-color="#f5a623"/><stop offset="100%" stop-color="#e8751a"/></radialGradient>
              </defs>
              <rect width="1200" height="400" fill="#0a0a1a"/>
              <rect width="1200" height="400" fill="url(#dn1)"/>
              <rect width="1200" height="400" fill="url(#dn2)"/>
              <rect width="1200" height="400" fill="url(#dn3)"/>
              <circle cx="120" cy="50" r="1" fill="rgba(255,255,255,0.6)"/>
              <circle cx="250" cy="100" r="1.5" fill="rgba(255,255,255,0.4)"/>
              <circle cx="400" cy="30" r="0.8" fill="rgba(255,255,255,0.7)"/>
              <circle cx="550" cy="80" r="1.2" fill="rgba(255,255,255,0.5)"/>
              <circle cx="700" cy="40" r="0.9" fill="rgba(255,255,255,0.6)"/>
              <circle cx="850" cy="90" r="1.4" fill="rgba(255,255,255,0.3)"/>
              <circle cx="950" cy="55" r="1" fill="rgba(255,255,255,0.5)"/>
              <circle cx="1100" cy="70" r="0.7" fill="rgba(255,255,255,0.6)"/>
              <circle cx="180" cy="280" r="1.1" fill="rgba(255,255,255,0.4)"/>
              <circle cx="480" cy="320" r="0.8" fill="rgba(255,255,255,0.5)"/>
              <circle cx="780" cy="300" r="1.3" fill="rgba(255,255,255,0.3)"/>
              <circle cx="1050" cy="340" r="0.9" fill="rgba(255,255,255,0.5)"/>
              <circle cx="600" cy="200" r="22" fill="url(#dsg)" opacity="0.9"/>
              <ellipse cx="600" cy="200" rx="80" ry="28" fill="none" stroke="rgba(155,89,182,0.15)" stroke-width="0.8"/>
              <ellipse cx="600" cy="200" rx="140" ry="50" fill="none" stroke="rgba(155,89,182,0.1)" stroke-width="0.6"/>
              <ellipse cx="600" cy="200" rx="210" ry="75" fill="none" stroke="rgba(155,89,182,0.07)" stroke-width="0.5"/>
              <circle cx="665" cy="180" r="6" fill="#4fa3d1" opacity="0.8"/>
              <circle cx="510" cy="225" r="4.5" fill="#c1440e" opacity="0.7"/>
              <circle cx="740" cy="210" r="9" fill="#d4c07a" opacity="0.6"/>
              <circle cx="430" cy="195" r="3" fill="#72b5c4" opacity="0.7"/>
            </svg>
            <div class="cover-overlay"></div>
          </div>
        }

        @if (lightboxOpen && lightboxSrc) {
          <div class="lightbox" (click)="lightboxOpen = false">
            <button class="lightbox-close" (click)="lightboxOpen = false">&times;</button>
            <img [src]="lightboxSrc" [alt]="blog?.title || 'Image'" (click)="$event.stopPropagation()" />
            <span class="lightbox-hint">Click anywhere or &times; to close</span>
          </div>
        }

        <div class="blog-container">
          <!-- Header -->
          <header class="blog-header">
            <div class="blog-tags">
              @for (tag of blog.tags; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
            <h1 class="blog-title">{{ blog.title }}</h1>
            <div class="blog-meta">
              <div class="author-info">
                <span class="author-avatar">{{ blog.authorName?.charAt(0) || 'A' }}</span>
                <div>
                  <span class="author-name">{{ blog.authorName }}</span>
                  <span class="blog-date">{{ blog.createdAt | date:'MMMM d, yyyy' }}</span>
                </div>
              </div>

              @if (isOwner() || auth.isAdmin()) {
                <div class="blog-actions">
                  @if (isOwner()) {
                    <button class="btn-icon" [routerLink]="['/edit-blog', blog.id]" title="Edit">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  }
                  <button class="btn-icon danger" (click)="onDelete()" title="Delete">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              }
            </div>
          </header>

          <!-- Content -->
          <div class="blog-content" [innerHTML]="formattedContent" (click)="onContentClick($event)"></div>

          <!-- Like & Stats -->
          <div class="blog-engagement">
            <button class="like-btn" [class.liked]="blog.likedByCurrentUser" (click)="onLike()">
              <svg class="heart-icon" [class.pulse]="justLiked" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span>{{ blog.likeCount }} {{ blog.likeCount === 1 ? 'Like' : 'Likes' }}</span>
            </button>
            <span class="comment-count"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {{ comments.length }} Comments</span>
          </div>

          <!-- Comments Section -->
          <section class="comments-section">
            <h3>Comments</h3>

            @if (auth.isLoggedIn()) {
              <div class="comment-form">
                <textarea [(ngModel)]="newComment" placeholder="Share your thoughts..." rows="3"></textarea>
                <button class="btn-primary" (click)="onAddComment()" [disabled]="!newComment.trim()">
                  Post Comment
                </button>
              </div>
            } @else {
              <p class="login-prompt">
                <a routerLink="/login">Sign in</a> to leave a comment.
              </p>
            }

            <div class="comments-list">
              @for (comment of comments; track comment.id) {
                <div class="comment-item">
                  <div class="comment-header">
                    <span class="comment-avatar">{{ comment.userName?.charAt(0) || 'U' }}</span>
                    <div class="comment-meta">
                      <strong>{{ comment.userName }}</strong>
                      <span class="comment-date">{{ comment.createdAt | date:'medium' }}</span>
                    </div>
                    @if (comment.userId === auth.user()?.userId) {
                      <button class="btn-delete-comment" (click)="onDeleteComment(comment.id)">&#10005;</button>
                    }
                  </div>
                  <p class="comment-body">{{ comment.content }}</p>
                </div>
              }

              @if (comments.length === 0) {
                <p class="no-comments">No comments yet. Be the first to share your thoughts!</p>
              }
            </div>
          </section>
        </div>
      </article>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }

    ::ng-deep .blog-content img {
      max-width: 100% !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      object-fit: contain;
      border-radius: 12px;
      margin: 24px auto;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover { opacity: 0.85; }
    }

    .blog-detail {
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .cover-image {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      &:hover img { transform: scale(1.02); }

      &.default-cover {
        cursor: default;
        svg { display: block; width: 100%; height: 100%; }
      }

      .cover-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(transparent, var(--jj-bg-dark));
        pointer-events: none;
      }

      .click-hint {
        position: absolute;
        bottom: 12px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.75rem;
        color: rgba(255,255,255,0.6);
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
        padding: 4px 10px;
        border-radius: 6px;
        pointer-events: none;
        z-index: 2;
      }
    }

    .lightbox {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(8px);
      cursor: zoom-out;
      animation: fadeIn 0.2s ease;
      padding: 20px;

      img {
        max-width: 95%;
        max-height: 95vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 40px rgba(0,0,0,0.5);
      }

      .lightbox-close {
        position: absolute;
        top: 16px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.1);
        color: white;
        font-size: 1.4rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        z-index: 10001;

        &:hover { background: rgba(255,255,255,0.2); }
      }

      .lightbox-hint {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        color: rgba(255,255,255,0.5);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .blog-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 40px 60px;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .blog-header {
      margin-bottom: 40px;
    }

    .blog-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 24px;
      margin-bottom: 16px;
    }

    .blog-title {
      font-size: 2.5rem;
      line-height: 1.2;
      margin-bottom: 20px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .blog-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--jj-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .author-name {
      display: block;
      color: var(--jj-text-bright);
      font-weight: 600;
    }

    .blog-date {
      font-size: 0.85rem;
      color: var(--jj-text-muted);
    }

    .blog-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      color: var(--jj-text);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;

      &:hover { border-color: var(--jj-primary-light); }
      &.danger:hover { border-color: var(--jj-danger); color: var(--jj-danger); }
    }

    .blog-content {
      font-family: 'Lora', serif;
      font-size: 1.12rem;
      line-height: 2;
      color: var(--jj-text);
      overflow-wrap: break-word;
      word-wrap: break-word;
      max-width: 100%;
      overflow: hidden;

      :deep(h2), :deep(h3) {
        font-family: 'Cinzel', serif;
        color: var(--jj-text-bright);
        margin: 36px 0 18px;
      }

      :deep(p) {
        margin-bottom: 22px;
      }

      :deep(img) {
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
        border-radius: 12px;
        margin: 24px auto;
        display: block;
        object-fit: contain;
      }

      :deep(blockquote) {
        border-left: 4px solid var(--jj-accent);
        padding: 14px 24px;
        margin: 28px 0;
        color: var(--jj-text-muted);
        font-style: italic;
        background: rgba(243, 156, 18, 0.04);
        border-radius: 0 8px 8px 0;
      }

      :deep(ul), :deep(ol) {
        padding-left: 28px;
        margin-bottom: 20px;
      }

      :deep(li) {
        margin-bottom: 8px;
      }

      :deep(em) {
        color: var(--jj-accent);
      }

      :deep(pre) {
        overflow-x: auto;
        max-width: 100%;
      }
    }

    .blog-engagement {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px 0;
      margin: 40px 0;
      border-top: 1px solid var(--jj-border);
      border-bottom: 1px solid var(--jj-border);
    }

    .like-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      border-radius: 30px;
      color: var(--jj-text);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.95rem;

      &:hover { border-color: var(--jj-primary-light); }

      &.liked {
        border-color: rgba(231, 76, 60, 0.5);
        background: rgba(231, 76, 60, 0.1);

        .heart-icon { color: #e74c3c; }
      }
    }

    .heart-icon {
      font-size: 1.2rem;
      transition: transform 0.3s;

      &.pulse {
        animation: heart-burst 0.4s ease;
      }
    }

    @keyframes heart-burst {
      0% { transform: scale(1); }
      50% { transform: scale(1.4); }
      100% { transform: scale(1); }
    }

    .comment-count {
      color: var(--jj-text-muted);
      font-size: 0.95rem;
    }

    .comments-section {
      h3 {
        font-size: 1.4rem;
        margin-bottom: 24px;
      }
    }

    .comment-form {
      margin-bottom: 30px;

      textarea {
        width: 100%;
        padding: 14px;
        background: var(--jj-bg-surface);
        border: 1px solid var(--jj-border);
        border-radius: 12px;
        color: var(--jj-text);
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        margin-bottom: 12px;

        &:focus {
          outline: none;
          border-color: var(--jj-primary-light);
        }
      }
    }

    .login-prompt {
      color: var(--jj-text-muted);
      margin-bottom: 24px;
      font-style: italic;
    }

    .comment-item {
      padding: 16px 0;
      border-bottom: 1px solid rgba(42, 42, 74, 0.5);
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--jj-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .comment-meta {
      flex: 1;
      strong { color: var(--jj-text-bright); font-size: 0.9rem; }
      .comment-date { display: block; font-size: 0.8rem; color: var(--jj-text-muted); }
    }

    .btn-delete-comment {
      background: none;
      border: none;
      color: var(--jj-text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover { color: var(--jj-danger); background: rgba(231, 76, 60, 0.1); }
    }

    .comment-body {
      color: var(--jj-text);
      line-height: 1.6;
      padding-left: 42px;
    }

    .no-comments {
      color: var(--jj-text-muted);
      text-align: center;
      padding: 30px;
      font-style: italic;
    }

    @media (max-width: 992px) {
      .blog-container { padding: 0 28px 40px; }
      .blog-title { font-size: 2.1rem; }
    }

    @media (max-width: 768px) {
      .cover-image { height: 280px; }
      .blog-title { font-size: 1.8rem; }
      .blog-container { padding: 0 20px 30px; }
      .blog-content { font-size: 1rem; line-height: 1.8; }
      .blog-engagement { gap: 16px; flex-wrap: wrap; }
      .blog-meta { flex-direction: column; align-items: flex-start; gap: 12px; }
    }

    @media (max-width: 576px) {
      .cover-image { height: 220px; }
      .blog-container { padding: 0 14px 24px; }
      .blog-title { font-size: 1.5rem; margin-bottom: 14px; }
      .blog-header { margin-bottom: 24px; }
      .blog-content {
        font-size: 0.95rem;
        line-height: 1.75;

        :deep(h2), :deep(h3) { margin: 24px 0 12px; }
        :deep(blockquote) { padding: 10px 16px; margin: 20px 0; }
        :deep(ul), :deep(ol) { padding-left: 20px; }
      }
      .comment-body { padding-left: 0; }
      .comment-form textarea { padding: 10px; font-size: 0.9rem; }
      .like-btn { padding: 8px 14px; font-size: 0.85rem; }
      .comments-section h3 { font-size: 1.2rem; }
      .blog-engagement { margin: 24px 0; padding: 16px 0; }
    }

    @media (max-width: 360px) {
      .cover-image { height: 180px; }
      .blog-title { font-size: 1.3rem; }
      .author-avatar { width: 34px; height: 34px; font-size: 0.9rem; }
    }
  `]
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  comments: Comment[] = [];
  loading = true;
  newComment = '';
  justLiked = false;
  formattedContent = '';
  lightboxOpen = false;
  lightboxSrc = '';
  coverImgError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.blogService.getBlog(id).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.formattedContent = this.formatContent(blog.description);
        this.loading = false;
        this.loadComments();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  loadComments(): void {
    if (!this.blog) return;
    this.blogService.getComments(this.blog.id).subscribe({
      next: (page) => this.comments = page.content,
      error: () => {}
    });
  }

  isOwner(): boolean {
    return this.auth.isLoggedIn() && this.blog?.authorId === this.auth.user()?.userId;
  }

  onLike(): void {
    if (!this.auth.isLoggedIn() || !this.blog) return;
    this.blogService.toggleLike(this.blog.id).subscribe({
      next: (res) => {
        if (this.blog) {
          this.blog.likedByCurrentUser = res.liked;
          this.blog.likeCount = res.likeCount;
          if (res.liked) {
            this.justLiked = true;
            setTimeout(() => this.justLiked = false, 500);
          }
        }
      }
    });
  }

  onAddComment(): void {
    if (!this.blog || !this.newComment.trim()) return;
    this.blogService.addComment(this.blog.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
      }
    });
  }

  onDeleteComment(commentId: number): void {
    if (!this.blog) return;
    this.blogService.deleteComment(this.blog.id, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      }
    });
  }

  onDelete(): void {
    if (!this.blog || !confirm('Are you sure you want to delete this blog?')) return;
    this.blogService.deleteBlog(this.blog.id).subscribe({
      next: () => this.router.navigate(['/'])
    });
  }

  openLightbox(src: string): void {
    this.lightboxSrc = src;
    this.lightboxOpen = true;
  }

  onContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      this.openLightbox((target as HTMLImageElement).src);
    }
  }

  private formatContent(content: string): string {
    if (!content) return '';
    content = content.replace(/&nbsp;/g, ' ');
    const hasHtmlBlocks = /<(p|div|h[1-6]|ul|ol|blockquote|pre|table)\b/i.test(content);
    if (hasHtmlBlocks) return content;
    return content
      .split(/\n\s*\n/)
      .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
}
