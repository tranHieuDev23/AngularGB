import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { GbInstruction } from "../instruction/gb-instruction";
import { GB_0XCB_INSTRUCTION_SET, GB_INSTRUCTION_SET } from "../instruction/gb-instruction-set";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { InstructionNotImplemented } from "./cpu-errors";
import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";

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

const ISR_ADDRESSES = [
    0x40, , 0x48, 0x50, 0x58, 0x60
];

export class GbCpu {
    private readonly interrupts: GbInterrupts;

    constructor(
        private readonly rs: GbRegisterSet,
        private readonly mmu: GbMmu
    ) {
        this.interrupts = new GbInterrupts(mmu);
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

    public step(): GbCpuStepInfo {
        let cycleCount = 0;
        const interruptId = this.checkForInterrupt();
        if (interruptId !== null) {
            this.transferToIsr(interruptId);
            cycleCount += 5;
        }

        const pc = this.rs.pc.getValue();
        const disassembled = this.disassembleInstruction(pc);
        this.rs.pc.setValue(pc + disassembled.instruction.getLength());

        cycleCount += disassembled.instruction.run(this.rs, this.mmu, disassembled.args);
        return new GbCpuStepInfo(
            disassembled, cycleCount
        );
    }

    private checkForInterrupt(): number {
        if (!this.rs.getIme()) {
            return null;
        }
        for (let i = 0; i < 5; i++) {
            const enabled = this.interrupts.getInterruptEnable(i);
            if (enabled === 0) {
                continue;
            }
            const flag = this.interrupts.getInterruptFlag(i);
            if (flag === 0) {
                continue;
            }
            return i;
        }
        return null;
    }

    private transferToIsr(interruptId: number): void {
        this.interrupts.setInterruptFlag(interruptId, 0);
        this.rs.setIme(false);
        this.rs.sp.setValue((this.rs.sp.getValue() - 2) & SIXTEEN_ONE_BITS);
        const sp = this.rs.sp.getValue();
        this.mmu.writeWord(sp, this.rs.pc.getValue());
        this.rs.pc.setValue(ISR_ADDRESSES[interruptId]);
    }
}
