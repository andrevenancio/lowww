const Vertical = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 128 },
        u_yscreenpos: { type: 'float', value: 0.5 },
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
    uniform float u_yscreenpos;

    void main() {
        vec4 sum = vec4(0.0);
        float vv = (1.0 / u_amount) * abs(u_yscreenpos - v_uv.y);

        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 4.0 * vv)) * 0.051;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 3.0 * vv)) * 0.0918;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 2.0 * vv)) * 0.12245;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 1.0 * vv)) * 0.1531;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 1.0 * vv)) * 0.1531;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 2.0 * vv)) * 0.12245;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 3.0 * vv)) * 0.0918;
        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 4.0 * vv)) * 0.051;

        outColor = sum;
    }`,

};

export default Vertical;
