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

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage implements OnInit {
  allProducts: Product[] = [];
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
  successMessage: string = '';
  wishlistProductIds = new Set<number>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // При первом входе загружаем каталог, категории и состояние избранного.
    this.loadProducts();
    this.loadCategories();
    this.loadWishlist();
  }

  loadProducts(): void {
    // Берём полный список и локально применяем фильтры, чтобы избежать визуальных скачков в интерфейсе.
    this.loading = true;
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.products = this.applyClientGuards(products);
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
    this.products = this.applyClientGuards(this.allProducts);
  }

  resetFilters(): void {
    // Возвращаем каталог к дефолтному состоянию: все товары + сортировка newest.
    this.selectedCategoryId = '';
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedOrdering = 'newest';
    this.onlyOnSale = false;
    this.products = this.applyClientGuards(this.allProducts);
  }

  private applyClientGuards(products: Product[]): Product[] {
    // В одном месте держим всю клиентскую фильтрацию и сортировку каталога.
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

  viewProduct(productId: number): void {
    // Открываем страницу конкретного товара.
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    // Добавляем товар в корзину только если он есть в наличии.
    if (product.inStock) {
      this.cartService.add({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1
      });
      this.successMessage = `${product.name} added to cart.`;
    }
  }

  toggleWishlist(productId: number): void {
    // Одна кнопка работает и на добавление, и на удаление из избранного.
    this.successMessage = '';
    this.errorMessage = '';

    if (this.wishlistProductIds.has(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.wishlistProductIds.delete(productId);
          this.successMessage = 'Product removed from wishlist.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not remove product from wishlist.';
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.wishlistService.addToWishlist(productId).subscribe({
      next: () => {
        this.wishlistProductIds.add(productId);
        this.successMessage = 'Product added to wishlist.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.wishlistProductIds.add(productId);
          this.successMessage = 'Product is already in wishlist.';
        } else {
          this.errorMessage = 'Please login to add products to wishlist.';
          console.error(err);
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
}
