import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {

  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  hovering = false;

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
