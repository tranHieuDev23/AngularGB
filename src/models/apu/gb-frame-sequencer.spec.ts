import { GbFrameSequencer } from "./gb-frame-sequencer";

// The Game Boy frame sequencer steps at 512 Hz. The codebase meters time at
// 4,194,304 cycle units per wall-clock second, so one step every 8192 cycle
// units. See https://gbdev.io/pandocs/Audio_details.html#div-apu.
const CYCLES_PER_STEP = 8192;
const CYCLES_PER_SECOND = 4194304;

describe("GbFrameSequencer", () => {
    let fs: GbFrameSequencer;

    beforeEach(() => {
        fs = new GbFrameSequencer();
        // Production code calls reset() when the APU is turned on, putting the
        // sequencer in a state where the next step advances to step 0.
        fs.reset();
    });

    function advanceOneStep(): void {
        fs.step(CYCLES_PER_STEP);
    }

    it("does not advance before CYCLES_PER_STEP cycle units have elapsed", () => {
        // Feed (CYCLES_PER_STEP - 1) then 1 more — total is exactly one step.
        // With the bug (period 2048), the first call already advanced the FS,
        // so the second call would advance it again to step 2 (length+sweep).
        fs.step(CYCLES_PER_STEP - 1);
        fs.step(1);
        expect(fs.getShouldClockLength()).toBe(true);   // step 0
        expect(fs.getShouldClockSweep()).toBe(false);   // step 0 (sweep is step 2)
    });

    it("clocks length on steps 0, 2, 4, 6", () => {
        const lengthFlags: boolean[] = [];
        for (let i = 0; i < 8; i++) {
            advanceOneStep();
            lengthFlags.push(fs.getShouldClockLength());
        }
        expect(lengthFlags).toEqual([true, false, true, false, true, false, true, false]);
    });

    it("clocks sweep on steps 2 and 6", () => {
        const sweepFlags: boolean[] = [];
        for (let i = 0; i < 8; i++) {
            advanceOneStep();
            sweepFlags.push(fs.getShouldClockSweep());
        }
        expect(sweepFlags).toEqual([false, false, true, false, false, false, true, false]);
    });

    it("clocks envelope on step 7", () => {
        const envelopFlags: boolean[] = [];
        for (let i = 0; i < 8; i++) {
            advanceOneStep();
            envelopFlags.push(fs.getShouldClockEnvelop());
        }
        expect(envelopFlags).toEqual([false, false, false, false, false, false, false, true]);
    });

    it("envelope clocks 64 times over one wall-clock second worth of cycle units", () => {
        // 4,194,304 cycle units / 8192 = 512 frame-sequencer steps per second.
        // Envelope ticks on step 7 only → 512 / 8 = 64 envelope clocks/sec.
        // Pinning the rate this way will fail loudly if the constant ever drifts.
        let envelopClocks = 0;
        const cyclesPerTick = 4; // emulate ~1 M-cycle granularity
        for (let consumed = 0; consumed < CYCLES_PER_SECOND; consumed += cyclesPerTick) {
            fs.step(cyclesPerTick);
            if (fs.getShouldClockEnvelop()) {
                envelopClocks++;
            }
        }
        expect(envelopClocks).toBe(64);
    });
});
