import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './shared-table.html',
  styleUrls: ['./shared-table.scss']
})
export class SharedTableComponent {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';

  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();
  @Output() pay = new EventEmitter<any>();
  
  onEdit(row: any) {
    this.edit.emit(row);
  }

  onView(row: any) {
    this.view.emit(row);
  }

  onDelete(id: number) {
    this.delete.emit(id);
  }
}
