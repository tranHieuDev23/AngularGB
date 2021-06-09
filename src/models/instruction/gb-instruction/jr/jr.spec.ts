import { GbTestMmu } from "src/models/mmu/gb-mmu";
import { Flag, GbRegisterSet } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { GbFlagArg, GbNotArg } from "../../gb-instruction";
import { JrFlagInstruction, JrInstruction } from "./jr";
import { initialize } from "../utils/test-utils";

describe("jr", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbTestMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should jump PC by signed 8-bit argument", () => {
        const instruction = new JrInstruction();

        expect(instruction.getOpcode()).toEqual(0x18);
        expect(instruction.getLength()).toEqual(2);

        const pc = rs.pc.getValue();
        const s8 = randomInteger(0, TWO_POW_EIGHT);
        const expectedPc = (s8 < (1 << 7) ? pc + s8 : pc + s8 - 256) & SIXTEEN_ONE_BITS;

        const zeroFlag = rs.getZeroFlag();
        const operationFlag = rs.getOperationFlag();
        const halfCaryFlag = rs.getHalfCarryFlag();
        const carryFlag = rs.getCarryFlag();
        const cycleCount = instruction.run(rs, mmu, [s8]);

        expect(rs.pc.getValue()).toEqual(expectedPc);
        expect(rs.getZeroFlag()).toEqual(zeroFlag);
        expect(rs.getOperationFlag()).toEqual(operationFlag);
        expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
        expect(rs.getCarryFlag()).toEqual(carryFlag);
        expect(cycleCount).toEqual(3);

    });

    it("should work with flag variables", () => {
        const FLAG_ARGS = [
            new GbFlagArg(Flag.Zero),
            new GbFlagArg(Flag.Carry)
        ];
        const R1S = [...FLAG_ARGS, ...FLAG_ARGS.map(arg => new GbNotArg(arg))];

        R1S.forEach((r1) => {
            const opCode = randomInteger(0x0, 0x100);
            const instruction = new JrFlagInstruction(opCode, r1);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(2);

            const pc = randomInteger(0, TWO_POW_SIXTEEN);
            const s8 = randomInteger(0, TWO_POW_EIGHT);

            // Flag set case
            let args = [s8];
            rs.pc.setValue(pc);
            r1.setValue(rs, mmu, args, 1);
            let expectedPc = (s8 < (1 << 7) ? pc + s8 : pc + s8 - 256) & SIXTEEN_ONE_BITS;

            let zeroFlag = rs.getZeroFlag();
            let operationFlag = rs.getOperationFlag();
            let halfCaryFlag = rs.getHalfCarryFlag();
            let carryFlag = rs.getCarryFlag();
            let cycleCount = instruction.run(rs, mmu, args);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(3);

            // Flag unset case
            args = [s8];
            rs.pc.setValue(pc);
            r1.setValue(rs, mmu, args, 0);
            expectedPc = pc;

            zeroFlag = rs.getZeroFlag();
            operationFlag = rs.getOperationFlag();
            halfCaryFlag = rs.getHalfCarryFlag();
            carryFlag = rs.getCarryFlag();
            cycleCount = instruction.run(rs, mmu, args);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(2);
        });
    });
});
