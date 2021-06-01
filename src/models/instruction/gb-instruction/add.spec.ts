import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_16_BIT, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbRegisterArg, GbMemArg, Gb8BitArg } from "../gb-instruction";
import { Add16BitRegisterInstruction, Add8BitInstruction, GbE8Instruction } from "./add";
import { add16Bit, add8Bit, toSigned8Bit } from "./utils/arithmetic-utils";
import { initialize } from "./utils/test-utils";

describe("add", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    const registerArgA = new GbRegisterArg(RegisterName.A);
    const registerArgHl = new GbRegisterArg(RegisterName.HL);

    it("should work with 8-bit registers", () => {
        REGISTERS_8_BIT.filter(item => item !== RegisterName.F).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_EIGHT);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Add8BitInstruction(opCode, registerArgA, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);
            expect(instruction.getCycleCount()).toEqual(1);

            const expectedResult = add8Bit(rs.a.getValue(), registerValue);
            instruction.run(rs, mmu, []);
            expect(rs.a.getValue()).toEqual(expectedResult.result);
            expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
        });
    });

    it("should work with memory argument", () => {
        const opCode = randomInteger(0x00, 0x100);
        const memArg = new GbMemArg(new GbRegisterArg(RegisterName.HL));
        const memValue = randomInteger(0, TWO_POW_EIGHT);
        memArg.setValue(rs, mmu, [], memValue);
        const instruction = new Add8BitInstruction(opCode, registerArgA, memArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(1);
        expect(instruction.getCycleCount()).toEqual(2);

        const expectedResult = add8Bit(rs.a.getValue(), memValue);
        instruction.run(rs, mmu, []);
        expect(rs.a.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
    });

    it("should work with 8-bit value", () => {
        const opCode = randomInteger(0x00, 0x100);
        const byteArg = new Gb8BitArg(0);
        const byteValue = randomInteger(0, TWO_POW_EIGHT);
        const instruction = new Add8BitInstruction(opCode, registerArgA, byteArg);

        expect(instruction.getOpcode()).toEqual(opCode);
        expect(instruction.getLength()).toEqual(2);
        expect(instruction.getCycleCount()).toEqual(2);

        const expectedResult = add8Bit(rs.a.getValue(), byteValue);
        instruction.run(rs, mmu, [byteValue]);
        expect(rs.a.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(expectedResult.zero ? 1 : 0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
    });

    it("should work with two 16-bit registers", () => {
        REGISTERS_16_BIT.filter(item => {
            return item !== RegisterName.AF && item !== RegisterName.PC;
        }).forEach(registerName => {
            const opCode = randomInteger(0x00, 0x100);
            const registerArg = new GbRegisterArg(registerName);
            const registerValue = randomInteger(0, TWO_POW_SIXTEEN);
            registerArg.setValue(rs, mmu, [], registerValue);
            const instruction = new Add16BitRegisterInstruction(opCode, registerArgHl, registerArg);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);
            expect(instruction.getCycleCount()).toEqual(2);

            const zeroFlag = rs.getZeroFlag();
            const expectedResult = add16Bit(rs.hl.getValue(), registerValue);
            instruction.run(rs, mmu, []);
            expect(rs.hl.getValue()).toEqual(expectedResult.result);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(0);
            expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
            expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
        });
    });

    it("0xe8", () => {
        const spValue = randomInteger(0, TWO_POW_SIXTEEN);
        rs.sp.setValue(spValue);
        const byteValue = randomInteger(0, TWO_POW_EIGHT);
        const instruction = new GbE8Instruction();

        expect(instruction.getOpcode()).toEqual(0xe8);
        expect(instruction.getLength()).toEqual(2);
        expect(instruction.getCycleCount()).toEqual(4);

        const expectedResult = add16Bit(spValue, toSigned8Bit(byteValue));
        instruction.run(rs, mmu, [byteValue]);
        expect(rs.sp.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);

    });
});
