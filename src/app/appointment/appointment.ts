import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDataService } from './services/appointment.service';
import { ProfessionalDataService } from './services/professional.service';
import { PackageDataService } from './services/package.service';
import { AppointmentDialogComponent } from './components/dialog/appointment-dialog.component';
import { SharedTableComponent } from '../shared/table/shared-table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PaymentDialogComponent } from './payment-dialog.component';
import { effect } from '@angular/core';
import { AppointmentCalendarComponent } from './components/calendar/appointment-calendar.component';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    SharedTableComponent,
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

  public appointmentsService = inject(AppointmentDataService);
  public professionalService = inject(ProfessionalDataService);
  public packageService = inject(PackageDataService);
  private dialog = inject(MatDialog);

  appointments = this.appointmentsService.appointments;
  professionals = this.professionalService.professionals;

  filtro = signal('');
  filtroFecha = signal<string | null>(null);
  filtroProfesional = signal<number | null>(null);

  // 🚀 Signal para cache de paquetes
  private packageCache = signal<Map<number, any>>(new Map());

  // -------------------------------------
  // Handlers
  // -------------------------------------
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

  seleccionar(item: any) {
    console.log("Seleccionado:", item);
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

  displayedColumns = [
    'id',
    'fecha_completa',
    'paciente_nombre',
    'paciente_documento',
    'numero_sesion',
    'profesional_nombre',
    'paquete_nombre',


  ];

  nuevaCita() {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(async r => {
      if (r?.created) await this.appointmentsService.refresh();
    });
  }

  editarCita(cita: any) {
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
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
      data: cita
    });

    ref.afterClosed().subscribe(async ok => {
      if (ok) await this.appointmentsService.refresh();
    });
  }

  verDetalle(cita: any) {
    this.dialog.open(AppointmentDialogComponent, {
      width: '720px',
      data: {
        mode: 'edit',
        appointment: cita
      }
    })
  }
  
}
