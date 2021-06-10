import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GameboyComponent } from "./gameboy.component";



@NgModule({
  declarations: [
    GameboyComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GameboyComponent
  ]
})
export class GameboyModule { }
