import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="loader-container" [class.inline]="mode === 'inline'" [class.overlay]="mode === 'overlay'" [class.fullpage]="mode === 'fullpage'">
      <div class="jupiter-wrapper">
        <div class="orbit-ring"></div>
        <div class="orbit-ring ring-2"></div>
        <div class="jupiter">
          <div class="band band-1"></div>
          <div class="band band-2"></div>
          <div class="band band-3"></div>
          <div class="band band-4"></div>
          <div class="band band-5"></div>
          <div class="great-red-spot"></div>
          <div class="planet-shine"></div>
        </div>
        <div class="moon moon-1"></div>
        <div class="moon moon-2"></div>
        <div class="moon moon-3"></div>
      </div>
      <p class="loading-text">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }

    .loader-container.inline {
      padding: 40px 16px;
    }

    .loader-container.overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 9999;
      background: rgba(10, 5, 20, 0.75);
      backdrop-filter: blur(6px);
      padding: 0;
    }

    .loader-container.fullpage {
      min-height: 60vh;
    }

    .jupiter-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
    }

    .orbit-ring {
      position: absolute;
      top: 50%; left: 50%;
      width: 90px; height: 90px;
      transform: translate(-50%, -50%);
      border: 1px solid rgba(180, 140, 255, 0.12);
      border-radius: 50%;
      animation: pulse-ring 2.5s ease-in-out infinite;
    }
    .ring-2 {
      width: 120px !important; height: 120px !important;
      border-color: rgba(180, 140, 255, 0.06) !important;
      animation-delay: 0.8s !important;
    }

    .jupiter {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 52px; height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a460 0%, #d4a853 20%, #b8864e 40%, #c99a52 60%, #dbb870 80%, #c9a460 100%);
      overflow: hidden;
      box-shadow:
        0 0 20px rgba(201, 164, 96, 0.4),
        0 0 50px rgba(201, 164, 96, 0.15),
        inset -6px -4px 12px rgba(0,0,0,0.3);
      animation: jupiter-rotate 4s linear infinite;
    }

    .band {
      position: absolute;
      left: -4px; right: -4px;
      height: 6px;
      border-radius: 3px;
    }
    .band-1 { top: 8px; background: rgba(180, 120, 60, 0.5); }
    .band-2 { top: 16px; background: rgba(220, 180, 100, 0.4); height: 4px; }
    .band-3 { top: 24px; background: rgba(160, 100, 50, 0.55); height: 7px; }
    .band-4 { top: 34px; background: rgba(200, 160, 80, 0.35); height: 4px; }
    .band-5 { top: 40px; background: rgba(170, 110, 55, 0.4); height: 5px; }

    .great-red-spot {
      position: absolute;
      top: 22px; left: 28px;
      width: 10px; height: 7px;
      background: radial-gradient(ellipse, #c06030 0%, #a04020 60%, transparent 100%);
      border-radius: 50%;
      animation: spot-drift 4s linear infinite;
    }

    .planet-shine {
      position: absolute;
      top: 4px; left: 6px;
      width: 18px; height: 18px;
      background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
      border-radius: 50%;
    }

    .moon {
      position: absolute;
      border-radius: 50%;
      top: 50%; left: 50%;
    }

    .moon-1 {
      width: 6px; height: 6px;
      background: radial-gradient(circle, #e0d0b0, #a09080);
      box-shadow: 0 0 6px rgba(224, 208, 176, 0.4);
      animation: orbit-moon-1 2.2s linear infinite;
    }

    .moon-2 {
      width: 4px; height: 4px;
      background: radial-gradient(circle, #d0c8b8, #908878);
      box-shadow: 0 0 4px rgba(208, 200, 184, 0.3);
      animation: orbit-moon-2 3.4s linear infinite;
    }

    .moon-3 {
      width: 3px; height: 3px;
      background: radial-gradient(circle, #c8bfae, #807868);
      box-shadow: 0 0 3px rgba(200, 191, 174, 0.25);
      animation: orbit-moon-3 5s linear infinite;
    }

    .loading-text {
      margin-top: 24px;
      color: var(--jj-text-muted);
      font-style: italic;
      font-family: 'Lora', serif;
      font-size: 0.95rem;
      letter-spacing: 0.02em;
      animation: text-pulse 2s ease-in-out infinite;
    }

    @keyframes jupiter-rotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    @keyframes spot-drift {
      0% { left: 28px; }
      50% { left: 12px; }
      100% { left: 28px; }
    }

    @keyframes orbit-moon-1 {
      from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
    }

    @keyframes orbit-moon-2 {
      from { transform: rotate(90deg) translateX(48px) rotate(-90deg); }
      to { transform: rotate(450deg) translateX(48px) rotate(-450deg); }
    }

    @keyframes orbit-moon-3 {
      from { transform: rotate(200deg) translateX(56px) rotate(-200deg); }
      to { transform: rotate(560deg) translateX(56px) rotate(-560deg); }
    }

    @keyframes pulse-ring {
      0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
    }

    @keyframes text-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @media (max-width: 480px) {
      .loader-container { padding: 30px 16px; }
      .loader-container.fullpage { min-height: 50vh; }
      .jupiter-wrapper { width: 80px; height: 80px; }
      .jupiter { width: 40px; height: 40px; }
      .band { height: 5px; }
      .band-1 { top: 6px; }
      .band-2 { top: 12px; height: 3px; }
      .band-3 { top: 18px; height: 6px; }
      .band-4 { top: 26px; height: 3px; }
      .band-5 { top: 31px; height: 4px; }
      .great-red-spot { top: 17px; left: 22px; width: 8px; height: 5px; }
      .planet-shine { width: 14px; height: 14px; }
      .orbit-ring { width: 70px; height: 70px; }
      .ring-2 { width: 94px !important; height: 94px !important; }
      .loading-text { font-size: 0.85rem; margin-top: 18px; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Consulting the stars...';
  @Input() mode: 'inline' | 'overlay' | 'fullpage' = 'inline';
}
