import { Injectable, signal } from '@angular/core';

export interface StartupItem {
  Name: string;
  Command: string;
  Location: string;
  Path: string;
}

@Injectable({
  providedIn: 'root'
})
export class StartupService {
  items = signal<StartupItem[]>([]);
  loading = signal<boolean>(false);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      const result = await window.shieldApi.runScript('startup-manager', ['-Action', 'GetStartup']);
      this.items.set(Array.isArray(result) ? result : [result]);
    } catch (err) {
      console.error('Failed to get startup items:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async removeItem(item: StartupItem) {
    if (!confirm(`Are you sure you want to remove '${item.Name}' from startup?`)) return;
    
    this.loading.set(true);
    try {
      await window.shieldApi.runScript('startup-manager', [
        '-Action', 'Remove', 
        '-Name', item.Name,
        '-Location', item.Location
      ]);
      await this.refresh();
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async addItem(name: string, path: string) {
      this.loading.set(true);
      try {
          // Re-using 'Location' param for path
          await window.shieldApi.runScript('startup-manager', ['-Action', 'Add', '-Name', name, '-Location', path]);
          await this.refresh();
      } catch (err) {
          console.error('Failed to add item:', err);
      } finally {
          this.loading.set(false);
      }
  }

  async addDelayedItem(item: StartupItem) {
      if (!confirm(`This will remove '${item.Name}' from normal startup and add it as a Delayed Task (30s). Continue?`)) return;

      this.loading.set(true);
      try {
          // 1. Add Delayed Task (Requires Path)
          // We need the executable path. 'Command' usually has quotes and args.
          // Rough parsing logic or we trust the command slightly cleaned.
          const cleanPath = item.Command.replace(/"/g, ''); 
          // If it's complex, this might fail, but for simple startup items it works.
          
          await window.shieldApi.runScript('startup-manager', ['-Action', 'AddDelayed', '-Name', item.Name, '-Location', cleanPath], true);
          
          // 2. Remove original
          await window.shieldApi.runScript('startup-manager', ['-Action', 'Remove', '-Name', item.Name, '-Location', item.Location]);
          
          await this.refresh();
          alert('Item moved to Delayed Startup successfully.');
      } catch (err) {
          console.error('Failed to delay item:', err);
          alert('Failed to delay item. See console.');
      } finally {
          this.loading.set(false);
      }
  }
}
