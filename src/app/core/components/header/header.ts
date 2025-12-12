import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    localStorage.removeItem('token'); // o sessionStorage
    this.router.navigate(['/login']);
  }
}
