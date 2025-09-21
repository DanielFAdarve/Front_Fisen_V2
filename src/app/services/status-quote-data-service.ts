import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatusQuote } from '../models/status-quote';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class StatusQuoteDataService {
  private apiBaseUrl = 'http://localhost:3000/estado-citas';

  private _estados = signal<StatusQuote[]>([]);
  estados = this._estados.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getEstadosCitas(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<StatusQuote[]>>(`${this.apiBaseUrl}/get-estados-citas`).subscribe({
      next: (data) => {
        this._estados.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando estados de citas'),
      complete: () => this.loading.set(false)
    });
  }
}
