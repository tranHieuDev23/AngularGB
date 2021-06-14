import { getBit } from "src/utils/arithmetic-utils";

export class GbInterrupts {
    private iE = 0;
    private iF = 0;

    public getIEByte(): number {
        return this.iE;
    }

    public setIEByte(value: number) {
        this.iE = value;
    }

    public getInterruptEnable(bitId: number): number {
        return getBit(this.iE, bitId);
    }

    public getVBlankInterruptEnable(): number {
        return this.getInterruptEnable(0);
    }

    public getLcdStatInterruptEnable(): number {
        return this.getInterruptEnable(1);
    }

    public getTimerInterruptEnable(): number {
        return this.getInterruptEnable(2);
    }

    public getSerialInterruptEnable(): number {
        return this.getInterruptEnable(3);
    }

    public getJoypadInterruptEnable(): number {
        return this.getInterruptEnable(4);
    }

    public getIFByte(): number {
        return this.iF;
    }

    public setIFByte(value: number) {
        this.iF = value;
    }

    public getInterruptFlag(bitId: number): number {
        return getBit(this.iF, bitId);
    }

    public getVBlankInterruptFlag(): number {
        return this.getInterruptFlag(0);
    }

    public getLcdStatInterruptFlag(): number {
        return this.getInterruptFlag(1);
    }

    public getTimerInterruptFlag(): number {
        return this.getInterruptFlag(2);
    }

    public getSerialInterruptFlag(): number {
        return this.getInterruptFlag(3);
    }

    public getJoypadInterruptFlag(): number {
        return this.getInterruptFlag(4);
    }

    public setInterruptFlag(bitId: number, value: number): void {
        const oldBit = getBit(this.iF, bitId);
        this.iF = (this.iF ^ (oldBit << bitId)) | (value << bitId);
    }

    public setVBlankInterruptFlag(value: number): void {
        this.setInterruptFlag(0, value)
    }

    public setLcdStatInterruptFlag(value: number): void {
        this.setInterruptFlag(1, value)
    }

    public setTimerInterruptFlag(value: number): void {
        this.setInterruptFlag(2, value)
    }

    public setSerialInterruptFlag(value: number): void {
        this.setInterruptFlag(3, value)
    }

    public setJoypadInterruptFlag(value: number): void {
        this.setInterruptFlag(4, value)
    }
}
