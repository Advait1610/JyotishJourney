import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CosmicCanvasComponent } from '../../components/cosmic-canvas/cosmic-canvas.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CosmicCanvasComponent],
  template: `
    <section class="hero">
      <app-cosmic-canvas />
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">Jyotish</span>
          <span class="title-line accent">Journey</span>
        </h1>
        <p class="hero-subtitle">Unveiling the celestial wisdom of Vedic Astrology through stories, insights and ancient knowledge</p>
        <a routerLink="/posts" class="btn-outline hero-btn">Explore the Cosmos</a>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .hero {
      position: relative;
      height: 100vh;
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

    @media (max-width: 992px) {
      .hero-title { font-size: 3.5rem; }
      .hero-subtitle { font-size: 1.05rem; max-width: 450px; }
    }

    @media (max-width: 768px) {
      .hero { padding-bottom: 15vh; }
      .hero-title { font-size: 2.8rem; letter-spacing: 0.02em; }
      .hero-subtitle { font-size: 1rem; max-width: 400px; }
    }

    @media (max-width: 576px) {
      .hero { padding-bottom: 18vh; }
      .hero-content { padding: 16px; }
      .hero-title { font-size: 2.2rem; margin-bottom: 16px; }
      .hero-subtitle { font-size: 0.9rem; max-width: 320px; margin-bottom: 24px; }
    }

    @media (max-width: 360px) {
      .hero-title { font-size: 1.8rem; }
      .hero-subtitle { font-size: 0.85rem; }
    }
  `]
})
export class HomeComponent {}
