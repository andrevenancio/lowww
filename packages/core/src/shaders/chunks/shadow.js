function hard() {
    return `
    float hardShadow1(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;
        float shadow = texture(shadowMap, uv).r;

        float visibility = 1.0;
        float shadowAmount = 0.5;

        float cosTheta = clamp(dot(v_normal, vShadowCoord.xyz), 0.0, 1.0);
        float bias = 0.00005 * tan(acos(cosTheta)); // cosTheta is dot( n,l ), clamped between 0 and 1
        bias = clamp(bias, 0.0, 0.001);

        if (shadow < shadowCoord.z - bias){
            visibility = shadowAmount;
        }
        return visibility;
    }

    float hardShadow2(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;

        float lightDepth1 = texture(shadowMap, uv).r;
        float lightDepth2 = clamp(shadowCoord.z, 0.0, 1.0);
        float bias = 0.0001;

        return step(lightDepth2, lightDepth1+bias);
    }

    float hardShadow3(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;

        float visibility = 1.0;
        float shadowAmount = 0.5;
        float bias = 0.00005;

        vec2 poissonDisk[16];
        poissonDisk[0] = vec2(-0.94201624, -0.39906216);
        poissonDisk[1] = vec2(0.94558609, -0.76890725);
        poissonDisk[2] = vec2(-0.094184101, -0.92938870);
        poissonDisk[3] = vec2(0.34495938, 0.29387760);
        poissonDisk[4] = vec2(-0.91588581, 0.45771432);
        poissonDisk[5] = vec2(-0.81544232, -0.87912464);
        poissonDisk[6] = vec2(-0.38277543, 0.27676845);
        poissonDisk[7] = vec2(0.97484398, 0.75648379);
        poissonDisk[8] = vec2(0.44323325, -0.97511554);
        poissonDisk[9] = vec2(0.53742981, -0.47373420);
        poissonDisk[10] = vec2(-0.26496911, -0.41893023);
        poissonDisk[11] = vec2(0.79197514, 0.19090188);
        poissonDisk[12] = vec2(-0.24188840, 0.99706507);
        poissonDisk[13] = vec2(-0.81409955, 0.91437590);
        poissonDisk[14] = vec2(0.19984126, 0.78641367);
        poissonDisk[15] = vec2(0.14383161, -0.14100790);

        for (int i=0;i<16;i++) {
            if ( texture(shadowMap, uv + poissonDisk[i]/700.0).r < shadowCoord.z-bias ){
                visibility -= 0.02;
            }
        }

        return visibility;
    }

    `;
}

const SHADOW = {
    vertex_pre: () => {
        return `
        uniform mat4 shadowMatrix;
        out vec4 vShadowCoord;`;
    },

    vertex: () => {
        return `
        vShadowCoord = shadowMatrix * modelMatrix * vec4(a_position, 1.0);`;
    },

    fragment_pre: () => {
        return `
        uniform sampler2D shadowMap;
        in vec4 vShadowCoord;

        ${hard()}`;
    },

    fragment: () => {
        return `
        // shadows
        float shadow = 1.0;

        // OPTION 1
        shadow = hardShadow1(shadowMap);

        base *= shadow;
        `;
    },
};

export { SHADOW };
