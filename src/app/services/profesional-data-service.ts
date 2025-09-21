import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profesional } from '../models/profesional';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class ProfesionalDataService {
  private apiBaseUrl = 'http://localhost:3000/professional';

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
