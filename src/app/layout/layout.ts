import { Component } from '@angular/core';
import { SidebarComponent } from '../core/components/sidebar/sidebar';
import { MenuItem } from '../shared/models/menu-item';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuService } from '../core/services/menu';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../core/components/header/header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, CommonModule, RouterOutlet,HeaderComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
  menuItems: MenuItem[] = [];
  isSidebarCollapsed = false;

  private sub?: Subscription;

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.sub = this.menuService.menu$.subscribe(items => {
      this.menuItems = items;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
