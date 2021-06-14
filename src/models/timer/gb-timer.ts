import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";

const COUNTER_UPDATE_CYCLES = [
    64, 1, 4, 16
];

export class GbTimer {
    private divTimer: number = 0;
    private counterTimer: number = 0;
    private moduloTimer: number = 0;
    private timerControl: number = 0;

    private totalCycleCount: number = 0;
    private divUpdateCycleCount: number = 0;
    private counterUpdateCycleCount: number = 0;

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

        // Div update timer increases at 1/4 the speed of main timer
        this.divUpdateCycleCount += this.totalCycleCount >> 2;
        // Once Div update timer counts 16, increase Div timer by 1
        const divUpdateCount = this.divUpdateCycleCount >> 4;
        this.divTimerTick(divUpdateCount);
        this.divUpdateCycleCount &= 0xf;

        if (this.getTimerEnable() === 1) {
            const mode = this.getTimerMode();
            const counterUpdateThreshold = COUNTER_UPDATE_CYCLES[mode];
            // Counter update timer increase at 1/4 the speed of main timer
            this.counterUpdateCycleCount += this.totalCycleCount >> 2;
            // Once Counter update time catches up with update threshold, increase Counter by 1
            const counterUpdateCount = this.counterUpdateCycleCount / counterUpdateThreshold;
            this.counterTimerTick(counterUpdateCount);
            this.counterUpdateCycleCount %= counterUpdateThreshold;
        }

        this.totalCycleCount &= 0x3;
    }

    private divTimerTick(updateCount: number): void {
        this.divTimer = (this.divTimer + updateCount) & EIGHT_ONE_BITS;
    }

    private counterTimerTick(updateCount: number): void {
        const nextCounterTimer = this.counterTimer + updateCount;
        if (nextCounterTimer > 0xff) {
            this.counterTimer = this.moduloTimer + (nextCounterTimer & EIGHT_ONE_BITS);
            this.interrupts.setTimerInterruptFlag(1);
        } else {
            this.counterTimer = nextCounterTimer;
        }
    }
}