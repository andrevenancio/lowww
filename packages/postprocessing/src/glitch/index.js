// inspired by: https://www.shadertoy.com/view/4t23Rc
const Glitch = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amplitude: { type: 'float', value: 3.0 },
        u_speed: { type: 'float', value: 2.0 },
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
    uniform float u_speed;
    uniform float u_amplitude;

    vec4 rgbShift(vec2 p, vec4 shift) {
        shift *= 2.0 * shift.w - 1.0;
        vec2 rs = vec2(shift.x, -shift.y);
        vec2 gs = vec2(shift.y, -shift.z);
        vec2 bs = vec2(shift.z, -shift.x);

        float r = texture(u_input, p + rs).x;
        float g = texture(u_input, p + gs).y;
        float b = texture(u_input, p + bs).z;

        return vec4(r, g, b, 1.0);
    }

    float rand(vec2 uv) {
        return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec4 noise(vec2 n) {
        float r = rand(n.xy + 0.1);
        float g = rand(n.xy + 0.2);
        float b = rand(n.xy + 0.3);
        return vec4(r - 0.5, g - 0.5, b - 0.5, 1.0);
    }

    vec4 vec4pow(vec4 v, float p) {
        return vec4(pow(v.x, p), pow(v.y, p), pow(v.z, p), v.w);
    }

    void main() {
        vec4 color = texture(u_input, v_uv);

        vec4 c = vec4(0.0, 0.0, 0.0, 1.0);

        float v = clamp(sin(iGlobalTime * u_speed), 0.0, 1.0);
        vec4 shift = vec4pow(noise(vec2(1.0 - v, 0.0)), 8.0) * vec4(u_amplitude, u_amplitude, u_amplitude, 1.0) * v;

        c += rgbShift(v_uv, shift);

        outColor = c;
    }`,
};

export default Glitch;
