import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Временные данные корзины для тестирования
  private items: CartItem[] = [
    { id: 1, name: 'Laptop', price: 1200, qty: 1 },
    { id: 2, name: 'Mouse', price: 25, qty: 2 }
  ];

  // Возвращает все товары из корзины
  getItems(): CartItem[] {
    return this.items;
  }

  // Добавляет товар в корзину или увеличивает количество, если он уже есть
  add(product: CartItem): void {
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.qty += product.qty;
      return;
    }

    this.items.push({ ...product });
  }

  // Удаляет товар из корзины по id
  remove(id: number): void {
    const index = this.items.findIndex(item => item.id === id);

    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  // Меняет количество товара, а если количество <= 0, удаляет его
  updateQty(id: number, qty: number): void {
    const item = this.items.find(item => item.id === id);

    if (!item) {
      return;
    }

    if (qty <= 0) {
      this.remove(id);
      return;
    }

    item.qty = qty;
  }
}
