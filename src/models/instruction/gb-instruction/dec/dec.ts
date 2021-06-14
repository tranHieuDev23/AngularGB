import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { subtract8Bit } from "../../../../utils/arithmetic-utils";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";

/**
 * DEC <r1>. Decrement the contents of r1 by 1. This class supports
 * all DEC instructions except 0x0b, 0x1b, 0x2b, 0x3b.
 * r1 can be register or memory address.
 */
export class Dec8BitInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r1 instanceof GbRegisterArg ? 1 : 3;
    }

    getName(): string {
        return `DEC ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return this.cycleCount;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const b = this.r1.getValue(rs, mmu, args);
        const subtractResult = subtract8Bit(b, 1);
        this.r1.setValue(rs, mmu, args, subtractResult.result);
        rs.setZeroFlag(subtractResult.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(subtractResult.halfCarry ? 1 : 0);
        return this.cycleCount;
    }
}

/**
 * DEC <r1>. Increment the contents of r1 by 1. This class support
 * instructions 0x0b, 0x1b, 0x2b, 0x3b.
 * r1 can be register.
 */
export class Dec16BitInstruction implements GbInstruction {
    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg
    ) { }

    getName(): string {
        return `DEC ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        const result = (r1 - 1) & SIXTEEN_ONE_BITS;
        // console.log(this.getName(), r1, result)
        this.r1.setValue(rs, mmu, args, result);
        return 2;
    }
}
