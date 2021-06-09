import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbMmu } from "../mmu/gb-mmu";
import { Flag, FLAG_NAMES, GbRegisterSet, RegisterName, REGISTERS_8_BIT, REGISTER_NAMES } from "../register/gb-registers";
import { Register } from "../register/register";
import { Instruction, InstructionArg, InstructionWritableArg } from "./instruction";

export interface GbInstruction extends Instruction<GbRegisterSet, GbMmu> { }

export interface GbInstructionArg extends InstructionArg<GbRegisterSet, GbMmu> { }

export interface GbInstructionWritableArg extends GbInstructionArg, InstructionWritableArg<GbRegisterSet, GbMmu> { }

export class GbRegisterArg implements GbInstructionWritableArg {
    private readonly bitCount: number;

    constructor(
        private readonly registerName: RegisterName
    ) {
        this.bitCount = REGISTERS_8_BIT.includes(registerName) ? 8 : 16;
    }

    getName(): string {
        return REGISTER_NAMES[this.registerName.valueOf()];
    }

    getArgsTakenCount(): number {
        return 0;
    }

    getValueBitCount(): number {
        return this.bitCount;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.getRegister(rs).getValue();
    }

    setValue(rs: GbRegisterSet, mmu: GbMmu, args: number[], value: number): void {
        this.getRegister(rs).setValue(value);
    }

    private getRegister(rs: GbRegisterSet): Register {
        return rs.getAllRegisters()[this.registerName.valueOf()];
    }
}

export class Gb8BitArg implements GbInstructionArg {
    constructor(
        private readonly argIndex: number
    ) { }

    getName(): string {
        return "d8";
    }

    getArgsTakenCount(): number {
        return 1;
    }

    getValueBitCount(): number {
        return 8;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return args[this.argIndex];
    }
}

export class Gb16BitArg implements GbInstructionArg {
    constructor(
        private readonly argIndex: number
    ) { }

    getName(): string {
        return "d16";
    }

    getArgsTakenCount(): number {
        return 2;
    }

    getValueBitCount(): number {
        return 16;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return (args[this.argIndex + 1] << 8) | args[this.argIndex];
    }
}

export class GbMemArg implements GbInstructionWritableArg {
    constructor(
        private readonly addressArg: GbInstructionArg
    ) { }

    getName(): string {
        return `(${this.addressArg.getName()})`;
    }

    getArgsTakenCount(): number {
        return this.addressArg.getArgsTakenCount();
    }

    getValueBitCount(): number {
        return 8;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return mmu.readByte(this.getAddress(rs, mmu, args));
    }

    setValue(rs: GbRegisterSet, mmu: GbMmu, args: number[], value: number): void {
        mmu.writeByte(this.getAddress(rs, mmu, args), value);
    }

    private getAddress(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.addressArg.getValueBitCount() === 8
            ? 0xff00 | this.addressArg.getValue(rs, mmu, args)
            : this.addressArg.getValue(rs, mmu, args);
    }
}

export class GbFlagArg implements GbInstructionWritableArg {
    constructor(
        private readonly flag: Flag
    ) { }

    getName(): string {
        return FLAG_NAMES[this.flag.valueOf()];
    }

    getArgsTakenCount(): number {
        return 0;
    }

    getValueBitCount(): number {
        return 1;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return rs.f.getBit(this.flag.valueOf());
    }

    setValue(rs: GbRegisterSet, mmu: GbMmu, args: number[], value: number): void {
        rs.f.setBit(this.flag.valueOf(), value);
    }
}

export class Gb16BitIncArg implements GbInstructionArg {
    constructor(
        private readonly baseArg: GbInstructionWritableArg
    ) { }

    getName(): string {
        return `${this.baseArg.getName()}+`;
    }

    getArgsTakenCount(): number {
        return this.baseArg.getArgsTakenCount();
    }
    getValueBitCount(): number {
        return 16;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const value = this.baseArg.getValue(rs, mmu, args);
        this.baseArg.setValue(rs, mmu, args, (value + 1) & SIXTEEN_ONE_BITS);
        return value;
    }
}

export class Gb16BitDecArg implements GbInstructionArg {
    constructor(
        private readonly baseArg: GbInstructionWritableArg
    ) { }

    getName(): string {
        return `${this.baseArg.getName()}-`;
    }

    getArgsTakenCount(): number {
        return this.baseArg.getArgsTakenCount();
    }
    getValueBitCount(): number {
        return 16;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const value = this.baseArg.getValue(rs, mmu, args);
        this.baseArg.setValue(rs, mmu, args, (value - 1) & SIXTEEN_ONE_BITS);
        return value;
    }
}

export class GbNotArg implements GbInstructionWritableArg {
    constructor(
        private readonly flagArg: GbFlagArg
    ) { }

    getName(): string {
        return `N${this.flagArg.getName()}`;
    }

    getArgsTakenCount(): number {
        return 0;
    }

    getValueBitCount(): number {
        return 1;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.flagArg.getValue(rs, mmu, args) ^ 1;
    }

    setValue(rs: GbRegisterSet, mmu: GbMmu, args: number[], value: number): void {
        this.flagArg.setValue(rs, mmu, args, value ^ 1);
    }
}
