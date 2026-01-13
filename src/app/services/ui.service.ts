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
}
