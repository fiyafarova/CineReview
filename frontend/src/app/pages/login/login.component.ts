import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-header">
          <div class="logo">ShopEasy</div>
          <h1>Welcome</h1>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email" id="email" name="email"
              [(ngModel)]="email" #emailField="ngModel"
              required email placeholder="your@email.com"
              [class.invalid]="emailField.invalid && emailField.touched"
            />
            @if (emailField.invalid && emailField.touched) {
              <span class="error-msg">
                @if (emailField.errors?.['required']) { Email is required }
                @else if (emailField.errors?.['email']) { Enter a valid email }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password" name="password"
                [(ngModel)]="password" #passwordField="ngModel"
                required minlength="6" placeholder="Minimum 6 characters"
                [class.invalid]="passwordField.invalid && passwordField.touched"
              />
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show️' }}
              </button>
            </div>
            @if (passwordField.invalid && passwordField.touched) {
              <span class="error-msg">
                @if (passwordField.errors?.['required']) { Password is required }
<!--                @else if (passwordField.errors?.['minlength']) { Минимум 6 символов }-->
              </span>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
            @if (isLoading) { Loading... } @else { Sign In }
          </button>

        </form>

        <div class="auth-footer">
          Don’t have an account? <a routerLink="/register">Register</a>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  private returnUrl = '/products';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/products';
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message;
        if (typeof msg === 'object') {
          const firstKey = Object.keys(msg)[0];
          this.errorMessage = msg[firstKey]?.[0] || 'Login error';
        } else {
          this.errorMessage = msg || 'Incorrect email or password';
        }
      }
    });
  }
}
