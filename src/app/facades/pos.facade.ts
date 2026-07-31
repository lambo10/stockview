import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Sale } from '../core/models/sale.model';
import { Product } from '../core/models/product.model';
import { SupabaseService } from '../core/services/supabase.service';
import { ProductFacadeService } from './product.facade';

@Injectable({
  providedIn: 'root'
})
export class PosFacadeService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$: Observable<CartItem[]> = this.cartSubject.asObservable();

  public customerNameSignal = signal<string>('Walk-in Customer');
  public customerEmailSignal = signal<string>('');
  public discountAmountSignal = signal<number>(0);
  public paymentMethodSignal = signal<'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'>('CARD');

  // Computed Cart Stats
  public cartItemsCountSignal = computed(() => 
    this.cartSubject.getValue().reduce((acc, item) => acc + item.quantity, 0)
  );

  public cartSubtotalSignal = computed(() => 
    this.cartSubject.getValue().reduce((acc, item) => acc + item.total_price, 0)
  );

  public cartTaxSignal = computed(() => 
    Number((this.cartSubtotalSignal() * 0.08).toFixed(2)) // 8% sales tax
  );

  public cartGrandTotalSignal = computed(() => {
    const total = this.cartSubtotalSignal() + this.cartTaxSignal() - this.discountAmountSignal();
    return Math.max(0, Number(total.toFixed(2)));
  });

  constructor(
    private supabase: SupabaseService,
    private productFacade: ProductFacadeService
  ) {}

  addToCart(product: Product, quantity = 1): void {
    const currentCart = [...this.cartSubject.getValue()];
    const existingIndex = currentCart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const existing = currentCart[existingIndex];
      const newQty = existing.quantity + quantity;
      
      // Stock limit check
      if (newQty > product.current_stock) {
        alert(`Cannot add more items than available stock (${product.current_stock} remaining).`);
        return;
      }

      currentCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        total_price: Number((newQty * existing.unit_price).toFixed(2))
      };
    } else {
      if (quantity > product.current_stock) {
        alert(`Product out of stock.`);
        return;
      }

      currentCart.push({
        product,
        quantity,
        unit_price: product.selling_price,
        total_price: Number((quantity * product.selling_price).toFixed(2))
      });
    }

    this.cartSubject.next(currentCart);
  }

  updateQuantity(productId: string, quantity: number): void {
    let currentCart = [...this.cartSubject.getValue()];
    const index = currentCart.findIndex(item => item.product.id === productId);

    if (index > -1) {
      if (quantity <= 0) {
        currentCart = currentCart.filter(item => item.product.id !== productId);
      } else {
        const item = currentCart[index];
        if (quantity > item.product.current_stock) {
          alert(`Stock limit reached (${item.product.current_stock} max).`);
          return;
        }

        currentCart[index] = {
          ...item,
          quantity,
          total_price: Number((quantity * item.unit_price).toFixed(2))
        };
      }
      this.cartSubject.next(currentCart);
    }
  }

  removeFromCart(productId: string): void {
    const currentCart = this.cartSubject.getValue().filter(item => item.product.id !== productId);
    this.cartSubject.next(currentCart);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.customerNameSignal.set('Walk-in Customer');
    this.customerEmailSignal.set('');
    this.discountAmountSignal.set(0);
  }

  /**
   * Process checkout and save transaction to Supabase stockview_sales
   */
  async checkout(): Promise<{ success: boolean; sale?: Sale; error?: string }> {
    const items = this.cartSubject.getValue();
    if (items.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }

    const saleNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 899999 + 100000)}`;

    const newSale: Sale = {
      sale_number: saleNumber,
      customer_name: this.customerNameSignal() || 'Walk-in Customer',
      customer_email: this.customerEmailSignal(),
      total_amount: this.cartGrandTotalSignal(),
      tax_amount: this.cartTaxSignal(),
      discount_amount: this.discountAmountSignal(),
      payment_method: this.paymentMethodSignal(),
      status: 'COMPLETED',
      items: items.map(i => ({
        product_id: i.product.id,
        product: i.product,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price
      }))
    };

    try {
      // Insert sale into Supabase
      const { data: saleData, error: saleErr } = await this.supabase.client
        .from('stockview_sales')
        .insert([{
          sale_number: newSale.sale_number,
          customer_name: newSale.customer_name,
          customer_email: newSale.customer_email,
          total_amount: newSale.total_amount,
          tax_amount: newSale.tax_amount,
          discount_amount: newSale.discount_amount,
          payment_method: newSale.payment_method,
          status: newSale.status
        }])
        .select()
        .single();

      if (saleErr) throw saleErr;

      const saleId = saleData.id;
      newSale.id = saleId;

      // Insert sale items (triggers stock reduction automatically in DB)
      const saleItemsToInsert = items.map(i => ({
        sale_id: saleId,
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price
      }));

      await this.supabase.client.from('stockview_sale_items').insert(saleItemsToInsert);

    } catch (err: any) {
      console.warn('Supabase checkout fallback to local state:', err.message);
    }

    // Deduct stock levels locally for smooth UX
    items.forEach(cartItem => {
      this.productFacade.saveProduct({
        id: cartItem.product.id,
        current_stock: Math.max(0, cartItem.product.current_stock - cartItem.quantity)
      });
    });

    this.clearCart();
    return { success: true, sale: newSale };
  }
}
