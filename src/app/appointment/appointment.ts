import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AppointmentDataService } from '../services/appointment-data-service';
import { PatientDataService } from '../services/patient-data-service';
import { Appointment } from '../models/appointment';
import { SharedTableComponent } from '../shared/table/shared-table';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule,SharedTableComponent ],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.scss']
})
export class AppointmentsComponent implements OnInit {

  private appointmentsService = inject(AppointmentDataService);
  private patientService = inject(PatientDataService);
  private dialog = inject(MatDialog);

  appointments = this.appointmentsService.appointments;
  loading = this.appointmentsService.loading;
  errorMessage = this.appointmentsService.errorMessage;

  filtro = signal('');

  filteredAppointments = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.appointments();

    if (!term) return list;

    return list.filter((c) =>
      Object.values(c).some((val: any) =>
        val?.toString().toLowerCase().includes(term)
      )
    );
  });

  displayedColumns = [
    'id',
    'id_paciente',
    'fecha_agendamiento',
    'numero_sesion',
    'motivo',
    'id_profesional',
    'id_paquetes'
  ];

  ngOnInit(): void {
    // Primero cargar pacientes
    this.patientService.getPatients();

    // Cuando los pacientes ya están cargados, generamos citas
    setTimeout(() => {
      this.appointmentsService.seedAppointments();
    }, 400);
  }

  seleccionar(cita: Appointment) {
    console.log("Ver cita", cita);
  }

  eliminar(id: number) {
    this.appointmentsService.eliminarCita(id);
  }

  nuevaCita() {
    console.log("Abrir diálogo crear cita");
  }

  editarCita(cita: Appointment) {
    console.log("Editar cita", cita);
  }
}
