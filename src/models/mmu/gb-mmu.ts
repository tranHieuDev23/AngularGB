import { EIGHT_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
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
