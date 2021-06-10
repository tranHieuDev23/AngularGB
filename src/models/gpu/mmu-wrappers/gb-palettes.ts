import { GbMmu } from "../../mmu/gb-mmu";

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

    public getObj0Palette() {
        return this.mmu.readByte(0xff48);
    }

    public getObj0PaletteColor(index: number) {
        return (this.getObj0Palette() >> (index << 1)) & 3;
    }

    public getObj1Palette() {
        return this.mmu.readByte(0xff49);
    }

    public getObj1PaletteColor(index: number) {
        return (this.getObj1Palette() >> (index << 1)) & 3;
    }
}
