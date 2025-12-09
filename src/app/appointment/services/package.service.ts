import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Package, AttentionPackage } from '../models/package.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PackageDataService {

    private http = inject(HttpClient);

    packages = signal<Package[]>([]);
    attentionPackages = signal<AttentionPackage[]>([]);
    loading = signal(false);

    base = `http://localhost:3000/packages`;

    async loadByPatient(idPaciente: number) {
        this.loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<{ status: number; message: string; response: Package[] }>(
                    `${this.base}/get-by-patient/${idPaciente}`
                )
            );

            this.packages.set(res?.response || []);
        } finally {
            this.loading.set(false);
        }
    }

    async getAttentionPackages() {
        try {
            const res = await firstValueFrom(
                this.http.get<{
                    status: number;
                    message: string;
                    response: AttentionPackage[];
                }>(`http://localhost:3000/quotes/all-attention-packages`)
            );

            this.attentionPackages.set(res?.response || []);

        } catch {
            this.attentionPackages.set([]);
        }
    }

    async remainingSessions(packageId: number) {
        const res = await firstValueFrom(
            this.http.get<{
                status: number;
                message: string;
                response: { remaining: number };
            }>(`${this.base}/${packageId}/remaining-sessions`)
        );

        return res.response;
    }
}
