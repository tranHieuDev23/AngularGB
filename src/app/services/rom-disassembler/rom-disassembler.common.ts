import { GbCpu, GbDisassembledInstruction } from "src/models/cpu/gb-cpu";
import { GbDisassemblerMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { TWO_POW_SIXTEEN } from "src/utils/constants";

export class RomDisassemblerInput {
    constructor(
        public readonly memory: number[]
    ) { }
}

export class RomDisassemblerOutput {
    constructor(
        public readonly instructions: GbDisassembledInstruction[]
    ) { }
}

export function disassemblyRom(input: RomDisassemblerInput): RomDisassemblerOutput {
    const ram = input.memory as number[];
    const mmu = new GbDisassemblerMmu(ram);
    const cpu = new GbCpu(new GbRegisterSet(), mmu);

    const result = [];
    for (let address = 0; address < TWO_POW_SIXTEEN;) {
        try {
            const disassembled = cpu.disassembleInstruction(address);
            result.push(disassembled);
            address += disassembled.instruction.getLength();
        } catch {
            address++;
        }
    }
    return new RomDisassemblerOutput(result);
}