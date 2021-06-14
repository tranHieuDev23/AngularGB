import { getBit } from "src/utils/arithmetic-utils";
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

        // Div update timer increases at 1/4 the speed of main timer
        this.divUpdateCycleCount += this.totalCycleCount >> 2;
        // Once Div update timer counts 16, increase Div timer by 1
        const divUpdateCount = this.divUpdateCycleCount >> 4;
        this.divTimerTick(divUpdateCount);
        this.divUpdateCycleCount &= 0xf;

        const timerControl = this.timerWrappers.getControlTimer();
        const isTimerEnabled = getBit(timerControl, 2) === 1;
        if (isTimerEnabled) {
            const mode = timerControl & 0x3;
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
        const divTimer = this.timerWrappers.getDivTimer();
        const newDivTimer = (divTimer + updateCount) & EIGHT_ONE_BITS;
        this.timerWrappers.setDivTimer(newDivTimer);
    }

    private counterTimerTick(updateCount: number): void {
        const counterTimer = this.timerWrappers.getCounterTimer();
        const nextCounterTimer = counterTimer + updateCount;
        if (nextCounterTimer > 0xff) {
            const resetCounterTimer = this.timerWrappers.getModuloTimer() + (nextCounterTimer & EIGHT_ONE_BITS);
            this.timerWrappers.setCounterTimer(resetCounterTimer);
            this.interrupts.setTimerInterruptFlag(1);
        } else {
            this.timerWrappers.setCounterTimer(nextCounterTimer);
        }
    }
}