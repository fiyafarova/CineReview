import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
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
