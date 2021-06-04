import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbFlagArg, GbInstruction, GbNotArg } from "../../gb-instruction";

/**
 * RET. Pop from the memory stack the program counter PC value pushed when the
 * subroutine was called, returning control to the source program.
 */
export class RetInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0xc9;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const sp = rs.sp.getValue();
        const newPc = mmu.readWord(sp);
        rs.sp.setValue((sp + 2) & SIXTEEN_ONE_BITS);
        rs.pc.setValue(newPc);
        return 4;
    }
}

/**
 * RET <r1>. If the r1 flag is 1, control is returned to the source program by
 * popping from the memory stack the program counter PC value that was pushed
 * to the stack when the subroutine was called. Otherwise, execute the next
 * instruction as normal.
 *
 * r1 can be a flag or the NOT result of a flag.
 */
export class RetFlagInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbFlagArg | GbNotArg
    ) { }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const flag = this.r1.getValue(rs, mmu, args);
        if (flag === 0) {
            return 2;
        }
        const sp = rs.sp.getValue();
        const newPc = mmu.readWord(sp);
        rs.sp.setValue((sp + 2) & SIXTEEN_ONE_BITS);
        rs.pc.setValue(newPc);
        return 5;
    }
}
