import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentsService } from './data-access/appointments.service';
import { AppointmentProfessionalsService } from './data-access/professionals.service';
import { AppointmentPackagesService } from './data-access/packages.service';
import { AppointmentDialogComponent } from './components/dialog/appointment-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PaymentDialogComponent } from './payment-dialog.component';
import { effect } from '@angular/core';
import { AppointmentCalendarComponent } from './components/calendar/appointment-calendar.component';
import { Router } from '@angular/router';
import { AppointmentActionDialogComponent } from './components/action-dialog/appointment-action-dialog.component';

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
  constructor() {
    effect(() => {
      const appointments = this.appointments();

      const cache = this.packageCache();

      const idsToLoad = appointments
        .map(a => a.id_paquetes)
        .filter(
          (id): id is number =>
            !!id && !cache.has(id)
        );

      idsToLoad.forEach(id => {
        this.loadPackageDetail(id);
      });
    });
  }

  public appointmentsService = inject(AppointmentsService);
  public professionalService = inject(AppointmentProfessionalsService);
  public packageService = inject(AppointmentPackagesService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  appointments = this.appointmentsService.appointments;
  professionals = this.professionalService.professionals;

  filtro = signal('');
  filtroFecha = signal<string | null>(null);
  filtroProfesional = signal<number | null>(null);

  private packageCache = signal<Map<number, any>>(new Map());

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
    this.appointmentsService.loadAll();
  }

  private async loadPackageDetail(idPaquete: number) {
    if (!idPaquete) return;

    const cache = this.packageCache();
    if (cache.has(idPaquete)) return;

    try {
      const detail = await this.packageService.getPackageDetail(idPaquete);
      if (detail) {
        this.packageCache.set(
          new Map(this.packageCache()).set(idPaquete, detail)
        );
      }
    } catch (e) {
      console.error('Error cargando paquete', e);
    }
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
      list = list.filter(a => a.fecha_agendamiento === date);
    }

    if (prof) {
      list = list.filter(a => a.id_profesional === prof);
    }

    const cache = this.packageCache();
    const professionals = this.professionals();

    return list.map(a => {
      const paquete = a.id_paquetes
        ? cache.get(a.id_paquetes)
        : null;

      return {
        ...a,
        fecha_completa: `${a.fecha_agendamiento} ${a.horario_inicio}`,
        profesional_nombre:
          professionals.find(p => p.id === a.id_profesional)?.nombre || '—',
        paciente_nombre: paquete?.patient
          ? `${paquete.patient.nombre} ${paquete.patient.apellido}`
          : '—',
        paciente_documento: paquete?.patient?.num_doc || '—',
        paquete_nombre: paquete?.attentionPackage?.descripcion || '—',
        paquete_sesiones: paquete?.attentionPackage?.cantidad_sesiones || '—',
        estado_paquete: paquete?.statusPackage?.nombre || '—'
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
    await this.appointmentsService.delete(id);
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

    ref.afterClosed().subscribe((action: 'view' | 'edit' | 'history' | 'payment' | undefined) => {
      if (!action) return;

      if (action === 'view') {
        this.dialog.open(AppointmentDialogComponent, {
          width: '720px',
          maxWidth: '94vw',
          panelClass: 'appointments-dialog',
          backdropClass: 'appointments-backdrop',
          hasBackdrop: true,
          data: { mode: 'view', appointment: cita }
        });
        return;
      }

      if (action === 'edit') {
        this.editarCita(cita);
        return;
      }

      if (action === 'payment') {
        this.pagarCita(cita);
        return;
      }

      this.goToClinicalHistory(cita);
    });
  }

  goToClinicalHistory(cita: any) {
    if (!cita?.id) return;

    this.router.navigate(['/historias-clinicas', cita.id], {
      state: { appointment: cita }
    });
  }
}
