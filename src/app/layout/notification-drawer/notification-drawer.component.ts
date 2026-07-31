import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductFacadeService } from '../../facades/product.facade';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop overlay -->
    @if (isOpen) {
      <div 
        (click)="closeDrawer.emit()"
        class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 transition-opacity"
      ></div>
    }

    <!-- Slide-over Drawer -->
    <div 
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen"
      class="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between"
    >
      <div>
        <!-- Drawer Header -->
        <div class="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow-amber">
              <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-slate-100">Stock Alerts & Reorder</h2>
              <p class="text-xs text-slate-400">Real-time alerts for low inventory items</p>
            </div>
          </div>
          <button (click)="closeDrawer.emit()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Alert Items Stream List -->
        <div class="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          @if ((productFacade.lowStockAlerts$ | async)?.length === 0) {
            <div class="text-center py-12 space-y-3">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-glow-emerald">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="text-slate-200 font-bold text-base">Inventory Healthy</h3>
              <p class="text-xs text-slate-400 max-w-xs mx-auto">All products have stock levels above minimum alert thresholds.</p>
            </div>
          }

          @for (item of productFacade.lowStockAlerts$ | async; track item.id) {
            <div 
              class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
            >
              <div class="flex items-center space-x-3.5">
                @if (item.image_url && !imageErrors[item.id]) {
                  <img 
                    [src]="item.image_url" 
                    [alt]="item.name"
                    (error)="onImageError(item.id)"
                    class="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                } @else {
                  <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                }
                <div>
                  <h4 class="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {{ item.name }}
                  </h4>
                  <div class="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>SKU: {{ item.sku }}</span>
                    <span>•</span>
                    <span class="text-amber-400 font-bold">
                      Stock: {{ item.current_stock }} / Min: {{ item.min_stock_alert }}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                (click)="quickReorder(item)"
                class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center shrink-0"
              >
                +20 Reorder
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="p-6 border-t border-slate-800/80 bg-slate-900/60">
        <button 
          (click)="goToStockOperations()"
          class="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all text-center block border border-slate-700/60"
        >
          View Full Stock Operations Log
        </button>
      </div>
    </div>
  `
})
export class NotificationDrawerComponent {
  @Input() isOpen = false;
  @Output() closeDrawer = new EventEmitter<void>();

  public productFacade = inject(ProductFacadeService);
  private router = inject(Router);
  imageErrors: Record<string, boolean> = {};

  onImageError(id: string): void {
    this.imageErrors[id] = true;
  }

  quickReorder(product: Product): void {
    this.productFacade.saveProduct({
      id: product.id,
      current_stock: product.current_stock + 20,
      status: 'active'
    });
    this.closeDrawer.emit();
  }

  goToStockOperations(): void {
    this.closeDrawer.emit();
    this.router.navigate(['/stock']);
  }
}
