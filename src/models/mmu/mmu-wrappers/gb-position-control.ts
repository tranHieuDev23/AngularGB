import { GbMmu } from "../gb-mmu";

export class GbPositionControl {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getScrollY(): number {
        return this.mmu.readByte(0xff42);
    }

    public getScrollX(): number {
        return this.mmu.readByte(0xff43);
    }

    public getLy(): number {
        return this.mmu.readByte(0xff44);
    }

    public getLyc(): number {
        return this.mmu.readByte(0xff45);
    }

    public getWindowY(): number {
        return this.mmu.readByte(0xff4a);
    }

    public getWindowX(): number {
        return this.mmu.readByte(0xff4b);
    }

    public setLy(ly: number): void {
        this.mmu.writeByte(0xff44, ly);
    }
}
