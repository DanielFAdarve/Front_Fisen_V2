import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../models/appointment';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class AppointmentDataService {
  private apiBaseUrl = 'http://localhost:3000/appointments';

  private _appointments = signal<Appointment[]>([]);
  appointments = this._appointments.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getAppointments(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Appointment[]>>(`${this.apiBaseUrl}/get-appointments`).subscribe({
      next: (data) => {
        this._appointments.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando citas'),
      complete: () => this.loading.set(false)
    });
  }

  getAppointmentById(id: number) {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiBaseUrl}/get-appointment/${id}`);
  }

  createAppointment(newAppointment: Appointment): void {
    this.loading.set(true);
    this.http.post<ApiResponse<Appointment>>(`${this.apiBaseUrl}/create-appointment`, newAppointment).subscribe({
      next: (res) => this._appointments.update(cur => [...cur, res.response]),
      error: () => this.errorMessage.set('❌ No se pudo crear la cita'),
      complete: () => this.loading.set(false)
    });
  }

  updateAppointment(id: number, data: Partial<Appointment>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<Appointment>>(`${this.apiBaseUrl}/update-appointment/${id}`, data).subscribe({
      next: (res) => this._appointments.update(cur => cur.map(a => a.id === id ? res.response : a)),
      error: () => this.errorMessage.set('❌ No se pudo actualizar la cita'),
      complete: () => this.loading.set(false)
    });
  }

  deleteAppointment(id: number): void {
    const current = this._appointments();
    this._appointments.set(current.filter(a => a.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-appointment/${id}`).subscribe({
      error: () => {
        this.errorMessage.set('❌ No se pudo eliminar la cita');
        this._appointments.set(current); // rollback
      }
    });
  }
}
