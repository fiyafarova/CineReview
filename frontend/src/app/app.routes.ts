import { Routes } from '@angular/router';
import {CartPage} from './pages/cart-page/cart-page';
import {OrdersPage} from './pages/orders-page/orders-page';
import {ProductsPage} from './pages/products-page/products-page';
import {ProductDetailPage} from './pages/product-detail-page/product-detail-page';

export const routes: Routes = [
  {path: '', redirectTo: 'cart', pathMatch: "full"},
  {path: 'products', component: ProductsPage},
  {path: 'products/:id', component: ProductDetailPage},
  {path: 'cart', component: CartPage},
  {path: 'orders', component: OrdersPage}
];
