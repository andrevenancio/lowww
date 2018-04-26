import { vec3 } from 'gl-matrix';

// pvt
function normalize(array) {
    return vec3.fromValues(
        array[0] / 255,
        array[1] / 255,
        array[2] / 255,
    );
}

export function hexIntToRgb(hex) {
    const r = hex >> 16;
    const g = hex >> 8 & 0xFF; // eslint-disable-line
    const b = hex & 0xFF;
    return vec3.fromValues(r, g, b);
}

export function hexStringToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? vec3.fromValues(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ) : null;
}

export function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}

export function rgbToHex(r, g, b) {
    const hexR = componentToHex(r);
    const hexG = componentToHex(g);
    const hexB = componentToHex(b);
    return `#${hexR}${hexG}${hexB}`;
}

export function convert(hex) {
    const color = vec3.create();
    const rgb = typeof hex === 'number' ? hexIntToRgb(hex) : hexStringToRgb(hex);
    vec3.copy(color, normalize(rgb));
    return color;
}
