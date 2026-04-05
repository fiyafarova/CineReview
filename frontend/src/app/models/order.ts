import { CartItem } from './cart-item';

export interface Order {
  id?: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  createdAt?: string;
}
