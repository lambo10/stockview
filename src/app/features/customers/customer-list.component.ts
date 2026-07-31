import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  total_spent: number;
  created_at?: string;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10 animate-fade-in">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span class="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block mb-1">CLIENT DIRECTORY</span>
          <h2 class="text-3xl font-black text-slate-100">
            Customer Directory
          </h2>
          <p class="text-xs text-slate-400 mt-1">Track customer purchase history, contact profiles, and lifetime value</p>
        </div>

        <button 
          (click)="openModal()"
          class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Add New Customer</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="max-w-md">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterCustomers()"
            placeholder="Search customers by name, email or phone..."
            class="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-medium"
          />
        </div>
      </div>

      <!-- Customer Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (c of filteredCustomers(); track c.id) {
          <div class="glass-card p-6 rounded-3xl space-y-4 border border-slate-800/80 relative group hover:border-cyan-500/40 transition-all">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div class="flex items-center space-x-3.5">
                <div class="w-11 h-11 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/30 shadow-glow-cyan">
                  {{ c.full_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="text-base font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors">{{ c.full_name }}</h4>
                  <span class="text-xs text-slate-400">{{ c.email || 'No email provided' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-2.5 text-xs text-slate-300">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Phone Contact:</span>
                <span class="font-mono text-slate-200 font-bold">{{ c.phone || 'N/A' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Lifetime Spent:</span>
                <span class="font-mono font-black text-emerald-400 text-sm">\${{ (c.total_spent || 0) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (isModalOpen) {
        <div (click)="isModalOpen = false" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div (click)="$event.stopPropagation()" class="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 animate-fade-in shadow-2xl">
            <div class="border-b border-slate-800/80 pb-3">
              <h3 class="text-lg font-black text-slate-100">Add Customer Profile</h3>
              <p class="text-xs text-slate-400">Create client ledger account</p>
            </div>
            
            <form (ngSubmit)="saveCustomer()" class="space-y-4">
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input type="text" [(ngModel)]="customerForm.full_name" name="full_name" required class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" [(ngModel)]="customerForm.email" name="email" class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input type="text" [(ngModel)]="customerForm.phone" name="phone" class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none" />
              </div>

              <div class="flex justify-end space-x-3 pt-3 border-t border-slate-800/80">
                <button type="button" (click)="isModalOpen = false" class="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  private supabase = inject(SupabaseService);

  customers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);
  searchQuery = '';
  isModalOpen = false;

  customerForm: Partial<Customer> = {
    full_name: '',
    email: '',
    phone: '',
    total_spent: 0
  };

  ngOnInit(): void {
    this.loadCustomers();
  }

  async loadCustomers(): Promise<void> {
    const { data } = await this.supabase.client
      .from('stockview_customers')
      .select('*')
      .order('full_name');

    if (data) {
      this.customers.set(data as Customer[]);
      this.filteredCustomers.set(data as Customer[]);
    } else {
      // Mock seed data fallback
      const mock: Customer[] = [
        { id: '1', full_name: 'Elena Rostova', email: 'elena@example.com', phone: '+1-555-0123', total_spent: 499.98 },
        { id: '2', full_name: 'Jonathan Wick', email: 'john@example.com', phone: '+1-555-0199', total_spent: 1249.50 }
      ];
      this.customers.set(mock);
      this.filteredCustomers.set(mock);
    }
  }

  filterCustomers(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredCustomers.set(this.customers());
      return;
    }

    this.filteredCustomers.set(
      this.customers().filter(c =>
        c.full_name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
      )
    );
  }

  openModal(): void {
    this.customerForm = { full_name: '', email: '', phone: '', total_spent: 0 };
    this.isModalOpen = true;
  }

  async saveCustomer(): Promise<void> {
    if (!this.customerForm.full_name) return;

    const newCustomer: Customer = {
      id: 'c_' + Date.now(),
      full_name: this.customerForm.full_name,
      email: this.customerForm.email || '',
      phone: this.customerForm.phone || '',
      total_spent: 0
    };

    try {
      await this.supabase.client.from('stockview_customers').insert([{
        full_name: newCustomer.full_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        total_spent: 0
      }]);
    } catch (e) {
      console.warn('Customer insert note:', e);
    }

    this.customers.set([...this.customers(), newCustomer]);
    this.filterCustomers();
    this.isModalOpen = false;
  }
}
