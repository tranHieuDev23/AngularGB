import { getBit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";
import { STAT_REG_ADDRESS } from "../gb-mmu-constants";

export class GbStat {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getValue(): number {
        return this.mmu.readByte(STAT_REG_ADDRESS);
    }

    public getLycEqualLyInterruptEnable(): number {
        return getBit(this.getValue(), 6);
    }

    public getMode2InterruptEnable(): number {
        return getBit(this.getValue(), 5);
    }

    public getMode1InterruptEnable(): number {
        return getBit(this.getValue(), 4);
    }

    public getMode0InterruptEnable(): number {
        return getBit(this.getValue(), 3);
    }

    public getLycEqualLy(): number {
        return getBit(this.getValue(), 2);
    }

    public getModeFlag(): number {
        return this.getValue() & 3;
    }

    public setModeFlag(mode: number): void {
        const oldValue = this.getValue();
        const newValue = (oldValue & 0xfc) | (mode & 3);
        this.mmu.writeByte(STAT_REG_ADDRESS, newValue);
    }
}
