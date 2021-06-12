import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";

/**
 * SET <r1> <r2>. Set bit r1 in r2 to 1.
 *
 * r1 can be a number from 0 to 7.
 * r2 can be a register or a memory argument.
 */
export class SetInstruction implements GbInstruction {
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: number,
        private readonly r2: GbRegisterArg | GbMemArg
    ) {
        this.cycleCount = r2 instanceof GbRegisterArg ? 2 : 4;
    }

    getName(): string {
        return `SET ${this.r1} ${this.r2.getName()}`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r2 = this.r2.getValue(rs, mmu, args);
        const newR2 = r2 | (1 << this.r1);
        this.r2.setValue(rs, mmu, args, newR2);
        return this.cycleCount;
    }
}
