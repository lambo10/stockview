import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, from } from 'rxjs';
import { map, catchError, shareReplay, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SupabaseService } from '../core/services/supabase.service';
import { Product, Category } from '../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductFacadeService {
  // Local state subjects
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  private selectedCategorySubject = new BehaviorSubject<string>('ALL');
  private selectedStatusSubject = new BehaviorSubject<string>('ALL');
  private lowStockAlertsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Angular Signals for reactive local template states
  public productsSignal = signal<Product[]>([]);
  public searchTermSignal = signal<string>('');
  public selectedCategorySignal = signal<string>('ALL');
  public selectedStatusSignal = signal<string>('ALL');
  public lowStockCountSignal = computed(() => this.lowStockAlertsSubject.getValue().length);

  // Public Observables exposed via Reactive Facade
  public products$: Observable<Product[]>;
  public categories$: Observable<Category[]> = this.categoriesSubject.asObservable();
  public lowStockAlerts$: Observable<Product[]> = this.lowStockAlertsSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Initial Sample Products for offline / initial state
  private fallbackProducts: Product[] = [
    {
      id: 'e0000001-0000-0000-0000-000000000001',
      name: 'Wireless Noise-Canceling Headphones',
      sku: 'SKU-ELEC-001',
      barcode: '890123456701',
      category_id: '11111111-1111-1111-1111-111111111111',
      category: { id: '11111111-1111-1111-1111-111111111111', name: 'Electronics', slug: 'electronics' },
      description: 'Over-ear Bluetooth headphones with active noise cancellation',
      purchase_price: 120.00,
      selling_price: 249.99,
      current_stock: 18,
      min_stock_alert: 5,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      status: 'active'
    },
    {
      id: 'e0000002-0000-0000-0000-000000000002',
      name: 'Mechanical Gaming Keyboard RGB',
      sku: 'SKU-ELEC-002',
      barcode: '890123456702',
      category_id: '11111111-1111-1111-1111-111111111111',
      category: { id: '11111111-1111-1111-1111-111111111111', name: 'Electronics', slug: 'electronics' },
      description: 'Tactile mechanical switches with customizable RGB lighting',
      purchase_price: 45.00,
      selling_price: 99.50,
      current_stock: 4,
      min_stock_alert: 8,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
      status: 'active'
    },
    {
      id: 'e0000003-0000-0000-0000-000000000003',
      name: 'Ergonomic Desk Chair',
      sku: 'SKU-OFF-001',
      barcode: '890123456703',
      category_id: '33333333-3333-3333-3333-333333333333',
      category: { id: '33333333-3333-3333-3333-333333333333', name: 'Office & Stationery', slug: 'office-stationery' },
      description: 'High-back mesh chair with lumbar support',
      purchase_price: 110.00,
      selling_price: 229.00,
      current_stock: 2,
      min_stock_alert: 5,
      image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1208?w=500&q=80',
      status: 'active'
    },
    {
      id: 'e0000004-0000-0000-0000-000000000004',
      name: 'Organic Cotton Crewneck Hoodie',
      sku: 'SKU-APP-001',
      barcode: '890123456704',
      category_id: '22222222-2222-2222-2222-222222222222',
      category: { id: '22222222-2222-2222-2222-222222222222', name: 'Apparel', slug: 'apparel' },
      description: 'Heavyweight 100% organic cotton unisex hoodie',
      purchase_price: 22.00,
      selling_price: 59.99,
      current_stock: 32,
      min_stock_alert: 10,
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
      status: 'active'
    },
    {
      id: 'e0000005-0000-0000-0000-000000000005',
      name: 'Stainless Steel Insulated Tumbler 32oz',
      sku: 'SKU-BEV-001',
      barcode: '890123456705',
      category_id: '44444444-4444-4444-4444-444444444444',
      category: { id: '44444444-4444-4444-4444-444444444444', name: 'Beverages & Snacks', slug: 'beverages-snacks' },
      description: 'Double-wall vacuum insulated water bottle',
      purchase_price: 9.50,
      selling_price: 24.95,
      current_stock: 3,
      min_stock_alert: 10,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
      status: 'active'
    }
  ];

  private fallbackCategories: Category[] = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Electronics', slug: 'electronics', icon: 'cpu' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Apparel', slug: 'apparel', icon: 'shirt' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Office & Stationery', slug: 'office-stationery', icon: 'briefcase' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Beverages & Snacks', slug: 'beverages-snacks', icon: 'coffee' }
  ];

  constructor(private supabase: SupabaseService) {
    const debouncedSearch$ = this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    this.products$ = combineLatest([
      this.productsSubject.asObservable(),
      debouncedSearch$,
      this.selectedCategorySubject.asObservable(),
      this.selectedStatusSubject.asObservable()
    ]).pipe(
      map(([products, search, catId, status]) => {
        let filtered = products;

        if (search && search.trim() !== '') {
          const query = search.toLowerCase().trim();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            (p.barcode && p.barcode.toLowerCase().includes(query))
          );
        }

        if (catId && catId !== 'ALL') {
          filtered = filtered.filter(p => p.category_id === catId);
        }

        if (status && status !== 'ALL') {
          if (status === 'LOW_STOCK') {
            filtered = filtered.filter(p => p.current_stock <= p.min_stock_alert);
          } else {
            filtered = filtered.filter(p => p.status === status);
          }
        }

        return filtered;
      }),
      shareReplay(1)
    );

    this.loadInitialData();
    this.subscribeToRealtimeChanges();
  }

  // Fetch products & categories from Supabase
  public loadInitialData(): void {
    this.loadingSubject.next(true);

    from(this.supabase.client.from('stockview_products').select('*, category:stockview_categories(*)'))
      .pipe(
        map(({ data, error }) => {
          if (error || !data || data.length === 0) {
            return this.fallbackProducts;
          }
          return data as Product[];
        }),
        catchError(() => of(this.fallbackProducts))
      )
      .subscribe(products => {
        this.productsSubject.next(products);
        this.productsSignal.set(products);
        this.updateLowStockAlerts(products);
        this.loadingSubject.next(false);
      });

    from(this.supabase.client.from('stockview_categories').select('*'))
      .pipe(
        map(({ data, error }) => {
          if (error || !data || data.length === 0) {
            return this.fallbackCategories;
          }
          return data as Category[];
        }),
        catchError(() => of(this.fallbackCategories))
      )
      .subscribe(categories => {
        this.categoriesSubject.next(categories);
      });
  }

  public getProducts(): Product[] {
    return this.productsSubject.getValue();
  }

  private subscribeToRealtimeChanges(): void {
    this.supabase.client
      .channel('stockview_products_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stockview_products' },
        () => {
          this.loadInitialData();
        }
      )
      .subscribe();
  }

  private updateLowStockAlerts(products: Product[]): void {
    const lowStock = products.filter(p => p.current_stock <= p.min_stock_alert);
    this.lowStockAlertsSubject.next(lowStock);
  }

  public setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
    this.searchTermSubject.next(term);
  }

  public setSelectedCategory(catId: string): void {
    this.selectedCategorySignal.set(catId);
    this.selectedCategorySubject.next(catId);
  }

  public setSelectedStatus(status: string): void {
    this.selectedStatusSignal.set(status);
    this.selectedStatusSubject.next(status);
  }

  public async saveProduct(product: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      this.loadingSubject.next(true);

      if (product.id) {
        const { error } = await this.supabase.client
          .from('stockview_products')
          .update(product)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await this.supabase.client
          .from('stockview_products')
          .insert([product]);

        if (error) throw error;
      }

      this.loadInitialData();
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase DB product save fallback to local state:', err.message);

      const currentList = [...this.productsSubject.getValue()];
      if (product.id) {
        const index = currentList.findIndex(p => p.id === product.id);
        if (index > -1) {
          currentList[index] = { ...currentList[index], ...product } as Product;
        }
      } else {
        const newProd: Product = {
          id: 'e0000' + Math.floor(Math.random() * 899999 + 100000) + '-0000-0000-0000-000000000000',
          name: product.name || 'New Product',
          sku: product.sku || 'SKU-' + Date.now(),
          barcode: product.barcode || String(Math.floor(Math.random() * 900000000000 + 100000000000)),
          purchase_price: Number(product.purchase_price || 0),
          selling_price: Number(product.selling_price || 0),
          current_stock: Number(product.current_stock || 0),
          min_stock_alert: Number(product.min_stock_alert || 5),
          category_id: product.category_id,
          image_url: product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
          status: 'active'
        };
        currentList.unshift(newProd);
      }

      this.productsSubject.next(currentList);
      this.productsSignal.set(currentList);
      this.updateLowStockAlerts(currentList);
      this.loadingSubject.next(false);
      return { success: true };
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      await this.supabase.client.from('stockview_products').delete().eq('id', id);
    } catch (err) {
      console.warn('Local state fallback delete:', id);
    }
    const currentList = this.productsSubject.getValue().filter(p => p.id !== id);
    this.productsSubject.next(currentList);
    this.productsSignal.set(currentList);
    this.updateLowStockAlerts(currentList);
    return true;
  }
}
