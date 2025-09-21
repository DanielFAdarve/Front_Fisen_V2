import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quote } from '../models/quote';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class QuoteDataService {
  private apiBaseUrl = 'http://localhost:3000/quotes';

  private _quotes = signal<Quote[]>([]);
  quotes = this._quotes.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getQuotes(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Quote[]>>(`${this.apiBaseUrl}/get-quotes`).subscribe({
      next: (data) => {
        this._quotes.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando presupuestos'),
      complete: () => this.loading.set(false)
    });
  }

  getQuoteById(id: number) {
    return this.http.get<ApiResponse<Quote>>(`${this.apiBaseUrl}/get-quote/${id}`);
  }

  createQuote(newQuote: Quote): void {
    this.loading.set(true);
    this.http.post<ApiResponse<Quote>>(`${this.apiBaseUrl}/create-quote`, newQuote).subscribe({
      next: (res) => this._quotes.update(cur => [...cur, res.response]),
      error: () => this.errorMessage.set('❌ No se pudo crear el presupuesto'),
      complete: () => this.loading.set(false)
    });
  }

  updateQuote(id: number, data: Partial<Quote>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<Quote>>(`${this.apiBaseUrl}/update-quote/${id}`, data).subscribe({
      next: (res) => this._quotes.update(cur => cur.map(q => q.id === id ? res.response : q)),
      error: () => this.errorMessage.set('❌ No se pudo actualizar el presupuesto'),
      complete: () => this.loading.set(false)
    });
  }

  deleteQuote(id: number): void {
    const current = this._quotes();
    this._quotes.set(current.filter(q => q.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-quote/${id}`).subscribe({
      error: () => {
        this.errorMessage.set('❌ No se pudo eliminar el presupuesto');
        this._quotes.set(current); // rollback
      }
    });
  }
}
