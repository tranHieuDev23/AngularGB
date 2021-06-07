import { GB_0XCB_INSTRUCTION_SET, GB_INSTRUCTION_SET } from "../instruction/gb-instruction-set";
import { GbMmu } from "../mmu/gb-mmu";
import { GbRegisterSet } from "../register/gb-registers";
import { InstructionNotImplemented } from "./cpu-errors";

export class GbCpu {
    constructor(
        public readonly rs: GbRegisterSet,
        public readonly mmu: GbMmu
    ) {
        rs.getAllRegisters().forEach(item => {
            item.setValue(0);
        });
        mmu.reset();
    }

    public step(): number {
        let pc = this.rs.getPc().getValue();
        this.rs.getPc().setValue(pc + 1);
        let opCode = this.mmu.readByte(pc);
        let instruction = null;
        if (opCode === 0xcb) {
            pc = this.rs.getPc().getValue();
            this.rs.getPc().setValue(pc + 1);
            opCode = this.mmu.readByte(pc);
            instruction = GB_0XCB_INSTRUCTION_SET[opCode];
        } else {
            instruction = GB_INSTRUCTION_SET[opCode];
        }
        if (!instruction) {
            throw new InstructionNotImplemented(opCode);
        }
        const args: number[] = [];
        for (let i = 1; i < instruction.getLength(); i++) {
            pc = this.rs.getPc().getValue();
            this.rs.getPc().setValue(pc + 1);
            args.push(this.mmu.readByte(pc));
        }
        const cycleCount = instruction.run(this.rs, this.mmu, args);
        return cycleCount;
    }
}
