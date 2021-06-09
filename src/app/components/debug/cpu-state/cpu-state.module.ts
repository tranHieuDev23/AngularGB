import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpuStateComponent } from './cpu-state.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToBaseStringModule } from 'src/app/pipes/to-base-string/to-base-string.module';


@NgModule({
  declarations: [
    CpuStateComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    ToBaseStringModule
  ],
  exports: [
    CpuStateComponent
  ]
})
export class CpuStateModule { }
