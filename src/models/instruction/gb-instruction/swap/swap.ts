import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * SLA <r1>. Shift the contents of the lower-order four bits (0-3) of r1 to the
 * higher-order four bits (4-7) of the register, and shift the higher-order
 * four bits to the lower-order four bits.
 *
 * r1 can be a register or a memory argument.
 */
export class SwapInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const lowerBits = r1 & 0xf;
        const upperBits = (r1 & 0xf0) >> 4;
        const newR1 = (lowerBits << 4) | upperBits;
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(0);
        return this.cycleCount;
    }
}
