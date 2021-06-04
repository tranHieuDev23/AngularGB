import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { initialize } from "../utils/test-utils";
import { RetiInstruction } from "./reti";

describe("reti", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should return PC to the address before memory[SP], then increase SP by 2", () => {
        const instruction = new RetiInstruction();

        expect(instruction.getOpcode()).toEqual(0xd9);
        expect(instruction.getLength()).toEqual(1);

        const sp = rs.sp.getValue();
        const memSp = mmu.readWord(sp);
        const expectedSp = (sp + 2) & SIXTEEN_ONE_BITS;
        const expectedPc = (memSp - 1) & SIXTEEN_ONE_BITS;

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.pc.getValue()).toEqual(expectedPc);
        expect(rs.sp.getValue()).toEqual(expectedSp);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(4);
        expect(rs.getIme()).toEqual(true);
    });
});
