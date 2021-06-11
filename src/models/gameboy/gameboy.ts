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
        const oldStatLine = this.getStatInterruptLine();

        const deltaCycleCount = this.cpu.step().cycleCount;
        this.gpu.step(deltaCycleCount);
        this.currentFrameCycleCount += deltaCycleCount;

        const newStatLine = this.getStatInterruptLine();
        // STAT interrupt is only triggered by a rising edge
        if (oldStatLine === 0 || newStatLine === 1) {
            this.interrupts.setLcdStatInterruptFlag(1);
        }
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

    private getStatInterruptLine(): number {
        const lycEqualLySource = this.stat.getLycEqualLyInterruptEnable() & this.stat.getLycEqualLy();
        const mode = this.stat.getModeFlag();
        const mode2Source = this.stat.getMode2InterruptEnable() === 1 && mode === 2 ? 1 : 0;
        const mode1Source = this.stat.getMode1InterruptEnable() === 1 && mode === 1 ? 1 : 0;
        const mode0Source = this.stat.getMode0InterruptEnable() === 1 && mode === 0 ? 1 : 0;
        return lycEqualLySource | mode2Source | mode1Source | mode0Source;
    }
}
