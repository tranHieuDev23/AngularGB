import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { popWordFromStack } from "../utils/stack-manipulation";

/**
 * RETI. Pop from the memory stack the program counter PC value pushed when the
 * subroutine was called, returning control to the source program. This
 * instruction set the IME flag.
 */
export class RetiInstruction implements GbInstruction {
    getName(): string {
        return "RETI";
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0xd9;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 4;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const newPc = popWordFromStack(rs, mmu);
        rs.pc.setValue(newPc);
        rs.setIme(true);
        rs.setNextIme(true);
        return 4;
    }
}
