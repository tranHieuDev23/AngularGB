import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * NOP. Only advances the program counter by 1.
 * Performs no other operations that would have an effect.
 */
export class NopInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "NOP";
    }

    getOpcode(): number {
        return 0x00;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }
}
