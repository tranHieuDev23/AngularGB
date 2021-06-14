import { GbMmu } from "src/models/mmu/gb-mmu";
import { DIV_TIMER_REG_ADDRESS } from "src/models/mmu/gb-mmu-constants";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { GbInstruction } from "../../gb-instruction";

/**
 * STOP. Execution of a STOP instruction stops both the system clock
 * and oscillator circuit. STOP mode is entered and the LCD
 * controller also stops. However, the status of the internal RAM
 * register ports remains unchanged.
 *
 * TODO: Implement this. Currently acts like a NOP.
 */
export class StopInstruction implements GbInstruction {
    getName(): string {
        return "STOP";
    }

    getLength(): number {
        return 2;
    }

    getOpcode(): number {
        return 0x10;
    }

    getCycleCount(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        return 1;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        mmu.writeRegister(DIV_TIMER_REG_ADDRESS, 0);
        return 1;
    }
}
