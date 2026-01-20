export interface ShieldStatus {
  status: string;
  hardeningLevel: number;
  lastScan: string;
}

export interface FirewallProfile {
  Name: string;
  Enabled: boolean;
}

import { StateCache } from './state.types';

export interface ShieldApi {
  getSystemStatus: () => Promise<ShieldStatus>;
  getFirewallStatus: () => Promise<FirewallProfile[]>;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => void;
  runScript: (scriptName: string, args: string[], requiresAdmin?: boolean) => Promise<unknown>;
  checkAdminStatus: () => Promise<boolean>;
  relaunchAsAdmin: () => void;
  // Auto-Update
  checkForUpdates: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  onAutoUpdateStatus: (callback: (status: { status: string; releaseName?: string; error?: string }) => void) => void;
  // State Persistence
  getStateCache: () => Promise<StateCache>;
  saveStateCache: (state: StateCache) => Promise<boolean>;
}

