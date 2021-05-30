import { Mmu } from "./mmu";

const TWO_POW_EIGHT = 1 << 8;
const EIGHT_ONE_BITS = TWO_POW_EIGHT - 1;

export class GbMmu implements Mmu {
    private readonly ram: number[] = new Array<number>(0xffff);

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
        this.ram.forEach((_, index) => {
            const randomValue = Math.floor(Math.random() * TWO_POW_EIGHT);
            this.writeByte(index, randomValue)
        });
    }
}
