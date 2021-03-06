import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * RL <r1>. Rotate the contents of r1 to the left. That is,
 * the contents of bit 0 are copied to bit 1, and the previous
 * contents of bit 1 (before the copy operation) are copied to bit
 * 2. The same operation is repeated in sequence for the rest of
 * r1. The previous contents of the carry (CY) flag are
 * copied to bit 0 of r1.
 *
 * r1 can be a register or a memory argument.
 */
export class RlInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `RL ${this.r1.getName()}`;
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
        const newR1 = ((r1 << 1) & EIGHT_ONE_BITS) | rs.getCarryFlag();
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(r1Bit7);
        return this.cycleCount;
    }
}

/**
 * RLA. Rotate the contents of register A to the left, through
 * the carry (CY) flag. That is, the contents of bit 0 are
 * copied to bit 1, and the previous contents of bit 1 (before
 * the copy operation) are copied to bit 2. The same operation
 * is repeated in sequence for the rest of the register. The
 * previous contents of the carry flag are copied to bit 0.
 */
export class Gb17Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "RLA";
    }

    getOpcode(): number {
        return 0x17;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const aBit7 = rs.a.getBit(7);
        const newA = ((rs.a.getValue() << 1) & EIGHT_ONE_BITS) | rs.getCarryFlag();
        rs.a.setValue(newA);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(aBit7);
        return 1;
    }
}
