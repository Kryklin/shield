import { Component, inject, computed } from '@angular/core';
import { MaterialModule } from '../../modules/material/material-module';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SystemService } from '../../services/system.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  imports: [
    RouterOutlet,
    RouterModule,
    MaterialModule,
    LogoComponent
]
})
export class SidenavComponent {
  system = inject(SystemService);

  navGroups = computed(() => {
    const isLaptop = this.system.info()?.IsLaptop;
    return [
      {
        title: 'Security & Privacy',
        icon: 'security',
        expanded: true,
        items: [
          { title: 'Hardening', icon: 'security', route: '/hardening' },
          { title: 'Browser Hardening', icon: 'public', route: '/browser' },
          { title: 'Network', icon: 'dns', route: '/network' },
          { title: 'Debloat', icon: 'cleaning_services', route: '/debloat' },
        ]
      },
      {
        title: 'System Tools',
        icon: 'build',
        expanded: false,
        items: [
          { title: 'Storage', icon: 'storage', route: '/storage' },
          { title: 'Startup', icon: 'rocket_launch', route: '/startup' },
          ...(isLaptop ? [{ title: 'Power Management', icon: 'battery_charging_full', route: '/battery' }] : [])
        ]
      },
      {
        title: 'Windows Settings',
        icon: 'settings_system_daydream',
        expanded: false,
        items: [
          { title: 'Updates', icon: 'system_update', route: '/updates' },
          { title: 'Misc Settings', icon: 'tune', route: '/misc' },
        ]
      }
    ];
  });
}

