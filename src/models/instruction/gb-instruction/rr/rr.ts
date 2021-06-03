import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * RR <r1>. Rotate the contents of r1 to the right. That is,
 * the contents of bit 7 are copied to bit 6, and the previous
 * contents of bit 6 (before the copy operation) are copied to bit
 * 5. The same operation is repeated in sequence for the rest of
 * r1. The previous contents of the carry (CY) flag are
 * copied to bit 7 of r1.
 *
 * r1 can be a register or a memory argument.
 */
export class RrInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const r1Bit0 = r1 & 1;
        const newR1 = ((r1 >> 1) & EIGHT_ONE_BITS) | (rs.getCarryFlag() << 7);
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(r1Bit0);
        return this.cycleCount;
    }
}


/**
 * RRA. Rotate the contents of register A to the right, through
 * the carry (CY) flag. That is, the contents of bit 7 are
 * copied to bit 6, and the previous contents of bit 6 (before
 * the copy) are copied to bit 5. The same operation is repeated
 * in sequence for the rest of the register. The previous
 * contents of the carry flag are copied to bit 7.
 */
export class Gb1fInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x1f;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const aBit0 = rs.a.getBit(0);
        const newA = ((rs.a.getValue() >> 1) & EIGHT_ONE_BITS) | (rs.getCarryFlag() << 7);
        rs.a.setValue(newA);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(aBit0);
        return 1;
    }
}
