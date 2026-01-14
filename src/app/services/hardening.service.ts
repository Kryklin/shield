import { Injectable, signal, inject } from '@angular/core';
import { ElectronService } from './electron.service';
import { HARDENING_MODULES } from '../config/hardening-modules';

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
      
      this.loadProfiles(); 
      this.activeProfileId.set(newProfile.id);
      return { success: true };
  }

  captureCurrentSettings(): Record<string, boolean> {
      const settings: Record<string, boolean> = {};
      this.modules().forEach(m => {
          if (m.state) {
              // We want to capture the "Hardened" status.
              // If state.enabled is FALSE, it is hardened. (Value=1).
              settings[m.id] = !m.state.enabled; 
          }
      });
      return settings;
  }

  areSettingsEqual(s1: Record<string, boolean>, s2: Record<string, boolean>): boolean {
    const allModules = this.modules();
    
    const normalize = (s: Record<string, boolean>) => {
        const n: Record<string, boolean> = {};
        allModules.forEach(m => n[m.id] = !!s[m.id]);
        return n;
    };

    const n1 = normalize(s1);
    const n2 = normalize(s2);
    
    return allModules.every(m => n1[m.id] === n2[m.id]);
  }

  async applyProfile(profileId: string) {
      const profile = this.profiles().find(p => p.id === profileId);
      if (!profile) return;
      
      this.activeProfileId.set(profileId);
      
      const mods = this.modules();
      for (const mod of mods) {
          const shouldBeHardened = !!profile.settings[mod.id];
          const currentRisk = mod.state?.enabled; 
          
          // Target Risk:
          // Hardened(true) -> Risk(false)
          // Hardened(false) -> Risk(true)
          const targetRisk = !shouldBeHardened;
          
          if (currentRisk !== targetRisk) {
              await this.toggleModule(mod.id, targetRisk);
          }
      }
  }

  async refreshAll() {
    const mods = this.modules();
    
    // Process in parallel
    const promises = mods.map(async (mod, index) => {
      try {
        const result = await this.electron.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
        
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
      await this.electron.runScript(mod.script, ['-Action', action], true);
      
      const result = await this.electron.runScript(mod.script, ['-Action', 'Query']) as HardeningStatus;
      
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
