import { Component, Input } from "@angular/core";
import { GameboyComponent } from "../../gameboy/gameboy.component";

export class GpuStateRow {
  constructor(
    public readonly title: string,
    public readonly value: () => number
  ) { }
}

@Component({
  selector: "app-gpu-state",
  templateUrl: "./gpu-state.component.html",
  styleUrls: ["./gpu-state.component.scss"]
})
export class GpuStateComponent {
  @Input() gameboy: GameboyComponent;

  public rows: GpuStateRow[] = [
    new GpuStateRow("Scroll Y - 0XFF42", () => this.gameboy.gameboy.positionControl.getScrollY()),
    new GpuStateRow("Scroll X - 0XFF43", () => this.gameboy.gameboy.positionControl.getScrollX()),
    new GpuStateRow("Scanline register (LY) - 0XFF44", () => this.gameboy.gameboy.gpu.getLy()),
    new GpuStateRow("LYC register - 0XFF45", () => this.gameboy.gameboy.positionControl.getLyc()),
    new GpuStateRow("Window Y - 0XFF4a", () => this.gameboy.gameboy.positionControl.getWindowY()),
    new GpuStateRow("Window X - 0XFF4b", () => this.gameboy.gameboy.positionControl.getWindowX()),
    new GpuStateRow("LCD Status (STAT) - 0xFF41", () => this.gameboy.gameboy.stat.getValue()),
    new GpuStateRow("LCD Control (LCDC) - 0xFF40", () => this.gameboy.gameboy.lcdc.getValue())
  ];
}
