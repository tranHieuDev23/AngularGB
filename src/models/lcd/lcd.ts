export interface Lcd {
    updatePixel(x: number, y: number, colorIndex: number): void;
    draw(): void;
    clear(): void;
}
