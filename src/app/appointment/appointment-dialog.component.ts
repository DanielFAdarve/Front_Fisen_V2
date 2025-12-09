// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AppointmentDataService } from './services/appointment.service';
// import { PatientDataService } from './services/patient.service';
// import { ProfessionalDataService } from './services/professional.service';
// import { PackageDataService } from './services/package.service';
// import { Appointment } from './models/appointment.model';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatButtonModule } from '@angular/material/button';
// import { firstValueFrom } from 'rxjs';
// import { computed } from '@angular/core';

// @Component({
//   selector: 'app-appointment-dialog',
//   standalone: true,
//   imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule],
//   templateUrl: './appointment-dialog.component.html',
//   styleUrls: ['./appointment-dialog.component.scss']
// })
// export class AppointmentDialogComponent {
//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);
//   private data = inject(MAT_DIALOG_DATA);
//   private appointmentService = inject(AppointmentDataService);
//   private patientService = inject(PatientDataService);
//   private professionalService = inject(ProfessionalDataService);
//   private packageService = inject(PackageDataService);


//   form: FormGroup;
//   // patients$ = this.patientService.patients;
//   // professionals$ = this.professionalService.professionals;
//   // packages$ = this.packageService.attentionPackages;
//   patients = computed(() => this.patientService.patients() ?? []);
//   professionals = computed(() => this.professionalService.professionals() ?? []);
//   packages = computed(() => this.packageService.attentionPackages() ?? []); 
//   isEdit = this.data?.mode === 'edit';
//   busy = false;
//   error = '';


//   constructor() {
//     this.form = this.fb.group({
//       id_paquetes: [null],
//       fecha_agendamiento: [null, Validators.required],
//       horario_inicio: ['', [Validators.required]],
//       horario_fin: ['', [Validators.required]],
//       id_profesional: [null, Validators.required],
//       motivo: ['']
//     });


//     if (this.isEdit && this.data.appointment) {
//       const a = this.data.appointment;
//       this.form.patchValue({
//         id_paquetes: a.id_paquetes ?? null,
//         fecha_agendamiento: a.fecha_agendamiento,
//         horario_inicio: a.horario_inicio,
//         horario_fin: a.horario_fin,
//         id_profesional: a.id_profesional,
//         motivo: a.motivo
//       });
//     }
//   }
//   async save() {
//     if (this.form.invalid) return;
//     this.busy = true;
//     this.error = '';
//     const payload = this.preparePayload();
//     try {
//       // Validate collision using backend availability endpoint
//       const list = await this.appointmentService.availability(payload.id_profesional, payload.fecha_agendamiento);
//       const startNew = new Date(`${payload.fecha_agendamiento}T${payload.horario_inicio}:00`);
//       const endNew = new Date(`${payload.fecha_agendamiento}T${payload.horario_fin}:00`);


//       for (const q of list) {
//         if (this.isEdit && q.id === this.data.appointment?.id) continue;
//         const startExist = new Date(`${q.fecha_agendamiento}T${q.horario_inicio}:00`);
//         const endExist = new Date(`${q.fecha_agendamiento}T${q.horario_fin}:00`);
//         if (startNew < endExist && startExist < endNew) {
//           throw new Error('La cita colisiona con otra cita del profesional');
//         }
//       }


//       if (this.isEdit && this.data.appointment?.id) {
//         await this.appointmentService.update(this.data.appointment.id, payload);
//         this.dialogRef.close({ updated: true });
//       } else {
//         await this.appointmentService.create(payload);
//         this.dialogRef.close({ created: true });
//       }
//     } catch (err: any) {
//       this.error = err?.message || 'Error creando cita';
//     } finally {
//       this.busy = false;
//     }
//   }


//   preparePayload(): Appointment {
//     const v = this.form.value;
//     const fecha = v.fecha_agendamiento;
//     const fechaStr = (fecha instanceof Date) ? fecha.toISOString().slice(0, 10) : fecha;
//     return {
//       fecha_agendamiento: fechaStr,
//       horario_inicio: v.horario_inicio,
//       horario_fin: v.horario_fin,
//       id_profesional: v.id_profesional,
//       id_paquetes: v.id_paquetes || null,
//       motivo: v.motivo
//     };
//   }


