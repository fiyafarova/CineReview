import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Product, Category } from '../../models/product';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: string = '';
  searchTerm: string = '';
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterByCategory(): void {
    if (this.selectedCategoryId) {
      this.productService.getByCategory(+this.selectedCategoryId).subscribe({
        next: (products) => {
          this.filteredProducts = this.applySearchFilter(products);
        },
        error: (error) => {
          this.errorMessage = 'Failed to filter products by category.';
          console.error('Error filtering by category:', error);
        }
      });
    } else {
      this.filteredProducts = this.applySearchFilter(this.products);
    }
  }

  filterProducts(): void {
    this.filteredProducts = this.applySearchFilter(this.selectedCategoryId ? this.filteredProducts : this.products);
  }

  private applySearchFilter(products: Product[]): Product[] {
    if (!this.searchTerm.trim()) {
      return products;
    }
    const term = this.searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    if (product.inStock) {
      this.cartService.add({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1
      });
      // Optional: Show success message or notification
      alert(`${product.name} added to cart!`);
    }
  }

  addToWishlist(productId: number): void {
    this.wishlistService.addToWishlist(productId).subscribe({
      next: () => {
        alert('Product added to wishlist!!️');
      },
      error: (err) => {
        if (err.status === 400) {
          alert('This product is already in your wishlist');
        } else {
          alert('Please login to add products to wishlist');
          console.error(err);
        }
      }
    });
  }
}
