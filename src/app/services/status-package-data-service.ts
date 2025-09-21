import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatusPackage } from '../models/status-package';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class StatusPackageDataService {
  private apiBaseUrl = 'http://localhost:3000/estado-paquetes';

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
