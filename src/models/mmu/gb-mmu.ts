import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbGpu } from "../gpu/gb-gpu";
import { GbTimer } from "../timer/gb-timer";
import {
    EXT_RAM_START,
    VRAM_START,
    WORK_RAM_START,
    FORBIDDEN_RAM_START,
    OAM_RAM_START,
    HIGH_RAM_START,
    IO_REG_START,
    ECHO_RAM_START,
    DMA_REG_ADDRESS,
    LY_ADDRESS,
    LYC_ADDRESS,
    STAT_REG_ADDRESS,
    LCDC_REG_ADDRESS,
    DISABLE_BOOT_ROM_REG_ADDRESS,
    DIV_TIMER_REG_ADDRESS,
    CONTROLLER_REG_ADDRESS,
    COUNTER_TIMER_REG_ADDRESS,
    MODULO_TIMER_REG_ADDRESS,
    CONTROL_TIMER_REG_ADDRESS,
    SCROLL_Y_ADDRESS,
    SCROLL_X_ADDRESS,
    WINDOW_Y_ADDRESS,
    WINDOW_X_ADDRESS,
    INTERRUPT_FLAG_ADDRESS,
    INTERRUPT_ENABLE_ADDRESS,
    TILE_MAP_0_ADDRESS,
    BG_PALETTE_DATA_ADDRESS,
    OBJ_PALETTE_0_DATA_ADDRESS,
    OBJ_PALETTE_1_DATA_ADDRESS
} from "./gb-mmu-constants";
import { GB_INITIALIZE_ROM } from "./gb-rom";
import { Mbc } from "./mcb/gb-mcb";
import { Mmu } from "./mmu";
import { GbInterrupts } from "./mmu-wrappers/gb-interrupts";
import { GbJoypad } from "./mmu-wrappers/gb-joypad";
import { GbLcdc } from "./mmu-wrappers/gb-lcdc";
import { GbOam } from "./mmu-wrappers/gb-oam";
import { GbPalettes } from "./mmu-wrappers/gb-palettes";
import { GbPositionControl } from "./mmu-wrappers/gb-position-control";
import { GbStat } from "./mmu-wrappers/gb-stat";
import { GbTileData } from "./mmu-wrappers/gb-tile-data";
import { GbTileMap } from "./mmu-wrappers/gb-tile-map";

export interface GbMmu extends Mmu { }

export class GbTestMmu implements GbMmu {
    private readonly ram: number[] = new Array<number>(TWO_POW_SIXTEEN);

    readByte(address: number): number {
        return this.ram[address];
    }

    readWord(address: number): number {
        return (this.ram[address + 1] << 8) | this.ram[address];
    }

    writeByte(address: number, value: number): void {
        this.ram[address] = value & EIGHT_ONE_BITS;
    }

    writeWord(address: number, value: number): void {
        const lowerHalf = value & EIGHT_ONE_BITS;
        const upperHalf = (value >> 8) & EIGHT_ONE_BITS;
        this.ram[address] = lowerHalf;
        this.ram[address + 1] = upperHalf;
    }

    randomize(): void {
        for (let i = 0; i < this.ram.length; i++) {
            this.ram[i] = randomInteger(0, TWO_POW_EIGHT);
        }
    }

    reset(): void {
        for (let i = 0; i < this.ram.length; i++) {
            this.ram[i] = 0;
        }
    }
}

export class GbMmuImpl implements GbMmu {
    private bootRomDisabled = false;
    private readonly wram = new Array<number>(ECHO_RAM_START - WORK_RAM_START);
    private readonly highRam = new Array<number>(INTERRUPT_ENABLE_ADDRESS - HIGH_RAM_START);

    constructor(
        private readonly mbc: Mbc,
        private readonly tileData: GbTileData,
        private readonly tileMap: GbTileMap,
        private readonly oam: GbOam,
        private readonly joypad: GbJoypad,
        private readonly timer: GbTimer,
        private readonly interrupts: GbInterrupts,
        private readonly lcdc: GbLcdc,
        private readonly stat: GbStat,
        private readonly positionControl: GbPositionControl,
        private readonly gpu: GbGpu,
        private readonly palettes: GbPalettes,
    ) { }

