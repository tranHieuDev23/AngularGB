export class PcmPlayerOptions {
    constructor(
        public readonly channels = 1,
        public readonly sampleRate = 48000,
        public readonly flushingTime = 1000.0 / 60
    ) { }
}

export class PcmPlayer {
    private readonly samplePerFlush: number;
    private readonly audioContext: AudioContext;
    private readonly flushInterval: any;

    private audioBuffers: AudioBuffer[] = [];
    private isMuted: boolean = false;

    private currentBufferIter: number;
    private startTime: number;

    constructor(
        private readonly options = new PcmPlayerOptions()
    ) {
        this.samplePerFlush = options.sampleRate * options.flushingTime / 1000.0;
        this.audioContext = new AudioContext();
        this.flushInterval = setInterval(() => this.flush(), options.flushingTime);

        this.currentBufferIter = this.samplePerFlush;
        this.startTime = this.audioContext.currentTime;
    }

    public feed(samples: number[]): void {
        let currentBuffer: AudioBuffer;
        if (this.currentBufferIter === this.samplePerFlush) {
            currentBuffer = this.createNewBuffer();
            this.audioBuffers.push(currentBuffer);
            this.currentBufferIter = 0;
        } else {
            currentBuffer = this.audioBuffers[this.audioBuffers.length - 1];
        }
        samples.forEach((item, index) => {
            currentBuffer.getChannelData(index)[this.currentBufferIter] = item;
        });
        this.currentBufferIter++;
    }

    public toggleAudio(mute: boolean): void {
        this.isMuted = mute;
    }

    public release(): void {
        clearInterval(this.flushInterval);
        this.audioContext.close().then();
    }

    private createNewBuffer(): AudioBuffer {
        return this.audioContext.createBuffer(
            this.options.channels, this.samplePerFlush, this.options.sampleRate
        );
    }

    private flush(): void {
        const emptyBuffer = this.audioBuffers.length === 0;
        const firstBufferNotFull = this.audioBuffers.length === 1 && this.currentBufferIter < this.samplePerFlush;
        if (emptyBuffer || firstBufferNotFull) {
            return;
        }
        // Copy audio buffer
        const audioBuffer = this.audioBuffers.shift();
        // Play the new buffer
        const currentTime = this.audioContext.currentTime;
        const offset = Math.max(currentTime - this.startTime, 0);
        if (!this.isMuted) {
            const bufferSource = this.audioContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(this.audioContext.destination);
            bufferSource.start(this.startTime, offset);
        }
        this.startTime = currentTime + audioBuffer.duration;
    }
}