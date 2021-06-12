export class ArithmeticResult {
    constructor(
        public readonly result: number,
        public readonly zero: boolean,
        public readonly halfCarry: boolean,
        public readonly carry: boolean
    ) { }
}

function add(a: number, b: number, bitCount: number): ArithmeticResult {
    const twoPowerBitCount = 1 << bitCount;
    const fullResult = a + b;
    const croppedResult = fullResult & (twoPowerBitCount - 1);
    const zero = croppedResult === 0;
    const halfCarry = (((a & 0xf) + (b & 0xf)) & 0x10) === 0x10;
    const carry = fullResult >= twoPowerBitCount;
    return new ArithmeticResult(croppedResult, zero, halfCarry, carry);
}

function subtract(a: number, b: number, bitCount: number): ArithmeticResult {
    const twoPowerBitCount = 1 << bitCount;
    const fullResult = a - b;
    const croppedResult = fullResult & (twoPowerBitCount - 1);
    const zero = croppedResult === 0;
    const halfCarry = (((a & 0xf) - (b & 0xf)) & 0x10) === 0x10;
    const carry = fullResult < 0;
    return new ArithmeticResult(croppedResult, zero, halfCarry, carry);
}

function toSigned(a: number, bitCount: number): number {
    const twoPower = 1 << bitCount;
    if (a < twoPower / 2) {
        return a;
    }
    return - (((~a) + 1) & (twoPower - 1));
}

export function add8Bit(a: number, b: number): ArithmeticResult {
    return add(a, b, 8);
}

export function subtract8Bit(a: number, b: number): ArithmeticResult {
    return subtract(a, b, 8);
}

export function toSigned8Bit(a: number): number {
    return toSigned(a, 8);
}

export function add16Bit(a: number, b: number): ArithmeticResult {
    return add(a, b, 16);
}

export function subtract16Bit(a: number, b: number): ArithmeticResult {
    return subtract(a, b, 16);
}

export function toSigned16Bit(a: number): number {
    return toSigned(a, 16);
}

export function getBit(value: number, bitId: number): number {
    return (value >> bitId) & 1;
}
