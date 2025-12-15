import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuService } from '../../services/menu';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { MenuItem } from '../../../shared/models/menu-item';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {

  /** Manejo clásico: booleanos simples */
  isCollapsed: boolean = false;

  @Input() menuItems: MenuItem[] = [];
  @Input() userRoles: string[] = [];

  // constructor() {}
  private sub?: Subscription;
  constructor(private menuService: MenuService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sub = this.menuService.menu$.subscribe(items => {
      this.menuItems = items;
      this.cdr.markForCheck(); // 🔥 fuerza el refresco de OnPush
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Alternar sidebar */
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
