import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
// import { SettingsComponent } from './components/settings/settings.component'; // This import is no longer needed as SettingsComponent is lazy-loaded

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'hardening', loadComponent: () => import('./components/hardening/hardening.component').then(m => m.HardeningComponent) },
  { path: 'debloat', loadComponent: () => import('./components/debloat/debloat.component').then(m => m.DebloatComponent) },
  { path: 'misc', loadComponent: () => import('./components/misc/misc.component').then(m => m.MiscComponent) },
  { path: 'network', loadComponent: () => import('./components/network/network.component').then(m => m.NetworkComponent) },
  { path: 'startup', loadComponent: () => import('./components/startup/startup.component').then(m => m.StartupComponent) },
  { path: 'updates', loadComponent: () => import('./components/update/update.component').then(m => m.UpdateComponent) },
  { path: 'storage', loadComponent: () => import('./components/storage/storage.component').then(m => m.StorageComponent) },
  { path: 'battery', loadComponent: () => import('./components/battery/battery.component').then(m => m.BatteryComponent) },
  { path: 'browser', loadComponent: () => import('./components/browser/browser.component').then(m => m.BrowserComponent) },
  { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent) },
];
