import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink ,RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule,RouterLink, RouterModule ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  isCollapsed = false;
  openSubmenu: string | null = null;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(menu: string) {
    this.openSubmenu = this.openSubmenu === menu ? null : menu;
  }
}
