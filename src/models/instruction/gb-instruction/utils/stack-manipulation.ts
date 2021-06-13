import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";

export function pushByteToStack(rs: GbRegisterSet, mmu: GbMmu, value: number): void {
    const oldSp = rs.sp.getValue();
    rs.sp.setValue(oldSp - 1);
    const newSp = rs.sp.getValue();
    mmu.writeByte(newSp, value);
}

export function pushWordToStack(rs: GbRegisterSet, mmu: GbMmu, value: number): void {
    const upperByte = (value >> 8) & EIGHT_ONE_BITS;
    const lowerByte = value & EIGHT_ONE_BITS;
    pushByteToStack(rs, mmu, upperByte);
    pushByteToStack(rs, mmu, lowerByte);
}

export function popByteFromStack(rs: GbRegisterSet, mmu: GbMmu): number {
    const sp = rs.sp.getValue();
    const value = mmu.readByte(sp);
    rs.sp.setValue(sp + 1);
    return value;
}

export function popWordFromStack(rs: GbRegisterSet, mmu: GbMmu): number {
    const lowerByte = popByteFromStack(rs, mmu);
    const upperByte = popByteFromStack(rs, mmu);
    return (upperByte << 8) | lowerByte;
}