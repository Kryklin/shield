import { Injectable, signal } from '@angular/core';

export interface HardeningStatus {
  enabled: boolean;
  status: 'Safe' | 'At Risk';
  details: string;
}

export interface HardeningModule {
  id: string;
  name: string;
  description: string;
  extendedDescription: string; // Exhaustive detail
  script: string;
  state?: HardeningStatus;
  loading?: boolean;
  isProcessing?: boolean;
}

export interface HardeningProfile {
    id: string;
    name: string;
    isSystem: boolean;
    settings: { [moduleId: string]: boolean };
}

@Injectable({
  providedIn: 'root'
})
export class HardeningService {
  modules = signal<HardeningModule[]>([]);
  profiles = signal<HardeningProfile[]>([]);
  activeProfileId = signal<string | null>(null);

  constructor() {
    this.initModules();
    this.loadProfiles();
    this.refreshAll();
  }

  // Restore the massive list of modules
  private initModules() {
      this.modules.set([
        // Core
        { 
          id: 'telemetry', 
          name: 'Disable System Telemetry', 
          description: 'Prevents Windows from sending diagnostic data to Microsoft.',
          extendedDescription: 'Disables the "Connected User Experiences and Telemetry" service (DiagTrack) and sets the AllowTelemetry registry key to 0. \n\n**Visible Effects:** You will no longer be asked to send feedback to Microsoft. "Feedback & Diagnostics" settings in Windows will be disabled/locked by organization policy. No functional impact on daily use.',
          script: 'system-telemetry',
          state: undefined,
          loading: true 
        },
        { 
          id: 'location', 
          name: 'Disable Location Services', 
          description: 'Blocks applications from accessing precise geolocation data.',
          extendedDescription: 'Disables the Windows Location Service (lfsvc) and prevents apps from querying the location API. \n\n**Visible Effects:** Maps, Weather, and Browser sites will not be able to auto-detect your location. You must manually enter locations for weather or directions. Crucial for privacy.',
          script: 'windows-location',
          state: undefined,
          loading: true
        },
        { 
          id: 'advertising', 
          name: 'Disable Advertising ID', 
          description: 'Prevents apps from using your ID for targeted ads.',
          extendedDescription: 'Resets and disables the unique Advertising ID used by UWP apps to track usage across applications. \n\n**Visible Effects:** No visible change to the system. In-app ads (if any) will become generic and less relevant to your browsing habits. Preventing cross-app tracking.',
          script: 'advertising-id',
          state: undefined,
          loading: true
        },
        // Privacy & Data
        { 
          id: 'cortana', 
          name: 'Disable Cortana', 
          description: 'Disables the Cortana voice assistant and search integration.',
          extendedDescription: 'Sets the "AllowCortana" policy to 0 via Registry. \n\n**Visible Effects:** The Cortana icon will be hidden or non-functional. Voice activation ("Hey Cortana") will stop working. Standard Windows Search will continue to function but without the AI assistant features.',
          script: 'disable-cortana',
          state: undefined,
          loading: true
        },
        { 
          id: 'activity-history', 
          name: 'Disable Activity History', 
          description: 'Stops Windows from tracking your timeline and activity feed.',
          extendedDescription: 'Disables "PublishUserActivities", "UploadUserActivities", and "HistoryItem" policies. \n\n**Visible Effects:** The "Timeline" feature (Task View history) will no longer show past documents or web pages. You will only see currently open windows. Prevents local and cloud logging of your app usage.',
          script: 'disable-activity-history',
          state: undefined,
          loading: true
        },
        { 
          id: 'error-reporting', 
          name: 'Disable Error Reporting', 
          description: 'Prevents crash dumps and error logs from being sent to Microsoft.',
          extendedDescription: 'Disables the Windows Error Reporting (WER) service. \n\n**Visible Effects:** When an app crashes, you will no longer see the "Checking for a solution..." dialog. It will simply close. Crash dumps will not be uploaded to Microsoft servers.',
          script: 'disable-error-reporting',
          state: undefined,
          loading: true
        },
        { 
          id: 'launch-tracking', 
          name: 'Disable App Launch Tracking', 
          description: 'Stops Start Menu from tracking frequently used applications.',
          extendedDescription: 'Disables start menu telemetry features. \n\n**Visible Effects:** The "Most Used" lists in the Start Menu will be grayed out or empty. Windows will stop building a profile of your favorite applications.',
          script: 'disable-app-launch-tracking',
          state: undefined,
          loading: true
        },
        // Network & Security
        { 
          id: 'wifi-sense', 
          name: 'Disable Wi-Fi Sense', 
          description: 'Prevents automatic connection to suggested Wi-Fi hotspots.',
          extendedDescription: 'Disables the feature that automatically connects you to open hotspots and shares Wi-Fi credentials with contacts. \n\n**Visible Effects:** You will have complete manual control over which Wi-Fi networks you join. No automatic connections to public networks.',
          script: 'disable-wifi-sense',
          state: undefined,
          loading: true
        },
        { 
          id: 'remote-assistance', 
          name: 'Disable Remote Assistance', 
          description: 'Blocks unsolicited remote assistance connections.',
          extendedDescription: 'Prevents "Offer Remote Assistance" connections. \n\n**Visible Effects:** Remote Desktop is separate and not affected. This specifically blocks the "Invite someone to help you" legacy feature. Prevents social engineering attacks via help desk impersonation.',
          script: 'disable-remote-assistance',
          state: undefined,
          loading: true
        },
        { 
          id: 'smb1', 
          name: 'Disable SMBv1 Protocol', 
          description: 'Disables the insecure legacy SMBv1 file sharing protocol.',
          extendedDescription: 'Removes the SMB1.0/CIFS File Sharing Support feature. \n\n**Visible Effects:** You may lose connectivity to very old NAS devices or Windows XP/2003 machines on your network. Modern file sharing (SMBv2/v3) is unaffected and faster/safer.',
          script: 'disable-smb1',
          state: undefined,
          loading: true
        },
        { 
          id: 'defender-pua', 
          name: 'Enable Defender PUA Protection', 
          description: 'Enables protection against Potentially Unwanted Applications.',
          extendedDescription: 'Configures Windows Defender to block "Potentially Unwanted Applications" (adware, bundleware, crypto miners). \n\n**Visible Effects:** Defender may flag and block installers that bundle toolbars or free trials. This is a "set and forget" security layer.',
          script: 'enable-defender-pua',
          state: undefined,
          loading: true
        },
        // Advanced Security
        { 
          id: 'llmnr', 
          name: 'Disable LLMNR', 
          description: 'Prevents local network broadcast name resolution leaks.',
          extendedDescription: 'Disables Link-Local Multicast Name Resolution. \n\n**Visible Effects:** No visible impact in a properly configured DNS environment. Prevents attackers on the local network from spoofing names to steal credentials (LLMNR Poisoning).',
          script: 'disable-llmnr',
          state: undefined,
          loading: true
        },
        { 
          id: 'netbios', 
          name: 'Disable NetBIOS', 
          description: 'Disables legacy NetBIOS protocol on network adapters.',
          extendedDescription: 'Disables NetBIOS over TCP/IP on all network cards. \n\n**Visible Effects:** Older network discovery methods (Network Neighborhood style) might be slower or rely on WSD/mDNS. Significant reduction in network noise and attack surface.',
          script: 'disable-netbios',
          state: undefined,
          loading: true
        },
        { 
          id: 'wpad', 
          name: 'Disable WPAD', 
          description: 'Prevents Web Proxy Auto-Discovery attacks.',
          extendedDescription: 'Disables the specialized service that looks for "wpad.dat" to configure proxies automatically. \n\n**Visible Effects:** No impact unless you are in a corporate environment that strictly relies on WPAD (rare). Stops "Man-in-the-Middle" proxy injection attacks.',
          script: 'disable-wpad',
          state: undefined,
          loading: true
        },
        { 
          id: 'rdp', 
          name: 'Disable Remote Desktop', 
          description: 'Completely disables RDP connections and services.',
          extendedDescription: 'Sets "fDenyTSConnections" registry key to 1. \n\n**Visible Effects:** You will not be able to RDP *into* this computer. Outgoing RDP sessions to other computers still work. Critical for preventing brute-force login attempts.',
          script: 'disable-rdp',
          state: undefined,
          loading: true
        },
        { 
          id: 'autoplay', 
          name: 'Disable drive AutoPlay', 
          description: 'Prevents automatic execution of media (USB) content.',
          extendedDescription: 'Disables AutoRun/AutoPlay for all drives (USB, CD, Network). \n\n**Visible Effects:** When you plug in a USB stick, nothing happens automatically. You must open File Explorer manually. Blocks "BadUSB" attacks that try to run scripts immediately upon insertion.',
          script: 'disable-autoplay',
          state: undefined,
          loading: true
        },
        { 
          id: 'psv2', 
          name: 'Disable PowerShell v2', 
          description: 'Removes the legacy PowerShell v2 engine to prevent downgrade attacks.',
          extendedDescription: 'Uninstalls the "MicrosoftWindowsPowerShellV2" feature. \n\n**Visible Effects:** No impact on modern PowerShell scripts. Stops attackers from using the older v2 engine to bypass modern security logging (AMSI) features.',
          script: 'disable-powershell-v2',
          state: undefined,
          loading: true
        },
        // Deep Privacy
        { 
          id: 'clipboard', 
          name: 'Disable Clipboard Sync', 
          description: 'Stops clipboard data from syncing to the cloud.',
          extendedDescription: 'Disables clipboard history cloud sync policies. \n\n**Visible Effects:** "Win+V" will still show local history (if enabled), but your copied text/images will not be accessible on your other devices (Phone/Tablet). Confidentiality first.',
          script: 'disable-clipboard-sync',
          state: undefined,
          loading: true
        },
        { 
          id: 'typing', 
          name: 'Disable Typing Insights', 
          description: 'Prevents Windows from analyzing your typing and inking.',
          extendedDescription: 'DIsables "TypingInsights" and "HandwritingErrorReports". \n\n**Visible Effects:** Windows spelling and prediction features will rely only on local dictionaries. No typing data is sent to the cloud to "improve recognition".',
          script: 'disable-typing-insights',
          state: undefined,
          loading: true
        },
        { 
          id: 'shared-exp', 
          name: 'Disable Shared Experiences', 
          description: 'Stops "Share across devices" tracking.',
          extendedDescription: 'Disables "Project to this PC" and cross-device app launching. \n\n**Visible Effects:** "Continue on PC" features from phone will be disabled. Stops devices on the same account from pinging each other constantly.',
          script: 'disable-shared-experiences',
          state: undefined,
          loading: true
        },
        { 
          id: 'remote-reg', 
          name: 'Disable Remote Registry', 
          description: 'Prevents remote modification of the system registry.',
          extendedDescription: 'Disables the Remote Registry service. \n\n**Visible Effects:** No functionality loss for home users. Critical for security as it prevents attackers on the network from modifying your registry keys remotely.',
          script: 'disable-remote-registry',
          state: undefined,
          loading: true
        }
      ]);
  }

