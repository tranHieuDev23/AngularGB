import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

/**
 * RST <r1>. Push the current value of the program counter PC onto the memory
 * stack, and load into PC the r1-th byte of page 0 memory addresses. The next
 * instruction is fetched from the address specified by the new content of PC
 * (as usual).
 *
 * r1 can be a number.
 */
export class RstInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: number
    ) {
        // Subtract 1 so that the next instruction will be at the address PC.
        this.r1 = (this.r1 - 1) & SIXTEEN_ONE_BITS;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.sp.setValue((rs.sp.getValue() - 2) & SIXTEEN_ONE_BITS);
        const sp = rs.sp.getValue();
        mmu.writeWord(sp, rs.pc.getValue());
        rs.pc.setValue(this.r1);
        return 4;
    }
}
