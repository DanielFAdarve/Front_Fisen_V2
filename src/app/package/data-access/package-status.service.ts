import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../core/models/api-response';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { StatusPackage } from '../../models/status-package';


@Injectable({ providedIn: 'root' })
export class PackageStatusService {
  private apiBaseUrl = `${API_BASE_URL}/${API_ENDPOINTS.statusPackages}`;

  private _estados = signal<StatusPackage[]>([]);
  estados = this._estados.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getEstadosPaquetes(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<StatusPackage[]>>(`${this.apiBaseUrl}/get-estados-paquetes`).subscribe({
      next: (data) => {
        this._estados.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando estados de paquetes'),
      complete: () => this.loading.set(false)
    });
  }
}
