import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../gb-instruction";
import { toSigned8Bit } from "./utils/arithmetic-utils";

/**
 * JR s8. Jump s8 steps from the current address in the program
 * counter (PC) (Jump relative).
 */
export class JrInstruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x18;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const pc = rs.pc.getValue();
        const s8 = toSigned8Bit(args[0]);
        rs.pc.setValue((pc + s8) & SIXTEEN_ONE_BITS);
        return 3;
    }
}