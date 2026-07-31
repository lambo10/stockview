import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFacadeService } from '../../facades/product.facade';
import { PosFacadeService } from '../../facades/pos.facade';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { Product } from '../../core/models/product.model';
import { Sale } from '../../core/models/sale.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 animate-fade-in">
      <!-- LEFT PANE: Product Catalog Grid & Barcode Scanner -->
      <div class="flex-1 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col min-w-0 overflow-hidden border border-slate-800">
        <!-- Header & Category Chips -->
        <div class="space-y-4 mb-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">LIVE POS TERMINAL</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold animate-pulse">
                  Barcode Scanner Active
                </span>
              </div>
              <h2 class="text-2xl font-black text-slate-100 mt-0.5">
                Point of Sale Register
              </h2>
            </div>

            <!-- Quick Barcode Buffer Display -->
            @if (barcodeBuffer) {
              <div class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-mono animate-pulse shadow-glow-amber">
                Scanning: {{ barcodeBuffer }}
              </div>
            }
          </div>

          <!-- Quick Category Filters Chips -->
          <div class="flex items-center space-x-2 overflow-x-auto pb-1">
            <button 
              (click)="productFacade.setSelectedCategory('ALL')"
              [class.bg-gradient-to-r]="productFacade.selectedCategorySignal() === 'ALL'"
              [class.from-emerald-600]="productFacade.selectedCategorySignal() === 'ALL'"
              [class.to-teal-500]="productFacade.selectedCategorySignal() === 'ALL'"
              [class.text-white]="productFacade.selectedCategorySignal() === 'ALL'"
              [class.bg-slate-900]="productFacade.selectedCategorySignal() !== 'ALL'"
              [class.text-slate-300]="productFacade.selectedCategorySignal() !== 'ALL'"
              class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border border-slate-800"
            >
              All Categories
            </button>

            @for (cat of productFacade.categories$ | async; track cat.id) {
              <button 
                (click)="productFacade.setSelectedCategory(cat.id)"
                [class.bg-gradient-to-r]="productFacade.selectedCategorySignal() === cat.id"
                [class.from-emerald-600]="productFacade.selectedCategorySignal() === cat.id"
                [class.to-teal-500]="productFacade.selectedCategorySignal() === cat.id"
                [class.text-white]="productFacade.selectedCategorySignal() === cat.id"
                [class.bg-slate-900]="productFacade.selectedCategorySignal() !== cat.id"
                [class.text-slate-300]="productFacade.selectedCategorySignal() !== cat.id"
                class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border border-slate-800"
              >
                {{ cat.name }}
              </button>
            }
          </div>
        </div>

        <!-- Product Cards Grid -->
        <div class="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (prod of productFacade.products$ | async; track prod.id) {
            <div 
              (click)="posFacade.addToCart(prod)"
              class="group glass-card rounded-2xl p-3.5 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div class="relative mb-3 overflow-hidden rounded-xl bg-slate-900 h-28 border border-slate-800">
                  @if (prod.image_url && !imageErrors[prod.id]) {
                    <img 
                      [src]="prod.image_url" 
                      [alt]="prod.name"
                      (error)="onImageError(prod.id)"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-slate-900 text-emerald-400">
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                  }
                  <span class="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-slate-300">
                    Stock: {{ prod.current_stock }}
                  </span>
                </div>

                <h4 class="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {{ prod.name }}
                </h4>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ prod.sku }}</div>
              </div>

              <div class="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                <span class="text-sm font-black text-emerald-400 font-mono">\${{ prod.selling_price.toFixed(2) }}</span>
                <span class="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all font-bold">
                  +
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- RIGHT PANE: Live POS Cart Summary -->
      <div class="w-full lg:w-96 glass-panel rounded-3xl p-6 flex flex-col justify-between border border-slate-800 shadow-2xl">
        <div>
          <!-- Cart Header -->
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 00-4z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-100">Sale Cart</h3>
                <span class="text-[10px] text-slate-400 font-mono">{{ posFacade.cartItemsCountSignal() }} Items Selected</span>
              </div>
            </div>

            <button 
              (click)="posFacade.clearCart()" 
              class="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          <!-- Customer Input -->
          <div class="space-y-2 mb-4">
            <input 
              type="text" 
              [ngModel]="posFacade.customerNameSignal()"
              (ngModelChange)="posFacade.customerNameSignal.set($event)"
              placeholder="Customer Name (Default: Walk-in Customer)"
              class="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium transition-all"
            />
          </div>

          <!-- Cart Line Items Stream -->
          <div class="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
            @if ((posFacade.cart$ | async)?.length === 0) {
              <div class="text-center py-10 space-y-2">
                <div class="w-12 h-12 mx-auto text-slate-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
                <span class="text-xs text-slate-500 block font-medium">Cart is empty. Click items to build order.</span>
              </div>
            }

            @for (item of posFacade.cart$ | async; track item.product.id) {
              <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div class="flex-1 min-w-0 pr-2">
                  <div class="text-xs font-bold text-slate-200 truncate">{{ item.product.name }}</div>
                  <div class="text-[10px] text-emerald-400 font-mono font-semibold">\${{ item.unit_price.toFixed(2) }} each</div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center space-x-2.5">
                  <div class="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                    <button 
                      (click)="posFacade.updateQuantity(item.product.id, item.quantity - 1)"
                      class="w-6 h-6 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center text-xs font-bold"
                    >
                      -
                    </button>
                    <span class="px-2 text-xs font-mono font-bold text-slate-100">{{ item.quantity }}</span>
                    <button 
                      (click)="posFacade.updateQuantity(item.product.id, item.quantity + 1)"
                      class="w-6 h-6 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div class="text-xs font-bold text-slate-100 font-mono w-14 text-right">
                    \${{ item.total_price.toFixed(2) }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Checkout Totals & Payment Method -->
        <div class="border-t border-slate-800/80 pt-4 space-y-4">
          <!-- Totals Breakdown -->
          <div class="space-y-2 text-xs text-slate-400">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-mono text-slate-200 font-semibold">\${{ posFacade.cartSubtotalSignal().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Sales Tax (8%):</span>
              <span class="font-mono text-slate-200 font-semibold">\${{ posFacade.cartTaxSignal().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Discount ($):</span>
              <input 
                type="number" 
                [ngModel]="posFacade.discountAmountSignal()"
                (ngModelChange)="posFacade.discountAmountSignal.set($event)"
                class="w-20 px-2 py-1 bg-slate-900 border border-slate-800 rounded-xl text-right text-xs text-slate-200 font-mono font-bold"
              />
            </div>
            <div class="flex justify-between items-center text-sm font-extrabold text-slate-100 pt-2 border-t border-slate-800/80">
              <span>Grand Total:</span>
              <span class="text-xl font-mono text-emerald-400 font-black">\${{ posFacade.cartGrandTotalSignal().toFixed(2) }}</span>
            </div>
          </div>

          <!-- Payment Method Picker -->
          <div class="grid grid-cols-3 gap-2">
            <button 
              (click)="posFacade.paymentMethodSignal.set('CARD')"
              [class.bg-emerald-500]="posFacade.paymentMethodSignal() === 'CARD'"
              [class.text-white]="posFacade.paymentMethodSignal() === 'CARD'"
              [class.bg-slate-900]="posFacade.paymentMethodSignal() !== 'CARD'"
              [class.text-slate-400]="posFacade.paymentMethodSignal() !== 'CARD'"
              class="py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition-all text-center"
            >
              CARD
            </button>
            <button 
              (click)="posFacade.paymentMethodSignal.set('CASH')"
              [class.bg-emerald-500]="posFacade.paymentMethodSignal() === 'CASH'"
              [class.text-white]="posFacade.paymentMethodSignal() === 'CASH'"
              [class.bg-slate-900]="posFacade.paymentMethodSignal() !== 'CASH'"
              [class.text-slate-400]="posFacade.paymentMethodSignal() !== 'CASH'"
              class="py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition-all text-center"
            >
              CASH
            </button>
            <button 
              (click)="posFacade.paymentMethodSignal.set('TRANSFER')"
              [class.bg-emerald-500]="posFacade.paymentMethodSignal() === 'TRANSFER'"
              [class.text-white]="posFacade.paymentMethodSignal() === 'TRANSFER'"
              [class.bg-slate-900]="posFacade.paymentMethodSignal() !== 'TRANSFER'"
              [class.text-slate-400]="posFacade.paymentMethodSignal() !== 'TRANSFER'"
              class="py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition-all text-center"
            >
              TRANSFER
            </button>
          </div>

          <!-- Checkout Button -->
          <button 
            (click)="processCheckout()"
            [disabled]="posFacade.cartItemsCountSignal() === 0"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold text-sm shadow-glow-emerald transition-all text-center"
          >
            Complete Sale (\${{ posFacade.cartGrandTotalSignal().toFixed(2) }})
          </button>
        </div>
      </div>
    </div>

    <!-- Completed Sale Invoice Preview Modal -->
    @if (completedSale; as sale) {
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-lg glass-panel rounded-3xl border border-slate-800 p-8 space-y-6 shadow-2xl animate-fade-in">
          <div class="text-center space-y-2 border-b border-slate-800/80 pb-5">
            <div class="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-2xl font-black text-slate-100">Transaction Completed!</h3>
            <p class="text-xs text-slate-400">Invoice Reference: <span class="font-mono text-emerald-400 font-bold">{{ sale.sale_number }}</span></p>
          </div>

          <!-- Receipt Line Summary -->
          <div class="bg-slate-900/90 rounded-2xl p-5 space-y-3 text-xs border border-slate-800">
            <div class="flex justify-between text-slate-400">
              <span>Customer:</span>
              <span class="text-slate-200 font-bold">{{ sale.customer_name }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Payment Method:</span>
              <span class="text-slate-200 font-bold uppercase">{{ sale.payment_method }}</span>
            </div>
            <div class="border-t border-slate-800 pt-3 flex justify-between text-sm font-black">
              <span>Total Paid:</span>
              <span class="text-emerald-400 font-mono text-base">\${{ sale.total_amount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <button 
              (click)="downloadPDFInvoice()"
              class="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-colors flex items-center justify-center space-x-2"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Download PDF Invoice</span>
            </button>

            <button 
              (click)="completedSale = null"
              class="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow-emerald transition-all"
            >
              Next Sale
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class PosComponent implements OnInit {
  public productFacade = inject(ProductFacadeService);
  public posFacade = inject(PosFacadeService);
  private pdfExport = inject(PdfExportService);

  completedSale: Sale | null = null;
  barcodeBuffer = '';
  private barcodeTimeout: any = null;
  imageErrors: Record<string, boolean> = {};

  onImageError(id: string): void {
    this.imageErrors[id] = true;
  }

  ngOnInit(): void {
    this.productFacade.loadInitialData();
  }

  // Rapid Barcode scanner keyboard listener
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
      return;
    }

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.trim()) {
        this.processScannedBarcode(this.barcodeBuffer.trim());
        this.barcodeBuffer = '';
      }
    } else if (event.key.length === 1) {
      this.barcodeBuffer += event.key;

      clearTimeout(this.barcodeTimeout);
      this.barcodeTimeout = setTimeout(() => {
        this.barcodeBuffer = '';
      }, 1000);
    }
  }

  private processScannedBarcode(code: string): void {
    this.productFacade.products$.subscribe(products => {
      const matched = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
      if (matched) {
        this.posFacade.addToCart(matched, 1);
      } else {
        alert(`Scanned barcode "${code}" not found in inventory catalog.`);
      }
    });
  }

  async processCheckout(): Promise<void> {
    const result = await this.posFacade.checkout();
    if (result.success && result.sale) {
      this.completedSale = result.sale;
    } else {
      alert(result.error || 'Checkout failed.');
    }
  }

  downloadPDFInvoice(): void {
    if (this.completedSale) {
      this.pdfExport.generateSaleInvoice(this.completedSale);
    }
  }
}
