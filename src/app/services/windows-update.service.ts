import { Injectable, signal, inject } from '@angular/core';
import { ElectronService } from './electron.service';

export interface UpdateStatus {
  status: string;
  startType: string;
  driversExcluded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WindowsUpdateService {
  private electron = inject(ElectronService);
  status = signal<UpdateStatus | null>(null);
  loading = signal<boolean>(false);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
        const res = await this.electron.runScript('update-manager', ['-Action', 'Status']) as UpdateStatus;
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
    
    await this.electron.runScript('update-manager', ['-Action', action]);
    await this.refresh();
  }

  async toggleDrivers() {
    await this.electron.runScript('update-manager', ['-Action', 'ToggleDrivers']);
    await this.refresh();
  }

  async clearCache() {
     await this.electron.runScript('update-manager', ['-Action', 'ClearCache']);
  }
}
