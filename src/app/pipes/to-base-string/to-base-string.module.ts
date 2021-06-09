import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToBaseStringPipe } from './to-base-string.pipe';



@NgModule({
  declarations: [
    ToBaseStringPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToBaseStringPipe
  ]
})
export class ToBaseStringModule { }
