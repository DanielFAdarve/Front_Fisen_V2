import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { Professional } from '../models/professional.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfessionalDataService {
    private http = inject(HttpClient);
    professionals = signal<Professional[]>([]);
    loading = signal(false);
    base = `${API_BASE_URL}/${API_ENDPOINTS.professionalsAlt}`;

    async loadAll() {
        this.loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<any>(`${this.base}/get-all`)
            );

            const list = Array.isArray(res)
                ? res
                : Array.isArray(res.response)
                    ? res.response
                    : [];

            this.professionals.set(list);
        } finally {
            this.loading.set(false);
        }
    }
}
