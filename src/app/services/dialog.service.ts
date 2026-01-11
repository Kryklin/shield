import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppDialogComponent, DialogData } from '../components/shared/app-dialog/app-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);

  open(data: DialogData) {
    return this.dialog.open(AppDialogComponent, {
      data,
      width: '400px',
      panelClass: 'glass-dialog-panel', // Global class we need to ensure exists or add style here
      backdropClass: 'glass-dialog-backdrop',
      disableClose: data.type === 'alert'
    });
  }

  alert(title: string, message: string, okText = 'OK'): Promise<boolean> {
    return this.open({
      title,
      message,
      type: 'alert',
      okText,
      icon: 'info',
      color: 'primary'
    }).afterClosed().toPromise();
  }

  confirm(title: string, message: string, okText = 'Confirm', cancelText = 'Cancel', color: 'primary' | 'warn' | 'accent' = 'primary'): Promise<boolean> {
    return this.open({
      title,
      message,
      type: 'confirm',
      okText,
      cancelText,
      icon: 'help_outline',
      color
    }).afterClosed().toPromise();
  }

  prompt(title: string, message: string, inputLabel = 'Value', inputPlaceholder = '', okText = 'OK', cancelText = 'Cancel'): Promise<string | false> {
    return this.open({
      title,
      message,
      type: 'prompt',
      inputLabel,
      inputPlaceholder,
      okText,
      cancelText,
      icon: 'edit',
      color: 'accent'
    }).afterClosed().toPromise();
  }
}
