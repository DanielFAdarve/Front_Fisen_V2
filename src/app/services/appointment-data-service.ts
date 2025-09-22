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
  private apiBaseUrl = 'http://localhost:3000/appointment';

  private _appointments = signal<Appointment[]>([]);
  appointments = this._appointments.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las citas
  getAppointments(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Appointment[]>>(`${this.apiBaseUrl}/get-appointments`).subscribe({
      next: (data) => {
        this._appointments.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error cargando citas', err);
        this.errorMessage.set('❌ Error cargando citas');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Obtener cita por ID
  getAppointmentById(id: number) {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiBaseUrl}/get-appointment/${id}`);
  }

  // ✅ Crear nueva cita
  createAppointment(newAppointment: Appointment): void {
    this.loading.set(true);
    this.http.post<ApiResponse<Appointment>>(`${this.apiBaseUrl}/create-appointment`, newAppointment).subscribe({
      next: (res) => {
        this._appointments.update(current => [...current, res.response]);
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error creando cita', err);
        this.errorMessage.set('❌ No se pudo crear la cita');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Actualizar cita
  updateAppointment(id: number, data: Partial<Appointment>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<Appointment>>(`${this.apiBaseUrl}/update-appointment/${id}`, data).subscribe({
      next: (res) => {
        this._appointments.update(current =>
          current.map(a => a.id === id ? res.response : a)
        );
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error actualizando cita', err);
        this.errorMessage.set('❌ No se pudo actualizar la cita');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Eliminar cita
  deleteAppointment(id: number): void {
    const current = this._appointments();
    this._appointments.set(current.filter(a => a.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-appointment/${id}`).subscribe({
      next: () => this.errorMessage.set(null),
      error: (err) => {
        console.error('Error eliminando cita', err);
        this.errorMessage.set('❌ No se pudo eliminar la cita');
        this._appointments.set(current); // rollback
      }
    });
  }
}
