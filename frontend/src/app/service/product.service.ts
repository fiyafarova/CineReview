// #st
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, CreateReviewPayload, Product, ProductFilters, Review } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Единая точка работы клиента с API товаров.
  private apiUrl = 'http://localhost:8000/api/products';

  constructor(private http: HttpClient) {}

  getAll(filters: ProductFilters = {}): Observable<Product[]> {
    // Гибко собираем параметры запроса, чтобы один метод покрывал и полный каталог, и фильтрацию.
    const params = new URLSearchParams();

    if (filters.search?.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters.category) {
      params.set('category', String(filters.category));
    }
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      params.set('min_price', String(filters.minPrice));
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      params.set('max_price', String(filters.maxPrice));
    }
    if (filters.ordering) {
      params.set('ordering', filters.ordering);
    }
    if (filters.onSale) {
      params.set('on_sale', 'true');
    }

    const suffix = params.toString();
    const url = suffix ? `${this.apiUrl}/?${suffix}` : `${this.apiUrl}/`;
    // Нормализуем числа сразу после ответа, чтобы шаблоны и сортировки работали стабильно.
    return this.http.get<Product[]>(url).pipe(map((products) => products.map((product) => this.normalizeProduct(product))));
  }

  getById(id: number): Observable<Product> {
    // Запрос страницы одного товара.
    return this.http.get<Product>(`${this.apiUrl}/${id}/`).pipe(map((product) => this.normalizeProduct(product)));
  }

  getCategories(): Observable<Category[]> {
    // Категории нужны для выпадающего фильтра каталога.
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  createReview(productId: number, payload: CreateReviewPayload): Observable<Review> {
    // Отправка нового отзыва пользователя.
    return this.http.post<Review>(`${this.apiUrl}/${productId}/reviews/`, payload);
  }

  private normalizeProduct(product: Product): Product {
    // Сервер может вернуть числовые поля строками, поэтому приводим их к удобному виду здесь.
    return {
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice !== null && product.oldPrice !== undefined ? Number(product.oldPrice) : null,
      rating: Number(product.rating ?? 0),
      stock: Number(product.stock ?? 0),
      reviewCount: Number(product.reviewCount ?? 0),
      gallery: product.gallery?.map((image) => ({ ...image })),
      specifications: product.specifications?.map((specification) => ({ ...specification })),
      reviews: product.reviews?.map((review) => ({ ...review, rating: Number(review.rating) }))
    };
  }
}