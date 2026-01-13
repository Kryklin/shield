import { Injectable, signal } from '@angular/core';

export interface GithubRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  name: string;
  body: string;
}

export type UpdateStatus = 'checking' | 'uptodate' | 'outdated' | 'error';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly REPO_OWNER = 'Kryklin';
  private readonly REPO_NAME = 'shield';
  
  // Hardcoded for now, or could use environment
  private readonly CURRENT_VERSION = '0.0.6';

  latestRelease = signal<GithubRelease | null>(null);
  updateStatus = signal<UpdateStatus>('checking');
  error = signal<string | null>(null);


  /**
   * Semver comparison
   * Returns:
   *  1 if v1 > v2
   * -1 if v1 < v2
   *  0 if v1 == v2
   */
  compareVersions(v1: string, v2: string): number {
    const cleanV1 = v1.replace(/^v/, '');
    const cleanV2 = v2.replace(/^v/, '');
    
    const parts1 = cleanV1.split('.').map(Number);
    const parts2 = cleanV2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  async checkLatestVersion() {
    this.updateStatus.set('checking');
    this.error.set(null);

    try {
      const response = await fetch(`https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/releases/latest`);
      
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.statusText}`);
      }

      const release: GithubRelease = await response.json();
      this.latestRelease.set(release);

      const comparison = this.compareVersions(release.tag_name, this.CURRENT_VERSION);
      
      // If latest > current => outdated
      if (comparison > 0) {
        this.updateStatus.set('outdated');
      } else {
        this.updateStatus.set('uptodate');
      }

    } catch (err: unknown) {
      console.error('Failed to check for updates:', err);
      this.error.set(err instanceof Error ? err.message : String(err));
      this.updateStatus.set('error');
    }
  }
}
