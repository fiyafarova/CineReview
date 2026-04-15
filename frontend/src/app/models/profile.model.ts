// #st
// Модели профиля и избранного приходят из пользовательского API.
export interface Profile {
  username: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  bonus_balance: number;
}

export interface WishlistItem {
  // В избранном теперь есть картинка и категория товара для полной карточки.
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image?: string;
  product_category?: string;
  created_at: string;
}
