const Bleach = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_opacity: { type: 'float', value: 1.0 },
    },

    vertex: `
    out vec2 v_uv;
    void main() {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
        v_uv = a_uv;
    }`,

    fragment: `
    in vec2 v_uv;

    uniform sampler2D u_input;
    uniform float u_opacity;

    void main() {

        vec4 base = texture(u_input, v_uv);

        vec3 lumCoeff = vec3(0.25, 0.65, 0.1);
        float lum = dot(lumCoeff, base.rgb);
        vec3 blend = vec3(lum);

        float L = min(1.0, max(0.0, 10.0 * (lum - 0.45)));

        vec3 result1 = 2.0 * base.rgb * blend;
        vec3 result2 = 1.0 - 2.0 * (1.0 - blend) * (1.0 - base.rgb);

        vec3 newColor = mix(result1, result2, L);

        float A2 = u_opacity * base.a;
        vec3 mixRGB = A2 * newColor.rgb;
        mixRGB += ((1.0 - A2) * base.rgb);

        outColor = vec4(mixRGB, base.a);
    }`,

};

export default Bleach;
