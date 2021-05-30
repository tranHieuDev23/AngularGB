import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD (a16), SP. Store the lower byte of stack pointer SP at the
 * address specified by the 16-bit immediate operand a16, and
 * store the upper byte of SP at address a16 + 1.
 */
export class Gb08Instruction implements GbInstruction {
    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return 0x08;
    }

    getCycleCount(): number {
        return 5;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const sp = rs.sp.getValue();
        const lowerHalf = sp & ((1 << 8) - 1);
        const upperHalf = sp >> 8;
        mmu.writeByte(args[0], lowerHalf);
        mmu.writeByte(args[0] + 1, upperHalf);
    }
}