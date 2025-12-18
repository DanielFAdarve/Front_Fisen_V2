// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
// import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

// import { PatientDataService } from './services/patient.service';
// import { ProfessionalDataService } from './services/professional.service';
// import { PackageDataService } from './services/package.service';
// import { AppointmentDataService } from './services/appointment.service';

// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { NgIf, NgFor } from '@angular/common';

// @Component({
//   selector: 'app-appointment-dialog',
//   standalone: true,
//   templateUrl: './appointment-dialog.component.html',
//   styleUrls: ['./appointment-dialog.component.scss'],
//   imports: [
//     ReactiveFormsModule,
//     NgIf,
//     NgFor,

//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatDialogActions,
//     MatDialogContent,
//     MatDialogTitle,
//     MatDatepickerModule,
//     MatNativeDateModule
//   ]
// })
// export class AppointmentDialogComponent {

//   busy = false;
//   error = '';

//   isEdit = false;

//   form: FormGroup;

//   // Signals
//   patients;
//   professionals;
//   packages;

//   packagesLoading = false;

//   constructor(
//     private fb: FormBuilder,
//     private dialogRef: MatDialogRef<AppointmentDialogComponent>,

//     private appointmentService: AppointmentDataService,
//     private patientService: PatientDataService,
//     private professionalService: ProfessionalDataService,
//     private packageService: PackageDataService,

//     @Inject(MAT_DIALOG_DATA) public data: { appointment: any | null }
//   ) {

//     this.patients = this.patientService.patients;
//     this.professionals = this.professionalService.professionals;
//     this.packages = this.packageService.packages;

//     this.form = this.fb.group({
//       id_paciente: ['', Validators.required],
//       fecha_agendamiento: ['', Validators.required],
//       horario_inicio: ['', Validators.required],
//       horario_fin: ['', Validators.required],
//       id_profesional: ['', Validators.required],
//       id_paquetes: [null],
//       motivo: ['', Validators.required],
//     });

//     if (data?.appointment) {
//       this.isEdit = true;

//       this.form.patchValue({
//         id_paciente: data.appointment.id_paciente,
//         fecha_agendamiento: data.appointment.fecha_agendamiento,
//         horario_inicio: data.appointment.horario_inicio,
//         horario_fin: data.appointment.horario_fin,
//         id_profesional: data.appointment.id_profesional,
//         id_paquetes: data.appointment.id_paquetes ?? null,
//         motivo: data.appointment.motivo,
//       });

//       this.onPatientChange(data.appointment.id_paciente);
//     }
//   }

//   // ----------------------------------------------------
//   // CARGAR PAQUETES DEL PACIENTE
//   // ----------------------------------------------------
//   async onPatientChange(idPaciente: number) {
//     if (!idPaciente) return;

//     this.packagesLoading = true;
//     await this.packageService.loadByPatient(+idPaciente);
//     this.packagesLoading = false;
//   }

//   // ----------------------------------------------------
//   // CREAR PAQUETE
//   // ----------------------------------------------------
//   async createPackageForPatient() {
//     const patientId = this.form.value.id_paciente;
//     if (!patientId) return;

//     const newPackage = await this.packageService.create({
//       id_pacientes: +patientId,
//       id_paquetes_atenciones: 1,
//       id_estado_citas: 1,
//     });

//     await this.packageService.loadByPatient(patientId);

//     this.form.patchValue({ id_paquetes: newPackage.id });
//   }

//   // ----------------------------------------------------
//   // GUARDAR
//   // ----------------------------------------------------
//   async save() {
//     if (this.form.invalid) return;

//     this.busy = true;

//     const payload = {
//       ...this.form.value,
//       id_paciente: +this.form.value.id_paciente,
//       id_profesional: +this.form.value.id_profesional,
//       id_paquetes: this.form.value.id_paquetes ? +this.form.value.id_paquetes : null,
//     };

//     try {
//       if (this.isEdit) {
//         await this.appointmentService.update(this.data.appointment.id, payload);
//       } else {
//         await this.appointmentService.create(payload);
//       }

//       this.dialogRef.close(true);

//     } finally {
//       this.busy = false;
//     }
//   }

//   cancel() {
//     this.dialogRef.close();
//   }
// }


// import { Component, OnInit, computed, inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';

// import { AppointmentDataService } from './services/appointment.service';
// import { PatientDataService } from './services/patient.service';
// import { ProfessionalDataService } from './services/professional.service';
// import { PackageDataService } from './services/package.service';


// type AppointmentForm = {
//   fecha_agendamiento: string;
//   horario_inicio: string;
//   horario_fin: string;
//   id_paciente: number;
//   id_profesional: number;
//   id_paquetes: number | null;
//   motivo: string;
// };

