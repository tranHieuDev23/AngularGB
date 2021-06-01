export abstract class Register {

    constructor(
        protected readonly name: string
    ) { }

    private value = 0;
    public abstract bitCount(): number;

    public getName(): string {
        return this.name;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value & this.getFullOnes();
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

    protected getFullOnes(): number {
        return (1 << this.bitCount()) - 1;
    }
}

export interface RegisterSet {
    getPc(): Register;
    getAllRegister(): Register[];
}
