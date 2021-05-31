import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";
import { toSigned8Bit } from "../utils/arithmetic-utils";

/**
 * JR s8. Jump s8 steps from the current address in the program
 * counter (PC) (Jump relative).
 */
export class Gb18Instruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x18;
    }

    getCycleCount(): number {
        return 3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const jumpDistance = toSigned8Bit(args[0]);
        const pc = rs.pc.getValue();
        rs.pc.setValue((pc + jumpDistance) & SIXTEEN_ONE_BITS);
    }
}