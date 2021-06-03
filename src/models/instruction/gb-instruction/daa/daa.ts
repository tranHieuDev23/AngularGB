import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../../gb-instruction";

/**
 * DAA. Adjust the accumulator (register A) to a binary-coded decimal (BCD)
 * number after BCD addition and subtraction operations.
 */
export class DaaInstruction implements GbInstruction {
    getLength(): number {
        return 1;
    }

    getOpcode(): number {
        return 0x27;
    }

    run(rs: GbRegisterSet, mmu: GbMmu, args: number[]): number {
        let a = rs.a.getValue();
        if (rs.getOperationFlag() === 1) {
            if (rs.getCarryFlag() === 1) {
                a -= 0x60;
            }
            if (rs.getHalfCarryFlag() === 1) {
                a -= 0x6;
            }
        } else {
            if (rs.getCarryFlag() === 1 || a > 0x99) {
                a += 0x60;
                rs.setCarryFlag(1);
            }
            if (rs.getHalfCarryFlag() === 1 || (a & 0xf) > 0x9) {
                a += 0x6;
            }
        }
        a &= EIGHT_ONE_BITS;
        rs.a.setValue(a);
        rs.setZeroFlag(a === 0 ? 1 : 0);
        rs.setHalfCarryFlag(0);
        return 1;
    }
}
