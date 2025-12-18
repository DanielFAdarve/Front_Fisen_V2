// import { inject, Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Package, AttentionPackage, PackageDetail } from '../models/package.model';
// import { firstValueFrom } from 'rxjs';


// export type PackageType = {
//     id: number;
//     descripcion: string;
//     cantidad_sesiones: number;
//     valor: number;
// };

// @Injectable({ providedIn: 'root' })
// export class PackageDataService {

   
//     private http = inject(HttpClient);

//     packages = signal<Package[]>([]);
//     attentionPackages = signal<AttentionPackage[]>([]);
//     loading = signal(false);

//     base = `https://back-fisent.onrender.com/packages`;


//     // ----------------------------------------------------
//     // CARGAR PAQUETES POR PACIENTE
//     // ----------------------------------------------------
//     async loadByPatient(idPaciente: number) {
//         this.loading.set(true);
//         try {
//             const res = await firstValueFrom(
//                 this.http.get<{ status: number; message: string; response: Package[] }>(
//                     `${this.base}/get-by-patient/${idPaciente}`
//                 )
//             );

//             this.packages.set(res?.response || []);
//         } finally {
//             this.loading.set(false);
//         }
//     }

//     // ----------------------------------------------------
//     // CARGAR CATALOGOS DE TIPOS DE PAQUETES
//     // ----------------------------------------------------
//     async getAttentionPackages() {
//         try {
//             const res = await firstValueFrom(
//                 this.http.get<{
//                     status: number;
//                     message: string;
//                     response: AttentionPackage[];
//                 }>(`https://back-fisent.onrender.com/quotes/all-attention-packages`)
//             );

//             this.attentionPackages.set(res?.response || []);

//         } catch {
//             this.attentionPackages.set([]);
//         }
//     }

//     // ----------------------------------------------------
//     // SESIONES RESTANTES
//     // ----------------------------------------------------
//     async remainingSessions(packageId: number) {
//         const res = await firstValueFrom(
//             this.http.get<{
//                 status: number;
//                 message: string;
//                 response: { remaining: number };
//             }>(`${this.base}/${packageId}/remaining-sessions`)
//         );

//         return res.response;
//     }

//     // ----------------------------------------------------
//     // DETALLE DEL PAQUETE
//     // ----------------------------------------------------
//     // async getPackageDetail(idPaquete: number) {
//     //     try {
//     //         const res = await firstValueFrom(
//     //             this.http.get<{
//     //                 status: number;
//     //                 message: string;
//     //                 response: {
//     //                     id: number;
//     //                     id_pacientes: number;
//     //                     id_paquetes_atenciones: number;
//     //                     id_estado_citas: number;

//     //                     patient: any;
//     //                     attentionPackage: any;
//     //                     statusPackage: any;
//     //                     Quotes: any[];
//     //                 };
//     //             }>(`${this.base}/get/${idPaquete}`)
//     //         );

//     //         return res.response;

//     //     } catch (e) {
//     //         console.error('Error consultando detalle del paquete', e);
//     //         return null;
//     //     }
//     // }

//     async getPackageDetail(idPaquete: number) {
//         try {
//             const res = await firstValueFrom(
//                 this.http.get<{
//                     status: number;
//                     message: string;
//                     response: PackageDetail; // <-- AQUÍ CAMBIA
//                 }>(`${this.base}/get/${idPaquete}`)
//             );

//             return res.response;

//         } catch (e) {
//             console.error('Error consultando detalle del paquete', e);
//             return null;
//         }
//     }

//     // ----------------------------------------------------
//     // CREAR PAQUETE (FALTABA)
//     // ----------------------------------------------------
//     async create(payload: {
//         id_pacientes: number;
//         id_paquetes_atenciones: number;
//         id_estado_citas: number;
//     }) {
//         const res = await firstValueFrom(
//             this.http.post<{
//                 status: number;
//                 message: string;
//                 response: Package; // <-- usa tu interfaz exacta
//             }>(
//                 `${this.base}/create`,
//                 payload
//             )
//         );

//         return res.response; // <-- devuelve {id, id_pacientes, id_paquetes_atenciones, id_estado_citas}
//     }


// }


import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Package, AttentionPackage, PackageDetail } from '../models/package.model';
import { firstValueFrom } from 'rxjs';

export type PackageType = {
  id: number;
  descripcion: string;
  cantidad_sesiones: number;
  valor: number;
};

@Injectable({ providedIn: 'root' })
export class PackageDataService {

  private http = inject(HttpClient);

  packages = signal<Package[]>([]);
  attentionPackages = signal<AttentionPackage[]>([]);
  packageTypes = signal<PackageType[]>([]); // ✅ NUEVO

  loading = signal(false);

  base = `https://back-fisent.onrender.com/packages`;

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
        `https://back-fisent.onrender.com/quotes/all-attention-packages`
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
