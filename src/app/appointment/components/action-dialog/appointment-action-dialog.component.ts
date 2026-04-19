import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-appointment-action-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './appointment-action-dialog.component.html',
  styleUrls: ['./appointment-action-dialog.component.scss']
})
export class AppointmentActionDialogComponent {
  private dialogRef = inject(MatDialogRef<AppointmentActionDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { appointment: any }) {}

  close() {
    this.dialogRef.close();
  }

  choose(action: 'view' | 'edit' | 'history' | 'payment') {
    this.dialogRef.close(action);
  }
}
