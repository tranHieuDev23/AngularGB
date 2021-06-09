import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

/**
 * CPL. Take the one's complement (i.e., flip all bits) of the
 * contents of register A.
 */
export class CplInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "CPL";
    }

    getOpcode(): number {
        return 0x2f;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.a.setValue((~rs.a.getValue()) & EIGHT_ONE_BITS);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(1);
        return 1;
    }
}
