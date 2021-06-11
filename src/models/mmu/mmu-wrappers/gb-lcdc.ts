import { getBit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";
import { LCDC_REG_ADDRESS } from "../gb-mmu-constants";

export class GbLcdc {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getValue(): number {
        return this.mmu.readByte(LCDC_REG_ADDRESS);
    }

    public getLcdAndPpuEnable(): number {
        return getBit(this.getValue(), 7);
    }

    public getWindowTitleMap(): number {
        return getBit(this.getValue(), 6);
    }

    public getWindowEnable(): number {
        return getBit(this.getValue(), 5);
    }

    public getBgAndWindowTileDataArea(): number {
        return getBit(this.getValue(), 4);
    }

    public getBgTitleMap(): number {
        return getBit(this.getValue(), 3);
    }

    public getObjSize(): number {
        return getBit(this.getValue(), 2);
    }

    public getObjEnable(): number {
        return getBit(this.getValue(), 1);
    }

    public getBgAndWindowEnable(): number {
        return getBit(this.getValue(), 0);
    }
}