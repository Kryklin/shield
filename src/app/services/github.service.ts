import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from './electron.service';

export interface GithubRelease {
  tag_name: string;
  html_url: string;
  body: string;
  published_at: string;
}

export type UpdateStatus = 'checking' | 'uptodate' | 'outdated' | 'error' | 'downloading' | 'downloaded';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private http = inject(HttpClient);
  private electron = inject(ElectronService);
  
  // Packaged app version. In dev, we might match package.json or mock it.
  readonly CURRENT_VERSION = '0.0.8';
  readonly REPO = 'Kryklin/shield';

  updateStatus = signal<UpdateStatus>('checking');
  latestRelease = signal<GithubRelease | null>(null);
  releaseNote = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor() {
    this.checkLatestVersion();
    this.initNativeUpdater();
  }

  /**
   * Listen for native squirrel events from main process
   */
  private initNativeUpdater() {
      // If we are in the browser, this will do nothing (safe)
      this.electron.onAutoUpdateStatus((event) => {
          console.log('Native Update Status:', event);

          switch (event.status) {
              case 'checking':
                  this.updateStatus.set('checking');
                  break;
              case 'available':
                  this.updateStatus.set('downloading'); // Squirrel auto-downloads
                  break;
              case 'not-available':
                  this.updateStatus.set('uptodate');
                  break;
              case 'downloaded':
                  this.updateStatus.set('downloaded');
                  this.releaseNote.set(event.releaseName || 'New Version');
                  break;
              case 'error':
                  this.updateStatus.set('error');
                  this.error.set(event.error || 'Unknown update error');
                  break;
          }
      });
  }

  async checkLatestVersion() {
    this.updateStatus.set('checking');
    this.error.set(null);

    // 1. If running in Electron (packaged), prefer the native auto-updater
    if (this.electron.isElectron) {
       this.electron.checkForUpdates();
       return; 
    }

    // 2. Fallback for Web/Dev: Check GitHub API directly
    this.http.get<GithubRelease>(`https://api.github.com/repos/${this.REPO}/releases/latest`)
      .subscribe({
        next: (release) => {
          this.latestRelease.set(release);
          const hasUpdate = this.compareVersions(this.CURRENT_VERSION, release.tag_name);
          this.updateStatus.set(hasUpdate ? 'outdated' : 'uptodate');
        },
        error: (err) => {
          console.error('Failed to check github', err);
          this.updateStatus.set('error');
          this.error.set(err.message);
        }
      });
  }

  quitAndInstall() {
      if (this.electron.isElectron) {
          this.electron.quitAndInstall();
      }
  }

  private compareVersions(current: string, latest: string): boolean {
    const c = current.replace('v', '').split('.').map(Number);
    const l = latest.replace('v', '').split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (l[i] > c[i]) return true;
      if (l[i] < c[i]) return false;
    }
    return false;
  }
}
