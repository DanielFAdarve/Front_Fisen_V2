import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AppointmentDataService } from '../services/appointment-data-service';
import { Appointment } from '../models/appointment';
import { AppointmentFormDialogComponent } from './appointment-form-dialog/appointment-form-dialog';
import { SharedTableComponent } from '../shared/table/shared-table'; 

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    SharedTableComponent
  ],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.scss']
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentDataService);
  private dialog = inject(MatDialog);

  appointments = this.appointmentService.appointments;
  loading = this.appointmentService.loading;
  errorMessage = this.appointmentService.errorMessage;

  filtro = signal<string>('');

  filteredAppointments = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.appointments();
    if (!term) return list;

    return list.filter((a: Appointment) =>
      Object.values(a).some(val => {
        if (val === null || val === undefined) return false;
        if (val instanceof Date) {
          return val.toISOString().toLowerCase().includes(term);
        }
        return String(val).toLowerCase().includes(term);
      })
    );
  });

  // 👇 ya no incluimos "acciones", SharedTable se encarga
  displayedColumns: string[] = [
    'id', 'fecha_agendamiento', 'numero_sesion', 'motivo', 
    'id_profesional', 'id_paquetes'
  ];

  selectedAppointment = signal<Appointment | null>(null);

  ngOnInit(): void {
    this.appointmentService.getAppointments();
  }

  seleccionar(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.dialog.open(AppointmentFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { appointment, readOnly: true }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta cita?')) {
      this.appointmentService.deleteAppointment(id);
    }
  }

  nuevaCita() {
    const dialogRef = this.dialog.open(AppointmentFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { appointment: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.createAppointment(result);
      }
    });
  }

  editarCita(appointment: Appointment) {
    const dialogRef = this.dialog.open(AppointmentFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.updateAppointment(appointment.id, result);
      }
    });
  }
}
