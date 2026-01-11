import { Injectable, signal } from '@angular/core';

export interface SystemInfo {
  OS: string;
  OSBuild: string;
  Hostname: string;
  CPU: string;
  GPU: string;
  RAM: string;
  Motherboard: string;
  BIOS: string;
  Display: string;
  Uptime: string;
  IsLaptop: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  info = signal<SystemInfo | null>(null);
  loading = signal<boolean>(true);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      // runScript normally returns the parsed JSON if the script output is JSON
      const result = await window.shieldApi.runScript('get-system-info', []);
      this.info.set(result);
    } catch (err) {
      console.error('Failed to get system info:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
