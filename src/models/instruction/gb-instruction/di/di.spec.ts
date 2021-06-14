import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { DiInstruction } from "./di";
import { initialize } from "../utils/test-utils";

describe("di", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new DiInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0xf3);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should set IME to false immediately", () => {
        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCarryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.getIme()).toBeFalse();
        expect(rs.getNextIme()).toBeFalse();
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(1);
    });
});
