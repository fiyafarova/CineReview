import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-header">
          <div class="logo">ShopEasy</div>
          <h1>Create an account</h1>
          <p>Register for free</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">

          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text" id="name" name="name"
              [(ngModel)]="name" #nameField="ngModel"
              required minlength="2" placeholder="Your name"
              [class.invalid]="nameField.invalid && nameField.touched"
            />
            @if (nameField.invalid && nameField.touched) {
              <span class="error-msg">
                @if (nameField.errors?.['required']) { Name is required }
                @else if (nameField.errors?.['minlength']) { Minimum 2 symbols }
              </span>
            }
          </div>

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
                @else if (emailField.errors?.['email']) { Enter a correct email }
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
                required minlength="6" placeholder="Minimum 6 symbols"
                [class.invalid]="passwordField.invalid && passwordField.touched"
              />
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (passwordField.invalid && passwordField.touched) {
              <span class="error-msg">
                @if (passwordField.errors?.['required']) { Password is required }
                @else if (passwordField.errors?.['minlength']) { Minimum 6 symbols }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль</label>
            <input
              type="password" id="confirmPassword" name="confirmPassword"
              [(ngModel)]="confirmPassword" #confirmField="ngModel"
              required placeholder="Повторите пароль"
              [class.invalid]="confirmField.touched && password !== confirmPassword"
            />
            @if (confirmField.touched && password !== confirmPassword) {
              <span class="error-msg">The passwords don't match</span>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }

          <button
            type="submit" class="btn-primary"
            [disabled]="registerForm.invalid || password !== confirmPassword || isLoading"
          >
            @if (isLoading) { Loading... } @else { Register }
          </button>

        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign In</a>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private returnUrl = '/products';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/products';
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.successMessage = 'Account is created!';
        setTimeout(() => this.router.navigateByUrl(this.returnUrl), 1000);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message;
        if (typeof msg === 'object') {
          const firstKey = Object.keys(msg)[0];
          this.errorMessage = msg[firstKey]?.[0] || 'Registration error';
        } else {
          this.errorMessage = msg || 'Registration error. Try again.';
        }
      }
    });
  }
}
