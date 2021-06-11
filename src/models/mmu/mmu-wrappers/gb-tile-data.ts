import { getBit, toSigned8Bit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";
import { GbLcdc } from "./gb-lcdc";

export interface GbTile {
    getWidth(): number;
    getHeight(): number;
    getColorIndex(x: number, y: number): number;
}

export class Gb8x8Tile implements GbTile {
    constructor(
        private readonly colorIndices: number[][]
    ) { }

    getWidth(): number {
        return 8;
    }

    getHeight(): number {
        return 8;
    }

    getColorIndex(x: number, y: number): number {
        return this.colorIndices[x][y];
    }
}

export class Gb8x16Tile implements GbTile {
    constructor(
        private readonly topTile: Gb8x8Tile,
        private readonly bottomTile: Gb8x8Tile
    ) { }

    getWidth(): number {
        return 8;
    }

    getHeight(): number {
        return 16;
    }

    getColorIndex(x: number, y: number): number {
        return y < 8
            ? this.topTile.getColorIndex(x, y)
            : this.bottomTile.getColorIndex(x, y - 8);
    }
}

export class GbTileData {
    private readonly lcdc: GbLcdc;

    constructor(
        private readonly mmu: GbMmu
    ) {
        this.lcdc = new GbLcdc(mmu);
    }

    public getObjTile(index: number): Gb8x8Tile {
        return this.getTile(0x8000 + (16 << index));
    }

    public getBgAndWindowTile(index: number): Gb8x8Tile {
        if (this.lcdc.getBgAndWindowTileDataArea() === 1) {
            return this.getTile(0x8000 + (index * 16));
        } else {
            return this.getTile(0x9000 + (toSigned8Bit(index) * 16));
        }
    }

    public getTile(address: number): Gb8x8Tile {
        const colorIndices: number[][] = [
            [], [], [], [], [], [], [], []
        ];
        for (let y = 0; y < 8; y++) {
            const lowByteAddress = address | (y << 1);
            const highByteAddress = lowByteAddress | 1;
            const lineLowByte = this.mmu.readByte(lowByteAddress);
            const lineHighByte = this.mmu.readByte(highByteAddress);
            for (let x = 0; x < 8; x++) {
                const pixel = (getBit(lineHighByte, x) << 1) | getBit(lineLowByte, x);
                colorIndices[7 - x].push(pixel);
            }
        }
        return new Gb8x8Tile(colorIndices);
    }
}
