import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

export interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  created_at?: string;
}

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10 animate-fade-in">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span class="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest block mb-1">VENDOR PROCUREMENT</span>
          <h2 class="text-3xl font-black text-slate-100">
            Supplier Management
          </h2>
          <p class="text-xs text-slate-400 mt-1">Vendor profiles, procurement channels, and contact ledger</p>
        </div>

        <button 
          (click)="openModal()"
          class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-violet transition-all flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Add New Supplier</span>
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
            (ngModelChange)="filterSuppliers()"
            placeholder="Search suppliers by company or contact name..."
            class="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-medium"
          />
        </div>
      </div>

      <!-- Supplier Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (s of filteredSuppliers(); track s.id) {
          <div class="glass-card p-6 rounded-3xl space-y-4 border border-slate-800/80 relative group hover:border-violet-500/40 transition-all">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div class="flex items-center space-x-3.5">
                <div class="w-11 h-11 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-black text-sm border border-violet-500/30 shadow-glow-violet">
                  {{ s.company_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="text-base font-extrabold text-slate-100 group-hover:text-violet-400 transition-colors">{{ s.company_name }}</h4>
                  <span class="text-xs text-violet-300 font-semibold">Contact: {{ s.contact_person || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-2.5 text-xs text-slate-300">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Email:</span>
                <span class="font-mono text-slate-200 font-bold">{{ s.email || 'N/A' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Phone:</span>
                <span class="font-mono text-slate-200 font-bold">{{ s.phone || 'N/A' }}</span>
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
              <h3 class="text-lg font-black text-slate-100">Add Supplier Vendor</h3>
              <p class="text-xs text-slate-400">Create vendor ledger account</p>
            </div>
            
            <form (ngSubmit)="saveSupplier()" class="space-y-4">
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Company Name *</label>
                <input type="text" [(ngModel)]="supplierForm.company_name" name="company_name" required class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Contact Person</label>
                <input type="text" [(ngModel)]="supplierForm.contact_person" name="contact_person" class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" [(ngModel)]="supplierForm.email" name="email" class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input type="text" [(ngModel)]="supplierForm.phone" name="phone" class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-violet-500 focus:outline-none" />
              </div>

              <div class="flex justify-end space-x-3 pt-3 border-t border-slate-800/80">
                <button type="button" (click)="isModalOpen = false" class="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-violet">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  private supabase = inject(SupabaseService);

  suppliers = signal<Supplier[]>([]);
  filteredSuppliers = signal<Supplier[]>([]);
  searchQuery = '';
  isModalOpen = false;

  supplierForm: Partial<Supplier> = {
    company_name: '',
    contact_person: '',
    email: '',
    phone: ''
  };

  ngOnInit(): void {
    this.loadSuppliers();
  }

  async loadSuppliers(): Promise<void> {
    const { data } = await this.supabase.client
      .from('stockview_suppliers')
      .select('*')
      .order('company_name');

    if (data) {
      this.suppliers.set(data as Supplier[]);
      this.filteredSuppliers.set(data as Supplier[]);
    } else {
      const mock: Supplier[] = [
        { id: '1', company_name: 'Apex Tech Distribution', contact_person: 'Sarah Connor', email: 'sarah@apextech.com', phone: '+1-800-555-0199' },
        { id: '2', company_name: 'Vanguard Goods Co.', contact_person: 'David Miller', email: 'david@vanguard.org', phone: '+1-800-555-0288' }
      ];
      this.suppliers.set(mock);
      this.filteredSuppliers.set(mock);
    }
  }

  filterSuppliers(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredSuppliers.set(this.suppliers());
      return;
    }

    this.filteredSuppliers.set(
      this.suppliers().filter(s =>
        s.company_name.toLowerCase().includes(q) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q))
      )
    );
  }

  openModal(): void {
    this.supplierForm = { company_name: '', contact_person: '', email: '', phone: '' };
    this.isModalOpen = true;
  }

  async saveSupplier(): Promise<void> {
    if (!this.supplierForm.company_name) return;

    const newSupplier: Supplier = {
      id: 's_' + Date.now(),
      company_name: this.supplierForm.company_name,
      contact_person: this.supplierForm.contact_person || '',
      email: this.supplierForm.email || '',
      phone: this.supplierForm.phone || ''
    };

    try {
      await this.supabase.client.from('stockview_suppliers').insert([{
        company_name: newSupplier.company_name,
        contact_person: newSupplier.contact_person,
        email: newSupplier.email,
        phone: newSupplier.phone
      }]);
    } catch (e) {
      console.warn('Supplier insert note:', e);
    }

    this.suppliers.set([...this.suppliers(), newSupplier]);
    this.filterSuppliers();
    this.isModalOpen = false;
  }
}
