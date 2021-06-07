import { GbMmu } from "../../mmu/gb-mmu";

export class GbPalettes {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getBgPallete() {
        return this.mmu.readByte(0xff47);
    }

    public getBgPalleteColor(index: number) {
        return (this.getBgPallete() >> index * 2) & 3;
    }

    public getObj0Pallete() {
        return this.mmu.readByte(0xff48);
    }

    public getObj0PalleteColor(index: number) {
        return (this.getObj0Pallete() >> index * 2) & 3;
    }

    public getObj1Pallete() {
        return this.mmu.readByte(0xff49);
    }

    public getObj1PalleteColor(index: number) {
        return (this.getObj1Pallete() >> index * 2) & 3;
    }
}
