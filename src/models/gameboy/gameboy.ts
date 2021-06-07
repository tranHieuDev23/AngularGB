import { GbCpu } from "../cpu/gb-cpu";
import { GbGpu } from "../gpu/gb-gpu";
import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";

export class Gameboy {
    private readonly cpu: GbCpu;
    private readonly gpu: GbGpu;

    private cycleCount: number = 0;

    constructor(
        readonly mmu: GbMmu,
        readonly lcd: Lcd
    ) {
        this.cpu = new GbCpu(new GbRegisterSet(), mmu);
        this.gpu = new GbGpu(mmu, lcd);
    }

    public step(): void {
        const deltaCycleCount = this.cpu.step();
        this.gpu.step(deltaCycleCount);
    }
}
