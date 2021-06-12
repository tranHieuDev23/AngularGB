import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbMmu } from "../mmu/gb-mmu";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { GbTimerWrappers } from "../mmu/mmu-wrappers/gb-timer-wrappers";

const COUNTER_UPDATE_CYCLES = [
    64, 1, 4, 16
];

export class GbTimer {
    private readonly interrupts: GbInterrupts;
    private readonly timerWrappers: GbTimerWrappers;

    private totalCycleCount: number = 0;
    private divUpdateCycleCount: number = 0;
    private counterUpdateCycleCount: number = 0;

    constructor(
        readonly mmu: GbMmu
    ) {
        this.interrupts = new GbInterrupts(mmu);
        this.timerWrappers = new GbTimerWrappers(mmu);
    }

    public step(deltaCycleCount: number): void {
        this.totalCycleCount += deltaCycleCount;
        const isTimerEnabled = this.timerWrappers.getTimerEnable() === 1;

        while (this.totalCycleCount >= 4) {
            this.divUpdateCycleCount++;
            if (this.divUpdateCycleCount === 16) {
                this.divTimerTick();
                this.divUpdateCycleCount = 0;
            }

            if (isTimerEnabled) {
                this.counterUpdateCycleCount++;
                const mode = this.timerWrappers.getTimerMode();
                const counterUpdateThreshold = COUNTER_UPDATE_CYCLES[mode];
                if (this.counterUpdateCycleCount >= counterUpdateThreshold) {
                    this.counterUpdateCycleCount -= counterUpdateThreshold;
                    this.counterTimerTick();
                }
            }

            this.totalCycleCount -= 4;
        }
    }

    private divTimerTick(): void {
        const divTimer = this.timerWrappers.getDivTimer();
        const newDivTimer = (divTimer + 1) & EIGHT_ONE_BITS;
        this.timerWrappers.setDivTimer(newDivTimer);
    }

    private counterTimerTick(): void {
        const counterTimer = this.timerWrappers.getCounterTimer();
        if (counterTimer === 0xff) {
            this.timerWrappers.setCounterTimer(this.timerWrappers.getModuloTimer());
            this.interrupts.setTimerInterruptFlag(1);
        } else {
            const newCounterTimer = (counterTimer + 1) & EIGHT_ONE_BITS;
            this.timerWrappers.setCounterTimer(newCounterTimer);
        }
    }
}