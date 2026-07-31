import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardFacadeService } from '../../facades/dashboard.facade';
import { ProductFacadeService } from '../../facades/product.facade';
import { StockFacadeService } from '../../facades/stock.facade';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 pb-10 animate-fade-in">
      
      <!-- Executive Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Realtime Executive Intelligence</span>
          </div>
          <h2 class="text-3xl font-black text-white tracking-tight">
            Welcome back, {{ authService.currentUserSignal()?.full_name || 'Administrator' }}
          </h2>
          <p class="text-xs text-slate-400 mt-1">Live inventory valuation, POS sales metrics, and stock movement telemetry</p>
        </div>

        <div class="flex items-center space-x-3">
          <a 
            routerLink="/pos" 
            class="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-emerald transition-all flex items-center space-x-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Launch POS Register</span>
          </a>
        </div>
      </div>

      <!-- METRICS GRID MODULES -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Module 1: Total Inventory Valuation -->
        <div class="glass-card p-6 rounded-3xl space-y-4 shadow-glow-violet relative overflow-hidden border border-violet-500/30 group">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-mono uppercase tracking-wider text-violet-300 font-bold">Inventory Valuation</span>
            <div class="p-2.5 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-white tracking-tight">
              \${{ dashboardFacade.metricsSignal().totalInventoryValue | number:'1.2-2' }}
            </div>
            <div class="flex items-center space-x-1.5 mt-2 text-xs text-violet-400 font-semibold">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span>{{ dashboardFacade.metricsSignal().totalProducts }} Total Items Cataloged</span>
            </div>
          </div>
        </div>

        <!-- Module 2: Daily Sales Revenue -->
        <div class="glass-card p-6 rounded-3xl space-y-4 shadow-glow-emerald relative overflow-hidden border border-emerald-500/30 group">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">Sales Revenue</span>
            <div class="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-white tracking-tight">
              \${{ dashboardFacade.metricsSignal().totalSalesRevenue | number:'1.2-2' }}
            </div>
            <div class="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400 font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{{ dashboardFacade.metricsSignal().totalSalesCount }} Transactions Processed</span>
            </div>
          </div>
        </div>

        <!-- Module 3: Procurement Spend -->
        <div class="glass-card p-6 rounded-3xl space-y-4 shadow-glow-cyan relative overflow-hidden border border-cyan-500/30 group">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">Procurement Spend</span>
            <div class="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-white tracking-tight">
              \${{ (dashboardFacade.metricsSignal().totalInventoryValue * 0.45) | number:'1.2-2' }}
            </div>
            <div class="flex items-center space-x-1.5 mt-2 text-xs text-cyan-400 font-semibold">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Automated Purchase Sync</span>
            </div>
          </div>
        </div>

        <!-- Module 4: Low Stock Alerts -->
        <div class="glass-card p-6 rounded-3xl space-y-4 shadow-glow-amber relative overflow-hidden border border-amber-500/30 group">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">Low Stock Alerts</span>
            <div class="p-2.5 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 animate-pulse">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-amber-400 tracking-tight">
              {{ dashboardFacade.metricsSignal().lowStockItemsCount }}
            </div>
            <div class="flex items-center space-x-1.5 mt-2 text-xs text-amber-400 font-semibold">
              @if (dashboardFacade.metricsSignal().lowStockItemsCount > 0) {
                <span>Action Required: Restock items</span>
              } @else {
                <span class="text-emerald-400">All Stock Levels Healthy</span>
              }
            </div>
          </div>
        </div>

      </div>

      <!-- MAIN BENTO GRAPH & AUDIT SECTION -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Category Breakdown & Inventory Balance -->
        <div class="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 class="text-lg font-extrabold text-slate-100">Category Distribution & Inventory Balance</h3>
              <p class="text-xs text-slate-400">Stock proportion across active categories</p>
            </div>
            <span class="px-3 py-1 bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-mono rounded-xl font-bold">
              Realtime Stream
            </span>
          </div>

          <!-- Category Progress Bars -->
          <div class="space-y-5">
            @for (cat of dashboardFacade.categoryBreakdown$ | async; track cat.categoryName) {
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-200">{{ cat.categoryName }}</span>
                  <span class="text-slate-400 font-mono">{{ cat.itemCount }} Products ({{ cat.stockCount }} units)</span>
                </div>
                <div class="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div 
                    class="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-500"
                    [style.width.%]="cat.stockCount > 0 ? (cat.stockCount / 50 * 100) : 10"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Live Realtime Audit Stream -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 class="text-lg font-extrabold text-slate-100">Live Audit Stream</h3>
              </div>
              <span class="text-xs text-slate-400 font-mono">Supabase DB</span>
            </div>

            <!-- Activity Log Items -->
            <div class="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
              @for (item of stockFacade.movements$ | async; track item.id) {
                <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-xs hover:border-slate-700 transition-all">
                  <div class="flex items-center space-x-3">
                    <div 
                      [class.bg-emerald-500]="(item.movement_type || item.type) === 'IN' || (item.movement_type || item.type) === 'stock_in' || (item.movement_type || item.type) === 'purchase'"
                      [class.bg-rose-500]="(item.movement_type || item.type) === 'OUT' || (item.movement_type || item.type) === 'stock_out' || (item.movement_type || item.type) === 'sale'"
                      [class.bg-cyan-500]="(item.movement_type || item.type) === 'ADJUSTMENT' || (item.movement_type || item.type) === 'adjustment'"
                      class="w-2.5 h-2.5 rounded-full shrink-0"
                    ></div>
                    <div>
                      <div class="font-bold text-slate-200">{{ item.product?.name || 'Inventory Update' }}</div>
                      <div class="text-[11px] text-slate-400 capitalize">{{ item.movement_type || item.type || 'Movement' }} • {{ item.reason || item.notes || 'Automated entry' }}</div>
                    </div>
                  </div>
                  <span 
                    [class.text-emerald-400]="(item.quantity_change || item.quantity || 0) > 0"
                    [class.text-rose-400]="(item.quantity_change || item.quantity || 0) < 0"
                    class="font-mono font-bold"
                  >
                    {{ (item.quantity_change || item.quantity || 0) > 0 ? '+' : '' }}{{ item.quantity_change || item.quantity || 0 }}
                  </span>
                </div>
              }
            </div>
          </div>

          <a 
            routerLink="/stock"
            class="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-center text-xs font-bold block transition-all mt-4"
          >
            View Full Stock Audit Logs →
          </a>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  public dashboardFacade = inject(DashboardFacadeService);
  public productFacade = inject(ProductFacadeService);
  public stockFacade = inject(StockFacadeService);
  public authService = inject(AuthService);

  ngOnInit(): void {
    this.dashboardFacade.refreshMetrics();
  }
}
