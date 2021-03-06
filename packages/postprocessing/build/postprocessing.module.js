var Horizontal = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 512 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_amount;\n\n    void main() {\n        vec4 sum = vec4(0.0);\n        float hh = (1.0 / u_amount);\n\n        sum += texture(u_input, vec2(v_uv.x - 4.0 * hh, v_uv.y)) * 0.051;\n        sum += texture(u_input, vec2(v_uv.x - 3.0 * hh, v_uv.y)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x - 2.0 * hh, v_uv.y)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x - 1.0 * hh, v_uv.y)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;\n        sum += texture(u_input, vec2(v_uv.x + 1.0 * hh, v_uv.y)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x + 2.0 * hh, v_uv.y)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x + 3.0 * hh, v_uv.y)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x + 4.0 * hh, v_uv.y)) * 0.051;\n\n        outColor = sum;\n    }'

};

var Vertical = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 512 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_amount;\n\n    void main() {\n        vec4 sum = vec4(0.0);\n        float vv = (1.0 / u_amount);\n\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 4.0 * vv)) * 0.051;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 3.0 * vv)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 2.0 * vv)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 1.0 * vv)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 1.0 * vv)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 2.0 * vv)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 3.0 * vv)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 4.0 * vv)) * 0.051;\n\n        outColor = sum;\n    }'

};



var index = /*#__PURE__*/Object.freeze({
    Horizontal: Horizontal,
    Vertical: Vertical
});

var Bleach = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_opacity: { type: 'float', value: 1.0 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_opacity;\n\n    void main() {\n\n        vec4 base = texture(u_input, v_uv);\n\n        vec3 lumCoeff = vec3(0.25, 0.65, 0.1);\n        float lum = dot(lumCoeff, base.rgb);\n        vec3 blend = vec3(lum);\n\n        float L = min(1.0, max(0.0, 10.0 * (lum - 0.45)));\n\n        vec3 result1 = 2.0 * base.rgb * blend;\n        vec3 result2 = 1.0 - 2.0 * (1.0 - blend) * (1.0 - base.rgb);\n\n        vec3 newColor = mix(result1, result2, L);\n\n        float A2 = u_opacity * base.a;\n        vec3 mixRGB = A2 * newColor.rgb;\n        mixRGB += ((1.0 - A2) * base.rgb);\n\n        outColor = vec4(mixRGB, base.a);\n    }'

};

var Brightness = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_treshold: { type: 'float', value: 0.0 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_treshold;\n\n    void main() {\n        // relative luminance\n        vec3 lum = vec3(0.2126, 0.7152, 0.0722);\n        vec4 c = texture(u_input, v_uv);\n\n        float luminance = dot(lum, c.xyz);\n        luminance = max(0.0, luminance - u_treshold);\n        c.xyz *= sign(luminance);\n        c.a = 1.0;\n\n        outColor = c;\n    }'

};

var DotScreen = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_size: { type: 'float', value: 256 },
        u_center: { type: 'vec2', value: [0.5, 0.5] },
        u_angle: { type: 'float', value: 1.57 },
        u_scale: { type: 'float', value: 1.0 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n\n    uniform vec2 u_center;\n    uniform float u_angle;\n    uniform float u_scale;\n    uniform float u_size;\n\n    float pattern() {\n        float s = sin(u_angle), c = cos(u_angle);\n\n        vec2 tex = v_uv * vec2(u_size) - u_center;\n        vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * u_scale;\n\n        return (sin(point.x) * sin(point.y)) * 4.0;\n    }\n\n    void main() {\n        vec4 color = texture(u_input, v_uv);\n\n        float average = (color.r + color.g + color.b) / 3.0;\n\n        outColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n    }'

};

var Horizontal$1 = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 128 },
        u_xscreenpos: { type: 'float', value: 0.5 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_amount;\n    uniform float u_xscreenpos;\n\n    void main() {\n        vec4 sum = vec4(0.0);\n        float hh = (1.0 / u_amount) * abs(u_xscreenpos - v_uv.x);\n\n        sum += texture(u_input, vec2(v_uv.x - 4.0 * hh, v_uv.y)) * 0.051;\n        sum += texture(u_input, vec2(v_uv.x - 3.0 * hh, v_uv.y)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x - 2.0 * hh, v_uv.y)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x - 1.0 * hh, v_uv.y)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;\n        sum += texture(u_input, vec2(v_uv.x + 1.0 * hh, v_uv.y)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x + 2.0 * hh, v_uv.y)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x + 3.0 * hh, v_uv.y)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x + 4.0 * hh, v_uv.y)) * 0.051;\n\n        outColor = sum;\n    }'

};

