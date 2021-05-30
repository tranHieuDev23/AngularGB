import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { add8Bit } from "../utils/arithmetic-utils";

/**
 * INC C. Increment the contents of register C by 1.
 */
export class Gb0cInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x0c;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const c = rs.c.getValue();
        const addResult = add8Bit(c, 1);
        rs.c.setValue(addResult.result);
        rs.setZeroFlag(addResult.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(addResult.halfCarry ? 1 : 0);
    }
}