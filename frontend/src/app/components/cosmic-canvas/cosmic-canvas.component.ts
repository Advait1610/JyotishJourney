import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';

interface Star {
  x: number; y: number; radius: number;
  baseAlpha: number; twinkleSpeed: number; twinkleOffset: number;
  depth: number;
}

interface ShootingStar {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

interface Planet {
  name: string;
  orbitRadius: number;
  size: number;
  speed: number;
  angle: number;
  colors: string[];
  glowColor: string;
  hasRing?: boolean;
  ringColor?: string;
  ringWidth?: number;
  hasBands?: boolean;
  bandColor?: string;
}

interface ConstellationStar { x: number; y: number; }
interface ConstellationLine { from: number; to: number; }
interface ZodiacConstellation {
  name: string; symbol: string;
  stars: ConstellationStar[]; lines: ConstellationLine[];
}

const ORBIT_ALPHA = 0.12;
const PARALLAX_STRENGTH = 0.035;
const STAR_PARALLAX = 0.02;

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.5;
const MIN_TILT = 0.05;
const MAX_TILT = 0.95;

@Component({
  selector: 'app-cosmic-canvas',
  standalone: true,
  template: `<canvas #cosmicCanvas class="cosmic-canvas"></canvas>`,
  styles: [`
    :host { display: block; position: absolute; inset: 0; z-index: 0; }
    .cosmic-canvas { width: 100%; height: 100%; display: block; touch-action: none; }
  `]
})
export class CosmicCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cosmicCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private stars: Star[] = [];
  private planets: Planet[] = [];
  private shootingStars: ShootingStar[] = [];
  private constellations: ZodiacConstellation[] = [];
  private activeConstIdx = 0;
  private constAlpha = 0;
  private constTimer = 0;
  private lastTime = 0;
  private cx = 0;
  private cy = 0;
  private w = 0;
  private h = 0;
  private resizeObs!: ResizeObserver;
  private nebulae: { x: number; y: number; r: number; color: string; a: number }[] = [];

  private mouseX = 0;
  private mouseY = 0;
  private smoothMouseX = 0;
  private smoothMouseY = 0;
  private hoveredPlanet: { name: string; x: number; y: number } | null = null;
  private shootTimer = 0;

  private zoom = 1;
  private smoothZoom = 1;
  private tilt = 0.28;
  private smoothTilt = 0.28;
  private camRotation = 0;
  private smoothCamRotation = 0;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartTilt = 0;
  private dragStartRotation = 0;
  private controlsHintAlpha = 1;
  private controlsHintTimer = 0;

  private isTouchDevice = false;
  private lastPinchDist = 0;
  private touchStartCount = 0;

  private handlers: { el: EventTarget; ev: string; fn: EventListener }[] = [];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize(canvas);
    this.initAll();

