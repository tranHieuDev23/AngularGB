import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './timer.component';
import { NzTableModule } from 'ng-zorro-antd/table';



@NgModule({
  declarations: [
    TimerComponent
  ],
  imports: [
    CommonModule,
    NzTableModule
  ],
  exports: [
    TimerComponent
  ]
})
export class TimerModule { }
