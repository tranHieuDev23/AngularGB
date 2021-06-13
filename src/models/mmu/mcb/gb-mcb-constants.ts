export const ROM_SIZE_32_KB = 0x00;
export const ROM_SIZE_64_KB = 0x01;
export const ROM_SIZE_128_KB = 0x02;
export const ROM_SIZE_256_KB = 0x03;
export const ROM_SIZE_512_KB = 0x04;
export const ROM_SIZE_1_MB = 0x05;
export const ROM_SIZE_2_MB = 0x06;
export const ROM_SIZE_4_MB = 0x07;
export const ROM_SIZE_8_MB = 0x08;

export const KB = 1024;
export const MB = 1024 * KB;

export function getRomSize(romSizeCode: number): number {
    switch (romSizeCode) {
        case ROM_SIZE_32_KB:
            return 32 * KB;
        case ROM_SIZE_64_KB:
            return 64 * KB;
        case ROM_SIZE_128_KB:
            return 128 * KB;
        case ROM_SIZE_256_KB:
            return 256 * KB;
        case ROM_SIZE_512_KB:
            return 512 * KB;
        case ROM_SIZE_1_MB:
            return MB;
        case ROM_SIZE_2_MB:
            return 2 * MB;
        case ROM_SIZE_4_MB:
            return 4 * MB;
        case ROM_SIZE_4_MB:
            return 4 * MB;
        default:
            throw new Error(`Unsupported ROM size code: ${romSizeCode}`);
    }
}

export const RAM_SIZE_0 = 0x00;
export const RAM_SIZE_8_KB = 0x02;
export const RAM_SIZE_32_KB = 0x03;
export const RAM_SIZE_128_KB = 0x04;
export const RAM_SIZE_64_KB = 0x05;

export function getRamSize(romSizeCode: number): number {
    switch (romSizeCode) {
        case RAM_SIZE_0:
            return 0;
        case RAM_SIZE_8_KB:
            return 8 * KB;
        case RAM_SIZE_32_KB:
            return 32 * KB;
        case RAM_SIZE_128_KB:
            return 128 * KB;
        case RAM_SIZE_64_KB:
            return 64 * KB;
        default:
            throw new Error(`Unsupported RAM size code: ${romSizeCode}`);
    }
}