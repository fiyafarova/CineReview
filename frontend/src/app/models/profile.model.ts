export interface Profile {
  username: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  bonus_balance: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  created_at: string;
}
