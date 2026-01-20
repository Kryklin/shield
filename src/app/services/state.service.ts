import { Injectable, signal, inject } from '@angular/core';
import { ElectronService } from './electron.service';
import { StateCache, ModuleState } from '../types/state.types';

export type { StateCache, ModuleState };

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private electron = inject(ElectronService);
  
  // In-memory reactive state
  private cache = signal<StateCache>({ timestamp: '', settings: {} });
  private saveTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.loadState();
  }

  async loadState() {
    if (this.electron.api) {
        const data = await this.electron.api.getStateCache();
        if (data && data.settings) {
            this.cache.set(data);
        }
    }
  }

  getState(moduleId: string): ModuleState | null {
      const state = this.cache().settings[moduleId];
      return state ? { ...state } : null; // Return copy
  }

  updateState(moduleId: string, newState: ModuleState) {
      this.cache.update(current => {
          const updated = { ...current };
          updated.settings[moduleId] = newState;
          updated.timestamp = new Date().toISOString();
          return updated;
      });
      
      this.scheduleSave();
  }

  private scheduleSave() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      
      // Debounce save by 2 seconds to batch updates
      this.saveTimeout = setTimeout(() => {
          if (this.electron.api) {
              this.electron.api.saveStateCache(this.cache());
          }
      }, 2000);
  }
}
