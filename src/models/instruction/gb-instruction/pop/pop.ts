import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbRegisterArg } from "../../gb-instruction";

/**
 * POP <r1>. Pop the contents from the memory stack into register pair into r1.
 *
 * r1 can be a 16-bit register.
 */
export class PopInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg
    ) { }

    getLength(): number {
        return 1;
    }
    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        this.r1.setValue(rs, mmu, args, mmu.readWord(rs.sp.getValue()));
        rs.sp.setValue((rs.sp.getValue() + 2) & SIXTEEN_ONE_BITS);
        return 3;
    }
}
