export abstract class Register {

    constructor(
        protected readonly name: string
    ) {
        this.fullOnes = (1 << this.bitCount()) - 1;
    }

    private value = 0;
    private readonly fullOnes: number;

    public abstract bitCount(): number;

    public getName(): string {
        return this.name;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value & this.fullOnes;
    }

    public getBit(index: number): number {
        return (this.value >> index) & 1;
    }

    public setBit(index: number, value: number): void {
        const oldBit = this.getBit(index);
        if (oldBit === value) {
            return;
        }
        this.value ^= (1 << index);
    }
}

export interface RegisterSet {
    getPc(): Register;
    getAllRegisters(): Register[];
}
