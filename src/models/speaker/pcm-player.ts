import { AudioContext } from "standardized-audio-context";

export class PcmPlayerOptions {
    constructor(
        public readonly channels = 1,
        public readonly sampleRate = 48000,
        public readonly flushingTime = 10.0
    ) { }
}

export class PcmPlayer {
    private readonly audioContext: AudioContext;
    private readonly flushInterval: any;

    private samples = [];
    private startTime: number;
    private isMuted: boolean = false;

    constructor(
        private readonly options = new PcmPlayerOptions()
    ) {
        this.audioContext = new AudioContext();
        this.flushInterval = setInterval(() => this.flush(), options.flushingTime);
        this.startTime = this.audioContext.currentTime;
    }

    public feed(samples: number[]): void {
        this.samples.push(...samples);
    }

    public toggleAudio(mute: boolean): void {
        this.isMuted = mute;
    }

    public release(): void {
        clearInterval(this.flushInterval);
        this.audioContext.close().then();
    }

    private flush(): void {
        const currentSample = this.samples;
        this.samples = [];
        if (currentSample.length === 0 || this.isMuted) {
            return;
        }
        // Copy audio buffer
        const bufferLength = currentSample.length / this.options.channels;
        const audioBuffer = this.audioContext.createBuffer(
            this.options.channels, bufferLength, this.options.sampleRate
        );
        for (let channelId = 0; channelId < this.options.channels; channelId++) {
            const audioData = audioBuffer.getChannelData(channelId);
            for (let i = channelId, j = 0; i < currentSample.length; i += this.options.channels, j++) {
                audioData[j] = currentSample[i];
            }
        }
        //
        if (this.startTime < this.audioContext.currentTime) {
            this.startTime = this.audioContext.currentTime;
        }
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.audioContext.destination);
        bufferSource.start(this.startTime);
        this.startTime += audioBuffer.duration;
    }
}