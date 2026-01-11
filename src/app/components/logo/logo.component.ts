import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [style.width]="size" 
      [style.height]="size" 
      viewBox="0 0 100 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="shield-logo">
      
      <!-- Definitions for Gradients/Filters -->
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.2" />
          <stop offset="50%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0.2" />
        </linearGradient>
      </defs>

      <!-- Connection Links (The "Network") -->
      <g class="links" stroke="url(#linkGradient)">
        <!-- Rim Connections -->
        <line x1="15" y1="15" x2="50" y2="5"  class="link l1" />
        <line x1="50" y1="5"  x2="85" y2="15" class="link l2" />
        <line x1="85" y1="15" x2="85" y2="55" class="link l3" />
        <line x1="85" y1="55" x2="50" y2="105" class="link l4" />
        <line x1="50" y1="105" x2="15" y2="55" class="link l5" />
        <line x1="15" y1="55" x2="15" y2="15" class="link l6" />
        
        <!-- Internal Network -->
        <line x1="15" y1="15" x2="50" y2="45" class="link l7" />
        <line x1="50" y1="5"  x2="50" y2="45" class="link l8" />
        <line x1="85" y1="15" x2="50" y2="45" class="link l9" />
        <line x1="85" y1="55" x2="50" y2="45" class="link l10" />
        <line x1="15" y1="55" x2="50" y2="45" class="link l11" />
        <line x1="50" y1="105" x2="50" y2="45" class="link l12" />
      </g>

      <!-- Nodes (The "Vertices") -->
      <g class="nodes" fill="var(--primary-color)">
        <circle cx="15" cy="15" r="3" class="node n1" />
        <circle cx="50" cy="5"  r="3" class="node n2" />
        <circle cx="85" cy="15" r="3" class="node n3" />
        <circle cx="15" cy="55" r="3" class="node n4" />
        <circle cx="85" cy="55" r="3" class="node n5" />
        <circle cx="50" cy="105" r="3" class="node n6" />
        
        <!-- Core Node -->
        <circle cx="50" cy="45" r="5" class="node core" />
      </g>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      --primary-color: #00e676; 
    }

    .shield-logo {
      overflow: visible;
    }

    .node {
      filter: url(#glow);
      animation: pulse 1.5s infinite ease-in-out;
      transform-box: fill-box;
      transform-origin: center;
    }
    
    .core {
        animation-duration: 2s; 
    }
    
    .link {
      stroke-width: 1.5;
      stroke-linecap: round;
      animation: flow 2s infinite linear;
      opacity: 0.8;
    }
    
    /* Hover State - Supercharge */
    :host:hover {
        transform: scale(1.1);
        filter: drop-shadow(0 0 15px var(--primary-color));
    }
    
    :host:hover .node {
        animation-duration: 0.5s;
        fill: #b9f6ca; /* Brighter Green */
    }
    
    :host:hover .link {
        animation-duration: 0.8s;
        stroke: #b9f6ca;
        stroke-width: 2;
        opacity: 1;
    }
    
    :host {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease;
    }

    /* Staggered Node Animations */
    .n1, .n2, .n3 { animation-delay: 0.5s; }
    .n4, .n5 { animation-delay: 1s; }
    .n6 { animation-delay: 1.5s; }

    /* Staggered Link Animations */
    .l1, .l2 { animation-delay: 0s; }
    .l3, .l6 { animation-delay: 1s; }
    .l4, .l5 { animation-delay: 2s; }
    .l7, .l8, .l9 { animation-delay: 0.5s; }
    .l10, .l11 { animation-delay: 1.5s; }
    .l12 { animation-delay: 2.5s; }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    @keyframes flow {
      0% { stroke-dasharray: 10, 50; stroke-dashoffset: 60; opacity: 0.3; }
      50% { opacity: 1; }
      100% { stroke-dasharray: 10, 50; stroke-dashoffset: 0; opacity: 0.3; }
    }
  `]
})
export class LogoComponent {
  @Input() size = '40px';
}
