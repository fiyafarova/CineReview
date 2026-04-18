import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { CheckoutSummary, Order } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  // Базовый URL для работы с заказами.
  // Все запросы по orders идут отсюда.
  private apiUrl = 'http://localhost:8000/api/orders/';

  // Создание нового заказа.
  // Пока отправляем старый формат, без сложной checkout-логики.
  placeOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // Получение заказов текущего пользователя.
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Предпросмотр checkout.
  // Этот endpoint должен считать скидку, итоговую сумму и бонусы на backend.
  // Пока frontend уже умеет его вызывать, а backend мы подключим следующим этапом.
  previewCheckout(payload: { items: CartItem[]; promoCode?: string, bonusToSpend?: number; }): Observable<CheckoutSummary> {
    return this.http.post<CheckoutSummary>(`${this.apiUrl}checkout-preview/`, payload);
  }

  // Отмена заказа по id.
  // По ТЗ backend должен разрешать отмену только если статус = new.
  cancelOrder(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}${id}/cancel/`, {});
  }
}
