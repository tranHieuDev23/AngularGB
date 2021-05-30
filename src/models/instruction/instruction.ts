import { Mmu } from "../mmu/mmu";
import { RegisterSet } from "../register/register";

export interface Instruction<RS extends RegisterSet, MMU extends Mmu> {
    getLength(): number;
    getOpcode(): number;
    getCycleCount(): number;
    run(rs: RS, mmu: MMU, args: number[]): void;
}
