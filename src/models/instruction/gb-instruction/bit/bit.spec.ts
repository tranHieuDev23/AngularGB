import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { BitInstruction } from "./bit";
import { GbMemArg, GbRegisterArg } from "../../gb-instruction";

describe("bit", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should copy complement bit value to the Zero flag", () => {
        const R1S = [0, 1, 2, 3, 4, 5, 6, 7];
        const R2S = [
            ...REGISTERS_8_BIT.filter(item => {
                return item !== RegisterName.F;
            }).map(item => {
                return new GbRegisterArg(item);
            }),
            new GbMemArg(new GbRegisterArg(RegisterName.HL))
        ];

        R1S.forEach((r1) => {
            R2S.forEach((r2) => {
                const opcode = randomInteger(0x0, 0x100);
                const instruction = new BitInstruction(opcode, r1, r2);

                expect(instruction.getOpcode()).toEqual(opcode);
                expect(instruction.getLength()).toEqual(2);

                const r2Value = randomInteger(0, TWO_POW_EIGHT);
                const carryFlag = rs.getCarryFlag();
                r2.setValue(rs, mmu, [], r2Value);
                const cycleCount = instruction.run(rs, mmu, []);

                expect(rs.getZeroFlag()).toEqual(((r2Value >> r1) & 1) ^ 1);
                expect(rs.getOperationFlag()).toEqual(0);
                expect(rs.getHalfCarryFlag()).toEqual(1);
                expect(rs.getCarryFlag()).toEqual(carryFlag);
                expect(cycleCount).toEqual(r2 instanceof GbRegisterArg ? 2 : 4);
            });
        });
    });
});
