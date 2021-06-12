import { GbMmu } from "src/models/mmu/gb-mmu";
import { getBit } from "src/utils/arithmetic-utils";
import { INTERRUPT_ENABLE_ADDRESS, INTERRUPT_FLAG_ADDRESS } from "../gb-mmu-constants";

export class GbInterrupts {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getInterruptEnable(bitId: number): number {
        return this.getFlag(INTERRUPT_ENABLE_ADDRESS, bitId);
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

    public setInterruptEnable(bitId: number, value: number): void {
        this.setFlag(INTERRUPT_ENABLE_ADDRESS, bitId, value);
    }

    public setVBlankInterruptEnable(value: number): void {
        this.setInterruptEnable(0, value)
    }

    public setLcdStatInterruptEnable(value: number): void {
        this.setInterruptEnable(1, value)
    }

    public setTimerInterruptEnable(value: number): void {
        this.setInterruptEnable(2, value)
    }

    public setSerialInterruptEnable(value: number): void {
        this.setInterruptEnable(3, value)
    }

    public setJoypadInterruptEnable(value: number): void {
        this.setInterruptEnable(4, value)
    }

    public getInterruptFlag(bitId: number): number {
        return this.getFlag(INTERRUPT_FLAG_ADDRESS, bitId);
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
        this.setFlag(INTERRUPT_FLAG_ADDRESS, bitId, value);
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

    private getFlag(address: number, bitId: number): number {
        return getBit(this.mmu.readByte(address), bitId);
    }

    private setFlag(address: number, bitId: number, value: number): void {
        const oldValue = this.mmu.readByte(address);
        const oldBit = getBit(oldValue, bitId);
        const newValue = (oldValue ^ (oldBit << bitId)) | (value << bitId);
        this.mmu.writeRegister(address, newValue);
    }
}
