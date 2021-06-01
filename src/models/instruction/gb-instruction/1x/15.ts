import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { subtract8Bit } from "../utils/arithmetic-utils";

/**
 * DEC D. Decrement the contents of register D by 1.
 */
export class Gb15Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x15;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const d = rs.d.getValue();
        const subtractResult = subtract8Bit(d, 1);
        rs.d.setValue(subtractResult.result);
        rs.setZeroFlag(subtractResult.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(subtractResult.halfCarry ? 1 : 0);
    }
}
