import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MenuItem } from '../../../shared/models/menu-item';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  animations: [
    trigger('submenu', [
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', animate('250ms ease-in-out')),
    ]),
    trigger('sidebarState', [
      state('open', style({ transform: 'translateX(0)' })),
      state('closed', style({ transform: 'translateX(-100%)' })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ])
  ]
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Input() menuItems: MenuItem[] = [];
  @Input() userRoles: string[] = []; // pasar desde AuthService/parent
  @Output() toggle = new EventEmitter<void>();

  openSubmenu: string | null = null;

  toggleSubmenu(label: string) {
    this.openSubmenu = this.openSubmenu === label ? null : label;
  }

  canShow(item: MenuItem): boolean {
    if (!item || item.disabled) return false;
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(r => this.userRoles.includes(r));
  }
}
