import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { StartupService } from '../../services/startup.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="startup-container fade-in">
      <div class="header">
        <mat-icon class="header-icon">rocket_launch</mat-icon>
        <div class="header-text">
            <h1>Startup Optimizer</h1>
            <p class="subtitle">Accelerate boot times by removing unnecessary startup applications.</p>
        </div>
        <button mat-fab extended color="primary" (click)="addItem()">
            <mat-icon>add</mat-icon>
            ADD APP
        </button>
      </div>

      <div class="items-list">
        @for (item of startup.items(); track item.Name) {
            <div class="item-row">
                <div class="icon-box">
                    <mat-icon>apps</mat-icon>
                </div>
                <div class="info">
                    <h3>{{ item.Name }}</h3>
                    <code class="cmd">{{ item.Command }}</code>
                </div>
                <div class="meta">
                    <span class="badge">{{ item.Location }}</span>
                </div>
                <div class="actions">
                     <button mat-icon-button color="primary" (click)="startup.addDelayedItem(item)" matTooltip="Delay Startup (30s)">
                        <mat-icon>snooze</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="startup.removeItem(item)" matTooltip="Remove from Startup">
                        <mat-icon>delete</mat-icon>
                    </button>
                </div>
            </div>
        } @empty {
            <div class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>No startup items found. Your system is pristine!</p>
            </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../styles/glass';

    .startup-container {
      padding: 40px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
      display: flex; align-items: center; justify-content: space-between;
      .header-icon { font-size: 48px; height: 48px; width: 48px; color: var(--mat-sys-tertiary); margin-bottom: 16px; margin-right: 24px; }
      .header-text { flex: 1; 
          h1 { font-size: 2.5rem; font-weight: 300; margin: 0 0 8px 0; letter-spacing: -0.5px; }
          .subtitle { color: rgba(255,255,255,0.6); font-size: 1.1rem; margin: 0; }
      }
    }

    // Empty State
    .empty-state {
        @extend %glass-panel;
        padding: 48px;
        text-align: center;
        opacity: 0.7;
        
        mat-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 16px; opacity: 0.5; }
        p { margin: 0; font-size: 1.1rem; }
    }

    .items-list {
        @extend %glass-panel;
        padding: 0;
        
        .item-row {
            display: flex;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            gap: 20px;
            transition: background 0.2s;
            
            &:last-child { border-bottom: none; }
            &:hover { background: rgba(255,255,255,0.03); }

            .icon-box {
                width: 40px; height: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                mat-icon { color: white; }
            }

            .info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                
                h3 { margin: 0 0 4px 0; font-size: 1.1rem; font-weight: 500; }
                .cmd { font-size: 0.8rem; color: rgba(255,255,255,0.5); word-break: break-all; opacity: 0.8; }
            }

            .meta {
                display: flex;
                align-items: center;
                .badge {
                    padding: 4px 12px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.7);
                    font-weight: 500;
                }
            }

            .actions {
                display: flex;
                gap: 8px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }

            &:hover .actions { opacity: 1; }
        }
    }
  `]
})
export class StartupComponent {
  startup = inject(StartupService);
  dialog = inject(DialogService);

  async addItem() {
      const name = await this.dialog.prompt('Add Startup App', 'Enter the application name (e.g. My Script):', 'Application Name', 'My Script');
      if (!name) return;
      
      const path = await this.dialog.prompt('Add Startup App', 'Enter the full path to executable:', 'Executable Path', 'C:\\Windows\\notepad.exe');
      if (!path) return;

      await this.startup.addItem(name, path);
  }
}
