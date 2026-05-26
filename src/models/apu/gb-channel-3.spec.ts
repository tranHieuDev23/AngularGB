import { GbChannel3 } from "./gb-channel-3";
import { GbFrameSequencer } from "./gb-frame-sequencer";

// Pan Docs NR32 (FF1C) bits 6-5 — Output Level
//   00: Mute (output shifted right by 4 → always 0)
//   01: 100% volume
//   10:  50% volume
//   11:  25% volume
// "Mute" only changes the output level shift; it does NOT clear the channel's
// enabled state. The channel still runs and its NR52 status bit stays set
// until length expiry or DAC-off (NR30 bit 7 = 0).
describe("GbChannel3", () => {
    let fs: GbFrameSequencer;
    let channel: GbChannel3;

    beforeEach(() => {
        fs = new GbFrameSequencer();
        fs.reset();
        channel = new GbChannel3(fs);
    });

    function enableAndTrigger(): void {
        // DAC on (NR30 bit 7), length=0, output level=100%, freq low=0, trigger
        channel.setNr30(0x80);
        channel.setNr31(0);
        channel.setNr32(0x20);
        channel.setNr33(0);
        channel.setNr34(0x80);
    }

    it("starts disabled before any trigger", () => {
        expect(channel.getIsChannelDisabled()).toBe(true);
    });

    it("becomes enabled after DAC on + trigger", () => {
        enableAndTrigger();
        expect(channel.getIsChannelDisabled()).toBe(false);
    });

    it("does NOT disable the channel when NR32 selects mute (level 00)", () => {
        // Reproduces the bug: writing NR32=00 while channel is playing should
        // silence output via shift, not disable the channel.
        enableAndTrigger();
        channel.setNr32(0x00);
        expect(channel.getIsChannelDisabled()).toBe(false);
    });

    it("output level 00 silences output via shift", () => {
        enableAndTrigger();
        channel.setNr32(0x00);
        // A 4-bit wave value shifted right by 4 is always 0, regardless of data.
        expect(channel.getCurrentOutput()).toBe(0);
    });

    it("disables the channel when DAC turns off (NR30 bit 7 = 0)", () => {
        enableAndTrigger();
        channel.setNr30(0x00);
        expect(channel.getIsChannelDisabled()).toBe(true);
    });
});
