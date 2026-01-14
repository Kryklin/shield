import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatMenuTrigger } from '../../modules/material/material-module';
import { MaterialModule } from '../../modules/material/material-module';
import { IconsModule } from '../../modules/icons/icons-module';
import { LogoComponent } from '../logo/logo.component';
import { GithubService } from '../../services/github.service';
import { ElectronService } from '../../services/electron.service';

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
  private electron = inject(ElectronService);

  async ngOnInit() {
    this.isAdmin = await this.electron.checkAdminStatus();
    
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

  toggleAdminMode() {
    if (!this.isAdmin) {
      this.electron.relaunchAsAdmin();
    }
  }
}
