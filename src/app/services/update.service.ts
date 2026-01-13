import { Injectable, signal } from '@angular/core';

export interface UpdateStatus {
  status: string;
  startType: string;
  driversExcluded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  status = signal<UpdateStatus | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
        const res = await (window as any).shieldApi.runScript('update-manager', ['-Action', 'Status']) as UpdateStatus;
        this.status.set(res);
    } finally {
        this.loading.set(false);
    }
  }

  async toggleFreeze() {
    const current = this.status();
    if (!current) return;
    
    const isFrozen = current.startType === 'Disabled';
    const action = isFrozen ? 'Unfreeze' : 'Freeze';
    
    await (window as any).shieldApi.runScript('update-manager', ['-Action', action]);
    await this.refresh();
  }

  async toggleDrivers() {
    await (window as any).shieldApi.runScript('update-manager', ['-Action', 'ToggleDrivers']);
    await this.refresh();
  }

  async clearCache() {
     await (window as any).shieldApi.runScript('update-manager', ['-Action', 'ClearCache']);
  }
}
