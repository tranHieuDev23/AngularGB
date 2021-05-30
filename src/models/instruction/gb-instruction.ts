import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { Instruction } from "./instruction";

export interface GbInstruction extends Instruction<GbRegisterSet, GbMmu> { }
