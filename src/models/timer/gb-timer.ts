import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";

const COUNTER_UPDATE_CYCLES = [
    64, 1, 4, 16
];

export class GbTimer {
    private divTimer = 0;
    private counterTimer = 0;
    private moduloTimer = 0;
    private timerControl = 0;

    private totalCycleCount = 0;
    private divUpdateCycleCount = 0;
    private counterUpdateCycleCount = 0;

    constructor(
        private readonly interrupts: GbInterrupts
    ) { }

    public getDivTimer(): number {
        return this.divTimer;
    }

    public setDivTimer(value: number): void {
        this.divTimer = 0;
    }

    public getCounterTimer(): number {
        return this.counterTimer;
    }

    public setCounterTimer(value: number): void {
        this.counterTimer = value;
    }

    public getModuloTimer(): number {
        return this.moduloTimer;
    }

    public setModuloTimer(value: number): void {
        this.moduloTimer = value;
    }

    public getTimerControl(): number {
        return this.timerControl;
    }

    public setTimerControl(value: number): void {
        this.timerControl = value;
    }

    public getTimerEnable(): number {
        return getBit(this.timerControl, 2);
    }

    public getTimerMode(): number {
        return this.timerControl & 3;
    }

    public step(deltaCycleCount: number): void {
        this.totalCycleCount += deltaCycleCount;

        const timerEnable = this.getTimerEnable() === 1;
        const mode = this.getTimerMode();
        const counterUpdateThreshold = COUNTER_UPDATE_CYCLES[mode];
        while (this.totalCycleCount >= 4) {
            // Div update timer increases at 1/4 the speed of main timer
            this.divUpdateCycleCount++;
            // Once Div update timer counts 16, increase Div timer by 1
            if (this.divUpdateCycleCount >= 16) {
                this.divTimerTick();
                this.divUpdateCycleCount -= 16;
            }

            if (timerEnable) {
                // Counter update timer increase at 1/4 the speed of main timer
                this.counterUpdateCycleCount++;
                while (this.counterUpdateCycleCount >= counterUpdateThreshold) {
                    this.counterTimerTick();
                    this.counterUpdateCycleCount -= counterUpdateThreshold;
                }
            }

            this.totalCycleCount -= 4;
        }
    }

    private divTimerTick(): void {
        this.divTimer = (this.divTimer + 1) & EIGHT_ONE_BITS;
    }

    private counterTimerTick(): void {
        if (this.counterTimer === 0xff) {
            this.counterTimer = this.moduloTimer;
            this.interrupts.setTimerInterruptFlag(1);
        } else {
            this.counterTimer++;
        }
    }
}
