import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { add16Bit, add8Bit, toSigned8Bit } from "../../../../utils/arithmetic-utils";

/**
 * ADD <r1> <r2>. Adds the value of r1 and r2, and store the result
 * in r1. This class support all instructions except 0x09, 0x19,
 * 0x29, 0x39 and 0xe8.
 * r1 can be register or memory address.
 * r2 can be register, memory address or 8 bit value.
 */
export class Add8BitInstruction implements GbInstruction {
    private readonly length: number;
    private readonly cycleCount: number;

    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg | GbMemArg,
        private readonly r2: GbRegisterArg | GbMemArg | Gb8BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount() + r2.getArgsTakenCount();
        this.cycleCount = r2 instanceof GbRegisterArg ? 1 : 2;
    }

    getLength(): number {
        return this.length;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const result = add8Bit(
            this.r1.getValue(rs, mmu, args),
            this.r2.getValue(rs, mmu, args)
        );
        this.r1.setValue(rs, mmu, args, result.result);
        rs.setZeroFlag(result.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return this.cycleCount;
    }
}

/**
 * ADD <r1> <r2>. Adds the value of r1 and r2, and store the result
 * in r1. This class support 4 instruction 0x09, 0x19, 0x29, 0x39.
 * r1 and r2 can be dual registers.
 */
export class Add16BitRegisterInstruction implements GbInstruction {
    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg,
        private readonly r2: GbRegisterArg
    ) { }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const result = add16Bit(
            this.r1.getValue(rs, mmu, args),
            this.r2.getValue(rs, mmu, args)
        );
        this.r1.setValue(rs, mmu, args, result.result);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return 2;
    }
}

/**
 * ADD SP s8. Add the contents of the 8-bit signed (2's complement)
 * immediate operand s8 and the stack pointer SP and store the
 * results in SP.
 */
export class GbE8Instruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0xe8;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const s8 = toSigned8Bit(args[0]);
        const result = add16Bit(rs.sp.getValue(), s8);
        rs.sp.setValue(result.result);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return 4;
    }
}
