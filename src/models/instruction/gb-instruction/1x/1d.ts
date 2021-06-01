import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { subtract8Bit } from "../utils/arithmetic-utils";

/**
 * DEC E. Decrement the contents of register E by 1.
 */
export class Gb1dInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x1d;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const e = rs.e.getValue();
        const subtract = subtract8Bit(e, 1);
        rs.e.setValue(subtract.result);
        rs.setZeroFlag(subtract.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(subtract.halfCarry ? 1 : 0);
    }
}
