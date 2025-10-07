import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { PatientsComponent } from './patients/patients';
import { PatientFormDialogComponent } from './patients/patient-form-dialog/patient-form-dialog';
import { AppointmentsComponent } from './appointment/appointment';
// ⚠️ Cuando tengas reportes, importas el componente o lo cargas con loadComponent

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Pacientes
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/gestion', component: PatientFormDialogComponent },

      // Citas
      { path: 'citas', component: AppointmentsComponent },

      // Reportes (ejemplo con carga diferida)
      // {
      //   path: 'reportes',
      // //   loadComponent: () =>
      // //     import('./reports/reports').then(m => m.ReportsComponent)
      // },

      // Redirección por defecto
      { path: '', redirectTo: 'patients', pathMatch: 'full' }
    ]
  },

  // Ruta wildcard: 404 o redirección
  { path: '**', redirectTo: 'patients' }
];
