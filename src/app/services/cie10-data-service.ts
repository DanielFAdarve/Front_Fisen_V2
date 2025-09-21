import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cie10 } from '../models/cie10';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class Cie10DataService {
  private apiBaseUrl = 'http://localhost:3000/cie10';

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
