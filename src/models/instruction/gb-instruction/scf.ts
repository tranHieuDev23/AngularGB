import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../gb-instruction";

/**
 * SCF. Set the Carry flag to 1.
 */
export class ScfInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x37;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(1);
        return 1;
    }
}
