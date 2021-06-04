import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * EI. Set the interrupt master enable (IME) flag and allow maskable
 * interrupts.
 */
export class EiInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0xfb;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.setIme(true);
        return 1;
    }
}
