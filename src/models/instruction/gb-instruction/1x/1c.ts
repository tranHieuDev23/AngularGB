import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { add8Bit } from "../utils/arithmetic-utils";

/**
 * INC E. Increment the contents of register E by 1.
 */
export class Gb1cInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x1c;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const e = rs.e.getValue();
        const addResult = add8Bit(e, 1);
        rs.e.setValue(addResult.result);
        rs.setZeroFlag(addResult.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(addResult.halfCarry ? 1 : 0);
    }
}