import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { getBit } from "src/utils/arithmetic-utils";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * SRA <r1>. Shift the contents of r1 to the right. That is, the
 * contents of bit 7 are copied to bit 6, and the previous contents of bit 6
 * (before the copy operation) are copied to bit 5. The same operation is
 * repeated in sequence for the rest of r1. The contents of bit 0
 * are copied to the CY flag, and bit 7 of r1 is unchanged.
 *
 * r1 can be a register or a memory argument.
 */
export class SraInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `SRA ${this.r1.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.cycleCount;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const r1Bit0 = getBit(r1, 0);
        const r1Bit7 = getBit(r1, 7);
        const newR1 = ((r1 >> 1) & EIGHT_ONE_BITS) | (r1Bit7 << 7);
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(r1Bit0);
        return this.cycleCount;
    }
}

/**
 * SRL <r1>. Shift the contents of r1 to the right. That is, the
 * contents of bit 7 are copied to bit 6, and the previous contents of bit 6
 * (before the copy operation) are copied to bit 5. The same operation is
 * repeated in sequence for the rest of r1. The contents of bit 0
 * are copied to the CY flag, and bit 7 of reset to 0.
 *
 * r1 can be a register or a memory argument.
 */
export class SrlInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `SRL ${this.r1.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.cycleCount;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const r1Bit0 = getBit(r1, 0);
        const newR1 = (r1 >> 1) & EIGHT_ONE_BITS;
        this.r1.setValue(rs, mmu, args, newR1);
        rs.setZeroFlag(newR1 === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(0);
        rs.setCarryFlag(r1Bit0);
        return this.cycleCount;
    }
}
