import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisassemblerComponent } from './disassembler.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ToBaseStringModule } from 'src/app/pipes/to-base-string/to-base-string.module';
import { NzInputModule } from 'ng-zorro-antd/input';



@NgModule({
  declarations: [
    DisassemblerComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    ToBaseStringModule
  ],
  exports: [
    DisassemblerComponent
  ]
})
export class DisassemblerModule { }
