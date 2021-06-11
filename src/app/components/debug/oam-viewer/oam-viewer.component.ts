import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { NzTableComponent } from "ng-zorro-antd/table";
import { Subscription } from "rxjs";
import { TileRenderService } from "src/app/services/tile-render/tile-render.service";
import { GbOamFlags } from "src/models/mmu/mmu-wrappers/gb-oam";
import { GameboyComponent } from "../../gameboy/gameboy.component";

export class OamViewerItem {
  constructor(
    public readonly yPosition: number,
    public readonly xPosition: number,
    public readonly flags: GbOamFlags,
    public readonly tile: string
  ) { }
}

@Component({
  selector: "app-oam-viewer",
  templateUrl: "./oam-viewer.component.html",
  styleUrls: ["./oam-viewer.component.scss"]
})
export class OamViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild("oamTable") oamTable: NzTableComponent;

  @Input("gameboy") gameboy: GameboyComponent;
  @Input("palettes") palettes: string[] = [
    "#9bbc0f",
    "#8bac0f",
    "#306230",
    "#0f380f",
    "#1890ff"
  ];

  public rows: OamViewerItem[];
  public skipToIndex = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly tileRender: TileRenderService
  ) {
    this.clear();
  }

  ngAfterViewInit(): void {
    this.update();
    this.subscriptions = [
      this.gameboy.paused.subscribe(() => this.update()),
      this.gameboy.stepSkipped.subscribe(() => this.update()),
      this.gameboy.frameSkipped.subscribe(() => this.update()),
      this.gameboy.stopped.subscribe(() => this.clear())
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  private update(): void {
    const { oam, palettes } = this.gameboy.gameboy;
    const tileRenderPromises = [];
    for (let i = 0; i < 40; i++) {
      tileRenderPromises.push(
        this.tileRender.renderSpriteTile(i, oam, palettes, this.palettes)
      );
    }
    Promise.all(tileRenderPromises).then((results) => {
      this.rows = results.map((tile, index) => {
        const yPosition = oam.getSpriteY(index);
        const xPosition = oam.getSpriteX(index);
        const flags = oam.getSpriteFlags(index);
        return new OamViewerItem(yPosition, xPosition, flags, tile);
      });
    });
  }

  private clear(): void {
    this.rows = [];
  }

  public jumpToSprite(index: number): void {
    this.oamTable?.cdkVirtualScrollViewport?.scrollToIndex(index);
  }
}
