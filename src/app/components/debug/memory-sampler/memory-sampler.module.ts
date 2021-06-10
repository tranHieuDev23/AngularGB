import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MemorySamplerComponent } from "./memory-sampler.component";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { ToBaseStringModule } from "src/app/pipes/to-base-string/to-base-string.module";
import { NzIconModule } from "ng-zorro-antd/icon";



@NgModule({
  declarations: [
    MemorySamplerComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    ToBaseStringModule
  ],
  exports: [
    MemorySamplerComponent
  ]
})
export class MemorySamplerModule { }
