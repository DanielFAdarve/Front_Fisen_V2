import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../shared/models/menu-item';
import { listStagger } from '../../../shared/animations/stagger';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listStagger]
})
export class SidebarComponent {

  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;

  @Input() menuItems: MenuItem[] | null = null;
  @Input() userRoles: string[] = [];

  @Output() toggle = new EventEmitter<void>();

  openSubmenu = signal<string | null>(null);

  toggleSub(label: string) {
    this.openSubmenu.set(
      this.openSubmenu() === label ? null : label
    );
  }

  trackByLabel(i: number, item: MenuItem) {
    return item?.label || i;
  }

  // canShow(item: MenuItem) {

  //   if (!item.roles) return true;
  //   return item.roles.some(r => this.userRoles.includes(r));
  // }

  canShow(item: MenuItem): boolean {
    if (!item || item.disabled) return false;
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(r => this.userRoles.includes(r));
  }
}
