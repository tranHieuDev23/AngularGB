import { Mmu } from "../mmu/mmu";
import { RegisterSet } from "../register/register";

export interface Instruction<RS extends RegisterSet, MMU extends Mmu> {
    getLength(): number;
    getOpcode(): number;
    getCycleCount(): number;
    run(rs: RS, mmu: MMU, args: number[]): void;
}

export interface InstructionArg<RS extends RegisterSet, MMU extends Mmu> {
    getArgsTakenCount(): number;
    getValueBitCount(): number;
    getValue(rs: RS, mmu: MMU, args: number[]): number;
}

export interface InstructionWritableArg<RS extends RegisterSet, MMU extends Mmu> extends InstructionArg<RS, MMU> {
    setValue(rs: RS, mmu: MMU, args: number[], value: number): void;
}
