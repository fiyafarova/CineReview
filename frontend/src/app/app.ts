import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppUser, AuthService } from './service/auth.service';
import { ToastService } from './service/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    public authService: AuthService,
    public router: Router,
    public toastService: ToastService
  ) {
    // Если пользователь уже залогинен и перезагрузил страницу,
    // сразу подтягиваем свежие данные из backend.
    // Это полезно для bonusBalance, чтобы navbar не показывал устаревшее значение.
    if (this.authService.isLoggedIn()) {
      this.authService.refreshCurrentUser().subscribe({
        error: () => {},
      });
    }
  }

  get hideNavbar(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  // Удобный getter для template.
  get currentUser(): AppUser | null {
    return this.authService.getCurrentUser();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
