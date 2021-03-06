import { GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbRegisterArg } from "../../gb-instruction";
import { initialize } from "../utils/test-utils";
import { PushInstruction } from "./push";

describe("push", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should stack the current PC, and apply new value to PC", () => {
        const R1S = [
            new GbRegisterArg(RegisterName.BC), new GbRegisterArg(RegisterName.DE),
            new GbRegisterArg(RegisterName.HL), new GbRegisterArg(RegisterName.AF),
        ];

        R1S.forEach((r1) => {
            const opcode = randomInteger(0x0, 0x100);
            const instruction = new PushInstruction(opcode, r1);

            expect(instruction.getOpcode()).toEqual(opcode);
            expect(instruction.getLength()).toEqual(1);

            const r1Value = r1.getValue(rs, mmu, []);
            const sp = rs.sp.getValue();
            const expectedSp = (sp - 2) & SIXTEEN_ONE_BITS;

            const zeroFlag = rs.getZeroFlag();
            const operationFlag = rs.getOperationFlag();
            const halfCarryFlag = rs.getHalfCarryFlag();
            const carryFlag = rs.getCarryFlag();
            const cycleCount = instruction.run(rs, mmu, []);

            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(mmu.readWord(rs.sp.getValue())).toEqual(r1Value);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(4);
        });
    });
});
