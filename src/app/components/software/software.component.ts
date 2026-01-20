import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material/material-module';
import { SoftwareService, SoftwarePackage } from '../../services/software.service';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <div class="software-container fade-in">
      <div class="header">
        <div class="title-group">
            <h1>App Store</h1>
            <p class="subtitle">Securely install and manage software packages via Winget</p>
        </div>
        
        <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search apps (e.g. Chrome, Steam)..." 
                   [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
            <button mat-flat-button color="primary" (click)="onSearch()" [disabled]="software.isLoading()">
                Search
            </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (software.isLoading()) {
          <div class="loading-overlay glass-panel">
              <mat-spinner diameter="40"></mat-spinner>
              <p>{{ software.currentOperation() }}</p>
          </div>
      }

      <mat-tab-group animationDuration="0ms" class="custom-tabs">
        <!-- ESSENTIALS (Ninite Style) -->
        <mat-tab label="Essentials">
            <div class="essentials-wrapper">
                <div class="bulk-actions" [class.visible]="selectionCount > 0">
                    <span>{{ selectionCount }} apps selected</span>
                    <button mat-raised-button color="accent" (click)="installSelected()">
                        <mat-icon>download</mat-icon> Install Selected
                    </button>
                </div>

                <div class="categories-grid">
                    @for (cat of essentialCategories(); track cat.category) {
                        <div class="category-column">
                            <h3>{{ cat.category }}</h3>
                            <div class="app-checkboxes">
                                @for (app of cat.apps; track app.Id) {
                                    <div class="app-item" 
                                         [class.selected]="isSelected(app.Id)"
                                         (click)="toggleApp(app.Id)"
                                         (keyup.enter)="toggleApp(app.Id)"
                                         tabindex="0"
                                         role="checkbox"
                                         [attr.aria-checked]="isSelected(app.Id)">
                                        <mat-checkbox 
                                            [checked]="isSelected(app.Id)" 
                                            (click)="$event.stopPropagation(); toggleApp(app.Id)"
                                            color="primary">
                                        </mat-checkbox>
                                        <mat-icon [class.accent]="isSelected(app.Id)">{{ app.icon }}</mat-icon>
                                        <span>{{ app.Name }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </mat-tab>

        <!-- SEARCH RESULTS -->
        <mat-tab label="Search Results">
            <div class="package-list">
                @if (software.searchResults().length === 0 && !software.isLoading()) {
                    <div class="empty-state">
                        <mat-icon>search_off</mat-icon>
                        <p>No results found. Try a different query.</p>
                    </div>
                }

                @for (pkg of software.searchResults(); track pkg.Id) {
                    <div class="package-card glass-panel">
                        <div class="pkg-info">
                            <h3>{{ pkg.Name }}</h3>
                            <span class="pkg-id">{{ pkg.Id }}</span>
                            <span class="pkg-ver">v{{ pkg.Version }}</span>
                        </div>
                        <button mat-stroked-button color="primary" (click)="install(pkg)">
                            <mat-icon>download</mat-icon> Install
                        </button>
                    </div>
                }
            </div>
        </mat-tab>

        <!-- INSTALLED -->
        <mat-tab label="Installed">
            <div class="actions-bar">
                <button mat-button (click)="software.listInstalled()">
                    <mat-icon>refresh</mat-icon> Refresh List
                </button>
            </div>
            
            <div class="package-list">
                @for (pkg of software.installedPackages(); track pkg.Id) {
                    <div class="package-card glass-panel">
                        <div class="pkg-info">
                            <h3>{{ pkg.Name }}</h3>
                            <span class="pkg-id">{{ pkg.Id }}</span>
                            <span class="pkg-ver">v{{ pkg.Version }}</span>
                        </div>
                        <button mat-stroked-button color="warn" (click)="uninstall(pkg)">
                            <mat-icon>delete</mat-icon> Uninstall
                        </button>
                    </div>
                }
            </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .software-container {
        padding: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        position: relative;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
        .subtitle { margin: 4px 0 0; opacity: 0.6; font-size: 13px; }
    }

    .search-box {
        display: flex;
        align-items: center;
        background: var(--sys-surface-glass);
        padding: 4px 4px 4px 16px;
        border-radius: 12px;
        border: 1px solid var(--sys-border);
        width: 400px;
        gap: 12px;

        mat-icon { opacity: 0.5; }
        
        input {
            background: transparent;
            border: none;
            color: var(--sys-text-primary);
            flex: 1;
            outline: none;
            font-size: 14px;
            
            &::placeholder { color: var(--sys-text-tertiary); }
        }
    }

    .package-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding-top: 20px;
        padding-bottom: 40px;
    }

    .package-card {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: transform 0.2s;

        &:hover { transform: translateY(-2px); }

        .pkg-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow: hidden;
            
            h3 { 
                margin: 0; 
                font-size: 15px; 
                font-weight: 500; 
                white-space: nowrap; 
                overflow: hidden; 
                text-overflow: ellipsis; 
            }
            
            .pkg-id { font-family: monospace; font-size: 11px; opacity: 0.5; }
            .pkg-ver { font-size: 11px; color: var(--sys-primary); }
        }
    }

    /* Essentials Styles */
    .essentials-wrapper {
        padding: 24px 0;
        position: relative;
    }

    .bulk-actions {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--sys-surface); /* Fallback */
        background: var(--sys-surface-glass);
        backdrop-filter: blur(10px);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid var(--sys-primary);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        
        opacity: 0;
        pointer-events: none;
        transform: translateY(-10px);
        transition: all 0.3s;
        
        &.visible {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }

        span { font-weight: 500; font-size: 16px; }
    }

    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 32px;
    }

    .category-column {
        h3 {
            border-bottom: 1px solid var(--sys-border);
            padding-bottom: 8px;
            margin-bottom: 16px;
            color: var(--sys-primary);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }

    .app-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .app-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        
        &:hover {
            background: var(--sys-border-light);
        }
        
        &.selected {
            background: rgba(var(--sys-primary-rgb), 0.1);
            
             mat-icon { color: var(--sys-primary); }
        }
        
        mat-checkbox { pointer-events: none; } /* Handle click on parent */
        
        mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            opacity: 0.7;
        }
        
        span { font-size: 14px; }
    }

    .loading-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 32px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        backdrop-filter: blur(20px);
        border: 1px solid var(--sys-primary-dim);
    }
    
    .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        opacity: 0.5;
        gap: 16px;
        
        mat-icon { font-size: 48px; width: 48px; height: 48px; }
    }
  `]
})
export class SoftwareComponent {
  software = inject(SoftwareService);
  searchQuery = '';

  constructor() {
      this.loadEssentials();
      // Setup initial empty state or verify installed
      if (this.software.installedPackages().length === 0) {
           this.software.listInstalled();
      }
  }

  onSearch() {
      this.software.search(this.searchQuery);
  }

  async install(pkg: SoftwarePackage) {
      const result = await this.software.install(pkg.Id);
      if (result.success) {
          // Refresh installed list
          // Perhaps show a snackbar
          this.software.listInstalled();
      }
  }

  async uninstall(pkg: SoftwarePackage) {
      if (!confirm(`Are you sure you want to uninstall ${pkg.Name}?`)) return;
      
      const result = await this.software.uninstall(pkg.Id);
      if (result.success) {
          this.software.listInstalled();
      }
  }

  // essentials logic
  essentials = import('../../services/software.service').then(m => m.ESSENTIAL_APPS);
  essentialCategories = signal<{category: string, apps: {Name: string, Id: string, icon: string}[]}[]>([]); 
  selectedApps = new Set<string>();

  async loadEssentials() {
      const apps = await this.essentials;
      this.essentialCategories.set(apps);
  }

  toggleApp(id: string) {
      if (this.selectedApps.has(id)) {
          this.selectedApps.delete(id);
      } else {
          this.selectedApps.add(id);
      }
  }

  isSelected(id: string) {
      return this.selectedApps.has(id);
  }

  get selectionCount() {
      return this.selectedApps.size;
  }

  async installSelected() {
     if (this.selectedApps.size === 0) return;
     
     const ids = Array.from(this.selectedApps);
     if (!confirm(`Install ${ids.length} applications?`)) return;

     const result = await this.software.installMultiple(ids);
     if (result.success) {
         this.selectedApps.clear();
         this.software.listInstalled();
     }
  }
}
