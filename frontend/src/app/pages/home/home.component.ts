import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CosmicCanvasComponent } from '../../components/cosmic-canvas/cosmic-canvas.component';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BlogCardComponent, LoadingSpinnerComponent, CosmicCanvasComponent],
  template: `
    <!-- Hero Section with Cosmic Canvas -->
    <section class="hero">
      <app-cosmic-canvas />
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">Jyotish</span>
          <span class="title-line accent">Journey</span>
        </h1>
        <p class="hero-subtitle">Unveiling the celestial wisdom of Vedic Astrology through stories, insights and ancient knowledge</p>
        <a routerLink="/about" class="btn-outline hero-btn">Explore the Cosmos</a>
      </div>
    </section>

    <!-- Hot Posts Slider -->
    @if (hotBlogs.length > 0) {
      <section class="section hot-posts">
        <div class="container">
          <h2 class="section-title">
            <svg class="fire-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-8 5-8s1 3 3 4c2.06 1.03 3-1 3-1s1 2 1 4c0 1.5-.5 3-2 4 3 0 5-2 6-5 .27-.82.41-1.68.41-2.57C19.41 6.18 14 2 14 2s-1.5 3-2 5c-.28 1.12 0 3 0 3s-2-1.5-3-4C8 4 9 2 9 2S4 6 4 11c0 3 2 5 4 6"/></svg> Trending Posts
          </h2>
          <div class="slider-container">
            <button class="slider-arrow left" (click)="scrollSlider(-1)">&lt;</button>
            <div class="slider-track" #sliderTrack>
              @for (blog of hotBlogs; track blog.id) {
                <div class="slider-card">
                  <app-blog-card [blog]="blog" />
                </div>
              }
            </div>
            <button class="slider-arrow right" (click)="scrollSlider(1)">&gt;</button>
          </div>
        </div>
      </section>
    }

    <!-- Recent Blogs Grid -->
    <section class="section recent-blogs">
      <div class="container">
        <h2 class="section-title">Recent Posts</h2>

        @if (loading) {
          <app-loading-spinner mode="fullpage" message="Loading blogs..." />
        } @else if (blogs.length === 0) {
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <h3>No posts yet</h3>
            <p>The stars are waiting for the first story to be told.</p>
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
                {{ loadingMore ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #0a0a1a;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 20px;
      pointer-events: none;
    }

    .hero-title {
      font-family: 'Cinzel', serif;
      font-size: 4.5rem;
      font-weight: 700;
      line-height: 1.05;
      margin-bottom: 24px;
      letter-spacing: 0.04em;

      .title-line {
        display: block;
        text-shadow: 0 2px 30px rgba(0, 0, 0, 0.6);
      }

      .accent {
        color: var(--jj-accent);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-shadow:
          0 0 40px rgba(243, 156, 18, 0.35),
          0 0 80px rgba(243, 156, 18, 0.15);
      }
    }

    .hero-subtitle {
      font-family: 'Lora', serif;
      font-size: 1.15rem;
      font-weight: 400;
      color: rgba(200, 195, 220, 0.85);
      max-width: 520px;
      margin: 0 auto 34px;
      line-height: 1.7;
      letter-spacing: 0.02em;
      text-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
    }

    .hero-btn {
      display: inline-block;
      pointer-events: auto;
    }

    .section {
      padding: 60px 0;
      position: relative;
      z-index: 1;
    }

    .section-title {
      font-size: 1.8rem;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fire-icon { vertical-align: middle; flex-shrink: 0; }

    .slider-container {
      position: relative;
      overflow: hidden;
    }

    .slider-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 10px 0 20px;
      scrollbar-width: none;

      &::-webkit-scrollbar { display: none; }
    }

    .slider-card {
      width: 300px;
      min-width: 300px;
      flex-shrink: 0;
      display: flex;

      app-blog-card { width: 100%; }
    }

    .slider-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(18, 18, 37, 0.9);
      border: 1px solid var(--jj-border);
      color: var(--jj-text);
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: var(--jj-primary);
        border-color: var(--jj-primary);
      }

      &.left { left: 0; }
      &.right { right: 0; }
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      align-items: stretch;
    }

    .load-more {
      text-align: center;
      margin-top: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;

      .empty-icon {
        font-size: 4rem;
        opacity: 0.3;
        display: block;
        margin-bottom: 16px;
      }

      h3 {
        color: var(--jj-text-muted);
        margin-bottom: 8px;
      }

      p { color: var(--jj-text-muted); opacity: 0.7; }
    }

    @media (max-width: 1200px) {
      .blog-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    }

    @media (max-width: 992px) {
      .section { padding: 40px 0; }
      .section-title { font-size: 1.5rem; }
      .hero-title { font-size: 3.5rem; }
      .hero-subtitle { font-size: 1.05rem; max-width: 450px; }
      .blog-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.8rem; letter-spacing: 0.02em; }
      .hero-subtitle { font-size: 1rem; max-width: 400px; }
      .blog-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .slider-card { width: 270px; min-width: 270px; }
      .section { padding: 30px 0; }
      .section-title { font-size: 1.3rem; margin-bottom: 20px; }
      .slider-arrow { width: 34px; height: 34px; font-size: 1rem; }
    }

    @media (max-width: 576px) {
      .hero { min-height: 80vh; }
      .hero-content { padding: 16px; }
      .hero-title { font-size: 2.2rem; margin-bottom: 16px; }
      .hero-subtitle { font-size: 0.9rem; max-width: 320px; margin-bottom: 24px; }
      .blog-grid { grid-template-columns: 1fr; gap: 16px; }
      .slider-card { width: 250px; min-width: 250px; }
      .slider-track { gap: 12px; }
      .empty-state { padding: 50px 16px; }
      .empty-state .empty-icon { font-size: 3rem; }
      .load-more { margin-top: 24px; }
    }

    @media (max-width: 360px) {
      .hero-title { font-size: 1.8rem; }
      .hero-subtitle { font-size: 0.85rem; }
      .slider-card { width: 220px; min-width: 220px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  blogs: Blog[] = [];
  hotBlogs: Blog[] = [];
  loading = true;
  loadingMore = false;
  currentPage = 0;
  lastPage = false;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getHotBlogs().subscribe({
      next: (blogs) => this.hotBlogs = blogs,
      error: () => {}
    });

    this.loadBlogs();
  }

  loadBlogs(): void {
    this.blogService.getBlogs(this.currentPage).subscribe({
      next: (page) => {
        this.blogs = [...this.blogs, ...page.content];
        this.lastPage = page.last;
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
    this.loadBlogs();
  }

  scrollSlider(direction: number): void {
    const track = document.querySelector('.slider-track');
    if (track) {
      track.scrollBy({ left: direction * 350, behavior: 'smooth' });
    }
  }
}
