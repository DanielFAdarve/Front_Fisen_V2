export interface Appointment {
  id?: number;
  fecha_agendamiento?: string; // YYYY-MM-DD (legacy)
  horario_inicio?: string; // HH:mm (legacy)
  horario_fin?: string; // HH:mm (legacy)
  fecha?: string; // YYYY-MM-DD
  hora_inicio?: string; // HH:mm:ss
  hora_fin?: string; // HH:mm:ss
  numero_sesion?: number;
  motivo?: string;
  id_profesional?: number;
  profesional?: string;
  paciente?: string;
  estado?: string;
  id_paquetes?: number | null;
  id_estado_citas?: number;
  pagado?: boolean;
}
