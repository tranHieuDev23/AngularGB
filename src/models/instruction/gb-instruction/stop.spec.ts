import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { StopInstruction } from "./stop";

describe("stop", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        rs.getAllRegister().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
    });

    const instruction = new StopInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x10);
        expect(instruction.getLength()).toEqual(2);
    });

    it("should do nothing", () => {
        const cycleCount = instruction.run(rs, mmu, []);
        rs.getAllRegister().forEach(item => {
            expect(item.getValue()).toEqual(0);
        });
        expect(cycleCount).toEqual(1);
    });
});
