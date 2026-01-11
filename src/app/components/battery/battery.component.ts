import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { BatteryService } from '../../services/battery.service';

@Component({
  selector: 'app-battery',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './battery.component.html',
  styleUrl: './battery.component.scss'
})
export class BatteryComponent {
  battery = inject(BatteryService);

  getBatteryColor(percent: number): string {
    if (percent > 50) return '#00e676'; // Green
    if (percent > 20) return '#ffea00'; // Yellow
    return '#ff1744'; // Red
  }

  async setPlan(id: string) {
    await this.battery.setPlan(id);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0] as File & { path: string };
        if (file.path) {
            await this.battery.importPlan(file.path);
            alert('Power Plan Imported!');
        }
    }
  }
}
