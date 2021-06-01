import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../gb-instruction";
import { subtract8Bit } from "./utils/arithmetic-utils";

/**
 * SUB <r1>. Subtract the content of register A by r1, and store the result
 * in A.
 * r1 can be register, memory address or 8 bit value.
 */
export class SubInstruction implements GbInstruction {
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
        rs.a.setValue(result.result);
        rs.setZeroFlag(result.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return this.cycleCount;
    }
}
