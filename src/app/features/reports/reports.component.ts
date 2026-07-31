import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardFacadeService } from '../../facades/dashboard.facade';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { Sale } from '../../core/models/sale.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10 animate-fade-in">
      <!-- Header Banner -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest block mb-1">BUSINESS INTELLIGENCE</span>
          <h1 class="text-3xl font-black text-slate-100">Reports & Export Analytics</h1>
          <p class="text-xs text-slate-400 mt-1">Filter sales transactions by date range and generate downloadable PDF & Excel reports</p>
        </div>

        <div class="flex items-center space-x-3">
          <button 
            (click)="exportExcel()" 
            class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center space-x-2"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Export Excel (.xlsx)</span>
          </button>

          <button 
            (click)="exportPDF()" 
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-violet transition-all flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      <!-- Date Filter Bar -->
      <div class="glass-panel p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center space-x-2">
          <button 
            (click)="setDateRange('TODAY')"
            [class.bg-gradient-to-r]="dateFilter === 'TODAY'"
            [class.from-violet-600]="dateFilter === 'TODAY'"
            [class.to-indigo-600]="dateFilter === 'TODAY'"
            [class.text-white]="dateFilter === 'TODAY'"
            [class.bg-slate-900]="dateFilter !== 'TODAY'"
            [class.text-slate-400]="dateFilter !== 'TODAY'"
            class="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-800 transition-all"
          >
            Today
          </button>

          <button 
            (click)="setDateRange('7DAYS')"
            [class.bg-gradient-to-r]="dateFilter === '7DAYS'"
            [class.from-violet-600]="dateFilter === '7DAYS'"
            [class.to-indigo-600]="dateFilter === '7DAYS'"
            [class.text-white]="dateFilter === '7DAYS'"
            [class.bg-slate-900]="dateFilter !== '7DAYS'"
            [class.text-slate-400]="dateFilter !== '7DAYS'"
            class="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-800 transition-all"
          >
            Last 7 Days
          </button>

          <button 
            (click)="setDateRange('MONTH')"
            [class.bg-gradient-to-r]="dateFilter === 'MONTH'"
            [class.from-violet-600]="dateFilter === 'MONTH'"
            [class.to-indigo-600]="dateFilter === 'MONTH'"
            [class.text-white]="dateFilter === 'MONTH'"
            [class.bg-slate-900]="dateFilter !== 'MONTH'"
            [class.text-slate-400]="dateFilter !== 'MONTH'"
            class="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-800 transition-all"
          >
            This Month
          </button>
        </div>

        <div class="text-xs text-slate-400 font-mono">
          Showing sales history records
        </div>
      </div>

      <!-- Sales Report Table -->
      <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">
                <th class="py-4 px-6">Sale Reference</th>
                <th class="py-4 px-4">Customer Name</th>
                <th class="py-4 px-4">Payment Method</th>
                <th class="py-4 px-4 text-right">Tax ($)</th>
                <th class="py-4 px-4 text-right">Discount ($)</th>
                <th class="py-4 px-4 text-right">Total ($)</th>
                <th class="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              @for (sale of dashboardFacade.sales$ | async; track (sale.id || $index)) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-4 px-6 font-bold text-slate-100">{{ sale.sale_number }}</td>
                  <td class="py-4 px-4 font-sans font-semibold text-slate-200">{{ sale.customer_name }}</td>
                  <td class="py-4 px-4">
                    <span class="px-2.5 py-1 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-[10px] uppercase font-bold">
                      {{ sale.payment_method }}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-right text-slate-400">\${{ sale.tax_amount.toFixed(2) }}</td>
                  <td class="py-4 px-4 text-right text-slate-400">\${{ sale.discount_amount.toFixed(2) }}</td>
                  <td class="py-4 px-4 text-right font-black text-emerald-400">\${{ sale.total_amount.toFixed(2) }}</td>
                  <td class="py-4 px-6 text-center whitespace-nowrap">
                    <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                      {{ sale.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  public dashboardFacade = inject(DashboardFacadeService);
  private pdfExport = inject(PdfExportService);

  dateFilter = 'MONTH';

  ngOnInit(): void {
    this.dashboardFacade.loadSalesData();
  }

  setDateRange(range: string): void {
    this.dateFilter = range;
  }

  exportExcel(): void {
    this.dashboardFacade.sales$.subscribe(sales => {
      const data = sales.map(s => ({
        'Invoice Ref': s.sale_number,
        Customer: s.customer_name,
        'Payment Method': s.payment_method,
        'Tax Amount ($)': s.tax_amount,
        'Discount ($)': s.discount_amount,
        'Total Amount ($)': s.total_amount,
        Status: s.status,
        Date: s.created_at || new Date().toISOString()
      }));
      this.pdfExport.exportToExcel(data, 'StockView_Sales_Report');
    });
  }

  exportPDF(): void {
    this.dashboardFacade.sales$.subscribe(sales => {
      const first = sales[0];
      if (first) {
        this.pdfExport.generateSaleInvoice(first);
      }
    });
  }
}
