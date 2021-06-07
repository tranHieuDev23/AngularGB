import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbPalettes } from "./mmu-wrappers/gb-palettes";
import { GbPositionControl } from "./mmu-wrappers/gb-position-control";
import { GbStat } from "./mmu-wrappers/gb-stat";
import { GbTileMap } from "./mmu-wrappers/gb-tile-map";

export class GbGpu {
    private mode = 0;
    private modeCycleCount = 0;
    private currentScanline = 0;

    private readonly palettes: GbPalettes;
    private readonly positionControl: GbPositionControl;
    private readonly stat: GbStat;
    private readonly tileMap: GbTileMap;

    constructor(
        private readonly mmu: GbMmu,
        private readonly lcd: Lcd
    ) {
        this.palettes = new GbPalettes(mmu);
        this.positionControl = new GbPositionControl(mmu);
        this.stat = new GbStat(mmu);
        this.tileMap = new GbTileMap(mmu);
    }

    public step(deltaCycleCount: number): void {
        this.modeCycleCount += deltaCycleCount;
        switch (this.mode) {
            case 0:
                this.stepMode0();
                break;
            case 1:
                this.stepMode1();
                break;
            case 2:
                this.stepMode2();
                break;
            case 3:
                this.stepMode3();
                break;
        }
        this.positionControl.setLy(this.currentScanline);
        this.stat.setLycEqualLy(
            this.currentScanline === this.positionControl.getLyc()
                ? 1 : 0
        );
        this.stat.setModeFlag(this.mode);
    }

    private stepMode0(): void {
        if (this.modeCycleCount >= 204) {
            this.modeCycleCount = 0;
            this.currentScanline++;
            if (this.currentScanline === 144) {
                this.lcd.draw();
                this.mode = 1;
            } else {
                this.mode = 2;
            }
        }
    }

    private stepMode1(): void {
        if (this.modeCycleCount >= 456) {
            this.modeCycleCount = 0;
            this.currentScanline++;
            if (this.currentScanline > 153) {
                this.mode = 2;
                this.currentScanline = 0;
            }
        }
    }

    private stepMode2(): void {
        if (this.modeCycleCount >= 80) {
            this.mode = 3;
            this.modeCycleCount = 0;
        }
    }

    private stepMode3(): void {
        if (this.modeCycleCount >= 172) {
            this.updateBackgroundLine();
            this.modeCycleCount = 0;
            this.mode = 0;
        }
    }

    private updateBackgroundLine(): void {
        const tileRow = ((this.currentScanline + this.positionControl.getScrollY()) & 255) >> 3;
        let tileCol = this.positionControl.getScrollX() >> 3;
        let tile = this.tileMap.getBgTile((tileRow << 5) + tileCol);

        const tileY = (this.currentScanline + this.positionControl.getScrollY()) & 7;
        let tileX = this.positionControl.getScrollX() & 7;

        for (let x = 0; x < 160; x++) {
            const color = this.palettes.getBgPalleteColor(tile.getColorIndex(tileX, tileY));
            this.lcd.updatePixel(x, this.currentScanline, color);
            tileX++;
            if (tileX === 8) {
                tileCol = (tileCol + 1) & 31;
                tile = this.tileMap.getBgTile((tileRow << 5) + tileCol);
                tileX = 0;
            }
        }
    }
}
