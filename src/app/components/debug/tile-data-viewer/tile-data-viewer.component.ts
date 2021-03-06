import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-tile-data-viewer",
  templateUrl: "./tile-data-viewer.component.html",
  styleUrls: ["./tile-data-viewer.component.scss"]
})
export class TileDataViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvas") canvas: ElementRef<HTMLCanvasElement>;

  @Input() gameboy: GameboyComponent;
  @Input() palettes: string[] = [
    "#9bbc0f",
    "#8bac0f",
    "#306230",
    "#0f380f",
    "#1890ff"
  ];

  private lcd: CanvasLcd;
  private subscriptions: Subscription[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 192, 128, 2, this.palettes);
    this.updateCanvas();
    this.subscriptions = [
      this.gameboy.frameEnded.subscribe(() => this.updateCanvas()),
      this.gameboy.paused.subscribe(() => this.updateCanvas()),
      this.gameboy.stepSkipped.subscribe(() => this.updateCanvas()),
      this.gameboy.frameSkipped.subscribe(() => this.updateCanvas()),
      this.gameboy.stopped.subscribe(() => this.lcd.clear())
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  private updateCanvas(): void {
    const { tileData, palettes } = this.gameboy.gameboy;
    let tileX = 0;
    let tileY = 0;
    for (let address = 0; address < 0x1800; address += 16) {
      const tile = tileData.getTile(address);
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
      if (tileX === 192) {
        tileX = 0;
        tileY += 8;
      }
    }
    this.lcd.draw();
  }
}
