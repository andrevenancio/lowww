(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.lowww = global.lowww || {}, global.lowww.postprocessing = {})));
}(this, (function (exports) { 'use strict';

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

    exports.blur = index;
    exports.Bleach = Bleach;
    exports.Brightness = Brightness;
    exports.DotScreen = DotScreen;
    exports.tiltShift = index$1;
    exports.Noise = Noise;
    exports.HueSaturation = HueSaturation;
    exports.Glitch = Glitch;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdHByb2Nlc3NpbmcuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9ibHVyL2hvcml6b250YWwuanMiLCIuLi9zcmMvYmx1ci92ZXJ0aWNhbC5qcyIsIi4uL3NyYy9ibGVhY2gvaW5kZXguanMiLCIuLi9zcmMvYnJpZ2h0bmVzcy9pbmRleC5qcyIsIi4uL3NyYy9kb3Qtc2NyZWVuL2luZGV4LmpzIiwiLi4vc3JjL3RpbHQtc2hpZnQvaG9yaXpvbnRhbC5qcyIsIi4uL3NyYy90aWx0LXNoaWZ0L3ZlcnRpY2FsLmpzIiwiLi4vc3JjL25vaXNlL2luZGV4LmpzIiwiLi4vc3JjL2h1ZS1zYXR1cmF0aW9uL2luZGV4LmpzIiwiLi4vc3JjL2dsaXRjaC9pbmRleC5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBIb3Jpem9udGFsID0ge1xuXG4gICAgdW5pZm9ybXM6IHtcbiAgICAgICAgdV9pbnB1dDogeyB0eXBlOiAnc2FtcGxlcjJEJywgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgdV9hbW91bnQ6IHsgdHlwZTogJ2Zsb2F0JywgdmFsdWU6IDUxMiB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfYW1vdW50O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2ZWM0IHN1bSA9IHZlYzQoMC4wKTtcbiAgICAgICAgZmxvYXQgaGggPSAoMS4wIC8gdV9hbW91bnQpO1xuXG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gNC4wICogaGgsIHZfdXYueSkpICogMC4wNTE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gMy4wICogaGgsIHZfdXYueSkpICogMC4wOTE4O1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCAtIDIuMCAqIGhoLCB2X3V2LnkpKSAqIDAuMTIyNDU7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gMS4wICogaGgsIHZfdXYueSkpICogMC4xNTMxO1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55ICkgKSAqIDAuMTYzMztcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LnggKyAxLjAgKiBoaCwgdl91di55KSkgKiAwLjE1MzE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54ICsgMi4wICogaGgsIHZfdXYueSkpICogMC4xMjI0NTtcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LnggKyAzLjAgKiBoaCwgdl91di55KSkgKiAwLjA5MTg7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54ICsgNC4wICogaGgsIHZfdXYueSkpICogMC4wNTE7XG5cbiAgICAgICAgb3V0Q29sb3IgPSBzdW07XG4gICAgfWAsXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhvcml6b250YWw7XG4iLCJjb25zdCBWZXJ0aWNhbCA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfYW1vdW50OiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiA1MTIgfSxcbiAgICB9LFxuXG4gICAgdmVydGV4OiBgXG4gICAgb3V0IHZlYzIgdl91djtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgdl91diA9IGFfdXY7XG4gICAgfWAsXG5cbiAgICBmcmFnbWVudDogYFxuICAgIGluIHZlYzIgdl91djtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW5wdXQ7XG4gICAgdW5pZm9ybSBmbG9hdCB1X2Ftb3VudDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBzdW0gPSB2ZWM0KDAuMCk7XG4gICAgICAgIGZsb2F0IHZ2ID0gKDEuMCAvIHVfYW1vdW50KTtcblxuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55IC0gNC4wICogdnYpKSAqIDAuMDUxO1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55IC0gMy4wICogdnYpKSAqIDAuMDkxODtcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LngsIHZfdXYueSAtIDIuMCAqIHZ2KSkgKiAwLjEyMjQ1O1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55IC0gMS4wICogdnYpKSAqIDAuMTUzMTtcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LngsIHZfdXYueSApICkgKiAwLjE2MzM7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgKyAxLjAgKiB2dikpICogMC4xNTMxO1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55ICsgMi4wICogdnYpKSAqIDAuMTIyNDU7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgKyAzLjAgKiB2dikpICogMC4wOTE4O1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55ICsgNC4wICogdnYpKSAqIDAuMDUxO1xuXG4gICAgICAgIG91dENvbG9yID0gc3VtO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBWZXJ0aWNhbDtcbiIsImNvbnN0IEJsZWFjaCA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfb3BhY2l0eTogeyB0eXBlOiAnZmxvYXQnLCB2YWx1ZTogMS4wIH0sXG4gICAgfSxcblxuICAgIHZlcnRleDogYFxuICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgIHZfdXYgPSBhX3V2O1xuICAgIH1gLFxuXG4gICAgZnJhZ21lbnQ6IGBcbiAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2lucHV0O1xuICAgIHVuaWZvcm0gZmxvYXQgdV9vcGFjaXR5O1xuXG4gICAgdm9pZCBtYWluKCkge1xuXG4gICAgICAgIHZlYzQgYmFzZSA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG5cbiAgICAgICAgdmVjMyBsdW1Db2VmZiA9IHZlYzMoMC4yNSwgMC42NSwgMC4xKTtcbiAgICAgICAgZmxvYXQgbHVtID0gZG90KGx1bUNvZWZmLCBiYXNlLnJnYik7XG4gICAgICAgIHZlYzMgYmxlbmQgPSB2ZWMzKGx1bSk7XG5cbiAgICAgICAgZmxvYXQgTCA9IG1pbigxLjAsIG1heCgwLjAsIDEwLjAgKiAobHVtIC0gMC40NSkpKTtcblxuICAgICAgICB2ZWMzIHJlc3VsdDEgPSAyLjAgKiBiYXNlLnJnYiAqIGJsZW5kO1xuICAgICAgICB2ZWMzIHJlc3VsdDIgPSAxLjAgLSAyLjAgKiAoMS4wIC0gYmxlbmQpICogKDEuMCAtIGJhc2UucmdiKTtcblxuICAgICAgICB2ZWMzIG5ld0NvbG9yID0gbWl4KHJlc3VsdDEsIHJlc3VsdDIsIEwpO1xuXG4gICAgICAgIGZsb2F0IEEyID0gdV9vcGFjaXR5ICogYmFzZS5hO1xuICAgICAgICB2ZWMzIG1peFJHQiA9IEEyICogbmV3Q29sb3IucmdiO1xuICAgICAgICBtaXhSR0IgKz0gKCgxLjAgLSBBMikgKiBiYXNlLnJnYik7XG5cbiAgICAgICAgb3V0Q29sb3IgPSB2ZWM0KG1peFJHQiwgYmFzZS5hKTtcbiAgICB9YCxcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgQmxlYWNoO1xuIiwiY29uc3QgQnJpZ2h0bmVzcyA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfdHJlc2hvbGQ6IHsgdHlwZTogJ2Zsb2F0JywgdmFsdWU6IDAuMCB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfdHJlc2hvbGQ7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIC8vIHJlbGF0aXZlIGx1bWluYW5jZVxuICAgICAgICB2ZWMzIGx1bSA9IHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMik7XG4gICAgICAgIHZlYzQgYyA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG5cbiAgICAgICAgZmxvYXQgbHVtaW5hbmNlID0gZG90KGx1bSwgYy54eXopO1xuICAgICAgICBsdW1pbmFuY2UgPSBtYXgoMC4wLCBsdW1pbmFuY2UgLSB1X3RyZXNob2xkKTtcbiAgICAgICAgYy54eXogKj0gc2lnbihsdW1pbmFuY2UpO1xuICAgICAgICBjLmEgPSAxLjA7XG5cbiAgICAgICAgb3V0Q29sb3IgPSBjO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCcmlnaHRuZXNzO1xuIiwiY29uc3QgRG90U2NyZWVuID0ge1xuXG4gICAgdW5pZm9ybXM6IHtcbiAgICAgICAgdV9pbnB1dDogeyB0eXBlOiAnc2FtcGxlcjJEJywgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgdV9zaXplOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAyNTYgfSxcbiAgICAgICAgdV9jZW50ZXI6IHsgdHlwZTogJ3ZlYzInLCB2YWx1ZTogWzAuNSwgMC41XSB9LFxuICAgICAgICB1X2FuZ2xlOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAxLjU3IH0sXG4gICAgICAgIHVfc2NhbGU6IHsgdHlwZTogJ2Zsb2F0JywgdmFsdWU6IDEuMCB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcblxuICAgIHVuaWZvcm0gdmVjMiB1X2NlbnRlcjtcbiAgICB1bmlmb3JtIGZsb2F0IHVfYW5nbGU7XG4gICAgdW5pZm9ybSBmbG9hdCB1X3NjYWxlO1xuICAgIHVuaWZvcm0gZmxvYXQgdV9zaXplO1xuXG4gICAgZmxvYXQgcGF0dGVybigpIHtcbiAgICAgICAgZmxvYXQgcyA9IHNpbih1X2FuZ2xlKSwgYyA9IGNvcyh1X2FuZ2xlKTtcblxuICAgICAgICB2ZWMyIHRleCA9IHZfdXYgKiB2ZWMyKHVfc2l6ZSkgLSB1X2NlbnRlcjtcbiAgICAgICAgdmVjMiBwb2ludCA9IHZlYzIoYyAqIHRleC54IC0gcyAqIHRleC55LCBzICogdGV4LnggKyBjICogdGV4LnkpICogdV9zY2FsZTtcblxuICAgICAgICByZXR1cm4gKHNpbihwb2ludC54KSAqIHNpbihwb2ludC55KSkgKiA0LjA7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZSh1X2lucHV0LCB2X3V2KTtcblxuICAgICAgICBmbG9hdCBhdmVyYWdlID0gKGNvbG9yLnIgKyBjb2xvci5nICsgY29sb3IuYikgLyAzLjA7XG5cbiAgICAgICAgb3V0Q29sb3IgPSB2ZWM0KHZlYzMoYXZlcmFnZSAqIDEwLjAgLSA1LjAgKyBwYXR0ZXJuKCkpLCBjb2xvci5hKTtcbiAgICB9YCxcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRG90U2NyZWVuO1xuIiwiY29uc3QgSG9yaXpvbnRhbCA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfYW1vdW50OiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAxMjggfSxcbiAgICAgICAgdV94c2NyZWVucG9zOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAwLjUgfSxcbiAgICB9LFxuXG4gICAgdmVydGV4OiBgXG4gICAgb3V0IHZlYzIgdl91djtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgdl91diA9IGFfdXY7XG4gICAgfWAsXG5cbiAgICBmcmFnbWVudDogYFxuICAgIGluIHZlYzIgdl91djtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW5wdXQ7XG4gICAgdW5pZm9ybSBmbG9hdCB1X2Ftb3VudDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfeHNjcmVlbnBvcztcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBzdW0gPSB2ZWM0KDAuMCk7XG4gICAgICAgIGZsb2F0IGhoID0gKDEuMCAvIHVfYW1vdW50KSAqIGFicyh1X3hzY3JlZW5wb3MgLSB2X3V2LngpO1xuXG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gNC4wICogaGgsIHZfdXYueSkpICogMC4wNTE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gMy4wICogaGgsIHZfdXYueSkpICogMC4wOTE4O1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCAtIDIuMCAqIGhoLCB2X3V2LnkpKSAqIDAuMTIyNDU7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54IC0gMS4wICogaGgsIHZfdXYueSkpICogMC4xNTMxO1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55ICkgKSAqIDAuMTYzMztcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LnggKyAxLjAgKiBoaCwgdl91di55KSkgKiAwLjE1MzE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54ICsgMi4wICogaGgsIHZfdXYueSkpICogMC4xMjI0NTtcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LnggKyAzLjAgKiBoaCwgdl91di55KSkgKiAwLjA5MTg7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54ICsgNC4wICogaGgsIHZfdXYueSkpICogMC4wNTE7XG5cbiAgICAgICAgb3V0Q29sb3IgPSBzdW07XG4gICAgfWAsXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhvcml6b250YWw7XG4iLCJjb25zdCBWZXJ0aWNhbCA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfYW1vdW50OiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAxMjggfSxcbiAgICAgICAgdV95c2NyZWVucG9zOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAwLjUgfSxcbiAgICB9LFxuXG4gICAgdmVydGV4OiBgXG4gICAgb3V0IHZlYzIgdl91djtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgdl91diA9IGFfdXY7XG4gICAgfWAsXG5cbiAgICBmcmFnbWVudDogYFxuICAgIGluIHZlYzIgdl91djtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW5wdXQ7XG4gICAgdW5pZm9ybSBmbG9hdCB1X2Ftb3VudDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfeXNjcmVlbnBvcztcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBzdW0gPSB2ZWM0KDAuMCk7XG4gICAgICAgIGZsb2F0IHZ2ID0gKDEuMCAvIHVfYW1vdW50KSAqIGFicyh1X3lzY3JlZW5wb3MgLSB2X3V2LnkpO1xuXG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgLSA0LjAgKiB2dikpICogMC4wNTE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgLSAzLjAgKiB2dikpICogMC4wOTE4O1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55IC0gMi4wICogdnYpKSAqIDAuMTIyNDU7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgLSAxLjAgKiB2dikpICogMC4xNTMxO1xuICAgICAgICBzdW0gKz0gdGV4dHVyZSh1X2lucHV0LCB2ZWMyKHZfdXYueCwgdl91di55ICkgKSAqIDAuMTYzMztcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LngsIHZfdXYueSArIDEuMCAqIHZ2KSkgKiAwLjE1MzE7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgKyAyLjAgKiB2dikpICogMC4xMjI0NTtcbiAgICAgICAgc3VtICs9IHRleHR1cmUodV9pbnB1dCwgdmVjMih2X3V2LngsIHZfdXYueSArIDMuMCAqIHZ2KSkgKiAwLjA5MTg7XG4gICAgICAgIHN1bSArPSB0ZXh0dXJlKHVfaW5wdXQsIHZlYzIodl91di54LCB2X3V2LnkgKyA0LjAgKiB2dikpICogMC4wNTE7XG5cbiAgICAgICAgb3V0Q29sb3IgPSBzdW07XG4gICAgfWAsXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZlcnRpY2FsO1xuIiwiY29uc3QgTm9pc2UgPSB7XG5cbiAgICB1bmlmb3Jtczoge1xuICAgICAgICB1X2lucHV0OiB7IHR5cGU6ICdzYW1wbGVyMkQnLCB2YWx1ZTogbnVsbCB9LFxuICAgICAgICB1X3NlZWQ6IHsgdHlwZTogJ2Zsb2F0JywgdmFsdWU6IDAuMDEgfSxcbiAgICAgICAgdV9hbW91bnQ6IHsgdHlwZTogJ2Zsb2F0JywgdmFsdWU6IDAuNSB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfc2VlZDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfYW1vdW50O1xuXG4gICAgZmxvYXQgcmFuZCh2ZWMyIHV2KSB7XG4gICAgICAgIHJldHVybiBmcmFjdChzaW4oZG90KHV2Lnh5LCB2ZWMyKDEyLjk4OTgsIDc4LjIzMykpKSAqIDQzNzU4LjU0NTMpO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBjb2xvciA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG4gICAgICAgIGZsb2F0IHJhbmRvbSA9IHJhbmQoZ2xfRnJhZ0Nvb3JkLnh5ICogdV9zZWVkKTtcbiAgICAgICAgZmxvYXQgZGlmZiA9IChyYW5kb20gLSAwLjUpICogdV9hbW91bnQ7XG5cbiAgICAgICAgY29sb3IuciArPSBkaWZmO1xuICAgICAgICBjb2xvci5nICs9IGRpZmY7XG4gICAgICAgIGNvbG9yLmIgKz0gZGlmZjtcblxuICAgICAgICBvdXRDb2xvciA9IGNvbG9yO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOb2lzZTtcbiIsImNvbnN0IEh1ZVNhdHVyYXRpb24gPSB7XG5cbiAgICB1bmlmb3Jtczoge1xuICAgICAgICB1X2lucHV0OiB7IHR5cGU6ICdzYW1wbGVyMkQnLCB2YWx1ZTogbnVsbCB9LFxuICAgICAgICB1X2h1ZTogeyB0eXBlOiAnZmxvYXQnLCB2YWx1ZTogMC4wIH0sIC8vIC0xIHRvIDFcbiAgICAgICAgdV9zYXR1cmF0aW9uOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAwLjAgfSwgLy8gLTEgdG8gMVxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfaHVlO1xuICAgIHVuaWZvcm0gZmxvYXQgdV9zYXR1cmF0aW9uO1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZSh1X2lucHV0LCB2X3V2KTtcbiAgICAgICAgZmxvYXQgYW5nbGUgPSB1X2h1ZSAqIDMuMTQxNTkyNjU7XG4gICAgICAgIGZsb2F0IHMgPSBzaW4oYW5nbGUpLCBjID0gY29zKGFuZ2xlKTtcbiAgICAgICAgdmVjMyB3ZWlnaHRzID0gKHZlYzMoMi4wICogYywgLXNxcnQoMy4wKSAqIHMgLSBjLCBzcXJ0KDMuMCkgKiBzIC0gYykgKyAxLjApIC8gMy4wO1xuICAgICAgICBmbG9hdCBsZW4gPSBsZW5ndGgoY29sb3IucmdiKTtcbiAgICAgICAgY29sb3IucmdiID0gdmVjMyhcbiAgICAgICAgICAgIGRvdChjb2xvci5yZ2IsIHdlaWdodHMueHl6KSxcbiAgICAgICAgICAgIGRvdChjb2xvci5yZ2IsIHdlaWdodHMuenh5KSxcbiAgICAgICAgICAgIGRvdChjb2xvci5yZ2IsIHdlaWdodHMueXp4KVxuICAgICAgICApO1xuXG4gICAgICAgIGZsb2F0IGF2ZXJhZ2UgPSAoY29sb3IuciArIGNvbG9yLmcgKyBjb2xvci5iKSAvIDMuMDtcbiAgICAgICAgaWYgKHVfc2F0dXJhdGlvbiA+IDAuMCkge1xuICAgICAgICAgICAgY29sb3IucmdiICs9IChhdmVyYWdlIC0gY29sb3IucmdiKSAqICgxLjAgLSAxLjAgLyAoMS4wMDEgLSB1X3NhdHVyYXRpb24pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbG9yLnJnYiArPSAoYXZlcmFnZSAtIGNvbG9yLnJnYikgKiAoLXVfc2F0dXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBvdXRDb2xvciA9IGNvbG9yO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBIdWVTYXR1cmF0aW9uO1xuIiwiLy8gaW5zcGlyZWQgYnk6IGh0dHBzOi8vd3d3LnNoYWRlcnRveS5jb20vdmlldy80dDIzUmNcbmNvbnN0IEdsaXRjaCA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHVfYW1wbGl0dWRlOiB7IHR5cGU6ICdmbG9hdCcsIHZhbHVlOiAzLjAgfSxcbiAgICAgICAgdV9zcGVlZDogeyB0eXBlOiAnZmxvYXQnLCB2YWx1ZTogMi4wIH0sXG4gICAgfSxcblxuICAgIHZlcnRleDogYFxuICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgIHZfdXYgPSBhX3V2O1xuICAgIH1gLFxuXG4gICAgZnJhZ21lbnQ6IGBcbiAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2lucHV0O1xuICAgIHVuaWZvcm0gZmxvYXQgdV9zcGVlZDtcbiAgICB1bmlmb3JtIGZsb2F0IHVfYW1wbGl0dWRlO1xuXG4gICAgdmVjNCByZ2JTaGlmdCh2ZWMyIHAsIHZlYzQgc2hpZnQpIHtcbiAgICAgICAgc2hpZnQgKj0gMi4wICogc2hpZnQudyAtIDEuMDtcbiAgICAgICAgdmVjMiBycyA9IHZlYzIoc2hpZnQueCwgLXNoaWZ0LnkpO1xuICAgICAgICB2ZWMyIGdzID0gdmVjMihzaGlmdC55LCAtc2hpZnQueik7XG4gICAgICAgIHZlYzIgYnMgPSB2ZWMyKHNoaWZ0LnosIC1zaGlmdC54KTtcblxuICAgICAgICBmbG9hdCByID0gdGV4dHVyZSh1X2lucHV0LCBwICsgcnMpLng7XG4gICAgICAgIGZsb2F0IGcgPSB0ZXh0dXJlKHVfaW5wdXQsIHAgKyBncykueTtcbiAgICAgICAgZmxvYXQgYiA9IHRleHR1cmUodV9pbnB1dCwgcCArIGJzKS56O1xuXG4gICAgICAgIHJldHVybiB2ZWM0KHIsIGcsIGIsIDEuMCk7XG4gICAgfVxuXG4gICAgZmxvYXQgcmFuZCh2ZWMyIHV2KSB7XG4gICAgICAgIHJldHVybiBmcmFjdChzaW4oZG90KHV2Lnh5LCB2ZWMyKDEyLjk4OTgsIDc4LjIzMykpKSAqIDQzNzU4LjU0NTMpO1xuICAgIH1cblxuICAgIHZlYzQgbm9pc2UodmVjMiBuKSB7XG4gICAgICAgIGZsb2F0IHIgPSByYW5kKG4ueHkgKyAwLjEpO1xuICAgICAgICBmbG9hdCBnID0gcmFuZChuLnh5ICsgMC4yKTtcbiAgICAgICAgZmxvYXQgYiA9IHJhbmQobi54eSArIDAuMyk7XG4gICAgICAgIHJldHVybiB2ZWM0KHIgLSAwLjUsIGcgLSAwLjUsIGIgLSAwLjUsIDEuMCk7XG4gICAgfVxuXG4gICAgdmVjNCB2ZWM0cG93KHZlYzQgdiwgZmxvYXQgcCkge1xuICAgICAgICByZXR1cm4gdmVjNChwb3codi54LCBwKSwgcG93KHYueSwgcCksIHBvdyh2LnosIHApLCB2LncpO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBjb2xvciA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG5cbiAgICAgICAgdmVjNCBjID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuXG4gICAgICAgIGZsb2F0IHYgPSBjbGFtcChzaW4oaUdsb2JhbFRpbWUgKiB1X3NwZWVkKSwgMC4wLCAxLjApO1xuICAgICAgICB2ZWM0IHNoaWZ0ID0gdmVjNHBvdyhub2lzZSh2ZWMyKDEuMCAtIHYsIDAuMCkpLCA4LjApICogdmVjNCh1X2FtcGxpdHVkZSwgdV9hbXBsaXR1ZGUsIHVfYW1wbGl0dWRlLCAxLjApICogdjtcblxuICAgICAgICBjICs9IHJnYlNoaWZ0KHZfdXYsIHNoaWZ0KTtcblxuICAgICAgICBvdXRDb2xvciA9IGM7XG4gICAgfWAsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBHbGl0Y2g7XG4iLCJpbXBvcnQgKiBhcyBibHVyIGZyb20gJy4vYmx1cic7XG5pbXBvcnQgQmxlYWNoIGZyb20gJy4vYmxlYWNoJztcbmltcG9ydCBCcmlnaHRuZXNzIGZyb20gJy4vYnJpZ2h0bmVzcyc7XG5pbXBvcnQgRG90U2NyZWVuIGZyb20gJy4vZG90LXNjcmVlbic7XG5pbXBvcnQgKiBhcyB0aWx0U2hpZnQgZnJvbSAnLi90aWx0LXNoaWZ0JztcbmltcG9ydCBOb2lzZSBmcm9tICcuL25vaXNlJztcbmltcG9ydCBIdWVTYXR1cmF0aW9uIGZyb20gJy4vaHVlLXNhdHVyYXRpb24nO1xuaW1wb3J0IEdsaXRjaCBmcm9tICcuL2dsaXRjaCc7XG5cbmV4cG9ydCB7XG4gICAgYmx1cixcbiAgICBCbGVhY2gsXG4gICAgQnJpZ2h0bmVzcyxcbiAgICBEb3RTY3JlZW4sXG4gICAgdGlsdFNoaWZ0LFxuICAgIE5vaXNlLFxuICAgIEh1ZVNhdHVyYXRpb24sXG4gICAgR2xpdGNoLFxufTtcblxuLy8gcmVzb3VyY2VzOlxuLy8gaHR0cDovL2V2YW53LmdpdGh1Yi5pby9nbGZ4LmpzL2RlbW8vXG4vLyBodHRwOi8vcGl4aWpzLmlvL3BpeGktZmlsdGVycy90b29scy9kZW1vL1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy90cmVlL2Rldi9leGFtcGxlcy9qcy9zaGFkZXJzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc3BpdGUvV2FnbmVyL3RyZWUvbWFzdGVyL2ZyYWdtZW50LXNoYWRlcnNcbi8vIGh0dHBzOi8vc2hhZGVydG95LmNvbVxuIl0sIm5hbWVzIjpbIkhvcml6b250YWwiLCJ1bmlmb3JtcyIsInVfaW5wdXQiLCJ0eXBlIiwidmFsdWUiLCJ1X2Ftb3VudCIsInZlcnRleCIsImZyYWdtZW50IiwiVmVydGljYWwiLCJCbGVhY2giLCJ1X29wYWNpdHkiLCJCcmlnaHRuZXNzIiwidV90cmVzaG9sZCIsIkRvdFNjcmVlbiIsInVfc2l6ZSIsInVfY2VudGVyIiwidV9hbmdsZSIsInVfc2NhbGUiLCJ1X3hzY3JlZW5wb3MiLCJ1X3lzY3JlZW5wb3MiLCJOb2lzZSIsInVfc2VlZCIsIkh1ZVNhdHVyYXRpb24iLCJ1X2h1ZSIsInVfc2F0dXJhdGlvbiIsIkdsaXRjaCIsInVfYW1wbGl0dWRlIiwidV9zcGVlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUEsSUFBTUEsYUFBYTs7SUFFZkMsY0FBVTtJQUNOQyxpQkFBUyxFQUFFQyxNQUFNLFdBQVIsRUFBcUJDLE9BQU8sSUFBNUIsRUFESDtJQUVOQyxrQkFBVSxFQUFFRixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEI7SUFGSixLQUZLOztJQU9mRSw4S0FQZTs7SUFjZkM7O0lBZGUsQ0FBbkI7O0lDQUEsSUFBTUMsV0FBVzs7SUFFYlAsY0FBVTtJQUNOQyxpQkFBUyxFQUFFQyxNQUFNLFdBQVIsRUFBcUJDLE9BQU8sSUFBNUIsRUFESDtJQUVOQyxrQkFBVSxFQUFFRixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEI7SUFGSixLQUZHOztJQU9iRSw4S0FQYTs7SUFjYkM7O0lBZGEsQ0FBakI7Ozs7Ozs7OztJQ0FBLElBQU1FLFNBQVM7O0lBRVhSLGNBQVU7SUFDTkMsaUJBQVMsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxPQUFPLElBQTVCLEVBREg7SUFFTk0sbUJBQVcsRUFBRVAsTUFBTSxPQUFSLEVBQWlCQyxPQUFPLEdBQXhCO0lBRkwsS0FGQzs7SUFPWEUsOEtBUFc7O0lBY1hDOztJQWRXLENBQWY7O0lDQUEsSUFBTUksYUFBYTs7SUFFZlYsY0FBVTtJQUNOQyxpQkFBUyxFQUFFQyxNQUFNLFdBQVIsRUFBcUJDLE9BQU8sSUFBNUIsRUFESDtJQUVOUSxvQkFBWSxFQUFFVCxNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEI7SUFGTixLQUZLOztJQU9mRSw4S0FQZTs7SUFjZkM7O0lBZGUsQ0FBbkI7O0lDQUEsSUFBTU0sWUFBWTs7SUFFZFosY0FBVTtJQUNOQyxpQkFBUyxFQUFFQyxNQUFNLFdBQVIsRUFBcUJDLE9BQU8sSUFBNUIsRUFESDtJQUVOVSxnQkFBUSxFQUFFWCxNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEIsRUFGRjtJQUdOVyxrQkFBVSxFQUFFWixNQUFNLE1BQVIsRUFBZ0JDLE9BQU8sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUF2QixFQUhKO0lBSU5ZLGlCQUFTLEVBQUViLE1BQU0sT0FBUixFQUFpQkMsT0FBTyxJQUF4QixFQUpIO0lBS05hLGlCQUFTLEVBQUVkLE1BQU0sT0FBUixFQUFpQkMsT0FBTyxHQUF4QjtJQUxILEtBRkk7O0lBVWRFLDhLQVZjOztJQWlCZEM7O0lBakJjLENBQWxCOztJQ0FBLElBQU1QLGVBQWE7O0lBRWZDLGNBQVU7SUFDTkMsaUJBQVMsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxPQUFPLElBQTVCLEVBREg7SUFFTkMsa0JBQVUsRUFBRUYsTUFBTSxPQUFSLEVBQWlCQyxPQUFPLEdBQXhCLEVBRko7SUFHTmMsc0JBQWMsRUFBRWYsTUFBTSxPQUFSLEVBQWlCQyxPQUFPLEdBQXhCO0lBSFIsS0FGSzs7SUFRZkUsOEtBUmU7O0lBZWZDOztJQWZlLENBQW5COztJQ0FBLElBQU1DLGFBQVc7O0lBRWJQLGNBQVU7SUFDTkMsaUJBQVMsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxPQUFPLElBQTVCLEVBREg7SUFFTkMsa0JBQVUsRUFBRUYsTUFBTSxPQUFSLEVBQWlCQyxPQUFPLEdBQXhCLEVBRko7SUFHTmUsc0JBQWMsRUFBRWhCLE1BQU0sT0FBUixFQUFpQkMsT0FBTyxHQUF4QjtJQUhSLEtBRkc7O0lBUWJFLDhLQVJhOztJQWViQzs7SUFmYSxDQUFqQjs7Ozs7Ozs7O0lDQUEsSUFBTWEsUUFBUTs7SUFFVm5CLGNBQVU7SUFDTkMsaUJBQVMsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxPQUFPLElBQTVCLEVBREg7SUFFTmlCLGdCQUFRLEVBQUVsQixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sSUFBeEIsRUFGRjtJQUdOQyxrQkFBVSxFQUFFRixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEI7SUFISixLQUZBOztJQVFWRSw4S0FSVTs7SUFlVkM7O0lBZlUsQ0FBZDs7SUNBQSxJQUFNZSxnQkFBZ0I7O0lBRWxCckIsY0FBVTtJQUNOQyxpQkFBUyxFQUFFQyxNQUFNLFdBQVIsRUFBcUJDLE9BQU8sSUFBNUIsRUFESDtJQUVObUIsZUFBTyxFQUFFcEIsTUFBTSxPQUFSLEVBQWlCQyxPQUFPLEdBQXhCLEVBRkQ7SUFHTm9CLHNCQUFjLEVBQUVyQixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEIsRUFIUjtJQUFBLEtBRlE7O0lBUWxCRSw4S0FSa0I7O0lBZWxCQzs7SUFma0IsQ0FBdEI7O0lDQUE7SUFDQSxJQUFNa0IsU0FBUzs7SUFFWHhCLGNBQVU7SUFDTkMsaUJBQVMsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxPQUFPLElBQTVCLEVBREg7SUFFTnNCLHFCQUFhLEVBQUV2QixNQUFNLE9BQVIsRUFBaUJDLE9BQU8sR0FBeEIsRUFGUDtJQUdOdUIsaUJBQVMsRUFBRXhCLE1BQU0sT0FBUixFQUFpQkMsT0FBTyxHQUF4QjtJQUhILEtBRkM7O0lBUVhFLDhLQVJXOztJQWVYQztJQWZXLENBQWY7O0lDbUJBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
