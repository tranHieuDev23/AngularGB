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
const ISR_TRANSFER_CYCLE_COUNT = 5;

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

        const oldStatLine = this.getStatInterruptLine();

        const interruptId = this.checkForInterrupt();
        if (interruptId !== null) {
            this.rs.setHalting(false);
        }

        const shouldTransferToIsr = interruptId !== null && this.rs.getIme();
        if (shouldTransferToIsr) {
            this.transferToIsr(interruptId);
            this.gpu.step(ISR_TRANSFER_CYCLE_COUNT);
            this.timer.step(ISR_TRANSFER_CYCLE_COUNT);
            this.currentFrameCycleCount += ISR_TRANSFER_CYCLE_COUNT;
        } else {
            // In HALT mode, CPU clock stops but GPU and Timer keep running
            if (this.rs.getHalting()) {
                this.gpu.step(1);
                this.timer.step(1);
                this.currentFrameCycleCount++;
            } else {
                const disassembled = this.cpu.disassembleInstruction(this.rs.pc.getValue());
                const { instruction, args } = disassembled;
                const deltaCycleCount = instruction.getCycleCount(this.rs, this.mmu, args);

                // GPU cannot change mode more than 1 after one instruction, so we only need to run 1 step
                this.gpu.step(deltaCycleCount);
                // Timer will handle update steps inside
                this.timer.step(deltaCycleCount);

                // Run the disassembled instruction
                this.cpu.runInstruction(disassembled);

                // The effect of IE is delayed by one instruction
                this.rs.setIme(this.rs.getNextIme());

                this.currentFrameCycleCount += deltaCycleCount;
            }
        }

        if (oldStatLine === 0) {
            const newStatLine = this.getStatInterruptLine();
            // STAT interrupt is only triggered by a rising edge
            if (newStatLine === 1) {
                this.interrupts.setLcdStatInterruptFlag(1);
            }
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

    private checkForInterrupt(): number {
        const interruptByte = this.interrupts.getIEByte() & this.interrupts.getIFByte() & 0x1f;
        if (interruptByte === 0) {
            return null;
        }
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
        this.rs.setNextIme(false);
        const pc = this.rs.pc.getValue();
        pushWordToStack(this.rs, this.mmu, pc);
        this.rs.pc.setValue(ISR_ADDRESSES[interruptId]);
    }

    private getStatInterruptLine(): number {
        const statValue = this.stat.getValue();
        const lycEqualLyEnable = getBit(statValue, 6);
        const lycEqualLy = getBit(statValue, 2);
        if (lycEqualLyEnable & lycEqualLy) {
            return 1;
        }
        const mode = statValue & 0x03;
        switch (mode) {
            case 0:
                return getBit(statValue, 3);
            case 1:
                return getBit(statValue, 4);
            case 2:
                return getBit(statValue, 5);
        }
        return 0;
    }
}
