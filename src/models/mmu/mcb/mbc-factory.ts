import { Mbc } from "./gb-mcb";
import { GbMcb1 } from "./mbc1";
import { GbMcb2 } from "./mbc2";
import { RomMcb } from "./rom-only";

const KB = 1024;
const MB = 1024 * KB;

export function getRomSize(rom: number[]): number {
    const romSizeCode = rom[0x148];
    switch (romSizeCode) {
        case 0x00:
            return 32 * KB;
        case 0x01:
            return 64 * KB;
        case 0x02:
            return 128 * KB;
        case 0x03:
            return 256 * KB;
        case 0x04:
            return 512 * KB;
        case 0x05:
            return MB;
        case 0x06:
            return 2 * MB;
        case 0x07:
            return 4 * MB;
        case 0x08:
            return 8 * MB;
        default:
            throw new Error(`Unsupported ROM size: ${romSizeCode}`);
    }
}

export function getRamSize(rom: number[]): number {
    const ramSizeCode = rom[0x149];
    switch (ramSizeCode) {
        case 0x00:
            return 0;
        case 0x02:
            return 8 * KB;
        case 0x03:
            return 32 * KB;
        case 0x04:
            return 128 * KB;
        case 0x05:
            return 64 * KB;
        default:
            throw new Error(`Unsupported RAM size: ${ramSizeCode}`);
    }
}

export function getMbc(rom: number[]): Mbc {
    const ramSize = getRamSize(rom);
    const mbcCode = rom[0x147];
    switch (mbcCode) {
        case 0x00:
            return new RomMcb(mbcCode, false, rom);
        case 0x01:
        case 0x02:
        case 0x03:
            return new GbMcb1(mbcCode, ramSize, rom);
        case 0x05:
        case 0x06:
            return new GbMcb2(mbcCode, rom);
        case 0x08:
        case 0x09:
            return new RomMcb(mbcCode, true, rom);
        default:
            throw new Error(`Unsupported MCB type: ${mbcCode}`);
    }
}
