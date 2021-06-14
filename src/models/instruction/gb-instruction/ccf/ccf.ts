import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * CCF. Flip the Carry flag.
 */
export class CcfInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "CCF";
    }

    getOpcode(): number {
        return 0x3f;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(rs.getCarryFlag() ^ 1);
        return 1;
    }
}
