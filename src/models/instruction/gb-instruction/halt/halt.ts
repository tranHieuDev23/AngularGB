import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbInterrupts } from "src/models/mmu/mmu-wrappers/gb-interrupts";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * HALT. After a HALT instruction is executed, the system clock is
 * stopped and HALT mode is entered. Although the system clock is
 * stopped in this status, the oscillator circuit and LCD controller
 * continue to operate.
 *
 * TODO: Implement this. Currently acts like a NOP.
 */
export class HaltInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getName(): string {
        return "HALT";
    }

    getOpcode(): number {
        return 0x76;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const interrupts = new GbInterrupts(mmu);
        const iE = interrupts.getIEByte();
        const iF = interrupts.getIFByte();
        const ime = rs.getIme();
        if ((iE & iF & 0x1f) === 0 || ime) {
            rs.pc.setValue(rs.pc.getValue() - 1);
        }
        return 1;
    }
}
