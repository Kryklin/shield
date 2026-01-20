import { Injectable, signal, inject } from '@angular/core';
import { ElectronService } from './electron.service';
import { HARDENING_MODULES } from '../config/hardening-modules';
import { StateService } from './state.service';

export interface HardeningStatus {
  enabled: boolean;
  status: 'Safe' | 'At Risk';
  details: string;
}

export interface HardeningModule {
  id: string;
  name: string;
  description: string;
  extendedDescription: string;
  script: string;
  state?: HardeningStatus;
  loading?: boolean;
  isProcessing?: boolean;
}

export interface HardeningProfile {
    id: string;
    name: string;
    isSystem: boolean;
    settings: Record<string, boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class HardeningService {
  private electron = inject(ElectronService);
  private stateService = inject(StateService);
  
  modules = signal<HardeningModule[]>([]);
  profiles = signal<HardeningProfile[]>([]);
  activeProfileId = signal<string | null>(null);

  constructor() {
    this.initModules();
    this.loadProfiles();
    this.refreshAll();
  }

  private initModules() {
      // Clone the static config so we can modify state
      this.modules.set(JSON.parse(JSON.stringify(HARDENING_MODULES)));
  }

  loadProfiles() {
      // 1. Define System Profiles
      const standardList = ['telemetry', 'advertising', 'error-reporting', 'wifi-sense', 'smb1', 'remote-assistance', 'remote-reg'];
      const strictList = ['telemetry', 'location', 'advertising', 'cortana', 'activity-history', 'error-reporting', 'launch-tracking', 'wifi-sense', 'remote-assistance', 'smb1', 'defender-pua', 'llmnr', 'netbios', 'wpad', 'rdp', 'autoplay', 'psv2', 'clipboard', 'typing', 'shared-exp', 'remote-reg'];
      
      const standardSettings: Record<string, boolean> = {};
      standardList.forEach(id => standardSettings[id] = true);

      const strictSettings: Record<string, boolean> = {};
      strictList.forEach(id => strictSettings[id] = true);

      const systemProfiles: HardeningProfile[] = [
          {
              id: 'standard',
              name: 'Standard (Default)',
              isSystem: true,
              settings: standardSettings 
          },
          {
              id: 'strict',
              name: 'Strict (Maximum Security)',
              isSystem: true,
              settings: strictSettings
          }
      ];

      // 2. Load User Profiles from LocalStorage
      const stored = localStorage.getItem('shield_profiles');
      const userProfiles: HardeningProfile[] = stored ? JSON.parse(stored) : [];

      this.profiles.set([...systemProfiles, ...userProfiles]);
  }

  saveProfile(name: string): { success: boolean, message?: string, duplicateOf?: string } {
      const currentSettings = this.captureCurrentSettings();
      
      const existing = this.profiles().find(p => this.areSettingsEqual(p.settings, currentSettings));
      if (existing) {
          return { success: false, duplicateOf: existing.name };
      }

      const newProfile: HardeningProfile = {
          id: crypto.randomUUID(),
          name: name,
          isSystem: false,
          settings: currentSettings
      };

      const userProfiles = this.profiles().filter(p => !p.isSystem);
      userProfiles.push(newProfile);
      
      localStorage.setItem('shield_profiles', JSON.stringify(userProfiles));
      
      this.loadProfiles(); // Refresh
      this.activeProfileId.set(newProfile.id);
      return { success: true };
  }

  importProfile(data: any): { success: boolean, message: string } {
      // Basic Validation
      if (!data || !data.settings || typeof data.name !== 'string') {
          return { success: false, message: 'Invalid profile format' };
      }

      const importedProfile: HardeningProfile = {
          id: crypto.randomUUID(),
          name: data.name + ' (Imported)',
          isSystem: false,
          settings: data.settings
      };

      const userProfiles = this.profiles().filter(p => !p.isSystem);
      const profileList = [...userProfiles, importedProfile];
      
      localStorage.setItem('shield_profiles', JSON.stringify(profileList));
      this.loadProfiles();
      this.activeProfileId.set(importedProfile.id);
      
      return { success: true, message: `Imported "${importedProfile.name}"` };
  }


  private captureCurrentSettings(): Record<string, boolean> {
      const settings: Record<string, boolean> = {};
      this.modules().forEach(m => {
          if (m.state?.enabled) {
              settings[m.id] = true;
          }
      });
      return settings;
  }

  private areSettingsEqual(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
      const keysA = Object.keys(a).sort();
      const keysB = Object.keys(b).sort();
      
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key, i) => key === keysB[i]);
  }

  async applyProfile(profileId: string) {
      const profile = this.profiles().find(p => p.id === profileId);
      if (!profile) return;
      
      this.activeProfileId.set(profileId); // Optimistic set
      
      const mods = this.modules();
      for (const mod of mods) {
          const shouldEnabled = !!profile.settings[mod.id];
          const isEnabled = mod.state?.enabled; 
          
          if (shouldEnabled !== isEnabled) {
              await this.toggleModule(mod.id, shouldEnabled);
          }
      }
  }

  async refreshAll() {
    const mods = this.modules();
    
    // Process in parallel
    mods.map(async (mod, index) => {
      // 1. Try Cache First (Instant Load)
      const cached = this.stateService.getState('hardening-' + mod.id);
      if (cached) {
          this.modules.update(current => {
              const updated = [...current];
              updated[index] = { ...updated[index], state: cached as HardeningStatus, loading: false };
              return updated;
          });
          return;
      }
      
      // 2. Fallback to System Query
      try {
        const result = await this.electron.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
        
        // Update Cache
        this.stateService.updateState('hardening-' + mod.id, result);

        this.modules.update(current => {
          const updated = [...current];
          updated[index] = { 
            ...updated[index], 
            state: result, 
            loading: false 
          };
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
    
    // We let them resolve independently for progressive loading
  }

  async toggleModule(moduleId: string, enable: boolean) {
    const mods = this.modules();
    const index = mods.findIndex(m => m.id === moduleId);
    if (index === -1) return;

    // Optimistic Update
    this.modules.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], isProcessing: true };
      return updated;
    });

    const mod = mods[index];
    const action = enable ? 'Enable' : 'Disable';

    try {
      await this.electron.runScript(mod.script, ['-Action', action], true);
      
      const result = await this.electron.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
      
      // Update Cache
      this.stateService.updateState('hardening-' + mod.id, result);

      this.modules.update(current => {
        const updated = [...current];
        updated[index] = { 
          ...updated[index], 
          state: result, 
          isProcessing: false 
        };
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
