import { Lcd } from "./lcd";

export class CanvasLcd implements Lcd {
    private readonly graphicBuffer: number[][];

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly pixelSize: number,
        private readonly palettes: string[]
    ) {
        this.graphicBuffer = [];
        for (let x = 0; x < 160; x++) {
            const col = [];
            for (let y = 0; y < 144; y++) {
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
        for (let x = 0; x < this.graphicBuffer.length; x++) {
            for (let y = 0; y < this.graphicBuffer[x].length; y++) {
                this.drawPixel(context, x, y, this.palettes[this.graphicBuffer[x][y]]);
            }
        }
    }

    clear(): void {
        const context = this.canvas.getContext("2d");
        if (!context) {
            return;
        }
        for (let x = 0; x < this.graphicBuffer.length; x++) {
            for (let y = 0; y < this.graphicBuffer[x].length; y++) {
                this.drawPixel(context, x, y, this.palettes[0]);
            }
        }
    }

    private drawPixel(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        context.fillStyle = color;
        context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
}
