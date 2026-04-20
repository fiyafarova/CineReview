// #st
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../service/wishlist.service';
import { WishlistItem } from '../../models/profile.model';
import { applyImageFallback, createProductPlaceholder, resolveImageUrl } from '../../shared/image-fallback';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  // Здесь хранится готовый список избранных товаров пользователя.
  items: WishlistItem[] = [];
  errorMessage = '';

  constructor(private wishlistService: WishlistService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // При открытии страницы сразу подгружаем актуальное избранное.
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.items = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Could not load wishlist.';
        console.error('Ошибка загрузки вишлиста', err);
        this.cdr.detectChanges();
      }
    });
  }

  remove(productId: number) {
    // После удаления сразу чистим элемент из локального массива, чтобы UI обновился мгновенно.
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        // Оптимистичное обновление: удаляем из списка сразу после ответа.
        this.items = this.items.filter(i => i.product_id !== productId);
        this.cdr.detectChanges();
      }
    });
  }

  onImageError(event: Event): void {
    applyImageFallback(event);
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    return resolveImageUrl(imageUrl);
  }

  getImageFallback(item: WishlistItem): string {
    return createProductPlaceholder(item.product_name, item.product_category);
  }
}
