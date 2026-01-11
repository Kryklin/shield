import { Component, inject, AfterViewInit, ViewChildren, QueryList, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../modules/material/material-module';
import { HardeningService } from '../../services/hardening.service';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionPanel } from '../../modules/material/material-module';

@Component({
  selector: 'app-hardening',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './hardening.component.html',
  styleUrl: './hardening.component.scss'
})
export class HardeningComponent implements AfterViewInit {
  hardeningService = inject(HardeningService);
  route = inject(ActivatedRoute);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  selectedProfileId: string = 'standard';
  isCreating = false;
  newProfileName = '';

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      const focusId = params['focus'];
      if (focusId) {
        // Find index of module to open panel
        const index = this.hardeningService.modules().findIndex(m => m.id === focusId);
        
        setTimeout(() => {
          // Open the panel
          if (index !== -1 && this.panels) {
            this.panels.get(index)?.open();
          }

          // Scroll to it
          const el = this.document.getElementById(focusId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.renderer.addClass(el, 'highlight-pulse');
            setTimeout(() => this.renderer.removeClass(el, 'highlight-pulse'), 2000);
          }
        }, 300);
      }
    });

    // Initialize dropdown
    const active = this.hardeningService.activeProfileId();
    if (active) {
        this.selectedProfileId = active;
    }
  }

  // Execute hardening profile
  async applyProfile() {
      // Find name for confirmation
      const profile = this.hardeningService.profiles().find(p => p.id === this.selectedProfileId);
      if (!profile) return;

      if (confirm(`Apply "${profile.name}" hardening profile?\nThis will adjust settings to match the profile configuration.`)) {
          await this.hardeningService.applyProfile(this.selectedProfileId);
      }
  }

  toggleCreateMode() {
      this.isCreating = !this.isCreating;
      this.newProfileName = '';
  }

  saveProfile() {
      if (!this.newProfileName.trim()) return;

      const result = this.hardeningService.saveProfile(this.newProfileName);
      
      if (result.success) {
          this.isCreating = false;
          // Select the new profile (it becomes active activeProfileId, so update local model)
          const active = this.hardeningService.activeProfileId();
          if (active) this.selectedProfileId = active;
      } else {
          // Handle duplicate
          if (result.duplicateOf) {
              alert(`Cannot create profile. These settings match the existing profile: "${result.duplicateOf}".\n\nPlease adjust settings or use the existing profile.`);
          }
      }
  }
}
