import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { Register } from "../register/register";
import { add16Bit, subtract16Bit } from "./gb-instruction/utils/arithmetic-utils";
import { Instruction, InstructionArg, InstructionWritableArg } from "./instruction";

export interface GbInstruction extends Instruction<GbRegisterSet, GbMmu> { }

export interface GbInstructionArg extends InstructionArg<GbRegisterSet, GbMmu> { }

export interface GbInstructionWritableArg extends GbInstructionArg, InstructionWritableArg<GbRegisterSet, GbMmu> { }

export enum RegisterName {
    A, B, C, D, E, F, H, L, SP, PC, AF, BC, DE, HL
};

function registerBitCount(registerName: RegisterName) {
    switch (registerName) {
        case RegisterName.A:
        case RegisterName.B:
        case RegisterName.C:
        case RegisterName.D:
        case RegisterName.E:
        case RegisterName.F:
        case RegisterName.H:
        case RegisterName.L:
            return 8;
        case RegisterName.AF:
        case RegisterName.BC:
        case RegisterName.DE:
        case RegisterName.HL:
        case RegisterName.SP:
        case RegisterName.PC:
            return 16;
        default:
            throw new Error("Unknown register name");
    }
}

export class GbRegisterArg implements GbInstructionWritableArg {
    constructor(
        private readonly registerName: RegisterName
    ) { }

    getArgsTakenCount(): number {
        return 0;
    }

    getValueBitCount(): number {
        return registerBitCount(this.registerName);
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
        return this.addressArg.getValueBitCount() == 8
            ? 0xff00 | this.addressArg.getValue(rs, mmu, args)
            : this.addressArg.getValue(rs, mmu, args);
    }
}

export class Gb8BitIncArg implements GbInstructionArg {
    constructor(
        private readonly baseArg: GbInstructionWritableArg
    ) { }

    getArgsTakenCount(): number {
        return this.baseArg.getArgsTakenCount();
    }
    getValueBitCount(): number {
        return this.baseArg.getValueBitCount();
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const value = this.baseArg.getValue(rs, mmu, args);
        this.baseArg.setValue(rs, mmu, args, add16Bit(value, 1).result);
        return value;
    }
}

export class Gb8BitDecArg implements GbInstructionArg {
    constructor(
        private readonly baseArg: GbInstructionWritableArg
    ) { }

    getArgsTakenCount(): number {
        return this.baseArg.getArgsTakenCount();
    }
    getValueBitCount(): number {
        return this.baseArg.getValueBitCount();
    }

    getValue(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const value = this.baseArg.getValue(rs, mmu, args);
        this.baseArg.setValue(rs, mmu, args, subtract16Bit(value, 1).result);
        return value;
    }
}