import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { Package, AttentionPackage, PackageDetail } from '../models/package.model';
import { firstValueFrom } from 'rxjs';

export type PackageType = {
  id: number;
  descripcion: string;
  cantidad_sesiones: number;
  valor: number;
};

@Injectable({ providedIn: 'root' })
export class AppointmentPackagesService {

  private http = inject(HttpClient);

  packages = signal<Package[]>([]);
  attentionPackages = signal<AttentionPackage[]>([]);
  packageTypes = signal<PackageType[]>([]); // ✅ NUEVO

  loading = signal(false);

  base = `${API_BASE_URL}/${API_ENDPOINTS.packages}`;

  // ----------------------------------------------------
  // PAQUETES POR PACIENTE
  // ----------------------------------------------------
  async loadByPatient(idPaciente: number) {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<{ response: Package[] }>(
          `${this.base}/get-by-patient/${idPaciente}`
        )
      );

      this.packages.set(res?.response || []);
    } finally {
      this.loading.set(false);
    }
  }

  // ----------------------------------------------------
  // CATALOGO ATENCIONES
  // ----------------------------------------------------
  async getAttentionPackages() {
    const res = await firstValueFrom(
      this.http.get<{ response: AttentionPackage[] }>(
        `${API_BASE_URL}/${API_ENDPOINTS.appointments}/all-attention-packages`
      )
    );

    this.attentionPackages.set(res?.response || []);
  }

  // ----------------------------------------------------
  // ✅ CATALOGO TIPOS DE PAQUETES
  // ----------------------------------------------------
  async getPackageTypes() {
    const res = await firstValueFrom(
      this.http.get<{ response: PackageType[] }>(
        `${this.base}/get-packages`
      )
    );

    this.packageTypes.set(res?.response || []);
  }

  // ----------------------------------------------------
  // CREAR PAQUETE
  // ----------------------------------------------------
  async create(payload: {
    id_pacientes: number;
    id_paquetes_atenciones: number;
    id_estado_citas: number;
  }) {
    const res = await firstValueFrom(
      this.http.post<{ response: Package }>(
        `${this.base}/create`,
        payload
      )
    );

    return res.response;
  }

  // ----------------------------------------------------
  // DETALLE
  // ----------------------------------------------------
  async getPackageDetail(idPaquete: number) {
    try {
      const res = await firstValueFrom(
        this.http.get<{ response: PackageDetail }>(
          `${this.base}/get/${idPaquete}`
        )
      );
      return res.response;
    } catch {
      return null;
    }
  }
}
