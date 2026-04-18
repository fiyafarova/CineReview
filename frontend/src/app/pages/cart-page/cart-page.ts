import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart-item';
import { CheckoutSummary, Order } from '../../models/order';
import { AuthService } from '../../service/auth.service';
import { CartService } from '../../service/cart.service';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-cart-page',
  imports: [FormsModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Текущие товары из localStorage-корзины пользователя.
  items = this.cartService.getItems();

  // Поля checkout-формы.
  customerName = '';
  customerAddress = '';
  customerPhone = '';

  // Промокод, который пользователь вводит вручную.
  promoCode = '';

  // Переключатель использования бонусов.
  // false = бонусы не тратим
  // true  = автоматически тратим весь доступный бонусный баланс
  useBonuses = false;

  // Текущая сводка checkout справа в корзине.
  // Сначала строим локально, потом уточняем через backend preview.
  summary: CheckoutSummary = this.buildLocalSummary();

  // Общее сообщение об ошибке checkout
  // (например, невалидный промокод или проблема со списанием бонусов).
  checkoutErrorMessage = '';

  // Таймер нужен, чтобы сообщение исчезало автоматически.
  private checkoutErrorTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // При открытии страницы сразу считаем checkout.
    this.refreshCheckout();
  }

  // Доступный бонусный баланс текущего пользователя.
  // Берем его из текущего пользователя, которого хранит AuthService.
  get availableBonus(): number {
    return Number((this.authService.getCurrentUser()?.bonusBalance ?? 0).toFixed(2));
  }

  // Сколько бонусов реально можно применить к заказу.
  // Логика:
  // 1. Если switch выключен -> 0
  // 2. Если включен -> берем минимум из:
  //    - доступных бонусов пользователя
  //    - суммы заказа
  //
  // Пример:
  // - бонусов 5, заказ 20 -> спишем 5
  // - бонусов 20, заказ 12 -> спишем 12
  // - бонусов 0 -> спишем 0
  private getAppliedBonus(subtotal: number): number {
    if (!this.useBonuses) {
      return 0;
    }

    return Number(Math.min(this.availableBonus, subtotal).toFixed(2));
  }

  // Локальный fallback-расчет.
  // Он нужен, чтобы UI не был пустым, пока backend еще не ответил.
  private buildLocalSummary(): CheckoutSummary {
    const subtotal = Number(
      this.items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
    );

    const spentBonus = this.getAppliedBonus(subtotal);
    const total = Number((subtotal - spentBonus).toFixed(2));

    return {
      subtotal,
      discountAmount: 0,
      spentBonus,
      total,
      earnedBonus: Number((total * 0.01).toFixed(2)),
    };
  }

  // После любого изменения корзины перечитываем items и пересчитываем checkout.
  private syncItems(): void {
    this.items = this.cartService.getItems();
    this.refreshCheckout();
  }

  // Главный метод пересчета checkout.
  // Сначала считаем локально, потом просим backend пересчитать:
  // - промокод
  // - применяемые бонусы
  // - финальный total
  // - будущие earnedBonus
  refreshCheckout(): void {
    this.summary = this.buildLocalSummary();

    if (!this.promoCode.trim() && !this.useBonuses) {
      this.clearCheckoutError();
    }

    if (this.items.length === 0) {
      return;
    }

    this.orderService
      .previewCheckout({
        items: this.items.map((item) => ({ ...item })),
        promoCode: this.promoCode.trim() || undefined,
        bonusToSpend: this.useBonuses ? this.getAppliedBonus(this.getTotal()) : undefined,
      })
      .subscribe({
        next: (response) => {
          this.clearCheckoutError();

          this.summary = {
            subtotal: Number(response.subtotal),
            discountAmount: Number(response.discountAmount),
            spentBonus: Number(response.spentBonus),
            total: Number(response.total),
            earnedBonus: Number(response.earnedBonus),
          };
        },
        error: (err) => {
          const message = this.getCheckoutErrorMessage(err);

          if (message) {
            this.showCheckoutError(message);
          }

          // Если backend preview не прошел, оставляем локальный расчет.
          this.summary = this.buildLocalSummary();
        },
      });
  }

  // Человекочитаемое сообщение об ошибке при placeOrder().
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

    const firstKey = Object.keys(payload)[0];
    if (firstKey) {
      const firstValue = payload[firstKey];
      return Array.isArray(firstValue) ? String(firstValue[0]) : String(firstValue);
    }

    return 'Failed to place order';
  }

  // Увеличение количества товара.
  increaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty + 1);
    this.syncItems();
  }

  // Уменьшение количества товара.
  // Если qty уйдет в 0, CartService сам удалит товар.
  decreaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty - 1);
    this.syncItems();
  }

  // Удаление товара из корзины.
  removeItem(id: number): void {
    this.cartService.remove(id);
    this.syncItems();
  }

  // Сумма товаров без промокода и бонусов.
  getTotal(): number {
    const total = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return Number(total.toFixed(2));
  }

  // Показ ошибки checkout на 10 секунд.
  private showCheckoutError(message: string): void {
    this.checkoutErrorMessage = message;

    if (this.checkoutErrorTimeout) {
      clearTimeout(this.checkoutErrorTimeout);
    }

    this.checkoutErrorTimeout = setTimeout(() => {
      this.checkoutErrorMessage = '';
      this.checkoutErrorTimeout = null;
    }, 10000);
  }

  private clearCheckoutError(): void {
    this.checkoutErrorMessage = '';

    if (this.checkoutErrorTimeout) {
      clearTimeout(this.checkoutErrorTimeout);
      this.checkoutErrorTimeout = null;
    }
  }

  // Извлекаем удобное сообщение из backend-ошибки previewCheckout.
  // Поддерживаем и ошибки по бонусам, и ошибки по промокоду.
  private getCheckoutErrorMessage(err: any): string {
    const payload = err?.error;

    if (!payload) {
      return '';
    }

    for (const key of ['bonusToSpend', 'promoCode', 'total', 'message']) {
      const value = payload[key];

      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }

      if (typeof value === 'string') {
        return value;
      }
    }

    return '';
  }

  // Оформление заказа.
  // В backend отправляем:
  // - customer data
  // - товары
  // - promoCode
  // - bonusToSpend (если switch включен)
  // - total, который уже был пересчитан через backend preview
  placeOrder(): void {
    const newOrder: Order = {
      customerName: this.customerName,
      customerAddress: this.customerAddress,
      customerPhone: this.customerPhone,
      items: this.items.map((item) => ({ ...item })),
      promoCode: this.promoCode.trim() || undefined,
      bonusToSpend: this.useBonuses ? this.getAppliedBonus(this.getTotal()) : undefined,
      total: this.summary.total,
    };

    this.orderService.placeOrder(newOrder).subscribe({
      next: () => {
        alert('Order placed successfully');

        // После оформления подтягиваем свежий профиль,
        // чтобы navbar и другие части UI увидели обновленный бонусный баланс.
        this.authService.refreshCurrentUser().subscribe({
          error: () => {},
        });

        this.cartService.clear();
        this.syncItems();

        this.customerName = '';
        this.customerAddress = '';
        this.customerPhone = '';
        this.promoCode = '';
        this.useBonuses = false;
        this.summary = this.buildLocalSummary();

        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        alert(this.getErrorMessage(err));
      },
    });
  }
}
