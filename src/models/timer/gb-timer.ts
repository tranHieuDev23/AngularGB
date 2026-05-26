import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";

// The emulator meters time at 4,194,304 cycle units per wall-clock second
// (CYCLE_PER_FRAME × 60). To produce real-DMG wall-clock rates:
//   DIV  @ 16,384 Hz → every 4194304 / 16384 = 256 cycle units
//   TIMA @  4096 Hz (mode 0) → every 1024 cycle units
//   TIMA @ 262144 Hz (mode 1) → every    16 cycle units
//   TIMA @ 65536 Hz (mode 2) → every    64 cycle units
//   TIMA @ 16384 Hz (mode 3) → every   256 cycle units
const DIV_UPDATE_CYCLES = 256;
const COUNTER_UPDATE_CYCLES = [
    1024, 16, 64, 256
];

export class GbTimer {
    private divTimer = 0;
    private counterTimer = 0;
    private moduloTimer = 0;
    private timerControl = 0;

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
        this.divUpdateCycleCount += deltaCycleCount;
        while (this.divUpdateCycleCount >= DIV_UPDATE_CYCLES) {
            this.divTimerTick();
            this.divUpdateCycleCount -= DIV_UPDATE_CYCLES;
        }

        if (this.getTimerEnable() === 1) {
            const counterUpdateThreshold = COUNTER_UPDATE_CYCLES[this.getTimerMode()];
            this.counterUpdateCycleCount += deltaCycleCount;
            while (this.counterUpdateCycleCount >= counterUpdateThreshold) {
                this.counterTimerTick();
                this.counterUpdateCycleCount -= counterUpdateThreshold;
            }
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
