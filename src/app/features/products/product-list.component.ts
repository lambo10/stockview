import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFacadeService } from '../../facades/product.facade';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { ProductModalComponent } from './product-modal.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductModalComponent],
  template: `
    <div class="space-y-6 pb-10 animate-fade-in">
      <!-- Top Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl">
        <div>
          <span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">INVENTORY CATALOG</span>
          <h1 class="text-3xl font-black text-slate-100">Product & Stock Directory</h1>
          <p class="text-xs text-slate-400 mt-1">Manage product barcodes, pricing, category taxonomy, and live stock tracking</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- View Mode Switcher -->
          <div class="p-1 bg-slate-900 rounded-2xl border border-slate-800 flex items-center space-x-1">
            <button 
              (click)="viewMode = 'table'"
              [class.bg-violet-600]="viewMode === 'table'"
              [class.text-white]="viewMode === 'table'"
              [class.text-slate-400]="viewMode !== 'table'"
              class="p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
              title="Table View"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
            <button 
              (click)="viewMode = 'grid'"
              [class.bg-violet-600]="viewMode === 'grid'"
              [class.text-white]="viewMode === 'grid'"
              [class.text-slate-400]="viewMode !== 'grid'"
              class="p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
              title="Grid View"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
          </div>

          <!-- Excel Export -->
          <button 
            (click)="exportExcel()" 
            class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center space-x-2"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Excel</span>
          </button>

          <!-- PDF Export -->
          <button 
            (click)="exportPDF()" 
            class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center space-x-2"
          >
            <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>PDF</span>
          </button>

          <!-- Create Product Button -->
          <button 
            (click)="openCreateModal()" 
            class="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center space-x-2 cursor-pointer border border-emerald-500/30"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="text-white font-extrabold">Add New Product</span>
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative w-full md:w-96">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text"
            [ngModel]="productFacade.searchTermSignal()"
            (ngModelChange)="productFacade.setSearchTerm($event)"
            placeholder="Search product name, SKU, or barcode..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <!-- Dropdown Filters -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Category Filter -->
          <select 
            [ngModel]="productFacade.selectedCategorySignal()"
            (ngModelChange)="productFacade.setSelectedCategory($event)"
            class="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="ALL">All Categories</option>
            @for (cat of productFacade.categories$ | async; track cat.id) {
              <option [value]="cat.id">
                {{ cat.name }}
              </option>
            }
          </select>

          <!-- Status Filter -->
          <select 
            [ngModel]="productFacade.selectedStatusSignal()"
            (ngModelChange)="productFacade.setSelectedStatus($event)"
            class="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <!-- VIEW MODE: TABLE -->
      @if (viewMode === 'table') {
        <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-widest font-extrabold">
                  <th class="py-4 px-6">Product Item</th>
                  <th class="py-4 px-4">SKU / Barcode</th>
                  <th class="py-4 px-4">Category</th>
                  <th class="py-4 px-4 text-right">Cost</th>
                  <th class="py-4 px-4 text-right">Price</th>
                  <th class="py-4 px-4 text-center">Stock Level</th>
                  <th class="py-4 px-4 text-center">Status</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-800/60 text-sm">
                @for (item of productFacade.products$ | async; track item.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors group">
                    <!-- Product Details -->
                    <td class="py-4 px-6">
                      <div class="flex items-center space-x-3.5">
                        @if (item.image_url && !imageErrors[item.id]) {
                          <img 
                            [src]="item.image_url" 
                            [alt]="item.name"
                            (error)="onImageError(item.id)"
                            class="w-11 h-11 rounded-2xl object-cover border border-slate-800 shrink-0"
                          />
                        } @else {
                          <div class="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400 shrink-0 shadow-inner">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                        }
                        <div>
                          <div class="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                            {{ item.name }}
                          </div>
                          <div class="text-xs text-slate-400 truncate max-w-xs">
                            {{ item.description || 'No description provided' }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- SKU & Barcode -->
                    <td class="py-4 px-4">
                      <div class="font-mono text-xs text-slate-200 font-bold">{{ item.sku }}</div>
                      <div class="font-mono text-[10px] text-slate-500">{{ item.barcode || '—' }}</div>
                    </td>

                    <!-- Category -->
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                        {{ item.category?.name || 'Unassigned' }}
                      </span>
                    </td>

                    <!-- Cost Price -->
                    <td class="py-4 px-4 text-right font-mono text-xs text-slate-400">
                      \${{ item.purchase_price.toFixed(2) }}
                    </td>

                    <!-- Selling Price -->
                    <td class="py-4 px-4 text-right font-mono text-xs font-bold text-emerald-400">
                      \${{ item.selling_price.toFixed(2) }}
                    </td>

                    <!-- Current Stock -->
                    <td class="py-4 px-4 text-center">
                      <span class="font-mono font-black text-sm" [class.text-rose-400]="item.current_stock <= item.min_stock_alert" [class.text-emerald-400]="item.current_stock > item.min_stock_alert">
                        {{ item.current_stock }}
                      </span>
                      <span class="text-[10px] text-slate-500 block">Min: {{ item.min_stock_alert }}</span>
                    </td>

                    <!-- Dynamic Status Badge -->
                    <td class="py-4 px-4 text-center whitespace-nowrap">
                      @if (item.current_stock > item.min_stock_alert) {
                        <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          In Stock
                        </span>
                      } @else if (item.current_stock <= item.min_stock_alert && item.current_stock > 0) {
                        <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          Low Stock
                        </span>
                      } @else {
                        <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          Out of Stock
                        </span>
                      }
                    </td>

                    <!-- Action Buttons -->
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <button 
                          (click)="editProduct(item)"
                          class="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title="Edit Product"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>

                        <button 
                          (click)="deleteProduct(item.id)"
                          class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Product"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- VIEW MODE: BENTO GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (item of productFacade.products$ | async; track item.id) {
            <div class="glass-card p-5 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all group">
              <div>
                <div class="relative h-44 rounded-2xl overflow-hidden mb-4 border border-slate-800/80 bg-slate-900">
                  @if (item.image_url && !imageErrors[item.id]) {
                    <img 
                      [src]="item.image_url" 
                      [alt]="item.name"
                      (error)="onImageError(item.id)"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  } @else {
                    <div class="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-500">
                      <div class="p-3 rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-glow-violet">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                      </div>
                      <span class="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">No Image Asset</span>
                    </div>
                  }
                  <div class="absolute top-3 right-3">
                    @if (item.current_stock > item.min_stock_alert) {
                      <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/80 backdrop-blur-md text-white shadow-lg whitespace-nowrap">
                        In Stock
                      </span>
                    } @else {
                      <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/80 backdrop-blur-md text-white shadow-lg animate-pulse whitespace-nowrap">
                        Low Stock
                      </span>
                    }
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{{ item.category?.name || 'Item' }}</span>
                    <span class="text-xs font-mono text-slate-500">SKU: {{ item.sku }}</span>
                  </div>
                  <h3 class="text-base font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-slate-400 line-clamp-2">
                    {{ item.description || 'No detailed description available.' }}
                  </p>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-500 block uppercase">Price</span>
                  <span class="text-lg font-black text-emerald-400 font-mono">\${{ item.selling_price.toFixed(2) }}</span>
                </div>

                <div class="flex items-center space-x-2">
                  <button 
                    (click)="editProduct(item)"
                    class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button 
                    (click)="deleteProduct(item.id)"
                    class="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add/Edit Product Modal -->
      <app-product-modal
        [isOpen]="isModalOpen"
        [product]="selectedProduct"
        [categories]="(productFacade.categories$ | async) || []"
        (closeModal)="isModalOpen = false"
        (saveProduct)="onSaveProduct($event)"
      ></app-product-modal>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  public productFacade = inject(ProductFacadeService);
  private pdfExport = inject(PdfExportService);

  viewMode: 'table' | 'grid' = 'table';
  isModalOpen = false;
  selectedProduct: Product | null = null;
  imageErrors: Record<string, boolean> = {};

  onImageError(id: string): void {
    this.imageErrors[id] = true;
  }

  ngOnInit(): void {
    this.productFacade.loadInitialData();
  }

  openCreateModal(): void {
    this.selectedProduct = null;
    this.isModalOpen = true;
  }

  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  async onSaveProduct(product: Partial<Product>): Promise<void> {
    await this.productFacade.saveProduct(product);
    this.isModalOpen = false;
  }

  async deleteProduct(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this product catalog item?')) {
      await this.productFacade.deleteProduct(id);
    }
  }

  exportExcel(): void {
    this.productFacade.products$.subscribe(products => {
      const exportData = products.map(p => ({
        SKU: p.sku,
        Name: p.name,
        Barcode: p.barcode || '',
        Category: p.category?.name || 'Unassigned',
        'Cost Price ($)': p.purchase_price,
        'Selling Price ($)': p.selling_price,
        'Current Stock': p.current_stock,
        'Min Alert': p.min_stock_alert,
        Status: p.current_stock <= p.min_stock_alert ? 'LOW STOCK' : 'IN STOCK'
      }));
      this.pdfExport.exportToExcel(exportData, 'StockView_Products_Catalog');
    });
  }

  exportPDF(): void {
    this.productFacade.products$.subscribe(products => {
      this.pdfExport.exportInventoryReportPDF(products);
    });
  }
}
