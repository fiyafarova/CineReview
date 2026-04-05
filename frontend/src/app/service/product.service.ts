import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product, Category } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/products'; // Will be used when backend is ready

  // Mock categories
  private mockCategories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home & Garden' },
    { id: 4, name: 'Sports & Outdoors' },
    { id: 5, name: 'Books' },
    { id: 6, name: 'Beauty & Personal Care' }
  ];

  // Mock products
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: { id: 1, name: 'Electronics' },
      inStock: true
    },
    {
      id: 2,
      name: 'Smartphone 128GB',
      description: 'Latest smartphone with advanced camera, fast processor, and large display.',
      price: 699.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      category: { id: 1, name: 'Electronics' },
      inStock: true
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors.',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category: { id: 2, name: 'Clothing' },
      inStock: true
    },
    {
      id: 4,
      name: 'Running Shoes',
      description: 'Lightweight running shoes with excellent cushioning and support.',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category: { id: 4, name: 'Sports & Outdoors' },
      inStock: true
    },
    {
      id: 5,
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe and brew strength control.',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      category: { id: 3, name: 'Home & Garden' },
      inStock: true
    },
    {
      id: 6,
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat made from eco-friendly materials, 6mm thick.',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      category: { id: 4, name: 'Sports & Outdoors' },
      inStock: true
    },
    {
      id: 7,
      name: 'Novel: The Great Gatsby',
      description: 'Classic American novel by F. Scott Fitzgerald, hardcover edition.',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      category: { id: 5, name: 'Books' },
      inStock: true
    },
    {
      id: 8,
      name: 'Face Moisturizer',
      description: 'Hydrating face cream with SPF 30, suitable for all skin types.',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      category: { id: 6, name: 'Beauty & Personal Care' },
      inStock: true
    },
    {
      id: 9,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with customizable buttons and long battery life.',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: { id: 1, name: 'Electronics' },
      inStock: true
    },
    {
      id: 10,
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans with comfortable fit and durable fabric.',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      category: { id: 2, name: 'Clothing' },
      inStock: true
    },
    {
      id: 11,
      name: 'Garden Hose',
      description: 'Flexible garden hose, 50 feet long, with adjustable spray nozzle.',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      category: { id: 3, name: 'Home & Garden' },
      inStock: true
    },
    {
      id: 12,
      name: 'Basketball',
      description: 'Official size basketball with superior grip and bounce.',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
      category: { id: 4, name: 'Sports & Outdoors' },
      inStock: true
    },
    {
      id: 13,
      name: 'Cookbook: Italian Cuisine',
      description: 'Comprehensive cookbook with authentic Italian recipes and beautiful photos.',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      category: { id: 5, name: 'Books' },
      inStock: true
    },
    {
      id: 14,
      name: 'Shampoo 500ml',
      description: 'Gentle cleansing shampoo for all hair types, sulfate-free formula.',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      category: { id: 6, name: 'Beauty & Personal Care' },
      inStock: true
    },
    {
      id: 15,
      name: 'Tablet 64GB',
      description: 'Portable tablet with 10-inch display, perfect for work and entertainment.',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      category: { id: 1, name: 'Electronics' },
      inStock: true
    },
    {
      id: 16,
      name: 'Sweater',
      description: 'Warm wool blend sweater, available in various sizes and colors.',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
      category: { id: 2, name: 'Clothing' },
      inStock: true
    },
    {
      id: 17,
      name: 'Plant Pot Set',
      description: 'Set of 3 ceramic plant pots in different sizes, perfect for indoor plants.',
      price: 44.99,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
      category: { id: 3, name: 'Home & Garden' },
      inStock: true
    },
    {
      id: 18,
      name: 'Tennis Racket',
      description: 'Professional tennis racket with graphite frame and comfortable grip.',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      category: { id: 4, name: 'Sports & Outdoors' },
      inStock: true
    },
    {
      id: 19,
      name: 'Science Fiction Novel',
      description: 'Bestselling sci-fi novel with gripping storyline and memorable characters.',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      category: { id: 5, name: 'Books' },
      inStock: true
    },
    {
      id: 20,
      name: 'Lip Balm',
      description: 'Moisturizing lip balm with SPF 15, flavored with natural ingredients.',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      category: { id: 6, name: 'Beauty & Personal Care' },
      inStock: true
    }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    // For now, return mock data. Later: return this.http.get<Product[]>(`${this.apiUrl}/`);
    return of(this.mockProducts);
  }

  getById(id: number): Observable<Product | undefined> {
    // For now, return mock data. Later: return this.http.get<Product>(`${this.apiUrl}/${id}/`);
    const product = this.mockProducts.find(p => p.id === id);
    return of(product);
  }

  getByCategory(categoryId: number): Observable<Product[]> {
    // For now, return mock data. Later: return this.http.get<Product[]>(`${this.apiUrl}/?category=${categoryId}`);
    const products = this.mockProducts.filter(p => p.category.id === categoryId);
    return of(products);
  }

  getCategories(): Observable<Category[]> {
    // For now, return mock data. Later: return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
    return of(this.mockCategories);
  }
}