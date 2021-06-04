export interface Mbc {
    getCode(): number;
    readRom(address: number): number;
    readRam(address: number): number;
    writeRom(address: number, value: number): void;
    writeRam(address: number, value: number): void;
}
