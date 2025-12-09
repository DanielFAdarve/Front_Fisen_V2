import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientDataService {

    private http = inject(HttpClient);
    patients = signal<Patient[]>([]);
    loading = signal(false);
    base = `http://localhost:3000/patient`;

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
}
