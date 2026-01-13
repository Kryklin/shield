import { Component, signal } from '@angular/core';
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { TopnavComponent } from "./components/topnav/topnav.component";

@Component({
  selector: 'app-root',
  imports: [SidenavComponent, TopnavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('shield');
}
