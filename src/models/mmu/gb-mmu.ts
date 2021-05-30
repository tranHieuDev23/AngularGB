import { Mmu } from "./mmu";

export class GbMmu implements Mmu {
    readByte(address: number): number {
        throw new Error("Method not implemented.");
    }
    readWord(address: number): number {
        throw new Error("Method not implemented.");
    }
    writeByte(address: number, value: number): number {
        throw new Error("Method not implemented.");
    }
    writeWord(address: number, value: number): number {
        throw new Error("Method not implemented.");
    }
    randomize(): void {
        throw new Error("Method not implemented.");
    }
}
