import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { UpdateService } from '../../services/update.service';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="update-container fade-in">
        <div class="header">
            <mat-icon class="header-icon">system_update</mat-icon>
            <h1>Windows Update Manager</h1>
            <span class="subtitle">Control automatic updates and drivers</span>
        </div>

        <div class="glass-panel card">
            <h2>Service Status</h2>
            <div class="status-row">
                <div class="status-info">
                    <span class="label">WINDOWS UPDATE SERVICE</span>
                    <div class="val" [class.frozen]="isFrozen()">{{ isFrozen() ? 'FROZEN (Disabled)' : 'ACTIVE (Manual/Auto)' }}</div>
                </div>
                <button mat-flat-button [color]="isFrozen() ? 'primary' : 'warn'" (click)="update.toggleFreeze()">
                    {{ isFrozen() ? 'UNFREEZE UPDATES' : 'FREEZE UPDATES' }}
                </button>
            </div>
            
            <div class="divider"></div>

            <div class="status-row">
                <div class="status-info">
                    <span class="label">DRIVER UPDATES</span>
                    <div class="val" [class.frozen]="update.status()?.driversExcluded">{{ update.status()?.driversExcluded ? 'BLOCKED' : 'ALLOWED' }}</div>
                </div>
                <button mat-stroked-button (click)="update.toggleDrivers()">
                    {{ update.status()?.driversExcluded ? 'ALLOW DRIVERS' : 'BLOCK DRIVERS' }}
                </button>
            </div>
        </div>

        <div class="glass-panel card warn-card">
            <h2>Troubleshooting</h2>
            <p>If updates are failing or stuck, clearing the update cache (SoftwareDistribution) usually fixes it.</p>
            <button mat-stroked-button color="warn" (click)="clearCache()">
                <mat-icon>delete_forever</mat-icon>
                CLEAR UPDATE CACHE
            </button>
        </div>
    </div>
  `,
  styles: [`
    @use '../../styles/glass';
    .update-container { padding: 40px; max-width: 1000px; margin: 0 auto; }
    .header { margin-bottom: 32px; 
              .header-icon { font-size: 48px; height: 48px; width: 48px; color: var(--mat-sys-tertiary); margin-bottom: 16px; }
              h1 { font-size: 2.5rem; font-weight: 300; margin: 0 0 8px 0; }
              .subtitle { color: rgba(255,255,255,0.6); font-size: 1.1rem; } }
    .card { @extend %glass-panel; padding: 32px; margin-bottom: 24px; 
            h2 { margin-top: 0; font-weight: 400; } }
    .warn-card { border-left: 4px solid #ff1744; }
    .status-row { display: flex; align-items: center; justify-content: space-between; 
                  .label { font-size: 0.8rem; letter-spacing: 1px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 8px;} 
                  .val { font-size: 1.5rem; font-weight: 700; color: #4caf50; &.frozen { color: #ff1744; } } }
    .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 24px 0; }
  `]
})
export class UpdateComponent {
    update = inject(UpdateService);

    isFrozen() {
        return this.update.status()?.startType === 'Disabled';
    }

    async clearCache() {
        if(confirm('This will stop Windows Update services and clear downloaded files. Continue?')) {
            await this.update.clearCache();
            alert('Cache Cleared.');
        }
    }
}
