import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { Patient } from '../models/patient.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentPatientsService {

    private http = inject(HttpClient);
    patients = signal<Patient[]>([]);
    loading = signal(false);
    base = `${API_BASE_URL}/${API_ENDPOINTS.patients}`;

    async getPatients() {
        this.loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<{ status: number; message: string; response: Patient[] }>(
                    `${this.base}/get-patients`
                )
            );
            this.patients.set(res?.response || []);
        } finally {
            this.loading.set(false);
        }
    }

    findById(id: number) {
        return this.patients().find(p => p.id === id);
    }

    async getPatientById(id: number) {
        const res = await firstValueFrom(
            this.http.get<{ response: Patient }>(`${this.base}/get-patient/${id}`)
        );

        return res.response;
    }
}
