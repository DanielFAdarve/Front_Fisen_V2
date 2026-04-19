import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-history-document-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './history-document-viewer.component.html',
  styleUrls: ['./history-document-viewer.component.scss']
})
export class HistoryDocumentViewerComponent implements OnDestroy {
  private dialogRef = inject(MatDialogRef<HistoryDocumentViewerComponent>);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('docFrame') docFrame?: ElementRef<HTMLIFrameElement>;

  fileUrl: string;
  safeFileUrl: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { blob: Blob; fileName: string }
  ) {
    this.fileUrl = URL.createObjectURL(this.data.blob);
    this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
  }

  close() {
    this.dialogRef.close();
  }

  downloadDocx() {
    const link = document.createElement('a');
    link.href = this.fileUrl;
    link.download = this.data.fileName;
    link.click();
  }

  exportPdf() {
    const iframeWindow = this.docFrame?.nativeElement?.contentWindow;

    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
      return;
    }

    const popup = window.open(this.fileUrl, '_blank');
    popup?.focus();
    popup?.print();
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.fileUrl);
  }
}
