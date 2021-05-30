import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD (BC), A. Store the contents of register A in the memory
 * location specified by register pair BC.
 */
export class Gb02Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x02;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        mmu.writeByte(rs.bc.getValue(), rs.a.getValue());
    }
}