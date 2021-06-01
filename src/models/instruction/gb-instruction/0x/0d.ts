import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { subtract8Bit } from "../utils/arithmetic-utils";

/**
 * DEC C. Decrement the contents of register C by 1.
 */
export class Gb0dInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x0d;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const c = rs.c.getValue();
        const subtract = subtract8Bit(c, 1);
        rs.c.setValue(subtract.result);
        rs.setZeroFlag(subtract.zero ? 1 : 0);
        rs.setOperationFlag(1);
        rs.setHalfCarryFlag(subtract.halfCarry ? 1 : 0);
    }
}
