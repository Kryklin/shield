import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('shieldApi', {
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  getFirewallStatus: () => ipcRenderer.invoke('get-firewall-status'),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => 
    ipcRenderer.on('window-maximized-change', (_event, value) => callback(value)),
  runScript: (scriptName: string, args: string[], requiresAdmin = false) => ipcRenderer.invoke('run-script', scriptName, args, requiresAdmin),
  checkAdminStatus: () => ipcRenderer.invoke('is-process-admin'),
  relaunchAsAdmin: () => ipcRenderer.invoke('relaunch-as-admin'),
});
