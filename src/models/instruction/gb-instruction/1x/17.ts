import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

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

    getOpcode(): number {
        return 0x17;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const aBit7 = rs.a.getBit(7);
        const newA = ((rs.a.getValue() << 1) & EIGHT_ONE_BITS) | rs.getCarryFlag();
        rs.a.setValue(newA);
        rs.setZeroFlag(0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(aBit7);
    }
}
