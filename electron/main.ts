import { app, BrowserWindow, ipcMain, autoUpdater } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { updateElectronApp } from 'update-electron-app';
import { exec, ExecException } from 'child_process';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit();
}

updateElectronApp({
  repo: 'Kryklin/shield',
  updateInterval: '1 hour'
});

// Forward auto-updater events to renderer
autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('auto-update-status', { status: 'checking' });
});
autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('auto-update-status', { status: 'available' });
});
autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('auto-update-status', { status: 'not-available' });
});
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    mainWindow?.webContents.send('auto-update-status', { status: 'downloaded', releaseName });
});
autoUpdater.on('error', (message) => {
    mainWindow?.webContents.send('auto-update-status', { status: 'error', error: message });
});

// IPC for manual update control
ipcMain.handle('check-for-updates', () => {
   autoUpdater.checkForUpdates();
});
ipcMain.handle('quit-and-install', () => {
   autoUpdater.quitAndInstall();
});

let mainWindow: BrowserWindow | null = null;
const isDev = process.env['NODE_ENV'] === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000', // Transparent background to blend with topnav
      symbolColor: '#ffffff', // White icons
      height: 48 // Match topnav height
    },
    webPreferences: {
      // Since this runs from dist/electron/main.js, preload is in the same dir
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:4200'
    : url.format({
        pathname: path.join(__dirname, '../shield/browser/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-change', false);
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

import { scriptsManager } from './scripts-manager';

// IPC Communication
ipcMain.handle('get-system-status', async () => {
  return {
    status: 'SECURE',
    hardeningLevel: 98,
    lastScan: new Date().toISOString(),
  };
});

ipcMain.handle('get-firewall-status', async () => {
  return await scriptsManager.runPowerShell('firewall-status');
});

ipcMain.handle('run-script', async (_event, scriptName: string, args: string[], requiresAdmin = false) => {
  return await scriptsManager.runPowerShell(scriptName, args, requiresAdmin);
});

ipcMain.handle('is-process-admin', async () => {
  return await scriptsManager.checkAdminStatus();
});

ipcMain.handle('relaunch-as-admin', () => {
  const exe = app.getPath('exe');
  // For dev mode, we might be running electron directly, but let's assume we want to relaunch the current executable context
  // Use PowerShell to start the process with RunAs
  const command = `powershell -Command "Start-Process '${exe}' -Verb RunAs"`;
  exec(command, (error: ExecException | null) => {
      if (!error) {
        app.quit();
      }
  });
});

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});
