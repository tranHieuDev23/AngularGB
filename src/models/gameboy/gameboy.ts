import { GbCpu } from "../cpu/gb-cpu";
import { GbGpu } from "../gpu/gb-gpu";
import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";

const CYCLE_PER_FRAME = 70224;

export class Gameboy {
    public readonly cpu: GbCpu;
    public readonly gpu: GbGpu;

    private currentFrameCycleCount: number;

    constructor(
        readonly mmu: GbMmu,
        readonly lcd: Lcd
    ) {
        this.cpu = new GbCpu(new GbRegisterSet(), mmu);
        this.gpu = new GbGpu(mmu, lcd);
        this.currentFrameCycleCount = 0;
    }

    public step(): void {
        if (this.currentFrameCycleCount >= CYCLE_PER_FRAME) {
            this.currentFrameCycleCount = 0;
        }
        const deltaCycleCount = this.cpu.step().cycleCount;
        this.gpu.step(deltaCycleCount);
        this.currentFrameCycleCount += deltaCycleCount;
    }

    public frame(): void {
        do {
            this.step();
        }
        while (this.currentFrameCycleCount < CYCLE_PER_FRAME);
    }

    public frameWithBreakpoint(breakpointAddress: number): boolean {
        do {
            this.step();
            if (this.cpu.rs.pc.getValue() === breakpointAddress) {
                return true;
            }
        }
        while (this.currentFrameCycleCount < CYCLE_PER_FRAME);
        return false;
    }
}
