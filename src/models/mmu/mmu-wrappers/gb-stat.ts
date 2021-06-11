import { getBit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";

export class GbStat {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getValue(): number {
        return this.mmu.readByte(0xff41);
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

    public getStatInterruptLine(): number {
        return this.getLycEqualLyInterruptEnable()
            | this.getMode2InterruptEnable()
            | this.getMode1InterruptEnable()
            | this.getMode0InterruptEnable();
    }

    public setLycEqualLy(value: number) {
        const oldValue = this.getValue();
        const newValue = (oldValue & 0xfb) | ((value & 1) << 2);
        this.mmu.writeByte(0xff41, newValue);
    }

    public setModeFlag(mode: number): void {
        const oldValue = this.getValue();
        const newValue = (oldValue & 0xfc) | (mode & 3);
        this.mmu.writeByte(0xff41, newValue);
    }
}
