import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * DI. Reset the interrupt master enable (IME) flag and prohibit maskable
 * interrupts.
 */
export class DiInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "DI";
    }

    getOpcode(): number {
        return 0xf3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.setIme(false);
        rs.setNextIme(false);
        return 1;
    }
}
