import { getBit } from "src/utils/arithmetic-utils";
import { GbMmu } from "../gb-mmu";
import { CONTROL_TIMER_REG_ADDRESS, COUNTER_TIMER_REG_ADDRESS, DIV_TIMER_REG_ADDRESS, MODULO_TIMER_REG_ADDRESS } from "../gb-mmu-constants";

export class GbTimerWrappers {
    constructor(
        private readonly mmu: GbMmu
    ) { }

    public getDivTimer(): number {
        return this.mmu.readByte(DIV_TIMER_REG_ADDRESS);
    }

    public setDivTimer(value: number): void {
        this.mmu.writeRegister(DIV_TIMER_REG_ADDRESS, value);
    }

    public getCounterTimer(): number {
        return this.mmu.readByte(COUNTER_TIMER_REG_ADDRESS);
    }

    public setCounterTimer(value: number): void {
        this.mmu.writeRegister(COUNTER_TIMER_REG_ADDRESS, value);
    }

    public getModuloTimer(): number {
        return this.mmu.readByte(MODULO_TIMER_REG_ADDRESS);
    }

    public getControlTimer(): number {
        return this.mmu.readByte(CONTROL_TIMER_REG_ADDRESS);
    }

    public getTimerEnable(): number {
        return getBit(this.getControlTimer(), 2);
    }

    public getTimerMode(): number {
        return this.getControlTimer() & 3;
    }

    public setTimerEnable(value: number): void {
        const oldValue = this.getControlTimer();
        const newValue = (oldValue & 0xfb) | (value << 2);
        this.mmu.writeRegister(CONTROL_TIMER_REG_ADDRESS, newValue);
    }

    public setModeFlag(mode: number): void {
        const oldValue = this.getControlTimer();
        const newValue = (oldValue & 0xfc) | (mode & 3);
        this.mmu.writeRegister(CONTROL_TIMER_REG_ADDRESS, newValue);
    }
}
