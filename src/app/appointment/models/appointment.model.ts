export interface Appointment {
  id?: number;
  fecha_agendamiento: string; // YYYY-MM-DD
  horario_inicio: string; // HH:mm
  horario_fin: string; // HH:mm
  numero_sesion?: number;
  motivo?: string;
  id_profesional: number;
  id_paquetes?: number | null;
  id_estado_citas?: number;
  pagado?: boolean;
}