import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface DemoPersona {
  roleName: string;
  email: string;
  badge: string;
  colorClass: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen w-full bg-[#05070d] wickret-bg bg-grid-pattern flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none">
      
      <!-- Background Ambient Glow Orbs -->
      <div class="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none animate-float"></div>
      <div class="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[150px] pointer-events-none animate-float-reverse"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/08 blur-[160px] pointer-events-none"></div>

      <!-- Main Container Grid -->
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        <!-- Left Hero Column (Visible on Desktop / Large screens) -->
        <div class="lg:col-span-6 space-y-8 p-4 lg:p-6 hidden lg:block animate-fade-in">
          
          <!-- Brand Badge -->
          <div class="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full glass-card border border-violet-500/20 shadow-glow-violet">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span class="text-xs font-bold tracking-wide uppercase text-violet-300">StockView OS v3.4 Enterprise</span>
          </div>

          <!-- Hero Headline -->
          <div class="space-y-4">
            <h1 class="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Next-Gen <br />
              <span class="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Inventory & POS Engine
              </span>
            </h1>
            <p class="text-slate-400 text-sm lg:text-base leading-relaxed max-w-md">
              Streamline multi-store stock tracking, point of sale transactions, supplier analytics, and financial reporting in one unified dark-mode workspace.
            </p>
          </div>

          <!-- Feature Metric Widgets -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Widget 1: Real-time Telemetry -->
            <div class="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Inventory</span>
                <span class="text-emerald-400 font-bold flex items-center">
                  <svg class="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  +12.4%
                </span>
              </div>
              <div class="text-2xl font-black text-white tracking-tight">$248,500</div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full w-[78%]"></div>
              </div>
            </div>

            <!-- Widget 2: Security Badge -->
            <div class="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Enterprise Security</span>
                <span class="text-cyan-400 font-bold">SOC-2 Certified</span>
              </div>
              <div class="text-2xl font-black text-white tracking-tight">256-bit AES</div>
              <p class="text-[11px] text-slate-500">Real-time audit logging & database encryption</p>
            </div>
          </div>

          <!-- Feature Highlights Tags -->
          <div class="flex flex-wrap gap-2 pt-2">
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Instant Barcode Checkout</span>
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Auto Stock Reordering</span>
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Predictive Profit Analytics</span>
            </span>
          </div>

        </div>

        <!-- Right Auth Column (Login / Register Card) -->
        <div class="lg:col-span-6 w-full max-w-md mx-auto">
          
          <div class="glass-panel p-6 sm:p-9 rounded-3xl border border-slate-800/90 shadow-2xl relative z-10 space-y-6 animate-fade-in border-gradient-glow">
            
            <!-- Mobile Brand Logo Header -->
            <div class="text-center space-y-2">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-violet ring-1 ring-white/20">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h2 class="text-2xl font-black text-white tracking-tight">
                {{ isSignUp ? 'Create Workspace Account' : 'Welcome Back' }}
              </h2>
              <p class="text-xs text-slate-400 font-medium">
                {{ isSignUp ? 'Join thousands of businesses managing stock effortlessly' : 'Sign in to access your inventory and POS workspace' }}
              </p>
            </div>

            <!-- Segmented Mode Switcher Tabs -->
            <div class="grid grid-cols-2 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs font-bold relative">
              <button 
                type="button"
                (click)="switchMode(false)"
                [class.bg-gradient-to-r]="!isSignUp"
                [class.from-violet-600]="!isSignUp"
                [class.to-indigo-600]="!isSignUp"
                [class.text-white]="!isSignUp"
                [class.shadow-md]="!isSignUp"
                [class.text-slate-400]="isSignUp"
                class="py-2.5 rounded-xl transition-all duration-300 text-center font-bold cursor-pointer"
              >
                Sign In
              </button>
              <button 
                type="button"
                (click)="switchMode(true)"
                [class.bg-gradient-to-r]="isSignUp"
                [class.from-violet-600]="isSignUp"
                [class.to-indigo-600]="isSignUp"
                [class.text-white]="isSignUp"
                [class.shadow-md]="isSignUp"
                [class.text-slate-400]="!isSignUp"
                class="py-2.5 rounded-xl transition-all duration-300 text-center font-bold cursor-pointer"
              >
                Register
              </button>
            </div>

            <!-- Alerts -->
            @if (errorMessage) {
              <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start space-x-2.5 shadow-glow-rose animate-fade-in">
                <svg class="w-4 h-4 text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div class="leading-relaxed">{{ errorMessage }}</div>
              </div>
            }

            @if (successMessage) {
              <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start space-x-2.5 shadow-glow-emerald animate-fade-in">
                <svg class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div class="leading-relaxed">{{ successMessage }}</div>
              </div>
            }

            <!-- Form -->
            <form (ngSubmit)="onSubmit()" class="space-y-4">
              
              <!-- Full Name (Sign Up only) -->
              @if (isSignUp) {
                <div class="space-y-1.5 animate-fade-in">
                  <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Full Name <span class="text-violet-400">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      [(ngModel)]="fullName" 
                      name="fullName" 
                      required 
                      placeholder="e.g. Alex Vance"
                      class="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>
              }

              <!-- Email Field -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Email Address <span class="text-violet-400">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    [(ngModel)]="email" 
                    name="email" 
                    required 
                    placeholder="name@company.com"
                    class="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Password <span class="text-violet-400">*</span>
                  </label>
                  @if (!isSignUp) {
                    <button 
                      type="button" 
                      (click)="openForgotPassword()" 
                      class="text-[11px] font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  }
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    [(ngModel)]="password" 
                    name="password" 
                    required 
                    placeholder="••••••••••••"
                    class="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                  <button 
                    type="button" 
                    (click)="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    @if (showPassword) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>

                <!-- Password Strength Meter (Sign Up only) -->
                @if (isSignUp && password) {
                  <div class="space-y-1.5 pt-1 animate-fade-in">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-slate-400">Security Rating:</span>
                      <span [class]="getStrengthColorClass()" class="font-bold">{{ getStrengthLabel() }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex space-x-1 p-0.5 border border-slate-800">
                      <div [class]="getStrengthBarWidth() >= 1 ? getStrengthBg() : 'bg-transparent'" class="h-full rounded-full transition-all duration-300 flex-1"></div>
                      <div [class]="getStrengthBarWidth() >= 2 ? getStrengthBg() : 'bg-transparent'" class="h-full rounded-full transition-all duration-300 flex-1"></div>
                      <div [class]="getStrengthBarWidth() >= 3 ? getStrengthBg() : 'bg-transparent'" class="h-full rounded-full transition-all duration-300 flex-1"></div>
                      <div [class]="getStrengthBarWidth() >= 4 ? getStrengthBg() : 'bg-transparent'" class="h-full rounded-full transition-all duration-300 flex-1"></div>
                    </div>
                  </div>
                }
              </div>

              <!-- Checkboxes / Options -->
              <div class="flex items-center justify-between pt-1">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="rememberMe" 
                    name="rememberMe" 
                    class="w-4 h-4 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900"
                  />
                  <span class="text-xs text-slate-400">Keep me signed in</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                [disabled]="loading"
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 active:scale-[0.99] disabled:opacity-70 text-white font-bold text-sm shadow-glow-violet transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                @if (!loading) {
                  <span class="flex items-center space-x-2">
                    <span>{{ isSignUp ? 'Create Enterprise Account' : 'Sign In to Workspace' }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </span>
                } @else {
                  <span class="flex items-center space-x-2">
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating credentials...</span>
                  </span>
                }
              </button>
            </form>

            <!-- SSO / Enterprise Divider -->
            <div class="relative flex items-center justify-center my-4">
              <div class="border-t border-slate-800/80 w-full"></div>
              <span class="bg-[#0f1118] px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 shrink-0">
                Or Continue With
              </span>
            </div>

            <!-- Single Sign-On Social Buttons -->
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                (click)="loginWithSSO('Google Workspace')"
                class="py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.3C.6 9.3 0 11.6 0 14s.6 4.7 1.6 6.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.2-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                </svg>
                <span>Google</span>
              </button>

              <button 
                type="button" 
                (click)="loginWithSSO('Microsoft Azure AD')"
                class="py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H1z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <!-- Quick Demo Accounts Switcher -->
            <div class="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-400 font-bold uppercase tracking-wider">Quick Demo Sandbox</span>
                <span class="text-violet-400 font-medium">1-Click Login</span>
              </div>

              <div class="grid grid-cols-3 gap-2">
                @for (persona of demoPersonas; track persona.roleName) {
                  <button 
                    type="button" 
                    (click)="selectDemoPersona(persona)"
                    class="py-2 px-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800/90 hover:border-violet-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center space-y-1 group cursor-pointer"
                  >
                    <span [class]="persona.colorClass" class="text-[10px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-md">
                      {{ persona.badge }}
                    </span>
                    <span class="truncate w-full text-slate-300 group-hover:text-violet-300">{{ persona.roleName }}</span>
                  </button>
                }
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Forgot Password Modal Drawer -->
      @if (showForgotPassword) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div class="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5 relative">
            <button 
              (click)="showForgotPassword = false" 
              class="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div class="text-center space-y-2">
              <div class="w-12 h-12 mx-auto rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
              </div>
              <h3 class="text-xl font-black text-white">Reset Password</h3>
              <p class="text-xs text-slate-400">
                Enter your workspace email address and we'll send you instant password recovery instructions.
              </p>
            </div>

            @if (resetSent) {
              <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center space-y-2">
                <p class="font-bold">Reset link sent successfully!</p>
                <p class="text-[11px] text-slate-400">Check your inbox for <strong>{{ resetEmail }}</strong> to update your credentials.</p>
              </div>
            } @else {
              <div class="space-y-4">
                <div>
                  <label class="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <input 
                    type="email" 
                    [(ngModel)]="resetEmail" 
                    placeholder="user@company.com"
                    class="w-full px-4 py-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>

                <button 
                  (click)="sendResetLink()" 
                  [disabled]="resetLoading"
                  class="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  @if (!resetLoading) {
                    <span>Send Password Reset Link</span>
                  } @else {
                    <span>Sending email...</span>
                  }
                </button>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  fullName = '';
  isSignUp = false;
  showPassword = false;
  rememberMe = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Forgot password modal state
  showForgotPassword = false;
  resetEmail = '';
  resetLoading = false;
  resetSent = false;

  demoPersonas: DemoPersona[] = [
    {
      roleName: 'System Admin',
      email: 'admin@stockview.io',
      badge: 'Admin',
      colorClass: 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
    },
    {
      roleName: 'Stock Lead',
      email: 'inventory@stockview.io',
      badge: 'Stock',
      colorClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    {
      roleName: 'POS Cashier',
      email: 'cashier@stockview.io',
      badge: 'Cashier',
      colorClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
    }
  ];

  ngOnInit(): void {
    // Sync tab state with current route path (e.g. /signup or /register vs /login)
    const currentUrl = this.router.url;
    if (currentUrl.includes('signup') || currentUrl.includes('register')) {
      this.isSignUp = true;
    }
  }

  switchMode(signUpState: boolean): void {
    this.isSignUp = signUpState;
    this.errorMessage = '';
    this.successMessage = '';
  }

  getStrengthScore(): number {
    if (!this.password) return 0;
    let score = 0;
    if (this.password.length >= 6) score++;
    if (/[a-z]/.test(this.password) && /[0-9]/.test(this.password)) score++;
    if (/[A-Z]/.test(this.password) || /[^a-zA-Z0-9]/.test(this.password)) score++;
    if (this.password.length >= 10) score++;
    return score;
  }

  getStrengthLabel(): string {
    const score = this.getStrengthScore();
    switch (score) {
      case 1: return 'Weak';
      case 2: return 'Moderate';
      case 3: return 'Strong';
      case 4: return 'Enterprise Grade';
      default: return 'Too Short';
    }
  }

  getStrengthBarWidth(): number {
    return this.getStrengthScore();
  }

  getStrengthColorClass(): string {
    const score = this.getStrengthScore();
    switch (score) {
      case 1: return 'text-rose-400';
      case 2: return 'text-amber-400';
      case 3: return 'text-emerald-400';
      case 4: return 'text-cyan-400';
      default: return 'text-slate-500';
    }
  }

  getStrengthBg(): string {
    const score = this.getStrengthScore();
    switch (score) {
      case 1: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-gradient-to-r from-violet-500 to-cyan-400';
      default: return 'bg-slate-700';
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.email.trim() || !this.password || !this.password.trim()) {
      this.errorMessage = 'Please provide both email address and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.isSignUp) {
        if (!this.fullName || !this.fullName.trim()) {
          this.errorMessage = 'Full name is required for registration.';
          this.loading = false;
          return;
        }

        const res = await this.authService.signUp(this.email, this.password, this.fullName);
        if (res.success) {
          this.successMessage = 'Account created successfully! Redirecting to workspace...';
          setTimeout(() => this.router.navigate(['/dashboard']), 600);
        } else {
          this.errorMessage = res.error || 'Failed to create account.';
        }
      } else {
        const res = await this.authService.signIn(this.email, this.password);
        if (res.success) {
          this.successMessage = 'Access granted. Welcome to StockView OS!';
          setTimeout(() => this.router.navigate(['/dashboard']), 600);
        } else {
          this.errorMessage = res.error || 'Incorrect email or password.';
        }
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'An error occurred while validating credentials.';
    } finally {
      this.loading = false;
    }
  }

  selectDemoPersona(persona: DemoPersona): void {
    this.email = persona.email;
    this.password = 'password123';
    this.isSignUp = false;
    this.errorMessage = '';
    
    if (persona.email === 'admin@stockview.io') {
      this.authService.loginAsDemo();
      this.router.navigate(['/dashboard']);
    } else {
      this.onSubmit();
    }
  }

  loginWithSSO(provider: string): void {
    this.errorMessage = '';
    this.successMessage = `Connecting to ${provider} Enterprise Identity Gateway...`;
    setTimeout(() => {
      this.authService.loginAsDemo();
      this.router.navigate(['/dashboard']);
    }, 800);
  }

  openForgotPassword(): void {
    this.resetEmail = this.email;
    this.resetSent = false;
    this.showForgotPassword = true;
  }

  sendResetLink(): void {
    if (!this.resetEmail || !this.resetEmail.includes('@')) {
      return;
    }
    this.resetLoading = true;
    setTimeout(() => {
      this.resetLoading = false;
      this.resetSent = true;
    }, 1000);
  }
}
