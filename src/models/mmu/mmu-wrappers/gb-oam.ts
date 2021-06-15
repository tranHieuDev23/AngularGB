import { getBit } from "src/utils/arithmetic-utils";
import { FORBIDDEN_RAM_START, OAM_RAM_START } from "../gb-mmu-constants";
import { GbLcdc } from "./gb-lcdc";
import { Gb8x16Tile, GbTile, GbTileData } from "./gb-tile-data";

export class GbOamFlags {
    public readonly bgAndWindowOverObj: number;
    public readonly yFlip: number;
    public readonly xFlip: number;
    public readonly paletteNumber: number;

    constructor(
        public readonly flagByte: number
    ) {
        this.bgAndWindowOverObj = getBit(flagByte, 7);
        this.yFlip = getBit(flagByte, 6);
        this.xFlip = getBit(flagByte, 5);
        this.paletteNumber = getBit(flagByte, 4);
    }
}

export class GbOam {
    private readonly oamTable: number[] = new Array<number>(FORBIDDEN_RAM_START - OAM_RAM_START).fill(0);
    private oamRegisterValue = 0;

    constructor(
        private readonly tileData: GbTileData,
        private readonly lcdc: GbLcdc
    ) { }

    public getOamTableValue(address: number): number {
        return this.oamTable[address - OAM_RAM_START];
    }

    public getSpriteY(index: number): number {
        const yAddress = this.getSpriteStartIndex(index);
        return this.oamTable[yAddress];
    }

    public getSpriteX(index: number): number {
        const xAddress = this.getSpriteStartIndex(index) | 1;
        return this.oamTable[xAddress];
    }

    public getSpriteTile(index: number): GbTile {
        const tileAddress = this.getSpriteStartIndex(index) | 2;
        const tileIndex = this.oamTable[tileAddress];
        if (this.lcdc.getObjSize() === 0) {
            return this.tileData.getObjTile(tileIndex);
        } else {
            const topIndex = tileIndex & 0xfe;
            const bottomIndex = topIndex | 0x01;
            return new Gb8x16Tile(
                this.tileData.getObjTile(topIndex),
                this.tileData.getObjTile(bottomIndex)
            );
        }
    }

    public getSpriteFlags(index: number): GbOamFlags {
        const flagsAddress = this.getSpriteStartIndex(index) | 3;
        return new GbOamFlags(this.oamTable[flagsAddress]);
    }

    public getDmaRegisterValue(): number {
        return this.oamRegisterValue;
    }

    public setOamTableValue(address: number, value: number): void {
        this.oamTable[address - OAM_RAM_START] = value;
    }

    public setDmaRegisterValue(value: number): void {
        this.oamRegisterValue = value;
    }

    private getSpriteStartIndex(index: number): number {
        return index * 4;
    }
}
