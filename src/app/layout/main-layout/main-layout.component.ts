import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotificationDrawerComponent } from '../notification-drawer/notification-drawer.component';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    NavbarComponent, 
    NotificationDrawerComponent,
    CommandPaletteComponent
  ],
  template: `
    <div class="min-h-screen flex bg-[#08090c] wickret-bg font-sans antialiased text-slate-100 selection:bg-violet-500 selection:text-white">
      <!-- Sidebar Navigation -->
      <app-sidebar 
        [isOpen]="isSidebarOpen"
        (closeSidebar)="isSidebarOpen = false"
      ></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navbar Header -->
        <app-navbar 
          (toggleSidebar)="isSidebarOpen = !isSidebarOpen"
          (toggleNotificationDrawer)="isNotificationDrawerOpen = !isNotificationDrawerOpen"
          (openCommandPalette)="isCommandPaletteOpen = true"
        ></app-navbar>

        <!-- Dynamic Page Router Outlet -->
        <main class="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Realtime Low Stock Alert Drawer -->
      <app-notification-drawer 
        [isOpen]="isNotificationDrawerOpen"
        (closeDrawer)="isNotificationDrawerOpen = false"
      ></app-notification-drawer>

      <!-- Global Command Palette Modal (Ctrl + K) -->
      <app-command-palette
        [isOpen]="isCommandPaletteOpen"
        (close)="isCommandPaletteOpen = false"
      ></app-command-palette>
    </div>
  `
})
export class MainLayoutComponent {
  public themeService = inject(ThemeService);

  isSidebarOpen = false;
  isNotificationDrawerOpen = false;
  isCommandPaletteOpen = false;

  // Intercept Ctrl + K or Cmd + K globally
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.isCommandPaletteOpen = !this.isCommandPaletteOpen;
    } else if (event.key === 'Escape' && this.isCommandPaletteOpen) {
      this.isCommandPaletteOpen = false;
    }
  }
}
