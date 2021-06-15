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
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 256, 256, 2, this.palettes);
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
    const { tileMap, palettes, positionControl } = this.gameboy.gameboy;
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
    const scrollXTop = positionControl.getScrollX() & 255;
    const scrollXBottom = (scrollXTop + 159) & 255;
    const scrollYTop = positionControl.getScrollY();
    const scrollYBottom = (scrollYTop + 143) & 255;
    for (let i = 0; i < 160; i++) {
      const x = (scrollXTop + i) & 255;
      this.lcd.updatePixel(x, scrollYTop, 4);
      this.lcd.updatePixel(x, scrollYBottom, 4);
    }
    for (let i = 0; i < 144; i++) {
      const y = (scrollYTop + i) & 255;
      this.lcd.updatePixel(scrollXTop, y, 4);
      this.lcd.updatePixel(scrollXBottom, y, 4);
    }
    this.lcd.draw();
  }
}
