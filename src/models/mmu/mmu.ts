export interface Mmu {
    readByte(address: number): number;
    readWord(address: number): number;
    writeByte(address: number, value: number): void;
    writeWord(address: number, value: number): void;
    randomize(): void;
    reset(): void;
}
