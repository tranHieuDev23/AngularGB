import { GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, TWO_POW_EIGHT } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb8BitArg, GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { AdcInstruction } from "./adc";
import { initialize } from "../utils/test-utils";

describe("adc", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should work with 8-bit registers", () => {
        REGISTERS_8_BIT.forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_EIGHT);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new AdcInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);

            const a = rs.a.getValue();
            const carryFlag = rs.getCarryFlag();
            const fullResult = (a + (registerValue + carryFlag));
            const expectedResult = fullResult & EIGHT_ONE_BITS;
            const halfCarry = ((a ^ registerValue ^ expectedResult) & 0x10) !== 0;
            const carry = fullResult >= TWO_POW_EIGHT;
            const cycleCount = instruction.run(rs, mmu, []);

            expect(rs.a.getValue()).toEqual(expectedResult);
            expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(carry ? 1 : 0);
            expect(cycleCount).toEqual(2);
        });
    });

    it("should work with memory argument", () => {
        const opCode = randomInteger(0x00, 0x100);
        const memArg = new GbMemArg(new GbRegisterArg(RegisterName.HL));
        const memValue = randomInteger(0, TWO_POW_EIGHT);
        memArg.setValue(rs, mmu, [], memValue);
        const instruction = new AdcInstruction(opCode, memArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(1);

        const a = rs.a.getValue();
        const carryFlag = rs.getCarryFlag();
        const fullResult = (a + (memValue + carryFlag));
        const expectedResult = fullResult & EIGHT_ONE_BITS;
        const halfCarry = ((a ^ memValue ^ expectedResult) & 0x10) !== 0;
        const carry = fullResult >= TWO_POW_EIGHT;
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.a.getValue()).toEqual(expectedResult);
        expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(carry ? 1 : 0);
        expect(cycleCount).toEqual(2);
    });

    it("should work with 8-bit value", () => {
        const opCode = randomInteger(0x00, 0x100);
        const byteArg = new Gb8BitArg();
        const byteValue = randomInteger(0, TWO_POW_EIGHT);
        const instruction = new AdcInstruction(opCode, byteArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(2);

        const a = rs.a.getValue();
        const carryFlag = rs.getCarryFlag();
        const fullResult = (a + (byteValue + carryFlag));
        const expectedResult = fullResult & EIGHT_ONE_BITS;
        const halfCarry = ((a ^ byteValue ^ expectedResult) & 0x10) !== 0;
        const carry = fullResult >= TWO_POW_EIGHT;
        const cycleCount = instruction.run(rs, mmu, [byteValue]);

        expect(rs.a.getValue()).toEqual(expectedResult);
        expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(carry ? 1 : 0);
        expect(cycleCount).toEqual(2);
    });
});
