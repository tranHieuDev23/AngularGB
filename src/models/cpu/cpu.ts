import { Instruction } from "../instruction/instruction";
import { Mmu } from "../mmu/mmu";
import { RegisterSet } from "../register/register";
import { InstructionNotImplemented } from "./cpu-errors";

export class Cpu<RS extends RegisterSet, MMU extends Mmu> {
    private readonly opCode2Instruction = new Map<number, Instruction<RS, MMU>>();
    private cycleCount: number = 0;

    constructor(
        public readonly rs: RS,
        public readonly mmu: MMU,
        public readonly instructionList: Instruction<RS, MMU>[]
    ) {
        rs.getAllRegisters().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
        instructionList.forEach(item => {
            this.opCode2Instruction.set(item.getOpcode(), item);
        });
    }

    public getCycleCount(): number {
        return this.cycleCount;
    }

    public step(): void {
        let pc = this.rs.getPc().getValue();
        const opCode = this.mmu.readByte(pc);
        const instruction = this.opCode2Instruction.get(opCode);
        if (!instruction) {
            throw new InstructionNotImplemented(opCode);
        }
        const args: number[] = [];
        for (let i = 1; i < instruction.getLength(); i++) {
            this.rs.getPc().setValue(pc + 1);
            pc = this.rs.getPc().getValue();
            args.push(this.mmu.readByte(pc));
        }
        const cycleCount = instruction.run(this.rs, this.mmu, args);
        this.rs.getPc().setValue(pc + 1);
        this.cycleCount += cycleCount;
    }
}
