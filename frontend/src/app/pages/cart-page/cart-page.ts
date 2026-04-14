import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart-item';
import { CheckoutSummary, Order } from '../../models/order';
import { AuthService } from '../../service/auth.service';
import { CartService } from '../../service/cart.service';
import { OrderService } from '../../service/order.service';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-cart-page',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  items = this.cartService.getItems();

  customerName = '';
  customerAddress = '';
  customerPhone = '';
  promoCode = '';
  summary: CheckoutSummary = this.buildLocalSummary();
  promoErrorMessage = '';
  private promoErrorTimeout: ReturnType<typeof setTimeout> | null = null;
  constructor() {
    this.refreshCheckout();
  }

  // Локальный fallback нужен, чтобы UI не был пустым,
  // пока backend preview ещё не ответил.
  private buildLocalSummary(): CheckoutSummary {
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = Number(subtotal.toFixed(2));

    return {
      subtotal: total,
      discountAmount: 0,
      total,
      earnedBonus: Number((total * 0.01).toFixed(2)),
    };
  }

  private syncItems(): void {
    this.items = this.cartService.getItems();
    this.refreshCheckout();
  }

  // Каждый раз при изменении корзины или промокода
  // просим backend заново пересчитать checkout.
  refreshCheckout(): void {
    this.summary = this.buildLocalSummary();

    if (!this.promoCode.trim()) {
      this.clearPromoError();
    }

    if (this.items.length === 0) {
      return;
    }

    this.orderService
      .previewCheckout({
        items: this.items.map((item) => ({ ...item })),
        promoCode: this.promoCode.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.clearPromoError();

          this.summary = {
            subtotal: Number(response.subtotal),
            discountAmount: Number(response.discountAmount),
            total: Number(response.total),
            earnedBonus: Number(response.earnedBonus),
          };
        },
        error: (err) => {
          const promoError = this.getPromoErrorMessage(err);

          if (promoError) {
            this.showPromoError(promoError);
          }

          // Если промокод невалидный/неактивный,
          // оставляем локальный расчёт без скидки.
          this.summary = this.buildLocalSummary();
        },
      });
  }

  private getErrorMessage(err: any): string {
    const payload = err?.error;

    if (!payload) {
      return 'Failed to place order';
    }

    if (typeof payload.details === 'string') {
      return payload.details;
    }

    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (payload.message && typeof payload.message === 'object') {
      const firstKey = Object.keys(payload.message)[0];
      const firstValue = payload.message[firstKey];
      return Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
    }

    return 'Failed to place order';
  }

  increaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty + 1);
    this.syncItems();
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty - 1);
    this.syncItems();
  }

  removeItem(id: number): void {
    this.cartService.remove(id);
    this.syncItems();
  }

  // Старый метод можно оставить как вспомогательный локальный расчёт.
  getTotal(): number {
    const total = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return Number(total.toFixed(2));
  }
  private showPromoError(message: string): void {
    this.promoErrorMessage = message;

    if (this.promoErrorTimeout) {
      clearTimeout(this.promoErrorTimeout);
    }

    this.promoErrorTimeout = setTimeout(() => {
      this.promoErrorMessage = '';
      this.promoErrorTimeout = null;
    }, 10000);
  }

  private clearPromoError(): void {
    this.promoErrorMessage = '';

    if (this.promoErrorTimeout) {
      clearTimeout(this.promoErrorTimeout);
      this.promoErrorTimeout = null;
    }
  }

  private getPromoErrorMessage(err: any): string {
    const promoError = err?.error?.promoCode;

    if (Array.isArray(promoError) && promoError.length > 0) {
      return String(promoError[0]);
    }

    if (typeof promoError === 'string') {
      return promoError;
    }

    return '';
  }


  placeOrder(): void {
    const newOrder: Order = {
      customerName: this.customerName,
      customerAddress: this.customerAddress,
      customerPhone: this.customerPhone,
      items: this.items.map((item) => ({ ...item })),

      // Теперь отправляем промокод и итоговую сумму именно из checkout-summary,
      // а не старую локальную сумму без скидки.
      promoCode: this.promoCode.trim() || undefined,
      total: this.summary.total,
    };

    this.orderService.placeOrder(newOrder).subscribe({
      next: () => {
        alert('Order placed successfully');

        // После заказа подтягиваем свежий профиль,
        // чтобы navbar показал обновлённый bonusBalance.
        this.authService.refreshCurrentUser().subscribe({
          error: () => {},
        });

        this.cartService.clear();
        this.syncItems();

        this.customerName = '';
        this.customerAddress = '';
        this.customerPhone = '';
        this.promoCode = '';
        this.summary = this.buildLocalSummary();

        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        alert(this.getErrorMessage(err));
      },
    });
  }
}
