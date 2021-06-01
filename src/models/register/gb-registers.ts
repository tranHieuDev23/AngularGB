import { EIGHT_ONE_BITS } from "src/utils/constants";
import { Register, RegisterSet } from "./register";

export class Register8Bit extends Register {
    public bitCount(): number {
        return 8;
    }
}

export class Register16Bit extends Register {
    public bitCount(): number {
        return 16;
    }
}

export class DualRegister extends Register16Bit {
    constructor(
        protected readonly name: string,
        private readonly subRegister1: Register8Bit,
        private readonly subRegister2: Register8Bit
    ) {
        super(name);
    }

    public getName(): string {
        return this.name;
    }

    getValue(): number {
        return (this.subRegister1.getValue() << 8) | this.subRegister2.getValue();
    }

    setValue(value: number): void {
        const subRegister1Value = (value >> 8) & EIGHT_ONE_BITS;
        const subRegister2Value = value & EIGHT_ONE_BITS;
        this.subRegister1.setValue(subRegister1Value);
        this.subRegister2.setValue(subRegister2Value);
    }
}

export class GbRegisterSet implements RegisterSet {
    public readonly a = new Register8Bit("A");
    public readonly b = new Register8Bit("B");
    public readonly c = new Register8Bit("C");
    public readonly d = new Register8Bit("D");
    public readonly e = new Register8Bit("E");
    public readonly f = new Register8Bit("F");
    public readonly h = new Register8Bit("H");
    public readonly l = new Register8Bit("L");
    public readonly sp = new Register16Bit("SP");
    public readonly pc = new Register16Bit("PC");

    public readonly af = new DualRegister("AF", this.a, this.f);
    public readonly bc = new DualRegister("BC", this.b, this.c);
    public readonly de = new DualRegister("DE", this.d, this.e);
    public readonly hl = new DualRegister("HL", this.h, this.l);

    private readonly allRegisters = [
        this.a, this.b, this.c, this.d,
        this.e, this.f, this.h, this.l,
        this.sp, this.pc, this.af, this.bc,
        this.de, this.hl
    ];

    constructor() { }

    public getPc(): Register {
        return this.pc;
    }

    public getAllRegisters(): Register[] {
        return this.allRegisters;
    }

    public getZeroFlag(): number {
        return this.f.getBit(7);
    }

    public getOperationFlag(): number {
        return this.f.getBit(6);
    }

    public getHalfCarryFlag(): number {
        return this.f.getBit(5);
    }

    public getCarryFlag(): number {
        return this.f.getBit(4);
    }

    public setZeroFlag(value: number): void {
        this.f.setBit(7, value);
    }

    public setOperationFlag(value: number): void {
        this.f.setBit(6, value);
    }

    public setHalfCarryFlag(value: number): void {
        this.f.setBit(5, value);
    }

    public setCarryFlag(value: number): void {
        this.f.setBit(4, value);
    }
}

export enum RegisterName {
    A, B, C, D, E, F, H, L, SP, PC, AF, BC, DE, HL
}

export const REGISTERS_8_BIT = [
    RegisterName.A, RegisterName.B, RegisterName.C, RegisterName.D,
    RegisterName.E, RegisterName.F, RegisterName.H, RegisterName.L
];

export const REGISTERS_16_BIT = [
    RegisterName.SP, RegisterName.PC, RegisterName.AF, RegisterName.BC,
    RegisterName.DE, RegisterName.HL

];

export enum Flag {
    Zero = 7,
    Operation = 6,
    HalfCarry = 5,
    Carry = 4
}
