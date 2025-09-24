import { Component, Input, Output, EventEmitter , OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-shared-table',
  templateUrl: './shared-table.html',
  styleUrls: ['./shared-table.scss'],
  imports:[CommonModule, MatTableModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule]
})
export class SharedTableComponent<T> implements OnChanges {
  @Input() dataSource: T[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() loading = false;
  @Input() errorMessage: string | null = null;

  @Output() edit = new EventEmitter<T>();
  @Output() view = new EventEmitter<T>();
  @Output() delete = new EventEmitter<number>();

  fullColumns: string[] = [];

  ngOnChanges(): void {
    this.fullColumns = [...this.displayedColumns, 'acciones'];
  }

  onEdit(row: T) {
    this.edit.emit(row);
  }

  onView(row: T) {
    this.view.emit(row);
  }

  onDelete(id: number) {
    this.delete.emit(id);
  }
}