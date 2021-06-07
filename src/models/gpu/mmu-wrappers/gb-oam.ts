import { getBit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../mmu/gb-mmu";
import { GbLcdc } from "./gb-lcdc";
import { Gb8x16Tile, GbTile, GbTileData } from "./gb-tile-data";

export class GbOamFlags {
    public readonly bgAndWindowOverObj: number;
    public readonly yFlip: number;
    public readonly xFlip: number;
    public readonly paletteNumber: number;

    constructor(
        readonly flagByte: number
    ) {
        this.bgAndWindowOverObj = getBit(flagByte, 7);
        this.yFlip = getBit(flagByte, 6);
        this.xFlip = getBit(flagByte, 5);
        this.paletteNumber = getBit(flagByte, 4);
    }
}

export class GbOam {
    private readonly tileData: GbTileData;
    private readonly lcdc: GbLcdc;

    constructor(
        private readonly mmu: GbMmu,
    ) {
        this.tileData = new GbTileData(mmu);
        this.lcdc = new GbLcdc(mmu);
    }

    public getSpriteY(index: number): number {
        const yAddress = this.getSpriteStartIndex(index);
        return this.mmu.readByte(yAddress) - 16;
    }

    public getSpriteX(index: number): number {
        const xAddress = this.getSpriteStartIndex(index) | 1;
        return this.mmu.readByte(xAddress) - 8;
    }

    public getSpriteTile(index: number): GbTile {
        const tileAddress = this.getSpriteStartIndex(index) | 2;
        const tileIndex = this.mmu.readByte(tileAddress);
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
        const flagAddress = this.getSpriteStartIndex(index) | 3;
        return new GbOamFlags(this.mmu.readByte(flagAddress));
    }

    private getSpriteStartIndex(index: number): number {
        return 0xf300 + (index << 2);
    }
}
