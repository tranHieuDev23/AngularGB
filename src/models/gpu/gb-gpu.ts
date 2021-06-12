import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { GbLcdc } from "../mmu/mmu-wrappers/gb-lcdc";
import { GbOam } from "../mmu/mmu-wrappers/gb-oam";
import { GbPalettes } from "../mmu/mmu-wrappers/gb-palettes";
import { GbPositionControl } from "../mmu/mmu-wrappers/gb-position-control";
import { GbStat } from "../mmu/mmu-wrappers/gb-stat";
import { GbTileMap } from "../mmu/mmu-wrappers/gb-tile-map";

export class GbGpu {
    private modeCycleCount = 0;

    private readonly interrupts: GbInterrupts;
    private readonly lcdc: GbLcdc;
    private readonly palettes: GbPalettes;
    private readonly positionControl: GbPositionControl;
    private readonly oam: GbOam;
    private readonly stat: GbStat;
    private readonly tileMap: GbTileMap;

    constructor(
        readonly mmu: GbMmu,
        private readonly lcd: Lcd
    ) {
        this.interrupts = new GbInterrupts(mmu);
        this.lcdc = new GbLcdc(mmu);
        this.palettes = new GbPalettes(mmu);
        this.positionControl = new GbPositionControl(mmu);
        this.oam = new GbOam(mmu);
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
            this.interrupts.setVBlankInterruptFlag(1);
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
        this.updateLine();
        this.modeCycleCount = 0;
        this.stat.setModeFlag(0);
    }

    private updateLine(): void {
        const scanLine = this.positionControl.getLy();
        const lineColor = new Array<number>(160).fill(0);

        // Fetch background layer color
        if (this.lcdc.getBgAndWindowEnable() === 1) {
            const bgTileRow = ((scanLine + this.positionControl.getScrollY()) & 255) >> 3;
            let bgTileCol = this.positionControl.getScrollX() >> 3;
            let bgTile = this.tileMap.getBgTile((bgTileRow << 5) + bgTileCol);
            const bgTileY = (scanLine + this.positionControl.getScrollY()) & 7;
            let bgTileX = this.positionControl.getScrollX() & 7;
            for (let lineX = 0; lineX < 160; lineX++) {
                const color = this.palettes.getBgPaletteColor(bgTile.getColorIndex(bgTileX, bgTileY));
                lineColor[lineX] = color;
                bgTileX++;
                if (bgTileX === 8) {
                    bgTileCol = (bgTileCol + 1) & 31;
                    bgTile = this.tileMap.getBgTile((bgTileRow << 5) + bgTileCol);
                    bgTileX = 0;
                }
            }
        }

        // Fetch sprites
        if (this.lcdc.getObjEnable() === 1) {
            const spriteHeight = this.lcdc.getObjSize() === 0 ? 8 : 16;
            let drawnSpriteCnt = 0;
            for (let i = 0; i < 40 && drawnSpriteCnt < 10; i++) {
                const spriteY = this.oam.getSpriteY(i) - 16;
                const spriteYBottom = spriteY + spriteHeight;
                if (scanLine < spriteY || spriteYBottom <= scanLine) {
                    continue;
                }

                const spriteX = this.oam.getSpriteX(i) - 8;
                const spriteTile = this.oam.getSpriteTile(i);
                const spriteFlags = this.oam.getSpriteFlags(i);
                const tileY = scanLine - spriteY;
                for (let tileX = 0, lineX = spriteX; tileX < 8 && lineX < 160; tileX++, lineX++) {
                    const drawOverBg = spriteFlags.bgAndWindowOverObj === 0 || lineColor[lineX] === 0;
                    if (!drawOverBg) {
                        continue;
                    }
                    const actualY = spriteFlags.yFlip === 0 ? tileY : 7 - tileY;
                    const actualX = spriteFlags.xFlip === 0 ? tileX : 7 - tileX;
                    const color = this.palettes.getObjPaletteColor(
                        spriteFlags.paletteNumber,
                        spriteTile.getColorIndex(actualX, actualY)
                    );
                    // 0 is transparent color
                    if (color === 0) {
                        continue;
                    }
                    lineColor[lineX] = color;
                }

                drawnSpriteCnt++;
            }
        }

        // Actually drawing
        for (let x = 0; x < 160; x++) {
            this.lcd.updatePixel(x, scanLine, lineColor[x]);
        }
    }
}
