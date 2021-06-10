import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BgMapViewerComponent } from "./bg-map-viewer.component";



@NgModule({
  declarations: [
    BgMapViewerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BgMapViewerComponent
  ]
})
export class BgMapViewerModule { }
