import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { pushWordToStack } from "../utils/stack-manipulation";

/**
 * RST <r1>. Push the current value of the program counter PC onto the memory
 * stack, and load into PC the r1-th byte of page 0 memory addresses. The next
 * instruction is fetched from the address specified by the new content of PC
 * (as usual).
 *
 * r1 can be a number.
 */
export class RstInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: number
    ) { }

    getName(): string {
        return `RST ${this.r1}`;
    }

    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const pc = rs.pc.getValue();
        pushWordToStack(rs, mmu, pc);
        rs.pc.setValue(this.r1);
        return 4;
    }
}
