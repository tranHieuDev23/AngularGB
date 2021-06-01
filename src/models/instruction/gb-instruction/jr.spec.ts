import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { JrInstruction } from "./jr";
import { initialize } from "./utils/test-utils";

describe("jr", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should jump PC by signed 8-bit argument", () => {
        const instruction = new JrInstruction();

        expect(instruction.getOpcode()).toEqual(0x18);
        expect(instruction.getLength()).toEqual(2);

        const pc = randomInteger(0, TWO_POW_SIXTEEN);
        const s8 = randomInteger(0, TWO_POW_EIGHT);
        const expectedPc = (s8 < (1 << 7) ? pc + s8 : pc + s8 - 512) & SIXTEEN_ONE_BITS;
        rs.pc.setValue(pc);

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, [s8]);

        expect(rs.pc.getValue()).toEqual(expectedPc);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(3);

    });
});