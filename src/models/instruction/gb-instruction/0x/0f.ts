import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

/**
 * RRCA. Rotate the contents of register A to the right. That is,
 * the contents of bit 7 are copied to bit 6, and the previous
 * contents of bit 6 (before the copy) are copied to bit 5. The
 * same operation is repeated in sequence for the rest of the
 * register. The contents of bit 0 are placed in both the CY flag
 * and bit 7 of register A.
 */
export class Gb0fInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x0f;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const aBit0 = rs.a.getBit(0);
        const newA = ((rs.a.getValue() >> 1) & EIGHT_ONE_BITS) | (aBit0 << 7);
        rs.a.setValue(newA);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(aBit0);
    }
}
