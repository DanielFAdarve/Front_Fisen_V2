import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout';
import { PatientsComponent } from './patients/patients';
import { PatientFormDialogComponent } from './patients/patient-form-dialog/patient-form-dialog';
import { AppointmentsComponent } from './appointment/appointment';
import { authGuard } from './authentication/auth.guard';

export const routes: Routes = [

  // 🔹 LOGIN (no requiere token)
  {
    path: 'login',
    loadComponent: () =>
      import('./authentication/login/login.component').then(m => m.LoginComponent),
  },

  // 🔹 RUTAS INTERNAS PROTEGIDAS
  {
    path: '',
    canActivate: [authGuard],    
    component: LayoutComponent,
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/gestion', component: PatientFormDialogComponent },
      { path: 'citas', component: AppointmentsComponent },

      // Default interno
      { path: '', redirectTo: 'patients', pathMatch: 'full' }
    ]
  },

  // 🔹 Wildcard
  { path: '**', redirectTo: 'login' }
];
