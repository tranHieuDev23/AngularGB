import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { RstInstruction } from "./rst";

describe("rst", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should stack the current PC, and apply new value to PC", () => {
        const R1S = [0x00, 0x08, 0x10, 0x18, 0x20, 0x28, 0x30, 0x38];

        R1S.forEach((r1) => {
            const opcode = randomInteger(0x0, 0x100);
            const instruction = new RstInstruction(opcode, r1);

            expect(instruction.getOpcode()).toEqual(opcode);
            expect(instruction.getLength()).toEqual(1);

            const pc = randomInteger(0, TWO_POW_SIXTEEN - 2);
            const sp = randomInteger(0, TWO_POW_SIXTEEN - 2);
            rs.pc.setValue(pc);
            rs.sp.setValue(sp);
            const expectedPc = (r1 - 1) & SIXTEEN_ONE_BITS;
            const expectedSp = (sp - 2) & SIXTEEN_ONE_BITS;

            const zeroFlag = rs.getZeroFlag();
            const operationFlag = rs.getOperationFlag();
            const halfCarryFlag = rs.getHalfCarryFlag();
            const carryFlag = rs.getCarryFlag();
            const cycleCount = instruction.run(rs, mmu, []);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(mmu.readWord(rs.sp.getValue())).toEqual(pc);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(4);
        });
    });
});