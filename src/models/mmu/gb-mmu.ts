import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { EXT_RAM_START, VRAM_START, WORK_RAM_START, FORBIDDEN_RAM_START, SPRITE_RAM_START, HIGH_RAM_START, IO_REG_START, IE_REG, ECHO_RAM_START, DMA_REG_ADDRESS, LY_ADDRESS, LYC_ADDRESS, STAT_REG_ADDRESS, LCDC_REG_ADDRESS } from "./gb-mmu-constants";
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
    private readonly vram: number[] = new Array<number>(EXT_RAM_START - VRAM_START);
    private readonly workRam: number[] = new Array<number>(WORK_RAM_START - EXT_RAM_START);
    private readonly spriteRam: number[] = new Array<number>(FORBIDDEN_RAM_START - SPRITE_RAM_START);
    private readonly ioRam: number[] = new Array<number>(HIGH_RAM_START - IO_REG_START);
    private readonly highRam: number[] = new Array<number>(IE_REG - HIGH_RAM_START);
    private interruptEnable = 0;

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
        if (address < EXT_RAM_START) {
            return this.vram[address - VRAM_START];
        }
        if (address < WORK_RAM_START) {
            return this.mbc.readRam(address);
        }
        if (address < ECHO_RAM_START) {
            return this.workRam[address - WORK_RAM_START];
        }
        if (address < SPRITE_RAM_START) {
            return this.workRam[address - ECHO_RAM_START];
        }
        if (address < FORBIDDEN_RAM_START) {
            return this.spriteRam[address - SPRITE_RAM_START];
        }
        if (address < IO_REG_START) {
            throw new Error(`Trying to read forbidden RAM address: ${address}`);
        }
        if (address < HIGH_RAM_START) {
            return this.ioRam[address - IO_REG_START];
        }
        if (address < IE_REG) {
            return this.highRam[address - HIGH_RAM_START];
        }
        if (address === IE_REG) {
            return this.interruptEnable;
        }
        throw new Error(`Trying to read invalid address: ${address}`);
    }

    readWord(address: number): number {
        return (this.readByte((address + 1) & SIXTEEN_ONE_BITS) << 8) | this.readByte(address);
    }

    writeByte(address: number, value: number): void {
        if (address < VRAM_START) {
            this.mbc.writeRom(address, value);
            return;
        }
        if (address < EXT_RAM_START) {
            this.vram[address - VRAM_START] = value;
            return;
        }
        if (address < WORK_RAM_START) {
            this.mbc.writeRam(address, value);
            return;
        }
        if (address < ECHO_RAM_START) {
            this.workRam[address - WORK_RAM_START] = value;
            return;
        }
        if (address < SPRITE_RAM_START) {
            this.workRam[address - ECHO_RAM_START] = value;
            return;
        }
        if (address < FORBIDDEN_RAM_START) {
            this.spriteRam[address - SPRITE_RAM_START] = value;
            return;
        }
        if (address < IO_REG_START) {
            throw new Error(`Trying to write to forbidden RAM address: ${address}`);
        }
        if (address < HIGH_RAM_START) {
            const oldValue = this.ioRam[address - IO_REG_START];
            this.ioRam[address - IO_REG_START] = value;
            this.handleIoRegisterWrite(address, oldValue, value);
            return;
        }
        if (address < IE_REG) {
            this.highRam[address - HIGH_RAM_START] = value;
            return;
        }
        if (address === IE_REG) {
            this.interruptEnable = value;
            return;
        }
        throw new Error(`Trying to write to invalid address: ${address}`);
    }

    writeWord(address: number, value: number): void {
        const lowerHalf = value & EIGHT_ONE_BITS;
        const upperHalf = (value >> 8) & EIGHT_ONE_BITS;
        this.writeByte(address, lowerHalf);
        this.writeByte((address + 1) & SIXTEEN_ONE_BITS, upperHalf);
    }

    randomize(): void {
        [
            this.vram, this.workRam, this.spriteRam, this.ioRam, this.highRam
        ].forEach((array) => {
            array.forEach((_, index) => {
                array[index] = randomInteger(0, TWO_POW_EIGHT);
            });
        });
        this.interruptEnable = randomInteger(0, TWO_POW_EIGHT);
    }

    reset(): void {
        [
            this.vram, this.workRam, this.spriteRam, this.ioRam, this.highRam
        ].forEach((array) => { array.fill(0); });
        this.interruptEnable = 0;
    }

    public getIsBootingUp(): number {
        return this.ioRam[0xff50 - IO_REG_START];
    }

    private handleIoRegisterWrite(address: number, oldValue: number, value: number): void {
        switch (address) {
            case DMA_REG_ADDRESS:
                const startAddress = value << 8;
                const endAddress = startAddress | 0xa0;
                for (let i = startAddress; i < endAddress; i++) {
                    this.spriteRam[i - startAddress] = this.readByte(i);
                }
                break;

            case LCDC_REG_ADDRESS:
                const oldLcdEnable = getBit(oldValue, 7);
                const lcdEnable = getBit(value, 7);
                if (oldLcdEnable === 1 && lcdEnable === 0) {
                    this.ioRam[LY_ADDRESS - IO_REG_START] = 0;
                }
                break;

            case LY_ADDRESS:
            case LYC_ADDRESS:
                const oldStat = this.ioRam[STAT_REG_ADDRESS - IO_REG_START];
                const lyEqualLyc = this.ioRam[LY_ADDRESS - IO_REG_START] === this.ioRam[LYC_ADDRESS - IO_REG_START];
                const newStat = (oldStat & 0xfb) | ((lyEqualLyc ? 1 : 0) << 2);
                this.ioRam[STAT_REG_ADDRESS - IO_REG_START] = newStat;
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
