import { Component, OnInit, HostListener, ElementRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <svg class="logo-icon" viewBox="0 0 40 40" width="36" height="36">
            <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGrad)" stroke-width="2"/>
            <circle cx="20" cy="20" r="6" fill="#f39c12"/>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#f39c12" stroke-width="1.5"/>
            <line x1="20" y1="30" x2="20" y2="38" stroke="#f39c12" stroke-width="1.5"/>
            <line x1="2" y1="20" x2="10" y2="20" stroke="#f39c12" stroke-width="1.5"/>
            <line x1="30" y1="20" x2="38" y2="20" stroke="#f39c12" stroke-width="1.5"/>
            <line x1="7.3" y1="7.3" x2="13" y2="13" stroke="#9b59b6" stroke-width="1"/>
            <line x1="27" y1="27" x2="32.7" y2="32.7" stroke="#9b59b6" stroke-width="1"/>
            <line x1="32.7" y1="7.3" x2="27" y2="13" stroke="#9b59b6" stroke-width="1"/>
            <line x1="13" y1="27" x2="7.3" y2="32.7" stroke="#9b59b6" stroke-width="1"/>
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6a0dad"/>
                <stop offset="100%" stop-color="#f39c12"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">Jyotish <span class="accent">Journey</span></span>
        </a>

        <button class="mobile-toggle" (click)="menuOpen = !menuOpen">
          <span class="bar" [class.open]="menuOpen"></span>
          <span class="bar" [class.open]="menuOpen"></span>
          <span class="bar" [class.open]="menuOpen"></span>
        </button>

        <ul class="nav-links" [class.open]="menuOpen">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="menuOpen=false">Home</a></li>
          <li><a routerLink="/posts" routerLinkActive="active" (click)="menuOpen=false">All Posts</a></li>
          <li><a routerLink="/about" routerLinkActive="active" (click)="menuOpen=false">About</a></li>
          @if (auth.isLoggedIn()) {
            <li><a routerLink="/create-blog" routerLinkActive="active" (click)="menuOpen=false">Create Blog</a></li>
            @if (auth.isAdmin()) {
              <li><a routerLink="/admin" routerLinkActive="active" class="admin-link" (click)="menuOpen=false">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin
              </a></li>
            }
            <!-- Notification Bell -->
            <li class="notif-menu">
              <button class="notif-bell" (click)="toggleNotifPanel($event)">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                @if (notifService.unreadCount() > 0) {
                  <span class="notif-badge">{{ notifService.unreadCount() > 99 ? '99+' : notifService.unreadCount() }}</span>
                }
              </button>
              @if (showNotifPanel) {
                <div class="notif-panel">
                  <div class="notif-header">
                    <h4>Notifications</h4>
                    @if (notifService.unreadCount() > 0) {
                      <button class="mark-all-btn" (click)="notifService.markAllRead()">Mark all read</button>
                    }
                  </div>
                  <div class="notif-list">
                    @if (notifService.notifications().length === 0) {
                      <div class="notif-empty">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <p>No notifications yet</p>
                      </div>
                    } @else {
                      @for (n of notifService.notifications(); track n.id) {
                        <a class="notif-item" [class.unread]="!n.read" [routerLink]="['/blog', n.blogId]"
                           (click)="onNotifClick(n)">
                          <div class="notif-icon" [class.like]="n.type === 'LIKE'" [class.comment]="n.type === 'COMMENT'">
                            @if (n.type === 'LIKE') {
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            } @else {
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            }
                          </div>
                          <div class="notif-content">
                            <p class="notif-msg">{{ n.message }}</p>
                            <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
                          </div>
                          @if (!n.read) {
                            <span class="unread-dot"></span>
                          }
                        </a>
                      }
                      @if (notifService.hasMore) {
                        <button class="load-more-btn" (click)="notifService.loadMore()">Load more</button>
                      }
                    }
                  </div>
                </div>
              }
            </li>
            <li class="user-menu">
              <div class="user-avatar" (click)="showDropdown = !showDropdown">
                <span class="avatar-circle">{{ auth.user()?.fullName?.charAt(0) || 'U' }}</span>
              </div>
              @if (showDropdown) {
                <div class="dropdown" (click)="showDropdown=false">
                  <span class="dropdown-name">{{ auth.user()?.fullName }}</span>
                  <button (click)="auth.logout(); notifService.reset()">Logout</button>
                </div>
              }
            </li>
          } @else {
            <li><a routerLink="/login" routerLinkActive="active" class="btn-login" (click)="menuOpen=false">Login</a></li>
          }
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: rgba(10, 10, 26, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--jj-border);
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;

      &:hover .logo-icon { transform: rotate(30deg); }
    }

    .logo-icon { transition: transform 0.5s ease; }

    .logo-text {
      font-family: 'Cinzel', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--jj-text-bright);
    }

    .accent { color: var(--jj-accent); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
      list-style: none;

      a:not(.notif-item) {
        padding: 8px 18px;
        border-radius: 25px;
        color: var(--jj-text);
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;

        &:hover, &.active {
          color: var(--jj-accent);
          background: rgba(243, 156, 18, 0.1);
        }
      }
    }

    .btn-login {
      background: var(--jj-gradient) !important;
      color: white !important;
      padding: 8px 24px !important;
    }

    .admin-link {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--jj-accent) !important;
    }

    /* Notification Bell */
    .notif-menu { position: relative; }

    .notif-bell {
      position: relative;
      background: none;
      border: none;
      color: var(--jj-text);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--jj-accent);
        background: rgba(243, 156, 18, 0.1);
      }
    }

    .notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #e74c3c;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      pointer-events: none;
    }

    /* Notification Panel */
    .notif-panel {
      position: absolute;
      top: 50px;
      right: -60px;
      width: 380px;
      max-height: 480px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      overflow: hidden;
      z-index: 1100;
      animation: panelSlide 0.2s ease;
    }

    @keyframes panelSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--jj-border);

      h4 {
        font-family: 'Cinzel', serif;
        font-size: 1.05rem;
        color: var(--jj-text-bright);
        margin: 0;
      }
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: var(--jj-primary-light);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;

      &:hover { background: rgba(106, 13, 173, 0.1); }
    }

    .notif-list {
      max-height: 400px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--jj-border) transparent;
    }

    .notif-empty {
      padding: 40px 20px;
      text-align: center;
      color: var(--jj-text-muted);

      svg { opacity: 0.3; margin-bottom: 10px; }
      p { font-size: 0.9rem; }
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      text-decoration: none;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      transition: background 0.15s;
      cursor: pointer;
      position: relative;

      &:hover { background: rgba(255,255,255,0.03); }

      &.unread { background: rgba(106, 13, 173, 0.06); }
    }

    .notif-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.like {
        background: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
      }
      &.comment {
        background: rgba(52, 152, 219, 0.15);
        color: #3498db;
      }
    }

    .notif-content { flex: 1; min-width: 0; }

    .notif-msg {
      font-size: 0.85rem;
      color: var(--jj-text);
      line-height: 1.4;
      margin: 0 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notif-time {
      font-size: 0.75rem;
      color: var(--jj-text-muted);
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--jj-primary-light);
      flex-shrink: 0;
      margin-top: 6px;
    }

    .load-more-btn {
      width: 100%;
      padding: 12px;
      background: none;
      border: none;
      border-top: 1px solid var(--jj-border);
      color: var(--jj-primary-light);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover { background: rgba(106, 13, 173, 0.08); }
    }

    /* User Menu */
    .user-menu { position: relative; }

    .avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--jj-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: box-shadow 0.3s ease;

      &:hover { box-shadow: 0 0 15px rgba(243, 156, 18, 0.5); }
    }

    .dropdown {
      position: absolute;
      top: 50px;
      right: 0;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      border-radius: 12px;
      padding: 12px 16px;
      min-width: 160px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);

      .dropdown-name {
        display: block;
        color: var(--jj-text-bright);
        font-weight: 600;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--jj-border);
      }

      button {
        width: 100%;
        padding: 8px;
        background: rgba(231, 76, 60, 0.2);
        color: var(--jj-danger);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s;

        &:hover { background: rgba(231, 76, 60, 0.3); }
      }
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      z-index: 1001;
      -webkit-tap-highlight-color: transparent;

      .bar {
        display: block;
        width: 26px;
        height: 3px;
        background: var(--jj-text-bright);
        border-radius: 2px;
        transition: all 0.3s ease;

        &.open:nth-child(1) { transform: rotate(45deg) translate(5px, 6px); }
        &.open:nth-child(2) { opacity: 0; }
        &.open:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); }
      }
    }

    @media (max-width: 992px) {
      .mobile-toggle { display: flex !important; }

      .nav-links {
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: rgba(10, 10, 26, 0.98);
        backdrop-filter: blur(20px);
        flex-direction: column;
        padding: 0 16px;
        gap: 4px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.35s ease, padding 0.35s ease;
        border-bottom: 1px solid transparent;
        z-index: 999;

        &.open {
          max-height: 80vh;
          overflow-y: auto;
          padding: 16px;
          border-bottom-color: var(--jj-border);
        }

        li { width: 100%; list-style: none; }

        a:not(.notif-item) {
          display: block;
          width: 100%;
          padding: 14px 20px !important;
          border-radius: 12px;
          font-size: 1.05rem;
          text-align: left;
        }

        .btn-login {
          text-align: center;
          margin-top: 8px;
        }

        .notif-menu { width: 100%; }

        .notif-bell {
          width: 100%;
          justify-content: flex-start;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 1.05rem;
          gap: 10px;
          color: var(--jj-text);

          &::after {
            content: 'Notifications';
            font-weight: 500;
          }
        }

        .notif-panel {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          width: 100%;
          max-height: calc(100vh - 70px);
          border-radius: 0;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
        }

        .dropdown {
          position: static;
          box-shadow: none;
          border: none;
          background: transparent;
          padding: 0;
          min-width: auto;
        }
      }
    }

    @media (max-width: 480px) {
      .nav-container { padding: 0 12px; }
      .logo-text { font-size: 1.1rem; }
      .avatar-circle { width: 32px; height: 32px; font-size: 0.85rem; }
      .nav-links a:not(.notif-item) { padding: 12px 16px !important; font-size: 1rem; }
      .notif-panel { width: 100%; }
    }

    @media (max-width: 360px) {
      .logo-text { font-size: 1rem; }
      .logo { gap: 6px; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  showDropdown = false;
  showNotifPanel = false;

  auth = inject(AuthService);
  notifService = inject(NotificationService);
  private router = inject(Router);
  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.notifService.startPolling();
      } else {
        this.notifService.reset();
      }
    });
  }

  ngOnInit(): void {}

  toggleNotifPanel(event: Event): void {
    event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
    this.showDropdown = false;
    if (this.showNotifPanel) {
      this.notifService.loadNotifications(true);
    }
  }

  onNotifClick(n: any): void {
    if (!n.read) {
      this.notifService.markOneRead(n.id);
    }
    this.showNotifPanel = false;
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showNotifPanel = false;
      this.showDropdown = false;
    }
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
  }
}
