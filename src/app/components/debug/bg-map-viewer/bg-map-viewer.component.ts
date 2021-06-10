import { AfterViewInit, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-bg-map-viewer",
  templateUrl: "./bg-map-viewer.component.html",
  styleUrls: ["./bg-map-viewer.component.scss"]
})
export class BgMapViewerComponent implements AfterViewInit {
  @ViewChild("canvas") canvas: ElementRef<HTMLCanvasElement>;

  @Input("gameboy") gameboy: GameboyComponent;
  @Input("palettes") palettes: string[] = [
    "#ffffff",
    "#c0c0c0",
    "#606060",
    "#000000"
  ];

  private lcd: CanvasLcd;

  constructor() { }

  ngAfterViewInit(): void {
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 256, 256, 1, this.palettes);
    this.gameboy.paused.subscribe(() => this.updateCanvas());
    this.gameboy.stepSkipped.subscribe(() => this.updateCanvas());
    this.gameboy.frameSkipped.subscribe(() => this.updateCanvas());
    this.gameboy.stopped.subscribe(() => this.lcd.clear());
  }

  private updateCanvas(): void {
    if (!this.gameboy.isDebugging) {
      return;
    }
    const { tileMap, palettes } = this.gameboy.gameboy.gpu;
    let tileX = 0;
    let tileY = 0;
    for (let i = 0; i < 1024; i++) {
      const tile = tileMap.getBgTile(i);
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          this.lcd.updatePixel(
            tileX + x,
            tileY + y,
            palettes.getBgPaletteColor(tile.getColorIndex(x, y))
          );
        }
      }
      tileX += 8;
      if (tileX === 256) {
        tileX = 0;
        tileY += 8;
      }
    }
    this.lcd.draw();
  }
}
