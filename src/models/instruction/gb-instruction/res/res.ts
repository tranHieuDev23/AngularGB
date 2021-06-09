import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * RES <r1> <r2>. Reset bit 0 in r1 to 0.
 *
 * r1 can be a number from 0 to 7.
 * r2 can be a register or a memory argument.
 */
export class ResInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: number,
        private readonly r2: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r2 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `RES ${this.r1} ${this.r2.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r2 = this.r2.getValue(rs, mmu, args);
        const bitsToKeep = EIGHT_ONE_BITS ^ (1 << this.r1);
        const newR2 = r2 & bitsToKeep;
        this.r2.setValue(rs, mmu, args, newR2);
        return this.cycleCount;
    }
}
