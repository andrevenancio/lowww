const HueSaturation = {
    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_hue: { type: 'float', value: 0.0 }, // -1 to 1
        u_saturation: { type: 'float', value: 0.0 }, // -1 to 1
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
    uniform float u_hue;
    uniform float u_saturation;

    void main() {
        vec4 color = texture(u_input, v_uv);
        float angle = u_hue * 3.14159265;
        float s = sin(angle), c = cos(angle);
        vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
        float len = length(color.rgb);
        color.rgb = vec3(
            dot(color.rgb, weights.xyz),
            dot(color.rgb, weights.zxy),
            dot(color.rgb, weights.yzx)
        );

        float average = (color.r + color.g + color.b) / 3.0;
        if (u_saturation > 0.0) {
            color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - u_saturation));
        } else {
            color.rgb += (average - color.rgb) * (-u_saturation);
        }

        outColor = color;
    }`,
};

export default HueSaturation;
