import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatMenuTrigger } from '../../modules/material/material-module';
import { MaterialModule } from '../../modules/material/material-module';
import { IconsModule } from '../../modules/icons/icons-module';
import { LogoComponent } from '../logo/logo.component';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [MaterialModule, IconsModule, LogoComponent],
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.scss'
})
export class TopnavComponent implements OnInit {
  isAdmin = false;
  @ViewChild('adminMenuTrigger') adminMenuTrigger!: MatMenuTrigger;

  github = inject(GithubService);

  async ngOnInit() {
    this.isAdmin = await (window as any).shieldApi.checkAdminStatus();
    
    // Check for updates on load
    this.github.checkLatestVersion();
    
    if (!this.isAdmin) {
        // Show popup after a short delay to ensure view is initialized
        setTimeout(() => {
            if (this.adminMenuTrigger) {
                this.adminMenuTrigger.openMenu();
            }
        }, 1000);
    }
  }

  async toggleAdminMode() {
    if (!this.isAdmin) {
      await (window as any).shieldApi.relaunchAsAdmin();
    }
  }
}
