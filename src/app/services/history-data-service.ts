import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { History } from '../models/history';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class HistoryDataService {
  private apiBaseUrl = 'http://localhost:3000/history';

  private _histories = signal<History[]>([]);
  histories = this._histories.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getHistories(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<History[]>>(`${this.apiBaseUrl}/get-histories`).subscribe({
      next: (data) => {
        this._histories.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando historias'),
      complete: () => this.loading.set(false)
    });
  }

  getHistoryById(id: number) {
    return this.http.get<ApiResponse<History>>(`${this.apiBaseUrl}/get-history/${id}`);
  }

  createHistory(newHistory: History): void {
    this.loading.set(true);
    this.http.post<ApiResponse<History>>(`${this.apiBaseUrl}/create-history`, newHistory).subscribe({
      next: (res) => this._histories.update(cur => [...cur, res.response]),
      error: () => this.errorMessage.set('❌ No se pudo crear la historia'),
      complete: () => this.loading.set(false)
    });
  }

  updateHistory(id: number, data: Partial<History>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<History>>(`${this.apiBaseUrl}/update-history/${id}`, data).subscribe({
      next: (res) => this._histories.update(cur => cur.map(h => h.id === id ? res.response : h)),
      error: () => this.errorMessage.set('❌ No se pudo actualizar la historia'),
      complete: () => this.loading.set(false)
    });
  }

  deleteHistory(id: number): void {
    const current = this._histories();
    this._histories.set(current.filter(h => h.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-history/${id}`).subscribe({
      error: () => {
        this.errorMessage.set('❌ No se pudo eliminar la historia');
        this._histories.set(current); // rollback
      }
    });
  }
}
