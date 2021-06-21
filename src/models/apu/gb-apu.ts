import { getBit } from "src/utils/arithmetic-utils";
import { GbSpeaker, GbSpeakerInput } from "../speaker/gb-speaker";
import { GbChannel1 } from "./gb-channel-1";
import { GbChannel2 } from "./gb-channel-2";
import { GbChannel3 } from "./gb-channel-3";
import { GbChannel4 } from "./gb-channel-4";
import { GbFrameSequencer } from "./gb-frame-sequencer";

export class GbApu {
    public readonly fs = new GbFrameSequencer();
    public readonly channel1 = new GbChannel1(this.fs);
    public readonly channel2 = new GbChannel2(this.fs);
    public readonly channel3 = new GbChannel3(this.fs);
    public readonly channel4 = new GbChannel4(this.fs);

    private readonly allChannels = [
        this.channel1,
        this.channel2,
        this.channel3,
        this.channel4
    ];

    private nr50 = 0;
    private nr51 = 0;
    private nr52 = 0;

    constructor(
        private readonly speaker: GbSpeaker
    ) { }

    public getNr50(): number {
        return this.nr50;
    }

    public setNr50(value: number) {
        this.nr50 = value;
    }

    public getNr51(): number {
        return this.nr51;
    }

    public setNr51(value: number) {
        this.nr51 = value;
    }

    public getNr52(): number {
        let value = this.nr52;
        this.allChannels.forEach((channel, index) => {
            if (!channel.getIsChannelDisabled()) {
                value |= 1 << index;
            }
        });
        return value;
    }

    public setNr52(value: number) {
        const oldNr52 = this.nr52;
        this.nr52 = value & 0x80;
        if (oldNr52 !== 0 && this.nr52 === 0) {
            // Turning off APU
            this.allChannels.forEach(channel => channel.reset());
            this.setNr50(0);
            this.setNr51(0);
        }
        if (oldNr52 === 0 && this.nr52 !== 0) {
            // Turning on APU
            this.fs.reset();
        }
    }

    public isOn(): boolean {
        return this.nr52 !== 0;
    }

    public step(deltaCycleCount: number): void {
        if (this.isApuDisabled()) {
            this.speaker.step(deltaCycleCount, new GbSpeakerInput(0, 0));
            return;
        }
        this.fs.step(deltaCycleCount);
        this.allChannels.forEach((channel) => {
            channel.step(deltaCycleCount);
        });
        // Mix stereo speakers
        let leftAmplitude = 0;
        let rightAmplitude = 0;
        this.allChannels.forEach((channel, index) => {
            if (channel.getIsChannelDisabled()) {
                return;
            }
            const currentOutput = channel.getCurrentOutput();
            if (this.isChannelOutputtedToLeft(index)) {
                leftAmplitude += currentOutput;
            }
            if (this.isChannelOutputtedToRight(index)) {
                rightAmplitude += currentOutput;
            }
        });
        leftAmplitude = this.scaleAmplitude(leftAmplitude / 4.0);
        rightAmplitude = this.scaleAmplitude(rightAmplitude / 4.0);
        const leftSignal = this.scaleVolume(this.getLeftVolume()) * leftAmplitude;
        const rightSignal = this.scaleVolume(this.getRightVolume()) * rightAmplitude;
        this.speaker.step(deltaCycleCount, new GbSpeakerInput(leftSignal, rightSignal));
    }

    private getLeftVolume(): number {
        return (this.nr50 >> 4) & 0x7;
    }

    private getRightVolume(): number {
        return this.nr50 & 0x7;
    }

    private isChannelOutputtedToLeft(channelId: number): boolean {
        return getBit(this.nr51, channelId + 4) === 1;
    }

    private isChannelOutputtedToRight(channelId: number): boolean {
        return getBit(this.nr51, channelId) === 1;
    }

    private isApuDisabled(): boolean {
        return getBit(this.nr52, 7) === 0;
    }

    private scaleAmplitude(value: number): number {
        return (1.0 * value / 7.5) - 1.0;
    }

    private scaleVolume(value: number): number {
        return (1.0 + value) / 8.0;
    }
}