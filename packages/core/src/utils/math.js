export function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

export function mod(m, n) {
    return ((m % n) + n) % n;
}
