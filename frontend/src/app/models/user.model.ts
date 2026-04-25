export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
