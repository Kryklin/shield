import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const FORM_MODULES = [
  FormsModule,
  ReactiveFormsModule
];

@NgModule({
  imports: [FORM_MODULES],
  exports: [FORM_MODULES],
})
export class AppFormsModule { }
