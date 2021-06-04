import { ROM_BANK_START } from "../gb-mmu";
import { Mbc } from "./gb-mcb";

export class GbMcb2 implements Mbc {
    private readonly extRam: number[] = new Array<number>(512);

    private romBankOffset: number = 0x4000;
    private ramEnabled: boolean = false;

    constructor(
        private readonly code: number,
        private readonly rom: number[]
    ) { }

    getCode(): number {
        return this.code;
    }

    readRom(address: number): number {
        if (address < ROM_BANK_START) {
            return this.rom[address];
        }
        return this.rom[this.romBankOffset + address - ROM_BANK_START];
    }

    readRam(address: number): number {
        if (address >= 0xc000) {
            throw new Error(`Trying to read from invalid RAM address: ${address}`);
        }
        if (!this.ramEnabled) {
            throw new Error("RAM is not yet enabled!");
        }
        const address9Bit = address & 0x1ff;
        return this.extRam[address9Bit];
    }

    writeRom(address: number, value: number): void {
        if (address >= 0x4000) {
            throw new Error(`Trying to write to invalid ROM address: ${address}`);
        }
        const bit8 = (address >> 8) & 1;
        if (bit8 === 0) {
            // RAM control
            this.ramEnabled = (value === 0xa);
        } else {
            // ROM control
            this.romBankOffset = (value & 0xf) * 0x4000;
            if (this.romBankOffset === 0) {
                this.romBankOffset = 0x4000;
            }
        }
    }

    writeRam(address: number, value: number): void {
        if (address >= 0xc000) {
            throw new Error(`Trying to read from invalid RAM address: ${address}`);
        }
        if (!this.ramEnabled) {
            throw new Error("RAM is not yet enabled!");
        }
        const address9Bit = address & 0x1ff;
        this.extRam[address9Bit] = value;
    }
}