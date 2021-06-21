export interface SpeakerInput {
    getChannelSample(index: number): number;
}

export interface Speaker<T extends SpeakerInput> {
    step(deltaCycleCount: number, input: T): void;
}