import { getBit } from "src/utils/arithmetic-utils";
import { GbCpu } from "../cpu/gb-cpu";
import { GbGpu } from "../gpu/gb-gpu";
import { pushWordToStack } from "../instruction/gb-instruction/utils/stack-manipulation";
import { Lcd } from "../lcd/lcd";
import { GbMmu, GbMmuImpl } from "../mmu/gb-mmu";
import { Mbc } from "../mmu/mcb/gb-mcb";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { ActionButton, DirectionButton, GbJoypad } from "../mmu/mmu-wrappers/gb-joypad";
import { GbLcdc } from "../mmu/mmu-wrappers/gb-lcdc";
import { GbOam } from "../mmu/mmu-wrappers/gb-oam";
import { GbPalettes } from "../mmu/mmu-wrappers/gb-palettes";
import { GbPositionControl } from "../mmu/mmu-wrappers/gb-position-control";
import { GbStat } from "../mmu/mmu-wrappers/gb-stat";
import { GbTileData } from "../mmu/mmu-wrappers/gb-tile-data";
import { GbTileMap } from "../mmu/mmu-wrappers/gb-tile-map";
import { GbRegisterSet } from "../register/gb-registers";
import { GbTimer } from "../timer/gb-timer";

const CYCLE_PER_FRAME = 70224;
const ISR_TRANSFER_CYCLE_COUNT = 5;

const ISR_ADDRESSES = [
    0x40, 0x48, 0x50, 0x58, 0x60
];

export class Gameboy {
    public readonly rs: GbRegisterSet;

    public readonly tileData: GbTileData;
    public readonly tileMap: GbTileMap;
    public readonly oam: GbOam;
    public readonly joypad: GbJoypad;
    public readonly interrupts: GbInterrupts;
    public readonly lcdc: GbLcdc;
    public readonly stat: GbStat;
    public readonly positionControl: GbPositionControl;
    public readonly palettes: GbPalettes;

    public readonly gpu: GbGpu;
    public readonly timer: GbTimer;
    public readonly mmu: GbMmu;
    public readonly cpu: GbCpu;

    private currentFrameCycleCount: number;

    constructor(
        readonly mbc: Mbc,
        readonly lcd: Lcd
    ) {
        this.rs = new GbRegisterSet();

        this.lcdc = new GbLcdc();
        this.tileData = new GbTileData(this.lcdc);
        this.tileMap = new GbTileMap(this.tileData, this.lcdc);
        this.oam = new GbOam(this.tileData, this.lcdc);
        this.joypad = new GbJoypad();
        this.interrupts = new GbInterrupts();
        this.positionControl = new GbPositionControl();
        this.palettes = new GbPalettes();

        this.gpu = new GbGpu(
            lcd, this.interrupts, this.lcdc, this.palettes,
            this.positionControl, this.oam, this.tileMap
        );
        this.stat = new GbStat(this.gpu, this.positionControl);

        this.timer = new GbTimer(this.interrupts);

        this.mmu = new GbMmuImpl(
            mbc, this.tileData, this.tileMap, this.oam, this.joypad,
            this.timer, this.interrupts, this.lcdc, this.stat,
            this.positionControl, this.gpu, this.palettes
        );

        this.cpu = new GbCpu(this.rs, this.mmu);

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

    public pressRight(): void { this.joypad.pressDirectionButton(DirectionButton.RIGHT); }
    public pressLeft(): void { this.joypad.pressDirectionButton(DirectionButton.LEFT); }
    public pressUp(): void { this.joypad.pressDirectionButton(DirectionButton.UP); }
    public pressDown(): void { this.joypad.pressDirectionButton(DirectionButton.DOWN); }
    public pressA(): void { this.joypad.pressActionButton(ActionButton.A); }
    public pressB(): void { this.joypad.pressActionButton(ActionButton.B); }
    public pressSelect(): void { this.joypad.pressActionButton(ActionButton.SELECT); }
    public pressStart(): void { this.joypad.pressActionButton(ActionButton.START); }

    public releaseRight(): void { this.joypad.releaseDirectionButton(DirectionButton.RIGHT); }
    public releaseLeft(): void { this.joypad.releaseDirectionButton(DirectionButton.LEFT); }
    public releaseUp(): void { this.joypad.releaseDirectionButton(DirectionButton.UP); }
    public releaseDown(): void { this.joypad.releaseDirectionButton(DirectionButton.DOWN); }
    public releaseA(): void { this.joypad.releaseActionButton(ActionButton.A); }
    public releaseB(): void { this.joypad.releaseActionButton(ActionButton.B); }
    public releaseSelect(): void { this.joypad.releaseActionButton(ActionButton.SELECT); }
    public releaseStart(): void { this.joypad.releaseActionButton(ActionButton.START); }

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
        const lycEqualLyEnable = this.stat.getLycEqualLyInterruptEnable();
        const lycEqualLy = this.stat.getLycEqualLy();
        if (lycEqualLyEnable & lycEqualLy) {
            return 1;
        }
        const mode = this.gpu.getMode();
        if (mode !== 3) {
            return this.stat.getModeInterruptEnable(mode);
        }
        return 0;
    }
}
