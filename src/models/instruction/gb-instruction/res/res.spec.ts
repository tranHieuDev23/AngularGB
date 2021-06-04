import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { ResInstruction } from "./res";
import { GbMemArg, GbRegisterArg } from "../../gb-instruction";

describe("res", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should reset bit value to 0", () => {
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
                const instruction = new ResInstruction(opcode, r1, r2);

                expect(instruction.getOpcode()).toEqual(opcode);
                expect(instruction.getLength()).toEqual(2);

                const r2Value = randomInteger(0, TWO_POW_EIGHT);
                const expectedR2Value = r2Value & (EIGHT_ONE_BITS ^ (1 << r1));
                const zeroFlag = rs.getZeroFlag();
                const operationFlag = rs.getOperationFlag();
                const halfCarryFlag = rs.getHalfCarryFlag();
                const carryFlag = rs.getCarryFlag();
                r2.setValue(rs, mmu, [], r2Value);
                const cycleCount = instruction.run(rs, mmu, []);

                expect(r2.getValue(rs, mmu, [])).toEqual(expectedR2Value);
                expect(rs.getZeroFlag()).toEqual(zeroFlag);
                expect(rs.getOperationFlag()).toEqual(operationFlag);
                expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
                expect(rs.getCarryFlag()).toEqual(carryFlag);
                expect(cycleCount).toEqual(r2 instanceof GbRegisterArg ? 2 : 4);
            });
        });
    });
});
