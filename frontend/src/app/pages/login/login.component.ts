import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="planets-bg">
        @for (planet of planets; track planet.name) {
          <div class="orbit" [style.width.px]="planet.orbit" [style.height.px]="planet.orbit"
               [style.animation-duration]="planet.speed + 's'">
            <div class="planet" [style.background]="planet.color" [style.width.px]="planet.size"
                 [style.height.px]="planet.size" [title]="planet.name"></div>
          </div>
        }
        <div class="sun-center"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></div>
      </div>

      <div class="auth-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to continue your celestial journey</p>

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }

        <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
          <div class="form-field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" #emailRef="ngModel"
                   placeholder="your@email.com" required email
                   [class.invalid]="emailRef.touched && emailRef.invalid" />
            @if (emailRef.touched && emailRef.errors) {
              <span class="field-error">
                @if (emailRef.errors['required']) { Email is required }
                @else if (emailRef.errors['email']) { Please enter a valid email address }
              </span>
            }
          </div>
          <div class="form-field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" #passRef="ngModel"
                   placeholder="Enter password" required minlength="1"
                   [class.invalid]="passRef.touched && passRef.invalid" />
            @if (passRef.touched && passRef.errors) {
              <span class="field-error">Password is required</span>
            }
          </div>
          <button type="submit" class="btn-primary full-width" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="btn-google" (click)="loginWithGoogle()">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 70px);
      padding: 40px 20px;
      position: relative;
      overflow: hidden;
    }

    .planets-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      pointer-events: none;
    }

    .orbit {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px solid rgba(106, 13, 173, 0.15);
      border-radius: 50%;
      animation: orbit-rotate linear infinite;
    }

    .planet {
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      box-shadow: 0 0 10px currentColor;
    }

    .sun-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      color: var(--jj-accent);
      text-shadow: 0 0 30px var(--jj-accent);
    }

    @keyframes orbit-rotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    .auth-card {
      position: relative;
      z-index: 1;
      background: rgba(18, 18, 37, 0.95);
      border: 1px solid var(--jj-border);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      backdrop-filter: blur(20px);

      h2 {
        text-align: center;
        font-size: 1.8rem;
        margin-bottom: 8px;
        background: var(--jj-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        text-align: center;
        color: var(--jj-text-muted);
        margin-bottom: 30px;
      }
    }

    .error-msg {
      background: rgba(231, 76, 60, 0.15);
      color: var(--jj-danger);
      padding: 10px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 0.9rem;
    }

    .full-width { width: 100%; }

    .divider {
      text-align: center;
      margin: 24px 0;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--jj-border);
      }

      span {
        position: relative;
        background: var(--jj-bg-card);
        padding: 0 16px;
        color: var(--jj-text-muted);
        font-size: 0.85rem;
      }
    }

    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      border-radius: 30px;
      color: var(--jj-text);
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: var(--jj-border);
        border-color: var(--jj-text-muted);
      }
    }

    .field-error {
      display: block;
      color: var(--jj-danger);
      font-size: 0.8rem;
      margin-top: 6px;
      padding-left: 4px;
    }

    input.invalid {
      border-color: var(--jj-danger) !important;
      box-shadow: 0 0 8px rgba(231, 76, 60, 0.2);
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--jj-text-muted);
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      .auth-page { padding: 20px 12px; min-height: calc(100vh - 60px); }
      .auth-card {
        padding: 24px 18px;
        border-radius: 16px;
        max-width: 100%;
      }
      .auth-card h2 { font-size: 1.4rem; }
      .auth-card .subtitle { font-size: 0.85rem; margin-bottom: 20px; }
      .planets-bg { width: 300px; height: 300px; }
      .btn-google { font-size: 0.9rem; padding: 10px; }
      .divider { margin: 18px 0; }
    }

    @media (max-width: 360px) {
      .auth-card { padding: 20px 14px; }
      .auth-card h2 { font-size: 1.2rem; }
      .planets-bg { display: none; }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      .auth-card { max-width: 380px; padding: 32px; }
      .planets-bg { width: 450px; height: 450px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  planets = [
    { name: 'Mercury', orbit: 120, size: 8, color: '#b0b0b0', speed: 8 },
    { name: 'Venus', orbit: 180, size: 10, color: '#f5c542', speed: 12 },
    { name: 'Mars', orbit: 250, size: 9, color: '#e74c3c', speed: 18 },
    { name: 'Jupiter', orbit: 340, size: 14, color: '#e67e22', speed: 25 },
    { name: 'Saturn', orbit: 430, size: 12, color: '#9b59b6', speed: 35 },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(form: any): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((c: any) => c.markAsTouched());
      return;
    }
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  loginWithGoogle(): void {
    this.auth.loginWithGoogle();
  }
}
