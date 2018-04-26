function base() {
    return `
    float fogStart = fogSettings.y;
    float fogEnd = fogSettings.z;
    float fogDensity = fogSettings.a;

    float dist = 0.0;
    float fogFactor = 0.0;
    dist = gl_FragCoord.z / gl_FragCoord.w;`;
}

const FOG = {
    linear: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = (fogEnd - dist) / (fogEnd - fogStart);
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
    exponential: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = 1.0 / exp(dist * fogDensity);
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
    exponential2: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
};

export {
    FOG,
};
