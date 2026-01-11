import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { NetworkService, DNSPreset } from '../../services/network.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './network.component.html',
  styleUrl: './network.component.scss'
})
export class NetworkComponent {
  network = inject(NetworkService);

  // Helper to format bytes
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async applyDNS(adapterIndex: number, preset: DNSPreset) {
    await this.network.setDNS(adapterIndex, preset.primary, preset.secondary);
  }

  async repair() {
    if (confirm('This will reset your network stack and briefly drop your connection. Continue?')) {
        const res = await this.network.repairNetwork();
        alert(res.message || 'Repair sequence completed.');
    }
  }

  async blockAds() {
    if (confirm('This will download and apply a system-wide ad-blocking hosts file. This replaces your current hosts file (a backup will be made). Continue?')) {
        await this.network.updateHosts();
        alert('Ad-blocking hosts file applied successfully!');
    }
  }

  async resetHosts() {
    if (confirm('This will reset your hosts file to Windows defaults. Continue?')) {
        await this.network.resetHosts();
        alert('Hosts file reset to default.');
    }
  }

  async randomizeMac(index: number) {
      if (confirm('Randomizing MAC address will briefly reset the adapter. You may lose connectivity for a moment. Continue?')) {
          const res = await this.network.randomizeMac(index);
          if (res.success) {
              alert('MAC Randomization successful. New MAC: ' + res.mac);
              this.network.refresh();
          } else {
              alert('Failed: ' + res.error);
          }
      }
  }

  async resetMac(index: number) {
      if (confirm('Reset MAC address to hardware default? Adapter will restart.')) {
        const res = await this.network.resetMac(index);
        if (res.success) {
            alert('MAC reset to factory default.');
            this.network.refresh();
        } else {
            alert('Failed: ' + res.error);
        }
      }
  }
}