    readByte(address: number): number {
        if (!this.bootRomDisabled && address < GB_INITIALIZE_ROM.length) {
            return GB_INITIALIZE_ROM[address];
        }
        if (address < VRAM_START) {
            return this.mbc.readRom(address);
        }
        if (VRAM_START <= address && address < TILE_MAP_0_ADDRESS) {
            return this.tileData.getTileDataValue(address);
        }
        if (TILE_MAP_0_ADDRESS <= address && address < EXT_RAM_START) {
            return this.tileMap.getTileMapValue(address);
        }
        if (EXT_RAM_START <= address && address < WORK_RAM_START) {
            return this.mbc.readRam(address);
        }
        if (WORK_RAM_START <= address && address < ECHO_RAM_START) {
            return this.wram[address - WORK_RAM_START];
        }
        if (ECHO_RAM_START <= address && address < OAM_RAM_START) {
            return this.wram[address - ECHO_RAM_START];
        }
        if (OAM_RAM_START <= address && address < FORBIDDEN_RAM_START) {
            return this.oam.getOamTableValue(address);
        }
        if (FORBIDDEN_RAM_START <= address && address < IO_REG_START) {
            return 0xff;
        }
        if (HIGH_RAM_START <= address && address < INTERRUPT_ENABLE_ADDRESS) {
            return this.highRam[address - HIGH_RAM_START];
        }
        if (address > INTERRUPT_ENABLE_ADDRESS) {
            throw new Error(`Trying to read invalid address: ${address}`);
        }
        switch (address) {
            case CONTROLLER_REG_ADDRESS:
                return this.joypad.getValue();
            case DIV_TIMER_REG_ADDRESS:
                return this.timer.getDivTimer();
            case COUNTER_TIMER_REG_ADDRESS:
                return this.timer.getCounterTimer();
            case MODULO_TIMER_REG_ADDRESS:
                return this.timer.getModuloTimer();
            case CONTROL_TIMER_REG_ADDRESS:
                return this.timer.getTimerControl();
            case LCDC_REG_ADDRESS:
                return this.lcdc.getValue();
            case STAT_REG_ADDRESS:
                return this.stat.getValue();
            case SCROLL_Y_ADDRESS:
                return this.positionControl.getScrollY();
            case SCROLL_X_ADDRESS:
                return this.positionControl.getScrollX();
            case LY_ADDRESS:
                return this.gpu.getLy();
            case LYC_ADDRESS:
                return this.positionControl.getLyc();
            case DMA_REG_ADDRESS:
                return this.oam.getDmaRegisterValue();
            case BG_PALETTE_DATA_ADDRESS:
                return this.palettes.getBgPalette();
            case OBJ_PALETTE_0_DATA_ADDRESS:
                return this.palettes.getObjPalette(0);
            case OBJ_PALETTE_1_DATA_ADDRESS:
                return this.palettes.getObjPalette(1);
            case WINDOW_Y_ADDRESS:
                return this.positionControl.getWindowY();
            case WINDOW_X_ADDRESS:
                return this.positionControl.getWindowX();
            case INTERRUPT_FLAG_ADDRESS:
                return this.interrupts.getIFByte();
            case INTERRUPT_ENABLE_ADDRESS:
                return this.interrupts.getIEByte();
        }
        return 0xff;
    }

    readWord(address: number): number {
        const nextAddress = (address + 1) & SIXTEEN_ONE_BITS;
        return (this.readByte(nextAddress) << 8) | this.readByte(address);
    }

