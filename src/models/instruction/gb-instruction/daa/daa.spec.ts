import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { DaaInstruction } from "./daa";
import { initialize } from "../utils/test-utils";

describe("daa", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new DaaInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x27);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should convert A to BCD number", () => {
        const operationFlag = rs.getOperationFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(cycleCount).toEqual(1);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(0);
    });
});
