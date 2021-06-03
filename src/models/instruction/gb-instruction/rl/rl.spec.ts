import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { Gb17Instruction, RlInstruction } from "./rl";
import { GbMemArg, GbRegisterArg } from "../../gb-instruction";

describe("rlc", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("0xcb variants", () => {
        const R1S = [
            ...REGISTERS_8_BIT.filter(item => {
                return item !== RegisterName.F;
            }).map(item => {
                return new GbRegisterArg(item);
            }),
            new GbMemArg(new GbRegisterArg(RegisterName.HL))
        ];

        R1S.forEach((r1) => {
            const opcode = randomInteger(0x0, 0x100);
            const instruction = new RlInstruction(opcode, r1);

            expect(instruction.getOpcode()).toEqual(opcode);
            expect(instruction.getLength()).toEqual(2);

            const r1Value = randomInteger(0, TWO_POW_EIGHT);
            const carryFlag = randomInteger(0, 2);
            r1.setValue(rs, mmu, [], r1Value);
            rs.setCarryFlag(carryFlag);
            const r1Bit7 = (r1Value >> 7) & 1;
            const expectedR1 = ((r1Value << 1) & EIGHT_ONE_BITS) | carryFlag;
            const cycleCount = instruction.run(rs, mmu, []);

            expect(r1.getValue(rs, mmu, [])).toEqual(expectedR1);
            expect(rs.getZeroFlag()).toEqual(expectedR1 === 0 ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(0);
            expect(rs.getCarryFlag()).toEqual(r1Bit7);
            expect(cycleCount).toEqual(r1 instanceof GbRegisterArg ? 2 : 4);
        });
    });

    it("0x17", () => {
        const instruction = new Gb17Instruction();

        expect(instruction.getOpcode()).toEqual(0x17);
        expect(instruction.getLength()).toEqual(1);


        const a = randomInteger(0, TWO_POW_EIGHT);
        const carryFlag = randomInteger(0, 2);
        rs.a.setValue(a);
        rs.setCarryFlag(carryFlag);
        const r1Bit7 = rs.a.getBit(7);
        const expectedA = ((a << 1) & EIGHT_ONE_BITS) | carryFlag;
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.a.getValue()).toEqual(expectedA);
        expect(rs.getZeroFlag()).toEqual(0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(0);
        expect(rs.getCarryFlag()).toEqual(r1Bit7);
        expect(cycleCount).toEqual(1);
    });
});
