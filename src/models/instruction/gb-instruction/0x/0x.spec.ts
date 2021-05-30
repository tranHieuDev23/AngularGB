import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb00Instruction } from "./00";
import { Gb01Instruction } from "./01";
import { Gb02Instruction } from "./02";
import { Gb03Instruction } from "./03";
import { Gb04Instruction } from "./04";
import { Gb05Instruction } from "./05";
import { Gb06Instruction } from "./06";
import { Gb07Instruction } from "./07";
import { Gb08Instruction } from "./08";
import { Gb09Instruction } from "./09";
import { Gb0aInstruction } from "./0a";
import { Gb0bInstruction } from "./0b";
import { Gb0cInstruction } from "./0c";
import { Gb0dInstruction } from "./0d";
import { Gb0eInstruction } from "./0e";
import { Gb0fInstruction } from "./0f";

describe('0x', () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        rs.getAllRegister().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
    });

    describe('00', () => {
        const instruction00 = new Gb00Instruction();

        it('should have correct properties', () => {
            expect(instruction00.getOpcode()).toEqual(0x00);
            expect(instruction00.getLength()).toEqual(1);
            expect(instruction00.getCycleCount()).toEqual(1);
        });

        it('should do nothing', () => {
            instruction00.run(rs, mmu, []);
            rs.getAllRegister().forEach(item => {
                expect(item.getValue()).toEqual(0);
            });
        });
    });

    describe('01', () => {
        const instruction01 = new Gb01Instruction();

        it('should have correct properties', () => {
            expect(instruction01.getOpcode()).toEqual(0x01);
            expect(instruction01.getLength()).toEqual(3);
            expect(instruction01.getCycleCount()).toEqual(3);
        });

        it('should load args value to BC', () => {
            const lowerHalf = randomInteger(0, TWO_POW_EIGHT);
            const upperHalf = randomInteger(0, TWO_POW_EIGHT);
            instruction01.run(rs, mmu, [lowerHalf, upperHalf]);
            expect(rs.b.getValue()).toEqual(lowerHalf);
            expect(rs.c.getValue()).toEqual(upperHalf);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe('02', () => {
        const instruction02 = new Gb02Instruction();

        it('should have correct properties', () => {
            expect(instruction02.getOpcode()).toEqual(0x02);
            expect(instruction02.getLength()).toEqual(1);
            expect(instruction02.getCycleCount()).toEqual(2);
        });

        it('should load value of A to address specified by BC', () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            const bc = randomInteger(0, TWO_POW_SIXTEEN);
            rs.a.setValue(a);
            rs.bc.setValue(bc);
            instruction02.run(rs, mmu, []);
            expect(mmu.readByte(bc)).toEqual(a);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe('03', () => {
        const instruction03 = new Gb03Instruction();

        it('should have correct properties', () => {
            expect(instruction03.getOpcode()).toEqual(0x03);
            expect(instruction03.getLength()).toEqual(1);
            expect(instruction03.getCycleCount()).toEqual(2);
        });

        it('should increase value of BC by 1', () => {
            const bc = randomInteger(0, TWO_POW_SIXTEEN - 1);
            rs.bc.setValue(bc);
            instruction03.run(rs, mmu, []);
            expect(rs.bc.getValue()).toEqual(bc + 1);

            rs.bc.setValue(0xffff);
            instruction03.run(rs, mmu, []);
            expect(rs.bc.getValue()).toEqual(0);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe('04', () => {
        const instruction04 = new Gb04Instruction();

        it('should have correct properties', () => {
            expect(instruction04.getOpcode()).toEqual(0x04);
            expect(instruction04.getLength()).toEqual(1);
            expect(instruction04.getCycleCount()).toEqual(1);
        });

        it('should increase value of B by 1', () => {
            const b = randomInteger(0, TWO_POW_EIGHT - 1);
            rs.b.setValue(b);
            instruction04.run(rs, mmu, []);
            expect(rs.b.getValue()).toEqual(b + 1);

            rs.b.setValue(0xff);
            instruction04.run(rs, mmu, []);
            expect(rs.b.getValue()).toEqual(0);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0xa0);
        });
    });

    describe('05', () => {
        const instruction05 = new Gb05Instruction();

        it('should have correct properties', () => {
            expect(instruction05.getOpcode()).toEqual(0x05);
            expect(instruction05.getLength()).toEqual(1);
            expect(instruction05.getCycleCount()).toEqual(1);
        });

        it('should decrease value of B by 1', () => {
            const b = randomInteger(1, TWO_POW_EIGHT);
            rs.b.setValue(b);
            instruction05.run(rs, mmu, []);
            expect(rs.b.getValue()).toEqual(b - 1);

            rs.b.setValue(0x00);
            instruction05.run(rs, mmu, []);
            expect(rs.b.getValue()).toEqual(0xff);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0x60);
        });
    });

    describe('06', () => {
        const instruction06 = new Gb06Instruction();

        it('should have correct properties', () => {
            expect(instruction06.getOpcode()).toEqual(0x06);
            expect(instruction06.getLength()).toEqual(2);
            expect(instruction06.getCycleCount()).toEqual(2);
        });

        it('should load args value into B', () => {
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            instruction06.run(rs, mmu, [randomValue]);
            expect(rs.b.getValue()).toEqual(randomValue);
        });
    });

    describe('07', () => {
        const instruction07 = new Gb07Instruction();

        it('should have correct properties', () => {
            expect(instruction07.getOpcode()).toEqual(0x07);
            expect(instruction07.getLength()).toEqual(1);
            expect(instruction07.getCycleCount()).toEqual(1);
        });

        it('should left rotate value of A', () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            rs.a.setValue(a);
            const bit7 = rs.a.getBit(7);
            instruction07.run(rs, mmu, []);
            const expectedA = ((a << 1) & EIGHT_ONE_BITS) | ((a >> 7) & 1);
            expect(rs.a.getValue()).toEqual(expectedA);
            expect(rs.getCarryFlag()).toEqual(bit7);
        });
    });

    describe('08', () => {
        const instruction08 = new Gb08Instruction();

        it('should have correct properties', () => {
            expect(instruction08.getOpcode()).toEqual(0x08);
            expect(instruction08.getLength()).toEqual(3);
            expect(instruction08.getCycleCount()).toEqual(5);
        });

        it('should load value of SP to specified address', () => {
            const sp = randomInteger(0, TWO_POW_SIXTEEN);
            rs.sp.setValue(sp);
            const address = randomInteger(0, TWO_POW_SIXTEEN - 1);
            instruction08.run(rs, mmu, [address]);
            expect(mmu.readWord(address)).toEqual(sp);
        });
    });

    describe('09', () => {
        const instruction09 = new Gb09Instruction();

        it('should have correct properties', () => {
            expect(instruction09.getOpcode()).toEqual(0x09);
            expect(instruction09.getLength()).toEqual(1);
            expect(instruction09.getCycleCount()).toEqual(2);
        });

        it('should add value of BC to HL', () => {
            const bc = randomInteger(0, TWO_POW_SIXTEEN / 2);
            const hl = randomInteger(0, TWO_POW_SIXTEEN / 2);
            rs.bc.setValue(bc);
            rs.hl.setValue(hl);
            instruction09.run(rs, mmu, []);
            expect(rs.hl.getValue()).toEqual(bc + hl);

            rs.bc.setValue(0xffff);
            rs.hl.setValue(0x0001);
            instruction09.run(rs, mmu, []);
            expect(rs.hl.getValue()).toEqual(0);
            // All flags should be updated, except Zero flag
            expect(rs.f.getValue()).toEqual(0x30);
        });
    });

    describe('0a', () => {
        const instruction0a = new Gb0aInstruction();

        it('should have correct properties', () => {
            expect(instruction0a.getOpcode()).toEqual(0x0a);
            expect(instruction0a.getLength()).toEqual(1);
            expect(instruction0a.getCycleCount()).toEqual(2);
        });

        it('should load value of address specified by BC into A', () => {
            const bc = randomInteger(0, TWO_POW_SIXTEEN);
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            rs.bc.setValue(bc);
            mmu.writeByte(bc, randomValue);
            instruction0a.run(rs, mmu, []);
            expect(rs.a.getValue()).toEqual(randomValue);
        });
    });

    describe('0b', () => {
        const instruction0b = new Gb0bInstruction();

        it('should have correct properties', () => {
            expect(instruction0b.getOpcode()).toEqual(0x0b);
            expect(instruction0b.getLength()).toEqual(1);
            expect(instruction0b.getCycleCount()).toEqual(2);
        });

        it('should decrease value of BC by 1', () => {
            const bc = randomInteger(1, TWO_POW_SIXTEEN);
            rs.bc.setValue(bc);
            instruction0b.run(rs, mmu, []);
            expect(rs.bc.getValue()).toEqual(bc - 1);

            rs.bc.setValue(0);
            instruction0b.run(rs, mmu, []);
            expect(rs.bc.getValue()).toEqual(0xffff);
            // Flags should not be updated
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe('0c', () => {
        const instruction0c = new Gb0cInstruction();

        it('should have correct properties', () => {
            expect(instruction0c.getOpcode()).toEqual(0x0c);
            expect(instruction0c.getLength()).toEqual(1);
            expect(instruction0c.getCycleCount()).toEqual(1);
        });

        it('should increase value of C by 1', () => {
            const c = randomInteger(0, TWO_POW_EIGHT - 1);
            rs.c.setValue(c);
            instruction0c.run(rs, mmu, []);
            expect(rs.c.getValue()).toEqual(c + 1);

            rs.c.setValue(0xff);
            instruction0c.run(rs, mmu, []);
            expect(rs.c.getValue()).toEqual(0x00);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0xa0);
        });
    });

    describe('0d', () => {
        const instruction0d = new Gb0dInstruction();

        it('should have correct properties', () => {
            expect(instruction0d.getOpcode()).toEqual(0x0d);
            expect(instruction0d.getLength()).toEqual(1);
            expect(instruction0d.getCycleCount()).toEqual(1);
        });

        it('should decrease value of C by 1', () => {
            const c = randomInteger(1, TWO_POW_EIGHT);
            rs.c.setValue(c);
            instruction0d.run(rs, mmu, []);
            expect(rs.c.getValue()).toEqual(c - 1);

            rs.c.setValue(0x00);
            instruction0d.run(rs, mmu, []);
            expect(rs.c.getValue()).toEqual(0xff);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0x60);
        });
    });

    describe('0e', () => {
        const instruction0e = new Gb0eInstruction();

        it('should have correct properties', () => {
            expect(instruction0e.getOpcode()).toEqual(0x0e);
            expect(instruction0e.getLength()).toEqual(2);
            expect(instruction0e.getCycleCount()).toEqual(2);
        });

        it('should load args value into C', () => {
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            instruction0e.run(rs, mmu, [randomValue]);
            expect(rs.c.getValue()).toEqual(randomValue);
        });
    });

    describe('0f', () => {
        const instruction0f = new Gb0fInstruction();

        it('should have correct properties', () => {
            expect(instruction0f.getOpcode()).toEqual(0x0f);
            expect(instruction0f.getLength()).toEqual(1);
            expect(instruction0f.getCycleCount()).toEqual(1);
        });

        it('should right rotate value of A', () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            rs.a.setValue(a);
            const bit0 = rs.a.getBit(0);
            instruction0f.run(rs, mmu, []);
            const expectedA = ((a >> 1) & EIGHT_ONE_BITS) | ((a & 1) << 7);
            expect(rs.a.getValue()).toEqual(expectedA);
            expect(rs.getCarryFlag()).toEqual(bit0);
        });
    });
});