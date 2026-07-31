import { Product } from './product.model';

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id?: string;
  sale_number: string;
  customer_name: string;
  customer_email?: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  created_by?: string;
  created_at?: string;
  items?: SaleItem[];
}
