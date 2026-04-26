import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <a [routerLink]="['/blog', blog.id]" class="card blog-card">
      <div class="card-image">
        @if (blog.coverImageUrl && !imgError) {
          <img [src]="blog.coverImageUrl" alt="" loading="lazy" (error)="imgError = true"/>
        }
        @if (!blog.coverImageUrl || imgError) {
          <div class="placeholder-image">
            <svg class="zodiac-placeholder" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a5.5 5.5 0 0 0 0 11 5.5 5.5 0 0 1 0 11"/><path d="M12 2a5.5 5.5 0 0 1 0 11 5.5 5.5 0 0 0 0 11"/></svg>
          </div>
        }
        <div class="card-overlay"></div>
      </div>
      <div class="card-content">
        <div class="card-tags">
          @for (tag of blog.tags?.slice(0, 3); track tag) {
            <span class="tag">{{ tag }}</span>
          }
        </div>
        <h3 class="card-title">{{ blog.title }}</h3>
        <div class="card-meta">
          <span class="author">
            <span class="author-avatar">{{ blog.authorName?.charAt(0) || 'A' }}</span>
            {{ blog.authorName }}
          </span>
          <span class="date">{{ blog.createdAt | date:'mediumDate' }}</span>
        </div>
        <div class="card-stats">
          <span class="stat">
            <svg class="heart" [class.liked]="blog.likedByCurrentUser" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {{ blog.likeCount }}
          </span>
          <span class="stat"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {{ blog.commentCount }}</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .blog-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 380px;
      text-decoration: none;
      cursor: pointer;
      backdrop-filter: blur(6px);
      border-radius: 12px;
      overflow: hidden;
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      }
    }

    .card-image {
      position: relative;
      height: 180px;
      flex-shrink: 0;
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
        font-size: 0;
        color: transparent;
      }

      .placeholder-image {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--jj-primary-dark), var(--jj-bg-surface));
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .zodiac-placeholder {
        font-size: 3rem;
        opacity: 0.3;
      }

      .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60%;
        background: linear-gradient(transparent, var(--jj-bg-card));
      }
    }

    .blog-card:hover .card-image img {
      transform: scale(1.1);
    }

    .card-content {
      padding: 16px 20px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 10px;
    }

    .card-title {
      font-family: 'Lora', serif;
      font-size: 1.1rem;
      color: var(--jj-text-bright);
      margin-bottom: 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 3.08em;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.85rem;
      color: var(--jj-text-muted);
    }

    .author {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .author-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--jj-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .card-stats {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
      color: var(--jj-text-muted);
      margin-top: auto;
    }

    .stat { display: flex; align-items: center; gap: 4px; }

    .heart { color: var(--jj-text-muted); transition: color 0.3s; }
    .heart.liked { color: #e74c3c; }

    @media (max-width: 480px) {
      .card-image { height: 160px; }
      .card-content { padding: 12px 14px 16px; }
      .card-title { font-size: 1rem; margin-bottom: 8px; }
      .card-meta { font-size: 0.8rem; flex-wrap: wrap; gap: 6px; }
      .card-stats { font-size: 0.8rem; }
      .tag { font-size: 0.7rem; padding: 3px 10px; }
    }

    @media (max-width: 360px) {
      .card-image { height: 140px; }
      .card-content { padding: 10px 12px 14px; }
      .card-title { font-size: 0.95rem; }
    }
  `]
})
export class BlogCardComponent {
  @Input() blog!: Blog;
  imgError = false;
}
