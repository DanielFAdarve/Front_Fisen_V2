import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../core/models/api-response';
import { API_BASE_URL, API_ENDPOINTS } from '../../core/constants/api.constants';
import { Patient } from '../../models/patient';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiBaseUrl = `${API_BASE_URL}/${API_ENDPOINTS.patients}`;

  private _patients = signal<Patient[]>([]);
  patients = this._patients.asReadonly();
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los pacientes
  getPatients(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Patient[]>>(`${this.apiBaseUrl}/get-patients`).subscribe({
      next: (data) => {
        console.log('Pacientes cargados', data);
        this._patients.set(data.response || []);
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error cargando pacientes', err);
        this.errorMessage.set('❌ Error cargando pacientes');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Obtener paciente por ID
  getPatientById(id: number) {
    return this.http.get<ApiResponse<Patient>>(`${this.apiBaseUrl}/get-patient/${id}`);
  }

  // ✅ Crear nuevo paciente
  createPatient(newPatient: Patient): void {
    this.loading.set(true);
    this.http.post<ApiResponse<Patient>>(`${this.apiBaseUrl}/create-patient`, newPatient).subscribe({
      next: (res) => {
        this._patients.update(current => [...current, res.response]);
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error creando paciente', err);
        this.errorMessage.set('❌ No se pudo crear el paciente');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Actualizar paciente
  updatePatientData(id: number, data: Partial<Patient>): void {
    this.loading.set(true);
    this.http.put<ApiResponse<Patient>>(`${this.apiBaseUrl}/update-patient/${id}`, data).subscribe({
      next: (res) => {
        this._patients.update(current =>
          current.map(p => p.id === id ? res.response : p)
        );
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error actualizando paciente', err);
        this.errorMessage.set('❌ No se pudo actualizar el paciente');
      },
      complete: () => this.loading.set(false)
    });
  }

  // ✅ Eliminar paciente
  deletePatientData(id: number): void {
    const current = this._patients();
    this._patients.set(current.filter(p => p.id !== id));

    this.http.delete<ApiResponse<null>>(`${this.apiBaseUrl}/delete-patient/${id}`).subscribe({
      next: () => {
        this.errorMessage.set(null);
      },
      error: (err) => {
        console.error('Error eliminando paciente', err);
        this.errorMessage.set('❌ No se pudo eliminar el paciente');
        this._patients.set(current); // rollback
      }
    });
  }
}
