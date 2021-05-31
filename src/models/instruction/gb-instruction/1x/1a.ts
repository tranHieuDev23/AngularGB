import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD A, (DE). Load the 8-bit contents of memory specified by
 * register pair DE into register A.
 */
export class Gb1aInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x1a;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.a.setValue(mmu.readByte(rs.de.getValue()));
    }
}