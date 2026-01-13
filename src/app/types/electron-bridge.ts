export interface ShieldStatus {
  status: string;
  hardeningLevel: number;
  lastScan: string;
}

export interface FirewallProfile {
  Name: string;
  Enabled: boolean;
}

export interface ShieldApi {
  getSystemStatus: () => Promise<ShieldStatus>;
  getFirewallStatus: () => Promise<FirewallProfile[]>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runScript: (scriptName: string, args: string[], requiresAdmin?: boolean) => Promise<unknown>;
  checkAdminStatus: () => Promise<boolean>;
  relaunchAsAdmin: () => void;
}

