import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../core/models/api-response';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { Cie10 } from '../../models/cie10';


@Injectable({ providedIn: 'root' })
export class Cie10Service {
  private apiBaseUrl = `${API_BASE_URL}/${API_ENDPOINTS.cie10}`;

  private _cie10 = signal<Cie10[]>([]);
  cie10 = this._cie10.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getCie10(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Cie10[]>>(`${this.apiBaseUrl}/get-cie10`).subscribe({
      next: (data) => {
        this._cie10.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando CIE10'),
      complete: () => this.loading.set(false)
    });
  }
}
