export interface Package {
  id: number;
  id_pacientes: number;
  id_paquetes_atenciones: number;
  id_estado_citas: number;

  // Relaciones opcionales si el backend devuelve joins
  paciente?: { id: number; nombre: string; apellido: string };
  atencion?: { id: number; descripcion: string; cantidad_sesiones: number };
  estado?: { id: number; nombre: string };
}