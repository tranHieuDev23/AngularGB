import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { ScfInstruction } from "./scf";
import { initialize } from "../utils/test-utils";

describe("scf", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new ScfInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x37);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should set the carry flag to 1", () => {
        const zeroFlag = rs.getZeroFlag();

        const cycleCount = instruction.run(rs, mmu, []);
        expect(cycleCount).toEqual(1);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(0);
        expect(rs.getCarryFlag()).toEqual(1);
    });
});
