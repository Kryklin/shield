declare global {
  interface Window {
    shieldApi: {
      runScript: (script: string, args?: string[], requiresAdmin?: boolean) => Promise<unknown>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      checkAdmin: () => Promise<boolean>;
      relaunchAsAdmin: () => void;
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => void;
      quitAndInstall: () => void;
      getStateCache: () => Promise<{ timestamp: string; settings: unknown }>;
      saveStateCache: (cache: { timestamp: string; settings: unknown }) => void;
      onAutoUpdateStatus: (callback: (event: unknown) => void) => void;
    };
  }
}
