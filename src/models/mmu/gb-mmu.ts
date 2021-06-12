import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { EXT_RAM_START, VRAM_START, WORK_RAM_START, FORBIDDEN_RAM_START, SPRITE_RAM_START, HIGH_RAM_START, IO_REG_START, ECHO_RAM_START, DMA_REG_ADDRESS, LY_ADDRESS, LYC_ADDRESS, STAT_REG_ADDRESS, LCDC_REG_ADDRESS, DISABLE_BOOT_ROM_REG_ADDRESS } from "./gb-mmu-constants";
import { GB_INITIALIZE_ROM } from "./gb-rom";
import { Mbc } from "./mcb/gb-mcb";
import { Mmu } from "./mmu";

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
    private readonly ram: number[] = new Array<number>(TWO_POW_SIXTEEN);

    constructor(
        private readonly mbc: Mbc
    ) { }

    readByte(address: number): number {
        if (this.getIsBootingUp() === 0 && address < GB_INITIALIZE_ROM.length) {
            return GB_INITIALIZE_ROM[address];
        }
        if (address < VRAM_START) {
            return this.mbc.readRom(address);
        }
        if (EXT_RAM_START <= address && address < WORK_RAM_START) {
            return this.mbc.readRam(address);
        }
        if (ECHO_RAM_START <= address && address < SPRITE_RAM_START) {
            return this.ram[address - (ECHO_RAM_START - WORK_RAM_START)];
        }
        if (FORBIDDEN_RAM_START <= address && address < IO_REG_START) {
            return 0xff;
        }
        if (0x10000 <= address) {
            throw new Error(`Trying to read invalid address: ${address}`);
        }
        return this.ram[address];
    }

    readWord(address: number): number {
        return (this.readByte((address + 1) & SIXTEEN_ONE_BITS) << 8) | this.readByte(address);
    }

    writeByte(address: number, value: number): void {
        if (address < VRAM_START) {
            this.mbc.writeRom(address, value);
            return;
        }
        if (EXT_RAM_START <= address && address < WORK_RAM_START) {
            this.mbc.writeRam(address, value);
            return;
        }
        if (ECHO_RAM_START <= address && address < SPRITE_RAM_START) {
            this.ram[address - (ECHO_RAM_START - WORK_RAM_START)] = value;
            return;
        }
        if (FORBIDDEN_RAM_START <= address && address < IO_REG_START) {
            return;
        }
        if (0x10000 <= address) {
            throw new Error(`Trying to write to invalid address: ${address}`);
        }
        const oldValue = this.ram[address];
        this.ram[address] = value;
        if (IO_REG_START <= address && address < HIGH_RAM_START) {
            this.handleIoRegisterWrite(address, oldValue, value);
        }
    }

    writeWord(address: number, value: number): void {
        const lowerHalf = value & EIGHT_ONE_BITS;
        const upperHalf = (value >> 8) & EIGHT_ONE_BITS;
        this.writeByte(address, lowerHalf);
        this.writeByte((address + 1) & SIXTEEN_ONE_BITS, upperHalf);
    }

    randomize(): void {
        this.ram.forEach((_, index) => {
            this.ram[index] = randomInteger(0, TWO_POW_EIGHT);
        });
    }

    reset(): void {
        this.ram.fill(0);
    }

    public getIsBootingUp(): number {
        return this.ram[DISABLE_BOOT_ROM_REG_ADDRESS];
    }

    private handleIoRegisterWrite(address: number, oldValue: number, value: number): void {
        switch (address) {
            case DMA_REG_ADDRESS:
                const startAddress = value << 8;
                const endAddress = startAddress | 0xa0;
                for (let from = startAddress, to = 0xfe00; from < endAddress; from++, to++) {
                    this.ram[to] = this.readByte(from);
                }
                break;

            case LCDC_REG_ADDRESS:
                const oldLcdEnable = getBit(oldValue, 7);
                const lcdEnable = getBit(value, 7);
                if (oldLcdEnable === 1 && lcdEnable === 0) {
                    this.ram[LY_ADDRESS] = 0;
                }
                break;

            case LY_ADDRESS:
            case LYC_ADDRESS:
                const oldStat = this.ram[STAT_REG_ADDRESS];
                const lyEqualLyc = this.ram[LY_ADDRESS] === this.ram[LYC_ADDRESS];
                const newStat = (oldStat & 0xfb) | ((lyEqualLyc ? 1 : 0) << 2);
                this.ram[STAT_REG_ADDRESS] = newStat;
                break;
        }
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
