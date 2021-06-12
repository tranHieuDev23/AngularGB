import { Lcd } from "./lcd";

export class CanvasLcd implements Lcd {
    private readonly graphicBuffer: number[][];
    private readonly oldBuffer: number[][];

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly width: number,
        private readonly height: number,
        private readonly pixelSize: number,
        private readonly palettes: string[]
    ) {
        this.graphicBuffer = [];
        this.oldBuffer = [];
        for (let x = 0; x < width; x++) {
            const col = [];
            const oldCol = [];
            for (let y = 0; y < height; y++) {
                col.push(0);
                oldCol.push(-1);
            }
            this.graphicBuffer.push(col);
            this.oldBuffer.push(oldCol);
        }
    }

    updatePixel(x: number, y: number, colorIndex: number): void {
        this.graphicBuffer[x][y] = colorIndex;
    }

    draw(): void {
        const context = this.canvas.getContext("2d", { alpha: false });
        if (!context) {
            return;
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.drawPixel(context, x, y);
            }
        }
    }

    clear(): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.updatePixel(x, y, 0);
            }
        }
        this.draw();
    }

    public getContentAsBase64(): string {
        return this.canvas.toDataURL();
    }

    private drawPixel(context: CanvasRenderingContext2D, x: number, y: number): void {
        if (this.oldBuffer[x][y] === this.graphicBuffer[x][y]) {
            return;
        }
        this.oldBuffer[x][y] = this.graphicBuffer[x][y];
        context.fillStyle = this.palettes[this.graphicBuffer[x][y]];
        context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
}
