import { GbMmu } from "../mmu/gb-mmu";

export class GbGpu {
    private mode: number = 0;
    private modeCycleCount: number = 0;
    private currentScanline: number = 0;

    constructor(
        private readonly mmu: GbMmu
    ) { }

    public step(deltaCycleCount: number): void {
        this.modeCycleCount += deltaCycleCount;
        switch (this.mode) {
            case 0:
                this.stepMode0();
                return;
            case 1:
                this.stepMode1();
                return;
            case 2:
                this.stepMode2();
                return;
            case 3:
                this.stepMode3();
                return;
        }
    }

    private stepMode0(): void {
        if (this.modeCycleCount >= 204) {
            this.modeCycleCount = 0;
            this.currentScanline++;
            if (this.currentScanline === 144) {
                this.mode = 1;
            } else {
                this.mode = 2;
            }
        }
    }

    private stepMode1(): void {
        if (this.modeCycleCount >= 456) {
            this.modeCycleCount = 0;
            this.currentScanline++;
            if (this.currentScanline > 153) {
                this.mode = 2;
                this.currentScanline = 0;
            }
        }
    }

    private stepMode2(): void {
        if (this.modeCycleCount >= 80) {
            this.mode = 3;
            this.modeCycleCount = 0;
        }
    }

    private stepMode3(): void {
        if (this.modeCycleCount >= 172) {
            this.modeCycleCount = 0;
            this.mode = 0;
        }
    }
}