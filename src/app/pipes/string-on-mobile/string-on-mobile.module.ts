import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringOnMobilePipe } from './string-on-mobile.pipe';



@NgModule({
  declarations: [
    StringOnMobilePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StringOnMobilePipe
  ]
})
export class StringOnMobileModule { }
