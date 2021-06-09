import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * BIT <r1> <r2>. Copy the complement of the contents of bit r1 in r2
 * to the Z flag of the program status word (register F).
 *
 * r1 can be a number from 0 to 7.
 * r2 can be a register or a memory argument.
 */
export class BitInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: number,
        private readonly r2: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r2 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `BIT ${this.r1} ${this.r2.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r2 = this.r2.getValue(rs, mmu, args);
        const bit = (r2 >> this.r1) & 1;
        rs.setZeroFlag(bit ^ 1);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(1);
        return this.cycleCount;
    }
}
