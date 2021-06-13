import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbRegisterArg } from "../../gb-instruction";
import { popWordFromStack } from "../utils/stack-manipulation";

/**
 * POP <r1>. Pop the contents from the memory stack into register pair into r1.
 *
 * r1 can be a 16-bit register.
 */
export class PopInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg
    ) { }

    getName(): string {
        return `POP ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const value = popWordFromStack(rs, mmu);
        this.r1.setValue(rs, mmu, args, value);
        return 3;
    }
}
