const Noise = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_seed: { type: 'float', value: 0.01 },
        u_amount: { type: 'float', value: 0.5 },
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
    uniform float u_seed;
    uniform float u_amount;

    float rand(vec2 uv) {
        return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec4 color = texture(u_input, v_uv);
        float random = rand(gl_FragCoord.xy * u_seed);
        float diff = (random - 0.5) * u_amount;

        color.r += diff;
        color.g += diff;
        color.b += diff;

        outColor = color;
    }`,

};

export default Noise;
