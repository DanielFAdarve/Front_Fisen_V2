import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { PatientsComponent } from './patients/patients';
import { PatientFormDialogComponent } from './patients/patient-form-dialog/patient-form-dialog';


export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: '', redirectTo: 'patients', pathMatch: 'full' }
    ]
  },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/gestion', component: PatientFormDialogComponent }, // gestion usuario
  // { path: 'citas', loadComponent: () => import('./pages/citas/citas.component').then(m => m.CitasComponent) },
  // { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes.component').then(m => m.ReportesComponent) },
  { path: '', redirectTo: 'patients', pathMatch: 'full' }
];

