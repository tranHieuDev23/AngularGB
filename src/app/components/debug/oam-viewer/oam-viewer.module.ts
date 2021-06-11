import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OamViewerComponent } from "./oam-viewer.component";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzButtonModule } from "ng-zorro-antd/button";
import { ToBaseStringModule } from "src/app/pipes/to-base-string/to-base-string.module";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { FormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    OamViewerComponent
  ],
  imports: [
    CommonModule,
    NzInputModule,
    NzInputNumberModule,
    NzTableModule,
    NzIconModule,
    NzButtonModule,
    ToBaseStringModule,
    FormsModule
  ],
  exports: [
    OamViewerComponent
  ]
})
export class OamViewerModule { }
