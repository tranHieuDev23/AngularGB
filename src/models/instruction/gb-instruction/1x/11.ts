import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD DE, d16. Load the 2 bytes of immediate data into register pair DE.
 * The first byte of immediate data is the lower byte (i.e., bits 0-7),
 * and the second byte of immediate data is the higher byte (i.e., bits 8-15).
 */
export class Gb11Instruction implements GbInstruction {
    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return 0x11;
    }

    getCycleCount(): number {
        return 3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.d.setValue(args[0]);
        rs.e.setValue(args[1]);
    }
}