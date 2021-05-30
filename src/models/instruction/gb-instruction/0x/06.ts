import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD B, d8. Load the 8-bit immediate operand d8 into register B.
 */
export class Gb06Instruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x06;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.b.setValue(args[0]);
    }
}