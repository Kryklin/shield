import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ShieldApi } from '../types/electron-bridge';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private platformId = inject(PLATFORM_ID);
  private _api: ShieldApi | undefined;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this._api = (window as any).shieldApi;
    }
  }

  get api(): ShieldApi | undefined {
    return this._api;
  }

  get isElectron(): boolean {
    return !!this._api;
  }

  // Wrapper methods for better developer experience
  
  async getSystemStatus() {
    return this._api?.getSystemStatus();
  }

  async getFirewallStatus() {
    return this._api?.getFirewallStatus();
  }

  async runScript(scriptName: string, args: string[] = [], requiresAdmin = false) {
    return this._api?.runScript(scriptName, args, requiresAdmin);
  }

  async checkAdminStatus() {
     return this._api?.checkAdminStatus() ?? Promise.resolve(false);
  }

  relaunchAsAdmin() {
    this._api?.relaunchAsAdmin();
  }

  // Auto Update
  checkForUpdates() {
    this._api?.checkForUpdates();
  }

  quitAndInstall() {
    this._api?.quitAndInstall();
  }

  onAutoUpdateStatus(callback: (status: { status: string; releaseName?: string; error?: string }) => void) {
      if (this._api?.onAutoUpdateStatus) {
        this._api.onAutoUpdateStatus(callback);
      }
  }
}
