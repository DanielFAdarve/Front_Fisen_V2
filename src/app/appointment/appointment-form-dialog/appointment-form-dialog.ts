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
import { Appointment } from '../../models/appointment';

@Component({
  selector: 'app-appointment-form-dialog',
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
  templateUrl: './appointment-form-dialog.html',
  styleUrls: ['./appointment-form-dialog.scss']
})
export class AppointmentFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<AppointmentFormDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    public data: { appointment: Appointment | null; readOnly?: boolean } | null
  ) {
    const a = data?.appointment ?? null;

    this.form = this.fb.group({
      fecha_agendamiento: [a?.fecha_agendamiento || null, Validators.required],
      numero_sesion: [a?.numero_sesion || 1, [Validators.required, Validators.min(1)]],
      motivo: [a?.motivo || '', Validators.required],
      id_profesional: [a?.id_profesional || null, Validators.required],
      id_paquetes: [a?.id_paquetes || null, Validators.required]
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
