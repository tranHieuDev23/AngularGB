import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { add8Bit } from "../utils/arithmetic-utils";

/**
 * INC B. Increment the contents of register B by 1.
 */
export class Gb04Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x04;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const b = rs.b.getValue();
        const addResult = add8Bit(b, 1);
        rs.b.setValue(addResult.result);
        rs.setZeroFlag(addResult.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(addResult.halfCarry ? 1 : 0);
    }
}