import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD C, d8. Load the 8-bit immediate operand d8 into register C.
 */
export class Gb0eInstruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x0e;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.c.setValue(args[0]);
    }
}