import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { add8Bit } from "../../../../utils/arithmetic-utils";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";

/**
 * INC <r1>. Increment the contents of r1 by 1. This class supports
 * all INC instructions except 0x03, 0x13, 0x23, 0x33.
 * r1 can be register or memory address.
 */
export class Inc8BitInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 1 : 3;
    }

    getName(): string {
        return `INC ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const b = this.r1.getValue(rs, mmu, args);
        const addResult = add8Bit(b, 1);
        this.r1.setValue(rs, mmu, args, addResult.result);
        rs.setZeroFlag(addResult.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(addResult.halfCarry ? 1 : 0);
        return this.cycleCount;
    }
}

/**
 * INC <r1>. Increment the contents of r1 by 1. This class supports
 * instructions 0x03, 0x13, 0x23, 0x33.
 * r1 can be register.
 */
export class Inc16BitInstruction implements GbInstruction {
    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg
    ) { }

    getName(): string {
        return `INC ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const result = (r1 + 1) & SIXTEEN_ONE_BITS;
        this.r1.setValue(rs, mmu, args, result);
        return 2;
    }
}
