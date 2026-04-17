import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

// Отдельный интерфейс пользователя удобен тем,
// что его можно переиспользовать в navbar, профиле и других местах.
export interface AppUser {
  id: number;
  name: string;
  email: string;
  bonusBalance: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refresh: string;
  user: AppUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private tokenKey = 'jwt_token';
  private refreshKey = 'jwt_refresh';
  private userKey = 'current_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register/`, data).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  logout(): void {
    const refresh = localStorage.getItem(this.refreshKey);

    if (refresh) {
      this.http.post(`${this.apiUrl}/auth/logout/`, { refresh }).subscribe({
        error: () => {},
      });
    }

    this.clearSession();
    this.router.navigate(['/products']);
  }

  // После логина/регистрации сохраняем не только токены,
  // но и пользователя целиком, включая bonusBalance.
  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.refreshKey, res.refresh);
    this.saveUser(res.user);
  }

  private saveUser(user: AppUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser(): AppUser | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Этот метод нужен, чтобы подтягивать актуальный bonusBalance с backend
  // после оформления заказа или отмены заказа.
  refreshCurrentUser(): Observable<AppUser> {
    return this.http.get<{ user: AppUser }>(`${this.apiUrl}/auth/me/`).pipe(
      map((response) => response.user),
      tap((user) => this.saveUser(user)),
    );
  }
}
