import { Injectable, signal } from '@angular/core';

export interface PowerPlan {
  id: string;
  name: string;
  active: boolean;
}

export interface BatteryStatus {
  percentage: number;
  status: number;
  isCharging: boolean;
  runtime: number;
  plans: PowerPlan[];
  error?: string;
}

export interface BatteryHealth {
  manufacturer: string;
  serialNumber: string;
  chemistry: string;
  designCapacity: number;
  fullChargeCapacity: number;
  cycleCount: number;
  wearLevel: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BatteryService {
  status = signal<BatteryStatus | null>(null);
  health = signal<BatteryHealth | null>(null);
  loading = signal<boolean>(true);
  healthLoading = signal<boolean>(false);
  
  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      const result = await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'Status']) as BatteryStatus;
      this.status.set(result);
      // Auto-fetch health report
      this.getHealth();
    } catch (err) {
      console.error('Failed to get battery status:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async getHealth() {
    this.healthLoading.set(true);
    try {
      const result = await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'GetDetailedReport']) as BatteryHealth;
      this.health.set(result);
    } catch (err) {
      console.error('Failed to parse health report:', err);
    } finally {
      this.healthLoading.set(false);
    }
  }

  async setPlan(planId: string) {
    this.loading.set(true);
    await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'SetPlan', '-PlanGuid', planId]);
    await this.refresh();
  }

  async unlockUltimatePlan() {
    this.loading.set(true);
    await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'UnlockUltimate']);
    await this.refresh();
  }

  async importPlan(path: string) {
    this.loading.set(true);
    try {
      await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'ImportPlan', '-Path', path]);
      await this.refresh();
    } finally {
      this.loading.set(false);
    }
  }

  async generateReport() {
    return await (window as any).shieldApi.runScript('battery-manager', ['-Action', 'Report']);
  }


}
