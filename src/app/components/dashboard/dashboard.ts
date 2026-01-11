import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MaterialModule } from '../../modules/material/material-module';
import { IconsModule } from '../../modules/icons/icons-module';
import { HardeningService, HardeningModule } from '../../services/hardening.service';
import { DebloatService, DebloatModule } from '../../services/debloat.service';
import { SystemService } from '../../services/system.service';
import { NetworkService } from '../../services/network.service';
import { StartupService } from '../../services/startup.service';
import { UpdateService } from '../../services/update.service';
import { StorageService } from '../../services/storage.service';
import { BatteryService } from '../../services/battery.service';
import { RouterModule } from '@angular/router';

type DashboardItem = (HardeningModule & { source: 'hardening' }) | (DebloatModule & { source: 'debloat' });

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule, IconsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  hardening = inject(HardeningService);
  debloat = inject(DebloatService);
  system = inject(SystemService);
  
  // New Services
  network = inject(NetworkService);
  startup = inject(StartupService);
  update = inject(UpdateService);
  storage = inject(StorageService);
  battery = inject(BatteryService);

  // Combine all items with source tracking
  allItems = computed<DashboardItem[]>(() => [
    ...this.hardening.modules().map(m => ({ ...m, source: 'hardening' as const })),
    ...this.debloat.modules().map(m => ({ ...m, source: 'debloat' as const }))
  ]);

  // Metrics - Security (Hardening Only)
  totalHardening = computed(() => this.hardening.modules().length);
  secureHardening = computed(() => this.hardening.modules().filter(m => m.state?.enabled).length);
  integrityScore = computed(() => {
    if (this.totalHardening() === 0) return 0;
    return Math.round((this.secureHardening() / this.totalHardening()) * 100);
  });

  // Metrics - Optimization (Debloat Only)
  totalDebloat = computed(() => this.debloat.modules().length);
  optimizedDebloat = computed(() => this.debloat.modules().filter(m => m.state?.enabled).length);
  
  // Threat Level Logic (Based ONLY on Integrity Score)
  threatLevel = computed(() => {
    const score = this.integrityScore();
    if (score === 100) return { name: 'LOW', color: '#00e676', desc: 'No active threats. Systems hardened.' };
    if (score >= 80) return { name: 'MODERATE', color: '#2979ff', desc: 'Routine monitoring. Systems stable.' };
    if (score >= 50) return { name: 'SUBSTANTIAL', color: '#ffea00', desc: 'Increased risk. Vulnerabilities detected.' };
    return { name: 'CRITICAL', color: '#ff1744', desc: 'Severe exposure. Immediate hardening required.' };
  });

  // Startup Items Count
  startupCount = computed(() => this.startup.items().length);
  
  // Update Status Helper
  updateStatus = computed(() => {
      const status = this.update.status();
      return status ? (status.startType === 'Disabled' ? 'FROZEN' : 'ACTIVE') : 'Loading...';
  });
}
