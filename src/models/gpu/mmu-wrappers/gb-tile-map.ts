import { GbMmu } from "../../mmu/gb-mmu";
import { GbLcdc } from "./gb-lcdc";
import { GbTile, GbTileData } from "./gb-tile-data";

export class GbTileMap {
    private readonly tileData: GbTileData;
    private readonly lcdc: GbLcdc;

    constructor(
        readonly mmu: GbMmu
    ) {
        this.tileData = new GbTileData(mmu);
        this.lcdc = new GbLcdc(mmu);
    }

    public getBgTile(index: number): GbTile {
        const tileIndexAddress = this.getTileIndexAddress(index, this.lcdc.getBgTitleMap());
        const tileIndex = this.mmu.readByte(tileIndexAddress);
        return this.tileData.getBgAndWindowTile(tileIndex);
    }

    public getWindowTile(index: number): GbTile {
        const tileIndexAddress = this.getTileIndexAddress(index, this.lcdc.getWindowTitleMap());
        const tileIndex = this.mmu.readByte(tileIndexAddress);
        return this.tileData.getBgAndWindowTile(tileIndex);
    }

    private getTileIndexAddress(index: number, mapId: number): number {
        return mapId === 0 ? 0x9800 + index : 0x9c00 + index;
    }
}
