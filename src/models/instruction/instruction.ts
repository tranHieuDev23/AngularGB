import { Mmu } from "../mmu/mmu";
import { RegisterSet } from "../register/register";

export interface Instruction<RS extends RegisterSet, MMU extends Mmu> {
    getName(): string;
    getLength(): number;
    getOpcode(): number;
    run(rs: RS, mmu: MMU, args: number[]): number;
}

export interface InstructionArg<RS extends RegisterSet, MMU extends Mmu> {
    getName(): string;
    getArgsTakenCount(): number;
    getValueBitCount(): number;
    getValue(rs: RS, mmu: MMU, args: number[]): number;
}

export interface InstructionWritableArg<RS extends RegisterSet, MMU extends Mmu> extends InstructionArg<RS, MMU> {
    setValue(rs: RS, mmu: MMU, args: number[], value: number): void;
}
