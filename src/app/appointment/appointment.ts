import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDataService } from './services/appointment.service';
import { PatientDataService } from './services/patient.service';
import { ProfessionalDataService } from './services/professional.service';
import { PackageDataService } from './services/package.service';
import { AppointmentDialogComponent } from './appointment-dialog.component';
import { SharedTableComponent } from '../shared/table/shared-table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PaymentDialogComponent } from './payment-dialog.component';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatInputModule, SharedTableComponent],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.scss']
})
export class AppointmentsComponent implements OnInit {
  private appointmentsService = inject(AppointmentDataService);
  private patientService = inject(PatientDataService);
  private professionalService = inject(ProfessionalDataService);
  private packageService = inject(PackageDataService);
  private dialog = inject(MatDialog);


  appointments = this.appointmentsService.appointments;
  loading = this.appointmentsService.loading;
  errorMessage = this.appointmentsService.errorMessage;


  filtro = signal('');


  filteredAppointments = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.appointments();
    if (!term) return list;
    return list.filter((c: any) =>
      Object.values(c).some((val: any) =>
        val?.toString().toLowerCase().includes(term)
      )
    );
  });


  displayedColumns = ['id', 'fecha_agendamiento', 'numero_sesion', 'motivo', 'id_profesional', 'id_paquetes' ];


  ngOnInit(): void {
    this.patientService.getPatients();
    this.professionalService.loadAll();
    this.packageService.getAttentionPackages();
    this.appointmentsService.loadAll();
  }


  nuevaCita() {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      data: { mode: 'create' }
    });


    ref.afterClosed().subscribe(async (result: any) => {
      if (result?.created) {
        await this.appointmentsService.refresh();
      }
    });
  }


  editarCita(cita: any) {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      data: { mode: 'edit', appointment: cita }
    });


    ref.afterClosed().subscribe(async (result: any) => {
      if (result?.updated) {
        await this.appointmentsService.refresh();
      }
    });
  }
  seleccionar(cita: any) {
    console.log('ver', cita);
  }


  async eliminar(id: number) {
    await this.appointmentsService.delete(id);
    await this.appointmentsService.refresh();
  }

  pagarCita(cita: any) {
    const ref = this.dialog.open(PaymentDialogComponent, {
      width: '420px',
      data: cita
    });

    ref.afterClosed().subscribe(async done => {
      if (done) {
        await this.appointmentsService.refresh();
      }
    });
  }
}