  loadProfiles() {
      // 1. Define System Profiles (using map of ID to boolean for settings)
      // Note: In system profiles, boolean TRUE means "Include this setting" (i.e. Enable Protection / Disable Feature)
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
      
      // Check for exact duplicates
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

      // Get current user profiles
      const userProfiles = this.profiles().filter(p => !p.isSystem);
      userProfiles.push(newProfile);
      
      // Persist
      localStorage.setItem('shield_profiles', JSON.stringify(userProfiles));
      
      // Reload to update signal
      this.loadProfiles(); 
      this.activeProfileId.set(newProfile.id);
      return { success: true };
  }

  captureCurrentSettings(): Record<string, boolean> {
      const settings: Record<string, boolean> = {};
      this.modules().forEach(m => {
          // If enabled (protected), save as true. Else false.
          // Note: state?.enabled === true means "Feature is Active" (RISK) for some modules?
          // Wait, let's re-verify logic.
          // In toggleModule, we saw: `state?.enabled` checks `Get-Status`.
          // `disable-remote-registry`: if Disabled -> enabled=$false ("Safe").
          // So enabled=false is SAFE.
          // In `applyProfile` previously, we said: "If currently enabled (true), we toggle it to false."
          // So we confirm: enabled=true means "Vulnerable/Active". enabled=false means "Hardened/Disabled".
          // BUT - The profile lists (standard/strict) list items to be HARDENED.
          // So if 'telemetry' is in 'standard', we want 'telemetry' to be enabled=false.
          //
          // Our profile settings object: { 'telemetry': true } -> Does this mean "Harden Telemetry" (State should be false)?
          // OR does it mean "State should be true"?
          //
          // Let's adopt convention:
          // Profile Settings: { 'moduleId': true } means "This module MUST be hardened (Safe/False)".
          // Profile Settings: { 'moduleId': false } means "This module is NOT enforced / ignored".
          //
          // Wait, if we want to save a profile where some are ON and some are OFF.
          // If a user has "Telemetry: Safe" (false) and "Location: Risk" (true).
          // We want to save that exact state.
          //
          // So the settings object should map { moduleId: isHardened }.
          // isHardened = (state == Safe).
          // If state.enabled == false -> Safe.
          // So isHardened = !state.enabled.
          
          if (m.state) {
              // We want to capture the "Hardened" status.
              // If state.enabled is FALSE, it is hardened. (Value=1).
              // If state.enabled is TRUE, it is NOT hardened. (Value=0).
              settings[m.id] = !m.state.enabled; 
          }
      });
      return settings;
  }

