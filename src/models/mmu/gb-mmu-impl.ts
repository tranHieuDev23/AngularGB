import { SIXTEEN_ONE_BITS, EIGHT_ONE_BITS, TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbApu } from "../apu/gb-apu";
import { GbGpu } from "../gpu/gb-gpu";
import { GbTimer } from "../timer/gb-timer";
import { GbMmu } from "./gb-mmu";
import {
    ECHO_RAM_START,
    WORK_RAM_START,
    INTERRUPT_ENABLE_ADDRESS,
    HIGH_RAM_START,
    CONTROLLER_REG_ADDRESS,
    DIV_TIMER_REG_ADDRESS,
    COUNTER_TIMER_REG_ADDRESS,
    MODULO_TIMER_REG_ADDRESS,
    CONTROL_TIMER_REG_ADDRESS,
    NR10_ADDRESS,
    NR11_ADDRESS,
    NR12_ADDRESS,
    NR13_ADDRESS,
    NR14_ADDRESS,
    NR21_ADDRESS,
    NR22_ADDRESS,
    NR23_ADDRESS,
    NR24_ADDRESS,
    NR30_ADDRESS,
    NR31_ADDRESS,
    NR32_ADDRESS,
    NR33_ADDRESS,
    NR34_ADDRESS,
    NR41_ADDRESS,
    NR42_ADDRESS,
    NR43_ADDRESS,
    NR44_ADDRESS,
    NR50_ADDRESS,
    NR51_ADDRESS,
    NR52_ADDRESS,
    LCDC_REG_ADDRESS,
    STAT_REG_ADDRESS,
    SCROLL_Y_ADDRESS,
    SCROLL_X_ADDRESS,
    LY_ADDRESS,
    LYC_ADDRESS,
    DMA_REG_ADDRESS,
    BG_PALETTE_DATA_ADDRESS,
    OBJ_PALETTE_0_DATA_ADDRESS,
    OBJ_PALETTE_1_DATA_ADDRESS,
    WINDOW_Y_ADDRESS,
    WINDOW_X_ADDRESS,
    INTERRUPT_FLAG_ADDRESS,
    DISABLE_BOOT_ROM_REG_ADDRESS,
    VRAM_START,
    TILE_MAP_0_ADDRESS,
    EXT_RAM_START,
    OAM_RAM_START,
    FORBIDDEN_RAM_START,
    WAVE_RAM_START,
    IO_REG_START
} from "./gb-mmu-constants";
import { GB_INITIALIZE_ROM } from "./gb-rom";
import { Mbc } from "./mcb/gb-mcb";
import { GbInterrupts } from "./mmu-wrappers/gb-interrupts";
import { GbJoypad } from "./mmu-wrappers/gb-joypad";
import { GbLcdc } from "./mmu-wrappers/gb-lcdc";
import { GbOam } from "./mmu-wrappers/gb-oam";
import { GbPalettes } from "./mmu-wrappers/gb-palettes";
import { GbPositionControl } from "./mmu-wrappers/gb-position-control";
import { GbStat } from "./mmu-wrappers/gb-stat";
import { GbTileData } from "./mmu-wrappers/gb-tile-data";
import { GbTileMap } from "./mmu-wrappers/gb-tile-map";


export class GbMmuImpl implements GbMmu {
    private bootRomDisabled = false;
    private readonly wram = new Array<number>(ECHO_RAM_START - WORK_RAM_START);
    private readonly highRam = new Array<number>(INTERRUPT_ENABLE_ADDRESS - HIGH_RAM_START);

