import { EIGHT_ONE_BITS } from "src/utils/constants";
import { Lcd } from "../lcd/lcd";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { GbLcdc } from "../mmu/mmu-wrappers/gb-lcdc";
import { GbOam } from "../mmu/mmu-wrappers/gb-oam";
import { GbPalettes } from "../mmu/mmu-wrappers/gb-palettes";
import { GbPositionControl } from "../mmu/mmu-wrappers/gb-position-control";
import { GbTileMap } from "../mmu/mmu-wrappers/gb-tile-map";

export class GbGpu {
    private modeCycleCount = 0;
    private ly = 0;
    private mode = 0;

    // Window layer keeps an internal line count, independent from LY
    private windowLy: number;

    constructor(
        private readonly lcd: Lcd,
        private readonly interrupts: GbInterrupts,
        private readonly lcdc: GbLcdc,
        private readonly palettes: GbPalettes,
        private readonly positionControl: GbPositionControl,
        private readonly oam: GbOam,
        private readonly tileMap: GbTileMap
    ) {
        this.windowLy = null;
    }

    public getLy(): number {
        return this.ly;
    }

    public setLy(value: number): void {
        this.ly = value;
    }

    public getMode(): number {
        return this.mode;
    }

    public step(deltaCycleCount: number): void {
        // Check Window layer render condition, this only runs in the beginning of mode 2
        // Read here: https://gbdev.io/pandocs/Scrolling.html#ff4a---wy-window-y-position-rw-ff4b---wx-window-x-position--7-rw
        if (this.mode === 2 && this.modeCycleCount === 0) {
            const windowY = this.positionControl.getWindowY();
            if (windowY === this.ly) {
                // Start rendering window
                this.windowLy = 0;
            }
        }

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
    }

    private stepMode0(): void {
        if (this.modeCycleCount < 204) {
            return;
        }
        this.modeCycleCount = 0;
        this.ly++;
        if (this.ly > 144) {
            this.lcd.draw();
            this.mode = 1;
            this.interrupts.setVBlankInterruptFlag(1);
        } else {
            this.mode = 2;
        }
    }

    private stepMode1(): void {
        if (this.modeCycleCount < 456) {
            return;
        }
        this.modeCycleCount = 0;
        this.ly++;
        if (this.ly > 153) {
            this.ly = 0;
            this.windowLy = null;
            this.mode = 2;
        }
    }

    private stepMode2(): void {
        if (this.modeCycleCount < 80) {
            return;
        }
        this.mode = 3;
        this.modeCycleCount = 0;
    }

    private stepMode3(): void {
        if (this.modeCycleCount < 172) {
            return;
        }
        this.updateLine();
        this.mode = 0;
        this.modeCycleCount = 0;
    }

    private updateLine(): void {
        const lineColor = new Array<number>(160).fill(0);

        // Fetch background and window layer color
        if (this.lcdc.getBgAndWindowEnable() === 1) {
            const bgTileRow = ((this.ly + this.positionControl.getScrollY()) & EIGHT_ONE_BITS) >> 3;
            let bgTileCol = this.positionControl.getScrollX() >> 3;
            let bgTile = this.tileMap.getBgTile((bgTileRow << 5) + bgTileCol);
            const bgTileY = (this.ly + this.positionControl.getScrollY()) & 7;
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

            const windowX = this.positionControl.getWindowX();
            const windowEnable = this.lcdc.getWindowEnable();
            const canDrawWindow = windowEnable === 1 && this.windowLy !== null && windowX <= 166;
            if (canDrawWindow) {
                // Drawing window
                const xStartFrom = Math.max(0, windowX - 7);
                let windowTileIndex = (this.windowLy >> 3) << 5;
                let windowTile = this.tileMap.getWindowTile(windowTileIndex);
                const windowTileY = this.windowLy & 7;
                let windowTileX = windowX < 0 ? - windowX : 0;
                for (let lineX = xStartFrom; lineX < 160; lineX++) {
                    const color = this.palettes.getBgPaletteColor(windowTile.getColorIndex(windowTileX, windowTileY));
                    lineColor[lineX] = color;
                    windowTileX++;
                    if (windowTileX === 8) {
                        windowTileIndex++;
                        windowTile = this.tileMap.getWindowTile(windowTileIndex);
                        windowTileX = 0;
                    }
                }
                this.windowLy++;
            }
        }

        // Fetch sprites
        if (this.lcdc.getObjEnable() === 1) {
            const spriteHeight = this.lcdc.getObjSize() === 0 ? 8 : 16;
            const indicesToDraw: { index: number, spriteY: number, spriteX: number }[] = [];
            for (let index = 0; index < 40; index++) {
                const spriteY = this.oam.getSpriteY(index) - 16;
                const spriteYBottom = spriteY + spriteHeight;
                if (this.ly < spriteY || spriteYBottom <= this.ly) {
                    continue;
                }
                const spriteX = this.oam.getSpriteX(index) - 8;
                indicesToDraw.push({ index, spriteY, spriteX });
                if (indicesToDraw.length === 10) {
                    break;
                }
            }

            indicesToDraw.sort((a, b) => {
                if (a.spriteX != b.spriteX) {
                    return b.spriteX - a.spriteX;
                }
                return b.index - a.index;
            });

            for (const item of indicesToDraw) {
                const { index, spriteY, spriteX } = item;
                const spriteTile = this.oam.getSpriteTile(index);
                const spriteFlags = this.oam.getSpriteFlags(index);
                const tileY = this.ly - spriteY;
                for (let tileX = 0, lineX = spriteX; tileX < 8 && lineX < 160; tileX++, lineX++) {
                    const drawOverBg = spriteFlags.bgAndWindowOverObj === 0 || lineColor[lineX] === 0;
                    if (!drawOverBg) {
                        continue;
                    }
                    const actualY = spriteFlags.yFlip === 0 ? tileY : spriteTile.getHeight() - tileY - 1;
                    const actualX = spriteFlags.xFlip === 0 ? tileX : spriteTile.getWidth() - tileX - 1;
                    const colorIndex = spriteTile.getColorIndex(actualX, actualY);
                    // 0 is transparent color
                    if (colorIndex === 0) {
                        continue;
                    }
                    lineColor[lineX] = this.palettes.getObjPaletteColor(spriteFlags.paletteNumber, colorIndex);
                }
            }
        }

        // Actually drawing
        for (let x = 0; x < 160; x++) {
            this.lcd.updatePixel(x, this.ly, lineColor[x]);
        }
    }
}
