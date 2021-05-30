import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * INC BC. Increment the contents of register pair BC by 1.
 */
export class Gb03Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x03;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.bc.setValue(rs.bc.getValue() + 1);
    }
}