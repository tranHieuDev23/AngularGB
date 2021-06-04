import { GbMmu } from "src/models/mmu/gb-mmu";
import { Flag, GbRegisterSet, RegisterName } from "src/models/register/gb-registers";
import { SIXTEEN_ONE_BITS, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb16BitArg, GbFlagArg, GbNotArg, GbRegisterArg } from "../../gb-instruction";
import { JpFlagInstruction, JpInstruction } from "./jp";
import { initialize } from "../utils/test-utils";

describe("jr", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        initialize(rs, mmu);
    });

    it("should jump PC to 16-bit argument", () => {
        const R1S = [
            new Gb16BitArg(0), new GbRegisterArg(RegisterName.HL)
        ];
        R1S.forEach(r1 => {
            const opCode = randomInteger(0x0, 0x100);
            const instruction = new JpInstruction(opCode, r1);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(r1 instanceof GbRegisterArg ? 1 : 3);

            const pc = rs.pc.getValue();
            const r1Value = randomInteger(0, TWO_POW_SIXTEEN);
            const args = [0, 0];
            if (r1 instanceof Gb16BitArg) {
                args[0] = r1Value >> 8;
                args[1] = r1Value & 0xff;
            } else {
                r1.setValue(rs, mmu, args, r1Value);
            }

            const expectedPc = (r1Value - 1) & SIXTEEN_ONE_BITS;
            const zeroFlag = rs.getZeroFlag();
            const operationFlag = rs.getOperationFlag();
            const halfCaryFlag = rs.getHalfCarryFlag();
            const carryFlag = rs.getCarryFlag();
            const cycleCount = instruction.run(rs, mmu, args);

            expect(rs.pc.getValue()).toEqual(expectedPc);
            expect(rs.getZeroFlag()).toEqual(zeroFlag);
            expect(rs.getOperationFlag()).toEqual(operationFlag);
            expect(rs.getHalfCarryFlag()).toEqual(halfCaryFlag);
            expect(rs.getCarryFlag()).toEqual(carryFlag);
            expect(cycleCount).toEqual(r1 instanceof GbRegisterArg ? 1 : 4);
        });
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
            const instruction = new JpFlagInstruction(opCode, r1, r2);

            expect(instruction.getOpcode()).toEqual(opCode);
            expect(instruction.getLength()).toEqual(3);

            const pc = randomInteger(0, TWO_POW_SIXTEEN);
            const r1Value = randomInteger(0, TWO_POW_SIXTEEN);

            // Flag set case
            rs.pc.setValue(pc);
            let args = [r1Value >> 8, r1Value & 0xff];
            r1.setValue(rs, mmu, args, 1);
            let expectedPc = (r1Value - 1) & SIXTEEN_ONE_BITS;

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
            expect(cycleCount).toEqual(4);

            // Flag unset case
            rs.pc.setValue(pc);
            args = [r1Value >> 8, r1Value & 0xff];
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
            expect(cycleCount).toEqual(3);
        });
    });
});
