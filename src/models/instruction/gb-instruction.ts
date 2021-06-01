import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "../register/gb-registers";
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
        switch (this.registerName) {
            case RegisterName.A:
                return rs.a;
            case RegisterName.B:
                return rs.b;
            case RegisterName.C:
                return rs.c;
            case RegisterName.D:
                return rs.d;
            case RegisterName.E:
                return rs.e;
            case RegisterName.F:
                return rs.f;
            case RegisterName.H:
                return rs.h;
            case RegisterName.L:
                return rs.l;
            case RegisterName.AF:
                return rs.af;
            case RegisterName.BC:
                return rs.bc;
            case RegisterName.DE:
                return rs.de;
            case RegisterName.HL:
                return rs.hl;
            case RegisterName.SP:
                return rs.sp;
            case RegisterName.PC:
                return rs.pc;
            default:
                throw new Error("Unknown register name");
        }
    }
}

export class Gb8BitArg implements GbInstructionArg {
    constructor(
        private readonly argIndex: number
    ) { }

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

    getArgsTakenCount(): number {
        return 2;
    }

    getValueBitCount(): number {
        return 16;
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return (args[this.argIndex] << 8) | args[this.argIndex + 1];
    }
}

export class GbMemArg implements GbInstructionWritableArg {
    constructor(
        private readonly addressArg: GbInstructionArg
    ) { }

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

export class Gb16BitIncArg implements GbInstructionArg {
    constructor(
        private readonly baseArg: GbInstructionWritableArg
    ) { }

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
