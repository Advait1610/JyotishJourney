import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/users`;
  private currentUser = signal<AuthResponse | null>(null);

  isLoggedIn = computed(() => !!this.currentUser());
  user = computed(() => this.currentUser());
  isAdmin = computed(() => this.currentUser()?.email === 'naikadvait2002@gmail.com');

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('jj_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.gatewayUrl}/api/users/oauth2/google`;
  }

  handleOAuthCallback(token: string, userId: string, name: string, email: string): void {
    const response: AuthResponse = {
      token,
      userId: parseInt(userId, 10),
      fullName: name,
      email,
      avatarUrl: null
    };
    this.setSession(response);
    this.router.navigate(['/']);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/me`);
  }

  logout(): void {
    localStorage.removeItem('jj_user');
    localStorage.removeItem('jj_token');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('jj_token');
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem('jj_token', response.token);
    localStorage.setItem('jj_user', JSON.stringify(response));
    this.currentUser.set(response);
  }
}
