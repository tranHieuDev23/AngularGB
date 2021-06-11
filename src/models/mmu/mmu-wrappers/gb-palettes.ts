import { GbMmu } from "../gb-mmu";
import { BG_PALETTE_DATA_ADDRESS, OBJ_PALETTE_0_DATA_ADDRESS } from "../gb-mmu-constants";

export class GbPalettes {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getBgPalette() {
        return this.mmu.readByte(BG_PALETTE_DATA_ADDRESS);
    }

    public getBgPaletteColor(index: number) {
        return (this.getBgPalette() >> (index << 1)) & 3;
    }

    public getObjPalette(paletteNumber: number) {
        return this.mmu.readByte(OBJ_PALETTE_0_DATA_ADDRESS | paletteNumber);
    }

    public getObjPaletteColor(paletteNumber: number, index: number) {
        return (this.getObjPalette(paletteNumber) >> (index << 1)) & 3;
    }
}
