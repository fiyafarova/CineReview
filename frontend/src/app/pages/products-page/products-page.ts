// #st
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Category, Product } from '../../models/product';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';
import { applyImageFallback, createProductPlaceholder } from '../../shared/image-fallback';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  selectedCategoryId: string = '';
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedOrdering: string = 'newest';
  onlyOnSale: boolean = false;

  loading: boolean = true;
  errorMessage: string = '';
  wishlistProductIds = new Set<number>();

  // Pagination state
  currentPage: number = 1;
  totalCount: number = 0;
  pageSize: number = 12;

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const pages: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // При первом входе загружаем каталог, категории и состояние избранного.
    this.loadProducts();
    this.loadCategories();
    this.loadWishlist();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;

    const filters = {
      search: this.searchTerm,
      category: this.selectedCategoryId ? Number(this.selectedCategoryId) : undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      ordering: this.selectedOrdering,
      onSale: this.onlyOnSale,
    };

    this.productService.getAll(filters, page).subscribe({
      next: (response) => {
        this.products = response.results;
        this.totalCount = response.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', error);
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadProducts(page);
  }

  loadWishlist(): void {
    // Избранное подгружаем только для авторизованного пользователя.
    if (!this.authService.isLoggedIn()) {
      this.wishlistProductIds.clear();
      return;
    }
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistProductIds = new Set(items.map((item) => item.product_id));
        this.cdr.detectChanges();
      },
      error: () => {
        this.wishlistProductIds.clear();
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    // Категории нужны только для фильтра, поэтому запрашиваем их отдельно.
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    // Любое изменение фильтра мгновенно пересчитывает видимый список.
    this.normalizePriceFilters();
    this.loadProducts(1);
  }

  resetFilters(): void {
    // Возвращаем каталог к дефолтному состоянию: все товары + сортировка newest.
    this.selectedCategoryId = '';
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedOrdering = 'newest';
    this.onlyOnSale = false;
    this.loadProducts(1);
  }

  private applyClientGuards(products: Product[]): Product[] {
    // В одном месте держим всю клиентскую фильтрацию и сортировку каталога.
    this.normalizePriceFilters();
    let filtered = [...products];

    if (this.selectedCategoryId) {
      const categoryId = Number(this.selectedCategoryId);
      filtered = filtered.filter((product) => product.category.id === categoryId);
    }

    if (this.minPrice !== null) {
      filtered = filtered.filter((product) => product.price >= this.minPrice!);
    }

    if (this.maxPrice !== null) {
      filtered = filtered.filter((product) => product.price <= this.maxPrice!);
    }

    if (this.searchTerm.trim()) {
      const query = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
      );
    }

    if (this.onlyOnSale) {
      filtered = filtered.filter((product) => product.isOnSale);
    }

    filtered.sort((left, right) => {
      // Сортировка зависит от выбранного режима в фильтрах.
      switch (this.selectedOrdering) {
        case 'price':
          return left.price - right.price;
        case '-price':
          return right.price - left.price;
        case 'name':
          return left.name.localeCompare(right.name);
        case '-name':
          return right.name.localeCompare(left.name);
        case 'rating':
          return right.rating - left.rating;
        case 'newest':
        default:
          return right.id - left.id;
      }
    });

    return filtered;
  }

  private normalizePriceFilters(): void {
    if (this.minPrice !== null) this.minPrice = Math.max(0, this.minPrice);
    if (this.maxPrice !== null) this.maxPrice = Math.max(0, this.maxPrice);
  }

  viewProduct(productId: number): void {
    // Открываем страницу конкретного товара.
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    // Добавляем товар в корзину только если он есть в наличии.
    if (!product.inStock) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.authService.redirectToLogin('/cart');
      return;
    }

    this.cartService.add({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    });
    this.toastService.showSuccess(`${product.name} was added to cart.`);
  }

  toggleWishlist(productId: number): void {
    // Одна кнопка работает и на добавление, и на удаление из избранного.
    this.errorMessage = '';

    if (!this.authService.isLoggedIn()) {
      this.authService.redirectToLogin('/wishlist');
      return;
    }

    if (this.wishlistProductIds.has(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => { this.wishlistProductIds.delete(productId); this.cdr.detectChanges(); },
        error: () => { this.errorMessage = 'Could not remove product from wishlist.'; this.cdr.detectChanges(); }
      });
      return;
    }

    this.wishlistService.addToWishlist(productId).subscribe({
      next: () => {
        this.wishlistProductIds.add(productId);
        this.toastService.showSuccess('Product was added to wishlist.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.wishlistProductIds.add(productId);
          this.toastService.showSuccess('Product is already in your wishlist.');
        } else {
          this.errorMessage = 'Please login to add products to wishlist.';
        }
        this.cdr.detectChanges();
        }
    });
  }

  isWishlisted(productId: number): boolean {
    // Нужен для активного состояния кнопки избранного в шаблоне.
    return this.wishlistProductIds.has(productId);
  }

  getStars(rating: number): string {
    // Переводим numeric rating в простую звёздную строку для карточек.
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  onImageError(event: Event): void {
    applyImageFallback(event);
  }

  getProductImage(product: Product): string {
    return product.image;
  }

  getProductFallback(product: Product): string {
    return createProductPlaceholder(product.name, product.category?.slug, product.brand);
  }
}