//   cancel() { this.dialogRef.close(); }
// }

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppointmentDataService } from './services/appointment.service';
import { PatientDataService } from './services/patient.service';
import { ProfessionalDataService } from './services/professional.service';
import { PackageDataService } from './services/package.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  private appointmentService = inject(AppointmentDataService);
  private patientService = inject(PatientDataService);
  private professionalService = inject(ProfessionalDataService);
  private packageService = inject(PackageDataService);

  form: FormGroup;

  patients = computed(() => this.patientService.patients());
  professionals = computed(() => this.professionalService.professionals());
  packages = computed(() => this.packageService.packages());
  packagesLoading = false;

  isEdit = this.data?.mode === 'edit';
  busy = false;
  error = '';

  constructor() {

    this.form = this.fb.group({
      id_paciente: [null, Validators.required],
      id_profesional: [null, Validators.required],
      fecha_agendamiento: [null, Validators.required],
      horario_inicio: ['', Validators.required],
      horario_fin: ['', Validators.required],
      id_paquetes: [null],
      motivo: ['']
    });

    if (this.isEdit && this.data.appointment) {
      const a = this.data.appointment;
      this.form.patchValue({
        id_paciente: a.id_paciente,
        id_profesional: a.id_profesional,
        fecha_agendamiento: a.fecha_agendamiento,
        horario_inicio: a.horario_inicio,
        horario_fin: a.horario_fin,
        id_paquetes: a.id_paquetes,
        motivo: a.motivo
      });

      this.onPatientChange(a.id_paciente, false); // carga paquetes del paciente
    }
  }

  // -------------------------------
  // CARGAR PAQUETES DEL PACIENTE
  // -------------------------------
  async onPatientChange(idPaciente: number, reset = true) {
    if (reset) {
      this.form.patchValue({ id_paquetes: null });
    }

    this.packagesLoading = true;
    await this.packageService.loadByPatient(idPaciente);
    this.packagesLoading = false;
  }

  // -------------------------------
  // GUARDAR CITA
  // -------------------------------
  async save() {
    if (this.form.invalid) return;

    this.busy = true;
    this.error = '';

    const payload = this.preparePayload();

    try {
      // --- VALIDACIÓN DE COLISIÓN ---
      const citas = await this.appointmentService.availability(
        payload.id_profesional,
        payload.fecha_agendamiento
      );

      const startNew = new Date(`${payload.fecha_agendamiento}T${payload.horario_inicio}:00`);
      const endNew = new Date(`${payload.fecha_agendamiento}T${payload.horario_fin}:00`);

      for (const q of citas) {
        if (this.isEdit && q.id === this.data.appointment.id) continue;
        const startExist = new Date(`${q.fecha_agendamiento}T${q.horario_inicio}:00`);
        const endExist = new Date(`${q.fecha_agendamiento}T${q.horario_fin}:00`);

        if (startNew < endExist && startExist < endNew) {
          throw new Error('La cita colisiona con otra cita del profesional');
        }
      }

      // --- CREAR O ACTUALIZAR ---
      if (this.isEdit) {
        await this.appointmentService.update(this.data.appointment.id, payload);
        this.dialogRef.close({ updated: true });

      } else {
        await this.appointmentService.create(payload);
        this.dialogRef.close({ created: true });
      }

    } catch (err: any) {
      this.error = err?.message || 'Error creando cita';
    } finally {
      this.busy = false;
    }
  }

  preparePayload() {
    const v = this.form.value;
    const fecha = v.fecha_agendamiento;
    const fechaStr = fecha instanceof Date ? fecha.toISOString().substring(0, 10) : fecha;

    return {
      id_paciente: v.id_paciente,
      id_profesional: v.id_profesional,
      fecha_agendamiento: fechaStr,
      horario_inicio: v.horario_inicio,
      horario_fin: v.horario_fin,
      id_paquetes: v.id_paquetes || null,
      motivo: v.motivo
    };
  }

  cancel() {
    this.dialogRef.close();
  }
}
