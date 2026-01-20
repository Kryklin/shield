import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { ElectronService } from '../../services/electron.service';
import { UiService } from '../../services/ui.service';

interface Tool {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="tools-container fade-in">
        <div class="header">
            <mat-icon class="header-icon">build_circle</mat-icon>
            <div class="title-group">
                <h1>God Mode Dashboard</h1>
                <p class="subtitle">Advanced system utilities and power user shortcuts</p>
            </div>
        </div>

        <div class="tools-grid">
            @for (tool of tools; track tool.id) {
                <div class="glass-panel tool-card" 
                     (click)="launch(tool)" 
                     (keyup.enter)="launch(tool)" 
                     tabindex="0" 
                     role="button"
                     [attr.aria-label]="'Launch ' + tool.title">
                    <div class="tool-icon" [style.color]="tool.color">
                        <mat-icon>{{ tool.icon }}</mat-icon>
                    </div>
                    <div class="tool-info">
                        <h3>{{ tool.title }}</h3>
                        <p>{{ tool.description }}</p>
                    </div>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                </div>
            }
        </div>
    </div>
  `,
  styles: [`
    .tools-container {
        padding: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .header-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: var(--sys-primary);
        }

        h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
        .subtitle { margin: 4px 0 0; opacity: 0.6; font-size: 13px; }
    }

    .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }

    .tool-card {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;

        &:hover {
            transform: translateY(-4px);
            background: var(--sys-border-light);
            border-color: var(--sys-primary-dim);
            
            .arrow {
                transform: translateX(4px);
                color: var(--sys-primary);
            }
        }

        .tool-icon {
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            mat-icon {
                font-size: 32px;
                width: 32px;
                height: 32px;
            }
        }

        .tool-info {
            flex: 1;
            h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 500; }
            p { margin: 0; font-size: 12px; opacity: 0.6; line-height: 1.4; }
        }

        .arrow {
            color: var(--sys-text-tertiary);
            transition: transform 0.2s;
        }
    }
  `]
})
export class ToolsComponent {
  electron = inject(ElectronService);
  ui = inject(UiService);

  tools: Tool[] = [
      { id: 'GodMode', title: 'Enable God Mode', description: 'Create the legendary Master Control Panel folder on your Desktop.', icon: 'bolt', color: '#FFD700' },
      { id: 'Registry', title: 'Registry Editor', description: 'View and edit the system registry (regedit).', icon: 'app_registration', color: '#00E5FF' },
      { id: 'GroupPolicy', title: 'Group Policy', description: 'Edit local group policies (gpedit.msc).', icon: 'policy', color: '#76FF03' },
      { id: 'Services', title: 'Services Manager', description: 'Start, stop, and configure Windows services.', icon: 'settings_suggest', color: '#AB47BC' },
      { id: 'TaskMgr', title: 'Task Manager', description: 'Monitor performance and kill processes.', icon: 'monitor_heart', color: '#FF1744' },
      { id: 'ControlPanel', title: 'Control Panel', description: 'Legacy system settings and tools.', icon: 'tune', color: '#2979FF' },
      { id: 'PowerShell', title: 'PowerShell Admin', description: 'Launch an elevated PowerShell terminal.', icon: 'terminal', color: '#CFD8DC' },
  ];

  async launch(tool: Tool) {
      try {
          const res = await this.electron.runScript('tools-manager', ['-Action', tool.id], true) as { success: boolean, message?: string, error?: string };
          
          if (res.success) {
              this.ui.showSnackBar(res.message || `Launched ${tool.title}`);
          } else {
              this.ui.showSnackBar(`Failed: ${res.error}`);
          }
      } catch (err) {
          this.ui.showSnackBar(`Error: ${err}`);
      }
  }
}
