export class PcmPlayerOptions {
    constructor(
        public readonly channels = 1,
        public readonly flushingTime = 1000.0 / 60
    ) { }
}

export class PcmPlayer {
    private readonly audioContext: AudioContext;
    private readonly samplePerFlush: number;
    private readonly flushInterval: any;

    private audioBuffers: AudioBuffer[] = [];
    private isMuted: boolean = false;

    private currentBufferIter: number;
    // The audio-context time at which the next buffer will start. We schedule
    // buffers back-to-back; whenever we fall behind real time we snap forward
    // to currentTime so we don't slice into the middle of a buffer and create
    // a gap (which the previous implementation did via the `offset` argument).
    private nextStartTime: number;

    constructor(
        private readonly options = new PcmPlayerOptions()
    ) {
        this.audioContext = new AudioContext();
        // Use the audio context's actual sample rate so AudioBuffers don't get
        // resampled by the browser. Browsers ignore the requested rate when
        // creating a default AudioContext and use the OS device rate instead
        // (typically 44100 on macOS, 48000 on Windows).
        this.samplePerFlush = Math.floor(this.audioContext.sampleRate * options.flushingTime / 1000.0);
        this.flushInterval = setInterval(() => this.flush(), options.flushingTime);

        this.currentBufferIter = this.samplePerFlush;
        this.nextStartTime = this.audioContext.currentTime;
    }

    public get sampleRate(): number {
        return this.audioContext.sampleRate;
    }

    public resume(): Promise<void> {
        return this.audioContext.resume();
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
            this.options.channels, this.samplePerFlush, this.audioContext.sampleRate
        );
    }

    private flush(): void {
        // Schedule every complete buffer in the queue. Only the in-progress
        // partial buffer stays. If we only schedule one buffer per flush tick
        // and generation outpaces consumption by even a fraction, the queue
        // grows unboundedly — and so does SFX-to-action latency.
        while (this.hasCompleteBuffer()) {
            const audioBuffer = this.audioBuffers.shift();
            // If we've fallen behind real time, drop the accumulated lag so
            // the next buffer starts cleanly at currentTime rather than being
            // sliced via an offset (which would leave audible gaps).
            const currentTime = this.audioContext.currentTime;
            if (this.nextStartTime < currentTime) {
                this.nextStartTime = currentTime;
            }
            if (!this.isMuted) {
                const bufferSource = this.audioContext.createBufferSource();
                bufferSource.buffer = audioBuffer;
                bufferSource.connect(this.audioContext.destination);
                bufferSource.start(this.nextStartTime);
            }
            this.nextStartTime += audioBuffer.duration;
        }
    }

    private hasCompleteBuffer(): boolean {
        if (this.audioBuffers.length === 0) {
            return false;
        }
        // The last buffer in the queue may still be filling.
        if (this.audioBuffers.length === 1 && this.currentBufferIter < this.samplePerFlush) {
            return false;
        }
        return true;
    }
}
