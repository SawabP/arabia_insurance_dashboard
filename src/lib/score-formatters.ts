export function invertTenPointScore(value: number): number {
    return +(10 - value).toFixed(1);
}