  areSettingsEqual(s1: Record<string, boolean>, s2: Record<string, boolean>): boolean {
    // We only care about keys that are 'true' (enforced).
    // Or do we care about exact match?
    // "if the user saves a new profile that is the same as either of those modes"
    // implies exact match of the resultant state.
    // Let's assume equality means: For every module defined in system, is it hardened?
    
    const allModules = this.modules();
    
    // Normalize both settings objects to have keys for all modules
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

      // Iterate all modules and match the target state
      // profile.settings[id] = true -> We want Hardened (enabled=false).
      // profile.settings[id] = false -> We want un-Hardened (enabled=true)? 
      //    Or do we just ignore it? 
      //    "Profiles can be saved for multiple use cases" 
      //    Usually a profile enforces a complete state.
      
      const mods = this.modules();
      for (const mod of mods) {
          const shouldBeHardened = !!profile.settings[mod.id];
          // Current state: mod.state?.enabled (true=Risk, false=Safe)
          // We want: if shouldBeHardened -> enabled should be false.
          //          if !shouldBeHardened -> enabled should be true. (Risk)
          
          const currentRisk = mod.state?.enabled; 
          
          // Target Risk:
          // Hardened(true) -> Risk(false)
          // Hardened(false) -> Risk(true)
          const targetRisk = !shouldBeHardened;
          
          if (currentRisk !== targetRisk) {
              // Need to toggle
              // Toggle takes (moduleId, enable)
              // enable=true -> Risk (Action Enable)
              // enable=false -> Safe (Action Disable)
              await this.toggleModule(mod.id, targetRisk);
          }
      }
  }

  async refreshAll() {
    const mods = this.modules();
    
    // Process in parallel
    const promises = mods.map(async (mod, index) => {
      try {
        const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']);
        
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

    // Set processing state
    this.modules.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], isProcessing: true };
      return updated;
    });

    const mod = mods[index];
    const action = enable ? 'Enable' : 'Disable';

    try {
      // Toggle actions usually require Admin privileges (HKLM writes)
      // Passing true to request Elevation via UAC
      await window.shieldApi.runScript(mod.script, ['-Action', action], true);
      
      // Re-query status to confirm state
      const result = await window.shieldApi.runScript(mod.script, ['-Action', 'Query']);
      
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
