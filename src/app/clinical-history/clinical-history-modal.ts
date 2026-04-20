import { Component, Inject, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';


@Component({
    standalone: true,
    imports: [MatDialogModule, CommonModule],
    template: `
  <div class="modal-container" [ngClass]="data.success ? 'success' : 'error'">

    <div class="modal-header">
      <h2>
        {{ data.success ? '✔ Operación exitosa' : '⚠ Ocurrió un problema' }}
      </h2>
      <button class="close-btn" mat-dialog-close>✖</button>
    </div>

    <div class="modal-body">
      <p>{{ data.message }}</p>
    </div>

    <div class="modal-actions">
      <button class="primary-btn" mat-dialog-close>
        Aceptar
      </button>
    </div>

  </div>
`,

    styles: [`
  :host {
    display: block;
  }

  .modal-container {
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    min-width: 320px;
  }

  /* HEADER BASE */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #e0f2f1;
  }

  /* 🎯 ESTADOS */
  .success .modal-header {
    background: #f0fdfa;
  }

  .success .modal-header h2 {
    color: #00695c;
  }

  .error .modal-header {
    background: #fdecea;
  }

  .error .modal-header h2 {
    color: #c62828;
  }

  /* TEXTO */
  .modal-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .close-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.95rem;
    opacity: 0.7;
  }

  .close-btn:hover {
    opacity: 1;
  }

  /* BODY */
  .modal-body {
    padding: 1.2rem 1rem;
    text-align: center;
  }

  .modal-body p {
    margin: 0;
    font-size: 0.92rem;
    color: #455a64;
    line-height: 1.4;
  }

  /* ACTIONS */
  .modal-actions {
    display: flex;
    justify-content: center;
    padding: 0.8rem 1rem 1.2rem;
  }

  .primary-btn {
    border: none;
    border-radius: 10px;
    padding: 0.55rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    background: #26a69a;
    color: #fff;
    transition: all 0.2s ease;
  }

  .primary-btn:hover {
    background: #1e8e83;
    transform: translateY(-1px);
  }
`]

})
export class ResultDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}