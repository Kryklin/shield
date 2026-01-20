import { Injectable, inject, signal } from '@angular/core';
import { ElectronService } from './electron.service';

export interface SoftwarePackage {
  Name: string;
  Id: string;
  Version: string;
  IsInstalled?: boolean;
}

export interface WingetResult {
    success: boolean;
    items?: SoftwarePackage[];
    message?: string;
    error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {
  private electron = inject(ElectronService);
  
  installedPackages = signal<SoftwarePackage[]>([]);
  searchResults = signal<SoftwarePackage[]>([]);
  isLoading = signal<boolean>(false);
  currentOperation = signal<string | null>(null);

  async listInstalled() {
      this.isLoading.set(true);
      this.currentOperation.set('Listing installed packages...');
      try {
          const res = await this.electron.runScript('software-manager', ['-Action', 'ListInstalled']) as WingetResult;
          if (res.success && res.items) {
              // Add flag
              const items = res.items.map(i => ({...i, IsInstalled: true}));
              this.installedPackages.set(items);
          }
      } catch (err) {
          console.error('Failed to list installed software', err);
      } finally {
          this.isLoading.set(false);
          this.currentOperation.set(null);
      }
  }

  async search(query: string) {
      if (!query) return;
      this.isLoading.set(true);
      this.currentOperation.set(`Searching for "${query}"...`);
      try {
          const res = await this.electron.runScript('software-manager', ['-Action', 'Search', '-Query', query]) as WingetResult;
          if (res.success && res.items) {
              this.searchResults.set(res.items);
          } else {
              this.searchResults.set([]);
          }
      } catch (err) {
          console.error('Search failed', err);
          this.searchResults.set([]);
      } finally {
          this.isLoading.set(false);
          this.currentOperation.set(null);
      }
  }

  async install(id: string) {
      this.isLoading.set(true);
      this.currentOperation.set(`Installing ${id}...`);
      try {
          const res = await this.electron.runScript('software-manager', ['-Action', 'Install', '-Id', id], true) as WingetResult;
          return res;
      } catch (err) {
          console.error('Install failed', err);
          return { success: false, error: String(err) };
      } finally {
          this.isLoading.set(false);
          this.currentOperation.set(null);
      }
  }

  async uninstall(id: string) {
      this.isLoading.set(true);
      this.currentOperation.set(`Uninstalling ${id}...`);
      try {
          const res = await this.electron.runScript('software-manager', ['-Action', 'Uninstall', '-Id', id], true) as WingetResult;
          return res;
      } catch (err) {
          console.error('Uninstall failed', err);
          return { success: false, error: String(err) };
      } finally {
          this.isLoading.set(false);
          this.currentOperation.set(null);
      }
  }
  async installMultiple(ids: string[]) {
      this.isLoading.set(true);
      let successCount = 0;
      const total = ids.length;

      try {
          for (let i = 0; i < total; i++) {
              const id = ids[i];
              this.currentOperation.set(`Installing ${id} (${i + 1}/${total})...`);
              
              // We use the existing install but catch errors individually so one failure doesn't stop the train
              try {
                  const res = await this.electron.runScript('software-manager', ['-Action', 'Install', '-Id', id], true) as WingetResult;
                  if (res.success) successCount++;
              } catch (e) {
                  console.error(`Failed to install ${id}`, e);
              }
          }
      } finally {
          this.isLoading.set(false);
          this.currentOperation.set(null);
      }
      return { success: successCount > 0, installed: successCount, total };
  }
}

export const ESSENTIAL_APPS = [
    { category: 'Browsers', apps: [
        { Name: 'Google Chrome', Id: 'Google.Chrome', icon: 'public' },
        { Name: 'Mozilla Firefox', Id: 'Mozilla.Firefox', icon: 'language' },
        { Name: 'Brave Browser', Id: 'Brave.Brave', icon: 'shield' },
        { Name: 'Microsoft Edge', Id: 'Microsoft.Edge', icon: 'edgesensor_high' }
    ]},
    { category: 'Communication', apps: [
        { Name: 'Discord', Id: 'Discord.Discord', icon: 'chat' },
        { Name: 'Zoom', Id: 'Zoom.Zoom', icon: 'video_call' },
        { Name: 'Telegram', Id: 'Telegram.TelegramDesktop', icon: 'send' },
        { Name: 'Slack', Id: 'Slack.Slack', icon: 'work' }
    ]},
    { category: 'Media', apps: [
        { Name: 'VLC Media Player', Id: 'VideoLAN.VLC', icon: 'play_circle' },
        { Name: 'Spotify', Id: 'Spotify.Spotify', icon: 'music_note' },
        { Name: 'OBS Studio', Id: 'OBSProject.OBSStudio', icon: 'videocam' }
    ]},
    { category: 'Runtimes & Utils', apps: [
        { Name: '7-Zip', Id: '7zip.7zip', icon: 'folder_zip' },
        { Name: 'Notepad++', Id: 'Notepad++.Notepad++', icon: 'edit_note' },
        { Name: 'Node.js LTS', Id: 'OpenJS.NodeJS.LTS', icon: 'code' },
        { Name: 'Python 3.11', Id: 'Python.Python.3.11', icon: 'terminal' },
        { Name: 'Visual Studio Code', Id: 'Microsoft.VisualStudioCode', icon: 'integration_instructions' }
    ]},
    { category: 'Gaming', apps: [
        { Name: 'Steam', Id: 'Valve.Steam', icon: 'sports_esports' },
        { Name: 'Epic Games', Id: 'EpicGames.EpicGamesLauncher', icon: 'games' }
    ]}
];
