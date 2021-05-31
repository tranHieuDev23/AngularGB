import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb16BitArg, Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../gb-instruction";

/**
 * LD <r1> <r2>. Load the content of r2 into r1.
 * r1 can be register or memory address.
 * r2 can be register, memory address, 8 bit or 16 bit value.
 */
export class LdInstruction implements GbInstruction {
    private readonly length: number;

    constructor(
        private readonly opCode: number,
        private readonly cycleCount: number,
        private readonly r1: GbRegisterArg | GbMemArg,
        private readonly r2: GbRegisterArg | GbMemArg | Gb8BitArg | Gb16BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount() + r2.getArgsTakenCount();
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
        this.r1.setValue(rs, mmu, args, this.r2.getValue(rs, mmu, args));
    }
}