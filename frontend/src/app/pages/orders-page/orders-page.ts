import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Order } from '../../models/order';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-orders-page',
  imports: [DatePipe],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {
  private orderService = inject(OrderService);

  // Хранит список заказов, полученных с backend
  orders = signal<Order[]>([]);

  // Загружает заказы при открытии страницы
  ngOnInit(): void {
    this.loadOrders();
  }

  // Отправляет GET-запрос на backend и сохраняет историю заказов
  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: () => {
        alert('Failed to load orders');
      }
    });
  }

  // Считает общее количество товаров внутри одного заказа
  getItemsCount(order: Order): number {
    return order.items.reduce((total, item) => total + item.qty, 0);
  }
}
