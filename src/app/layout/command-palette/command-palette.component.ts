import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductFacadeService } from '../../facades/product.facade';
import { ThemeService } from '../../core/services/theme.service';
import { Product } from '../../core/models/product.model';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Action' | 'Product' | 'Navigation';
  icon: string;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div 
        (click)="closeModal()"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4"
      >
        <div 
          (click)="$event.stopPropagation()"
          class="w-full max-w-2xl glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col space-y-0"
        >
          <!-- Search Header Input -->
          <div class="p-4 border-b border-slate-800/80 flex items-center space-x-3 bg-slate-900/60">
            <svg class="w-6 h-6 text-violet-400 shrink-0" style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text"
              [(ngModel)]="query"
              (ngModelChange)="filterCommands()"
              placeholder="Type a command or search products, actions... (ESC to exit)"
              class="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none"
              autoFocus
            />
            <span class="px-2 py-1 bg-slate-800 text-[10px] font-mono text-slate-400 rounded-lg border border-slate-700">ESC</span>
          </div>

          <!-- Command List Body -->
          <div class="max-h-96 overflow-y-auto p-3 space-y-1">
            @if (filteredItems.length === 0) {
              <div class="p-8 text-center text-slate-500 text-sm">
                No matching actions or products found for "{{ query }}"
              </div>
            }

            @for (item of filteredItems; track item.id) {
              <div 
                (click)="executeCommand(item)"
                class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-violet-600/10 hover:border-violet-500/30 border border-transparent cursor-pointer transition-all group"
              >
                <div class="flex items-center space-x-3.5">
                  <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-violet-500/40 group-hover:text-violet-400 text-slate-400 transition-colors">
                    <svg class="w-5 h-5" style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"/>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                      {{ item.title }}
                    </div>
                    <div class="text-xs text-slate-400">
                      {{ item.subtitle }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 group-hover:border-violet-500/30">
                    {{ item.category }}
                  </span>
                  <svg class="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            }
          </div>

          <!-- Footer Tips -->
          <div class="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center space-x-3">
              <span>Press <kbd class="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">Ctrl + K</kbd> to launch anywhere</span>
            </div>
            <span>StockView Enterprise OS</span>
          </div>
        </div>
      </div>
    }
  `
})
export class CommandPaletteComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);
  public productFacade = inject(ProductFacadeService);
  public themeService = inject(ThemeService);

  query = '';
  allItems: CommandItem[] = [];
  filteredItems: CommandItem[] = [];

  ngOnInit(): void {
    this.buildCommands();
  }

  buildCommands(): void {
    this.allItems = [
      {
        id: 'cmd-theme-toggle',
        title: 'Toggle Light / Dark Theme',
        subtitle: 'Switch between Obsidian Dark and Light Canvas appearance modes',
        category: 'Action',
        icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
        action: () => this.themeService.toggleTheme()
      },
      {
        id: 'cmd-pos',
        title: 'New Point of Sale (POS) Transaction',
        subtitle: 'Open visual register split-view & scan barcodes',
        category: 'Action',
        icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        route: '/pos'
      },
      {
        id: 'cmd-product-catalog',
        title: 'View Product Catalog (Bento Grid)',
        subtitle: 'Manage items, stock limits, prices, and barcodes',
        category: 'Navigation',
        icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
        route: '/products'
      },
      {
        id: 'cmd-customers',
        title: 'View Customers Directory',
        subtitle: 'Track lifetime value and contact details',
        category: 'Navigation',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        route: '/customers'
      },
      {
        id: 'cmd-suppliers',
        title: 'View Suppliers Directory',
        subtitle: 'Vendor contact ledger and procurement orders',
        category: 'Navigation',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        route: '/suppliers'
      },
      {
        id: 'cmd-stock-adjust',
        title: 'Manual Stock Movement (In / Out)',
        subtitle: 'Log inventory receipts, damage adjustments, or returns',
        category: 'Action',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        route: '/stock'
      },
      {
        id: 'cmd-reports',
        title: 'Export Sales & Valuation Reports',
        subtitle: 'Download PDF invoices & Excel spreadsheets',
        category: 'Navigation',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        route: '/reports'
      }
    ];

    const products = this.productFacade.getProducts();
    products.forEach((p: Product) => {
      this.allItems.push({
        id: 'prod-' + p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku} • Stock: ${p.current_stock} • Price: $${p.selling_price.toFixed(2)}`,
        category: 'Product',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        route: '/products'
      });
    });

    this.filteredItems = [...this.allItems];
  }

  filterCommands(): void {
    if (!this.query || !this.query.trim()) {
      this.filteredItems = [...this.allItems];
      return;
    }

    const q = this.query.toLowerCase().trim();
    this.filteredItems = this.allItems.filter(
      item => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }

  executeCommand(item: CommandItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      item.action();
    }
    this.closeModal();
  }

  closeModal(): void {
    this.query = '';
    this.close.emit();
  }
}
