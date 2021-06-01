import { GbMmu } from "src/models/mmu/gb-mmu";
import { GbRegisterSet } from "src/models/register/gb-registers";
import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { randomInteger } from "src/utils/random";
import { Gb10Instruction } from "./10";
import { Gb11Instruction } from "./11";
import { Gb12Instruction } from "./12";
import { Gb13Instruction } from "./13";
import { Gb14Instruction } from "./14";
import { Gb15Instruction } from "./15";
import { Gb16Instruction } from "./16";
import { Gb17Instruction } from "./17";
import { Gb18Instruction } from "./18";
import { Gb19Instruction } from "./19";
import { Gb1aInstruction } from "./1a";
import { Gb1bInstruction } from "./1b";
import { Gb1cInstruction } from "./1c";
import { Gb1dInstruction } from "./1d";
import { Gb1eInstruction } from "./1e";
import { Gb1fInstruction } from "./1f";

describe("1x", () => {
    const rs = new GbRegisterSet();
    const mmu = new GbMmu();

    beforeEach(() => {
        rs.getAllRegister().forEach(item => {
            item.setValue(0);
        });
        mmu.randomize();
    });

    describe("10", () => {
        const instruction10 = new Gb10Instruction();

        it("should have correct properties", () => {
            expect(instruction10.getOpcode()).toEqual(0x10);
            expect(instruction10.getLength()).toEqual(2);
            expect(instruction10.getCycleCount()).toEqual(1);
        });

        // TODO: Implement STOP
    });

    describe("11", () => {
        const instruction11 = new Gb11Instruction();

        it("should have correct properties", () => {
            expect(instruction11.getOpcode()).toEqual(0x11);
            expect(instruction11.getLength()).toEqual(3);
            expect(instruction11.getCycleCount()).toEqual(3);
        });

        it("should load args value to DE", () => {
            const lowerHalf = randomInteger(0, TWO_POW_EIGHT);
            const upperHalf = randomInteger(0, TWO_POW_EIGHT);
            instruction11.run(rs, mmu, [lowerHalf, upperHalf]);
            expect(rs.d.getValue()).toEqual(lowerHalf);
            expect(rs.e.getValue()).toEqual(upperHalf);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe("12", () => {
        const instruction12 = new Gb12Instruction();

        it("should have correct properties", () => {
            expect(instruction12.getOpcode()).toEqual(0x12);
            expect(instruction12.getLength()).toEqual(1);
            expect(instruction12.getCycleCount()).toEqual(2);
        });

        it("should load value of A to address specified by DE", () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            const de = randomInteger(0, TWO_POW_SIXTEEN);
            rs.a.setValue(a);
            rs.de.setValue(de);
            instruction12.run(rs, mmu, []);
            expect(mmu.readByte(de)).toEqual(a);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe("13", () => {
        const instruction13 = new Gb13Instruction();

        it("should have correct properties", () => {
            expect(instruction13.getOpcode()).toEqual(0x13);
            expect(instruction13.getLength()).toEqual(1);
            expect(instruction13.getCycleCount()).toEqual(2);
        });

        it("should increase value of DE by 1", () => {
            const de = randomInteger(0, TWO_POW_SIXTEEN - 1);
            rs.de.setValue(de);
            instruction13.run(rs, mmu, []);
            expect(rs.de.getValue()).toEqual(de + 1);

            rs.de.setValue(0xffff);
            instruction13.run(rs, mmu, []);
            expect(rs.de.getValue()).toEqual(0);
            // Flags should not be changed
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe("14", () => {
        const instruction14 = new Gb14Instruction();

        it("should have correct properties", () => {
            expect(instruction14.getOpcode()).toEqual(0x14);
            expect(instruction14.getLength()).toEqual(1);
            expect(instruction14.getCycleCount()).toEqual(1);
        });

        it("should increase value of D by 1", () => {
            const d = randomInteger(0, TWO_POW_EIGHT - 1);
            rs.d.setValue(d);
            instruction14.run(rs, mmu, []);
            expect(rs.d.getValue()).toEqual(d + 1);

            rs.d.setValue(0xff);
            instruction14.run(rs, mmu, []);
            expect(rs.d.getValue()).toEqual(0);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0xa0);
        });
    });

    describe("15", () => {
        const instruction15 = new Gb15Instruction();

        it("should have correct properties", () => {
            expect(instruction15.getOpcode()).toEqual(0x15);
            expect(instruction15.getLength()).toEqual(1);
            expect(instruction15.getCycleCount()).toEqual(1);
        });

        it("should decrease value of D by 1", () => {
            const d = randomInteger(1, TWO_POW_EIGHT);
            rs.d.setValue(d);
            instruction15.run(rs, mmu, []);
            expect(rs.d.getValue()).toEqual(d - 1);

            rs.d.setValue(0x00);
            instruction15.run(rs, mmu, []);
            expect(rs.d.getValue()).toEqual(0xff);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0x60);
        });
    });

    describe("16", () => {
        const instruction16 = new Gb16Instruction();

        it("should have correct properties", () => {
            expect(instruction16.getOpcode()).toEqual(0x16);
            expect(instruction16.getLength()).toEqual(2);
            expect(instruction16.getCycleCount()).toEqual(2);
        });

        it("should load args value into d", () => {
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            instruction16.run(rs, mmu, [randomValue]);
            expect(rs.d.getValue()).toEqual(randomValue);
        });
    });

    describe("17", () => {
        const instruction17 = new Gb17Instruction();

        it("should have correct properties", () => {
            expect(instruction17.getOpcode()).toEqual(0x17);
            expect(instruction17.getLength()).toEqual(1);
            expect(instruction17.getCycleCount()).toEqual(1);
        });

        it("should left rotate value of A", () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            const carryFlag = randomInteger(0, 2);
            rs.a.setValue(a);
            rs.setCarryFlag(carryFlag);
            const bit7 = rs.a.getBit(7);
            instruction17.run(rs, mmu, []);
            const expectedA = ((a << 1) & EIGHT_ONE_BITS) | carryFlag;
            expect(rs.a.getValue()).toEqual(expectedA);
            expect(rs.getCarryFlag()).toEqual(bit7);
        });
    });

    describe("18", () => {
        const instruction18 = new Gb18Instruction();

        it("should have correct properties", () => {
            expect(instruction18.getOpcode()).toEqual(0x18);
            expect(instruction18.getLength()).toEqual(2);
            expect(instruction18.getCycleCount()).toEqual(3);
        });

        it("should jump PC by value of args", () => {
            const pc = randomInteger(0, TWO_POW_SIXTEEN);
            rs.pc.setValue(pc);
            const jumpStep = randomInteger(- TWO_POW_EIGHT / 2, TWO_POW_EIGHT / 2);
            instruction18.run(rs, mmu, [jumpStep]);
            expect(rs.pc.getValue()).toEqual((pc + jumpStep) & SIXTEEN_ONE_BITS);
        });
    });

    describe("19", () => {
        const instruction19 = new Gb19Instruction();

        it("should have correct properties", () => {
            expect(instruction19.getOpcode()).toEqual(0x19);
            expect(instruction19.getLength()).toEqual(1);
            expect(instruction19.getCycleCount()).toEqual(2);
        });

        it("should add value of DE to HL", () => {
            const de = randomInteger(0, TWO_POW_SIXTEEN / 2);
            const hl = randomInteger(0, TWO_POW_SIXTEEN / 2);
            rs.de.setValue(de);
            rs.hl.setValue(hl);
            instruction19.run(rs, mmu, []);
            expect(rs.hl.getValue()).toEqual(de + hl);

            rs.de.setValue(0xffff);
            rs.hl.setValue(0x0001);
            instruction19.run(rs, mmu, []);
            expect(rs.hl.getValue()).toEqual(0);
            // All flags should be updated, except Zero flag
            expect(rs.f.getValue()).toEqual(0x30);
        });
    });

    describe("1a", () => {
        const instruction1a = new Gb1aInstruction();

        it("should have correct properties", () => {
            expect(instruction1a.getOpcode()).toEqual(0x1a);
            expect(instruction1a.getLength()).toEqual(1);
            expect(instruction1a.getCycleCount()).toEqual(2);
        });

        it("should load value of address specified by DE into A", () => {
            const de = randomInteger(0, TWO_POW_SIXTEEN);
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            rs.de.setValue(de);
            mmu.writeByte(de, randomValue);
            instruction1a.run(rs, mmu, []);
            expect(rs.a.getValue()).toEqual(randomValue);
        });
    });

    describe("1b", () => {
        const instruction1b = new Gb1bInstruction();

        it("should have correct properties", () => {
            expect(instruction1b.getOpcode()).toEqual(0x1b);
            expect(instruction1b.getLength()).toEqual(1);
            expect(instruction1b.getCycleCount()).toEqual(2);
        });

        it("should decrease value of DE by 1", () => {
            const de = randomInteger(1, TWO_POW_SIXTEEN);
            rs.de.setValue(de);
            instruction1b.run(rs, mmu, []);
            expect(rs.de.getValue()).toEqual(de - 1);

            rs.de.setValue(0);
            instruction1b.run(rs, mmu, []);
            expect(rs.de.getValue()).toEqual(0xffff);
            // Flags should not be updated
            expect(rs.f.getValue()).toEqual(0);
        });
    });

    describe("1c", () => {
        const instruction1c = new Gb1cInstruction();

        it("should have correct properties", () => {
            expect(instruction1c.getOpcode()).toEqual(0x1c);
            expect(instruction1c.getLength()).toEqual(1);
            expect(instruction1c.getCycleCount()).toEqual(1);
        });

        it("should increase value of E by 1", () => {
            const e = randomInteger(0, TWO_POW_EIGHT - 1);
            rs.e.setValue(e);
            instruction1c.run(rs, mmu, []);
            expect(rs.e.getValue()).toEqual(e + 1);

            rs.e.setValue(0xff);
            instruction1c.run(rs, mmu, []);
            expect(rs.e.getValue()).toEqual(0x00);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0xa0);
        });
    });

    describe("1d", () => {
        const instruction1d = new Gb1dInstruction();

        it("should have correct properties", () => {
            expect(instruction1d.getOpcode()).toEqual(0x1d);
            expect(instruction1d.getLength()).toEqual(1);
            expect(instruction1d.getCycleCount()).toEqual(1);
        });

        it("should decrease value of E by 1", () => {
            const e = randomInteger(1, TWO_POW_EIGHT);
            rs.e.setValue(e);
            instruction1d.run(rs, mmu, []);
            expect(rs.e.getValue()).toEqual(e - 1);

            rs.e.setValue(0x00);
            instruction1d.run(rs, mmu, []);
            expect(rs.e.getValue()).toEqual(0xff);
            // All flags should be updated, except Carry flag
            expect(rs.f.getValue()).toEqual(0x60);
        });
    });

    describe("1e", () => {
        const instruction1e = new Gb1eInstruction();

        it("should have correct properties", () => {
            expect(instruction1e.getOpcode()).toEqual(0x1e);
            expect(instruction1e.getLength()).toEqual(2);
            expect(instruction1e.getCycleCount()).toEqual(2);
        });

        it("should load args value into E", () => {
            const randomValue = randomInteger(0, TWO_POW_EIGHT);
            instruction1e.run(rs, mmu, [randomValue]);
            expect(rs.e.getValue()).toEqual(randomValue);
        });
    });

    describe("1f", () => {
        const instruction1f = new Gb1fInstruction();

        it("should have correct properties", () => {
            expect(instruction1f.getOpcode()).toEqual(0x1f);
            expect(instruction1f.getLength()).toEqual(1);
            expect(instruction1f.getCycleCount()).toEqual(1);
        });

        it("should right rotate value of A", () => {
            const a = randomInteger(0, TWO_POW_EIGHT);
            const carryFlag = randomInteger(0, 2);
            rs.a.setValue(a);
            rs.setCarryFlag(carryFlag);
            const bit0 = rs.a.getBit(0);
            instruction1f.run(rs, mmu, []);
            const expectedA = ((a >> 1) & EIGHT_ONE_BITS) | (carryFlag << 7);
            expect(rs.a.getValue()).toEqual(expectedA);
            expect(rs.getCarryFlag()).toEqual(bit0);
        });
    });
});
