import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EiInstruction } from "./ei";
import { initialize } from "../utils/test-utils";

describe("ei", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new EiInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0xfb);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should flip the carry flag", () => {
        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCarryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.getIme()).toBeTrue();
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(1);
    });
});
