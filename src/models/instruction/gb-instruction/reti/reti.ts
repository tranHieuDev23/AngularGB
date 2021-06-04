import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

/**
 * RETI. Pop from the memory stack the program counter PC value pushed when the
 * subroutine was called, returning control to the source program. This
 * instruction set the IME flag.
 */
export class RetiInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0xd9;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const sp = rs.sp.getValue();
        const newPc = mmu.readWord(sp);
        rs.sp.setValue((sp + 2) & SIXTEEN_ONE_BITS);
        rs.pc.setValue(newPc);
        rs.setIme(true);
        return 4;
    }
}
