import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { NopInstruction } from "./nop";

describe("nop", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        rs.getAllRegisters().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
    });

    const instruction = new NopInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x00);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should do nothing", () => {
        const cycleCount = instruction.run(rs, mmu, []);
        rs.getAllRegisters().forEach(item => {
            expect(item.getValue()).toEqual(0);
        });
        expect(cycleCount).toEqual(1);
    });
});
