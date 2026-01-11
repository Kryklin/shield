import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../modules/material/material-module';
import { IconsModule } from '../../modules/icons/icons-module';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [MaterialModule, IconsModule, LogoComponent],
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.scss'
})
export class TopnavComponent implements OnInit {
  isAdmin = false;

  async ngOnInit() {
    this.isAdmin = await window.shieldApi.checkAdminStatus();
  }

  async toggleAdminMode() {
    if (!this.isAdmin) {
      await window.shieldApi.relaunchAsAdmin();
    }
  }
}
