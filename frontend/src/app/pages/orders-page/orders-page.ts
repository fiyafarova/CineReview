import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Order, OrderStatus } from '../../models/order';
import { AuthService } from '../../service/auth.service';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-orders-page',
  imports: [DatePipe, NgClass],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  orders = signal<Order[]>([]);

  // Храним id заказа, который сейчас отменяется,
  // чтобы можно было отключить кнопку и показать текст "Cancelling...".
  isCancellingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: () => {
        alert('Failed to load orders');
      },
    });
  }

  getItemsCount(order: Order): number {
    return order.items.reduce((total, item) => total + item.qty, 0);
  }

  // Разрешаем отмену только для новых заказов.
  canCancel(order: Order): boolean {
    return order.status === 'new';
  }

  // Человеко-понятная подпись статуса.
  getStatusLabel(status?: OrderStatus): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'new':
      default:
        return 'New';
    }
  }

  // CSS-класс для цветного badge.
  getStatusClass(status?: OrderStatus): string {
    switch (status) {
      case 'paid':
        return 'order-status--paid';
      case 'shipped':
        return 'order-status--shipped';
      case 'delivered':
        return 'order-status--delivered';
      case 'cancelled':
        return 'order-status--cancelled';
      case 'new':
      default:
        return 'order-status--new';
    }
  }

  cancelOrder(order: Order): void {
    if (!order.id || !this.canCancel(order)) {
      return;
    }

    const confirmed = confirm(`Cancel order #${order.id}?`);
    if (!confirmed) {
      return;
    }

    this.isCancellingId.set(order.id);

    this.orderService.cancelOrder(order.id).subscribe({
      next: (updated) => {
        // Обновляем конкретный заказ в списке,
        // чтобы не перезагружать всю страницу.
        this.orders.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );

        // После отмены заказ мог откатить бонусы,
        // поэтому синхронизируем current user.
        this.authService.refreshCurrentUser().subscribe({
          error: () => {},
        });

        this.isCancellingId.set(null);
      },
      error: () => {
        this.isCancellingId.set(null);
        alert('Failed to cancel order');
      },
    });
  }
}
