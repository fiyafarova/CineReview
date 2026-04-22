import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) {}
  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    if (this.authService.isLoggedIn()) {
      return true; // пускаем на страницу
    }

    // Не авторизован - редирект на логин
    // передаём returnUrl чтобы после входа вернуться сюда
    this.authService.redirectToLogin(state.url);
    return false;
  }
}
