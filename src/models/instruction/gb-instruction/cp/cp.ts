import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { subtract8Bit } from "../../../../utils/arithmetic-utils";

/**
 * CP <r1>. Compare the contents of r1 and the contents of
 * register A by calculating A - r1, and set the Zero flag if
 * they are equal. The execution of this instruction does not
 * affect the contents of register A.
 * r1 can be register, memory address or 8 bit value.
 */
export class CpInstruction implements GbInstruction {
    private readonly length: number;
    private readonly cycleCount: number;

    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg | GbMemArg | Gb8BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount();
        this.cycleCount = r1 instanceof GbRegisterArg ? 1 : 2;
    }

    getLength(): number {
        return this.length;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const result = subtract8Bit(
            rs.a.getValue(),
            this.r1.getValue(rs, mmu, args)
        );
        rs.setZeroFlag(result.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return this.cycleCount;
    }
}
