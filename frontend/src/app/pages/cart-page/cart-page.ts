import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../service/cart.service';
import { OrderService } from '../../service/order.service';
import { CartItem } from '../../models/cart-item';
import { Order } from '../../models/order';


@Component({
  selector: 'app-cart-page',
  imports: [FormsModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  // Подключает CartService к компоненту
  private cartService = inject(CartService);
  private orderService = inject(OrderService); // страница корзины получила доступ к сервису заказов

  // Получает товары из корзины
  items = this.cartService.getItems();

  customerName = '';
  customerAddress = '';
  customerPhone = '';

  // Увеличивает количество товара на 1
  increaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty + 1);
  }

  // Уменьшает количество товара на 1
  decreaseQty(item: CartItem): void {
    this.cartService.updateQty(item.id, item.qty - 1);
  }

  // Удаляет товар из корзины
  removeItem(id: number): void {
    this.cartService.remove(id);
  }

  // Считает общую сумму всех товаров в корзине
  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.qty, 0);
  }
  placeOrder(): void{
    const newOrder: Order = {
      customerName: this.customerName,
      customerAddress: this.customerAddress,
      customerPhone: this.customerPhone,
      items: [...this.items],
      total: this.getTotal(),
    };
    this.orderService.placeOrder(newOrder).subscribe({ // он отправляет POST на Django и  subscribe() ждёт результат запроса
      next: () => {
        alert('Order placed successfully');

        this.items.length = 0; //это очищает массив корзины
        this.customerName = '';
        this.customerAddress = '';
        this.customerPhone = '';
      },
      error: () => {
        alert('Failed to place order') // показываем сообщение об ошибке
      }
    })
  }
}
// placeOrder создаётся новый объект newOrder
// туда кладутся данные из формы: customerName,customerAddress, customerPhone
// туда кладутся товары из корзины
// туда кладётся общая сумма
