import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb16BitArg, GbFlagArg, GbInstruction, GbNotArg, GbRegisterArg } from "../../gb-instruction";

/**
 * JP <r1>. Load the 16-bit immediate operand r1 into the program counter (PC).
 * r1 specifies the address of the subsequently executed instruction.
 *
 * r1 can be a 16-bit register or a 16-bit argument.
 */
export class JpInstruction implements GbInstruction {
    private readonly length: number;
    private readonly cycleCount: number;

    constructor(
        private readonly opcode: number,
        private readonly r1: GbRegisterArg | Gb16BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount();
        this.cycleCount = r1 instanceof GbRegisterArg ? 1 : 4;
    }

    getName(): string {
        return `JP ${this.r1.getName()}`;
    }

    getLength(): number {
        return this.length;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const a16 = this.r1.getValue(rs, mmu, args);
        rs.pc.setValue(a16);
        return this.cycleCount;
    }
}

/**
 * JP <r1> <r2>. If flag r1 is equal to 1, load the 16-bit immediate operand r2
 * into the program counter (PC).
 *
 * r1 can be a flag or the NOT result of a flag.
 * r2 can be a 16-bit argument.
 */
export class JpFlagInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbFlagArg | GbNotArg,
        private readonly r2: Gb16BitArg
    ) { }

    getName(): string {
        return `JP ${this.r1.getName()} ${this.r2.getName()}`;
    }

    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return this.opcode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const flag = this.r1.getValue(rs, mmu, args);
        if (flag === 0) {
            return 3;
        }
        const a16 = this.r2.getValue(rs, mmu, args);
        rs.pc.setValue(a16);
        return 4;
    }
}
