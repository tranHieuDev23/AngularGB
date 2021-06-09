import { GbMmu, GbTestMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet, RegisterName, REGISTERS_8_BIT } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb8BitArg, Gb16BitDecArg, Gb16BitIncArg, GbMemArg, GbRegisterArg, Gb16BitArg } from "../../gb-instruction";
import { GbF8Instruction, LdInstruction } from "./ld";
import { add16Bit, toSigned8Bit } from "../../../../utils/arithmetic-utils";
import { initialize } from "../utils/test-utils";

describe("ld", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();
    const args = [0, 0];

    beforeEach(() => {
        initialize(rs, mmu);
        for (let i = 0; i < args.length; i++) {
            args[i] = randomInteger(0, TWO_POW_EIGHT);
        }
    });

    it("should work between simple 8-bit data sources", () => {
        const SIMPLE_R1S = [
            ...REGISTERS_8_BIT.filter(item => {
                return item !== RegisterName.F;
            }).map(item => {
                return new GbRegisterArg(item);
            }),
            ...[
                RegisterName.BC, RegisterName.DE, RegisterName.HL
            ].map(item => {
                return new GbMemArg(new GbRegisterArg(item));
            }),
            new GbMemArg(new Gb8BitArg(0)),
            new GbMemArg(new Gb16BitArg(0)),
            new GbMemArg(new GbRegisterArg(RegisterName.C))
        ];
        const SIMPLE_R2S = [...SIMPLE_R1S, new Gb8BitArg(0)];

        SIMPLE_R1S.forEach(r1 => {
            SIMPLE_R2S.forEach(r2 => {
                if (r1 === r2) {
                    return;
                }
                const r1Value = randomInteger(0, TWO_POW_EIGHT);
                r1.setValue(rs, mmu, args, r1Value);

                const opcode = randomInteger(0x0, 0x100);
                const cycleCount = randomInteger(0, 5);
                const r2Value = randomInteger(0, TWO_POW_EIGHT);
                if (r2 instanceof Gb8BitArg) {
                    args[0] = r2Value;
                } else {
                    r2.setValue(rs, mmu, args, r2Value);
                }
                const instruction = new LdInstruction(opcode, cycleCount, r1, r2);

                expect(instruction.getOpcode()).toEqual(opcode);

                const zeroFlag = rs.getZeroFlag();
                const operationFlag = rs.getOperationFlag();
                const halfCaryFlag = rs.getHalfCarryFlag();
                const carryFlag = rs.getCarryFlag();
                const cycleCountResult = instruction.run(rs, mmu, args);

                expect(r1.getValue(rs, mmu, args)).toEqual(r2Value);
                expect(rs.getZeroFlag()).toEqual(zeroFlag);
                expect(rs.getOperationFlag()).toEqual(operationFlag);
                expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
                expect(rs.getCarryFlag()).toEqual(carryFlag);
                expect(cycleCountResult).toEqual(cycleCount);
            });
        });
    });

    const registerArgA = new GbRegisterArg(RegisterName.A);
    const registerArgHl = new GbRegisterArg(RegisterName.HL);
    const registerArgHlInc = new GbMemArg(new Gb16BitIncArg(registerArgHl));
    const registerArgHlDec = new GbMemArg(new Gb16BitDecArg(registerArgHl));

    it("ld (HL+) A", () => {
        const hlValue = rs.hl.getValue();
        const instruction = new LdInstruction(0x22, 2, registerArgHlInc, registerArgA);

        expect(instruction.getOpcode()).toEqual(0x22);
        expect(instruction.getLength()).toEqual(1);

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const expectedHl = (hlValue + 1) & SIXTEEN_ONE_BITS;
        const cycleCount = instruction.run(rs, mmu, args);

        expect(mmu.readByte(hlValue)).toEqual(rs.a.getValue());
        expect(rs.hl.getValue()).toEqual(expectedHl);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(2);
    });

    it("ld A (HL+)", () => {
        const hlValue = rs.hl.getValue();
        const instruction = new LdInstruction(0x2a, 2, registerArgA, registerArgHlInc);

        expect(instruction.getOpcode()).toEqual(0x2a);
        expect(instruction.getLength()).toEqual(1);

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const expectedHl = (hlValue + 1) & SIXTEEN_ONE_BITS;
        const cycleCount = instruction.run(rs, mmu, args);

        expect(rs.a.getValue()).toEqual(mmu.readByte(hlValue));
        expect(rs.hl.getValue()).toEqual(expectedHl);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(2);
    });

    it("ld (HL-) A", () => {
        const hlValue = rs.hl.getValue();
        const instruction = new LdInstruction(0x32, 2, registerArgHlDec, registerArgA);

        expect(instruction.getOpcode()).toEqual(0x32);
        expect(instruction.getLength()).toEqual(1);

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const expectedHl = (hlValue - 1) & SIXTEEN_ONE_BITS;
        const cycleCount = instruction.run(rs, mmu, args);

        expect(mmu.readByte(hlValue)).toEqual(rs.a.getValue());
        expect(rs.hl.getValue()).toEqual(expectedHl);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(2);
    });

    it("ld A (HL-)", () => {
        const hlValue = rs.hl.getValue();
        const instruction = new LdInstruction(0x3a, 2, registerArgA, registerArgHlDec);

        expect(instruction.getOpcode()).toEqual(0x3a);
        expect(instruction.getLength()).toEqual(1);

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const expectedHl = (hlValue - 1) & SIXTEEN_ONE_BITS;
        const cycleCount = instruction.run(rs, mmu, args);

        expect(rs.a.getValue()).toEqual(mmu.readByte(hlValue));
        expect(rs.hl.getValue()).toEqual(expectedHl);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(2);
    });

    it("should work between 16-bit sources", () => {
        const SIMPLE_R1S = [
            RegisterName.BC, RegisterName.DE, RegisterName.HL, RegisterName.SP
        ].map(item => {
            return new GbRegisterArg(item);
        });
        const SIMPLE_R2S = [...SIMPLE_R1S, new Gb16BitArg(0)];

        SIMPLE_R1S.forEach(r1 => {
            SIMPLE_R2S.forEach(r2 => {
                if (r1 === r2) {
                    return;
                }
                const r1Value = randomInteger(0, TWO_POW_EIGHT);
                r1.setValue(rs, mmu, args, r1Value);

                const opcode = randomInteger(0x0, 0x100);
                const cycleCount = randomInteger(0, 5);
                const r2Value = randomInteger(0, TWO_POW_SIXTEEN);
                if (r2 instanceof Gb16BitArg) {
                    args[0] = r2Value & EIGHT_ONE_BITS;
                    args[1] = r2Value >> 8;
                } else {
                    r2.setValue(rs, mmu, args, r2Value);
                }
                const instruction = new LdInstruction(opcode, cycleCount, r1, r2);

                expect(instruction.getOpcode()).toEqual(opcode);
                expect(instruction.getLength()).toEqual(r2 instanceof Gb16BitArg ? 3 : 1);

                const zeroFlag = rs.getZeroFlag();
                const operationFlag = rs.getOperationFlag();
                const halfCaryFlag = rs.getHalfCarryFlag();
                const carryFlag = rs.getCarryFlag();
                const cycleCountResult = instruction.run(rs, mmu, args);

                expect(r1.getValue(rs, mmu, args)).toEqual(r2Value);
                expect(rs.getZeroFlag()).toEqual(zeroFlag);
                expect(rs.getOperationFlag()).toEqual(operationFlag);
                expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
                expect(rs.getCarryFlag()).toEqual(carryFlag);
                expect(cycleCountResult).toEqual(cycleCount);
            });
        });
    });

    it("0xf8", () => {
        const sp = rs.sp.getValue();
        const instruction = new GbF8Instruction();

        expect(instruction.getOpcode()).toEqual(0xf8);
        expect(instruction.getLength()).toEqual(2);

        const expectedResult = add16Bit(sp, toSigned8Bit(args[0]));
        const cycleCount = instruction.run(rs, mmu, args);

        expect(rs.hl.getValue()).toEqual(expectedResult.result);
        expect(rs.getZeroFlag()).toEqual(0);
        expect(rs.getOperationFlag()).toEqual(0);
        expect(rs.getHalfCarryFlag()).toEqual(expectedResult.halfCarry ? 1 : 0);
        expect(rs.getCarryFlag()).toEqual(expectedResult.carry ? 1 : 0);
        expect(cycleCount).toEqual(3);
    });
});
