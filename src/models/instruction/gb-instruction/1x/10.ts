import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * STOP. Execution of a STOP instruction stops both the system clock and
 * oscillator circuit. STOP mode is entered and the LCD controller also
 * stops. However, the status of the internal RAM register ports remains
 * unchanged.
 *
 * STOP mode can be cancelled by a reset signal.
 *
 * If the RESET terminal goes LOW in STOP mode, it becomes that of a normal
 * reset status. The following conditions should be met before a STOP
 * instruction is executed and stop mode is entered:
 * - All interrupt-enable (IE) flags are reset.
 * - Input to P10-P13 is LOW for all.
 *
 * TODO: Implement this, currently acts like NOOP
 */
export class Gb10Instruction implements GbInstruction {
    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x10;
    }

    getCycleCount(): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): void {
        return;
    }
}
