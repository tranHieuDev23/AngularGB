import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";
import { add16Bit } from "../utils/arithmetic-utils";

/**
 * ADD HL, DE. Add the contents of register pair DE to the contents
 * of register pair HL, and store the results in register pair HL.
 */
export class Gb19Instruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x19;
    }

    getCycleCount(): number {
        return 2;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        const de = rs.de.getValue();
        const hl = rs.hl.getValue();
        const addResult = add16Bit(de, hl);
        rs.hl.setValue(addResult.result);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(addResult.halfCarry ? 1 : 0);
        rs.setCarryFlag(addResult.carry ? 1 : 0);
    }
}
