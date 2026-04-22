import { Component, OnInit, computed, inject, signal, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup } from '@angular/forms';


import { AppointmentsService } from './../../data-access/appointments.service';
import { AppointmentPatientsService } from './../../data-access/patients.service';
import { AppointmentProfessionalsService } from './../../data-access/professionals.service';
import { AppointmentPackagesService } from './../../data-access/packages.service';

import { toSignal } from '@angular/core/rxjs-interop';

type AppointmentForm = {
  pacienteSearch: string | null;
  fecha_agendamiento: Date | null;
  horario_inicio: string | null;
  horario_fin: string | null;
  id_paciente: number | null;
  id_profesional: number | null;
  id_paquetes: number | null;
  id_tipo_paquete: number | null;
  motivo: string | null;
};

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,

  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);

  private appointmentService = inject(AppointmentsService);
  private patientService = inject(AppointmentPatientsService);
  private professionalService = inject(AppointmentProfessionalsService);
  private packageService = inject(AppointmentPackagesService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  // ✅ FORM CORRECTO
  form = new FormGroup({
    pacienteSearch: new FormControl<string | null>(null),
    fecha_agendamiento: new FormControl<Date | null>(null),
    horario_inicio: new FormControl<string | null>(null),
    horario_fin: new FormControl<string | null>(null),
    id_paciente: new FormControl<number | null>(null),
    id_profesional: new FormControl<number | null>(null),
    id_paquetes: new FormControl<number | null>(null),
    id_tipo_paquete: new FormControl<number | null>(null),
    motivo: new FormControl<string | null>(null)
  });

  // SIGNALS
  patients = this.patientService.patients;
  professionals = this.professionalService.professionals;
  packages = this.packageService.packages;
  attentionPackages = this.packageService.attentionPackages;
  packageTypes = this.packageService.packageTypes;

  packagesLoading = signal(false);

  pacienteSearchSignal = toSignal(
    this.form.controls.pacienteSearch.valueChanges,
    { initialValue: '' }
  );

  filteredPatients = computed(() => {
    const term = (this.pacienteSearchSignal() || '').toLowerCase().trim();

    if (!term) return this.patients();

    return this.patients().filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(term) ||
      p.num_doc?.toString().includes(term)
    );
  });

  availablePackages = computed(() =>
    this.packages().filter(p => p.id_estado_citas !== 2)
  );

  attentionPackageMap = computed(() => {
    const map = new Map<number, string>();

    for (const a of this.attentionPackages()) {
      map.set(a.id, a.descripcion);
    }

    return map;
  });
  // ----------------------------------------------------
  ngOnInit() {

    this.patientService.getPatients();
    this.professionalService.loadAll();
    this.packageService.getAttentionPackages();
    this.packageService.getPackageTypes();

    // cargar paquetes al cambiar paciente
    this.form.get('id_paciente')?.valueChanges.subscribe(id => {
      if (id) {
        this.form.patchValue({ id_paquetes: null });
        this.loadPackages(id);
      }
    });

    // 🔥 EDIT MODE FIX
    if (this.data?.appointment) {
      const cita = this.data.appointment;

      this.form.patchValue({
        fecha_agendamiento: cita.fecha_agendamiento
          ? new Date(cita.fecha_agendamiento)
          : null,

        horario_inicio: cita.horario_inicio || null,
        horario_fin: cita.horario_inicio || null,

        id_profesional: cita.id_profesional || null,
        id_paquetes: cita.id_paquetes || null,

        motivo: cita.motivo || null,
        pacienteSearch: cita.paciente_nombre || null,
        id_paciente: cita.id_paciente || null
      });

      if (cita.id_paciente) {
        this.loadPackages(cita.id_paciente);
      }
    }

    if (this.data?.mode === 'view') {
      this.form.disable();
    }
  }

  // ----------------------------------------------------
  async loadPackages(patientId: number) {
    this.packagesLoading.set(true);
    await this.packageService.loadByPatient(patientId);
    this.packagesLoading.set(false);
  }

  async createPackageForPatient() {
    const patientId = this.form.value.id_paciente;
    const tipo = this.form.value.id_tipo_paquete;

    if (!patientId || !tipo) return;

    this.packagesLoading.set(true);

    const created = await this.packageService.create({
      id_pacientes: patientId,
      id_paquetes_atenciones: tipo,
      id_estado_citas: 1
    });

    await this.packageService.loadByPatient(patientId);

    this.form.patchValue({
      id_paquetes: created.id
    });

    this.packagesLoading.set(false);
  }

  selectPatient(patient: any) {
    this.form.patchValue({
      id_paciente: patient.id,
      pacienteSearch: `${patient.nombre} ${patient.apellido}`
    });

    this.loadPackages(patient.id);
  }

  // ----------------------------------------------------
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // ----------------------------------------------------
  async save() {

    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload = {
      fecha_agendamiento: raw.fecha_agendamiento
        ? this.formatDate(raw.fecha_agendamiento)
        : undefined,

      horario_inicio: raw.horario_inicio || undefined,
      horario_fin: raw.horario_fin || raw.horario_inicio || undefined,

      recordatorio: true,
      id_estado_citas: 1,

      motivo: raw.motivo || undefined,
      id_profesional: raw.id_profesional || undefined,
      id_paquetes: raw.id_paquetes ?? undefined
    };

    if (this.data?.mode === 'edit') {
      await this.appointmentService.update(this.data.appointment.id, payload);
    } else {
      await this.appointmentService.create(payload);
    }

    await this.appointmentService.refresh();
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}