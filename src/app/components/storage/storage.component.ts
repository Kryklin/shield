import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="storage-container fade-in">
        <div class="header">
            <mat-icon class="header-icon">storage</mat-icon>
            <h1>Storage Cleaner</h1>
            <span class="subtitle">Manage disk space and junk files</span>
        </div>

        <div class="glass-panel card disk-visual">
            <h3>Connected Drives</h3>
            @if (storage.drives(); as drives) {
                <div class="drives-grid">
                    @for (drive of drives; track drive.name) {
                        <div class="drive-item">
                            <div class="info-row">
                                <span class="drive-name">{{ drive.name }} ({{ drive.description || 'Local Disk' }})</span>
                                <span class="drive-free">{{ formatBytes(drive.free) }} Free</span>
                            </div>
                            <mat-progress-bar mode="determinate" [value]="drive.percentFree ? 100 - drive.percentFree : 0"></mat-progress-bar>
                            <div class="drive-meta">
                                <span>{{ formatBytes(drive.used) }} Used</span>
                                <span>{{ formatBytes(drive.total) }} Total</span>
                            </div>
                        </div>
                    }
                </div>
            } @else {
                <mat-spinner diameter="24"></mat-spinner>
            }
        </div>

        <div class="glass-panel card tools-section">
            <h3>Cleaning Tools</h3>
            <div class="tools-grid">
                <!-- Tool 1: Quick Clean -->
                <div class="tool-card">
                    <div class="tool-icon">
                        <mat-icon>cleaning_services</mat-icon>
                    </div>
                    <h4>Quick Clean</h4>
                    <p>Clear temporary files, browser cache, and recycle bin items.</p>
                    <button mat-flat-button color="primary" (click)="storage.clean()">
                        RUN CLEANER
                    </button>
                </div>

                <!-- Tool 2: Deep Clean -->
                <div class="tool-card">
                    <div class="tool-icon warn">
                        <mat-icon>delete_forever</mat-icon>
                    </div>
                    <h4>Deep System Clean</h4>
                    <p>Advanced cleanup. Stops update services to clear system caches.</p>
                    <button mat-stroked-button color="warn" (click)="deepClean()">
                        DEEP CLEAN
                    </button>
                </div>

                <!-- Tool 3: Storage Sense -->
                <div class="tool-card">
                    <div class="tool-icon accent">
                        <mat-icon>auto_delete</mat-icon>
                    </div>
                    <h4>Storage Sense</h4>
                    <p>Configure Windows to automatically free up space.</p>
                    <button mat-stroked-button (click)="toggleSense()">
                        TOGGLE
                    </button>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    @use '../../styles/glass';
    .storage-container { padding: 40px; max-width: 1000px; margin: 0 auto; }
    .header { margin-bottom: 32px; 
              .header-icon { font-size: 48px; height: 48px; width: 48px; color: var(--mat-sys-tertiary); margin-bottom: 16px; }
              h1 { font-size: 2.5rem; font-weight: 300; margin: 0 0 8px 0; }
              .subtitle { color: rgba(255,255,255,0.6); font-size: 1.1rem; } }
    .card { @extend %glass-panel; padding: 40px; }
    .disk-visual { margin-bottom: 40px; } 
    .drives-grid { display: flex; flex-direction: column; gap: 24px; margin-top: 16px; }
    .drive-item { 
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 1.1rem; font-weight: 500; }
        .drive-meta { display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.85rem; opacity: 0.6; }
    }
    .tools-section { margin-top: 10px; }
    .tools-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
        gap: 24px; 
        margin-top: 24px; 
    }
    .tool-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.2s ease, background 0.2s;

        &:hover {
            transform: translateY(-4px);
            background: rgba(255,255,255,0.06);
        }

        .tool-icon {
            width: 64px; height: 64px;
            background: rgba(var(--primary-rgb), 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            
            mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--primary-color); }

            &.warn { background: rgba(255, 23, 68, 0.1); mat-icon { color: #ff1744; } }
            &.accent { background: rgba(41, 121, 255, 0.1); mat-icon { color: #2979ff; } }
        }

        h4 { margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 500; }
        p { margin: 0 0 24px 0; font-size: 0.9rem; opacity: 0.6; line-height: 1.4; flex-grow: 1; }
        button { width: 100%; }
    }
  `]
})
export class StorageComponent {
    storage = inject(StorageService);

    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 GB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }

    async deepClean() {
        if (confirm('Deep Clean will stop Windows Update services temporarily and clear update caches. Continue?')) {
            const res = await this.storage.deepClean();
            alert(res.message || (res.success ? 'Deep clean finished.' : 'Failed: ' + res.error));
            this.storage.refresh();
        }
    }

    async toggleSense() {
        const res = await this.storage.toggleStorageSense();
        alert(res.enabled ? 'Windows Storage Sense Enabled' : 'Windows Storage Sense Disabled');
    }
}
