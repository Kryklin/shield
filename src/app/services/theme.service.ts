import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface ShieldTheme {
  name: string;
  displayName: string;
  primaryColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);

  readonly availableThemes: ShieldTheme[] = [
    { name: 'void', displayName: 'Void', primaryColor: '#ffffff' },
  ];

  activeTheme = signal<ShieldTheme>(this.availableThemes[0]);

  constructor() {
    effect(() => {
      const theme = this.activeTheme();
      this.applyTheme(theme.name);
    });
  }

  setTheme(themeName: string) {
    const theme = this.availableThemes.find(t => t.name === themeName);
    if (theme) {
      this.activeTheme.set(theme);
    }
  }

  private applyTheme(themeName: string) {
    // Remove all known theme classes
    const classList = this.document.body.classList;
    this.availableThemes.forEach(t => {
      classList.remove(`theme-${t.name}`);
    });
    
    // Add new theme class
    classList.add(`theme-${themeName}`);
  }
}
