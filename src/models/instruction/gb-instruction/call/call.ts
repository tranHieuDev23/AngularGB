import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { Gb16BitArg, GbFlagArg, GbInstruction, GbNotArg } from "../../gb-instruction";

/**
 * CALL. In memory, push the program counter PC value corresponding to the
 * address following the CALL instruction to the 2 bytes following the byte
 * specified by the current stack pointer SP. Then load the 16-bit immediate
 * operand a16 into PC.
 */
export class CallInstruction implements GbInstruction {
    constructor(
        private readonly r1: Gb16BitArg
    ) { }

    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return 0xcd;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const sp = rs.sp.getValue();
        const pc = rs.pc.getValue();
        const a16 = this.r1.getValue(rs, mmu, args);
        rs.sp.setValue((sp - 2) & SIXTEEN_ONE_BITS);
        mmu.writeWord(rs.sp.getValue(), pc);
        // Subtract 1 so that the next instruction will be at the address PC.
        rs.pc.setValue((a16 - 1) & SIXTEEN_ONE_BITS);
        return 6;
    }
}

/**
 * CALL <r1> <r2>. If the r1 flag is 0, the program counter PC value
 * corresponding to the memory location of the instruction following
 * the CALL instruction is pushed to the 2 bytes following the memory
 * byte specified by the stack pointer SP. The 16-bit immediate operand
 * r2 is then loaded into PC.
 *
 * r1 can be a flag or the NOT result of a flag.
 * r2 can be a 16-bit argument.
 */
export class CallFlagInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbFlagArg | GbNotArg,
        private readonly r2: Gb16BitArg
    ) { }

    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const flag = this.r1.getValue(rs, mmu, args);
        if (flag === 0) {
            return 3;
        }
        const sp = rs.sp.getValue();
        const pc = rs.pc.getValue();
        const a16 = this.r2.getValue(rs, mmu, args);
        rs.sp.setValue((sp - 2) & SIXTEEN_ONE_BITS);
        mmu.writeWord(rs.sp.getValue(), pc);
        // Subtract 1 so that the next instruction will be at the address PC.
        rs.pc.setValue((a16 - 1) & SIXTEEN_ONE_BITS);
        return 6;
    }
}
