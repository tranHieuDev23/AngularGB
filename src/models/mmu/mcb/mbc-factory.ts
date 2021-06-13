import { Mbc } from "./gb-mcb";
import { GbMcb1 } from "./mbc1";
import { GbMcb2 } from "./mbc2";
import { RomMcb } from "./rom-only";

export function getRomSizeCode(rom: number[]): number {
    return rom[0x148];
}

export function getRamSizeCode(rom: number[]): number {
    return rom[0x149];
}

export function getMbc(rom: number[]): Mbc {
    const romSizeCode = getRomSizeCode(rom);
    const ramSizeCode = getRamSizeCode(rom);
    const mbcCode = rom[0x147];
    switch (mbcCode) {
        case 0x00:
            return new RomMcb(mbcCode, false, rom);
        case 0x01:
        case 0x02:
        case 0x03:
            return new GbMcb1(mbcCode, romSizeCode, ramSizeCode, rom);
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
