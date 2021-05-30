export interface Mmu {
    readByte(address: number): number;
    readWord(address: number): number;
    writeByte(address: number, value: number): number;
    writeWord(address: number, value: number): number;
    randomize(): void;
}
