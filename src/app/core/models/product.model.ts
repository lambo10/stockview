export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  category?: Category;
  description?: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_alert: number;
  image_url?: string;
  status: 'active' | 'archived' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}
