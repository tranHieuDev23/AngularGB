import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../instruction/gb-instruction";
import { GB_0XCB_INSTRUCTION_SET, GB_INSTRUCTION_SET } from "../instruction/gb-instruction-set";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { InstructionNotImplemented } from "./cpu-errors";

export class GbDisassembledInstruction {
    public readonly instructionName: string;

    constructor(
        public readonly address: number,
        public readonly opcode: number,
        public readonly instruction: GbInstruction,
        public readonly args: number[]
    ) {
        this.instructionName = instruction.getName();
    }
}

export class GbCpuStepInfo {
    constructor(
        public readonly instruction: GbDisassembledInstruction,
        public readonly cycleCount: number
    ) { }
}

export class GbCpu {
    constructor(
        private readonly rs: GbRegisterSet,
        private readonly mmu: GbMmu
    ) {
        rs.getAllRegisters().forEach(item => {
            item.setValue(0);
        });
        mmu.reset();
    }

    public disassembleInstruction(address: number): GbDisassembledInstruction {
        const startAddress = address;
        let opcode = this.mmu.readByte(address);
        address = (address + 1) & SIXTEEN_ONE_BITS;
        let instruction = null;
        let argStart = null;
        if (opcode === 0xcb) {
            const opCodeByte2 = this.mmu.readByte(address);
            address = (address + 1) & SIXTEEN_ONE_BITS;
            opcode = (opcode << 8) | opCodeByte2;
            instruction = GB_0XCB_INSTRUCTION_SET[opCodeByte2];
            argStart = 2;
        } else {
            instruction = GB_INSTRUCTION_SET[opcode];
            argStart = 1;
        }
        if (!instruction) {
            throw new InstructionNotImplemented(opcode);
        }
        const args: number[] = [];
        for (let i = argStart; i < instruction.getLength(); i++) {
            args.push(this.mmu.readByte(address));
            address = (address + 1) & SIXTEEN_ONE_BITS;
        }
        return new GbDisassembledInstruction(
            startAddress, opcode, instruction, args
        );
    }

    public runInstruction(disassembled: GbDisassembledInstruction): void {
        const pc = this.rs.pc.getValue();
        const { instruction, args } = disassembled;
        this.rs.pc.setValue(pc + instruction.getLength());
        instruction.run(this.rs, this.mmu, args);
    }
}
