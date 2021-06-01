import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../gb-instruction";

/**
 * ADD <r1>. Take the logical AND for each bit of the contents of
 * r1 and the contents of register A, and store the results in register A.
 * r1 can be register, memory address or 8 bit value.
 */
export class AndInstruction implements GbInstruction {
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

    getCycleCount(): number {
        return this.cycleCount;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const result = rs.a.getValue() & this.r1.getValue(rs, mmu, args);
        rs.a.setValue(result);
        rs.setZeroFlag(result === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(1);
        rs.setCarryFlag(0);
    }
}
