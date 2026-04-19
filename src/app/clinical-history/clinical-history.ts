import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppointmentsService } from '../appointment/data-access/appointments.service';
import { AppointmentPackagesService } from '../appointment/data-access/packages.service';
import { ClinicalHistoryForm, ClinicalHistoryService } from '../appointment/data-access/clinical-history.service';
import { Cie10Service } from '../cie10/data-access/cie10.service';
import { PatientService } from '../patients/data-access/patient.service';
import { HistoryDocumentViewerComponent } from './history-document-viewer.component';

@Component({
  selector: 'app-clinical-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clinical-history.html',
  styleUrls: ['./clinical-history.scss']
})
export class ClinicalHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private appointmentsService = inject(AppointmentsService);
  private packageService = inject(AppointmentPackagesService);
  private clinicalHistoryService = inject(ClinicalHistoryService);
  private cie10Service = inject(Cie10Service);
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);

  citaId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  appointmentContext = signal<any | null>(null);
  patientContext = signal<any | null>(null);
  existingHistory = signal<ClinicalHistoryForm | null>(null);

  showContact = signal(false);
  showClinicalBackground = signal(true);

  cie10Catalog = this.cie10Service.cie10;

  clinicalForm = this.fb.group({
    id_cie: this.fb.control<number | null>(null, [Validators.required]),
    subjetivo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    objetivo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    intervencion: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    descripcion_estado_paciente: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    recomendaciones: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)])
  });

  patientName = computed(() => {
    const patient = this.patientContext();
    if (!patient) return 'Paciente no identificado';
    return `${patient?.nombre ?? ''} ${patient?.apellido ?? ''}`.trim();
  });

  selectedCieLabel = computed(() => {
    const id = Number(this.clinicalForm.controls.id_cie.value);
    if (!id) return 'Sin diagnóstico seleccionado';
    const cie = this.cie10Catalog().find((item) => item.id === id);
    if (!cie) return `CIE10 #${id}`;
    return `${cie.codigo} · ${cie.descripcion}`;
  });

  async ngOnInit() {
    this.cie10Service.getCie10();

    const idFromRoute = Number(this.route.snapshot.paramMap.get('idCita'));
    if (!idFromRoute) {
      this.errorMessage.set('No fue posible identificar la cita.');
      return;
    }

    this.citaId.set(idFromRoute);
    await this.hydrateContext(idFromRoute);
    await this.loadHistory(idFromRoute);
  }

  private async hydrateContext(idCita: number) {
    const navState = history.state?.appointment ?? null;

    if (navState) {
      this.appointmentContext.set(navState);
    } else {
      await this.appointmentsService.loadAll();
      const appointment = this.appointmentsService.appointments().find((item) => item.id === idCita) ?? null;
      this.appointmentContext.set(appointment);
    }

    const appointment = this.appointmentContext();

    if (!appointment?.id_paquetes) return;

    const detail = await this.packageService.getPackageDetail(appointment.id_paquetes);
    const patientId = detail?.patient?.id;

    if (patientId) {
      try {
        const patientRes = await firstValueFrom(this.patientService.getPatientById(patientId));
        this.patientContext.set(patientRes?.response ?? detail?.patient ?? null);
      } catch {
        this.patientContext.set(detail?.patient ?? null);
      }
    } else {
      this.patientContext.set(detail?.patient ?? null);
    }

    if (!this.clinicalForm.controls.id_cie.value && detail?.patient?.['id_cie']) {
      this.clinicalForm.patchValue({ id_cie: Number(detail.patient['id_cie']) });
    }
  }

  private async loadHistory(idCita: number) {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const history = await this.clinicalHistoryService.getByQuoteId(idCita);
      if (!history) return;

      this.existingHistory.set(history);
      this.clinicalForm.patchValue({
        id_cie: Number(history.id_cie),
        subjetivo: history.subjetivo,
        objetivo: history.objetivo,
        intervencion: history.intervencion,
        descripcion_estado_paciente: history.descripcion_estado_paciente,
        recomendaciones: history.recomendaciones
      });
    } catch {
      this.errorMessage.set('No fue posible cargar la historia clínica de esta cita.');
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.clinicalForm.invalid || !this.citaId()) {
      this.clinicalForm.markAllAsTouched();
      return;
    }

    const payload: ClinicalHistoryForm = {
      id_cita: this.citaId()!,
      id_cie: Number(this.clinicalForm.value.id_cie),
      subjetivo: this.clinicalForm.value.subjetivo?.trim() ?? '',
      objetivo: this.clinicalForm.value.objetivo?.trim() ?? '',
      intervencion: this.clinicalForm.value.intervencion?.trim() ?? '',
      descripcion_estado_paciente: this.clinicalForm.value.descripcion_estado_paciente?.trim() ?? '',
      recomendaciones: this.clinicalForm.value.recomendaciones?.trim() ?? ''
    };

    this.saving.set(true);

    try {
      const current = this.existingHistory();
      const result = current?.id
        ? await this.clinicalHistoryService.update(current.id, payload)
        : await this.clinicalHistoryService.create(payload);

      this.existingHistory.set(result);
      this.successMessage.set('Historia clínica guardada correctamente.');
    } catch {
      this.errorMessage.set('No fue posible guardar la historia clínica.');
    } finally {
      this.saving.set(false);
    }
  }



  async printHistory() {
    const historyId = this.existingHistory()?.id;
    if (!historyId) {
      this.errorMessage.set('Primero guarda la historia clínica para poder generar el documento.');
      return;
    }

    this.errorMessage.set(null);

    try {
      const blob = await this.clinicalHistoryService.exportDocument(historyId);
      this.dialog.open(HistoryDocumentViewerComponent, {
        width: '92vw',
        maxWidth: '1100px',
        panelClass: 'appointments-dialog',
        data: {
          blob,
          fileName: `historia-clinica-${historyId}.docx`
        }
      });
    } catch {
      this.errorMessage.set('No fue posible generar el documento de historia clínica.');
    }
  }

  goBackToAppointments() {
    this.router.navigate(['/citas']);
  }

  toggleContact() {
    this.showContact.update((v) => !v);
  }

  toggleClinicalBackground() {
    this.showClinicalBackground.update((v) => !v);
  }
}
