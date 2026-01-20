import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('shieldApi', {
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  getFirewallStatus: () => ipcRenderer.invoke('get-firewall-status'),
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => 
    ipcRenderer.on('window-maximized-change', (_event, value) => callback(value)),
  runScript: (scriptName: string, args: string[], requiresAdmin = false) => ipcRenderer.invoke('run-script', scriptName, args, requiresAdmin),
  checkAdminStatus: () => ipcRenderer.invoke('is-process-admin'),
  relaunchAsAdmin: () => ipcRenderer.invoke('relaunch-as-admin'),
  // Auto-Update
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onAutoUpdateStatus: (callback: (status: { status: string; releaseName?: string; error?: string }) => void) => 
    ipcRenderer.on('auto-update-status', (_event, value) => callback(value)),
  // State Persistence
  getStateCache: () => ipcRenderer.invoke('get-state-cache'),
  saveStateCache: (state: any) => ipcRenderer.invoke('save-state-cache', state),
});
