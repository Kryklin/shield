import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  
  // Default to dark mode
  darkMode = signal(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
        this.loadTheme();
    }

    // Effect to apply class to body whenever signal changes
    effect(() => {
        if (isPlatformBrowser(this.platformId)) {
            const isDark = this.darkMode();
            const body = this.document.body;
            
            if (isDark) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }
            
            // Persist to storage
            localStorage.setItem('shield-theme', isDark ? 'dark' : 'light');
        }
    });
  }

  toggle() {
    this.darkMode.update(v => !v);
  }

  private loadTheme() {
    const stored = localStorage.getItem('shield-theme');
    if (stored) {
        this.darkMode.set(stored === 'dark');
    } else {
        // Check system preference if no stored value
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.darkMode.set(prefersDark);
    }
  }
}
