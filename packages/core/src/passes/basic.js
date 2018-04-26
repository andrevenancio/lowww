const Basic = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
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

    void main() {
        outColor = texture(u_input, v_uv);
    }`,

};

export default Basic;
