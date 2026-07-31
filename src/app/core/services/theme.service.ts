import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'stockview_theme_v2';
  
  public themeSignal = signal<ThemeMode>('light');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.themeSignal.set(savedTheme);
    } else {
      // Default unconditionally to light theme across all pages
      this.themeSignal.set('light');
    }
    this.applyThemeToDOM(this.themeSignal());
  }

  public setTheme(mode: ThemeMode): void {
    this.themeSignal.set(mode);
    localStorage.setItem(this.THEME_KEY, mode);
    this.applyThemeToDOM(mode);
  }

  public toggleTheme(): ThemeMode {
    const nextTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  public isDarkMode(): boolean {
    return this.themeSignal() === 'dark';
  }

  private applyThemeToDOM(mode: ThemeMode): void {
    const root = document.documentElement;
    const body = document.body;

    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    }
  }
}
