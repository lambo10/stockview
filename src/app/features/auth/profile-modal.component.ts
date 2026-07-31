import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, DEFAULT_USER_AVATAR } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div 
        (click)="closeModal.emit()"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <div 
          (click)="$event.stopPropagation()"
          class="w-full max-w-md glass-panel rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div class="flex items-center space-x-3.5">
              <div class="p-2.5 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-glow-violet">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-100">User Profile Settings</h3>
                <p class="text-xs text-slate-400">Update account profile, avatar & theme</p>
              </div>
            </div>

            <button (click)="closeModal.emit()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Error Alert -->
          @if (errorMessage) {
            <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium shadow-glow-rose">
              {{ errorMessage }}
            </div>
          }

          <!-- Success Alert -->
          @if (successMessage) {
            <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium shadow-glow-emerald">
              {{ successMessage }}
            </div>
          }

          <!-- Form Body -->
          <form (ngSubmit)="onSave()" class="space-y-5">
            <!-- Avatar Upload & Base64 Converter Zone -->
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="relative group">
                <img 
                  [src]="avatarBase64 || DEFAULT_USER_AVATAR" 
                  alt="Profile Avatar" 
                  class="w-24 h-24 rounded-full object-cover border-2 border-violet-500/40 shadow-glow-violet bg-slate-900"
                />
                
                <label 
                  class="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold"
                >
                  <svg class="w-6 h-6 mb-1 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Upload (Max 1MB)</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    (change)="onFileSelected($event)" 
                    class="hidden"
                  />
                </label>
              </div>

              <div class="text-center">
                <span class="text-xs text-slate-300 font-bold block">Profile Avatar Image</span>
                <span class="text-[10px] text-slate-500">Max size 1 MB • PNG, JPG, WEBP</span>
              </div>
            </div>

            <!-- Full Name Input -->
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input 
                type="text" 
                [(ngModel)]="fullName" 
                name="fullName" 
                required 
                class="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-violet-500 font-semibold"
              />
            </div>

            <!-- Email Display (Read-only) -->
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address (Database ID)
              </label>
              <input 
                type="email" 
                [value]="authService.currentUserSignal()?.email || ''" 
                disabled 
                class="w-full px-4 py-3 bg-slate-950 border border-slate-900 rounded-2xl text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <!-- Appearance Theme Preference Selector -->
            <div>
              <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Appearance Theme
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  (click)="themeService.setTheme('dark')"
                  [class]="themeService.isDarkMode() 
                    ? 'flex items-center justify-center space-x-2 p-3 rounded-2xl bg-violet-600/20 border-2 border-violet-500 text-white font-bold text-xs shadow-glow-violet cursor-pointer' 
                    : 'flex items-center justify-center space-x-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:border-slate-700 hover:text-slate-200 transition-colors cursor-pointer'"
                >
                  <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                  <span>Dark Obsidian</span>
                </button>

                <button 
                  type="button"
                  (click)="themeService.setTheme('light')"
                  [class]="!themeService.isDarkMode() 
                    ? 'flex items-center justify-center space-x-2 p-3 rounded-2xl bg-violet-600/20 border-2 border-violet-500 text-white font-bold text-xs shadow-glow-violet cursor-pointer' 
                    : 'flex items-center justify-center space-x-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:border-slate-700 hover:text-slate-200 transition-colors cursor-pointer'"
                >
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>Light Canvas</span>
                </button>
              </div>
            </div>

            <!-- Save Action Button -->
            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-3">
              <button 
                type="button" 
                (click)="closeModal.emit()" 
                class="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="saving"
                class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-violet transition-all cursor-pointer"
              >
                {{ saving ? 'Saving to Database...' : 'Save Profile Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProfileModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public readonly DEFAULT_USER_AVATAR = DEFAULT_USER_AVATAR;

  fullName = '';
  avatarBase64 = '';
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.fullName = user.full_name || '';
      this.avatarBase64 = user.avatar_url || DEFAULT_USER_AVATAR;
    }
  }

  onFileSelected(event: any): void {
    this.errorMessage = '';
    this.successMessage = '';
    const file: File = event.target.files?.[0];

    if (!file) return;

    // Strict 1 MB size check (1,048,576 bytes)
    const maxSizeBytes = 1048576;
    if (file.size > maxSizeBytes) {
      this.errorMessage = `Selected image file size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the maximum limit of 1 MB.`;
      return;
    }

    // Convert file to Base64 string
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarBase64 = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onSave(): Promise<void> {
    if (!this.fullName || !this.fullName.trim()) {
      this.errorMessage = 'Full name is required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const res = await this.authService.updateProfile(this.fullName.trim(), this.avatarBase64);
    this.saving = false;

    if (res.success) {
      this.successMessage = 'Profile updated and saved to database successfully!';
      setTimeout(() => {
        this.closeModal.emit();
      }, 1000);
    } else {
      this.errorMessage = res.error || 'Failed to update profile in database.';
    }
  }
}
