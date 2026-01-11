import { Component, inject, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MaterialModule } from '../../modules/material/material-module';
import { DebloatService } from '../../services/debloat.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-debloat',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './debloat.component.html',
  styleUrl: './debloat.component.scss'
})
export class DebloatComponent implements AfterViewInit {
  debloatService = inject(DebloatService);
  route = inject(ActivatedRoute);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
        const focusId = params['focus'];
        if (focusId) {
            setTimeout(() => {
                const el = this.document.getElementById(focusId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    this.renderer.addClass(el, 'highlight-pulse');
                    setTimeout(() => this.renderer.removeClass(el, 'highlight-pulse'), 2000);
                }
            }, 300);
        }
    });
  }
}
