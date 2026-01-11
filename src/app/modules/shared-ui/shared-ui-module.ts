import { NgModule } from '@angular/core';
import { CommonModule, AsyncPipe, NgOptimizedImage } from '@angular/common';
import { MaterialModule } from '../material/material-module';
import { AppFormsModule } from '../forms/forms-module';
import { IconsModule } from '../icons/icons-module';

const SHARED_MODULES = [
  CommonModule,
  MaterialModule,
  AppFormsModule,
  IconsModule,
];

const SHARED_PIPES = [
  AsyncPipe,
];

@NgModule({
  imports: [
    ...SHARED_MODULES,
    NgOptimizedImage
  ],
  exports: [
    ...SHARED_MODULES,
    SHARED_PIPES,
    NgOptimizedImage
  ],
})
export class SharedUiModule { }
