import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentPaymentsService } from './data-access/payments.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private paymentService = inject(AppointmentPaymentsService);

  form: FormGroup;
  busy = false;
  error = '';

  paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'nequi', label: 'Nequi / Daviplata' }
  ];

  constructor() {
    this.form = this.fb.group({
      id_cita: [this.data?.id || this.data?.id_cita || null],
      id_paquete: [this.data?.id_paquete || null],
      valor: [null, Validators.required],
      metodo_pago: ['efectivo', Validators.required],
      observacion: ['']
    });
  }

  async save() {
    if (this.form.invalid) return;

    this.busy = true;
    this.error = '';

    try {
      const payload = this.form.value;
      payload.tipo = payload.id_cita ? 'cita' : 'paquete';
      await this.paymentService.createPayment(payload);
      this.dialogRef.close({ paid: true });
    } catch (err: any) {
      this.error = err?.message || 'Error registrando pago';
    } finally {
      this.busy = false;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
