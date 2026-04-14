import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WishlistService } from '../../service/wishlist.service';
import { WishlistItem } from '../../models/profile.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {
    this.wishlistService.getWishlist().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error('Ошибка загрузки вишлиста', err)
    });
  }

  remove(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        // Оптимистичное обновление: удаляем из списка сразу после ответа
        this.items = this.items.filter(i => i.product_id !== productId);
      }
    });
  }
}