// @Component({
//   selector: 'app-appointment-dialog',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatInputModule,
//     MatButtonModule
//   ],
//   templateUrl: './appointment-dialog.component.html'
// })
// export class AppointmentDialogComponent implements OnInit {

//   // ✅ inject correcto (evita "used before initialization")
//   private fb = inject(FormBuilder);
//   private appointmentService = inject(AppointmentDataService);
//   private patientService = inject(PatientDataService);
//   private professionalService = inject(ProfessionalDataService);
//   private packageService = inject(PackageDataService);
//   private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);

//   // form = this.fb.group({
//   //   fecha_agendamiento: ['', Validators.required],
//   //   horario_inicio: ['', Validators.required],
//   //   horario_fin: ['', Validators.required],
//   //   id_paciente: [null, Validators.required],
//   //   id_profesional: [null, Validators.required],
//   //   id_paquetes: [null],
//   //   motivo: ['']
//   // });

//   form = this.fb.nonNullable.group<AppointmentForm>({
//     fecha_agendamiento: '',
//     horario_inicio: '',
//     horario_fin: '',
//     id_paciente: 0,
//     id_profesional: 0,
//     id_paquetes: null,
//     motivo: ''
//   });


//   // 🔹 Signals directos
//   patients = this.patientService.patients;
//   professionals = this.professionalService.professionals;
//   packages = this.packageService.packages;
//   attentionPackages = this.packageService.attentionPackages;

//   packagesLoading = signal(false);

//   // ----------------------------------------------------
//   // MAPA id_paquete_atencion -> descripcion
//   // ----------------------------------------------------
//   attentionPackageMap = computed(() => {
//     const map = new Map<number, string>();
//     for (const a of this.attentionPackages()) {
//       map.set(a.id, a.descripcion);
//     }
//     return map;
//   });

//   // ----------------------------------------------------
//   // PAQUETES DISPONIBLES (NO CERRADOS)
//   // ----------------------------------------------------
//   availablePackages = computed(() =>
//     this.packages().filter(p => p.id_estado_citas !== 2)
//   );

//   hasAvailablePackages = computed(() =>
//     this.availablePackages().length > 0
//   );

//   // ----------------------------------------------------
//   ngOnInit() {
//     this.patientService.getPatients();
//     this.professionalService.loadAll();
//     this.packageService.getAttentionPackages();

//     this.form.get('id_paciente')?.valueChanges.subscribe(id => {
//       if (id) {
//         this.form.patchValue({ id_paquetes: null });
//         this.loadPackages(id);
//       }
//     });
//   }

//   async loadPackages(patientId: number) {
//     this.packagesLoading.set(true);
//     await this.packageService.loadByPatient(patientId);
//     this.packagesLoading.set(false);
//   }

//   async createPackageForPatient() {
//     const patientId = this.form.value.id_paciente;
//     if (!patientId) return;

//     this.packagesLoading.set(true);

//     const created = await this.packageService.create({
//       id_pacientes: patientId,
//       id_paquetes_atenciones: 1,
//       id_estado_citas: 1
//     });

//     await this.packageService.loadByPatient(patientId);
//     this.form.patchValue({ id_paquetes: created.id });

//     this.packagesLoading.set(false);
//   }

//   // async save() {
//   //   if (this.form.invalid) return;

//   //   await this.appointmentService.create(this.form.value);
//   //   await this.appointmentService.refresh();
//   //   this.dialogRef.close(true);
//   // }

//   // async save() {
//   //   if (this.form.invalid) return;

//   //     const payload = this.form.getRawValue(); // 👈 CLAVE

//   //   const payload = {
//   //     fecha_agendamiento: this.form.value.fecha_agendamiento,
//   //     horario_inicio: this.form.value.horario_inicio,
//   //     horario_fin: this.form.value.horario_fin,
//   //     id_paciente: this.form.value.id_paciente,
//   //     id_profesional: this.form.value.id_profesional,
//   //     id_paquetes: this.form.value.id_paquetes,
//   //     motivo: this.form.value.motivo
//   //   };

//   //   await this.appointmentService.create(payload);
//   //   await this.appointmentService.refresh();

//   //   this.dialogRef.close(true);
//   // }

//   async save() {
//     if (this.form.invalid) return;

//     const payload = this.form.getRawValue(); // 👈 CLAVE

//     await this.appointmentService.create(payload);
//     await this.appointmentService.refresh();

//     this.dialogRef.close(true);
//   }

//   close() {
//     this.dialogRef.close(false);
//   }
// }

//V3


// import { Component, OnInit, computed, inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';

// import { AppointmentDataService } from './services/appointment.service';
// import { PatientDataService } from './services/patient.service';
// import { ProfessionalDataService } from './services/professional.service';
// import { PackageDataService } from './services/package.service';

