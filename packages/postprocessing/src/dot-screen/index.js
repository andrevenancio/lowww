const DotScreen = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_size: { type: 'float', value: 256 },
        u_center: { type: 'vec2', value: [0.5, 0.5] },
        u_angle: { type: 'float', value: 1.57 },
        u_scale: { type: 'float', value: 1.0 },
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

    uniform vec2 u_center;
    uniform float u_angle;
    uniform float u_scale;
    uniform float u_size;

    float pattern() {
        float s = sin(u_angle), c = cos(u_angle);

        vec2 tex = v_uv * vec2(u_size) - u_center;
        vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * u_scale;

        return (sin(point.x) * sin(point.y)) * 4.0;
    }

    void main() {
        vec4 color = texture(u_input, v_uv);

        float average = (color.r + color.g + color.b) / 3.0;

        outColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
    }`,

};

export default DotScreen;
