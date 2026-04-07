import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { Product, Category } from '../../models/product';

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
}
