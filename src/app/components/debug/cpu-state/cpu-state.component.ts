import { Component, Input } from "@angular/core";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-cpu-state",
  templateUrl: "./cpu-state.component.html",
  styleUrls: ["./cpu-state.component.scss"]
})
export class CpuStateComponent {
  @Input("gameboy") gameboy: GameboyComponent;
}
