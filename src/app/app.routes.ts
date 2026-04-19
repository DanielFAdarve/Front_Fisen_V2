import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout';
import { PatientsComponent } from './patients/patients';
import { PatientFormDialogComponent } from './patients/patient-form-dialog/patient-form-dialog';
import { authGuard } from './authentication/auth.guard';
import { APP_ROUTES } from './core/constants/app-routes.constants';

export const routes: Routes = [
  {
    path: APP_ROUTES.login,
    loadComponent: () =>
      import('./authentication/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: APP_ROUTES.root,
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: APP_ROUTES.patients, component: PatientsComponent },
      { path: APP_ROUTES.patientManagement, component: PatientFormDialogComponent },
      {
        path: APP_ROUTES.appointments,
        loadComponent: () => import('./appointment/appointment').then((m) => m.AppointmentsComponent)
      },
      {
        path: APP_ROUTES.clinicalHistory,
        loadComponent: () => import('./clinical-history/clinical-history').then((m) => m.ClinicalHistoryComponent)
      },
      {
        path: `${APP_ROUTES.clinicalHistory}/:idCita`,
        loadComponent: () => import('./clinical-history/clinical-history').then((m) => m.ClinicalHistoryComponent)
      },
      { path: APP_ROUTES.root, redirectTo: APP_ROUTES.patients, pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: APP_ROUTES.login }
];
