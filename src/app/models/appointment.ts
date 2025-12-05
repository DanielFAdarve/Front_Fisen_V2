export interface Appointment {
  id: number;
  id_paciente: number;         // FK → Patient.id
  fecha_agendamiento: Date;
  numero_sesion: number;
  motivo: string;
  id_profesional: number;
  id_paquetes: number;
}