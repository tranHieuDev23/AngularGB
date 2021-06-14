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
    private readonly name: string;

    constructor(
        private readonly opcode: number,
        private readonly r1: number
    ) {
        this.name = `RST 0x${this.r1.toString(16).padStart(2)}`;
    }

    getName(): string {
        return this.name;
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
