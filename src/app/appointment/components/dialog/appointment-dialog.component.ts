import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from './../../data-access/appointments.service';
import { AppointmentPatientsService } from './../../data-access/patients.service';
import { AppointmentProfessionalsService } from './../../data-access/professionals.service';
import { AppointmentPackagesService } from './../../data-access/packages.service';

import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,

  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);

  private appointmentService = inject(AppointmentsService);
  private patientService = inject(AppointmentPatientsService);
  private professionalService = inject(AppointmentProfessionalsService);
  private packageService = inject(AppointmentPackagesService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  // ✅ FORM CORRECTO
  form = new FormGroup({
    pacienteSearch: new FormControl<string | any | null>(null, { validators: [Validators.required] }),
    fecha_agendamiento: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    horario_inicio: new FormControl<string | null>(null, { validators: [Validators.required] }),
    horario_fin: new FormControl<string | null>(null),
    id_paciente: new FormControl<number | null>(null, { validators: [Validators.required] }),
    id_profesional: new FormControl<number | null>(null, { validators: [Validators.required] }),
    id_paquetes: new FormControl<number | null>(null),
    id_tipo_paquete: new FormControl<number | null>(null),
    motivo: new FormControl<string | null>(null)
  });

  // SIGNALS
  patients = this.patientService.patients;
  professionals = this.professionalService.professionals;
  packages = this.packageService.packages;
  attentionPackages = this.packageService.attentionPackages;
  packageTypes = this.packageService.packageTypes;
  patientsLoading = this.patientService.loading;
  professionalsLoading = this.professionalService.loading;

  packagesLoading = signal(false);
  packageTypesLoading = signal(false);
  detailsLoading = signal(false);
  creatingPackage = signal(false);
  showPackageTypeModal = signal(false);
  isHydratingEdit = false;
  private lastLoadedPatientId: number | null = null;
  private selectedPackageId = signal<number | null>(null);
  private selectedPackageTypeId = signal<number | null>(null);

  pacienteSearchSignal = toSignal(
    this.form.controls.pacienteSearch.valueChanges,
    { initialValue: '' }
  );

  filteredPatients = computed(() => {
    const currentValue = this.pacienteSearchSignal();
    const term = typeof currentValue === 'string'
      ? currentValue.toLowerCase().trim()
      : `${currentValue?.nombre || ''} ${currentValue?.apellido || ''}`.toLowerCase().trim();

    if (!term) return this.patients();

    return this.patients().filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(term) ||
      p.num_doc?.toString().includes(term)
    );
  });

  availablePackages = computed(() => {
    const selectedId = this.selectedPackageId();

    return this.packages()
      .filter(pack => this.isPackageSelectable(pack, selectedId))
      .map(pack => this.normalizePackageForEdition(pack, selectedId));
  });

  attentionPackageMap = computed(() => {
    const map = new Map<number, string>();

    for (const a of this.attentionPackages()) {
      map.set(a.id, a.descripcion);
    }

    return map;
  });
  // ----------------------------------------------------
  async ngOnInit() {
    await Promise.all([
      this.professionalService.loadAll(),
      this.patientService.getPatients(),
      this.packageService.getAttentionPackages()
    ]);

    this.packageTypesLoading.set(true);
    await this.packageService.getPackageTypes();
    this.packageTypesLoading.set(false);

    // cargar paquetes al cambiar paciente
    this.form.get('id_paciente')?.valueChanges.subscribe(id => {
      if (!id || this.isHydratingEdit || this.lastLoadedPatientId === id) return;

      this.lastLoadedPatientId = id;
      this.form.patchValue({ id_paquetes: null }, { emitEvent: false });
      this.loadPackages(id);
    });

    if (this.data?.mode === 'edit' && this.data?.appointment?.id) {
      await this.loadEditData(this.data.appointment.id);
      return;
    }
  }

  // ----------------------------------------------------
  async loadPackages(patientId: number) {
    this.packagesLoading.set(true);
    await this.packageService.loadAvailableByPatient(patientId);
    this.packagesLoading.set(false);
  }

  async loadEditData(appointmentId: number) {
    this.detailsLoading.set(true);
    this.isHydratingEdit = true;
    try {
      const summary = await this.appointmentService.getSummaryByQuoteNumber(appointmentId);
      const patient = await this.patientService.getPatientById(summary.id_paciente);
      const selectedPackageId = this.toNumberOrNull(summary.id_paquete);
      const selectedPackageTypeId = this.toNumberOrNull(summary.id_tipo_paquete);
      this.selectedPackageId.set(selectedPackageId);
      this.selectedPackageTypeId.set(selectedPackageTypeId);

      this.form.patchValue({
        fecha_agendamiento: this.parseDateOnlyToLocalDate(summary.fecha_cita),
        horario_inicio: summary.hora_cita || null,
        horario_fin: summary.hora_cita || null,
        id_profesional: summary.id_profesional || null,
        motivo: summary.motivo || null,
        pacienteSearch: `${patient.nombre} ${patient.apellido}`.trim(),
        id_paciente: patient.id
      }, { emitEvent: false });

      await this.loadPackages(patient.id);
      this.lastLoadedPatientId = patient.id;

      const packageIdFromType = this.findPackageIdByType(selectedPackageTypeId);
      const finalSelectedPackageId = selectedPackageId ?? packageIdFromType ?? null;

      this.form.patchValue({
        id_paquetes: finalSelectedPackageId
      }, { emitEvent: false });
    } finally {
      this.isHydratingEdit = false;
      this.detailsLoading.set(false);
    }
  }

  async createPackageForPatient() {
    const patientId = this.form.value.id_paciente;
    const tipo = this.form.value.id_tipo_paquete;

    if (!patientId || !tipo) return;

    this.creatingPackage.set(true);
    try {
      const created = await this.packageService.create({
        id_pacientes: patientId,
        id_paquetes_atenciones: tipo,
        id_estado_citas: 1
      });

      await this.packageService.loadAvailableByPatient(patientId);

      this.form.patchValue({
        id_paquetes: created.id ?? null,
        id_tipo_paquete: null
      });

      this.showPackageTypeModal.set(false);
    } finally {
      this.creatingPackage.set(false);
    }
  }

  openPackageTypeModal() {
    if (!this.form.value.id_paciente || this.creatingPackage()) return;
    this.showPackageTypeModal.set(true);
  }

  closePackageTypeModal() {
    this.showPackageTypeModal.set(false);
  }

  selectPatient(patient: any) {
    this.form.patchValue({
      id_paciente: patient.id,
      pacienteSearch: `${patient.nombre} ${patient.apellido}`
    });
  }

  displayPatient = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return `${value.nombre || ''} ${value.apellido || ''}`.trim();
  };

  trackById = (_index: number, item: any) => item?.id ?? item?.id_paquete ?? _index;

  resolvePackageId(pack: any): number | null {
    return this.toNumberOrNull(pack?.id ?? pack?.id_paquete);
  }

  packageLabel(pack: any) {
    const packageName = pack.tipo_paquete
      || this.attentionPackageMap().get(pack.id_paquetes_atenciones)
      || 'Paquete';

    const used = pack.sesiones_usadas ?? 0;
    const available = pack.sesiones_disponibles ?? '—';
    const total = pack.sesiones_totales ?? '—';

    return `${packageName} · usadas ${used}/${total} · disponibles ${available}`;
  }

  // ----------------------------------------------------
  formatDate(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private parseDateOnlyToLocalDate(value?: string | null): Date | null {
    if (!value) return null;

    const datePart = value.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private isMarkedAsSelected(pack: any): boolean {
    return Boolean(
      pack?.selected
      ?? pack?.seleccionado
      ?? pack?.is_selected
      ?? pack?.paquete_seleccionado
    );
  }

  private isPackageSelectable(pack: any, selectedId: number | null): boolean {
    const packageId = this.resolvePackageId(pack);
    const available = Number(pack?.sesiones_disponibles ?? 0);

    if (selectedId !== null && packageId === selectedId) return true;
    if (this.isMarkedAsSelected(pack)) return true;

    return available > 0;
  }

  private normalizePackageForEdition(pack: any, selectedId: number | null) {
    const packageId = this.resolvePackageId(pack);
    const selectedTypeId = this.selectedPackageTypeId();
    const packageMatchesType = this.packageMatchesType(pack, selectedTypeId);
    const isSelected = (selectedId !== null && packageId === selectedId) || this.isMarkedAsSelected(pack) || packageMatchesType;

    if (!isSelected) return pack;

    const total = Number(pack?.sesiones_totales ?? 0);
    const available = Number(pack?.sesiones_disponibles ?? 0);
    const used = Number(pack?.sesiones_usadas ?? 0);

    if (total === 1 && available > 0) {
      return {
        ...pack,
        sesiones_disponibles: Math.max(0, available - 1),
        sesiones_usadas: Math.min(total, used + 1)
      };
    }

    return pack;
  }

  private findPackageIdByType(typeId: number | null): number | null {
    if (typeId === null) return null;

    const packageByType = this.packages().find(pack => this.packageMatchesType(pack, typeId));
    return this.resolvePackageId(packageByType);
  }

  private packageMatchesType(pack: any, typeId: number | null): boolean {
    if (typeId === null) return false;

    const packageTypeId = this.toNumberOrNull(pack?.id_paquetes_atenciones ?? pack?.id_tipo_paquete);
    if (packageTypeId !== null) return packageTypeId === typeId;

    const expectedTypeName = this.attentionPackageMap().get(typeId);
    const packageTypeName = (pack?.tipo_paquete || '').toString().trim();

    if (!expectedTypeName || !packageTypeName) return false;

    return this.normalizeText(packageTypeName) === this.normalizeText(expectedTypeName);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // ----------------------------------------------------
  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      fecha_agendamiento: raw.fecha_agendamiento
        ? this.formatDate(raw.fecha_agendamiento)
        : undefined,

      horario_inicio: raw.horario_inicio || undefined,
      horario_fin: raw.horario_fin || raw.horario_inicio || undefined,

      recordatorio: true,
      id_estado_citas: 1,

      motivo: raw.motivo || undefined,
      id_profesional: raw.id_profesional || undefined,
      id_paquetes: raw.id_paquetes ?? undefined
    };

    if (this.data?.mode === 'edit') {
      await this.appointmentService.update(this.data.appointment.id, payload);
    } else {
      await this.appointmentService.create(payload);
    }

    await this.appointmentService.refresh();
    this.dialogRef.close(this.data?.mode === 'edit' ? { updated: true } : { created: true });
  }

  close() {
    this.dialogRef.close(false);
  }
}
