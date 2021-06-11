import { ROM_BANK_START, EXT_RAM_START } from "../gb-mmu-constants";
import { Mbc } from "./gb-mcb";

export class GbMcb1 implements Mbc {
    private readonly extRam: number[];

    private lower5Bits = 0x00;
    private upper2Bits = 0x0;
    private ramEnable = false;
    private bankingMode = 0;

    constructor(
        private readonly code: number,
        readonly ramSize: number,
        private readonly rom: number[]
    ) {
        this.extRam = new Array<number>(ramSize);
    }

    getCode(): number {
        return this.code;
    }

    readRom(address: number): number {
        if (address < ROM_BANK_START) {
            if (this.bankingMode === 0) {
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
        if (!this.ramEnable) {
            throw new Error("RAM is not yet enabled!");
        }
        const ramBankOffset = this.getCurrentRamBank() * 0x2000;
        return this.extRam[ramBankOffset + address - EXT_RAM_START];
    }

    writeRom(address: number, value: number): void {
        if (0x0000 <= address && address < 0x2000) {
            this.ramEnable = (value & 0x0a) !== 0;
            return;
        }
        if (0x2000 <= address && address < 0x4000) {
            this.lower5Bits = value & 0x1f;
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
        if (!this.ramEnable) {
            throw new Error("RAM is not yet enabled!");
        }
        const ramBankOffset = this.getCurrentRamBank() * 0x2000;
        this.extRam[ramBankOffset + address - EXT_RAM_START] = value;
    }

    private getCurrentRomBank(): number {
        return (this.upper2Bits << 5) | this.lower5Bits;
    }

    private getCurrentRamBank(): number {
        if (this.bankingMode === 0) {
            return 0;
        }
        return this.upper2Bits;
    }
}