// type AppointmentForm = {
//   fecha_agendamiento: string;
//   horario_inicio: string;
//   horario_fin: string;
//   id_paciente: number;
//   id_profesional: number;
//   id_paquetes: number | null;
//   id_tipo_paquete: number | null;
//   motivo: string;
// };


// @Component({
//   selector: 'app-appointment-dialog',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatInputModule,
//     MatButtonModule
//   ],
//   templateUrl: './appointment-dialog.component.html'
// })
// export class AppointmentDialogComponent implements OnInit {

//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);

//   private appointmentService = inject(AppointmentDataService);
//   private patientService = inject(PatientDataService);
//   private professionalService = inject(ProfessionalDataService);
//   private packageService = inject(PackageDataService);

//   // ----------------------------------------------------
//   // FORM
//   // ----------------------------------------------------
//   form = this.fb.nonNullable.group<AppointmentForm>({
//     fecha_agendamiento: '',
//     horario_inicio: '',
//     horario_fin: '',
//     id_paciente: 0,
//     id_profesional: 0,
//     id_paquetes: null,
//     id_tipo_paquete: null,
//     motivo: ''
//   });

//   // ----------------------------------------------------
//   // SIGNALS
//   // ----------------------------------------------------
//   patients = this.patientService.patients;
//   professionals = this.professionalService.professionals;

//   packages = this.packageService.packages;                 // paquetes del paciente
//   attentionPackages = this.packageService.attentionPackages;
//   packageTypes = this.packageService.packageTypes;         // catálogo de paquetes

//   packagesLoading = signal(false);

//   // ----------------------------------------------------
//   // MAPA id_paquete_atencion -> descripcion
//   // ----------------------------------------------------
//   attentionPackageMap = computed(() => {
//     const map = new Map<number, string>();
//     for (const a of this.attentionPackages()) {
//       map.set(a.id, a.descripcion);
//     }
//     return map;
//   });

//   // ----------------------------------------------------
//   // PAQUETES DISPONIBLES (NO CERRADOS)
//   // ----------------------------------------------------
//   availablePackages = computed(() =>
//     this.packages().filter(p => p.id_estado_citas !== 2)
//   );

//   hasAvailablePackages = computed(() =>
//     this.availablePackages().length > 0
//   );

//   // ----------------------------------------------------
//   // INIT
//   // ----------------------------------------------------
//   ngOnInit() {
//     this.patientService.getPatients();
//     this.professionalService.loadAll();
//     this.packageService.getAttentionPackages();
//     this.packageService.getPackageTypes();

//     this.form.get('id_paciente')?.valueChanges.subscribe(id => {
//       if (id) {
//         this.form.patchValue({ id_paquetes: null });
//         this.loadPackages(id);
//       }
//     });
//   }

//   // ----------------------------------------------------
//   // CARGAR PAQUETES DEL PACIENTE
//   // ----------------------------------------------------
//   async loadPackages(patientId: number) {
//     this.packagesLoading.set(true);
//     await this.packageService.loadByPatient(patientId);
//     this.packagesLoading.set(false);
//   }

//   // ----------------------------------------------------
//   // CREAR PAQUETE PARA PACIENTE
//   // ----------------------------------------------------
//   async createPackageForPatient() {
//     const patientId = this.form.value.id_paciente;
//     const tipoPaqueteId = this.form.value.id_tipo_paquete;

//     if (!patientId || !tipoPaqueteId) return;

//     this.packagesLoading.set(true);

//     const created = await this.packageService.create({
//       id_pacientes: patientId,
//       id_paquetes_atenciones: tipoPaqueteId,
//       id_estado_citas: 1
//     });

//     await this.packageService.loadByPatient(patientId);

//     this.form.patchValue({
//       id_paquetes: created.id
//     });

//     this.packagesLoading.set(false);
//   }

//   // ----------------------------------------------------
//   // GUARDAR CITA
//   // ----------------------------------------------------
//   async save() {
//     if (this.form.invalid) return;

//     const raw = this.form.getRawValue();

//     const payload = {
//       fecha_agendamiento: raw.fecha_agendamiento,
//       horario_inicio: raw.horario_inicio,
//       recordatorio: true,
//       id_estado_citas: 1,
//       motivo: raw.motivo,
//       id_profesional: raw.id_profesional,
//       id_paquetes: raw.id_paquetes
//     };

//     await this.appointmentService.create(payload);
//     await this.appointmentService.refresh();

//     this.dialogRef.close(true);
//   }

//   close() {
//     this.dialogRef.close(false);
//   }
// }


import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AppointmentDataService } from './services/appointment.service';
import { PatientDataService } from './services/patient.service';
import { ProfessionalDataService } from './services/professional.service';
import { PackageDataService } from './services/package.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';