    private readonly register2GetValue = new Map<number, () => number>([
        [CONTROLLER_REG_ADDRESS, () => this.joypad.getValue()],
        [DIV_TIMER_REG_ADDRESS, () => this.timer.getDivTimer()],
        [COUNTER_TIMER_REG_ADDRESS, () => this.timer.getCounterTimer()],
        [MODULO_TIMER_REG_ADDRESS, () => this.timer.getModuloTimer()],
        [CONTROL_TIMER_REG_ADDRESS, () => this.timer.getTimerControl()],
        [NR10_ADDRESS, () => this.apu.channel1.getNr10() | 0x80],
        [NR11_ADDRESS, () => this.apu.channel1.getNr11() | 0x3f],
        [NR12_ADDRESS, () => this.apu.channel1.getNr12()],
        [NR13_ADDRESS, () => this.apu.channel1.getNr13() | 0xff],
        [NR14_ADDRESS, () => this.apu.channel1.getNr14() | 0xbf],
        [NR21_ADDRESS, () => this.apu.channel2.getNr21() | 0x3f],
        [NR22_ADDRESS, () => this.apu.channel2.getNr22()],
        [NR23_ADDRESS, () => this.apu.channel2.getNr23() | 0xff],
        [NR24_ADDRESS, () => this.apu.channel2.getNr24() | 0xbf],
        [NR30_ADDRESS, () => this.apu.channel3.getNr30() | 0x7f],
        [NR31_ADDRESS, () => this.apu.channel3.getNr31() | 0xff],
        [NR32_ADDRESS, () => this.apu.channel3.getNr32() | 0x9f],
        [NR33_ADDRESS, () => this.apu.channel3.getNr33() | 0xff],
        [NR34_ADDRESS, () => this.apu.channel3.getNr34() | 0xbf],
        [NR41_ADDRESS, () => this.apu.channel4.getNr41() | 0xff],
        [NR42_ADDRESS, () => this.apu.channel4.getNr42()],
        [NR43_ADDRESS, () => this.apu.channel4.getNr43()],
        [NR44_ADDRESS, () => this.apu.channel4.getNr44() | 0xbf],
        [NR50_ADDRESS, () => this.apu.getNr50()],
        [NR51_ADDRESS, () => this.apu.getNr51()],
        [NR52_ADDRESS, () => this.apu.getNr52() | 0x70],
        [LCDC_REG_ADDRESS, () => this.lcdc.getValue()],
        [STAT_REG_ADDRESS, () => this.stat.getValue()],
        [SCROLL_Y_ADDRESS, () => this.positionControl.getScrollY()],
        [SCROLL_X_ADDRESS, () => this.positionControl.getScrollX()],
        [LY_ADDRESS, () => this.gpu.getLy()],
        [LYC_ADDRESS, () => this.positionControl.getLyc()],
        [DMA_REG_ADDRESS, () => this.oam.getDmaRegisterValue()],
        [BG_PALETTE_DATA_ADDRESS, () => this.palettes.getBgPalette()],
        [OBJ_PALETTE_0_DATA_ADDRESS, () => this.palettes.getObjPalette(0)],
        [OBJ_PALETTE_1_DATA_ADDRESS, () => this.palettes.getObjPalette(1)],
        [WINDOW_Y_ADDRESS, () => this.positionControl.getWindowY()],
        [WINDOW_X_ADDRESS, () => this.positionControl.getWindowX()],
        [INTERRUPT_FLAG_ADDRESS, () => this.interrupts.getIFByte()],
        [INTERRUPT_ENABLE_ADDRESS, () => this.interrupts.getIEByte()]
    ]);

