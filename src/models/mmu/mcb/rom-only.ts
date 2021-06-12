import { TWO_POW_EIGHT } from "src/utils/constants";
import { EXT_RAM_START } from "../gb-mmu-constants";
import { Mbc } from "./gb-mcb";

export class RomMcb implements Mbc {
    private readonly extRam: number[];

    constructor(
        private readonly code: number,
        private readonly hasRam: boolean,
        private readonly rom: number[]
    ) {
        this.extRam = hasRam ? new Array<number>(TWO_POW_EIGHT) : [];
    }

    getCode(): number {
        return this.code;
    }

    readRom(address: number): number {
        return this.rom[address];
    }

    readRam(address: number): number {
        if (!this.hasRam) {
            return 0xff;
        }
        return this.extRam[address - EXT_RAM_START];
    }

    writeRom(address: number, value: number): void {
        return;
    }

    writeRam(address: number, value: number): void {
        if (!this.hasRam) {
            return;
        }
        this.extRam[address - EXT_RAM_START] = value;
    }
}
