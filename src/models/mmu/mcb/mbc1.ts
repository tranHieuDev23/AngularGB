import { ROM_BANK_START, EXT_RAM_START } from "../gb-mmu-constants";
import { Mbc } from "./gb-mcb";
import {
    ROM_SIZE_32_KB,
    ROM_SIZE_64_KB,
    ROM_SIZE_128_KB,
    ROM_SIZE_256_KB,
    ROM_SIZE_512_KB,
    getRamSize,
    MB,
    getRomSize,
    KB
} from "./gb-mcb-constants";

export class GbMcb1 implements Mbc {
    private readonly lower5BitsMask: number;
    private readonly romBankNeedUpper2Bit: boolean;
    private readonly extRam: number[];
    private readonly largeRom: boolean;
    private readonly largeRam: boolean;

    private lower5Bits = 0x01;
    private upper2Bits = 0x0;
    private bankingMode = 0;
    private ramEnabled = false;

    constructor(
        private readonly code: number,
        readonly romSizeCode: number,
        readonly ramSizeCode: number,
        private readonly rom: number[]
    ) {
        switch (romSizeCode) {
            case ROM_SIZE_32_KB:
                this.lower5BitsMask = 0x01;
                break;
            case ROM_SIZE_64_KB:
                this.lower5BitsMask = 0x03;
                break;
            case ROM_SIZE_128_KB:
                this.lower5BitsMask = 0x07;
                break;
            case ROM_SIZE_256_KB:
                this.lower5BitsMask = 0x0f;
                break;
            case ROM_SIZE_512_KB:
                this.lower5BitsMask = 0x1f;
                break;
            default:
                this.lower5BitsMask = 0x1f;
        }
        const romSize = getRomSize(romSizeCode);
        this.largeRom = romSize >= MB;
        this.romBankNeedUpper2Bit = romSize > 512 * KB;

        const ramSize = getRamSize(ramSizeCode);
        this.largeRam = ramSize > 8 * KB;
        this.extRam = new Array<number>(getRamSize(ramSizeCode)).fill(0);
    }

    getCode(): number {
        return this.code;
    }

    readRom(address: number): number {
        if (address < ROM_BANK_START) {
            if (!this.largeRom || this.bankingMode === 0) {
                return this.rom[address];
            }
            const firstRomBank = this.upper2Bits << 5;
            const firstRomBankOffset = firstRomBank * 0x4000;
            return this.rom[firstRomBankOffset + address];
        }
        const romBankOffset = this.getCurrentRomBank() * 0x4000;
        return this.rom[romBankOffset + address - ROM_BANK_START];
    }

    readRam(address: number): number {
        if (!this.ramEnabled) {
            return 0xff;
        }
        const ramBankOffset = this.getCurrentRamBank() * 0x2000;
        return this.extRam[ramBankOffset + address - EXT_RAM_START];
    }

    writeRom(address: number, value: number): void {
        if (0x0000 <= address && address < 0x2000) {
            this.ramEnabled = (value & 0x0a) === 0x0a;
            return;
        }
        if (0x2000 <= address && address < 0x4000) {
            this.lower5Bits = value & this.lower5BitsMask;
            if (this.lower5Bits === 0) {
                this.lower5Bits = 1;
            }
            return;
        }
        if (0x4000 <= address && address < 0x6000) {
            this.upper2Bits = value & 0x3;
            return;
        }
        if (0x6000 <= address && address < 0x8000) {
            this.bankingMode = value & 1;
        }
    }

    writeRam(address: number, value: number): void {
        const ramBankOffset = this.getCurrentRamBank() * 0x2000;
        this.extRam[ramBankOffset + address - EXT_RAM_START] = value;
    }

    private getCurrentRomBank(): number {
        if (this.romBankNeedUpper2Bit) {
            return (this.upper2Bits << 5) | this.lower5Bits;
        } else {
            return this.lower5Bits;
        }
    }

    private getCurrentRamBank(): number {
        if (!this.largeRam || this.bankingMode === 0) {
            return 0;
        }
        return this.upper2Bits;
    }
}
