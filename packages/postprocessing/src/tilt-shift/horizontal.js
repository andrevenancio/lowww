const Horizontal = {
    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 128 },
        u_xscreenpos: { type: 'float', value: 0.5 },
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
    uniform float u_amount;
    uniform float u_xscreenpos;

    void main() {
        vec4 sum = vec4(0.0);
        float hh = (1.0 / u_amount) * abs(u_xscreenpos - v_uv.x);

        sum += texture(u_input, vec2(v_uv.x - 4.0 * hh, v_uv.y)) * 0.051;
        sum += texture(u_input, vec2(v_uv.x - 3.0 * hh, v_uv.y)) * 0.0918;
        sum += texture(u_input, vec2(v_uv.x - 2.0 * hh, v_uv.y)) * 0.12245;
        sum += texture(u_input, vec2(v_uv.x - 1.0 * hh, v_uv.y)) * 0.1531;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;
        sum += texture(u_input, vec2(v_uv.x + 1.0 * hh, v_uv.y)) * 0.1531;
        sum += texture(u_input, vec2(v_uv.x + 2.0 * hh, v_uv.y)) * 0.12245;
        sum += texture(u_input, vec2(v_uv.x + 3.0 * hh, v_uv.y)) * 0.0918;
        sum += texture(u_input, vec2(v_uv.x + 4.0 * hh, v_uv.y)) * 0.051;

        outColor = sum;
    }`,
};

export default Horizontal;
