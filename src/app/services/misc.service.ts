import { Injectable, signal } from '@angular/core';

export interface HardeningStatus {
  enabled: boolean;
  status: string;
}

export interface MiscModule {
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
export class MiscService {
  modules = signal<MiscModule[]>([
    {
      id: 'classic-context-menu',
      name: 'Classic Context Menu',
      description: 'Restores the Windows 10 style right-click menu (Requires Explorer Restart).',
      script: 'toggle-classic-context-menu',
      state: null,
      loading: true
    },
    {
      id: 'web-search',
      name: 'Disable Web Search',
      description: 'Prevents Bing/Web results from appearing in the Start Menu.',
      script: 'disable-web-search',
      state: null,
      loading: true
    },
    {
      id: 'lock-screen',
      name: 'Disable Lock Screen',
      description: 'Skips the "Slide to Unlock" screen at boot (goes straight to login).',
      script: 'disable-lock-screen',
      state: null,
      loading: true
    },
    {
      id: 'verbose-logon',
      name: 'Verbose Boot Messages',
      description: 'Shows detailed status (loading drivers, group policy) during boot/shutdown.',
      script: 'enable-verbose-logon',
      state: null,
      loading: true
    },
    {
      id: '3d-objects',
      name: 'Remove "3D Objects"',
      description: 'Hides the "3D Objects" folder from This PC.',
      script: 'remove-3d-objects',
      state: null,
      loading: true
    },
    {
      id: 'file-ext',
      name: 'Show File Extensions',
      description: 'Always show file extensions (e.g., .txt, .exe) in Explorer.',
      script: 'toggle-file-extensions',
      state: null,
      loading: true
    },
    {
      id: 'hidden-files',
      name: 'Show Hidden Files',
      description: 'Reveal hidden system files and folders in Explorer.',
      script: 'toggle-hidden-files',
      state: null,
      loading: true
    },
    {
      id: 'aero-shake',
      name: 'Disable Aero Shake',
      description: 'Prevents minimizing all other windows when shaking a window title bar.',
      script: 'disable-aero-shake',
      state: null,
      loading: true
    },
    {
      id: 'store-prompt',
      name: 'Disable Store "Open With"',
      description: 'Prevents Windows from suggesting the Store for unknown file types.',
      script: 'disable-store-open-with',
      state: null,
      loading: true
    },
    {
      id: 'god-mode',
      name: 'Enable God Mode',
      description: 'Creates a "God Mode" folder on your Desktop with all CP links.',
      script: 'create-god-mode',
      state: null,
      loading: true
    },
    {
      id: 'snap-assist',
      name: 'Disable Snap Assist',
      description: 'Stops the suggested windows popup when snapping a window.',
      script: 'disable-snap-assist',
      state: null,
      loading: true
    },
    {
      id: 'welcome-exp',
      name: 'Disable Welcome Nags',
      description: 'Stops "Let\'s finish setting up your device" screens after updates.',
      script: 'disable-welcome-experience',
      state: null,
      loading: true
    },
    {
      id: 'driver-updates',
      name: 'Freeze Driver Updates',
      description: 'Prevents Windows Update from replacing your working drivers.',
      script: 'disable-driver-updates',
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
        const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']);
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
    const action = enable ? 'Enable' : 'Disable';

    try {
      await window.shieldApi.runScript(mod.script, ['-Action', action], true);
      const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']);
      
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
