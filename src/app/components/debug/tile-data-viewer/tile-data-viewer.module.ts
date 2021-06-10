import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TileDataViewerComponent } from "./tile-data-viewer.component";



@NgModule({
  declarations: [
    TileDataViewerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TileDataViewerComponent
  ]
})
export class TileDataViewModule { }
