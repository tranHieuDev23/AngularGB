import { ElementRef } from "@angular/core";
import { Component, ViewChild } from "@angular/core";
import { Gameboy } from "src/models/gameboy/gameboy";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { GbMmuImpl } from "src/models/mmu/gb-mmu";
import { getMbc } from "src/models/mmu/mcb/mbc-factory";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  @ViewChild("canvas", { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  private gameboy: Gameboy = null;

  constructor() { }

  onRomSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    if (!element || element.files?.length === 0) {
      return;
    }
    const romFile = element.files?.item(0) as File;
    const reader = new FileReader();
    reader.onload = () => {
      const rom = Array.from(new Uint8Array(reader.result as ArrayBuffer));
      const mbc = getMbc(rom);
      const lcd = new CanvasLcd(this.canvas.nativeElement, 1, [
        "#000000",
        "#606060",
        "#c0c0c0",
        "#ffffff"
      ]);
      this.gameboy = new Gameboy(new GbMmuImpl(mbc), lcd);
      while (true) {
        this.gameboy.step();
      }
    };
    reader.readAsArrayBuffer(romFile);
  }
}
