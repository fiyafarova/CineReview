import { CartItem } from './cart-item';

// Возможные статусы заказа.
// Нужны заранее, чтобы frontend и backend говорили на одном языке.
export type OrderStatus = 'new' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// Это объект сводки checkout.
// Его мы будем показывать справа в корзине:
// сумма товаров, скидка, итоговая сумма и бонусы.
export interface CheckoutSummary {
  subtotal: number;
  discountAmount: number;
  spentBonus: number;
  total: number;
  earnedBonus: number;
}

// Основная модель заказа.
// Здесь собраны и старые поля, и новые поля под checkout/status.
// Часть полей optional, потому что:
// 1. при создании заказа их может ещё не быть
// 2. часть полей приходит только с backend
export interface Order {
  id?: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: CartItem[];

  // Промокод можно не передавать, если пользователь его не ввёл.
  promoCode?: string;
  bonusToSpend?: number;

  // Эти поля чаще всего приходят уже после backend-расчёта.
  subtotal?: number;
  discountAmount?: number;
  spentBonus?: number;
  earnedBonus?: number;

  total: number;
  status?: OrderStatus;
  createdAt?: string;
}
