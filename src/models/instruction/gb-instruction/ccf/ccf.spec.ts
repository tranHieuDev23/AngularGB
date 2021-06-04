import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { CcfInstruction } from "./ccf";
import { initialize } from "../utils/test-utils";

describe("ccf", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new CcfInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x3f);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should flip the carry flag", () => {
        const zeroFlag = rs.getZeroFlag();
        const carryFlag = rs.getCarryFlag();

        const cycleCount = instruction.run(rs, mmu, []);
        expect(cycleCount).toEqual(1);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(0);
        expect(rs.getCarryFlag()).toEqual(carryFlag ^ 1);
    });
});
