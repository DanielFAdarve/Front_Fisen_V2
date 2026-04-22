import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentsService } from './data-access/appointments.service';
import { AppointmentProfessionalsService } from './data-access/professionals.service';
import { AppointmentDialogComponent } from './components/dialog/appointment-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PaymentDialogComponent } from './payment-dialog.component';
import { AppointmentCalendarComponent } from './components/calendar/appointment-calendar.component';
import { Router } from '@angular/router';
import { AppointmentActionDialogComponent } from './components/action-dialog/appointment-action-dialog.component';
import { AppointmentPackagesService } from './data-access/packages.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    AppointmentCalendarComponent

  ],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.scss']
})
export class AppointmentsComponent implements OnInit {
  constructor() {}

  public appointmentsService = inject(AppointmentsService);
  public professionalService = inject(AppointmentProfessionalsService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private packagesService = inject(AppointmentPackagesService);

  appointments = this.appointmentsService.appointments;
  professionals = this.professionalService.professionals;

  filtro = signal('');
  filtroFecha = signal<string | null>(null);
  filtroProfesional = signal<number | null>(null);

  onProfesionalChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroProfesional.set(value ? Number(value) : null);
  }

  onFechaChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filtroFecha.set(value || null);
  }

  onFiltroTexto(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filtro.set(value);
  }

  ngOnInit(): void {
    this.professionalService.loadAll();
    this.packagesService.getAttentionPackages();
    this.packagesService.getPackageTypes();
    this.appointmentsService.loadAll();
  }

  filteredAppointments = computed(() => {
    const term = this.filtro().toLowerCase();
    const date = this.filtroFecha();
    const prof = this.filtroProfesional();

    let list = [...this.appointments()];

    if (term) {
      list = list.filter(a =>
        JSON.stringify(a).toLowerCase().includes(term)
      );
    }

    if (date) {
      list = list.filter(a => (a.fecha || a.fecha_agendamiento) === date);
    }

    if (prof) {
      list = list.filter(a => a.id_profesional === prof);
    }

    const professionals = this.professionals();

    return list.map(a => {
      const fecha = a.fecha || a.fecha_agendamiento || '';
      const horarioInicio = a.hora_inicio || a.horario_inicio || '';
      const pacienteNombre = a.paciente?.trim() || '—';
      const profesionalNombre = a.profesional?.trim()
        || professionals.find(p => p.id === a.id_profesional)?.nombre
        || '—';

      return {
        ...a,
        fecha_agendamiento: fecha,
        horario_inicio: horarioInicio,
        fecha_completa: `${fecha} ${horarioInicio}`.trim(),
        profesional_nombre: profesionalNombre,
        paciente_nombre: pacienteNombre,
        paciente_documento: '—',
        paquete_nombre: '—',
        paquete_sesiones: a.numero_sesion ?? '—',
        estado_paquete: a.estado || (a.pagado ? 'Pagado' : 'Pendiente')
      };
    });
  });

  citasVisibles = computed(() => this.filteredAppointments().slice(0, 8));

  nuevaCita() {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'appointments-dialog',
      backdropClass: 'appointments-backdrop',
      hasBackdrop: true,
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(async r => {
      if (r?.created) await this.appointmentsService.refresh();
    });
  }

  editarCita(cita: any) {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'appointments-dialog',
      backdropClass: 'appointments-backdrop',
      hasBackdrop: true,
      data: { mode: 'edit', appointment: cita }
    });

    ref.afterClosed().subscribe(async r => {
      if (r?.updated) await this.appointmentsService.refresh();
    });
  }

  async eliminar(id: number) {
    await this.appointmentsService.deleteQuoteFromHistory(id);
    await this.appointmentsService.refresh();
  }

  pagarCita(cita: any) {
    const ref = this.dialog.open(PaymentDialogComponent, {
      width: '420px',
      maxWidth: '94vw',
      panelClass: 'appointments-dialog',
      backdropClass: 'appointments-backdrop',
      hasBackdrop: true,
      data: cita
    });

    ref.afterClosed().subscribe(async ok => {
      if (ok) await this.appointmentsService.refresh();
    });
  }

  verDetalle(cita: any) {
    const ref = this.dialog.open(AppointmentActionDialogComponent, {
      width: '480px',
      maxWidth: '94vw',
      data: { appointment: cita }
    });

    ref.afterClosed().subscribe((action: 'edit' | 'history' | 'payment' | 'delete' | undefined) => {
      if (!action) return;

      if (action === 'edit') {
        this.editarCita(cita);
        return;
      }

      if (action === 'payment') {
        this.pagarCita(cita);
        return;
      }

      if (action === 'delete') {
        this.eliminar(cita.id);
        return;
      }

      this.goToClinicalHistory(cita);
    });
  }

  goToClinicalHistory(cita: any) {
    if (!cita?.id) return;

    this.router.navigate(['/historias-clinicas'], {
      state: { appointment: cita }
    });
  }
}
