import { GbMmu } from "../gb-mmu";

export class GbPalettes {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getBgPalette() {
        return this.mmu.readByte(0xff47);
    }

    public getBgPaletteColor(index: number) {
        return (this.getBgPalette() >> (index << 1)) & 3;
    }

    public getObjPalette(paletteNumber: number) {
        return this.mmu.readByte(0xff48 | paletteNumber);
    }

    public getObjPaletteColor(paletteNumber: number, index: number) {
        return (this.getObjPalette(paletteNumber) >> (index << 1)) & 3;
    }
}
