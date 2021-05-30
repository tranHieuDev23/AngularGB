import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD A, (BC). Load the 8-bit contents of memory specified by
 * register pair BC into register A.
 */
export class Gb0aInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x0a;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.a.setValue(mmu.readByte(rs.bc.getValue()));
    }
}