type AppointmentForm = {
  fecha_agendamiento: string;
  horario_inicio: string;
  horario_fin: string;
  id_paciente: number;
  id_profesional: number;
  id_paquetes: number | null;
  id_tipo_paquete: number | null;
  motivo: string;
};

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
    MatAutocompleteModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AppointmentDialogComponent>);

  private appointmentService = inject(AppointmentDataService);
  private patientService = inject(PatientDataService);
  private professionalService = inject(ProfessionalDataService);
  private packageService = inject(PackageDataService);

  // ----------------------------------------------------
  // FORM
  // ----------------------------------------------------
  // form = this.fb.nonNullable.group<AppointmentForm>({
  //   fecha_agendamiento: '',
  //   horario_inicio: '',
  //   horario_fin: '', // requerido por backend
  //   id_paciente: 0,
  //   id_profesional: 0,
  //   id_paquetes: null,
  //   id_tipo_paquete: null,
  //   motivo: ''
  // });

  form = this.fb.nonNullable.group<AppointmentForm & { pacienteSearch: string }>({
    pacienteSearch: '',
    fecha_agendamiento: '',
    horario_inicio: '',
    horario_fin: '',
    id_paciente: 0,
    id_profesional: 0,
    id_paquetes: null,
    id_tipo_paquete: null,
    motivo: ''
  });

  // ----------------------------------------------------
  // SIGNALS
  // ----------------------------------------------------
  patients = this.patientService.patients;
  professionals = this.professionalService.professionals;

  packages = this.packageService.packages;
  attentionPackages = this.packageService.attentionPackages;
  packageTypes = this.packageService.packageTypes;

  packagesLoading = signal(false);

  attentionPackageMap = computed(() => {
    const map = new Map<number, string>();
    for (const a of this.attentionPackages()) {
      map.set(a.id, a.descripcion);
    }
    return map;
  });

  pacienteSearchSignal = toSignal(
    this.form.controls.pacienteSearch.valueChanges,
    { initialValue: '' }
  );

  availablePackages = computed(() =>
    this.packages().filter(p => p.id_estado_citas !== 2)
  );

  hasAvailablePackages = computed(() =>
    this.availablePackages().length > 0
  );

  // filteredPatients = computed(() => {
  //   const term = this.form.controls.pacienteSearch.value.toLowerCase().trim();

  //   if (!term) return this.patients();

  //   return this.patients().filter(p =>
  //     `${p.nombre} ${p.apellido}`.toLowerCase().includes(term) ||
  //     p.num_doc?.toString().includes(term)
  //   );
  // });
  filteredPatients = computed(() => {
    const term = this.pacienteSearchSignal().toLowerCase().trim();

    if (!term) return this.patients();

    return this.patients().filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(term) ||
      p.num_doc?.toString().includes(term)
    );
  });
  // ----------------------------------------------------
  ngOnInit() {
    this.patientService.getPatients();
    this.professionalService.loadAll();

    this.packageService.getAttentionPackages();
    this.packageService.getPackageTypes();

    this.form.get('id_paciente')?.valueChanges.subscribe(id => {
      if (id) {
        this.form.patchValue({ id_paquetes: null });
        this.loadPackages(id);
      }
    });
  }

  async loadPackages(patientId: number) {
    this.packagesLoading.set(true);
    await this.packageService.loadByPatient(patientId);
    this.packagesLoading.set(false);
  }

  async createPackageForPatient() {
    const patientId = this.form.value.id_paciente;
    const tipoPaqueteId = this.form.value.id_tipo_paquete;

    if (!patientId || !tipoPaqueteId) return;

    this.packagesLoading.set(true);

    const created = await this.packageService.create({
      id_pacientes: patientId,
      id_paquetes_atenciones: tipoPaqueteId,
      id_estado_citas: 1
    });

    await this.packageService.loadByPatient(patientId);

    this.form.patchValue({ id_paquetes: created.id });
    this.packagesLoading.set(false);
  }

  selectPatient(patient: any) {
    this.form.patchValue({
      id_paciente: patient.id,
      pacienteSearch: `${patient.nombre} ${patient.apellido}`
    });

    this.loadPackages(patient.id);
  }
  // ----------------------------------------------------
  async save() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload = {
      fecha_agendamiento: raw.fecha_agendamiento,
      horario_inicio: raw.horario_inicio,
      horario_fin: raw.horario_fin || raw.horario_inicio, // ✅ FIX
      recordatorio: true,
      id_estado_citas: 1,
      motivo: raw.motivo,
      id_profesional: raw.id_profesional,
      id_paquetes: raw.id_paquetes
    };

    await this.appointmentService.create(payload);
    await this.appointmentService.refresh();

    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
