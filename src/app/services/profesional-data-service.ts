import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../core/models/api-response';
import { API_BASE_URL, API_ENDPOINTS } from '../core/constants/api.constants';
import { Profesional } from '../models/profesional';


@Injectable({ providedIn: 'root' })
export class ProfesionalDataService {
  private apiBaseUrl = `${API_BASE_URL}/${API_ENDPOINTS.professionals}`;

  private _profesionales = signal<Profesional[]>([]);
  profesionales = this._profesionales.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getProfesionales(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Profesional[]>>(`${this.apiBaseUrl}/get-profesionales`).subscribe({
      next: (data) => {
        this._profesionales.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando profesionales'),
      complete: () => this.loading.set(false)
    });
  }
}
