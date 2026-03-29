import { Component, OnInit, computed, inject, signal, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { AppointmentsService } from './../../data-access/appointments.service';
import { AppointmentPatientsService } from './../../data-access/patients.service';
import { AppointmentProfessionalsService } from './../../data-access/professionals.service';
import { AppointmentPackagesService } from './../../data-access/packages.service';

import { toSignal } from '@angular/core/rxjs-interop';

type AppointmentForm = {
  fecha_agendamiento: string;
  horario_inicio: string;
  horario_fin: string;
  id_paciente: number;
  id_profesional: number;
  id_paquetes: number | null;
  id_tipo_paquete: number | null;
  motivo: string;
  pacienteSearch: string;
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
    MatAutocompleteModule
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any
  ){}

  // ----------------------------------------------------
  // FORM
  // ----------------------------------------------------
  form = this.fb.nonNullable.group<AppointmentForm>({
    pacienteSearch: '',
    fecha_agendamiento: '',
    horario_inicio: '',
    horario_fin: '',
    id_paciente: 0,
    id_profesional: 0,
    id_paquetes: null,
    id_tipo_paquete: null,
    motivo: ''
  });

  // ----------------------------------------------------
  // SIGNALS
  // ----------------------------------------------------
  patients = this.patientService.patients;
  professionals = this.professionalService.professionals;

  packages = this.packageService.packages;
  attentionPackages = this.packageService.attentionPackages;
  packageTypes = this.packageService.packageTypes;

  packagesLoading = signal(false);

  attentionPackageMap = computed(() => {
    const map = new Map<number, string>();
    for (const a of this.attentionPackages()) {
      map.set(a.id, a.descripcion);
    }
    return map;
  });

  pacienteSearchSignal = toSignal(
    this.form.controls.pacienteSearch.valueChanges,
    { initialValue: '' }
  );

  availablePackages = computed(() =>
    this.packages().filter(p => p.id_estado_citas !== 2)
  );

  hasAvailablePackages = computed(() =>
    this.availablePackages().length > 0
  );

  filteredPatients = computed(() => {

    const term = this.pacienteSearchSignal().toLowerCase().trim();

    if (!term) return this.patients();

    return this.patients().filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(term) ||
      p.num_doc?.toString().includes(term)
    );

  });

  // ----------------------------------------------------
  ngOnInit() {

    this.patientService.getPatients();
    this.professionalService.loadAll();

    this.packageService.getAttentionPackages();
    this.packageService.getPackageTypes();

    // cuando cambia paciente → cargar paquetes
    this.form.get('id_paciente')?.valueChanges.subscribe(id => {

      if (id) {

        this.form.patchValue({ id_paquetes: null });

        this.loadPackages(id);

      }

    });

    // cargar datos si viene desde calendario
    if (this.data?.appointment) {

      const cita = this.data.appointment;

      this.form.patchValue({

        fecha_agendamiento: cita.fecha_agendamiento,

        horario_inicio: cita.horario_inicio,

        horario_fin: cita.horario_inicio,

        id_profesional: cita.id_profesional,

        id_paquetes: cita.id_paquetes,

        motivo: cita.motivo,

        pacienteSearch: cita.paciente_nombre || ''

      });

      // si el paquete tiene paciente
      if (cita.id_paquetes) {

        this.loadPackages(cita.id_paciente);

      }

    }

    // bloquear en modo view
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
    const tipoPaqueteId = this.form.value.id_tipo_paquete;

    if (!patientId || !tipoPaqueteId) return;

    this.packagesLoading.set(true);

    const created = await this.packageService.create({

      id_pacientes: patientId,
      id_paquetes_atenciones: tipoPaqueteId,
      id_estado_citas: 1

    });

    await this.packageService.loadByPatient(patientId);

    this.form.patchValue({

      id_paquetes: created.id

    });

    this.packagesLoading.set(false);

  }

  selectPatient(patient:any){

    this.form.patchValue({

      id_paciente: patient.id,

      pacienteSearch: `${patient.nombre} ${patient.apellido}`

    });

    this.loadPackages(patient.id);

  }

  // ----------------------------------------------------
  async save() {

    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload = {

      fecha_agendamiento: raw.fecha_agendamiento,

      horario_inicio: raw.horario_inicio,

      horario_fin: raw.horario_fin || raw.horario_inicio,

      recordatorio: true,

      id_estado_citas: 1,

      motivo: raw.motivo,

      id_profesional: raw.id_profesional,

      id_paquetes: raw.id_paquetes

    };

    if(this.data?.mode === 'edit'){

      await this.appointmentService.update(this.data.appointment.id,payload);

    }else{

      await this.appointmentService.create(payload);

    }

    await this.appointmentService.refresh();

    this.dialogRef.close(true);

  }

  close(){

    this.dialogRef.close(false);

  }

}