import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-bg-map-viewer",
  templateUrl: "./bg-map-viewer.component.html",
  styleUrls: ["./bg-map-viewer.component.scss"]
})
export class BgMapViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvas") canvas: ElementRef<HTMLCanvasElement>;

  @Input("gameboy") gameboy: GameboyComponent;
  @Input("palettes") palettes: string[] = [
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
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 256, 256, 2, this.palettes);
    this.updateCanvas();
    this.subscriptions = [
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
    const { tileMap, palettes, positionControl } = this.gameboy.gameboy.gpu;
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
    const scrollX = positionControl.getScrollX();
    const scrollY = positionControl.getScrollY();
    for (let x = scrollX; x < scrollX + 160; x++) {
      this.lcd.updatePixel(x, scrollY, 4);
      this.lcd.updatePixel(x, scrollY + 143, 4);
    }
    for (let y = scrollY; y < scrollY + 144; y++) {
      this.lcd.updatePixel(scrollX, y, 4);
      this.lcd.updatePixel(scrollX + 159, y, 4);
    }
    this.lcd.draw();
  }
}
