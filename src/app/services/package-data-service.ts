import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Package } from '../models/package';

interface ApiResponse<T> {
  status: number;
  message: string;
  response: T;
}

@Injectable({ providedIn: 'root' })
export class PackageDataService {
  private apiBaseUrl = 'http://localhost:3000/packages';

  private _packages = signal<Package[]>([]);
  packages = this._packages.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getPackages(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Package[]>>(`${this.apiBaseUrl}/get-packages`).subscribe({
      next: (data) => {
        this._packages.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: () => this.errorMessage.set('❌ Error cargando paquetes'),
      complete: () => this.loading.set(false)
    });
  }

  getPackageById(id: number) {
    return this.http.get<ApiResponse<Package>>(`${this.apiBaseUrl}/get-package/${id}`);
  }

  createPackage(newPackage: Package): void {
    this.loading.set(true);
    this.http.post<ApiResponse<Package>>(`${this.apiBaseUrl}/create-package`, newPackage).subscribe({
      next: (res) => this._packages.update(cur => [...cur, res.response]),
      error: () => this.errorMessage.set('❌ No se pudo crear el paquete'),
      complete: () => this.loading.set(false)
    });
  }

  updatePackage(id: number, data: Partial<Package>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<Package>>(`${this.apiBaseUrl}/update-package/${id}`, data).subscribe({
      next: (res) => this._packages.update(cur => cur.map(p => p.id === id ? res.response : p)),
      error: () => this.errorMessage.set('❌ No se pudo actualizar el paquete'),
      complete: () => this.loading.set(false)
    });
  }

  deletePackage(id: number): void {
    const current = this._packages();
    this._packages.set(current.filter(p => p.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-package/${id}`).subscribe({
      error: () => {
        this.errorMessage.set('❌ No se pudo eliminar el paquete');
        this._packages.set(current); // rollback
      }
    });
  }
}
