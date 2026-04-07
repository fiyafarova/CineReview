import { Routes } from '@angular/router';
import { ProductsPage } from './pages/products-page/products-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';
// страницы авторизации
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // публичные маршруты
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // редирект с корня на products
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // каталог (защищённые)
  { path: 'products',     component: ProductsPage,      canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductDetailPage, canActivate: [AuthGuard] },

  // 404
  { path: '**', redirectTo: 'products' }
];
