export interface Appointment {
  id: number;
  fecha_agendamiento: string;
  numero_sesion: number;
  recordatorio: boolean;
  id_estado_citas: number;
  motivo: string;
  id_profesional: number;
  id_paquetes: number;

  estado?: { id: number; nombre: string };
  profesional?: { id: number; nombre: string };
  paquete?: { id: number };
}
