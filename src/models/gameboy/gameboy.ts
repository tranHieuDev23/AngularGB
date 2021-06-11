import { GbCpu } from "../cpu/gb-cpu";
import { GbGpu } from "../gpu/gb-gpu";
import { Lcd } from "../lcd/lcd";
import { GbMmu } from "../mmu/gb-mmu";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { GbLcdc } from "../mmu/mmu-wrappers/gb-lcdc";
import { GbOam } from "../mmu/mmu-wrappers/gb-oam";
import { GbPalettes } from "../mmu/mmu-wrappers/gb-palettes";
import { GbPositionControl } from "../mmu/mmu-wrappers/gb-position-control";
import { GbStat } from "../mmu/mmu-wrappers/gb-stat";
import { GbTileData } from "../mmu/mmu-wrappers/gb-tile-data";
import { GbTileMap } from "../mmu/mmu-wrappers/gb-tile-map";
import { GbRegisterSet } from "../register/gb-registers";

const CYCLE_PER_FRAME = 70224;

export class Gameboy {
    public readonly rs: GbRegisterSet;

    public readonly interrupts: GbInterrupts;
    public readonly lcdc: GbLcdc;
    public readonly palettes: GbPalettes;
    public readonly positionControl: GbPositionControl;
    public readonly oam: GbOam;
    public readonly stat: GbStat;
    public readonly tileData: GbTileData;
    public readonly tileMap: GbTileMap;

    private readonly cpu: GbCpu;
    private readonly gpu: GbGpu;
    private currentFrameCycleCount: number;

    constructor(
        public readonly mmu: GbMmu,
        readonly lcd: Lcd
    ) {
        this.rs = new GbRegisterSet();
        this.cpu = new GbCpu(this.rs, mmu);
        this.gpu = new GbGpu(mmu, lcd);
        this.interrupts = new GbInterrupts(mmu);
        this.lcdc = new GbLcdc(mmu);
        this.palettes = new GbPalettes(mmu);
        this.positionControl = new GbPositionControl(mmu);
        this.oam = new GbOam(mmu);
        this.stat = new GbStat(mmu);
        this.tileData = new GbTileData(mmu);
        this.tileMap = new GbTileMap(mmu);
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
            if (this.rs.pc.getValue() === breakpointAddress) {
                return true;
            }
        }
        while (this.currentFrameCycleCount < CYCLE_PER_FRAME);
        return false;
    }
}
