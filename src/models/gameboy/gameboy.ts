import { getBit } from "src/utils/arithmetic-utils";
import { GbCpu } from "../cpu/gb-cpu";
import { GbGpu } from "../gpu/gb-gpu";
import { pushWordToStack } from "../instruction/gb-instruction/utils/stack-manipulation";
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
import { GbTimerWrappers } from "../mmu/mmu-wrappers/gb-timer-wrappers";
import { GbRegisterSet } from "../register/gb-registers";
import { GbTimer } from "../timer/gb-timer";

const CYCLE_PER_FRAME = 70224;

const ISR_ADDRESSES = [
    0x40, 0x48, 0x50, 0x58, 0x60
];

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
    public readonly timerWrappers: GbTimerWrappers;

    private readonly cpu: GbCpu;
    private readonly gpu: GbGpu;
    private readonly timer: GbTimer;
    private currentFrameCycleCount: number;

    constructor(
        public readonly mmu: GbMmu,
        readonly lcd: Lcd
    ) {
        this.rs = new GbRegisterSet();
        this.cpu = new GbCpu(this.rs, mmu);
        this.gpu = new GbGpu(mmu, lcd);
        this.timer = new GbTimer(mmu);

        this.interrupts = new GbInterrupts(mmu);
        this.lcdc = new GbLcdc(mmu);
        this.palettes = new GbPalettes(mmu);
        this.positionControl = new GbPositionControl(mmu);
        this.oam = new GbOam(mmu);
        this.stat = new GbStat(mmu);
        this.tileData = new GbTileData(mmu);
        this.tileMap = new GbTileMap(mmu);
        this.timerWrappers = new GbTimerWrappers(mmu);

        this.currentFrameCycleCount = 0;
    }

    public step(): void {
        if (this.currentFrameCycleCount >= CYCLE_PER_FRAME) {
            this.currentFrameCycleCount = 0;
        }

        let deltaCycleCount = 0;

        const interruptId = this.checkForInterrupt();
        if (interruptId !== null) {
            this.rs.setHalting(false);
            if (this.rs.getIme()) {
                this.transferToIsr(interruptId);
                deltaCycleCount = 5;
            }
        }

        const oldStatLine = this.getStatInterruptLine();

        if (!this.rs.getHalting()) {
            deltaCycleCount += this.cpu.step().cycleCount;
        } else {
            deltaCycleCount++;
        }

        this.gpu.step(deltaCycleCount);
        this.timer.step(deltaCycleCount);
        this.currentFrameCycleCount += deltaCycleCount;

        const newStatLine = this.getStatInterruptLine();
        // STAT interrupt is only triggered by a rising edge
        if (oldStatLine === 0 && newStatLine === 1) {
            this.interrupts.setLcdStatInterruptFlag(1);
        }
    }

    public stepWithBreakpoint(breakpointAddress: number): boolean {
        if (this.currentFrameCycleCount >= CYCLE_PER_FRAME) {
            this.currentFrameCycleCount = 0;
        }

        let deltaCycleCount = 0;

        const interruptId = this.checkForInterrupt();
        if (interruptId !== null) {
            this.rs.setHalting(false);
            if (this.rs.getIme()) {
                this.transferToIsr(interruptId);
                deltaCycleCount = 5;
            }
        }

        const pc = this.rs.pc.getValue();
        if (pc === breakpointAddress) {
            return true;
        }

        const oldStatLine = this.getStatInterruptLine();

        if (this.rs.getHalting()) {
            deltaCycleCount += this.cpu.step().cycleCount;
        } else {
            deltaCycleCount++;
        }

        this.gpu.step(deltaCycleCount);
        this.timer.step(deltaCycleCount);
        this.currentFrameCycleCount += deltaCycleCount;

        const newStatLine = this.getStatInterruptLine();
        // STAT interrupt is only triggered by a rising edge
        if (oldStatLine === 0 && newStatLine === 1) {
            this.interrupts.setLcdStatInterruptFlag(1);
        }

        return false;
    }

    public frame(): void {
        do {
            this.step();
        }
        while (this.currentFrameCycleCount < CYCLE_PER_FRAME);
    }

    public frameWithBreakpoint(breakpointAddress: number): boolean {
        do {
            if (this.stepWithBreakpoint(breakpointAddress)) {
                return true;
            }
        }
        while (this.currentFrameCycleCount < CYCLE_PER_FRAME);
        return false;
    }

    private checkForInterrupt(): number {
        const interruptByte = this.interrupts.getIEByte() & this.interrupts.getIFByte();
        for (let i = 0; i < 5; i++) {
            if (getBit(interruptByte, i) === 1) {
                return i;
            }
        }
        return null;
    }

    private transferToIsr(interruptId: number): void {
        this.interrupts.setInterruptFlag(interruptId, 0);
        this.rs.setIme(false);
        const pc = this.rs.pc.getValue();
        pushWordToStack(this.rs, this.mmu, pc);
        this.rs.pc.setValue(ISR_ADDRESSES[interruptId]);
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
