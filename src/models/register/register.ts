export abstract class Register {
    public abstract bitCount(): number;

    private value: number = 0;

    constructor(
        protected readonly name: string
    ) { }

    public getName(): string {
        return this.name;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): void {
        this.value = value & this.getFullOnes();
    }

    private getFullOnes(): number {
        return (1 << this.bitCount()) - 1;
    }
}

export interface RegisterSet {
    getPc(): Register;
    getAllRegister(): Register[];
}
