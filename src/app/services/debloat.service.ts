import { Injectable, signal } from '@angular/core';

export interface HardeningStatus {
  enabled: boolean;
  status: 'Safe' | 'At Risk';
  details: string;
}

export interface DebloatModule {
  id: string;
  name: string;
  description: string;
  script: string;
  state: HardeningStatus | null;
  loading: boolean;
  isProcessing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DebloatService {
  modules = signal<DebloatModule[]>([
    { 
      id: 'onedrive', 
      name: 'Uninstall OneDrive', 
      description: 'Completely removes the OneDrive application/integration.', 
      script: 'remove-onedrive',
      state: null,
      loading: true 
    },
    { 
      id: 'xbox', 
      name: 'Remove Xbox Suite', 
      description: 'Removes Xbox App, Game Bar, UI, and Overlays.', 
      script: 'remove-xbox-apps',
      state: null,
      loading: true
    },
    { 
      id: 'bing', 
      name: 'Remove Bing Suite', 
      description: 'Removes Weather, News, Finance, and Sports apps.', 
      script: 'remove-bing-bloat',
      state: null,
      loading: true
    },
    { 
      id: 'uwp-basic', 
      name: 'Remove UWP Bloat', 
      description: 'Removes 3D Builder, Solitaire, Tips, Mixed Reality, etc.', 
      script: 'remove-uwp-basic',
      state: null,
      loading: true
    },
    // Aggressive Removal
    { 
      id: 'phone', 
      name: 'Remove Phone Link', 
      description: 'Uninstalls the "Your Phone" / Phone Link app integration.', 
      script: 'remove-your-phone',
      state: null,
      loading: true
    },
    { 
      id: 'maps', 
      name: 'Remove Windows Maps', 
      description: 'Uninstalls the offline Windows Maps application.', 
      script: 'remove-maps',
      state: null,
      loading: true
    },
    { 
      id: 'quick-assist', 
      name: 'Remove Quick Assist', 
      description: 'Uninstalls the Quick Assist remote help tool.', 
      script: 'remove-quick-assist',
      state: null,
      loading: true
    },
    { 
      id: 'cortana-app', 
      name: 'Remove Cortana App', 
      description: 'Uninstall the actual Cortana app package (Nuclear option).', 
      script: 'remove-cortana-app',
      state: null,
      loading: true
    },
    { 
      id: 'people', 
      name: 'Disable People Bar', 
      description: 'Removes the "People" icon and contact integration from Taskbar.', 
      script: 'remove-people-bar',
      state: null,
      loading: true
    },
    // Moved from Hardening
    { 
      id: 'game-bar', 
      name: 'Disable Xbox Game Bar', 
      description: 'Disables Game DVR and recording overlays (Registry only).', 
      script: 'disable-game-bar',
      state: null,
      loading: true
    },
    { 
      id: 'consumer-features', 
      name: 'Disable Consumer Features', 
      description: 'Stops auto-installation of sponsored apps (Candy Crush, etc.).', 
      script: 'disable-consumer-features',
      state: null,
      loading: true
    }
  ]);

  constructor() {
    this.refreshAll();
  }

  async refreshAll() {
    const mods = this.modules();
    const promises = mods.map(async (mod, index) => {
      try {
        const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
        this.modules.update(current => {
          const updated = [...current];
          updated[index] = { ...updated[index], state: result, loading: false };
          return updated;
        });
      } catch (err) {
        console.error(`Failed to query ${mod.script}:`, err);
        this.modules.update(current => {
            const updated = [...current];
            updated[index] = { ...updated[index], loading: false };
            return updated;
        });
      }
    });
    await Promise.all(promises);
  }

  async toggleModule(moduleId: string, enable: boolean) {
    const mods = this.modules();
    const index = mods.findIndex(m => m.id === moduleId);
    if (index === -1) return;

    this.modules.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], isProcessing: true };
      return updated;
    });

    const mod = mods[index];
    // In Debloat context: "Enable" toggle means "Enable Hardening" (Remove App)
    const action = enable ? 'Enable' : 'Disable';

    try {
      await window.shieldApi.runScript(mod.script, ['-Action', action], true);
      const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
      
      this.modules.update(current => {
        const updated = [...current];
        updated[index] = { ...updated[index], state: result, isProcessing: false };
        return updated;
      });
    } catch (err) {
      console.error(`Failed to toggle ${mod.script}:`, err);
      this.modules.update(current => {
        const updated = [...current];
        updated[index] = { ...updated[index], isProcessing: false };
        return updated;
      });
    }
  }
}
