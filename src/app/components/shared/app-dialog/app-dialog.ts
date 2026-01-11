import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule, MAT_DIALOG_DATA, MatDialogRef } from '../../../modules/material/material-module';

export interface DialogData {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  inputPlaceholder?: string;
  inputLabel?: string;
  inputValue?: string;
  okText?: string;
  cancelText?: string;
  color?: 'primary' | 'warn' | 'accent';
  icon?: string;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './app-dialog.html',
  styleUrl: './app-dialog.scss',
})
export class AppDialogComponent {
  inputResult = '';

  constructor(
    public dialogRef: MatDialogRef<AppDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.inputValue) {
      this.inputResult = data.inputValue;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.data.type === 'prompt') {
      this.dialogRef.close(this.inputResult);
    } else {
      this.dialogRef.close(true);
    }
  }
}
