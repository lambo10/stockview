import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductFacadeService } from '../../facades/product.facade';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Backdrop Overlay for Mobile -->
    @if (isOpen) {
      <div 
        (click)="closeSidebar.emit()" 
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
      ></div>
    }

    <!-- Desktop & Mobile Floating Glass Sidebar -->
    <aside 
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      class="fixed inset-y-0 left-0 z-40 w-72 glass-panel border-r border-slate-800/80 transition-all duration-300 ease-in-out md:static md:translate-x-0 flex flex-col justify-between"
    >
      <div>
        <!-- Brand Header -->
        <div class="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div class="flex items-center space-x-3.5">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-violet shrink-0 ring-1 ring-white/20">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="text-xl font-black text-white tracking-tight">StockView</h1>
                <span class="px-1.5 py-0.5 text-[9px] font-extrabold text-violet-300 bg-violet-500/20 border border-violet-500/30 rounded-md">PRO</span>
              </div>
              <span class="text-[10px] font-bold text-violet-400/90 tracking-widest uppercase block -mt-0.5">WICKRET OS v2.5</span>
            </div>
          </div>
          <button (click)="closeSidebar.emit()" class="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-1.5">
          <div class="px-3 py-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Main Navigation</div>

          <a 
            routerLink="/dashboard" 
            routerLinkActive="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border-l-4 border-violet-500 font-semibold shadow-sm shadow-violet-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            Dashboard
          </a>

          <a 
            routerLink="/products" 
            routerLinkActive="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border-l-4 border-violet-500 font-semibold shadow-sm shadow-violet-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center justify-between px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Products Catalog
            </div>
            @if (productFacade.lowStockCountSignal() > 0) {
              <span class="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-full animate-pulse">
                {{ productFacade.lowStockCountSignal() }} Low
              </span>
            }
          </a>

          <a 
            routerLink="/pos" 
            routerLinkActive="bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-white border-l-4 border-emerald-500 font-semibold shadow-sm shadow-emerald-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center justify-between px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              Point of Sale (POS)
            </div>
            <span class="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-md">LIVE</span>
          </a>

          <a 
            routerLink="/stock" 
            routerLinkActive="bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-white border-l-4 border-cyan-500 font-semibold shadow-sm shadow-cyan-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            Stock Movements
          </a>

          <a 
            routerLink="/reports" 
            routerLinkActive="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border-l-4 border-violet-500 font-semibold shadow-sm shadow-violet-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Reports & Analytics
          </a>

          <div class="px-3 pt-4 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">CRM Management</div>

          <a 
            routerLink="/customers" 
            routerLinkActive="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border-l-4 border-violet-500 font-semibold shadow-sm shadow-violet-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Customers CRM
          </a>

          <a 
            routerLink="/suppliers" 
            routerLinkActive="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border-l-4 border-violet-500 font-semibold shadow-sm shadow-violet-500/10" 
            (click)="closeSidebar.emit()"
            class="flex items-center px-3.5 py-3 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all text-sm group"
          >
            <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01"/>
            </svg>
            Suppliers Network
          </a>
        </nav>
      </div>

      <!-- Footer System Status Module -->
      <div class="p-3.5 m-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span class="font-medium">System Status</span>
          <span class="flex items-center text-emerald-400 font-semibold text-[11px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> Supabase Sync
          </span>
        </div>
        <div class="text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Realtime DB</span>
          <span class="text-slate-400">Active</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  public productFacade = inject(ProductFacadeService);
}