    writeByte(address: number, value: number): void {
        if (address < VRAM_START) {
            this.mbc.writeRom(address, value);
            return;
        }
        if (VRAM_START <= address && address < TILE_MAP_0_ADDRESS) {
            this.tileData.setTileDataValue(address, value);
            return;
        }
        if (TILE_MAP_0_ADDRESS <= address && address < EXT_RAM_START) {
            this.tileMap.setTileMapValue(address, value);
            return;
        }
        if (EXT_RAM_START <= address && address < WORK_RAM_START) {
            this.mbc.writeRam(address, value);
            return;
        }
        if (WORK_RAM_START <= address && address < ECHO_RAM_START) {
            this.wram[address - WORK_RAM_START] = value;
            return;
        }
        if (ECHO_RAM_START <= address && address < OAM_RAM_START) {
            this.wram[address - ECHO_RAM_START] = value;
            return;
        }
        if (OAM_RAM_START <= address && address < FORBIDDEN_RAM_START) {
            this.oam.setOamTableValue(address, value);
            return;
        }
        if (FORBIDDEN_RAM_START <= address && address < IO_REG_START) {
            return;
        }
        if (HIGH_RAM_START <= address && address < INTERRUPT_ENABLE_ADDRESS) {
            this.highRam[address - HIGH_RAM_START] = value;
            return;
        }
        if (address > INTERRUPT_ENABLE_ADDRESS) {
            throw new Error(`Trying to write to invalid address: ${address}`);
        }
        switch (address) {
            case CONTROLLER_REG_ADDRESS:
                this.joypad.setValue(value);
                break;
            case DIV_TIMER_REG_ADDRESS:
                this.timer.setDivTimer(value);
                break;
            case COUNTER_TIMER_REG_ADDRESS:
                this.timer.setCounterTimer(value);
                break;
            case MODULO_TIMER_REG_ADDRESS:
                this.timer.setModuloTimer(value);
                break;
            case CONTROL_TIMER_REG_ADDRESS:
                this.timer.setTimerControl(value);
                break;
            case LCDC_REG_ADDRESS:
                const oldLcdEnable = this.lcdc.getLcdAndPpuEnable();
                this.lcdc.setValue(value);
                const lcdEnable = this.lcdc.getLcdAndPpuEnable();
                if (oldLcdEnable === 1 && lcdEnable === 0) {
                    this.gpu.setLy(0);
                }
                break;
            case STAT_REG_ADDRESS:
                this.stat.setValue(value);
                break;
            case SCROLL_Y_ADDRESS:
                this.positionControl.setScrollY(value);
                break;
            case SCROLL_X_ADDRESS:
                this.positionControl.setScrollX(value);
                break;
            case LYC_ADDRESS:
                this.positionControl.setLyc(value);
                break;
            case DMA_REG_ADDRESS:
                this.oam.setDmaRegisterValue(value);
                // OAM DMA Transfer
                const startAddress = value << 8;
                const endAddress = startAddress | 0xa0;
                for (let from = startAddress, to = 0xfe00; from < endAddress; from++, to++) {
                    this.oam.setOamTableValue(to, this.readByte(from));
                }
                break;
            case BG_PALETTE_DATA_ADDRESS:
                this.palettes.setBgPalette(value);
                break;
            case OBJ_PALETTE_0_DATA_ADDRESS:
                this.palettes.setObjPalette(0, value);
                break;
            case OBJ_PALETTE_1_DATA_ADDRESS:
                this.palettes.setObjPalette(1, value);
                break;
            case WINDOW_Y_ADDRESS:
                this.positionControl.setWindowY(value);
                break;
            case WINDOW_X_ADDRESS:
                this.positionControl.setWindowX(value);
                break;
            case DISABLE_BOOT_ROM_REG_ADDRESS:
                if (value !== 0) {
                    this.bootRomDisabled = true;
                }
                break;
            case INTERRUPT_FLAG_ADDRESS:
                this.interrupts.setIFByte(value);
                break;
            case INTERRUPT_ENABLE_ADDRESS:
                this.interrupts.setIEByte(value);
                break;
        }
    }

    writeWord(address: number, value: number): void {
        const lowerHalf = value & EIGHT_ONE_BITS;
        const upperHalf = (value >> 8) & EIGHT_ONE_BITS;
        const nextAddress = (address + 1) & SIXTEEN_ONE_BITS;
        this.writeByte(address, lowerHalf);
        this.writeByte(nextAddress, upperHalf);
    }

    randomize(): void {
        this.wram.forEach((_, index) => {
            this.wram[index] = randomInteger(0, TWO_POW_EIGHT);
        });
        this.highRam.forEach((_, index) => {
            this.highRam[index] = randomInteger(0, TWO_POW_EIGHT);
        });
    }

    reset(): void {
        this.wram.fill(0);
        this.highRam.fill(0);
    }
}

export class GbDisassemblerMmu implements GbMmu {
    constructor(
        private readonly ram: number[]
    ) { }

    readByte(address: number): number {
        return this.ram[address];
    }

    readWord(address: number): number {
        return (this.ram[address + 1] << 8) | this.ram[address];
    }

    writeByte(address: number, value: number): void {
        // Purposefully left unimplemented
    }

    writeWord(address: number, value: number): void {
        // Purposefully left unimplemented
    }

    randomize(): void {
        // Purposefully left unimplemented
    }

    reset(): void {
        // Purposefully left unimplemented
    }
}
