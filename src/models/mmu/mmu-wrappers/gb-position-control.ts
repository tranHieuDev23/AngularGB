import { GbMmu } from "../gb-mmu";
import { SCROLL_Y_ADDRESS, SCROLL_X_ADDRESS, LY_ADDRESS, LYC_ADDRESS, WINDOW_Y_ADDRESS, WINDOW_X_ADDRESS } from "../gb-mmu-constants";

export class GbPositionControl {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getScrollY(): number {
        return this.mmu.readByte(SCROLL_Y_ADDRESS);
    }

    public getScrollX(): number {
        return this.mmu.readByte(SCROLL_X_ADDRESS);
    }

    public getLy(): number {
        return this.mmu.readByte(LY_ADDRESS);
    }

    public getLyc(): number {
        return this.mmu.readByte(LYC_ADDRESS);
    }

    public getWindowY(): number {
        return this.mmu.readByte(WINDOW_Y_ADDRESS);
    }

    public getWindowX(): number {
        return this.mmu.readByte(WINDOW_X_ADDRESS);
    }

    public setLy(ly: number): void {
        this.mmu.writeByte(LY_ADDRESS, ly);
    }
}
