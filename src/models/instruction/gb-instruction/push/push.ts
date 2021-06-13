import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction, GbRegisterArg } from "../../gb-instruction";
import { pushWordToStack } from "../utils/stack-manipulation";

/**
 * PUSH <r1>. Push the contents of r1 onto the memory stack.
 *
 * r1 can be a 16-bit register.
 */
export class PushInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg
    ) { }

    getName(): string {
        return `PUSH ${this.r1.getName()}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const r1 = this.r1.getValue(rs, mmu, args);
        pushWordToStack(rs, mmu, r1);
        return 4;
    }
}
