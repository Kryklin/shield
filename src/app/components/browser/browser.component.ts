import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { BrowserService } from '../../services/browser.service';

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="browser-container fade-in">
        <div class="header">
            <mat-icon class="header-icon">public</mat-icon>
            <div class="header-text">
                <h1>Browser Hardening</h1>
                <p class="subtitle">Enforce enterprise-grade privacy and security policies for your web browsers.</p>
            </div>
        </div>

        <div class="grid">
            <!-- Chrome -->
            <div class="glass-panel browser-card chrome">
                <div class="card-header">
                    <mat-icon>language</mat-icon>
                    <h2>Google Chrome</h2>
                </div>
                <div class="features">
                    <ul>
                        <li><mat-icon>cookie_off</mat-icon> Block 3rd Party Cookies</li>
                        <li><mat-icon>visibility_off</mat-icon> Disable Telemetry</li>
                        <li><mat-icon>password</mat-icon> Disable Password Manager</li>
                    </ul>
                </div>
                <div class="status" [class.active]="browser.status().chrome">
                    <mat-icon>{{ browser.status().chrome ? 'lock' : 'lock_open' }}</mat-icon>
                    {{ browser.status().chrome ? 'POLICIES ACTIVE' : 'UNMANAGED' }}
                </div>
                <button mat-flat-button color="primary" [disabled]="browser.loading()" (click)="harden('Chrome')">
                    APPLY HARDENING
                </button>
            </div>

            <!-- Edge -->
            <div class="glass-panel browser-card edge">
                <div class="card-header">
                    <mat-icon>edgesensor_high</mat-icon>
                    <h2>Microsoft Edge</h2>
                </div>
                <div class="features">
                    <ul>
                        <li><mat-icon>shopping_cart_off</mat-icon> Disable Shopping Asst</li>
                        <li><mat-icon>ads_click</mat-icon> Disable Ad ID</li>
                        <li><mat-icon>security</mat-icon> Prevent Typosquatting</li>
                    </ul>
                </div>
                <div class="status" [class.active]="browser.status().edge">
                    <mat-icon>{{ browser.status().edge ? 'lock' : 'lock_open' }}</mat-icon>
                    {{ browser.status().edge ? 'POLICIES ACTIVE' : 'UNMANAGED' }}
                </div>
                <button mat-flat-button color="primary" [disabled]="browser.loading()" (click)="harden('Edge')">
                    APPLY HARDENING
                </button>
            </div>

            <!-- Firefox -->
            <div class="glass-panel browser-card firefox">
                <div class="card-header">
                    <mat-icon>explore</mat-icon>
                    <h2>Mozilla Firefox</h2>
                </div>
                <div class="features">
                    <ul>
                        <li><mat-icon>dns</mat-icon> Force DNS over HTTPS</li>
                        <li><mat-icon>analytics</mat-icon> Disable Telemetry</li>
                        <li><mat-icon>extension_off</mat-icon> Disable Pocket</li>
                    </ul>
                </div>
                <div class="status" [class.active]="browser.status().firefox">
                    <mat-icon>{{ browser.status().firefox ? 'lock' : 'lock_open' }}</mat-icon>
                    {{ browser.status().firefox ? 'POLICIES ACTIVE' : 'UNMANAGED' }}
                </div>
                <button mat-flat-button color="primary" [disabled]="browser.loading()" (click)="harden('Firefox')">
                    APPLY HARDENING
                </button>
            </div>
        </div>
    </div>
  `,
  styles: [`
    @use '../../styles/glass';
    .browser-container { padding: 40px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; align-items: center; margin-bottom: 40px; 
              .header-icon { font-size: 48px; height: 48px; width: 48px; margin-right: 24px; color: var(--mat-sys-tertiary); }
              .header-text h1 { margin: 0 0 8px 0; font-size: 2.5rem; font-weight: 300; }
              .header-text p { margin: 0; opacity: 0.6; font-size: 1.1rem; } }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    
    .browser-card {
        @extend %glass-panel;
        padding: 32px;
        display: flex; flex-direction: column; align-items: center; text-align: center;
        transition: transform 0.2s;
        
        &:hover { transform: translateY(-4px); }

        .card-header { margin-bottom: 24px; 
                       mat-icon { font-size: 64px; height: 64px; width: 64px; margin-bottom: 16px; opacity: 0.9; }
                       h2 { margin: 0; font-weight: 400; } }

        .features { flex: 1; width: 100%; margin-bottom: 32px;
                    ul { list-style: none; padding: 0; margin: 0; text-align: left; }
                    li { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
                         mat-icon { margin-right: 12px; font-size: 18px; height: 18px; width: 18px; opacity: 0.7; } } }

        .status { 
            margin-bottom: 24px; padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.05);
            font-size: 0.8rem; letter-spacing: 1px; font-weight: 600; display: flex; align-items: center; gap: 8px;
            color: rgba(255,255,255,0.5);
            
            &.active { background: rgba(var(--mat-sys-primary-rgb), 0.2); color: var(--mat-sys-primary); }
            mat-icon { font-size: 16px; height: 16px; width: 16px; }
        }
        
        button { width: 100%; padding: 24px 0; font-letter-spacing: 1px; }

        &.chrome .card-header mat-icon { color: #fe554d; } // fake chrome color or just use theme
        &.edge .card-header mat-icon { color: #0078d7; }
        &.firefox .card-header mat-icon { color: #ff9500; }
    }
  `]
})
export class BrowserComponent {
    browser = inject(BrowserService);

    async harden(name: 'Chrome' | 'Edge' | 'Firefox') {
        if (confirm(`Apply security policies to ${name}? This acts at a Registry level and may block some convenience features.`)) {
            const res = await this.browser.hardenBrowser(name);
            if (res.success) {
                alert(`${name} hardened successfully.`);
            } else {
                alert(`Failed: ${res.error}`);
            }
        }
    }
}
