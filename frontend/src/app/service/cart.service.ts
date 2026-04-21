import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  constructor(private authService: AuthService) {}

  private getKey(): string {
    const user = this.authService.getCurrentUser();
    return user ? `cart_${user.id}` : 'cart_guest';
  }

  private load(): CartItem[] {
    const raw = localStorage.getItem(this.getKey());
    return raw ? JSON.parse(raw) : [];
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.getKey(), JSON.stringify(items));
  }

  getItems(): CartItem[] {
    return this.load();
  }

  add(product: CartItem): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const items = this.load();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.qty += product.qty;
    } else {
      items.push({ ...product });
    }

    this.save(items);
  }

  remove(id: number): void {
    const items = this.load().filter(item => item.id !== id);
    this.save(items);
  }

  updateQty(id: number, qty: number): void {
    if (qty <= 0) {
      this.remove(id);
      return;
    }

    const items = this.load();
    const item = items.find(item => item.id === id);
    if (item) {
      item.qty = qty;
      this.save(items);
    }
  }

  clear(): void {
    localStorage.removeItem(this.getKey());
  }
}
