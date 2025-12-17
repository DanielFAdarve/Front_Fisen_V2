import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../models/appointment.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentDataService {

    private http = inject(HttpClient);

    appointments = signal<Appointment[]>([]);
    loading = signal(false);
    errorMessage = signal('');

    base = `https://back-fisent.onrender.com/quotes`;

    async loadAll() {
        this.loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<{ status: number; message: string; response: Appointment[] }>(
                    `${this.base}/all`
                )
            );

            this.appointments.set(res?.response || []);
        } catch (err: any) {
            this.errorMessage.set(err?.message || 'Error cargando citas');
        } finally {
            this.loading.set(false);
        }
    }

    async create(appointment: Appointment) {
        const res = await firstValueFrom(
            this.http.post<{ status: number; message: string; response: Appointment }>(
                `${this.base}/create`,
                appointment
            )
        );
        return res.response;
    }

    async update(id: number, appointment: Partial<Appointment>) {
        const res = await firstValueFrom(
            this.http.put<{ status: number; message: string; response: Appointment }>(
                `${this.base}/update/${id}`,
                appointment
            )
        );
        return res.response;
    }

    async delete(id: number) {
        return firstValueFrom(
            this.http.delete(`${this.base}/${id}`)
        );
    }

    async availability(professionalId: number, date: string) {
        const res = await firstValueFrom(
            this.http.get<{ status: number; message: string; response: Appointment[] }>(
                `${this.base}/availability/${professionalId}?date=${date}`
            )
        );

        return res.response;
    }

    async refresh() {
        await this.loadAll();
    }
}
