import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
  <div class="modal-wrapper" [class.success]="success()">

    <!-- ICONO DE WARNING -->
    <div class="icon-wrapper" *ngIf="!success()">
      <mat-icon class="warning-ico">warning_amber</mat-icon>
    </div>

    <!-- ICONO SUCCESS -->
    <div class="icon-wrapper success-icon" *ngIf="success()">
      <mat-icon>check_circle</mat-icon>
    </div>

    <!-- CONTENIDO WARNING -->
    <div class="content" *ngIf="!success()">
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>

      <div class="actions">
        <button mat-button class="cancel-btn" (click)="onCancel()">Cancelar</button>

        <button mat-raised-button class="delete-btn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Eliminar
        </button>
      </div>
    </div>

    <!-- CONTENIDO SUCCESS -->
    <div class="content success-msg" *ngIf="success()">
      <p>Eliminado correctamente</p>
    </div>

  </div>
  `,
  styles: [`

    /* WRAPPER GENERAL */
    .modal-wrapper {
      text-align: center;
      padding: 70px 30px 30px;
      background: #ffffffcc;
      backdrop-filter: blur(10px);
      border-radius: 25px;
    //   border-radius: 30%;
      position: relative;
      width: 100%;
      max-height: 420;
      max-width: 420px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.0);
      animation: fadeIn 0.25s ease-out;
    }

    /* ICONO */
    .icon-wrapper {
      width: 90px;
      height: 90px;
      border-radius: 30%;
      background: #fff;
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(0,0,0,0.15);
      animation: popIn .4s ease-out;
    }

    .warning-ico {
      font-size: 25px;
      color: #e67e22;
    }

    .success-icon mat-icon {
      font-size: 25px;
      color: #2ecc71;
    }

    /* TEXTO */
    h2 {
      margin-top: 30px;
      margin-bottom: 10px;
      color: #2c3e50;
      font-size: 1.6rem;
      font-weight: 700;
    }

    p {
      color: #455a64;
      font-size: 1rem;
      margin-bottom: 30px;
    }

    /* BOTONES */
    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;
    }

    .cancel-btn {
      background: #ececec;
      color: #555;
      padding: 8px 20px;
      border-radius: 10px;
      transition: 0.2s ease;
      font-weight: 500;
    }

    .cancel-btn:hover {
      background: #dcdcdc;
    }

    .delete-btn {
      background: #e53935 !important;
      color: #fff !important;
      padding: 8px 22px;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(229,57,53,0.4);
      transition: 0.2s ease;
    }

    .delete-btn:hover {
      background: #c62828 !important;
      box-shadow: 0 6px 22px rgba(229,57,53,0.55);
    }

    .delete-btn mat-icon {
      margin-right: 6px;
    }

    /* SUCCESS MESSAGE */
    .success-msg p {
      font-size: 1.3rem;
      color: #2ecc71;
      font-weight: 700;
      margin-top: 30px;
      animation: fadeIn .4s ease-out;
    }

    /* ANIMACIONES */
    @keyframes popIn {
      0% { transform: translateX(-50%) scale(0); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

  `]
})
export class ConfirmDialogComponent {

  success = signal(false);

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.success.set(true);

    setTimeout(() => this.dialogRef.close(true), 1300);
  }
}
