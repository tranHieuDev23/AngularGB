import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * HALT. After a HALT instruction is executed, the system clock is
 * stopped and HALT mode is entered. Although the system clock is
 * stopped in this status, the oscillator circuit and LCD controller
 * continue to operate.
 *
 * TODO: Implement this. Currently acts like a NOP.
 */
export class HaltInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "HALT";
    }

    getOpcode(): number {
        return 0x76;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }
}
