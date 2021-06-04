import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { RstInstruction } from "./rst";

describe("rst", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

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

            const pc = rs.pc.getValue();
            const sp = rs.sp.getValue();
            const expectedPc = r1;
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
