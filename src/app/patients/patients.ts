import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PatientDataService } from '../services/patient-data-service';
import { Patient } from '../models/patient';
import { PatientFormDialogComponent } from './patient-form-dialog/patient-form-dialog';
import { SharedTableComponent } from '../shared/table/shared-table';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    SharedTableComponent
  ],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss']
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientDataService);
  private dialog = inject(MatDialog);

  patients = this.patientService.patients;
  loading = this.patientService.loading;
  errorMessage = this.patientService.errorMessage;

  filtro = signal<string>('');

  filteredPatients = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.patients();

    if (!term) return list;

    return list.filter((p: Patient) =>
      Object.values(p).some(val => {
        if (val === null || val === undefined) return false;

        if (val instanceof Date)
          return val.toISOString().toLowerCase().includes(term);

        return String(val).toLowerCase().includes(term);
      })
    );
  });

  displayedColumns: string[] = [
    'id',
    'tipo_doc',
    'num_doc',
    'nombre',
    'apellido',
    'telefono',
    'email',
    'eps',
    // 'acciones'
  ];

  ngOnInit(): void {
    this.patientService.getPatients();
  }

  seleccionar(patient: Patient) {
    this.dialog.open(PatientFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { patient, readOnly: true }
    });
  }

  // eliminar(id: number) {
  //   if (confirm('¿Seguro que deseas eliminar este paciente?')) {
  //     this.patientService.deletePatientData(id);
  //   }
  // }

  eliminar(id: number) {
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   width: '450px',
    //   data: {
    //     title: 'Eliminar Paciente',
    //     message: '¿Estás seguro? Esta acción no se puede deshacer.'
    //   }
    // });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '480px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        title: 'Eliminar Paciente',
        message: '¿Estás seguro? Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatientData(id);
      }
    });
  }

  nuevoPaciente() {
    const dialogRef = this.dialog.open(PatientFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { patient: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.createPatient(result);
      }
    });
  }

  editarPaciente(patient: Patient) {
    const dialogRef = this.dialog.open(PatientFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { patient }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.updatePatientData(patient.id, result);
      }
    });
  }
}
