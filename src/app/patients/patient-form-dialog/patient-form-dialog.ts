import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Patient } from '../../models/patient';

@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './patient-form-dialog.html',
  styleUrls: ['./patient-form-dialog.scss']
})


// export class PatientFormDialogComponent {
//   form: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     @Optional() public dialogRef: MatDialogRef<PatientFormDialogComponent>, // 👈 público
//     @Optional() @Inject(MAT_DIALOG_DATA)
//     public data: { patient: Patient | null; readOnly?: boolean } | null
//   ) {
//     const p = data?.patient ?? null;

//     this.form = this.fb.group({
//       tipo_doc: [p?.tipo_doc || '', Validators.required],
//       num_doc: [p?.num_doc || '', Validators.required],
//       nombre: [p?.nombre || '', Validators.required],
//       apellido: [p?.apellido || '', Validators.required],
//       direccion: [p?.direccion || ''],
//       telefono: [p?.telefono || '', Validators.required],
//       telefono_secundario: [p?.telefono_secundario || ''],
//       email: [p?.email || '', [Validators.required, Validators.email]],
//       fecha_nacimiento: [p?.fecha_nacimiento || null],
//       genero: [p?.genero || ''],
//       procedencia: [p?.procedencia || ''],
//       zona: [p?.zona || ''],
//       ocupacion: [p?.ocupacion || ''],
//       eps: [p?.eps || ''],
//       regimen: [p?.regimen || ''],
//       modalidad_deportiva: [p?.modalidad_deportiva || ''],
//       red_apoyo: [p?.red_apoyo || false],
//       antecedentes: [p?.antecedentes || '']
//     });

//     if (data?.readOnly) {
//       this.form.disable();
//     }
//   }

//   guardar() {
//     if (this.form.valid) {
//       this.dialogRef?.close(this.form.getRawValue()); // safe optional
//     }
//   }

//   cerrar() {
//     this.dialogRef?.close();
//   }

//   scrollTo(sectionId: string) {
//     const el = document.getElementById(sectionId);
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   }
// }

export class PatientFormDialogComponent {
  form: FormGroup;

  // 👉 Arrays para alimentar los dropdowns
  tiposDocumento: string[] = ['CC', 'TI', 'RC', 'CE', 'PP', 'PT', 'PEP', 'SC'];
  generos: string[] = ['Masculino', 'Femenino', 'Otro'];
  regimenes: string[] = ['CONTRIBUTIVO', 'SUBSIDIADO', 'ESPECIAL', 'NO APLICA'];

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<PatientFormDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    public data: { patient: Patient | null; readOnly?: boolean } | null
  ) {
    const p = data?.patient ?? null;

    this.form = this.fb.group({
      tipo_doc: [p?.tipo_doc || '', Validators.required],
      num_doc: [p?.num_doc || '', Validators.required],
      nombre: [p?.nombre || '', Validators.required],
      apellido: [p?.apellido || '', Validators.required],
      direccion: [p?.direccion || ''],
      telefono: [p?.telefono || '', Validators.required],
      telefono_secundario: [p?.telefono_secundario || ''],
      email: [p?.email || '', [Validators.required, Validators.email]],
      fecha_nacimiento: [p?.fecha_nacimiento || null],
      genero: [p?.genero || '', Validators.required],
      procedencia: [p?.procedencia || ''],
      zona: [p?.zona || ''],
      ocupacion: [p?.ocupacion || ''],
      eps: [p?.eps || ''],
      regimen: [p?.regimen || '', Validators.required],
      modalidad_deportiva: [p?.modalidad_deportiva || ''],
      red_apoyo: [p?.red_apoyo ?? false, Validators.required],
      antecedentes: [p?.antecedentes || '']
    });

    if (data?.readOnly) {
      this.form.disable();
    }
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef?.close(this.form.getRawValue());
    }
  }

  cerrar() {
    this.dialogRef?.close();
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}