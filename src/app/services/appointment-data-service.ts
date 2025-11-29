import { Injectable, signal } from '@angular/core';
import { Appointment } from '../models/appointment';
import { PatientDataService } from './patient-data-service';

@Injectable({ providedIn: 'root' })
export class AppointmentDataService {

  private _appointments = signal<Appointment[]>([]);
  appointments = this._appointments.asReadonly();

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private patientService: PatientDataService) {}

  // Inicializar datos dummy basados en pacientes
  seedAppointments(): void {
    const patients = this.patientService.patients();

    if (!patients.length) return;

    const generated: Appointment[] = [];

    let idCounter = 1;

    for (const p of patients) {
      const citasRandom = Math.floor(Math.random() * 3) + 1; // 1-3 citas

      for (let i = 0; i < citasRandom; i++) {
        generated.push({
          id: idCounter++,
          id_paciente: p.id,
          fecha_agendamiento: new Date(
            2025,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          numero_sesion: i + 1,
          motivo: ['Evaluación', 'Control', 'Dolor', 'Lesión', 'Seguimiento'][
            Math.floor(Math.random() * 5)
          ],
          id_profesional: Math.floor(Math.random() * 10) + 1,
          id_paquetes: Math.floor(Math.random() * 4) + 1
        });
      }
    }

    this._appointments.set(generated);
  }

  // CRUD
  crearCita(data: Appointment) {
    this._appointments.update(current => [
      ...current,
      { ...data, id: current.length ? Math.max(...current.map(c => c.id)) + 1 : 1 }
    ]);
  }

  actualizarCita(id: number, data: Partial<Appointment>) {
    this._appointments.update(current =>
      current.map(c => c.id === id ? { ...c, ...data } : c)
    );
  }

  eliminarCita(id: number) {
    this._appointments.update(current => current.filter(c => c.id !== id));
  }
}
