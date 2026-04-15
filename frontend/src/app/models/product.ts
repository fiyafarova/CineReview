// #st
// Контракты ниже описывают весь интерфейс товаров, который клиент получает от сервера.
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  // Изображение для галереи страницы товара.
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface ProductSpecification {
  // Отдельная строка характеристики для specs блока.
  id: number;
  name: string;
  value: string;
  sort_order: number;
}

export interface Review {
  // Формат одного пользовательского отзыва.
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Product {
  // Главная модель карточки товара для каталога, страницы товара и избранного.
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  image: string;
  brand: string;
  category: Category;
  inStock: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  isOnSale: boolean;
  isNew: boolean;
  gallery?: ProductImage[];
  specifications?: ProductSpecification[];
  reviews?: Review[];
}

export interface ProductFilters {
  // Модель параметров для фильтров каталога.
  search?: string;
  category?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  ordering?: string;
  onSale?: boolean;
}

export interface CreateReviewPayload {
  // Данные для отправки нового отзыва.
  rating: number;
  comment: string;
}