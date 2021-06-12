import { getBit, toSigned8Bit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";
import { TILE_DATA_BLOCK_0_ADDRESS, TILE_DATA_BLOCK_2_ADDRESS } from "../gb-mmu-constants";
import { GbLcdc } from "./gb-lcdc";

export interface GbTile {
    getWidth(): number;
    getHeight(): number;
    getColorIndex(x: number, y: number): number;
}

export class Gb8x8Tile implements GbTile {
    constructor(
        private readonly dataBytes: number[]
    ) { }

    getWidth(): number {
        return 8;
    }

    getHeight(): number {
        return 8;
    }

    getColorIndex(x: number, y: number): number {
        const lowByteIndex = y << 1;
        const highByteIndex = lowByteIndex | 1;
        const lowByte = this.dataBytes[lowByteIndex];
        const highByte = this.dataBytes[highByteIndex];
        const pixel = (getBit(highByte, 7 - x) << 1) | getBit(lowByte, 7 - x);
        return pixel;
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
        return (y & 8) === 0
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
        return this.getTile(TILE_DATA_BLOCK_0_ADDRESS + (index * 16));
    }

    public getBgAndWindowTile(index: number): Gb8x8Tile {
        if (this.lcdc.getBgAndWindowTileDataArea() === 1) {
            return this.getTile(TILE_DATA_BLOCK_0_ADDRESS + (index * 16));
        } else {
            return this.getTile(TILE_DATA_BLOCK_2_ADDRESS + (toSigned8Bit(index) * 16));
        }
    }

    public getTile(address: number): Gb8x8Tile {
        const dataBytes: number[] = [];
        for (let i = address; i < address + 16; i++) {
            dataBytes.push(this.mmu.readByte(i));
        }
        return new Gb8x8Tile(dataBytes);
    }
}
