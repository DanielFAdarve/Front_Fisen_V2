import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PatientDataService } from '../services/patient-data-service';
import { Patient } from '../models/patient';
import { PatientFormDialogComponent } from './patient-form-dialog/patient-form-dialog';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss']
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientDataService);
  private dialog = inject(MatDialog);

  patients = this.patientService.patients; // readonly Signal<Patient[]>
  loading = this.patientService.loading;
  errorMessage = this.patientService.errorMessage;

  // filtro como signal (reactivo)
  filtro = signal<string>('');

  // computed que filtra dinámicamente leyendo this.patients() y this.filtro()
  filteredPatients = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.patients();

    if (!term) return list;

    return list.filter((p: Patient) =>
      // revisamos todos los campos del paciente
      Object.values(p).some(val => {
        if (val === null || val === undefined) return false;
        // manejar Date de forma legible
        if (val instanceof Date) {
          return val.toISOString().toLowerCase().includes(term);
        }
        return String(val).toLowerCase().includes(term);
      })
    );
  });

  displayedColumns: string[] = [
    'id', 'tipo_doc', 'num_doc', 'nombre', 'apellido',
    'telefono', 'email', 'eps', 'acciones'
  ];

  selectedPatient = signal<Patient | null>(null);

  ngOnInit(): void {
    this.patientService.getPatients();
  }

  // métodos para abrir dialog
  seleccionar(patient: Patient) {
    this.selectedPatient.set(patient);
    this.dialog.open(PatientFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { patient, readOnly: true }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar este paciente?')) {
      this.patientService.deletePatientData(id);
    }
  }

  nuevoPaciente() {
    const dialogRef = this.dialog.open(PatientFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      // width: '100vw',
      // height: '100vh',
      // maxWidth: '100vw',
      // panelClass: 'full-screen-dialog',
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
