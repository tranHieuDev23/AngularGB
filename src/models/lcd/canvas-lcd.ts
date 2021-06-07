import { Lcd } from "./lcd";

export class CanvasLcd implements Lcd {
    private readonly graphicBuffer: number[][];

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly pixelSize: number,
        private readonly palletes: string[]
    ) {
        this.graphicBuffer = new Array<number[]>(160).fill(new Array<number>(144));
    }

    updatePixel(x: number, y: number, colorIndex: number): void {
        this.graphicBuffer[x][y] = colorIndex;
    }

    draw(): void {
        requestAnimationFrame(() => {
            const context = this.canvas.getContext('2d');
            if (!context) {
                return;
            }
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let x = 0; x < this.graphicBuffer.length; x++) {
                for (let y = 0; y < this.graphicBuffer[x].length; y++) {
                    this.drawPixel(context, x, y, this.palletes[this.graphicBuffer[x][y]]);
                }
            }
        });
    }

    private drawPixel(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        context.fillStyle = color;
        context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
}
