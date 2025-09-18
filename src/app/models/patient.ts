export interface Patient {
  id: number; 
  tipo_doc: string;
  num_doc: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  telefono_secundario: string;
  email: string;
  fecha_nacimiento: Date;
  genero: string;
  procedencia: string;
  zona: string;
  ocupacion: string;
  eps: string;
  regimen: string;
  modalidad_deportiva: string;
  red_apoyo: boolean;
  antecedentes: string;
}