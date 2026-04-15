// #st
import { Routes } from '@angular/router';
import { CartPage } from './pages/cart-page/cart-page';
import { OrdersPage } from './pages/orders-page/orders-page';
import { ProductsPage } from './pages/products-page/products-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';
import { ProfileComponent } from './pages/profile/profile.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
// страницы авторизации
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // публичные маршруты
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // С корня сразу уводим в каталог, чтобы пользователь видел товары без лишнего шага.
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  // Каталог и страница товара сделаны публичными для более удобного сценария просмотра.
  { path: 'products',     component: ProductsPage },
  { path: 'products/:id', component: ProductDetailPage },

  // корзина и заказы (защищённые)
  { path: 'cart',   component: CartPage,   canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersPage, canActivate: [AuthGuard] },

  //профиль и вишлист
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] },

  // Запасной маршрут тоже возвращает в каталог, чтобы пользователь не попадал на пустую страницу.
  { path: '**', redirectTo: 'products' },
];
