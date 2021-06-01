export function randomInteger(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low)) + low;
}
