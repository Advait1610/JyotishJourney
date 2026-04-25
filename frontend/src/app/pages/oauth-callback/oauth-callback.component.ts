import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <p>Completing sign in...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 70px);
      color: var(--jj-text-muted);
      font-family: 'Lora', serif;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--jj-border);
      border-top-color: var(--jj-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['token']) {
      this.auth.handleOAuthCallback(
        params['token'],
        params['userId'],
        params['name'],
        params['email']
      );
    }
  }
}
