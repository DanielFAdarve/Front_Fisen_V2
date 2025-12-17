export interface AttentionPackage {
  id: number;
  descripcion: string;
  cantidad_sesiones: number;
  valor?: number;
}

export interface Package {
  id: number;
  id_pacientes: number;
  id_paquetes_atenciones: number;
  id_estado_citas: number;
}


// ---------------------------------------------------------
// Atención (catálogo)
// ---------------------------------------------------------
export interface AttentionPackage {
  id: number;
  descripcion: string;
  cantidad_sesiones: number;
  valor?: number;
}

// ---------------------------------------------------------
// Estado del paquete
// ---------------------------------------------------------
export interface StatusPackage {
  id: number;
  nombre: string;
}

// ---------------------------------------------------------
// Paciente (tipado mínimo para evitar any)
// ---------------------------------------------------------
export interface PatientInfo {
  id: number;
  nombre: string;
  apellido?: string;
  [key: string]: any; // por si vienen campos adicionales
}

// ---------------------------------------------------------
// Cita asociada
// ---------------------------------------------------------
export interface Quote {
  id: number;
  fecha: string;
  estado: string;
  [key: string]: any;
}

// ---------------------------------------------------------
// Paquete BÁSICO (como se crea / como venía antes)
// ---------------------------------------------------------
export interface PackageBase {
  id: number;
  id_pacientes: number;
  id_paquetes_atenciones: number;
  id_estado_citas: number;
}

// ---------------------------------------------------------
// Paquete COMPLETO (detalle del backend)
// ---------------------------------------------------------
export interface PackageDetail extends PackageBase {
  patient: PatientInfo;
  attentionPackage: AttentionPackage;
  statusPackage: StatusPackage;
  Quotes: Quote[];
}