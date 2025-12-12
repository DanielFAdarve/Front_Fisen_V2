import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PatientDataService } from './services/patient.service';
import { ProfessionalDataService } from './services/professional.service';
import { PackageDataService } from './services/package.service';
import { AppointmentDataService } from './services/appointment.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class AppointmentDialogComponent {

  busy = false;
  error = '';

  isEdit = false;

  form: FormGroup;

  // Signals
  patients;
  professionals;
  packages;

  packagesLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentDialogComponent>,

    private appointmentService: AppointmentDataService,
    private patientService: PatientDataService,
    private professionalService: ProfessionalDataService,
    private packageService: PackageDataService,

    @Inject(MAT_DIALOG_DATA) public data: { appointment: any | null }
  ) {

    this.patients = this.patientService.patients;
    this.professionals = this.professionalService.professionals;
    this.packages = this.packageService.packages;

    this.form = this.fb.group({
      id_paciente: ['', Validators.required],
      fecha_agendamiento: ['', Validators.required],
      horario_inicio: ['', Validators.required],
      horario_fin: ['', Validators.required],
      id_profesional: ['', Validators.required],
      id_paquetes: [null],
      motivo: ['', Validators.required],
    });

    if (data?.appointment) {
      this.isEdit = true;

      this.form.patchValue({
        id_paciente: data.appointment.id_paciente,
        fecha_agendamiento: data.appointment.fecha_agendamiento,
        horario_inicio: data.appointment.horario_inicio,
        horario_fin: data.appointment.horario_fin,
        id_profesional: data.appointment.id_profesional,
        id_paquetes: data.appointment.id_paquetes ?? null,
        motivo: data.appointment.motivo,
      });

      this.onPatientChange(data.appointment.id_paciente);
    }
  }

  // ----------------------------------------------------
  // CARGAR PAQUETES DEL PACIENTE
  // ----------------------------------------------------
  async onPatientChange(idPaciente: number) {
    if (!idPaciente) return;

    this.packagesLoading = true;
    await this.packageService.loadByPatient(+idPaciente);
    this.packagesLoading = false;
  }

  // ----------------------------------------------------
  // CREAR PAQUETE
  // ----------------------------------------------------
  async createPackageForPatient() {
    const patientId = this.form.value.id_paciente;
    if (!patientId) return;

    const newPackage = await this.packageService.create({
      id_pacientes: +patientId,
      id_paquetes_atenciones: 1,
      id_estado_citas: 1,
    });

    await this.packageService.loadByPatient(patientId);

    this.form.patchValue({ id_paquetes: newPackage.id });
  }

  // ----------------------------------------------------
  // GUARDAR
  // ----------------------------------------------------
  async save() {
    if (this.form.invalid) return;

    this.busy = true;

    const payload = {
      ...this.form.value,
      id_paciente: +this.form.value.id_paciente,
      id_profesional: +this.form.value.id_profesional,
      id_paquetes: this.form.value.id_paquetes ? +this.form.value.id_paquetes : null,
    };

    try {
      if (this.isEdit) {
        await this.appointmentService.update(this.data.appointment.id, payload);
      } else {
        await this.appointmentService.create(payload);
      }

      this.dialogRef.close(true);

    } finally {
      this.busy = false;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
