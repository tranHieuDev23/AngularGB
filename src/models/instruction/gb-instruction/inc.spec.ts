import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_16_BIT, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbMemArg, GbRegisterArg } from "../gb-instruction";
import { Inc16BitInstruction, Inc8BitInstruction } from "./inc";
import { initialize } from "./utils/test-utils";

describe('inc', () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it('should work with 8-bit registers', () => {
        REGISTERS_8_BIT.filter(item => item !== RegisterName.F).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_EIGHT);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Inc8BitInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);
            expect(instruction.getCycleCount()).toEqual(1);

            const carryFlag = rs.getCarryFlag();
            const expectedResult = (registerValue + 1) & EIGHT_ONE_BITS;
            const halfCarry = (((registerValue & 0xf) + 1) & 0x10) === 0x10;
            instruction.run(rs, mmu, []);
            expect(registerArg.getValue(rs, mmu, [])).toEqual(expectedResult);
            expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
        });
    });

    it('should work with memory argument', () => {
        const opCode = randomInteger(0x00, 0x100);
        const memArg = new GbMemArg(new GbRegisterArg(RegisterName.HL));
        const memValue = randomInteger(0, TWO_POW_EIGHT);
        memArg.setValue(rs, mmu, [], memValue);
        const instruction = new Inc8BitInstruction(opCode, memArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(1);
        expect(instruction.getCycleCount()).toEqual(3);

        const carryFlag = rs.getCarryFlag();
        const expectedResult = (memValue + 1) & EIGHT_ONE_BITS;
        const halfCarry = (((memValue & 0xf) + 1) & 0x10) === 0x10;
        instruction.run(rs, mmu, []);
        expect(memArg.getValue(rs, mmu, [])).toEqual(expectedResult);
        expect(rs.getZeroFlag()).toEqual(expectedResult === 0 ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
    });

    it('should work with 16-bit registers', () => {
        REGISTERS_16_BIT.filter(item => {
            return item !== RegisterName.AF && item !== RegisterName.PC;
        }).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_SIXTEEN);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Inc16BitInstruction(opCode, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);
            expect(instruction.getCycleCount()).toEqual(2);

            const zeroFlag = rs.getZeroFlag();
            const operationFlag = rs.getOperationFlag();
            const halfCarryFlag = rs.getHalfCarryFlag();
            const carryFlag = rs.getCarryFlag();

            const expectedResult = (registerValue + 1) & SIXTEEN_ONE_BITS;
            instruction.run(rs, mmu, []);

            expect(registerArg.getValue(rs, mmu, [])).toEqual(expectedResult);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCarryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
        });
    });
});