import {Order} from '../models/order';
import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/orders/' // backend URL, потом просто заменим эту строку
  // Отправляет новый заказ на backend
  placeOrder(order: Order): Observable<Order>{
    return this.http.post<Order>(this.apiUrl, order);
  }
  // Получает список заказов
  getMyOrders(): Observable<Order[]>{
    return this.http.get<Order[]>(this.apiUrl);
  }
}
// HttpClient отправляет HTTP-запросы
// placeOrder() делает POST
// getMyOrders() делает GET
// Observable это результат HTTP-запроса в Angular, его потом будем обрабатывать через subscribe()
