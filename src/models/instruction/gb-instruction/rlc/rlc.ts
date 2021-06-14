import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * RLC <r1>. Rotate the contents of r1 to the left. That is,
 * the contents of bit 0 are copied to bit 1, and the previous
 * contents of bit 1 (before the copy operation) are copied to
 * bit 2. The same operation is repeated in sequence for the
 * rest of r1. The contents of bit 7 are placed in both the CY
 * flag and bit 0 of r1.
 *
 * r1 can be register or memory address.
 */
export class RlcInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `RLC ${this.r1.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.cycleCount;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const r1Bit7 = getBit(r1, 7);
        const newR1 = ((r1 << 1) & EIGHT_ONE_BITS) | r1Bit7;
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(r1Bit7);
        return this.cycleCount;
    }
}

/**
 * RLCA. Rotate the contents of register A to the left.
 * That is, the contents of bit 0 are copied to bit 1,
 * and the previous contents of bit 1 (before the copy operation)
 * are copied to bit 2. The same operation is repeated in sequence
 * for the rest of the register. The contents of bit 7 are placed
 * in both the CY flag and bit 0 of register A.
 */
export class Gb07Instruction implements GbInstruction {
    getName(): string {
        return "RLCA";
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x07;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const aBit7 = rs.a.getBit(7);
        const newA = ((rs.a.getValue() << 1) & EIGHT_ONE_BITS) | aBit7;
        rs.a.setValue(newA);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(aBit7);
        return 1;
    }
}
