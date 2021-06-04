import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";

export function initialize(rs: GbRegisterSet, mmu: GbMmu): void {
    rs.getAllRegisters().forEach(item => {
        item.setValue(randomInteger(0, TWO_POW_EIGHT - 2));
    });
    rs.setZeroFlag(randomInteger(0, 2));
    rs.setOperationFlag(randomInteger(0, 2));
    rs.setHalfCarryFlag(randomInteger(0, 2));
    rs.setCarryFlag(randomInteger(0, 2));
    mmu.randomize();
}
