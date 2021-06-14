import { EXT_RAM_START, TILE_MAP_0_ADDRESS, TILE_MAP_1_ADDRESS } from "../gb-mmu-constants";
import { GbLcdc } from "./gb-lcdc";
import { GbTile, GbTileData } from "./gb-tile-data";

export class GbTileMap {
    private readonly tileMaps: number[][] = [
        new Array<number>(TILE_MAP_1_ADDRESS - TILE_MAP_0_ADDRESS),
        new Array<number>(EXT_RAM_START - TILE_MAP_1_ADDRESS),
    ];

    constructor(
        private readonly tileData: GbTileData,
        private readonly lcdc: GbLcdc
    ) { }

    public getTileMapValue(address: number): number {
        if (address < TILE_MAP_1_ADDRESS) {
            return this.tileMaps[0][address - TILE_MAP_0_ADDRESS];
        }
        return this.tileMaps[1][address - TILE_MAP_0_ADDRESS];
    }

    public getBgTile(index: number): GbTile {
        const tileIndex = this.tileMaps[this.lcdc.getBgTitleMap()][index];
        return this.tileData.getBgAndWindowTile(tileIndex);
    }

    public getWindowTile(index: number): GbTile {
        const tileIndex = this.tileMaps[this.lcdc.getWindowTitleMap()][index];
        return this.tileData.getBgAndWindowTile(tileIndex);
    }

    public setTileMapValue(address: number, value: number): void {
        if (address < TILE_MAP_1_ADDRESS) {
            this.tileMaps[0][address - TILE_MAP_0_ADDRESS] = value;
        }
        this.tileMaps[1][address - TILE_MAP_0_ADDRESS] = value;
    }
}
