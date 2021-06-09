import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { Gb8BitArg, GbInstruction, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { add8Bit } from "../../../../utils/arithmetic-utils";

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
        const carryFlag = rs.getCarryFlag();
        const result = add8Bit(
            rs.a.getValue(),
            this.r1.getValue(rs, mmu, args) + carryFlag
        );
        rs.a.setValue(result.result);
        rs.setZeroFlag(result.zero ? 1 : 0);
        rs.setOperationFlag(0);
        rs.setHalfCarryFlag(result.halfCarry ? 1 : 0);
        rs.setCarryFlag(result.carry ? 1 : 0);
        return 2;
    }
}
