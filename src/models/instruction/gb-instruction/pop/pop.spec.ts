import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbRegisterArg } from "../../gb-instruction";
import { initialize } from "../utils/test-utils";
import { PopInstruction } from "./pop";

describe("pop", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should stack the current PC, and apply new value to PC", () => {
        const REGISTERS = [
            RegisterName.BC, RegisterName.DE,
            RegisterName.HL, RegisterName.AF,
        ];

        REGISTERS.forEach((register) => {
            const r1 = new GbRegisterArg(register);
            const opcode = randomInteger(0x0, 0x100);
            const instruction = new PopInstruction(opcode, r1);

            expect(instruction.getOpcode()).toEqual(opcode);
            expect(instruction.getLength()).toEqual(1);

            let r1Value = randomInteger(0, TWO_POW_SIXTEEN - 2);
            if (register === RegisterName.AF) {
                r1Value &= 0xfff0;
            }
            const sp = rs.sp.getValue();
            mmu.writeWord(sp, r1Value);
            const expectedSp = (sp + 2) & SIXTEEN_ONE_BITS;
            const cycleCount = instruction.run(rs, mmu, []);

            expect(r1.getValue(rs, mmu, [])).toEqual(r1Value);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(cycleCount).toEqual(3);
        });
    });
});
