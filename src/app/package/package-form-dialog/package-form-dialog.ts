import { Component, Inject, Optional, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Package } from '../../models/package';
import { StatusPackage } from '../../models/status-package';
import { StatusPackageDataService } from '../../services/status-package-data-service';

@Component({
  selector: 'app-package-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './package-form-dialog.html',
  styleUrls: ['./package-form-dialog.scss']
})
export class PackageFormDialog {
  private fb = inject(FormBuilder);
  private statusService = inject(StatusPackageDataService);

  estados = this.statusService.estados;

  form: FormGroup;

  constructor(
    @Optional() public dialogRef: MatDialogRef<PackageFormDialog>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    public data: { package: StatusPackage | null; readOnly?: boolean } | null
  ) {
    const p = data?.package ?? null;

    this.form = this.fb.group({
      nombre: [p?.nombre || '', Validators.required],
      descripcion: [p?.descripcion || ''],
      id: [p?.id || null, Validators.required]
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
}
