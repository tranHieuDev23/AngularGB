import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterruptsStateComponent } from './interrupts-state.component';
import { NzTableModule } from 'ng-zorro-antd/table';



@NgModule({
  declarations: [
    InterruptsStateComponent
  ],
  imports: [
    CommonModule,
    NzTableModule
  ],
  exports: [
    InterruptsStateComponent
  ]
})
export class InterruptsStateModule { }
