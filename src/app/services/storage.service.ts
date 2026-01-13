import { Injectable, signal } from '@angular/core';

export interface StorageDrive {
  name: string;
  description: string;
  root: string;
  free: number;
  used: number;
  total: number;
  percentFree: number;
}

export interface LargeFile {
  name: string;
  path: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  drives = signal<StorageDrive[]>([]);
  largeFiles = signal<LargeFile[]>([]);
  scanning = signal<boolean>(false);
  loading = signal<boolean>(false);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
        const res = await window.shieldApi.runScript('storage-manager', ['-Action', 'Status']) as StorageDrive[] | StorageDrive;
        this.drives.set(Array.isArray(res) ? res : (res ? [res] : []));
    } finally {
        this.loading.set(false);
    }
  }

  async clean() {
    const res = await window.shieldApi.runScript('storage-manager', ['-Action', 'Clean']) as StorageDrive[] | StorageDrive;
    this.drives.set(Array.isArray(res) ? res : (res ? [res] : []));
  }

  async scanLargeFiles() {
    this.scanning.set(true);
    try {
        const res = await window.shieldApi.runScript('storage-manager', ['-Action', 'FindLarge']) as LargeFile[];
        this.largeFiles.set(Array.isArray(res) ? res : (res ? [res] : []));
    } finally {
        this.scanning.set(false);
    }
  }

  async deleteFile(path: string) {
     await window.shieldApi.runScript('storage-manager', ['-Action', 'DeleteFile', '-Path', path]);
     // Refresh list
     await this.scanLargeFiles(); 
  }

  async deepClean() {
    this.loading.set(true);
    try {
        return await window.shieldApi.runScript('storage-manager', ['-Action', 'DeepClean'], true);
    } finally {
        this.loading.set(false);
    }
  }

  async toggleStorageSense() {
    return await window.shieldApi.runScript('storage-manager', ['-Action', 'ToggleStorageSense']);
  }
}
