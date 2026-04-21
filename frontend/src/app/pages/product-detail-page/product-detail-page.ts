// #st
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductService} from '../../service/product.service';
import {CartService} from '../../service/cart.service';
import {Product} from '../../models/product';
import {WishlistService} from '../../service/wishlist.service';
import {AuthService} from '../../service/auth.service';
import {applyImageFallback, createProductPlaceholder} from '../../shared/image-fallback';
import {ToastService} from '../../service/toast.service';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css'
})
export class ProductDetailPage implements OnInit {
  // Всё состояние страницы товара собрано здесь: сам товар, галерея, форма отзыва и состояние избранного.
  product: Product | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  reviewRating: number = 5;
  reviewComment: string = '';
  reviewSubmitting: boolean = false;
  isWishlisted = false;
  readonly reviewStars = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // Следим за идентификатором в маршруте, чтобы страница корректно обновлялась при переходах между товарами.
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      } else {
        this.loading = false;
        this.product = null;
        this.errorMessage = 'Product not found.';
        this.cdr.detectChanges();
      }
    });
  }

  loadProduct(id: number): void {
    // Загружаем страницу товара и сразу подготавливаем главное изображение.
    this.loading = true;
    this.product = null;
    this.errorMessage = '';
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.loadWishlistState(product.id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product details. Please try again later.';
        this.loading = false;
        console.error('Error loading product:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadWishlistState(productId: number): void {
    // Отдельно отмечаем, лежит ли текущий товар в избранном.
    if (!this.authService.isLoggedIn()) {
      this.isWishlisted = false;
      this.cdr.detectChanges();
      return;
    }

    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.isWishlisted = items.some((item) => item.product_id === productId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isWishlisted = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(): void {
    // Кнопка страницы товара добавляет ровно одну позицию в корзину.
    if (!this.product || !this.product.inStock) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.authService.redirectToLogin('/cart');
      return;
    }

    this.cartService.add({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      qty: 1
    });
    this.toastService.showSuccess(`${this.product.name} was added to cart.`);
    this.cdr.detectChanges();
  }

  toggleWishlist(): void {
    // Переключаем избранное прямо на странице товара.
    if (!this.product) {
      return;
    }

    this.errorMessage = '';

    if (!this.authService.isLoggedIn()) {
      this.authService.redirectToLogin('/wishlist');
      return;
    }

    if (this.isWishlisted) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isWishlisted = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not remove product from wishlist.';
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.wishlistService.addToWishlist(this.product.id).subscribe({
      next: () => {
        this.isWishlisted = true;
        this.toastService.showSuccess('Product was added to wishlist.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error.status === 400) {
          this.isWishlisted = true;
          this.toastService.showSuccess('Product is already in your wishlist.');
        } else {
          this.errorMessage = 'Please login to add products to wishlist.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  submitReview(): void {
    // После успешной отправки отзыва локально обновляем список и средний рейтинг.
    if (!this.product || this.reviewSubmitting) {
      return;
    }

    this.reviewSubmitting = true;
    this.errorMessage = '';
    this.productService.createReview(this.product.id, {
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: (review) => {
        if (!this.product) {
          return;
        }
        this.product.reviews = [review, ...(this.product.reviews ?? [])];
        this.product.reviewCount += 1;
        const totalRating = this.product.reviews.reduce((sum, item) => sum + item.rating, 0);
        this.product.rating = totalRating / this.product.reviews.length;
        this.reviewComment = '';
        this.reviewRating = 5;
        this.toastService.showSuccess('Review added successfully.');
        this.reviewSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.non_field_errors?.[0] || 'Could not submit your review.';
        this.reviewSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStars(rating: number): string {
    // Универсальное отображение рейтинга для блока отзывов.
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  setReviewRating(star: number): void {
    // Клик по звезде задаёт будущий рейтинг в форме отзыва.
    this.reviewRating = star;
  }

  goBack(): void {
    // Возврат на общий каталог.
    this.router.navigate(['/products']);
  }

  onImageError(event: Event): void {
    applyImageFallback(event);
  }

  getProductFallback(): string {
    if (!this.product) {
      return createProductPlaceholder('ShopEasy product');
    }

    return createProductPlaceholder(this.product.name, this.product.category?.slug, this.product.brand);
  }
}
