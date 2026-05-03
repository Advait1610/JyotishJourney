import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';

interface Star {
  x: number; y: number; r: number;
  alpha: number; speed: number; offset: number;
  depth: number;
}

interface FloatingPlanet {
  x: number; y: number;
  size: number;
  colors: string[];
  depth: number;
  driftX: number; driftY: number;
  driftSpeed: number; driftOffset: number;
  hasRing: boolean;
  ringColor: string;
  hasBands: boolean;
  bandColor: string;
  glowColor: string;
  glowScale: number;
}

interface Nebula {
  x: number; y: number; r: number;
  color: string; alpha: number;
  driftSpeed: number; driftOffset: number;
}

@Component({
  selector: 'app-space-background',
  standalone: true,
  template: `<canvas #bgCanvas></canvas>`,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }
    canvas {
      width: 100%; height: 100%; display: block;
    }
  `]
})
export class SpaceBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private w = 0;
  private h = 0;
  private stars: Star[] = [];
  private planets: FloatingPlanet[] = [];
  private nebulae: Nebula[] = [];
  private galaxyX = 0;
  private galaxyY = 0;
  private galaxyR = 0;
  private resizeObs!: ResizeObserver;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const c = this.canvasRef.nativeElement;
    this.ctx = c.getContext('2d')!;
    this.resize(c);
    this.init();

    this.resizeObs = new ResizeObserver(() => { this.resize(c); this.init(); });
    this.resizeObs.observe(document.body);

    this.ngZone.runOutsideAngular(() => this.loop(performance.now()));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.resizeObs?.disconnect();
  }

  private resize(c: HTMLCanvasElement): void {
    const dpr = devicePixelRatio || 1;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    c.width = this.w * dpr;
    c.height = this.h * dpr;
    c.style.width = this.w + 'px';
    c.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private init(): void {
    this.initStars();
    this.initNebulae();
    this.initPlanets();
    this.initGalaxy();
  }

  private initStars(): void {
    this.stars = [];
    const count = Math.min(500, Math.floor(this.w * this.h / 3000));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 1.4 + 0.15,
        alpha: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 1.5 + 0.5,
        offset: Math.random() * Math.PI * 2,
        depth: Math.random()
      });
    }
  }

  private initNebulae(): void {
    this.nebulae = [];
    const colors = [
      'rgba(70,30,120,',   // deep purple
      'rgba(30,50,130,',   // blue
      'rgba(120,50,30,',   // warm amber
      'rgba(40,25,80,',    // dark violet
      'rgba(20,60,100,',   // teal
    ];
    for (let i = 0; i < 8; i++) {
      this.nebulae.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: 200 + Math.random() * 400,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.015 + Math.random() * 0.025,
        driftSpeed: 0.00002 + Math.random() * 0.00003,
        driftOffset: Math.random() * 100
      });
    }
  }

  private initGalaxy(): void {
    this.galaxyX = this.w * (0.6 + Math.random() * 0.25);
    this.galaxyY = this.h * (0.2 + Math.random() * 0.3);
    this.galaxyR = Math.min(this.w, this.h) * (0.18 + Math.random() * 0.1);
  }

  private initPlanets(): void {
    this.planets = [];
    const templates = [
      { colors: ['#c2b280', '#8a7d60'], glow: 'rgba(194,178,128,', ring: false, bands: false, bc: '' },
      { colors: ['#e8c870', '#c4903a'], glow: 'rgba(232,200,112,', ring: false, bands: false, bc: '' },
      { colors: ['#4fa3d1', '#2d7a4f'], glow: 'rgba(79,163,209,', ring: false, bands: false, bc: '' },
      { colors: ['#c1440e', '#a0522d'], glow: 'rgba(193,68,14,', ring: false, bands: false, bc: '' },
      { colors: ['#c4a46c', '#a08050'], glow: 'rgba(196,164,108,', ring: false, bands: true, bc: '#8b6f47' },
      { colors: ['#d4c07a', '#c4a050'], glow: 'rgba(212,192,122,', ring: true, bands: false, bc: '' },
      { colors: ['#72b5c4', '#5a9aaa'], glow: 'rgba(114,181,196,', ring: false, bands: false, bc: '' },
      { colors: ['#3f54ba', '#5566dd'], glow: 'rgba(63,84,186,', ring: false, bands: false, bc: '' },
    ];

    let cols: number, rows: number, maxSize: number, glowScale: number;
    if (this.w < 480) {
      cols = 2; rows = 1; maxSize = 18; glowScale = 0.4;
    } else if (this.w < 768) {
      cols = 2; rows = 2; maxSize = 22; glowScale = 0.55;
    } else {
      cols = 4; rows = 3; maxSize = 36; glowScale = 1;
    }

    const count = cols * rows;
    const cellW = this.w / cols;
    const cellH = this.h / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const t = templates[i % templates.length];
      const depth = 0.15 + Math.random() * 0.85;
      const sizeBase = 8 + Math.random() * (maxSize - 8);
      const size = sizeBase * (0.4 + depth * 0.6);

      const jitterX = (Math.random() - 0.5) * cellW * 0.7;
      const jitterY = (Math.random() - 0.5) * cellH * 0.6;

      this.planets.push({
        x: cellW * (col + 0.5) + jitterX,
        y: cellH * (row + 0.5) + jitterY,
        size,
        colors: t.colors,
        depth,
        driftX: 30 + Math.random() * 40,
        driftY: 20 + Math.random() * 30,
        driftSpeed: 0.0003 + Math.random() * 0.0004,
        driftOffset: Math.random() * 1000,
        hasRing: t.ring && size > 12,
        ringColor: 'rgba(210,190,130,0.35)',
        hasBands: t.bands && size > 10,
        bandColor: t.bc,
        glowColor: t.glow,
        glowScale
      });
    }
    this.planets.sort((a, b) => a.depth - b.depth);
  }

  // ===== Main loop =====

  private loop = (t: number): void => {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawNebulae(t);
    this.drawGalaxy(t);
    this.drawStars(t);
    this.drawPlanets(t);
    this.animId = requestAnimationFrame(this.loop);
  };

  // ===== Nebulae =====

  private drawNebulae(t: number): void {
    for (const n of this.nebulae) {
      const dx = Math.sin(t * n.driftSpeed + n.driftOffset) * 60;
      const dy = Math.cos(t * n.driftSpeed * 0.7 + n.driftOffset) * 40;
      const g = this.ctx.createRadialGradient(n.x + dx, n.y + dy, 0, n.x + dx, n.y + dy, n.r);
      g.addColorStop(0, n.color + n.alpha + ')');
      g.addColorStop(0.6, n.color + (n.alpha * 0.3) + ')');
      g.addColorStop(1, n.color + '0)');
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  // ===== Spiral galaxy =====

  private drawGalaxy(t: number): void {
    const gx = this.galaxyX + Math.sin(t * 0.00003) * 15;
    const gy = this.galaxyY + Math.cos(t * 0.00004) * 10;
    const r = this.galaxyR;

    this.ctx.save();
    this.ctx.translate(gx, gy);
    this.ctx.rotate(t * 0.000015);
    this.ctx.scale(1, 0.45);

    const core = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.25);
    core.addColorStop(0, 'rgba(180,160,220,0.06)');
    core.addColorStop(0.5, 'rgba(140,120,200,0.03)');
    core.addColorStop(1, 'rgba(100,80,160,0)');
    this.ctx.fillStyle = core;
    this.ctx.beginPath(); this.ctx.arc(0, 0, r * 0.25, 0, 6.28); this.ctx.fill();

    for (let arm = 0; arm < 2; arm++) {
      const armOff = arm * Math.PI;
      this.ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const frac = i / 200;
        const angle = armOff + frac * Math.PI * 3;
        const dist = frac * r;
        const spread = 8 + frac * 25;
        const sx = Math.cos(angle) * dist + (Math.sin(i * 0.7) * spread);
        const sy = Math.sin(angle) * dist + (Math.cos(i * 0.9) * spread);
        const a = (1 - frac) * 0.04;
        const sr = 0.5 + (1 - frac) * 1.2;

        this.ctx.fillStyle = `rgba(170,150,220,${a})`;
        this.ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }
    }

    const halo = this.ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
    halo.addColorStop(0, 'rgba(120,100,180,0.025)');
    halo.addColorStop(0.4, 'rgba(80,60,140,0.012)');
    halo.addColorStop(1, 'rgba(60,40,120,0)');
    this.ctx.fillStyle = halo;
    this.ctx.beginPath(); this.ctx.arc(0, 0, r, 0, 6.28); this.ctx.fill();

    this.ctx.restore();
  }

  // ===== Stars =====

  private drawStars(t: number): void {
    for (const s of this.stars) {
      const drift = s.depth * 4;
      const sx = s.x + Math.sin(t * 0.00008 + s.offset) * drift;
      const sy = s.y + Math.cos(t * 0.00006 + s.offset * 1.3) * drift * 0.7;
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * 0.0008 * s.speed + s.offset));
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, s.r, 0, 6.28);
      this.ctx.fillStyle = `rgba(255,255,255,${a})`;
      this.ctx.fill();

      if (s.r > 1.0) {
        const g = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3);
        g.addColorStop(0, `rgba(200,210,255,${a * 0.2})`);
        g.addColorStop(1, 'rgba(200,210,255,0)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(sx - s.r * 3, sy - s.r * 3, s.r * 6, s.r * 6);
      }
    }
  }

  // ===== Floating planets =====

  private drawPlanets(t: number): void {
    for (const p of this.planets) {
      const px = p.x + Math.sin(t * p.driftSpeed + p.driftOffset) * p.driftX;
      const py = p.y + Math.cos(t * p.driftSpeed * 0.8 + p.driftOffset) * p.driftY;
      const size = p.size;

      const ga = (0.08 + p.depth * 0.08) * p.glowScale;
      const gr = size * 3.5 * p.glowScale;
      const gg = this.ctx.createRadialGradient(px, py, 0, px, py, gr);
      gg.addColorStop(0, p.glowColor + ga + ')');
      gg.addColorStop(1, p.glowColor + '0)');
      this.ctx.fillStyle = gg;
      this.ctx.beginPath(); this.ctx.arc(px, py, gr, 0, 6.28); this.ctx.fill();

      if (p.hasRing) {
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.scale(1, 0.3);
        for (let i = 0; i < 3; i++) {
          const rr = size * (1.5 + i * 0.3);
          this.ctx.beginPath(); this.ctx.arc(0, 0, rr, 0, 6.28);
          this.ctx.strokeStyle = p.ringColor.replace(/[\d.]+\)$/, (0.3 - i * 0.08) + ')');
          this.ctx.lineWidth = Math.max(1, size * 0.08);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      const lightOff = size * 0.3;
      const bg = this.ctx.createRadialGradient(px - lightOff, py - lightOff, 0, px, py, size);
      bg.addColorStop(0, this.lighten(p.colors[0], 40));
      bg.addColorStop(0.5, p.colors[0]);
      bg.addColorStop(1, p.colors[1] || p.colors[0]);
      this.ctx.beginPath(); this.ctx.arc(px, py, size, 0, 6.28);
      this.ctx.fillStyle = bg; this.ctx.fill();

      if (p.hasBands) {
        this.ctx.save();
        this.ctx.beginPath(); this.ctx.arc(px, py, size, 0, 6.28); this.ctx.clip();
        const rgb = this.hexToRgb(p.bandColor);
        for (let i = -3; i <= 3; i++) {
          const by = py + i * size * 0.3;
          this.ctx.fillStyle = i % 2 === 0
            ? `rgba(${rgb},0.2)` : `rgba(${rgb},0.08)`;
          this.ctx.fillRect(px - size, by - size * 0.07, size * 2, size * 0.14);
        }
        this.ctx.restore();
      }

      this.ctx.beginPath(); this.ctx.arc(px, py, size, 0, 6.28);
      const sh = this.ctx.createRadialGradient(px + size * 0.35, py + size * 0.25, size * 0.15, px, py, size);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(0.65, 'rgba(0,0,0,0.08)');
      sh.addColorStop(1, 'rgba(0,0,0,0.35)');
      this.ctx.fillStyle = sh; this.ctx.fill();
    }
  }

  // ===== Helpers =====

  private lighten(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgb(${Math.min(255, (n >> 16) + amt)},${Math.min(255, ((n >> 8) & 0xff) + amt)},${Math.min(255, (n & 0xff) + amt)})`;
  }

  private hexToRgb(hex: string): string {
    const n = parseInt(hex.replace('#', ''), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
}
