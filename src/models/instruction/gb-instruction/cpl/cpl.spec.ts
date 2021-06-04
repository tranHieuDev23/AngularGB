import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS } from "src/utils/constants";
import { CplInstruction } from "./cpl";
import { initialize } from "../utils/test-utils";

describe("cpl", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const instruction = new CplInstruction();

    it("should have correct properties", () => {
        expect(instruction.getOpcode()).toEqual(0x2f);
        expect(instruction.getLength()).toEqual(1);
    });

    it("should flip the carry flag", () => {
        const a = rs.a.getValue();
        const zeroFlag = rs.getZeroFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(a ^ rs.a.getValue()).toEqual(EIGHT_ONE_BITS);
        expect(cycleCount).toEqual(1);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(1);
        expect(rs.getHalfCarryFlag()).toEqual(1);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
    });
});