var Vertical$1 = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amount: { type: 'float', value: 128 },
        u_yscreenpos: { type: 'float', value: 0.5 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_amount;\n    uniform float u_yscreenpos;\n\n    void main() {\n        vec4 sum = vec4(0.0);\n        float vv = (1.0 / u_amount) * abs(u_yscreenpos - v_uv.y);\n\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 4.0 * vv)) * 0.051;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 3.0 * vv)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 2.0 * vv)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y - 1.0 * vv)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y ) ) * 0.1633;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 1.0 * vv)) * 0.1531;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 2.0 * vv)) * 0.12245;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 3.0 * vv)) * 0.0918;\n        sum += texture(u_input, vec2(v_uv.x, v_uv.y + 4.0 * vv)) * 0.051;\n\n        outColor = sum;\n    }'

};



var index$1 = /*#__PURE__*/Object.freeze({
    Horizontal: Horizontal$1,
    Vertical: Vertical$1
});

var Noise = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_seed: { type: 'float', value: 0.01 },
        u_amount: { type: 'float', value: 0.5 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_seed;\n    uniform float u_amount;\n\n    float rand(vec2 uv) {\n        return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    void main() {\n        vec4 color = texture(u_input, v_uv);\n        float random = rand(gl_FragCoord.xy * u_seed);\n        float diff = (random - 0.5) * u_amount;\n\n        color.r += diff;\n        color.g += diff;\n        color.b += diff;\n\n        outColor = color;\n    }'

};

var HueSaturation = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_hue: { type: 'float', value: 0.0 }, // -1 to 1
        u_saturation: { type: 'float', value: 0.0 } // -1 to 1
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_hue;\n    uniform float u_saturation;\n\n    void main() {\n        vec4 color = texture(u_input, v_uv);\n        float angle = u_hue * 3.14159265;\n        float s = sin(angle), c = cos(angle);\n        vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;\n        float len = length(color.rgb);\n        color.rgb = vec3(\n            dot(color.rgb, weights.xyz),\n            dot(color.rgb, weights.zxy),\n            dot(color.rgb, weights.yzx)\n        );\n\n        float average = (color.r + color.g + color.b) / 3.0;\n        if (u_saturation > 0.0) {\n            color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - u_saturation));\n        } else {\n            color.rgb += (average - color.rgb) * (-u_saturation);\n        }\n\n        outColor = color;\n    }'

};

// inspired by: https://www.shadertoy.com/view/4t23Rc
var Glitch = {

    uniforms: {
        u_input: { type: 'sampler2D', value: null },
        u_amplitude: { type: 'float', value: 3.0 },
        u_speed: { type: 'float', value: 2.0 }
    },

    vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

    fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n    uniform float u_speed;\n    uniform float u_amplitude;\n\n    vec4 rgbShift(vec2 p, vec4 shift) {\n        shift *= 2.0 * shift.w - 1.0;\n        vec2 rs = vec2(shift.x, -shift.y);\n        vec2 gs = vec2(shift.y, -shift.z);\n        vec2 bs = vec2(shift.z, -shift.x);\n\n        float r = texture(u_input, p + rs).x;\n        float g = texture(u_input, p + gs).y;\n        float b = texture(u_input, p + bs).z;\n\n        return vec4(r, g, b, 1.0);\n    }\n\n    float rand(vec2 uv) {\n        return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    vec4 noise(vec2 n) {\n        float r = rand(n.xy + 0.1);\n        float g = rand(n.xy + 0.2);\n        float b = rand(n.xy + 0.3);\n        return vec4(r - 0.5, g - 0.5, b - 0.5, 1.0);\n    }\n\n    vec4 vec4pow(vec4 v, float p) {\n        return vec4(pow(v.x, p), pow(v.y, p), pow(v.z, p), v.w);\n    }\n\n    void main() {\n        vec4 color = texture(u_input, v_uv);\n\n        vec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n\n        float v = clamp(sin(iGlobalTime * u_speed), 0.0, 1.0);\n        vec4 shift = vec4pow(noise(vec2(1.0 - v, 0.0)), 8.0) * vec4(u_amplitude, u_amplitude, u_amplitude, 1.0) * v;\n\n        c += rgbShift(v_uv, shift);\n\n        outColor = c;\n    }'
};

// resources:
// http://evanw.github.io/glfx.js/demo/
// http://pixijs.io/pixi-filters/tools/demo/
// https://github.com/mrdoob/three.js/tree/dev/examples/js/shaders
// https://github.com/spite/Wagner/tree/master/fragment-shaders
// https://shadertoy.com

export { index as blur, Bleach, Brightness, DotScreen, index$1 as tiltShift, Noise, HueSaturation, Glitch };
