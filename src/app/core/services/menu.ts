import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../../shared/models/menu-item';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private _menu$ = new BehaviorSubject<MenuItem[]>(this.defaultMenu());
  readonly menu$ = this._menu$.asObservable();

  private defaultMenu(): MenuItem[] {
    return [
      {
        id:'patients',
        label:'Pacientes',
        icon:'fas fa-users',
        children:[
          { label:'Lista Pacientes', icon:'fas fa-list', route:'/patients' },
          { label:'Gestión Usuario', icon:'fas fa-user-cog', route:'/patients/gestion', badge:{text:'NEW'} }
        ]
      },
      { id:'citas', label:'Citas', icon:'fas fa-calendar-alt', route:'/citas', badge:{text:'5'} },
      { id:'reportes', label:'Reportes', icon:'fas fa-chart-bar', route:'/reportes' }
    ];
  }

  setMenu(menu: MenuItem[]) { this._menu$.next(menu); }
}
