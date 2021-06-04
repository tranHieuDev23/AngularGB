import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { HaltInstruction } from "./halt";

describe("halt", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        rs.getAllRegisters().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
    });

    const instruction = new HaltInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x76);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should do nothing", () => {
        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);
        rs.getAllRegisters().forEach(item => {
            expect(item.getValue()).toEqual(0);
        });

        expect(cycleCount).toEqual(1);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
    });
});
