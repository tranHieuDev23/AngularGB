import { GbInterrupts } from "../mmu/mmu-wrappers/gb-interrupts";
import { GbTimer } from "./gb-timer";

// The emulator's main loop consumes 4,194,304 cycle units per wall-clock second
// (CYCLE_PER_FRAME=69905 × 60 setInterval ticks). To match real DMG rates, the
// timer's DIV and TIMA must tick at the same wall-clock frequencies a real
// DMG produces, scaled to the emulator's cycle rate. This pins those rates.
const CYCLES_PER_SECOND = 4194304;

function countDivTicks(timer: GbTimer, interrupts: GbInterrupts, totalCycles: number): number {
    let ticks = 0;
    let lastDiv = timer.getDivTimer();
    // Feed in small chunks so we never skip a tick. Smallest GB instruction is
    // 1 M-cycle (1 cycle unit here); largest is ~6.
    const chunk = 4;
    for (let consumed = 0; consumed < totalCycles; consumed += chunk) {
        timer.step(chunk);
        const div = timer.getDivTimer();
        if (div !== lastDiv) {
            const delta = (div - lastDiv + 256) & 0xff;
            ticks += delta;
            lastDiv = div;
        }
    }
    return ticks;
}

function countTimaTicks(timer: GbTimer, interrupts: GbInterrupts, totalCycles: number): number {
    let ticks = 0;
    let lastTima = timer.getCounterTimer();
    const chunk = 4;
    for (let consumed = 0; consumed < totalCycles; consumed += chunk) {
        timer.step(chunk);
        const tima = timer.getCounterTimer();
        if (tima !== lastTima) {
            // TIMA may have overflowed and reset to TMA; count every tick by
            // computing the absolute difference modulo 256.
            const delta = (tima - lastTima + 256) & 0xff;
            ticks += delta || 256; // a 0 delta after overflow with TMA=lastTima is impossible here
            lastTima = tima;
        }
    }
    return ticks;
}

describe("GbTimer wall-clock rates", () => {
    let interrupts: GbInterrupts;
    let timer: GbTimer;

    beforeEach(() => {
        interrupts = new GbInterrupts();
        timer = new GbTimer(interrupts);
    });

    it("DIV ticks at 16,384 Hz wall-clock", () => {
        // Real DMG: DIV increments at 16,384 Hz.
        const ticks = countDivTicks(timer, interrupts, CYCLES_PER_SECOND);
        // Allow ±1 for boundary alignment.
        expect(ticks).toBeGreaterThanOrEqual(16383);
        expect(ticks).toBeLessThanOrEqual(16385);
    });

    it("TIMA mode 0 ticks at 4,096 Hz wall-clock when enabled", () => {
        timer.setTimerControl(0b100); // bit 2 = enable, mode = 00
        // Set TMA to 0 so TIMA overflows back to 0 — easier to count.
        timer.setModuloTimer(0);
        const ticks = countTimaTicks(timer, interrupts, CYCLES_PER_SECOND);
        expect(ticks).toBeGreaterThanOrEqual(4095);
        expect(ticks).toBeLessThanOrEqual(4097);
    });

    it("TIMA mode 3 ticks at 16,384 Hz wall-clock when enabled", () => {
        timer.setTimerControl(0b111); // enable + mode 11
        timer.setModuloTimer(0);
        const ticks = countTimaTicks(timer, interrupts, CYCLES_PER_SECOND);
        expect(ticks).toBeGreaterThanOrEqual(16383);
        expect(ticks).toBeLessThanOrEqual(16385);
    });
});
