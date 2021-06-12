import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { EIGHT_ONE_BITS } from "src/utils/constants";

/**
 * ADC <r1>. Add the contents of r1 and the Carry flag to the
 * contents of register A, and store the results in register A.
 * r1 can be register, memory address or 8 bit value.
 */
export class AdcInstruction implements GbInstruction {
    private readonly length: number;

    constructor(
        private readonly opCode: number,
        private readonly r1: GbRegisterArg | GbMemArg | Gb8BitArg
    ) {
        this.length = 1 + r1.getArgsTakenCount();
    }

    getName(): string {
        return `ADC ${this.r1.getName()}`;
    }

    getLength(): number {
        return this.length;
    }

    getOpcode(): number {
        return this.opCode;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        const a = rs.a.getValue();
        const r1 = this.r1.getValue(rs, mmu, args);
        const carryFlag = rs.getCarryFlag();

        const fullResult = a + r1 + carryFlag;
        const result = fullResult & EIGHT_ONE_BITS;
        const halfCarried = ((a ^ r1 ^ result) & 0x10) !== 0;
        const carried = fullResult > 0xff;

        rs.a.setValue(result);
        rs.setZeroFlag(result === 0 ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(halfCarried ? 1 : 0);
        rs.setCarryFlag(carried ? 1 : 0);
        return 2;
    }
}
