import { GbMmu } from "src/models/mmu/gb-mmu";
import { Flag, GbRegisterSet, RegisterName } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb16BitArg, GbFlagArg, GbNotArg, GbRegisterArg } from "../../gb-instruction";
import { CallFlagInstruction, CallInstruction } from "./call";
import { initialize } from "../utils/test-utils";

describe("call", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should jump PC to 16-bit argument, stacking the old value", () => {
        const r1 = new Gb16BitArg(0);
        const instruction = new CallInstruction(r1);

        expect(instruction.getOpcode()).toEqual(0xcd);
        expect(instruction.getLength()).toEqual(3);

        const pc = randomInteger(0, TWO_POW_SIXTEEN);
        const sp = randomInteger(0, TWO_POW_SIXTEEN);
        const r1Value = randomInteger(0, TWO_POW_SIXTEEN);
        rs.pc.setValue(pc);
        rs.sp.setValue(sp);
        const args = [r1Value >> 8, r1Value & 0xff];

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, args);

        expect(rs.pc.getValue()).toEqual((r1Value - 1) & SIXTEEN_ONE_BITS);
        expect(rs.sp.getValue()).toEqual((sp - 2) & SIXTEEN_ONE_BITS);
        expect(mmu.readWord(rs.sp.getValue())).toEqual(pc);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(6);
    });

    it("should work with flag variables", () => {
        const FLAG_ARGS = [
            new GbFlagArg(Flag.Zero),
            new GbFlagArg(Flag.Carry)
        ];
        const R1S = [...FLAG_ARGS, ...FLAG_ARGS.map(arg => new GbNotArg(arg))];
        const r2 = new Gb16BitArg(0);

        R1S.forEach((r1) => {
            const opCode = randomInteger(0x0, 0x100);
            const instruction = new CallFlagInstruction(opCode, r1, r2);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(3);

            const pc = randomInteger(0, TWO_POW_SIXTEEN);
            const sp = randomInteger(0, TWO_POW_SIXTEEN);
            const r2Value = randomInteger(0, TWO_POW_SIXTEEN);

            // Flag set case
            rs.pc.setValue(pc);
            rs.sp.setValue(sp);
            let args = [r2Value >> 8, r2Value & 0xff];
            r1.setValue(rs, mmu, args, 1);
            let expectedPc = (r2Value - 1) & SIXTEEN_ONE_BITS;
            let expectedSp = (sp - 2) & SIXTEEN_ONE_BITS;

            let zeroFlag = rs.getZeroFlag();
            let operationFlag = rs.getOperationFlag();
            let halfCaryFlag = rs.getHalfCarryFlag();
            let carryFlag = rs.getCarryFlag();
            let cycleCount = instruction.run(rs, mmu, args);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(mmu.readWord(rs.sp.getValue())).toEqual(pc);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(6);

            // Flag unset case
            rs.pc.setValue(pc);
            rs.sp.setValue(sp);
            args = [r2Value >> 8, r2Value & 0xff];
            r1.setValue(rs, mmu, args, 0);
            expectedPc = pc;
            expectedSp = sp;

            zeroFlag = rs.getZeroFlag();
            operationFlag = rs.getOperationFlag();
            halfCaryFlag = rs.getHalfCarryFlag();
            carryFlag = rs.getCarryFlag();
            cycleCount = instruction.run(rs, mmu, args);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(3);
        });
    });
});
