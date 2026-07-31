import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../core/models/product.model';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div 
        (click)="closeModal.emit()"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Modal Content Container -->
        <div 
          (click)="$event.stopPropagation()"
          class="w-full max-w-2xl glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        >
          <!-- Modal Header -->
          <div class="px-6 sm:px-8 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div class="flex items-center space-x-3.5">
              <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-100">
                  {{ product?.id ? 'Edit Product Catalog Item' : 'Create New Inventory Product' }}
                </h3>
                <p class="text-xs text-slate-400">Specify SKU, barcode, stock limits, and image assets</p>
              </div>
            </div>
            <button (click)="closeModal.emit()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form Inputs Body -->
          <form (ngSubmit)="onSubmit()" class="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
            <!-- Image Drag and Drop Zone -->
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Product Image Asset
              </label>
              <div 
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event)"
                class="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 text-center bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  (change)="onFileSelected($event)" 
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                @if (!formData.image_url) {
                  <div class="space-y-2">
                    <div class="w-10 h-10 mx-auto rounded-2xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors border border-slate-700/60">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div class="text-xs text-slate-300 font-bold">
                      <span class="text-emerald-400">Click to upload</span> or drag and drop image
                    </div>
                    <div class="text-[10px] text-slate-500">PNG, JPG, WEBP up to 5MB</div>
                  </div>
                } @else {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3.5">
                      <img [src]="formData.image_url" class="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" alt="Preview" />
                      <div class="text-left">
                        <span class="text-xs font-bold text-slate-200 block">Image Uploaded</span>
                        <span class="text-[10px] text-emerald-400 font-semibold">Ready for Supabase Storage</span>
                      </div>
                    </div>
                    <button type="button" (click)="formData.image_url = ''; $event.stopPropagation()" class="px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-colors">
                      Remove
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Product Name & Category -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.name" 
                  name="name" 
                  required 
                  placeholder="e.g. Ergonomic Office Desk"
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select 
                  [(ngModel)]="formData.category_id" 
                  name="category_id" 
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 focus:border-emerald-500 focus:outline-none transition-all font-semibold"
                >
                  <option value="">-- Select Category --</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- SKU & Barcode Generator -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">SKU *</label>
                  <button type="button" (click)="generateSKU()" class="text-[11px] font-bold text-emerald-400 hover:underline">
                    Auto Generate
                  </button>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="formData.sku" 
                  name="sku" 
                  required 
                  placeholder="SKU-ELEC-101"
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Barcode (EAN-12)</label>
                  <button type="button" (click)="generateBarcode()" class="text-[11px] font-bold text-emerald-400 hover:underline">
                    Quick Barcode
                  </button>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="formData.barcode" 
                  name="barcode" 
                  placeholder="890123456789"
                  class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Prices & Stock -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cost ($)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  [(ngModel)]="formData.purchase_price" 
                  name="purchase_price" 
                  required 
                  class="w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono text-slate-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Price ($)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  [(ngModel)]="formData.selling_price" 
                  name="selling_price" 
                  required 
                  class="w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Stock
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.current_stock" 
                  name="current_stock" 
                  required 
                  class="w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono font-bold text-slate-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Min Alert
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.min_stock_alert" 
                  name="min_stock_alert" 
                  required 
                  class="w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-mono text-slate-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea 
                [(ngModel)]="formData.description" 
                name="description" 
                rows="2" 
                placeholder="Product details..."
                class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
              ></textarea>
            </div>

            <!-- Footer Action Buttons -->
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-end space-x-3">
              <button 
                type="button" 
                (click)="closeModal.emit()" 
                class="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-emerald transition-all"
              >
                {{ product?.id ? 'Save Changes' : 'Create Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<Partial<Product>>();

  private supabase = inject(SupabaseService);

  public formData: Partial<Product> = {
    name: '',
    sku: '',
    barcode: '',
    purchase_price: 0,
    selling_price: 0,
    current_stock: 10,
    min_stock_alert: 5,
    description: '',
    image_url: '',
    status: 'active'
  };

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isOpen']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (this.product) {
      this.formData = { ...this.product };
    } else {
      this.formData = {
        name: '',
        sku: '',
        barcode: '',
        purchase_price: 0,
        selling_price: 0,
        current_stock: 10,
        min_stock_alert: 5,
        description: '',
        image_url: '',
        status: 'active'
      };
    }
  }

  generateSKU(): void {
    const prefix = 'SKU-PROD';
    const rand = Math.floor(Math.random() * 8999 + 1000);
    this.formData.sku = `${prefix}-${rand}`;
  }

  generateBarcode(): void {
    this.formData.barcode = String(Math.floor(Math.random() * 900000000000 + 100000000000));
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files?.[0];
    if (file) {
      const url = await this.supabase.uploadProductImage(file);
      if (url) {
        this.formData.image_url = url;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const url = await this.supabase.uploadProductImage(file);
      if (url) {
        this.formData.image_url = url;
      }
    }
  }

  onSubmit(): void {
    this.saveProduct.emit(this.formData);
  }
}
