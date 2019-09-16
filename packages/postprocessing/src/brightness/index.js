const Brightness = {
    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_treshold: { type: 'float', value: 0.0 },
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
    uniform float u_treshold;

    void main() {
        // relative luminance
        vec3 lum = vec3(0.2126, 0.7152, 0.0722);
        vec4 c = texture(u_input, v_uv);

        float luminance = dot(lum, c.xyz);
        luminance = max(0.0, luminance - u_treshold);
        c.xyz *= sign(luminance);
        c.a = 1.0;

        outColor = c;
    }`,
};

export default Brightness;
