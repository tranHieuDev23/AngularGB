export class InstructionNotImplemented extends Error {
    constructor(public readonly opCode: number) {
        super(`Instruction not implemented! Opcode = ${opCode}`);
    }
}
