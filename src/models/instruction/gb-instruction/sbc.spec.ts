import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb8BitArg, GbMemArg, GbRegisterArg } from "../gb-instruction";
import { SbcInstruction } from "./sbc";
import { subtract8Bit } from "./utils/arithmetic-utils";
import { initialize } from "./utils/test-utils";

describe("sbc", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should work with 8-bit registers", () => {
        REGISTERS_8_BIT.forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_EIGHT);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new SbcInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);

            const carryFlag = rs.getCarryFlag();
            const expectedResult = subtract8Bit(rs.a.getValue(), registerValue + carryFlag);
            const cycleCount = instruction.run(rs, mmu, []);

            expect(rs.a.getValue()).toEqual(expectedResult.result);
            expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(1);
            expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
            expect(cycleCount).toEqual(1);
        });
    });

    it("should work with memory argument", () => {
        const opCode = randomInteger(0x00, 0x100);
        const memArg = new GbMemArg(new GbRegisterArg(RegisterName.HL));
        const memValue = randomInteger(0, TWO_POW_EIGHT);
        memArg.setValue(rs, mmu, [], memValue);
        const instruction = new SbcInstruction(opCode, memArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(1);

        const carryFlag = rs.getCarryFlag();
        const expectedResult = subtract8Bit(rs.a.getValue(), memValue + carryFlag);
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.a.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(1);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
        expect(cycleCount).toEqual(2);
    });

    it("should work with 8-bit value", () => {
        const opCode = randomInteger(0x00, 0x100);
        const byteArg = new Gb8BitArg(0);
        const byteValue = randomInteger(0, TWO_POW_EIGHT);
        const instruction = new SbcInstruction(opCode, byteArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(2);

        const carryFlag = rs.getCarryFlag();
        const expectedResult = subtract8Bit(rs.a.getValue(), byteValue + carryFlag);
        const cycleCount = instruction.run(rs, mmu, [byteValue]);

        expect(rs.a.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(1);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
        expect(cycleCount).toEqual(2);
    });
});
