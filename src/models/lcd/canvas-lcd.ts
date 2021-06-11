import { Lcd } from "./lcd";

export class CanvasLcd implements Lcd {
    private readonly graphicBuffer: number[][];

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly width: number,
        private readonly height: number,
        private readonly pixelSize: number,
        private readonly palettes: string[]
    ) {
        this.graphicBuffer = [];
        for (let x = 0; x < width; x++) {
            const col = [];
            for (let y = 0; y < height; y++) {
                col.push(0);
            }
            this.graphicBuffer.push(col);
        }
    }

    updatePixel(x: number, y: number, colorIndex: number): void {
        this.graphicBuffer[x][y] = colorIndex;
    }

    draw(): void {
        const context = this.canvas.getContext("2d");
        if (!context) {
            return;
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.drawPixel(context, x, y, this.palettes[this.graphicBuffer[x][y]]);
            }
        }
    }

    clear(): void {
        const context = this.canvas.getContext("2d");
        if (!context) {
            return;
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.drawPixel(context, x, y, this.palettes[0]);
            }
        }
    }

    public getContentAsBase64(): string {
        return this.canvas.toDataURL();
    }

    private drawPixel(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        context.fillStyle = color;
        context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
}
