import { Injectable, signal } from '@angular/core';

export interface NetworkAdapter {
  index: number;
  name: string;
  description: string;
  mac: string;
  status: string;
  linkSpeed: string;
  ip: string;
  dns: string;
  bytesSent: number;
  bytesReceived: number;
}

export interface DNSPreset {
  name: string;
  primary: string;
  secondary: string;
}

export const DNS_PRESETS: DNSPreset[] = [
  { name: 'Automatic (DHCP)', primary: '', secondary: '' },
  { name: 'Cloudflare (Fastest)', primary: '1.1.1.1', secondary: '1.0.0.1' },
  { name: 'Google (Stable)', primary: '8.8.8.8', secondary: '8.8.4.4' },
  { name: 'AdGuard (Block Ads)', primary: '94.140.14.14', secondary: '94.140.15.15' },
  { name: 'Quad9 (Secure)', primary: '9.9.9.9', secondary: '149.112.112.112' }
];

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  adapters = signal<NetworkAdapter[]>([]);
  loading = signal<boolean>(false);
  
  presets = DNS_PRESETS;

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      const result = await (window as any).shieldApi.runScript('network-manager', ['-Action', 'GetAdapters']) as NetworkAdapter[] | NetworkAdapter;
      this.adapters.set(Array.isArray(result) ? result : [result]);
      
      this.getGatewayStats();
    } catch (err) {
      console.error('Failed to get adapters:', err);
    } finally {
      this.loading.set(false);
    }
  }

  gateway = signal<{ip: string, latency: number} | null>(null);

  async getGatewayStats() {
      const ipRes = await (window as any).shieldApi.runScript('network-manager', ['-Action', 'GetPublicIP']) as { ip: string };
      const latRes = await (window as any).shieldApi.runScript('network-manager', ['-Action', 'TestLatency']) as { latency: number };
      
      this.gateway.set({
          ip: ipRes.ip,
          latency: latRes.latency
      });
  }

  async setDNS(index: number, primary: string, secondary: string) {
    this.loading.set(true);
    try {
      await (window as any).shieldApi.runScript('network-manager', [
        '-Action', 'SetDNS', 
        '-AdapterIndex', index.toString(),
        '-DNS1', primary,
        '-DNS2', secondary
      ]);
      await this.refresh();
    } catch (err) {
      console.error('Failed to set DNS:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async repairNetwork() {
    return await (window as any).shieldApi.runScript('network-manager', ['-Action', 'Repair']);
  }

  async updateHosts() {
    this.loading.set(true);
    try {
        await (window as any).shieldApi.runScript('network-manager', ['-Action', 'UpdateHosts'], true); 
        // true for requiresAdmin, though standard runScript might implicitly suffice if main proc allows it. 
        // Actually runScript sig is (name, args, requiresAdmin?), let's pass true to be safe/explicit if supported.
    } catch (err) {
        console.error('Failed to update hosts:', err);
        throw err;
    } finally {
        this.loading.set(false);
    }
  }

  async resetHosts() {
    this.loading.set(true);
    try {
        await (window as any).shieldApi.runScript('network-manager', ['-Action', 'ResetHosts'], true);
    } catch (err) {
        console.error('Failed to reset hosts:', err);
        throw err;
    } finally {
        this.loading.set(false);
    }
  }

  async randomizeMac(index: number) {
      // Requires Admin
      return await (window as any).shieldApi.runScript('network-manager', ['-Action', 'SetMacAddress', '-AdapterIndex', index.toString()], true);
  }

  async resetMac(index: number) {
      // Requires Admin
      return await (window as any).shieldApi.runScript('network-manager', ['-Action', 'ResetMacAddress', '-AdapterIndex', index.toString()], true);
  }

  async runPingTest() {
      return await (window as any).shieldApi.runScript('network-manager', ['-Action', 'PingTest']);
  }
}
