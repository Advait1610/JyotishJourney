import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <h3>Jyotish <span>Journey</span></h3>
          <p>Exploring the celestial wisdom of Vedic astrology, one blog at a time.</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <a routerLink="/">Home</a>
          <a routerLink="/about">About</a>
          <a routerLink="/create-blog">Write a Blog</a>
        </div>
        <div class="footer-contact">
          <h4>Reach Out</h4>
          <p>contact&#64;jyotishjourney.com</p>
          <p>+91 98765 43210</p>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="zodiac-strip">&#9800; &#9801; &#9802; &#9803; &#9804; &#9805; &#9806; &#9807; &#9808; &#9809; &#9810; &#9811;</div>
        <p>&copy; 2026 Jyotish Journey. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      z-index: 1;
      background: rgba(26, 26, 46, 0.92);
      backdrop-filter: blur(8px);
      border-top: 1px solid var(--jj-border);
      margin-top: 60px;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 50px 20px 30px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 40px;
    }

    .footer-brand {
      h3 {
        font-family: 'Cinzel', serif;
        font-size: 1.6rem;
        margin-bottom: 12px;
        color: var(--jj-text-bright);

        span { color: var(--jj-accent); }
      }

      p {
        color: var(--jj-text-muted);
        line-height: 1.6;
        max-width: 300px;
      }
    }

    .footer-links, .footer-contact {
      h4 {
        font-family: 'Cinzel', serif;
        color: var(--jj-text-bright);
        margin-bottom: 16px;
        font-size: 1.1rem;
      }

      a, p {
        display: block;
        color: var(--jj-text-muted);
        margin-bottom: 8px;
        transition: color 0.3s;
      }

      a:hover { color: var(--jj-accent); }
    }

    .footer-bottom {
      border-top: 1px solid var(--jj-border);
      text-align: center;
      padding: 20px;

      p {
        color: var(--jj-text-muted);
        font-size: 0.85rem;
      }
    }

    .zodiac-strip {
      font-family: 'Segoe UI Symbol', 'Noto Sans Symbols', 'Apple Symbols', serif;
      font-size: 1.4rem;
      letter-spacing: 12px;
      color: var(--jj-primary-light);
      margin-bottom: 10px;
      opacity: 0.6;
    }

    @media (max-width: 992px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }
      .footer-brand { grid-column: 1 / -1; }
    }

    @media (max-width: 768px) {
      .footer { margin-top: 40px; }
      .footer-container {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 30px 16px 20px;
        gap: 24px;
      }
      .footer-brand p { max-width: 100%; }
      .footer-brand h3 { font-size: 1.3rem; }
      .zodiac-strip { letter-spacing: 8px; font-size: 1.2rem; }
    }

    @media (max-width: 480px) {
      .footer { margin-top: 30px; }
      .footer-container { padding: 24px 12px 16px; gap: 20px; }
      .footer-brand h3 { font-size: 1.1rem; }
      .footer-links h4, .footer-contact h4 { font-size: 0.95rem; margin-bottom: 10px; }
      .zodiac-strip { letter-spacing: 6px; font-size: 1rem; }
      .footer-bottom { padding: 14px; }
      .footer-bottom p { font-size: 0.75rem; }
    }
  `]
})
export class FooterComponent {}
