export interface Payment {
  id?: number;
  id_paquete?: number | null;
  id_cita?: number | null;
  valor: number;
  metodo_pago: string;
  fecha_pago?: string;
  observacion?: string;
  tipo?: 'cita' | 'paquete';
}