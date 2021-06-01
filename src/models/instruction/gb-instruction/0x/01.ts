import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * LD BC, d16. Load the 2 bytes of immediate data into register pair BC.
 * The first byte of immediate data is the lower byte (i.e., bits 0-7),
 * and the second byte of immediate data is the higher byte (i.e., bits 8-15).
 */
export class Gb01Instruction implements GbInstruction {
    getLength(): number {
        return 3;
    }

    getOpcode(): number {
        return 0x01;
    }

    getCycleCount(): number {
        return 3;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        rs.b.setValue(args[0]);
        rs.c.setValue(args[1]);
    }
}
