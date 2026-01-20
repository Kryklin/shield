import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { NetworkService, DNSPreset } from '../../services/network.service';
import { UiService } from '../../services/ui.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-network',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './network.component.html',
  styleUrl: './network.component.scss'
})
export class NetworkComponent {
  network = inject(NetworkService);
  ui = inject(UiService);

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
    if (await this.ui.confirm({ title: 'Reset Network?', message: 'This will reset your network stack and briefly drop your connection. Continue?', isDestructive: true })) {
        const res = await this.network.repairNetwork() as { success: boolean, message?: string };
        this.ui.showSnackBar(res.message || 'Repair sequence completed.');
    }
  }

  async blockAds() {
    if (await this.ui.confirm({ title: 'Update Hosts File?', message: 'This will download and apply a system-wide ad-blocking hosts file. This replaces your current hosts file (a backup will be made). Continue?' })) {
        await this.network.updateHosts();
        this.ui.showSnackBar('Ad-blocking hosts file applied successfully!');
    }
  }

  async resetHosts() {
    if (await this.ui.confirm({ title: 'Reset Hosts File?', message: 'This will reset your hosts file to Windows defaults. Continue?', isDestructive: true })) {
        await this.network.resetHosts();
        this.ui.showSnackBar('Hosts file reset to default.');
    }
  }

  async randomizeMac(index: number) {
      if (await this.ui.confirm({ title: 'Randomize MAC?', message: 'Randomizing MAC address will briefly reset the adapter. You may lose connectivity for a moment. Continue?' })) {
          const res = await this.network.randomizeMac(index) as { success: boolean, mac?: string, error?: string };
          if (res.success) {
              this.ui.showSnackBar('MAC Randomization successful. New MAC: ' + res.mac);
              this.network.refresh();
          } else {
              this.ui.showSnackBar('Failed: ' + res.error);
          }
      }
  }

  async resetMac(index: number) {
      if (await this.ui.confirm({ title: 'Reset MAC?', message: 'Reset MAC address to hardware default? Adapter will restart.', isDestructive: true })) {
        const res = await this.network.resetMac(index) as { success: boolean, error?: string };
        if (res.success) {
            this.ui.showSnackBar('MAC reset to factory default.');
            this.network.refresh();
        } else {
            this.ui.showSnackBar('Failed: ' + res.error);
        }
      }
  }
  async newIdentity() {
      if (await this.ui.confirm({ 
          title: 'Activate Kill Switch?', 
          message: 'This will randomize your MAC address, flush DNS, release/renew IP, and reset Winsock. Your connection will drop briefly. Continue?',
          isDestructive: true 
      })) {
          // 1. Randomize MAC for all active adapters
          const adapters = this.network.adapters();
          let macSuccess = false;
          
          for (const nic of adapters) {
              const res = await this.network.randomizeMac(nic.index) as { success: boolean };
              if (res.success) macSuccess = true;
          }

          // 2. Repair Network (Flush DNS, IP)
          const repairRes = await this.network.repairNetwork() as { success: boolean, message?: string };
          
          this.ui.showSnackBar(`Identity Reset: MAC ${macSuccess ? 'Randomized' : 'Unchanged'}, ${repairRes.message}`);
          
          // Refresh
          setTimeout(() => this.network.refresh(), 5000);
      }
  }
}