    this.resizeObs = new ResizeObserver(() => { this.resize(canvas); this.initAll(); });
    this.resizeObs.observe(canvas.parentElement!);

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) {
      this.setupTouchEvents(canvas);
    } else {
      this.setupMouseEvents(canvas);
    }

    this.ngZone.runOutsideAngular(() => {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    });
  }

  private setupMouseEvents(canvas: HTMLCanvasElement): void {
    this.on(canvas, 'mousemove', (e: Event) => {
      const me = e as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      this.mouseX = ((me.clientX - rect.left) / rect.width - 0.5) * 2;
      this.mouseY = ((me.clientY - rect.top) / rect.height - 0.5) * 2;

      if (this.isDragging) {
        const dx = me.clientX - this.dragStartX;
        const dy = me.clientY - this.dragStartY;
        this.camRotation = this.dragStartRotation + dx * 0.005;
        this.tilt = Math.max(MIN_TILT, Math.min(MAX_TILT, this.dragStartTilt - dy * 0.002));
      }
    });

    this.on(canvas, 'mouseleave', () => {
      this.mouseX = 0; this.mouseY = 0;
      this.isDragging = false;
      canvas.style.cursor = 'crosshair';
    });

    this.on(canvas, 'mousedown', (e: Event) => {
      const me = e as MouseEvent;
      if (me.button !== 0) return;
      this.isDragging = true;
      this.dragStartX = me.clientX;
      this.dragStartY = me.clientY;
      this.dragStartTilt = this.tilt;
      this.dragStartRotation = this.camRotation;
      canvas.style.cursor = 'grabbing';
      this.fadeHint();
    });

    this.on(window, 'mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        canvas.style.cursor = 'crosshair';
      }
    });

    this.on(canvas, 'wheel', (e: Event) => {
      const we = e as WheelEvent;
      e.preventDefault();
      this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom - we.deltaY * 0.001));
      this.fadeHint();
    }, { passive: false });

    this.on(canvas, 'dblclick', () => {
      this.zoom = 1; this.tilt = 0.28; this.camRotation = 0;
    });
  }

  private setupTouchEvents(canvas: HTMLCanvasElement): void {
    this.on(canvas, 'touchstart', (e: Event) => {
      const te = e as TouchEvent;
      e.preventDefault();
      this.fadeHint();
      this.touchStartCount = te.touches.length;

      if (te.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = te.touches[0].clientX;
        this.dragStartY = te.touches[0].clientY;
        this.dragStartTilt = this.tilt;
        this.dragStartRotation = this.camRotation;

        const rect = canvas.getBoundingClientRect();
        this.mouseX = ((te.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
        this.mouseY = ((te.touches[0].clientY - rect.top) / rect.height - 0.5) * 2;
      } else if (te.touches.length === 2) {
        this.isDragging = false;
        this.lastPinchDist = this.pinchDistance(te.touches);
      }
    }, { passive: false });

    this.on(canvas, 'touchmove', (e: Event) => {
      const te = e as TouchEvent;
      e.preventDefault();

      if (te.touches.length === 1 && this.isDragging) {
        const dx = te.touches[0].clientX - this.dragStartX;
        const dy = te.touches[0].clientY - this.dragStartY;
        this.camRotation = this.dragStartRotation + dx * 0.008;
        this.tilt = Math.max(MIN_TILT, Math.min(MAX_TILT, this.dragStartTilt - dy * 0.003));

        const rect = canvas.getBoundingClientRect();
        this.mouseX = ((te.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
        this.mouseY = ((te.touches[0].clientY - rect.top) / rect.height - 0.5) * 2;
      } else if (te.touches.length === 2) {
        const dist = this.pinchDistance(te.touches);
        if (this.lastPinchDist > 0) {
          const scale = dist / this.lastPinchDist;
          this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * scale));
        }
        this.lastPinchDist = dist;
      }
    }, { passive: false });

    this.on(canvas, 'touchend', (e: Event) => {
      const te = e as TouchEvent;
      if (te.touches.length === 0) {
        this.isDragging = false;
        this.lastPinchDist = 0;
        this.mouseX = 0;
        this.mouseY = 0;
      } else if (te.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = te.touches[0].clientX;
        this.dragStartY = te.touches[0].clientY;
        this.dragStartTilt = this.tilt;
        this.dragStartRotation = this.camRotation;
        this.lastPinchDist = 0;
      }
    });
  }

  private pinchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.resizeObs?.disconnect();
    for (const h of this.handlers) h.el.removeEventListener(h.ev, h.fn);
    this.handlers = [];
  }

  private on(el: EventTarget, ev: string, fn: EventListener, opts?: AddEventListenerOptions): void {
    el.addEventListener(ev, fn, opts);
    this.handlers.push({ el, ev, fn });
  }

  private fadeHint(): void {
    this.controlsHintTimer = 0;
    this.controlsHintAlpha = 0;
  }

  private resize(c: HTMLCanvasElement): void {
    const r = c.parentElement!.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
    this.cx = this.w / 2; this.cy = this.h * 0.55;
  }

  private initAll(): void {
    this.initStars();
    this.initPlanets();
    this.initConstellations();
    this.nebulae = [];
    this.initNebula();
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 350; i++) {
      this.stars.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        radius: Math.random() * 1.6 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.8,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2
      });
    }
  }

  private initPlanets(): void {
    const d = Math.sqrt(this.cx * this.cx + (this.cy * 0.7) * (this.cy * 0.7));
    const s = d / 100;
    this.planets = [
      { name: 'Mercury', orbitRadius: d * 0.12, size: s * 0.9, speed: 1.1,
        angle: Math.random() * 6.28, colors: ['#c2b280', '#8a7d60'], glowColor: 'rgba(194,178,128,0.3)' },
      { name: 'Venus', orbitRadius: d * 0.19, size: s * 1.4, speed: 0.85,
        angle: Math.random() * 6.28, colors: ['#e8c870', '#c4903a'], glowColor: 'rgba(232,200,112,0.3)' },
      { name: 'Earth', orbitRadius: d * 0.27, size: s * 1.5, speed: 0.7,
        angle: Math.random() * 6.28, colors: ['#4fa3d1', '#2d7a4f', '#3a8cc2'], glowColor: 'rgba(79,163,209,0.35)' },
      { name: 'Mars', orbitRadius: d * 0.36, size: s * 1.2, speed: 0.55,
        angle: Math.random() * 6.28, colors: ['#c1440e', '#a0522d'], glowColor: 'rgba(193,68,14,0.3)' },
      { name: 'Jupiter', orbitRadius: d * 0.50, size: s * 3.2, speed: 0.32,
        angle: Math.random() * 6.28, colors: ['#c4a46c', '#a08050', '#d4b896'],
        glowColor: 'rgba(196,164,108,0.25)', hasBands: true, bandColor: '#8b6f47' },
      { name: 'Saturn', orbitRadius: d * 0.64, size: s * 2.6, speed: 0.22,
        angle: Math.random() * 6.28, colors: ['#d4c07a', '#c4a050', '#e0d0a0'],
        glowColor: 'rgba(212,192,122,0.25)', hasRing: true, ringColor: 'rgba(210,190,130,0.5)', ringWidth: s * 0.6 },
      { name: 'Uranus', orbitRadius: d * 0.78, size: s * 2.0, speed: 0.15,
        angle: Math.random() * 6.28, colors: ['#72b5c4', '#5a9aaa', '#88ccdd'], glowColor: 'rgba(114,181,196,0.25)' },
      { name: 'Neptune', orbitRadius: d * 0.92, size: s * 1.9, speed: 0.1,
        angle: Math.random() * 6.28, colors: ['#3f54ba', '#5566dd', '#2244aa'], glowColor: 'rgba(63,84,186,0.3)' },
    ];
  }

  private initNebula(): void {
    const cols = ['rgba(80,40,140,', 'rgba(40,60,150,', 'rgba(150,80,40,', 'rgba(60,30,100,', 'rgba(30,80,120,'];
    for (let i = 0; i < 12; i++) {
      this.nebulae.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        r: Math.random() * 350 + 150,
        color: cols[Math.floor(Math.random() * cols.length)],
        a: Math.random() * 0.04 + 0.01
      });
    }
  }

  private initConstellations(): void {
    this.constellations = [
      { name: 'Aries', symbol: '\u2648',
        stars: [{x:.2,y:.3},{x:.25,y:.25},{x:.32,y:.22},{x:.38,y:.24},{x:.33,y:.28}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:2,to:4}] },
      { name: 'Taurus', symbol: '\u2649',
        stars: [{x:.15,y:.3},{x:.2,y:.25},{x:.28,y:.22},{x:.35,y:.2},{x:.25,y:.28},{x:.22,y:.32},{x:.38,y:.25}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:1,to:4},{from:4,to:5},{from:3,to:6}] },
      { name: 'Gemini', symbol: '\u264A',
        stars: [{x:.2,y:.18},{x:.22,y:.25},{x:.21,y:.32},{x:.2,y:.38},{x:.32,y:.18},{x:.3,y:.25},{x:.31,y:.32},{x:.32,y:.38}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:4,to:5},{from:5,to:6},{from:6,to:7},{from:1,to:5},{from:2,to:6}] },
      { name: 'Cancer', symbol: '\u264B',
        stars: [{x:.22,y:.25},{x:.28,y:.22},{x:.32,y:.27},{x:.26,y:.3},{x:.3,y:.34}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:0},{from:2,to:4}] },
      { name: 'Leo', symbol: '\u264C',
        stars: [{x:.18,y:.3},{x:.22,y:.22},{x:.28,y:.2},{x:.34,y:.22},{x:.36,y:.28},{x:.32,y:.34},{x:.26,y:.35}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:0}] },
      { name: 'Virgo', symbol: '\u264D',
        stars: [{x:.18,y:.2},{x:.22,y:.26},{x:.28,y:.24},{x:.32,y:.28},{x:.36,y:.26},{x:.34,y:.34},{x:.28,y:.36}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:3,to:5},{from:5,to:6},{from:6,to:1}] },
      { name: 'Libra', symbol: '\u264E',
        stars: [{x:.25,y:.2},{x:.2,y:.28},{x:.3,y:.28},{x:.18,y:.35},{x:.32,y:.35},{x:.25,y:.32}],
        lines: [{from:0,to:1},{from:0,to:2},{from:1,to:3},{from:2,to:4},{from:1,to:5},{from:5,to:2}] },
      { name: 'Scorpio', symbol: '\u264F',
        stars: [{x:.15,y:.28},{x:.2,y:.26},{x:.25,y:.27},{x:.3,y:.3},{x:.34,y:.34},{x:.37,y:.32},{x:.39,y:.28},{x:.38,y:.25}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:7}] },
      { name: 'Sagittarius', symbol: '\u2650',
        stars: [{x:.2,y:.35},{x:.25,y:.28},{x:.3,y:.22},{x:.28,y:.32},{x:.34,y:.3},{x:.22,y:.22},{x:.35,y:.24}],
        lines: [{from:0,to:1},{from:1,to:2},{from:1,to:3},{from:3,to:4},{from:1,to:5},{from:2,to:6}] },
      { name: 'Capricorn', symbol: '\u2651',
        stars: [{x:.2,y:.22},{x:.26,y:.2},{x:.32,y:.23},{x:.35,y:.28},{x:.32,y:.34},{x:.26,y:.36},{x:.22,y:.32}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6}] },
      { name: 'Aquarius', symbol: '\u2652',
        stars: [{x:.18,y:.24},{x:.23,y:.22},{x:.28,y:.24},{x:.33,y:.22},{x:.36,y:.26},{x:.32,y:.32},{x:.26,y:.34},{x:.2,y:.3}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:7},{from:7,to:0}] },
      { name: 'Pisces', symbol: '\u2653',
        stars: [{x:.18,y:.25},{x:.22,y:.22},{x:.26,y:.24},{x:.3,y:.26},{x:.3,y:.32},{x:.34,y:.34},{x:.26,y:.3}],
        lines: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:2,to:6},{from:6,to:4}] },
    ];
    this.activeConstIdx = Math.floor(Math.random() * this.constellations.length);
  }

  // ===== Main loop =====

  private loop = (t: number): void => {
    const dt = Math.min(t - this.lastTime, 50);
    this.lastTime = t;

    this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
    this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;
    this.smoothZoom += (this.zoom - this.smoothZoom) * 0.08;
    this.smoothTilt += (this.tilt - this.smoothTilt) * 0.07;
    this.smoothCamRotation += (this.camRotation - this.smoothCamRotation) * 0.07;

    if (this.controlsHintAlpha > 0) {
      this.controlsHintTimer += dt;
      if (this.controlsHintTimer > 5000) this.controlsHintAlpha = Math.max(0, this.controlsHintAlpha - dt * 0.001);
    }

    this.ctx.clearRect(0, 0, this.w, this.h);

    this.drawNebula(t);
    this.drawStars(t);
    this.updateConstellation(dt);
    this.drawConstellation();
    this.updateShootingStars(dt);
    this.drawShootingStars();

    const pxOff = this.isDragging ? 0 : this.smoothMouseX * this.w * PARALLAX_STRENGTH;
    const pyOff = this.isDragging ? 0 : this.smoothMouseY * this.h * PARALLAX_STRENGTH;

    this.drawOrbits(pxOff, pyOff);
    this.drawSun(t, pxOff, pyOff);
    this.drawPlanets(dt, t, pxOff, pyOff);
    this.drawTooltip();
    this.drawControlsHint();
    this.drawZoomIndicator();

    this.shootTimer += dt;
    if (this.shootTimer > 2500 + Math.random() * 4000) {
      this.spawnShootingStar();
      this.shootTimer = 0;
    }

    this.animId = requestAnimationFrame(this.loop);
  };

  // ===== Nebula =====

  private drawNebula(t: number): void {
    for (const n of this.nebulae) {
      const px = n.x + this.smoothMouseX * 15;
      const py = n.y + this.smoothMouseY * 10;
      const dx = Math.sin(t * 0.00004 + n.x * 0.01) * 30;
      const g = this.ctx.createRadialGradient(px + dx, py, 0, px + dx, py, n.r);
      g.addColorStop(0, n.color + n.a + ')');
      g.addColorStop(1, n.color + '0)');
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  // ===== Stars with parallax =====

  private drawStars(t: number): void {
    for (const s of this.stars) {
      const px = s.x + this.smoothMouseX * this.w * STAR_PARALLAX * s.depth;
      const py = s.y + this.smoothMouseY * this.h * STAR_PARALLAX * s.depth;
      const a = s.baseAlpha * (0.5 + 0.5 * Math.sin(t * 0.001 * s.twinkleSpeed + s.twinkleOffset));
      this.ctx.beginPath();
      this.ctx.arc(px, py, s.radius, 0, 6.28);
      this.ctx.fillStyle = `rgba(255,255,255,${a})`;
      this.ctx.fill();
      if (s.radius > 1.1) {
        const g = this.ctx.createRadialGradient(px, py, 0, px, py, s.radius * 3);
        g.addColorStop(0, `rgba(255,255,255,${a * 0.25})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(px - s.radius * 3, py - s.radius * 3, s.radius * 6, s.radius * 6);
      }
    }
  }

  // ===== Shooting stars =====

  private spawnShootingStar(): void {
    const fromLeft = Math.random() > 0.5;
    this.shootingStars.push({
      x: fromLeft ? Math.random() * this.w * 0.3 : this.w * 0.7 + Math.random() * this.w * 0.3,
      y: Math.random() * this.h * 0.4,
      vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 4),
      vy: 2 + Math.random() * 3,
      life: 0, maxLife: 600 + Math.random() * 600,
      size: 1.5 + Math.random() * 1.5
    });
  }

  private updateShootingStars(dt: number): void {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt * 0.06;
      ss.y += ss.vy * dt * 0.06;
      ss.life += dt;
      if (ss.life >= ss.maxLife || ss.x < -50 || ss.x > this.w + 50 || ss.y > this.h + 50)
        this.shootingStars.splice(i, 1);
    }
  }

  private drawShootingStars(): void {
    for (const ss of this.shootingStars) {
      const fade = ss.life < 200 ? ss.life / 200 : Math.max(0, 1 - (ss.life - ss.maxLife + 300) / 300);
      const tailLen = 40 + ss.size * 10;
      const g = this.ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * tailLen * 0.15, ss.y - ss.vy * tailLen * 0.15);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
      g.addColorStop(0.4, `rgba(200,220,255,${0.4 * fade})`);
      g.addColorStop(1, 'rgba(200,220,255,0)');
      this.ctx.beginPath();
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(ss.x - ss.vx * tailLen * 0.15, ss.y - ss.vy * tailLen * 0.15);
      this.ctx.strokeStyle = g; this.ctx.lineWidth = ss.size;
      this.ctx.lineCap = 'round'; this.ctx.stroke();
      const hg = this.ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, ss.size * 4);
      hg.addColorStop(0, `rgba(255,255,255,${0.4 * fade})`);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      this.ctx.fillStyle = hg;
      this.ctx.beginPath(); this.ctx.arc(ss.x, ss.y, ss.size * 4, 0, 6.28); this.ctx.fill();
    }
  }

  // ===== Constellation =====

  private updateConstellation(dt: number): void {
    this.constTimer += dt;
    const fade = 8000, show = 50000, total = show + fade;
    if (this.constTimer < fade) this.constAlpha = this.constTimer / fade;
    else if (this.constTimer < show) this.constAlpha = 1;
    else if (this.constTimer < total) this.constAlpha = 1 - (this.constTimer - show) / fade;
    else { this.constTimer = 0; this.activeConstIdx = (this.activeConstIdx + 1) % this.constellations.length; this.constAlpha = 0; }
  }

  private drawConstellation(): void {
    const c = this.constellations[this.activeConstIdx];
    if (!c || this.constAlpha <= 0) return;
    const a = this.constAlpha;
    const cpx = this.smoothMouseX * this.w * 0.01;
    const cpy = this.smoothMouseY * this.h * 0.01;
    const minDim = Math.min(this.w, this.h);
    const scaleFactor = this.w < 480 ? 0.75 : this.w < 768 ? 0.85 : this.w < 992 ? 0.95 : 1.1;
    const sc = minDim * scaleFactor;
    const ox = this.w * 0.58 + cpx, oy = this.h * 0.05 + cpy;
    const starGlow = Math.max(4, minDim * 0.012);
    const starR = Math.max(1.2, minDim * 0.003);

    for (const l of c.lines) {
      const s1 = c.stars[l.from], s2 = c.stars[l.to];
      this.ctx.beginPath();
      this.ctx.moveTo(ox + s1.x * sc, oy + s1.y * sc);
      this.ctx.lineTo(ox + s2.x * sc, oy + s2.y * sc);
      this.ctx.strokeStyle = `rgba(100,60,160,${0.2 * a})`;
      this.ctx.lineWidth = 1; this.ctx.stroke();
      this.ctx.strokeStyle = `rgba(140,90,200,${0.12 * a})`;
      this.ctx.lineWidth = 3; this.ctx.stroke();
    }
    for (const st of c.stars) {
      const sx = ox + st.x * sc, sy = oy + st.y * sc;
      const g = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, starGlow);
      g.addColorStop(0, `rgba(160,100,220,${0.5 * a})`);
      g.addColorStop(1, 'rgba(160,100,220,0)');
      this.ctx.fillStyle = g;
      this.ctx.fillRect(sx - starGlow, sy - starGlow, starGlow * 2, starGlow * 2);
      this.ctx.beginPath(); this.ctx.arc(sx, sy, starR, 0, 6.28);
      this.ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`; this.ctx.fill();
    }
    const symSize = Math.max(16, Math.round(minDim * 0.05));
    const nameSize = Math.max(9, Math.round(minDim * 0.017));
    const lx = ox + 0.27 * sc, ly = oy + 0.42 * sc;
    this.ctx.font = `${symSize}px serif`; this.ctx.textAlign = 'center';
    this.ctx.fillStyle = `rgba(140,90,200,${0.35 * a})`;
    this.ctx.fillText(c.symbol, lx, ly);
    this.ctx.font = `${nameSize}px "Cinzel", serif`;
    this.ctx.fillStyle = `rgba(140,90,200,${0.25 * a})`;
    this.ctx.fillText(c.name, lx, ly + symSize * 0.6);
  }

  // ===== Orbits =====

  private drawOrbits(px: number, py: number): void {
    const z = this.smoothZoom;
    const t = this.smoothTilt;
    this.ctx.save();
    for (const p of this.planets) {
      this.ctx.beginPath();
      this.ctx.ellipse(
        this.cx + px, this.cy + py,
        p.orbitRadius * z, p.orbitRadius * z * t,
        this.smoothCamRotation, 0, 6.28
      );
      this.ctx.strokeStyle = `rgba(180,180,220,${ORBIT_ALPHA})`;
      this.ctx.lineWidth = 0.6;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // ===== Sun =====

  private drawSun(t: number, px: number, py: number): void {
    const sx = this.cx + px, sy = this.cy + py;
    const pulse = 1 + 0.03 * Math.sin(t * 0.002);
    const d = Math.sqrt(this.cx * this.cx + (this.cy * 0.7) * (this.cy * 0.7));
    const sunR = d / 100 * 4 * pulse * this.smoothZoom;

    const layers = [
      { r: sunR * 5, a: 0.04 }, { r: sunR * 3, a: 0.08 }, { r: sunR * 1.8, a: 0.15 }
    ];
    for (const l of layers) {
      const g = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, l.r);
      g.addColorStop(0, `rgba(255,200,50,${l.a})`);
      g.addColorStop(0.5, `rgba(255,160,20,${l.a * 0.4})`);
      g.addColorStop(1, 'rgba(255,140,0,0)');
      this.ctx.fillStyle = g;
      this.ctx.beginPath(); this.ctx.arc(sx, sy, l.r, 0, 6.28); this.ctx.fill();
    }

    const sg = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, sunR);
    sg.addColorStop(0, '#fffde0');
    sg.addColorStop(0.25, '#ffe680');
    sg.addColorStop(0.6, '#f5a623');
    sg.addColorStop(1, '#e8751a');
    this.ctx.beginPath(); this.ctx.arc(sx, sy, sunR, 0, 6.28);
    this.ctx.fillStyle = sg; this.ctx.fill();

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    const flareAngle = t * 0.0003;
    for (let i = 0; i < 4; i++) {
      const fa = flareAngle + i * Math.PI / 2;
      const fx = sx + Math.cos(fa) * sunR * 0.5;
      const fy = sy + Math.sin(fa) * sunR * 0.5;
      const fg = this.ctx.createRadialGradient(fx, fy, 0, sx, sy, sunR * 7);
      fg.addColorStop(0, 'rgba(255,240,180,0.06)');
      fg.addColorStop(0.3, 'rgba(255,200,100,0.02)');
      fg.addColorStop(1, 'rgba(255,180,50,0)');
      this.ctx.fillStyle = fg;
      this.ctx.fillRect(sx - sunR * 7, sy - sunR * 7, sunR * 14, sunR * 14);
    }
    this.ctx.restore();
  }

  // ===== Planets =====

  private drawPlanets(dt: number, t: number, px: number, py: number): void {
    this.hoveredPlanet = null;
    const z = this.smoothZoom;
    const tiltVal = this.smoothTilt;
    const rot = this.smoothCamRotation;

    const absMx = (this.mouseX * 0.5 + 0.5) * this.w;
    const absMy = (this.mouseY * 0.5 + 0.5) * this.h;

    const sorted = this.planets.map(p => {
      p.angle += p.speed * dt * 0.001;
      const localX = Math.cos(p.angle) * p.orbitRadius * z;
      const localY = Math.sin(p.angle) * p.orbitRadius * z * tiltVal;
      const rx = localX * Math.cos(rot) - localY * Math.sin(rot);
      const ry = localX * Math.sin(rot) + localY * Math.cos(rot);
      const ppx = this.cx + px + rx;
      const ppy = this.cy + py + ry;
      const depth = Math.sin(p.angle + rot);
      return { planet: p, x: ppx, y: ppy, z: depth };
    }).sort((a, b) => a.z - b.z);

    for (const { planet: p, x, y, z: depth } of sorted) {
      const depthScale = 0.75 + 0.25 * ((depth + 1) / 2);
      const size = p.size * depthScale * z;
      const alpha = 0.5 + 0.5 * ((depth + 1) / 2);

      const dist = Math.sqrt((absMx - x) ** 2 + (absMy - y) ** 2);
      const isHovered = dist < size + 12;

      this.ctx.globalAlpha = alpha;

      const glowR = size * (isHovered ? 6 : 4);
      const gg = this.ctx.createRadialGradient(x, y, 0, x, y, glowR);
      gg.addColorStop(0, isHovered ? p.glowColor.replace(/[\d.]+\)$/, '0.5)') : p.glowColor);
      gg.addColorStop(1, p.glowColor.replace(/[\d.]+\)$/, '0)'));
      this.ctx.fillStyle = gg;
      this.ctx.beginPath(); this.ctx.arc(x, y, glowR, 0, 6.28); this.ctx.fill();

      if (p.hasRing) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rot * 0.3);
        this.ctx.scale(1, 0.3);
        for (let i = 0; i < 3; i++) {
          const rr = size * (1.6 + i * 0.35);
          this.ctx.beginPath(); this.ctx.arc(0, 0, rr, 0, 6.28);
          this.ctx.strokeStyle = (p.ringColor || 'rgba(200,180,120,0.4)').replace(/[\d.]+\)$/, (0.4 - i * 0.1) + ')');
          this.ctx.lineWidth = (p.ringWidth || 2) * z;
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      const lightX = x - size * 0.3 + (this.isDragging ? 0 : this.smoothMouseX * size * 0.2);
      const lightY = y - size * 0.3 + (this.isDragging ? 0 : this.smoothMouseY * size * 0.2);
      const bg = this.ctx.createRadialGradient(lightX, lightY, 0, x, y, size);
      bg.addColorStop(0, this.lighten(p.colors[0], 50));
      bg.addColorStop(0.5, p.colors[0]);
      bg.addColorStop(1, p.colors[1] || p.colors[0]);
      this.ctx.beginPath(); this.ctx.arc(x, y, size, 0, 6.28);
      this.ctx.fillStyle = bg; this.ctx.fill();

      if (p.hasBands && size > 4) {
        this.ctx.save();
        this.ctx.beginPath(); this.ctx.arc(x, y, size, 0, 6.28); this.ctx.clip();
        const bc = p.bandColor || '#8b6f47';
        for (let i = -3; i <= 3; i++) {
          const by = y + i * size * 0.28;
          this.ctx.fillStyle = i % 2 === 0
            ? `rgba(${this.hexToRgb(bc)},0.25)` : `rgba(${this.hexToRgb(bc)},0.1)`;
          this.ctx.fillRect(x - size, by - size * 0.08, size * 2, size * 0.16);
        }
        this.ctx.restore();
      }

      this.ctx.beginPath(); this.ctx.arc(x, y, size, 0, 6.28);
      const shadow = this.ctx.createRadialGradient(x + size * 0.4, y + size * 0.3, size * 0.2, x, y, size);
      shadow.addColorStop(0, 'rgba(0,0,0,0)');
      shadow.addColorStop(0.7, 'rgba(0,0,0,0.1)');
      shadow.addColorStop(1, 'rgba(0,0,0,0.4)');
      this.ctx.fillStyle = shadow; this.ctx.fill();

      this.ctx.globalAlpha = 1;

      if (isHovered) {
        this.hoveredPlanet = { name: p.name, x, y: y - size - 14 };
      }
    }
  }

  // ===== Tooltip =====

  private drawTooltip(): void {
    if (!this.hoveredPlanet) return;
    const { name, x, y } = this.hoveredPlanet;
    this.ctx.save();
    this.ctx.font = '12px "Cinzel", sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(name).width + 16;
    const th = 24;
    const tx = x - tw / 2, ty = y - th / 2;
    this.ctx.fillStyle = 'rgba(10,10,30,0.85)';
    this.ctx.strokeStyle = 'rgba(140,120,200,0.5)';
    this.ctx.lineWidth = 1;
    this.roundRect(tx, ty, tw, th, 6);
    this.ctx.fill(); this.ctx.stroke();
    this.ctx.fillStyle = 'rgba(220,210,255,0.95)';
    this.ctx.fillText(name, x, y + 4);
    this.ctx.restore();
  }

  // ===== Controls hint =====

  private drawControlsHint(): void {
    if (this.controlsHintAlpha <= 0) return;
    const a = this.controlsHintAlpha;
    this.ctx.save();
    this.ctx.globalAlpha = a * 0.7;

    const lines = this.isTouchDevice
      ? ['Drag to rotate view', 'Pinch to zoom', 'Double-tap to reset']
      : ['Drag to rotate view', 'Scroll to zoom', 'Double-click to reset'];
    const lh = 18;
    const bx = 16, by = this.h - 16 - lines.length * lh;

    this.ctx.fillStyle = 'rgba(10,10,30,0.6)';
    this.roundRect(bx - 8, by - 8, 190, lines.length * lh + 16, 8);
    this.ctx.fill();

    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = 'rgba(180,170,220,0.9)';
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], bx, by + i * lh + 12);
    }
    this.ctx.restore();
  }

  // ===== Zoom indicator =====

  private drawZoomIndicator(): void {
    if (Math.abs(this.smoothZoom - 1) < 0.02 && Math.abs(this.smoothTilt - 0.28) < 0.02) return;

    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    const rx = this.w - 100, ry = this.h - 50;

    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = 'rgba(180,170,220,0.8)';
    this.ctx.fillText(`${(this.smoothZoom * 100).toFixed(0)}%`, rx + 70, ry);

    const tiltDeg = (this.smoothTilt * 90).toFixed(0);
    const viewLabel = Number(tiltDeg) < 15 ? 'top' : Number(tiltDeg) > 75 ? 'edge' : tiltDeg + '\u00B0';
    this.ctx.fillText(viewLabel, rx + 70, ry + 16);

    this.ctx.restore();
  }

  // ===== Helpers =====

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y); this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r); this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h); this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r); this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  private lighten(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgb(${Math.min(255, (n >> 16) + amt)},${Math.min(255, ((n >> 8) & 0xff) + amt)},${Math.min(255, (n & 0xff) + amt)})`;
  }

  private hexToRgb(hex: string): string {
    const n = parseInt(hex.replace('#', ''), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
}
