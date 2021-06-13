import { TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "src/utils/constants";
import { add16Bit, add8Bit, ArithmeticResult, subtract8Bit, toSigned16Bit, toSigned8Bit } from "./arithmetic-utils";

describe("arithmetic-utils", () => {
    describe("add8Bit()", () => {
        it("should do add operation", () => {
            const result = add8Bit(2, 3);
            expect(result).toBeInstanceOf(ArithmeticResult);
            expect(result.result).toEqual(5);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeFalse();
        });

        it("should limit in 8 bit", () => {
            const result = add8Bit(0x80, 0x81);
            expect(result.result).toEqual(0x01);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeTrue();
            expect(result.halfCarry).toBeFalse();
        });

        it("should be able to raise half-flag", () => {
            const result = add8Bit(0x0c, 0x0d);
            expect(result.result).toEqual(0x19);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeTrue();
        });

        it("should be able to raise zero", () => {
            const result = add8Bit(0x01, 0xff);
            expect(result.result).toEqual(0x00);
            expect(result.zero).toBeTrue();
            expect(result.carry).toBeTrue();
            expect(result.halfCarry).toBeTrue();
        });
    });

    describe("subtract8Bit()", () => {
        it("should do subtract operation", () => {
            const result = subtract8Bit(3, 2);
            expect(result).toBeInstanceOf(ArithmeticResult);
            expect(result.result).toEqual(1);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeFalse();
        });

        it("should limit in 8 bit", () => {
            const result = subtract8Bit(0x80, 0x81);
            expect(result.result).toEqual(0xff);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeTrue();
            expect(result.halfCarry).toBeTrue();
        });

        it("should be able to raise half-flag", () => {
            const result = subtract8Bit(0x19, 0x0d);
            expect(result.result).toEqual(0x0c);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeTrue();
        });

        it("should be able to raise zero", () => {
            const result = subtract8Bit(0x01, 0x01);
            expect(result.result).toEqual(0x00);
            expect(result.zero).toBeTrue();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeFalse();
        });
    });

    describe("toSigned8Bit()", () => {
        it("should convert 8-bit representation to correct value", () => {
            for (let i = 0; i < TWO_POW_EIGHT / 2; i++) {
                expect(toSigned8Bit(i)).toEqual(i);
            }
            for (let i = TWO_POW_EIGHT / 2; i < TWO_POW_EIGHT; i++) {
                expect(toSigned8Bit(i)).toEqual(i - TWO_POW_EIGHT);
            }
        });
    });

    describe("add16Bit()", () => {
        it("should do add operation", () => {
            const result = add16Bit(2, 3);
            expect(result).toBeInstanceOf(ArithmeticResult);
            expect(result.result).toEqual(5);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeFalse();
        });

        it("should limit in 16 bit", () => {
            const result = add16Bit(0x8000, 0x8100);
            expect(result.result).toEqual(0x0100);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeTrue();
            expect(result.halfCarry).toBeFalse();
        });

        it("should be able to raise half-flag", () => {
            const result = add16Bit(0x0c00, 0x0d00);
            expect(result.result).toEqual(0x001900);
            expect(result.zero).toBeFalse();
            expect(result.carry).toBeFalse();
            expect(result.halfCarry).toBeTrue();
        });

        it("should be able to raise zero", () => {
            const result = add16Bit(0x0001, 0xffff);
            expect(result.result).toEqual(0x0000);
            expect(result.zero).toBeTrue();
            expect(result.carry).toBeTrue();
            expect(result.halfCarry).toBeTrue();
        });
    });

    describe("toSigned16Bit()", () => {
        it("should convert 16-bit representation to correct value", () => {
            for (let i = TWO_POW_SIXTEEN / 2 - 100; i < TWO_POW_SIXTEEN / 2; i++) {
                expect(toSigned16Bit(i)).toEqual(i);
            }
            for (let i = TWO_POW_SIXTEEN / 2; i < TWO_POW_SIXTEEN / 2 + 100; i++) {
                expect(toSigned16Bit(i)).toEqual(i - TWO_POW_SIXTEEN);
            }
        });
    });
});
