import { Component, inject, AfterViewInit, ViewChildren, QueryList, Renderer2, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialModule } from '../../modules/material/material-module';
import { HardeningService } from '../../services/hardening.service';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionPanel } from '../../modules/material/material-module';

@Component({
  selector: 'app-hardening',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './hardening.component.html',
  styleUrl: './hardening.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HardeningComponent implements AfterViewInit {
  hardeningService = inject(HardeningService);
  route = inject(ActivatedRoute);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  selectedProfileControl = new FormControl('standard', { nonNullable: true });
  newProfileControl = new FormControl('', { nonNullable: true });
  isCreating = signal(false);

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
        this.selectedProfileControl.setValue(active);
    }
  }

  // Execute hardening profile
  async applyProfile() {
      // Find name for confirmation
      const profileId = this.selectedProfileControl.value;
      const profile = this.hardeningService.profiles().find(p => p.id === profileId);
      if (!profile) return;

      if (confirm(`Apply "${profile.name}" hardening profile?\nThis will adjust settings to match the profile configuration.`)) {
          await this.hardeningService.applyProfile(profileId);
      }
  }

  toggleCreateMode() {
      this.isCreating.update(v => !v);
      this.newProfileControl.setValue('');
  }

  saveProfile() {
      const name = this.newProfileControl.value;
      if (!name.trim()) return;

      const result = this.hardeningService.saveProfile(name);
      
      if (result.success) {
          this.isCreating.set(false);
          // Select the new profile (it becomes active activeProfileId, so update local model)
          const active = this.hardeningService.activeProfileId();
          if (active) this.selectedProfileControl.setValue(active);
      } else {
          // Handle duplicate
          if (result.duplicateOf) {
              alert(`Cannot create profile. These settings match the existing profile: "${result.duplicateOf}".\n\nPlease adjust settings or use the existing profile.`);
          }
      }
  }
}
