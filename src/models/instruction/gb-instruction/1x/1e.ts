import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD E, d8. Load the 8-bit immediate operand d8 into register E.
 */
export class Gb1eInstruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x1e;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.e.setValue(args[0]);
    }
}