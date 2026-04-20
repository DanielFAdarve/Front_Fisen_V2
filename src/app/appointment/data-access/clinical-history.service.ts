import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';

export interface ClinicalHistoryForm {
  id?: number;
  id_historial?: number;
  id_cita: number;
  id_cie?: number;
  subjetivo?: string;
  objetivo?: string;
  intervencion?: string;
  descripcion_estado_paciente?: string;
  recomendaciones?: string;
  paciente?: string;
  tipo_doc?: string;
  num_doc?: string;
  telefono?: string;
  telefono_secundario?: string;
  email?: string;
  eps?: string;
  ocupacion?: string;
  modalidad_deportiva?: string;
  antecedentes?: string;
  antecedentes_personales?: string;
  antecedentes_patologicos?: string;
  antecedentes_quirurgicos?: string;
  antecedentes_traumaticos?: string;
  antecedentes_farmacologicos?: string;
  antecedentes_familiares?: string;
  antecedentes_sociales?: string;
  cie10_historia?: { id?: number; codigo?: string; descripcion?: string };
  cie10_paciente?: { id?: number; codigo?: string; descripcion?: string };
}

@Injectable({ providedIn: 'root' })
export class ClinicalHistoryService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/${API_ENDPOINTS.histories}`;
//  private base = `http://localhost:3000/${API_ENDPOINTS.histories}`;
  async getByQuoteId(idCita: number) {
    try {
      const res = await firstValueFrom(
        this.http.get<{ response: ClinicalHistoryForm | ClinicalHistoryForm[] | null }>(
          `${this.base}/get-by-quote/${idCita}`
        )
      );

      const payload = res?.response;
      if (!payload) return null;

      return Array.isArray(payload) ? (payload[0] ?? null) : payload;
    } catch {
      return null;
    }
  }

  async create(payload: ClinicalHistoryForm) {
    const res = await firstValueFrom(
      this.http.post<{ response: ClinicalHistoryForm }>(
        `${this.base}/create`,
        payload
      )
    );

    return res.response;
  }


  async exportDocument(historyId: number): Promise<{ blob: Blob; fileName: string }> {
    try {
      const pdfBlob = await firstValueFrom(
        this.http.get(`${this.base}/export-pdf/${historyId}`, {
          responseType: 'blob'
        })
      );

      return {
        blob: pdfBlob,
        fileName: `historia-clinica-${historyId}.docx`
      };
    } catch {
      const docxBlob = await firstValueFrom(
        this.http.get(`${this.base}/export-docx/${historyId}`, {
          responseType: 'blob'
        })
      );

      return {
        blob: docxBlob,
        fileName: `historia-clinica-${historyId}.docx`
      };
    }
  }

  async update(id: number, payload: Partial<ClinicalHistoryForm>) {
    const res = await firstValueFrom(
      this.http.put<{ response: ClinicalHistoryForm }>(
        `${this.base}/update/${id}`,
        payload
      )
    );

    return res.response;
  }
}
