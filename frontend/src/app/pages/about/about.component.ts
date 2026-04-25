import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Constellation Background -->
    <div class="constellation-bg">
      <svg viewBox="0 0 1200 800" class="constellation-svg">
        <!-- Stars (Nakshatras) -->
        @for (star of stars; track star.id) {
          <circle [attr.cx]="star.x" [attr.cy]="star.y" [attr.r]="star.r"
                  fill="white" class="nakshatra-star"
                  [style.animation-delay]="star.delay + 's'" />
        }
        <!-- Constellation lines -->
        @for (line of lines; track line.id) {
          <line [attr.x1]="line.x1" [attr.y1]="line.y1"
                [attr.x2]="line.x2" [attr.y2]="line.y2"
                stroke="rgba(155,89,182,0.2)" stroke-width="1"
                class="constellation-line"
                [style.animation-delay]="line.delay + 's'" />
        }
      </svg>
    </div>

    <div class="about-page">
      <div class="container">
        <!-- Hero Section -->
        <section class="about-hero">
          <div class="avatar-large">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#f39c12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </div>
          <h1>About <span class="accent">Jyotish Journey</span></h1>
          <p class="about-tagline">Where ancient wisdom meets modern storytelling</p>
        </section>

        <!-- About Content -->
        <section class="about-content">
          <div class="content-card">
            <h2><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Our Mission</h2>
            <p>
              Jyotish Journey is a community-driven platform dedicated to preserving and sharing
              the timeless wisdom of Vedic Astrology (Jyotish Shastra). We believe that the ancient
              science of the stars holds profound insights for modern life, and we aim to make this
              knowledge accessible to all seekers.
            </p>
            <p>
              Through thoughtful blog posts, in-depth analyses of planetary transits, nakshatra
              explorations, and zodiac sign deep-dives, our community of astrologers and enthusiasts
              brings the cosmos closer to you.
            </p>
          </div>

          <div class="content-card">
            <h2><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9b59b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> What We Cover</h2>
            <div class="topics-grid">
              @for (topic of topics; track topic.title) {
                <div class="topic-item">
                  <span class="topic-icon">{{ topic.icon }}</span>
                  <h4>{{ topic.title }}</h4>
                  <p>{{ topic.desc }}</p>
                </div>
              }
            </div>
          </div>

          <div class="content-card">
            <h2><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Reach Out To Me</h2>
            <p class="contact-intro">
              Have questions about astrology? Want to collaborate? I'd love to hear from you.
            </p>
            <div class="contact-grid">
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:contact@jyotishjourney.com">contact&#64;jyotishjourney.com</a>
                </div>
              </div>
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <h4>Phone</h4>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Nakshatra Strip -->
        <section class="nakshatra-strip">
          <h3>The 27 Nakshatras</h3>
          <div class="nakshatra-scroll">
            @for (n of nakshatras; track n) {
              <span class="nakshatra-item">{{ n }}</span>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .constellation-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .constellation-svg {
      width: 100%;
      height: 100%;
    }

    .nakshatra-star {
      animation: star-glow 3s ease-in-out infinite alternate;
      opacity: 0;
    }

    .constellation-line {
      animation: line-draw 2s ease-out forwards;
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      opacity: 0;
    }

    @keyframes star-glow {
      0% { opacity: 0.2; r: 1; }
      100% { opacity: 0.9; }
    }

    @keyframes line-draw {
      to {
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }

    .about-page {
      position: relative;
      z-index: 1;
      padding: 40px 0;
    }

    .about-hero {
      text-align: center;
      padding: 60px 0 50px;
    }

    .avatar-large {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--jj-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 24px;
      box-shadow: 0 0 40px rgba(243, 156, 18, 0.3);
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .about-hero h1 {
      font-size: 2.5rem;
      margin-bottom: 12px;

      .accent { color: var(--jj-accent); }
    }

    .about-tagline {
      font-family: 'Lora', serif;
      font-size: 1.15rem;
      color: var(--jj-text-muted);
    }

    .about-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .content-card {
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 16px;
      padding: 36px;
      margin-bottom: 24px;

      h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;
      }

      p {
        color: var(--jj-text);
        line-height: 1.8;
        font-family: 'Lora', serif;
        margin-bottom: 12px;
      }
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 16px;
    }

    .topic-item {
      background: var(--jj-bg-surface);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 1px solid transparent;
      transition: all 0.3s;

      &:hover {
        border-color: var(--jj-primary-light);
        transform: translateY(-4px);
      }

      .topic-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
      h4 { color: var(--jj-text-bright); margin-bottom: 6px; }
      p { font-size: 0.85rem; color: var(--jj-text-muted); margin: 0; }
    }

    .contact-intro {
      margin-bottom: 20px;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--jj-bg-surface);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--jj-border);

      .contact-icon { font-size: 1.8rem; }
      h4 { color: var(--jj-text-bright); margin-bottom: 4px; font-family: 'Inter', sans-serif; }
      a { color: var(--jj-accent); font-size: 0.95rem; }
    }

    .nakshatra-strip {
      margin-top: 50px;
      text-align: center;

      h3 {
        font-size: 1.3rem;
        margin-bottom: 20px;
        color: var(--jj-primary-light);
      }
    }

    .nakshatra-scroll {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }

    .nakshatra-item {
      padding: 6px 16px;
      background: rgba(106, 13, 173, 0.15);
      color: var(--jj-text-muted);
      border-radius: 20px;
      font-size: 0.8rem;
      border: 1px solid rgba(106, 13, 173, 0.2);
      transition: all 0.3s;

      &:hover {
        color: var(--jj-accent);
        border-color: var(--jj-accent);
        background: rgba(243, 156, 18, 0.1);
      }
    }

    @media (max-width: 992px) {
      .content-card { padding: 28px; }
      .topics-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    }

    @media (max-width: 768px) {
      .about-page { padding: 20px 0; }
      .about-hero { padding: 40px 0 30px; }
      .about-hero h1 { font-size: 1.8rem; }
      .about-tagline { font-size: 1rem; }
      .avatar-large { width: 80px; height: 80px; }
      .content-card { padding: 24px 20px; border-radius: 12px; }
      .content-card h2 { font-size: 1.3rem; }
      .topics-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .contact-grid { grid-template-columns: 1fr; }
      .contact-item { padding: 16px; }
      .nakshatra-strip { margin-top: 30px; }
      .nakshatra-item { padding: 5px 12px; font-size: 0.75rem; }
    }

    @media (max-width: 480px) {
      .about-hero { padding: 24px 0 20px; }
      .about-hero h1 { font-size: 1.4rem; }
      .about-tagline { font-size: 0.9rem; }
      .avatar-large { width: 64px; height: 64px; margin-bottom: 16px; }
      .content-card { padding: 18px 14px; }
      .content-card h2 { font-size: 1.15rem; }
      .content-card p { font-size: 0.9rem; line-height: 1.7; }
      .topics-grid { grid-template-columns: 1fr; }
      .topic-item { padding: 14px; }
      .topic-item .topic-icon { font-size: 1.5rem; }
      .contact-item { gap: 12px; padding: 14px; }
      .nakshatra-strip h3 { font-size: 1.1rem; }
      .nakshatra-scroll { gap: 6px; }
    }

    @media (max-width: 360px) {
      .about-hero h1 { font-size: 1.2rem; }
    }
  `]
})
export class AboutComponent {
  topics = [
    { icon: '\u2648', title: 'Rashi (Zodiac Signs)', desc: 'Deep dives into all 12 Rashis and their influences' },
    { icon: '\u2605', title: 'Nakshatras', desc: 'Exploring the 27 lunar mansions and their power' },
    { icon: '\u2643', title: 'Graha (Planets)', desc: 'Understanding planetary energies and transits' },
    { icon: '\u2609', title: 'Predictions', desc: 'Weekly and monthly astrological forecasts' },
    { icon: '\u2638', title: 'Vedic Wisdom', desc: 'Ancient texts and their modern applications' },
    { icon: '\u2726', title: 'Remedies', desc: 'Gemstones, mantras, and spiritual practices' },
  ];

  nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 1200,
    y: Math.random() * 800,
    r: 1 + Math.random() * 2,
    delay: Math.random() * 5
  }));

  lines = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x1: Math.random() * 1200,
    y1: Math.random() * 800,
    x2: Math.random() * 1200,
    y2: Math.random() * 800,
    delay: 0.5 + Math.random() * 3
  }));
}
