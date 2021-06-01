import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb16BitArg, Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../gb-instruction";
import { add16Bit, toSigned8Bit } from "./utils/arithmetic-utils";

/**
 * LD <r1> <r2>. Load the content of r2 into r1.
 * r1 can be register or memory address.
 * r2 can be register, memory address, 8 bit or 16 bit value.
 */
export class LdInstruction implements GbInstruction {
    private readonly length: number;

    constructor(
        private readonly opCode: number,
        private readonly cycleCount: number,
        private readonly r1: GbRegisterArg | GbMemArg,
        private readonly r2: GbRegisterArg | GbMemArg | Gb8BitArg | Gb16BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount() + r2.getArgsTakenCount();
    }

    getLength(): number {
        return this.length;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        this.r1.setValue(rs, mmu, args, this.r2.getValue(rs, mmu, args));
        return this.cycleCount;
    }
}

/**
 * LD HL, SP+s8. Add the 8-bit signed operand s8 (values -128 to +127)
 * to the stack pointer SP, and store the result in register pair HL.
 */
export class GbF8Instruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0xf8;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const sp = rs.sp.getValue();
        const s8 = toSigned8Bit(args[0]);
        const result = add16Bit(sp, s8);
        rs.hl.setValue(result.result);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return 3;
    }
}