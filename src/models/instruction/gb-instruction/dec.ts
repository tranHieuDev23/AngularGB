import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../gb-instruction";
import { subtract16Bit, subtract8Bit } from "./utils/arithmetic-utils";

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

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
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

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const b = this.r1.getValue(rs, mmu, args);
        const addResult = subtract16Bit(b, 1);
        this.r1.setValue(rs, mmu, args, addResult.result);
        return 2;
    }
}
