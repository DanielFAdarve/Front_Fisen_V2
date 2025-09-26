import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PackageDataService } from '../services/package-data-service';
import { StatusPackageDataService } from '../services/status-package-data-service';
import { Package } from '../models/package';
import { StatusPackage } from '../models/status-package';
import { PackageFormDialog } from './package-form-dialog/package-form-dialog';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-package',
  templateUrl: './package.html',
  styleUrls: ['./package.scss'],
  imports: [CommonModule]
})
export class PackageComponent implements OnInit {
  private packageService = inject(PackageDataService);
  private statusService = inject(StatusPackageDataService);
  private dialog = inject(MatDialog);

  packages = this.packageService.packages;
  loading = this.packageService.loading;
  errorMessage = this.packageService.errorMessage;
  estados = this.statusService.estados;

  ngOnInit(): void {
    this.packageService.getPackages();
    this.statusService.getEstadosPaquetes();
  }

  getEstadoNombre(idEstado: number): string {
    const estado = this.estados().find(e => e.id === idEstado);
    return estado ? estado.nombre : '—';
  }

  openDialog(pkg: Package | null, readOnly = false): void {
    const dialogRef = this.dialog.open(PackageFormDialog, {
      width: '600px',
      data: { package: pkg, readOnly }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (pkg) {
          this.packageService.updatePackage(pkg.id, result);
        } else {
          this.packageService.createPackage(result);
        }
      }
    });
  }

  deletePackage(id: number): void {
    if (confirm('¿Seguro que quieres eliminar este paquete?')) {
      this.packageService.deletePackage(id);
    }
  }
}
