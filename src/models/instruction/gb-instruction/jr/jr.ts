import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbFlagArg, GbInstruction, GbNotArg } from "../../gb-instruction";
import { toSigned8Bit } from "../../../../utils/arithmetic-utils";

/**
 * JR s8. Jump s8 steps from the current address in the program
 * counter (PC) (Jump relative).
 */
export class JrInstruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getName(): string {
        return "JR s8";
    }

    getOpcode(): number {
        return 0x18;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const pc = rs.pc.getValue();
        const s8 = toSigned8Bit(args[0]);
        rs.pc.setValue(pc + s8);
        return 3;
    }
}

/**
 * JR <r1>. If flag r1 is equal to 1, jump s8 steps from the
 * current address in the program counter (PC) (Jump relative).
 *
 * r1 can be a flag or the NOT result of a flag.
 */
export class JrFlagInstruction implements GbInstruction {
    constructor(
        private readonly opcode: number,
        private readonly r1: GbFlagArg | GbNotArg
    ) { }

    getName(): string {
        return `JR ${this.r1.getName()} s8`;
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return this.opcode;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const flag = this.r1.getValue(rs, mmu, args);
        if (flag === 0) {
            return 2;
        }
        return 3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const flag = this.r1.getValue(rs, mmu, args);
        if (flag === 0) {
            return 2;
        }
        const pc = rs.pc.getValue();
        const s8 = toSigned8Bit(args[0]);
        rs.pc.setValue(pc + s8);
        return 3;
    }
}
