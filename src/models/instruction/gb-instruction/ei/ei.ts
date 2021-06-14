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

    getName(): string {
        return "EI";
    }

    getOpcode(): number {
        return 0xfb;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        rs.setNextIme(true);
        return 1;
    }
}
