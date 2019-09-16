const LIGHT = {
    factory: () => {
        return `
        // factory light
        vec3 inverseLightDirection = normalize(vec3(-0.25, -0.25, 1.0));
        vec3 directionalColor = vec3(max(dot(v_normal, inverseLightDirection), 0.0));
        vec3 factory = mix(vec3(0.0), directionalColor, 0.989); // light intensity
        base.rgb *= factory;

        ${LIGHT.directional()}`;
    },

    directional: () => {
        return `
            // vec3 dcolor = vec3(0.01);
            //
            // for (int i = 0; i < MAX_DIRECTIONAL; i++) {
            //     vec3 inverseLightDirection = normalize(directionalLights[i].dlPosition.xyz);
            //     vec3 light = vec3(max(dot(v_normal, inverseLightDirection), 0.0));
            //     vec3 directionalColor = directionalLights[i].dlColor.rgb * light;
            //     dcolor += mix(dcolor, directionalColor, directionalLights[i].flIntensity);
            // }
            // dcolor /= float(MAX_DIRECTIONAL);
            //
            // base.rgb *= dcolor;
        `;
    },
};

export { LIGHT };
