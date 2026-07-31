import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DEFAULT_USER_AVATAR } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ProductFacadeService } from '../../facades/product.facade';
import { ProfileModalComponent } from '../../features/auth/profile-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileModalComponent],
  template: `
    <header class="h-20 glass-panel border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <!-- Left: Mobile Menu Toggle & Command Palette Trigger -->
      <div class="flex items-center space-x-4 flex-1">
        <button 
          (click)="toggleSidebar.emit()"
          class="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Command Palette Trigger Button (Ctrl + K) -->
        <button 
          (click)="openCommandPalette.emit()"
          class="relative w-full max-w-md hidden sm:flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 rounded-2xl text-sm text-slate-400 hover:text-slate-200 transition-all group shadow-inner cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span class="text-xs sm:text-sm">Search products, stock, commands...</span>
          </div>

          <div class="flex items-center space-x-1">
            <kbd class="px-2 py-0.5 bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-300 rounded-lg shadow-sm">Ctrl + K</kbd>
          </div>
        </button>
      </div>

      <!-- Right: Actions & User Profile -->
      <div class="flex items-center space-x-3 sm:space-x-4">
        <!-- Theme Toggle Switcher Button -->
        <button 
          (click)="themeService.toggleTheme()"
          class="relative p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all group cursor-pointer"
          [title]="themeService.isDarkMode() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
        >
          @if (themeService.isDarkMode()) {
            <!-- Sun Icon for switching to light mode -->
            <svg class="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          } @else {
            <!-- Moon Icon for switching to dark mode -->
            <svg class="w-5 h-5 text-violet-500 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
        </button>

        <!-- Low Stock Alert Bell Button -->
        <button 
          (click)="toggleNotificationDrawer.emit()"
          class="relative p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all group cursor-pointer"
          title="View Stock Notifications"
        >
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>

          @if (productFacade.lowStockCountSignal() > 0) {
            <span 
              class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950 shadow-lg animate-pulse-glow"
            >
              {{ productFacade.lowStockCountSignal() }}
            </span>
          }
        </button>

        <!-- User Profile Card -->
        <div 
          (click)="isProfileModalOpen = true"
          class="flex items-center space-x-3 pl-3 border-l border-slate-800 cursor-pointer group p-1.5 rounded-2xl hover:bg-slate-800/60 transition-colors"
          title="Edit Profile Settings"
        >
          <img 
            [src]="authService.currentUserSignal()?.avatar_url || DEFAULT_USER_AVATAR"
            alt="User Avatar" 
            class="w-9 h-9 rounded-xl border border-violet-500/40 object-cover bg-slate-900 group-hover:border-violet-400 transition-colors"
          />
          <div class="hidden lg:block text-left">
            <div class="text-xs font-bold text-slate-200 group-hover:text-violet-300 transition-colors">
              {{ authService.currentUserSignal()?.full_name || 'Admin User' }}
            </div>
            <div class="text-[10px] text-emerald-400 capitalize font-medium flex items-center">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span>
              {{ authService.currentUserSignal()?.role || 'admin' }} Mode
            </div>
          </div>

          <button 
            type="button"
            (click)="logout(); $event.stopPropagation()"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors ml-1 cursor-pointer"
            title="Sign Out"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Profile Settings Modal -->
    <app-profile-modal
      [isOpen]="isProfileModalOpen"
      (closeModal)="isProfileModalOpen = false"
    ></app-profile-modal>
  `
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleNotificationDrawer = new EventEmitter<void>();
  @Output() openCommandPalette = new EventEmitter<void>();

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public productFacade = inject(ProductFacadeService);
  private router = inject(Router);

  public readonly DEFAULT_USER_AVATAR = DEFAULT_USER_AVATAR;
  public isProfileModalOpen = false;

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
