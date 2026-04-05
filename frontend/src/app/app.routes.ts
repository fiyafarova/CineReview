import { Routes } from '@angular/router';
import {CartPage} from './pages/cart-page/cart-page';
import {OrdersPage} from './pages/orders-page/orders-page';

export const routes: Routes = [
  {path: '', redirectTo: 'cart', pathMatch: "full"},
  {path: 'cart', component: CartPage},
  {path: 'orders', component: OrdersPage}
];
