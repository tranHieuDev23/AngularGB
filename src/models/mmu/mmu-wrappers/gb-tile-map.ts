import { GbMmu } from "../gb-mmu";
import { TILE_MAP_0_ADDRESS, TILE_MAP_1_ADDRESS } from "../gb-mmu-constants";
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
        return mapId === 0 ? TILE_MAP_0_ADDRESS + index : TILE_MAP_1_ADDRESS + index;
    }
}
