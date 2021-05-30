import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { Cpu } from "./cpu";

export class GbCpu extends Cpu<GbRegisterSet, GbMmu> {

}
