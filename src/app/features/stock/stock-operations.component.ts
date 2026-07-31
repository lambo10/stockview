import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFacadeService } from '../../facades/product.facade';
import { StockFacadeService } from '../../facades/stock.facade';

@Component({
  selector: 'app-stock-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10 animate-fade-in">
      <!-- Header Banner -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block mb-1">INVENTORY CONTROL</span>
          <h1 class="text-3xl font-black text-slate-100">Stock Operations & Audit</h1>
          <p class="text-xs text-slate-400 mt-1">Log manual inventory adjustments, stock-in receipts, and supplier procurement</p>
        </div>

        <div class="flex items-center space-x-3">
          <button 
            (click)="activeTab = 'MOVEMENT'"
            [class.bg-gradient-to-r]="activeTab === 'MOVEMENT'"
            [class.from-cyan-600]="activeTab === 'MOVEMENT'"
            [class.to-blue-600]="activeTab === 'MOVEMENT'"
            [class.text-white]="activeTab === 'MOVEMENT'"
            [class.shadow-glow-cyan]="activeTab === 'MOVEMENT'"
            [class.bg-slate-900]="activeTab !== 'MOVEMENT'"
            [class.text-slate-400]="activeTab !== 'MOVEMENT'"
            class="px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border border-slate-800"
          >
            Stock Movements
          </button>
          
          <button 
            (click)="activeTab = 'PO'"
            [class.bg-gradient-to-r]="activeTab === 'PO'"
            [class.from-cyan-600]="activeTab === 'PO'"
            [class.to-blue-600]="activeTab === 'PO'"
            [class.text-white]="activeTab === 'PO'"
            [class.shadow-glow-cyan]="activeTab === 'PO'"
            [class.bg-slate-900]="activeTab !== 'PO'"
            [class.text-slate-400]="activeTab !== 'PO'"
            class="px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border border-slate-800"
          >
            Purchase Orders
          </button>
        </div>
      </div>

      <!-- TAB 1: MANUAL STOCK MOVEMENT -->
      @if (activeTab === 'MOVEMENT') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Stock Movement Form Card -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div class="flex items-center space-x-3.5 border-b border-slate-800/80 pb-4">
              <div class="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-glow-cyan">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-slate-100">Log Stock Adjustment</h3>
                <p class="text-[11px] text-slate-400">Record stock entry or write-off</p>
              </div>
            </div>

            <form (ngSubmit)="submitStockMovement()" class="space-y-4">
              <!-- Product Select -->
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Product *
                </label>
                <select 
                  [(ngModel)]="movementForm.product_id" 
                  name="product_id" 
                  required 
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none transition-all font-semibold"
                >
                  <option value="">-- Choose Product --</option>
                  @for (p of productFacade.products$ | async; track p.id) {
                    <option [value]="p.id">
                      {{ p.name }} (Current Stock: {{ p.current_stock }})
                    </option>
                  }
                </select>
              </div>

              <!-- Movement Type -->
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Operation Type *
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    (click)="movementForm.movement_type = 'IN'"
                    [class.bg-emerald-500]="movementForm.movement_type === 'IN'"
                    [class.text-white]="movementForm.movement_type === 'IN'"
                    [class.bg-slate-900]="movementForm.movement_type !== 'IN'"
                    [class.text-slate-400]="movementForm.movement_type !== 'IN'"
                    class="py-2.5 rounded-xl text-[11px] font-black border border-slate-800 transition-all text-center"
                  >
                    STOCK IN (+)
                  </button>

                  <button 
                    type="button"
                    (click)="movementForm.movement_type = 'OUT'"
                    [class.bg-rose-500]="movementForm.movement_type === 'OUT'"
                    [class.text-white]="movementForm.movement_type === 'OUT'"
                    [class.bg-slate-900]="movementForm.movement_type !== 'OUT'"
                    [class.text-slate-400]="movementForm.movement_type !== 'OUT'"
                    class="py-2.5 rounded-xl text-[11px] font-black border border-slate-800 transition-all text-center"
                  >
                    STOCK OUT (-)
                  </button>

                  <button 
                    type="button"
                    (click)="movementForm.movement_type = 'ADJUSTMENT'"
                    [class.bg-amber-500]="movementForm.movement_type === 'ADJUSTMENT'"
                    [class.text-white]="movementForm.movement_type === 'ADJUSTMENT'"
                    [class.bg-slate-900]="movementForm.movement_type !== 'ADJUSTMENT'"
                    [class.text-slate-400]="movementForm.movement_type !== 'ADJUSTMENT'"
                    class="py-2.5 rounded-xl text-[11px] font-black border border-slate-800 transition-all text-center"
                  >
                    ADJUST (=)
                  </button>
                </div>
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quantity *
                </label>
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="movementForm.quantity" 
                  name="quantity" 
                  required 
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <!-- Mandatory Reason Field -->
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mandatory Reason / Notes *
                </label>
                <textarea 
                  [(ngModel)]="movementForm.reason" 
                  name="reason" 
                  required 
                  rows="2" 
                  placeholder="e.g. Shipment arrival from supplier, damaged goods write-off..."
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all"
              >
                Commit Stock Adjustment
              </button>
            </form>
          </div>

          <!-- Movements Audit Table -->
          <div class="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h3 class="text-base font-extrabold text-slate-100 border-b border-slate-800/80 pb-4">
              Stock Movement Audit Trail
            </h3>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                    <th class="py-3 px-3">Date</th>
                    <th class="py-3 px-3">Product Item</th>
                    <th class="py-3 px-3 text-center">Type</th>
                    <th class="py-3 px-3 text-right">Qty</th>
                    <th class="py-3 px-3">Audit Reason</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  @for (m of stockFacade.movements$ | async; track (m.id || $index)) {
                    <tr class="hover:bg-slate-800/30 transition-colors">
                      <td class="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {{ (m.created_at | date:'short') || 'Just Now' }}
                      </td>
                      <td class="py-3.5 px-3 font-bold text-slate-200">
                        {{ m.product?.name || 'Catalog Item' }}
                      </td>
                      <td class="py-3.5 px-3 text-center whitespace-nowrap">
                        <span 
                          [class.bg-emerald-500\/10]="m.movement_type === 'IN'"
                          [class.text-emerald-400]="m.movement_type === 'IN'"
                          [class.bg-rose-500\/10]="m.movement_type === 'OUT'"
                          [class.text-rose-400]="m.movement_type === 'OUT'"
                          [class.bg-amber-500\/10]="m.movement_type === 'ADJUSTMENT'"
                          [class.text-amber-400]="m.movement_type === 'ADJUSTMENT'"
                          class="inline-flex items-center justify-center px-3 py-1 rounded-full font-extrabold text-[10px] border border-slate-800 whitespace-nowrap"
                        >
                          {{ m.movement_type }}
                        </span>
                      </td>
                      <td class="py-3.5 px-3 text-right font-mono font-black text-slate-100">
                        {{ m.quantity }}
                      </td>
                      <td class="py-3.5 px-3 text-slate-400 italic text-[11px]">
                        {{ m.reason }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: PURCHASE ORDERS -->
      @if (activeTab === 'PO') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- PO Builder Form -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h3 class="text-base font-extrabold text-slate-100 border-b border-slate-800/80 pb-4">
              Create Supplier Purchase Order
            </h3>

            <form (ngSubmit)="submitPO()" class="space-y-4">
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Supplier Vendor *
                </label>
                <select 
                  [(ngModel)]="poForm.supplier_id" 
                  name="supplier_id" 
                  required 
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none transition-all font-semibold"
                >
                  <option value="">-- Select Registered Supplier --</option>
                  @for (s of stockFacade.suppliers$ | async; track s.id) {
                    <option [value]="s.id">
                      {{ s.name }} ({{ s.contact_name }})
                    </option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Estimated Total Amount ($) *
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  [(ngModel)]="poForm.total_amount" 
                  name="total_amount" 
                  required 
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Order Notes / Specifications
                </label>
                <textarea 
                  [(ngModel)]="poForm.notes" 
                  name="notes" 
                  rows="3" 
                  placeholder="Bulk reorder of low-stock electronics..."
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all"
              >
                Issue Purchase Order
              </button>
            </form>
          </div>

          <!-- PO List -->
          <div class="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h3 class="text-base font-extrabold text-slate-100 border-b border-slate-800/80 pb-4">
              Active Supplier Purchase Orders
            </h3>

            <div class="space-y-3.5">
              @for (po of stockFacade.purchaseOrders$ | async; track (po.id || $index)) {
                <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                  <div>
                    <div class="font-mono text-sm font-extrabold text-slate-100">{{ po.po_number }}</div>
                    <div class="text-xs text-slate-400 mt-1">
                      Supplier: <span class="text-cyan-400 font-bold">{{ po.supplier?.name || 'Vendor' }}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 mt-1 italic">{{ po.notes || 'No notes' }}</div>
                  </div>

                  <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {{ po.status }}
                    </span>
                    <div class="font-mono text-lg font-black text-slate-100 mt-2">
                      \${{ po.total_amount.toFixed(2) }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class StockOperationsComponent implements OnInit {
  public productFacade = inject(ProductFacadeService);
  public stockFacade = inject(StockFacadeService);

  activeTab: 'MOVEMENT' | 'PO' = 'MOVEMENT';

  movementForm = {
    product_id: '',
    movement_type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 1,
    reason: ''
  };

  poForm = {
    supplier_id: '',
    total_amount: 0,
    notes: ''
  };

  ngOnInit(): void {
    this.productFacade.loadInitialData();
    this.stockFacade.loadData();
  }

  async submitStockMovement(): Promise<void> {
    if (!this.movementForm.product_id) {
      alert('Please choose a target product.');
      return;
    }
    const success = await this.stockFacade.logStockMovement(this.movementForm);
    if (success) {
      this.movementForm = { product_id: '', movement_type: 'IN', quantity: 1, reason: '' };
    }
  }

  async submitPO(): Promise<void> {
    if (!this.poForm.supplier_id) {
      alert('Please choose a supplier vendor.');
      return;
    }
    await this.stockFacade.createPurchaseOrder(this.poForm);
    this.poForm = { supplier_id: '', total_amount: 0, notes: '' };
  }
}
