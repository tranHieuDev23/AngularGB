import { GbSpeaker, GbSpeakerInput } from "./gb-speaker";
import { PcmPlayer } from "./pcm-player";

// The emulator delivers 4,194,304 cycle units per wall-clock second. The
// speaker must hand exactly sampleRate samples to the PcmPlayer in that
// window — otherwise the player's buffer queue accumulates (samples generated
// faster than played) or runs dry (slower), producing growing SFX latency or
// dropouts. floor() in `Math.floor(4194304 / sampleRate)` was the root cause
// of the previous drift.
const CYCLES_PER_SECOND = 4194304;

describe("GbSpeaker sample rate", () => {
    it("hands the player exactly sampleRate samples per wall-clock second worth of cycles", () => {
        const speaker = new GbSpeaker();
        const player: PcmPlayer = (speaker as any).player;
        const feedSpy = spyOn(player, "feed").and.callFake(() => { /* no-op */ });

        const input = new GbSpeakerInput(0, 0);
        // Feed cycle units in instruction-sized chunks (1-6 M-cycles is the
        // realistic CPU instruction range, but we use a fixed small chunk to
        // exercise the accumulator the same way the CPU loop would).
        const chunk = 4;
        for (let consumed = 0; consumed < CYCLES_PER_SECOND; consumed += chunk) {
            speaker.step(chunk, input);
        }

        // Allow ±1 for boundary alignment.
        expect(feedSpy.calls.count()).toBeGreaterThanOrEqual(speaker.sampleRate - 1);
        expect(feedSpy.calls.count()).toBeLessThanOrEqual(speaker.sampleRate + 1);

        speaker.release();
    });
});
