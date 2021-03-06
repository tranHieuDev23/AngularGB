import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_16_BIT, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbMemArg, GbRegisterArg } from "../../gb-instruction";
import { Dec16BitInstruction, Dec8BitInstruction } from "./dec";
import { initialize } from "../utils/test-utils";

describe("dec", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should work with 8-bit registers", () => {
        REGISTERS_8_BIT.filter(item => item !== RegisterName.F).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_EIGHT);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Dec8BitInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);

            const carryFlag = rs.getCarryFlag();
            const expectedResult = (registerValue - 1) & EIGHT_ONE_BITS;
            const halfCarry = (((registerValue & 0xf) - 1) & 0x10) === 0x10;
            const cycleCount = instruction.run(rs, mmu, []);

            expect(registerArg.getValue(rs, mmu, [])).toEqual(expectedResult);
            expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(1);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(1);
        });
    });

    it("should work with memory argument", () => {
        const opCode = randomInteger(0x00, 0x100);
        const memArg = new GbMemArg(new GbRegisterArg(RegisterName.HL));
        const memValue = randomInteger(0, TWO_POW_EIGHT);
        memArg.setValue(rs, mmu, [], memValue);
        const instruction = new Dec8BitInstruction(opCode, memArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(1);

        const carryFlag = rs.getCarryFlag();
        const expectedResult = (memValue - 1) & EIGHT_ONE_BITS;
        const halfCarry = (((memValue & 0xf) - 1) & 0x10) === 0x10;
        const cycleCount = instruction.run(rs, mmu, []);

        expect(memArg.getValue(rs, mmu, [])).toEqual(expectedResult);
        expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(1);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(3);
    });

    it("should work with 16-bit registers", () => {
        REGISTERS_16_BIT.filter(item => {
            return item !== RegisterName.AF && item !== RegisterName.PC;
        }).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_SIXTEEN);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Dec16BitInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);

            const zeroFlag = rs.getZeroFlag();
            const operationFlag = rs.getOperationFlag();
            const halfCarryFlag = rs.getHalfCarryFlag();
            const carryFlag = rs.getCarryFlag();
            const expectedResult = (registerValue - 1) & SIXTEEN_ONE_BITS;
            const cycleCount = instruction.run(rs, mmu, []);

            expect(registerArg.getValue(rs, mmu, [])).toEqual(expectedResult);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(2);
        });
    });
});
