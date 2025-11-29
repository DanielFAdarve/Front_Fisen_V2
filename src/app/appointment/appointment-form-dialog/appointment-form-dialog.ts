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

import { Appointment } from '../../models/appointment_or';
import { PROFESIONALES, PAQUETES } from '../../mock/mock-data';

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

  // listas disponibles para selects
  profesionales = PROFESIONALES;
  paquetes = PAQUETES;

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<AppointmentFormDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    public data: { appointment: Appointment | null; readOnly?: boolean } | null
  ) {
    const a = data?.appointment ?? null;

    // El formulario ahora maneja OBJETOS completos, no IDs
    this.form = this.fb.group({
      fecha_agendamiento: [a?.fecha_agendamiento || null, Validators.required],
      numero_sesion: [a?.numero_sesion || 1, [Validators.required, Validators.min(1)]],
      motivo: [a?.motivo || '', Validators.required],
      profesional: [
        a ? this.profesionales.find(p => p.id === a.id_profesional) || null : null,
        Validators.required
      ],
      paquete: [
        a ? this.paquetes.find(pa => pa.id === a.id_paquetes) || null : null,
        Validators.required
      ]
    });

    if (data?.readOnly) {
      this.form.disable();
    }
  }

  guardar() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();

      // Convertir los objetos seleccionados a ID antes de enviar
      const result = {
        fecha_agendamiento: raw.fecha_agendamiento,
        numero_sesion: raw.numero_sesion,
        motivo: raw.motivo,
        id_profesional: raw.profesional.id,
        id_paquetes: raw.paquete.id
      };

      this.dialogRef?.close(result);
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
