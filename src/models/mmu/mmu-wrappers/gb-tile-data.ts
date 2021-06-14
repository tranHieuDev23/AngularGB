import { getBit, toSigned8Bit } from "src/utils/arithmetic-utils";
import { TILE_DATA_BLOCK_0_ADDRESS, TILE_DATA_BLOCK_2_ADDRESS, TILE_MAP_0_ADDRESS } from "../gb-mmu-constants";
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

const TILE_DATA_BLOCK_2_START = TILE_DATA_BLOCK_2_ADDRESS - TILE_DATA_BLOCK_0_ADDRESS;

export class GbTileData {
    private readonly tileDataTable: number[] = new Array<number>(TILE_MAP_0_ADDRESS - TILE_DATA_BLOCK_0_ADDRESS).fill(0);

    constructor(
        private readonly lcdc: GbLcdc
    ) { }

    public getTileDataValue(address: number): number {
        return this.tileDataTable[address - TILE_DATA_BLOCK_0_ADDRESS];
    }

    public getObjTile(index: number): Gb8x8Tile {
        return this.getTile(index * 16);
    }

    public getBgAndWindowTile(index: number): Gb8x8Tile {
        if (this.lcdc.getBgAndWindowTileDataArea() === 1) {
            return this.getTile(index * 16);
        } else {
            return this.getTile(TILE_DATA_BLOCK_2_START + (toSigned8Bit(index) * 16));
        }
    }

    public getTile(address: number): Gb8x8Tile {
        const dataBytes: number[] = [];
        for (let i = address; i < address + 16; i++) {
            dataBytes.push(this.tileDataTable[i]);
        }
        return new Gb8x8Tile(dataBytes);
    }

    public setTileDataValue(address: number, value: number): void {
        this.tileDataTable[address - TILE_DATA_BLOCK_0_ADDRESS] = value;
    }
}