    private readonly register2SetValue = new Map<number, (value: number) => void>([
        [CONTROLLER_REG_ADDRESS, (value: number) => this.joypad.setValue(value)],
        [DIV_TIMER_REG_ADDRESS, (value: number) => this.timer.setDivTimer(value)],
        [COUNTER_TIMER_REG_ADDRESS, (value: number) => this.timer.setCounterTimer(value)],
        [MODULO_TIMER_REG_ADDRESS, (value: number) => this.timer.setModuloTimer(value)],
        [CONTROL_TIMER_REG_ADDRESS, (value: number) => this.timer.setTimerControl(value)],
        [NR10_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel1.setNr10(value); }],
        [NR11_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel1.setNr11(value); }],
        [NR12_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel1.setNr12(value); }],
        [NR13_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel1.setNr13(value); }],
        [NR14_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel1.setNr14(value); }],
        [NR21_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel2.setNr21(value); }],
        [NR22_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel2.setNr22(value); }],
        [NR23_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel2.setNr23(value); }],
        [NR24_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel2.setNr24(value); }],
        [NR30_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel3.setNr30(value); }],
        [NR31_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel3.setNr31(value); }],
        [NR32_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel3.setNr32(value); }],
        [NR33_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel3.setNr33(value); }],
        [NR34_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel3.setNr34(value); }],
        [NR41_ADDRESS, (value: number) => this.apu.channel4.setNr41(value)],
        [NR42_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel4.setNr42(value); }],
        [NR43_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel4.setNr43(value); }],
        [NR44_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.channel4.setNr44(value); }],
        [NR50_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.setNr50(value); }],
        [NR51_ADDRESS, (value: number) => { if (this.apu.isOn()) this.apu.setNr51(value); }],
        [NR52_ADDRESS, (value: number) => this.apu.setNr52(value)],
        [LCDC_REG_ADDRESS, (value: number) => {
            const oldLcdEnable = this.lcdc.getLcdAndPpuEnable();
            this.lcdc.setValue(value);
            const lcdEnable = this.lcdc.getLcdAndPpuEnable();
            if (oldLcdEnable === 1 && lcdEnable === 0) {
                this.gpu.setLy(0);
            }
        }],
        [STAT_REG_ADDRESS, (value: number) => this.stat.setValue(value)],
        [SCROLL_Y_ADDRESS, (value: number) => this.positionControl.setScrollY(value)],
        [SCROLL_X_ADDRESS, (value: number) => this.positionControl.setScrollX(value)],
        [LYC_ADDRESS, (value: number) => this.positionControl.setLyc(value)],
        [DMA_REG_ADDRESS, (value: number) => {
            this.oam.setDmaRegisterValue(value);
            // OAM DMA Transfer
            const startAddress = value << 8;
            const endAddress = startAddress | 0xa0;
            for (let from = startAddress, to = 0xfe00; from < endAddress; from++, to++) {
                this.oam.setOamTableValue(to, this.readByte(from));
            }
        }],
        [BG_PALETTE_DATA_ADDRESS, (value: number) => this.palettes.setBgPalette(value)],
        [OBJ_PALETTE_0_DATA_ADDRESS, (value: number) => this.palettes.setObjPalette(0, value)],
        [OBJ_PALETTE_1_DATA_ADDRESS, (value: number) => this.palettes.setObjPalette(1, value)],
        [WINDOW_Y_ADDRESS, (value: number) => this.positionControl.setWindowY(value)],
        [WINDOW_X_ADDRESS, (value: number) => this.positionControl.setWindowX(value)],
        [DISABLE_BOOT_ROM_REG_ADDRESS, (value: number) => {
            if (value !== 0) {
                this.bootRomDisabled = true;
            }
        }],
        [INTERRUPT_FLAG_ADDRESS, (value: number) => this.interrupts.setIFByte(value)],
        [INTERRUPT_ENABLE_ADDRESS, (value: number) => this.interrupts.setIEByte(value)],
    ]);

    constructor(
        private readonly mbc: Mbc,
        private readonly tileData: GbTileData,
        private readonly tileMap: GbTileMap,
        private readonly oam: GbOam,
        private readonly joypad: GbJoypad,
        private readonly timer: GbTimer,
        private readonly interrupts: GbInterrupts,
        private readonly apu: GbApu,
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
        if (WAVE_RAM_START <= address && address < LCDC_REG_ADDRESS) {
            if (this.apu.isOn() && !this.apu.channel3.getIsChannelDisabled()) {
                return 0xff;
            }
            return this.apu.channel3.getWaveRam(address);
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
        if (this.register2GetValue.has(address)) {
            return this.register2GetValue.get(address)();
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
        if (WAVE_RAM_START <= address && address < LCDC_REG_ADDRESS) {
            this.apu.channel3.setWaveRam(address, value);
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
        if (this.register2SetValue.has(address)) {
            this.register2SetValue.get(address)(value);
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