import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { MiscService } from '../../services/misc.service';

@Component({
  selector: 'app-misc',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './misc.component.html',
  styleUrl: './misc.component.scss'
})
export class MiscComponent {
  miscService = inject(MiscService);

  async toggle(id: string, state: boolean) {
    await this.miscService.toggleModule(id, state);
  }
}
