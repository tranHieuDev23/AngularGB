import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { initialize } from "../utils/test-utils";
import { Gb1fInstruction, RrInstruction } from "./rr";
import { GbMemArg, GbRegisterArg } from "../../gb-instruction";

describe("rr", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

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
            const instruction = new RrInstruction(opcode, r1);

            expect(instruction.getOpcode()).toEqual(opcode);
            expect(instruction.getLength()).toEqual(2);

            const r1Value = randomInteger(0, TWO_POW_EIGHT);
            const carryFlag = rs.getCarryFlag();
            r1.setValue(rs, mmu, [], r1Value);
            const r1Bit0 = r1Value & 1;
            const expectedR1 = ((r1Value >> 1) & EIGHT_ONE_BITS) | (carryFlag << 7);
            const cycleCount = instruction.run(rs, mmu, []);

            expect(r1.getValue(rs, mmu, [])).toEqual(expectedR1);
            expect(rs.getZeroFlag()).toEqual(expectedR1 === 0 ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(0);
            expect(rs.getCarryFlag()).toEqual(r1Bit0);
            expect(cycleCount).toEqual(r1 instanceof GbRegisterArg ? 2 : 4);
        });
    });

    it("0x1f", () => {
        const instruction = new Gb1fInstruction();

        expect(instruction.getOpcode()).toEqual(0x1f);
        expect(instruction.getLength()).toEqual(1);

        const a = rs.a.getValue();
        const carryFlag = rs.getCarryFlag();
        const r1Bit0 = rs.a.getBit(0);
        const expectedA = ((a >> 1) & EIGHT_ONE_BITS) | (carryFlag << 7);
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.a.getValue()).toEqual(expectedA);
        expect(rs.getZeroFlag()).toEqual(0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(0);
        expect(rs.getCarryFlag()).toEqual(r1Bit0);
        expect(cycleCount).toEqual(1);
    });
});
