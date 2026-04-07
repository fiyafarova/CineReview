import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css'
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
        } else {
          this.errorMessage = 'Product not found.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product details. Please try again later.';
        console.error('Error loading product:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
