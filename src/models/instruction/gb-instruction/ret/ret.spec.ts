import { GbMmu } from "src/models/mmu/gb-mmu";
import { Flag, GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbFlagArg, GbNotArg } from "../../gb-instruction";
import { initialize } from "../utils/test-utils";
import { RetFlagInstruction, RetInstruction } from "./ret";

describe("ret", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should return PC to the address before memory[SP], then increase SP by 2", () => {
        const instruction = new RetInstruction();

        expect(instruction.getOpcode()).toEqual(0xc9);
        expect(instruction.getLength()).toEqual(1);

        const sp = rs.sp.getValue();
        const memSp = mmu.readWord(sp);
        const expectedSp = (sp + 2) & SIXTEEN_ONE_BITS;
        const expectedPc = (memSp - 1) & SIXTEEN_ONE_BITS;

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, []);

        expect(rs.pc.getValue()).toEqual(expectedPc);
        expect(rs.sp.getValue()).toEqual(expectedSp);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(4);

    });

    it("should work with flag variables", () => {
        const FLAG_ARGS = [
            new GbFlagArg(Flag.Zero),
            new GbFlagArg(Flag.Carry)
        ];
        const R1S = [...FLAG_ARGS, ...FLAG_ARGS.map(arg => new GbNotArg(arg))];

        R1S.forEach((r1) => {
            const opCode = randomInteger(0x0, 0x100);
            const instruction = new RetFlagInstruction(opCode, r1);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(1);

            const pc = randomInteger(0, TWO_POW_SIXTEEN);
            const sp = randomInteger(0, TWO_POW_SIXTEEN);
            const memSp = mmu.readWord(sp);

            // Flag set case
            rs.pc.setValue(pc);
            rs.sp.setValue(sp);
            r1.setValue(rs, mmu, [], 1);

            let expectedSp = (sp + 2) & SIXTEEN_ONE_BITS;
            let expectedPc = (memSp - 1) & SIXTEEN_ONE_BITS;

            let zeroFlag = rs.getZeroFlag();
            let operationFlag = rs.getOperationFlag();
            let halfCaryFlag = rs.getHalfCarryFlag();
            let carryFlag = rs.getCarryFlag();
            let cycleCount = instruction.run(rs, mmu, []);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(5);

            // Flag unset case
            rs.pc.setValue(pc);
            rs.sp.setValue(sp);
            r1.setValue(rs, mmu, [], 0);

            expectedPc = pc;
            expectedSp = sp;

            zeroFlag = rs.getZeroFlag();
            operationFlag = rs.getOperationFlag();
            halfCaryFlag = rs.getHalfCarryFlag();
            carryFlag = rs.getCarryFlag();
            cycleCount = instruction.run(rs, mmu, []);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.sp.getValue()).toEqual(expectedSp);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(2);
        });
    });
});
