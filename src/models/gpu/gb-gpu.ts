import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbLcdc } from "./mmu-wrappers/gb-lcdc";
import { GbPalettes } from "./mmu-wrappers/gb-palettes";
import { GbPositionControl } from "./mmu-wrappers/gb-position-control";
import { GbStat } from "./mmu-wrappers/gb-stat";
import { GbTileMap } from "./mmu-wrappers/gb-tile-map";

export class GbGpu {
    private modeCycleCount = 0;

    public readonly lcdc: GbLcdc;
    public readonly palettes: GbPalettes;
    public readonly positionControl: GbPositionControl;
    public readonly stat: GbStat;
    public readonly tileMap: GbTileMap;

    constructor(
        readonly mmu: GbMmu,
        private readonly lcd: Lcd
    ) {
        this.lcdc = new GbLcdc(mmu);
        this.palettes = new GbPalettes(mmu);
        this.positionControl = new GbPositionControl(mmu);
        this.stat = new GbStat(mmu);
        this.tileMap = new GbTileMap(mmu);
    }

    public step(deltaCycleCount: number): void {
        this.modeCycleCount += deltaCycleCount;
        const mode = this.stat.getModeFlag();
        switch (mode) {
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
        const lycEqualLy = this.positionControl.getLy() === this.positionControl.getLyc();
        this.stat.setLycEqualLy(lycEqualLy ? 1 : 0);
    }

    private stepMode0(): void {
        if (this.modeCycleCount < 204) {
            return;
        }
        this.modeCycleCount = 0;
        this.positionControl.setLy(this.positionControl.getLy() + 1);
        if (this.positionControl.getLy() > 144) {
            this.lcd.draw();
            this.stat.setModeFlag(1);
        } else {
            this.stat.setModeFlag(2);
        }
    }

    private stepMode1(): void {
        if (this.modeCycleCount < 456) {
            return;
        }
        this.modeCycleCount = 0;
        this.positionControl.setLy(this.positionControl.getLy() + 1);
        if (this.positionControl.getLy() > 153) {
            this.positionControl.setLy(0);
            this.stat.setModeFlag(2);
        }
    }

    private stepMode2(): void {
        if (this.modeCycleCount < 80) {
            return;
        }
        this.modeCycleCount = 0;
        this.stat.setModeFlag(3);
    }

    private stepMode3(): void {
        if (this.modeCycleCount < 172) {
            return;
        }
        this.updateBackgroundLine();
        this.modeCycleCount = 0;
        this.stat.setModeFlag(0);
    }

    private updateBackgroundLine(): void {
        const scanLine = this.positionControl.getLy();
        const tileRow = ((scanLine + this.positionControl.getScrollY()) & 255) >> 3;
        let tileCol = this.positionControl.getScrollX() >> 3;
        let tile = this.tileMap.getBgTile((tileRow << 5) + tileCol);

        const tileY = (scanLine + this.positionControl.getScrollY()) & 7;
        let tileX = this.positionControl.getScrollX() & 7;

        for (let x = 0; x < 160; x++) {
            const color = this.palettes.getBgPaletteColor(tile.getColorIndex(tileX, tileY));
            this.lcd.updatePixel(x, scanLine, color);
            tileX++;
            if (tileX === 8) {
                tileCol = (tileCol + 1) & 31;
                tile = this.tileMap.getBgTile((tileRow << 5) + tileCol);
                tileX = 0;
            }
        }
    }
}
