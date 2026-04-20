import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentsService } from '../appointment/data-access/appointments.service';
import { ClinicalHistoryForm, ClinicalHistoryService } from '../appointment/data-access/clinical-history.service';
import { Cie10Service } from '../cie10/data-access/cie10.service';
import { HistoryDocumentViewerComponent } from './history-document-viewer.component';
import { FormsModule } from '@angular/forms';
import { ResultDialog } from './clinical-history-modal';
@Component({
  selector: 'app-clinical-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clinical-history.html',
  styleUrls: ['./clinical-history.scss']
})
export class ClinicalHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private appointmentsService = inject(AppointmentsService);
  private clinicalHistoryService = inject(ClinicalHistoryService);
  private cie10Service = inject(Cie10Service);
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

  searchCitaId: number | null = null;

  //Signal para gestion de antecedentes 
  editingBackground = signal(false);

  //Background form para editar antedecentes del paciente 
  backgroundForm = this.fb.group({
    antecedentes: [''],
    antecedentes_personales: [''],
    antecedentes_patologicos: [''],
    antecedentes_quirurgicos: [''],
    antecedentes_traumaticos: [''],
    antecedentes_farmacologicos: [''],
    antecedentes_familiares: [''],
    antecedentes_sociales: ['']
  });

  clinicalForm = this.fb.group({
    id_cie: this.fb.control<number | null>(null, [Validators.required]),
    subjetivo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    objetivo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    intervencion: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    descripcion_estado_paciente: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    recomendaciones: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)])
  });

  patientName = computed(() => {
    const p = this.patientContext();

    if (!p) return 'Paciente no identificado';

    // prioridad 1: nombre completo ya armado
    if (p.paciente && p.paciente.trim()) return p.paciente;

    // prioridad 2: nombre + apellido
    const fullName = `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim();
    if (fullName) return fullName;

    // fallback final
    return 'Paciente no identificado';
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

    // const idFromRoute = Number(this.route.snapshot.paramMap.get('idCita'));
    // if (!idFromRoute) {
    //   this.errorMessage.set('No fue posible identificar la cita.');
    //   return;
    // }

    // this.citaId.set(idFromRoute);
    // await this.hydrateContext(idFromRoute);
    // await this.loadHistory(idFromRoute);

    const navState = history.state?.appointment;

    if (!navState) {
      this.errorMessage.set('No se recibió información de la cita.');
      return;
    }

    // 👇 AQUÍ está la clave
    this.appointmentContext.set(navState);
    this.citaId.set(navState.id);

    this.patientContext.set({
      paciente: navState.paciente,
      nombre: navState.nombre ?? navState.paciente_nombre,
      apellido: navState.apellido ?? navState.paciente_apellido
    });

    await this.loadHistory(navState.id);
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
    this.patientContext.set({
      paciente: appointment?.paciente,
      nombre: appointment?.nombre ?? appointment?.paciente_nombre,
      apellido: appointment?.apellido ?? appointment?.paciente_apellido
    });
  }

  private async loadHistory(idCita: number) {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const history = await this.clinicalHistoryService.getByQuoteId(idCita);
      if (!history) return;

      this.existingHistory.set(history);
      // this.patientContext.set(history);
      const currentPatient = this.patientContext();

      this.patientContext.set({
        ...currentPatient,   // 👈 conserva datos de cita
        ...history           // 👈 añade lo clínico
      });

      const historyCieId = Number(
        history.id_cie
        ?? history.cie10_historia?.id
        ?? history.cie10_paciente?.id
      );

      this.backgroundForm.patchValue({
        antecedentes: history.antecedentes ?? '',
        antecedentes_personales: history.antecedentes_personales ?? '',
        antecedentes_patologicos: history.antecedentes_patologicos ?? '',
        antecedentes_quirurgicos: history.antecedentes_quirurgicos ?? '',
        antecedentes_traumaticos: history.antecedentes_traumaticos ?? '',
        antecedentes_farmacologicos: history.antecedentes_farmacologicos ?? '',
        antecedentes_familiares: history.antecedentes_familiares ?? '',
        antecedentes_sociales: history.antecedentes_sociales ?? ''
      });
      this.clinicalForm.patchValue({
        id_cie: Number.isNaN(historyCieId) ? null : historyCieId,
        subjetivo: history.subjetivo ?? '',
        objetivo: history.objetivo ?? '',
        intervencion: history.intervencion ?? '',
        descripcion_estado_paciente: history.descripcion_estado_paciente ?? '',
        recomendaciones: history.recomendaciones ?? ''
      });
    } catch {
      this.errorMessage.set('No fue posible cargar la historia clínica de esta cita.');
    } finally {
      this.loading.set(false);
    }
  }

  async searchCita() {
    if (!this.searchCitaId) return;

    this.citaId.set(this.searchCitaId);
    this.existingHistory.set(null);
    this.clinicalForm.reset();

    await this.hydrateContext(this.searchCitaId);
    await this.loadHistory(this.searchCitaId);
  }
  async save() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.clinicalForm.invalid || !this.citaId()) {
      this.clinicalForm.markAllAsTouched();
      return;
    }
    // const patient = this.patientContext();
    const bg = this.backgroundForm.value;

    // const payload: ClinicalHistoryForm = {
    //   id_cita: this.citaId()!,
    //   id_cie: Number(this.clinicalForm.value.id_cie),
    //   subjetivo: this.clinicalForm.value.subjetivo?.trim() ?? '',
    //   objetivo: this.clinicalForm.value.objetivo?.trim() ?? '',
    //   intervencion: this.clinicalForm.value.intervencion?.trim() ?? '',
    //   descripcion_estado_paciente: this.clinicalForm.value.descripcion_estado_paciente?.trim() ?? '',
    //   recomendaciones: this.clinicalForm.value.recomendaciones?.trim() ?? ''
    // };
    const payload: ClinicalHistoryForm = {
      id_cita: this.citaId()!,
      id_cie: Number(this.clinicalForm.value.id_cie),

      subjetivo: this.clinicalForm.value.subjetivo?.trim() ?? '',
      objetivo: this.clinicalForm.value.objetivo?.trim() ?? '',
      intervencion: this.clinicalForm.value.intervencion?.trim() ?? '',
      descripcion_estado_paciente: this.clinicalForm.value.descripcion_estado_paciente?.trim() ?? '',
      recomendaciones: this.clinicalForm.value.recomendaciones?.trim() ?? '',

      // 👇 NUEVO
      // antecedentes: patient?.antecedentes,
      // antecedentes_personales: patient?.antecedentes_personales,
      // antecedentes_patologicos: patient?.antecedentes_patologicos,
      // antecedentes_quirurgicos: patient?.antecedentes_quirurgicos,
      // antecedentes_traumaticos: patient?.antecedentes_traumaticos,
      // antecedentes_farmacologicos: patient?.antecedentes_farmacologicos,
      // antecedentes_familiares: patient?.antecedentes_familiares,
      // antecedentes_sociales: patient?.antecedentes_sociales
      antecedentes: bg.antecedentes?.trim() ?? '',
      antecedentes_personales: bg.antecedentes_personales?.trim() ?? '',
      antecedentes_patologicos: bg.antecedentes_patologicos?.trim() ?? '',
      antecedentes_quirurgicos: bg.antecedentes_quirurgicos?.trim() ?? '',
      antecedentes_traumaticos: bg.antecedentes_traumaticos?.trim() ?? '',
      antecedentes_farmacologicos: bg.antecedentes_farmacologicos?.trim() ?? '',
      antecedentes_familiares: bg.antecedentes_familiares?.trim() ?? '',
      antecedentes_sociales: bg.antecedentes_sociales?.trim() ?? ''
    };
    this.saving.set(true);

    try {
      const current = this.existingHistory();
      const historyId = current?.id ?? current?.id_historial;
      const result = historyId
        ? await this.clinicalHistoryService.update(historyId, payload)
        : await this.clinicalHistoryService.create(payload);

      this.existingHistory.set(result);
      // this.successMessage.set('Historia clínica guardada correctamente.');
      const dialogRef = this.dialog.open(ResultDialog, {
        data: { success: true, message: 'Historia clínica guardada correctamente' },
        panelClass: 'custom-dialog'
      });

      setTimeout(() => dialogRef.close(), 3800);
    } catch {
      // this.errorMessage.set('No fue posible guardar la historia clínica.');
      const dialogRef = this.dialog.open(ResultDialog, {
        data: { success: false, message: 'Error al guardar la historia clínica' },
        panelClass: 'custom-dialog'
      });

      setTimeout(() => dialogRef.close(), 3800);
    } finally {
      this.saving.set(false);
    }
  }



  async printHistory() {
    const historyId = this.existingHistory()?.id ?? this.existingHistory()?.id_historial;
    if (!historyId) {
      this.errorMessage.set('Primero guarda la historia clínica para poder generar el documento.');
      return;
    }

    this.errorMessage.set(null);

    try {
      const { blob, fileName } = await this.clinicalHistoryService.exportDocument(historyId);

      //-------------------------------------------------------
      //VISOR PARA LA OTRA VERSION
      //-------------------------------------------------------


      // this.dialog.open(HistoryDocumentViewerComponent, {
      //   width: '92vw',
      //   maxWidth: '1100px',
      //   panelClass: 'appointments-dialog',
      //   data: {
      //     blob,
      //     fileName
      //   }
      // });

      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName.endsWith('.docx')
        ? fileName
        : fileName + '.docx';
      link.click();

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
