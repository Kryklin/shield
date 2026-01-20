import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatDialog } from '../modules/material/material-module';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/shared/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  showSnackBar(message: string, action = 'Close', duration = 3000) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  async confirm(data: ConfirmationDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: data,
      disableClose: true,
      panelClass: 'glass-dialog-panel'
    });

    const result = await dialogRef.afterClosed().toPromise();
    return !!result;
  }

  downloadJson(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  readJsonFile(): Promise<any> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
           resolve(null);
           return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
             const json = JSON.parse(evt.target?.result as string);
             resolve(json);
          } catch {
             reject('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
}
