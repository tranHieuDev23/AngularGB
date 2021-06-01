import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { subtract8Bit } from "../utils/arithmetic-utils";

/**
 * DEC B. Decrement the contents of register B by 1.
 */
export class Gb05Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x05;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const b = rs.b.getValue();
        const subtractResult = subtract8Bit(b, 1);
        rs.b.setValue(subtractResult.result);
        rs.setZeroFlag(subtractResult.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(subtractResult.halfCarry ? 1 : 0);
    }
}
