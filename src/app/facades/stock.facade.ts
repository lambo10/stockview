import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StockMovement, PurchaseOrder } from '../core/models/stock.model';
import { Supplier } from '../core/models/product.model';
import { SupabaseService } from '../core/services/supabase.service';
import { ProductFacadeService } from './product.facade';

@Injectable({
  providedIn: 'root'
})
export class StockFacadeService {
  private movementsSubject = new BehaviorSubject<StockMovement[]>([]);
  private purchaseOrdersSubject = new BehaviorSubject<PurchaseOrder[]>([]);
  private suppliersSubject = new BehaviorSubject<Supplier[]>([]);

  public movements$: Observable<StockMovement[]> = this.movementsSubject.asObservable();
  public purchaseOrders$: Observable<PurchaseOrder[]> = this.purchaseOrdersSubject.asObservable();
  public suppliers$: Observable<Supplier[]> = this.suppliersSubject.asObservable();

  private fallbackSuppliers: Supplier[] = [
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Apex Tech Supplies', contact_name: 'Marcus Vance', email: 'orders@apextech.com', phone: '+1 (555) 234-5678', address: '100 Silicon Way, San Jose, CA', status: 'active' },
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Urban Style Wholesalers', contact_name: 'Elena Rostova', email: 'sales@urbanstyle.com', phone: '+1 (555) 876-5432', address: '45 Garment District, New York, NY', status: 'active' },
    { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'OmniOffice Corp', contact_name: 'David Chen', email: 'supply@omnioffice.com', phone: '+1 (555) 345-6789', address: '88 Corporate Pkwy, Chicago, IL', status: 'active' }
  ];

  private fallbackMovements: StockMovement[] = [
    { id: 'm01', product_id: 'e0000001-0000-0000-0000-000000000001', movement_type: 'IN', quantity: 20, reason: 'Initial Inventory Setup', reference_number: 'INIT-001', created_at: new Date().toISOString() },
    { id: 'm02', product_id: 'e0000002-0000-0000-0000-000000000002', movement_type: 'OUT', quantity: 2, reason: 'Customer Sale (INV-2026-001)', reference_number: 'INV-2026-001', created_at: new Date().toISOString() }
  ];

  private fallbackPOs: PurchaseOrder[] = [
    { id: 'po01', po_number: 'PO-2026-101', supplier_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', supplier: this.fallbackSuppliers[0], status: 'ORDERED', total_amount: 1450.00, notes: 'Restock gaming keyboards & headphones', created_at: new Date().toISOString() }
  ];

  constructor(
    private supabase: SupabaseService,
    private productFacade: ProductFacadeService
  ) {
    this.loadData();
  }

  public loadData(): void {
    // Fetch Stock Movements
    from(this.supabase.client.from('stockview_stock_movements').select('*, product:stockview_products(*)').order('created_at', { ascending: false }))
      .pipe(
        map(({ data, error }) => (error || !data || data.length === 0) ? this.fallbackMovements : data as StockMovement[]),
        catchError(() => of(this.fallbackMovements))
      )
      .subscribe(movs => this.movementsSubject.next(movs));

    // Fetch Suppliers
    from(this.supabase.client.from('stockview_suppliers').select('*'))
      .pipe(
        map(({ data, error }) => (error || !data || data.length === 0) ? this.fallbackSuppliers : data as Supplier[]),
        catchError(() => of(this.fallbackSuppliers))
      )
      .subscribe(sups => this.suppliersSubject.next(sups));

    // Fetch Purchase Orders
    from(this.supabase.client.from('stockview_purchase_orders').select('*, supplier:stockview_suppliers(*)').order('created_at', { ascending: false }))
      .pipe(
        map(({ data, error }) => (error || !data || data.length === 0) ? this.fallbackPOs : data as PurchaseOrder[]),
        catchError(() => of(this.fallbackPOs))
      )
      .subscribe(pos => this.purchaseOrdersSubject.next(pos));
  }

  // Log manual stock movement (IN, OUT, ADJUSTMENT) with mandatory reason field
  public async logStockMovement(movement: { product_id: string; movement_type: 'IN' | 'OUT' | 'ADJUSTMENT'; quantity: number; reason: string; reference_number?: string }): Promise<boolean> {
    if (!movement.reason || movement.reason.trim() === '') {
      alert('Mandatory reason field is required for stock adjustments.');
      return false;
    }

    try {
      await this.supabase.client.from('stockview_stock_movements').insert([movement]);
    } catch (err: any) {
      console.warn('Local movement fallback:', err.message);
    }

    // Local update
    const newMov: StockMovement = {
      id: 'mov-' + Date.now(),
      ...movement,
      created_at: new Date().toISOString()
    };
    const current = [newMov, ...this.movementsSubject.getValue()];
    this.movementsSubject.next(current);

    // Update product stock level in facade
    this.productFacade.products$.subscribe(products => {
      const prod = products.find(p => p.id === movement.product_id);
      if (prod) {
        let newStock = prod.current_stock;
        if (movement.movement_type === 'IN') newStock += movement.quantity;
        else if (movement.movement_type === 'OUT') newStock = Math.max(0, newStock - movement.quantity);
        else if (movement.movement_type === 'ADJUSTMENT') newStock = Math.max(0, movement.quantity);

        this.productFacade.saveProduct({ id: prod.id, current_stock: newStock });
      }
    });

    return true;
  }

  // Create Purchase Order
  public async createPurchaseOrder(po: { supplier_id: string; total_amount: number; notes?: string }): Promise<boolean> {
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 899 + 100)}`;
    const newPO: PurchaseOrder = {
      po_number: poNumber,
      supplier_id: po.supplier_id,
      status: 'ORDERED',
      total_amount: po.total_amount,
      notes: po.notes,
      created_at: new Date().toISOString()
    };

    try {
      await this.supabase.client.from('stockview_purchase_orders').insert([{
        po_number: newPO.po_number,
        supplier_id: newPO.supplier_id,
        status: newPO.status,
        total_amount: newPO.total_amount,
        notes: newPO.notes
      }]);
    } catch (err) {
      console.warn('Local PO fallback');
    }

    const currentPOs = [newPO, ...this.purchaseOrdersSubject.getValue()];
    this.purchaseOrdersSubject.next(currentPOs);
    return true;
  }
}
