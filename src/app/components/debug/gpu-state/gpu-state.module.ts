import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpuStateComponent } from './gpu-state.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToBaseStringModule } from 'src/app/pipes/to-base-string/to-base-string.module';



@NgModule({
  declarations: [
    GpuStateComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    ToBaseStringModule
  ],
  exports: [
    GpuStateComponent
  ]
})
export class GpuStateModule { }
