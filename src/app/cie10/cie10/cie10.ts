import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Cie10DataService } from '../../services/cie10-data-service';
import { Cie10 } from '../../models/cie10';

@Component({
  selector: 'app-cie10',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './cie10.html',
  styleUrls: ['./cie10.scss']
})
export class Cie10Component implements OnInit {
  private cie10Service = inject(Cie10DataService);
  private dialog = inject(MatDialog);

  cie10 = this.cie10Service.cie10;
  loading = this.cie10Service.loading;
  errorMessage = this.cie10Service.errorMessage;

  filtro = signal<string>('');

  filteredCie10 = computed(() => {
    const term = this.filtro().toLowerCase().trim();
    const list = this.cie10();

    if (!term) return list;

    return list.filter((c: Cie10) =>
      Object.values(c).some(val =>
        val ? String(val).toLowerCase().includes(term) : false
      )
    );
  });

  displayedColumns: string[] = ['id', 'codigo', 'descripcion', 'acciones'];

  ngOnInit(): void {
    this.cie10Service.getCie10();
  }

  nuevoCie10() {
    // Aquí abrirías tu dialog (ej. Cie10FormDialogComponent)
    alert('Abrir modal para crear CIE10');
  }

  editarCie10(item: Cie10) {
    // Aquí abrirías tu dialog pasando el item
    alert(`Editar CIE10: ${item.codigo}`);
  }

  eliminarCie10(id: number) {
    if (confirm('¿Seguro que deseas eliminar este CIE10?')) {
      // aún no tienes método delete en el service
      alert(`Eliminar CIE10 con id=${id}`);
    }
  }
}
