import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  loading = signal<boolean>(false);
  status = signal<{chrome: boolean, edge: boolean, firefox: boolean}>({chrome: false, edge: false, firefox: false});

  constructor() {
    this.checkStatus();
  }

  async checkStatus() {
    try {
        const res = await window.shieldApi.runScript('browser-manager', ['-Action', 'CheckStatus']);
        this.status.set(res);
    } catch (e) {
        console.error(e);
    }
  }

  async hardenBrowser(browser: 'Chrome' | 'Edge' | 'Firefox') {
    this.loading.set(true);
    try {
        // True for Admin
        return await window.shieldApi.runScript('browser-manager', ['-Action', 'Harden', '-Browser', browser], true);
    } finally {
        this.loading.set(false);
        this.checkStatus();
    }
  }
}
