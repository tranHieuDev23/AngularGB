import { EIGHT_ONE_BITS, SIXTEEN_ONE_BITS, TWO_POW_EIGHT, TWO_POW_SIXTEEN } from "./constants";

export class ArithmeticResult {
    constructor(
        public readonly result: number,
        public readonly zero: boolean,
        public readonly halfCarry: boolean,
        public readonly carry: boolean
    ) { }
}

export function add8Bit(a: number, b: number): ArithmeticResult {
    const fullResult = a + b;
    const croppedResult = fullResult & EIGHT_ONE_BITS;
    const zero = croppedResult === 0;
    const halfCarry = ((a ^ b ^ croppedResult) & 0x10) !== 0;
    const carry = fullResult >= TWO_POW_EIGHT;
    return new ArithmeticResult(croppedResult, zero, halfCarry, carry);
}

export function subtract8Bit(a: number, b: number): ArithmeticResult {
    const fullResult = a - b;
    const croppedResult = fullResult & EIGHT_ONE_BITS;
    const zero = croppedResult === 0;
    const halfCarry = ((a ^ b ^ croppedResult) & 0x10) !== 0;
    const carry = fullResult < 0;
    return new ArithmeticResult(croppedResult, zero, halfCarry, carry);
}

export function toSigned8Bit(a: number): number {
    a &= EIGHT_ONE_BITS;
    if (getBit(a, 7) === 0) {
        return a;
    }
    return a - TWO_POW_EIGHT;
}

export function add16Bit(a: number, b: number): ArithmeticResult {
    const fullResult = a + b;
    const croppedResult = fullResult & SIXTEEN_ONE_BITS;
    const zero = croppedResult === 0;
    const halfCarry = ((a ^ b ^ croppedResult) & 0x1000) !== 0;
    const carry = fullResult >= TWO_POW_SIXTEEN;
    return new ArithmeticResult(croppedResult, zero, halfCarry, carry);
}

export function getBit(value: number, bitId: number): number {
    return (value >> bitId) & 1;
}
