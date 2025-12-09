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