import { Product, Supplier } from './product.model';

export interface StockMovement {
  id?: string;
  product_id: string;
  product?: Product;
  movement_type?: 'IN' | 'OUT' | 'ADJUSTMENT' | 'stock_in' | 'stock_out' | 'sale' | 'purchase' | 'adjustment';
  type?: string;
  quantity?: number;
  quantity_change?: number;
  reason?: string;
  notes?: string;
  reference_number?: string;
  created_by?: string;
  created_at?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  product_id: string;
  product?: Product;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  created_at?: string;
}

export interface PurchaseOrder {
  id?: string;
  po_number: string;
  supplier_id: string;
  supplier?: Supplier;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  items?: PurchaseOrderItem[];
}
