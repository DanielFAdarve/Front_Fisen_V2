import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';

export interface ClinicalHistoryForm {
  id?: number;
  id_cita: number;
  id_cie: number;
  subjetivo: string;
  objetivo: string;
  intervencion: string;
  descripcion_estado_paciente: string;
  recomendaciones: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicalHistoryService {
  private http = inject(HttpClient);
  private base = `${API_BASE_URL}/${API_ENDPOINTS.histories}`;

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
