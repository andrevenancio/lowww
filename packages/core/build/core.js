(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.lowww = global.lowww || {}, global.lowww.core = {})));
}(this, (function (exports) { 'use strict';

    var LIGHT = {
        factory: function factory() {
            return "\n        // factory light\n        vec3 inverseLightDirection = normalize(vec3(-0.25, -0.25, 1.0));\n        vec3 directionalColor = vec3(max(dot(v_normal, inverseLightDirection), 0.0));\n        vec3 factory = mix(vec3(0.0), directionalColor, 0.989); // light intensity\n        base.rgb *= factory;\n\n        " + LIGHT.directional();
        },

        directional: function directional() {
            return "\n            // vec3 dcolor = vec3(0.01);\n            //\n            // for (int i = 0; i < MAX_DIRECTIONAL; i++) {\n            //     vec3 inverseLightDirection = normalize(directionalLights[i].dlPosition.xyz);\n            //     vec3 light = vec3(max(dot(v_normal, inverseLightDirection), 0.0));\n            //     vec3 directionalColor = directionalLights[i].dlColor.rgb * light;\n            //     dcolor += mix(dcolor, directionalColor, directionalLights[i].flIntensity);\n            // }\n            // dcolor /= float(MAX_DIRECTIONAL);\n            //\n            // base.rgb *= dcolor;\n        ";
        }
    };

    function base() {
        return "\n    float fogStart = fogSettings.y;\n    float fogEnd = fogSettings.z;\n    float fogDensity = fogSettings.a;\n\n    float dist = 0.0;\n    float fogFactor = 0.0;\n    dist = gl_FragCoord.z / gl_FragCoord.w;";
    }

    var FOG = {
        linear: function linear() {
            return "\n        if (fogSettings.x > 0.0) {\n            " + base() + "\n            fogFactor = (fogEnd - dist) / (fogEnd - fogStart);\n            fogFactor = clamp(fogFactor, 0.0, 1.0);\n            base = mix(fogColor, base, fogFactor);\n        }";
        },
        exponential: function exponential() {
            return "\n        if (fogSettings.x > 0.0) {\n            " + base() + "\n            fogFactor = 1.0 / exp(dist * fogDensity);\n            fogFactor = clamp(fogFactor, 0.0, 1.0);\n            base = mix(fogColor, base, fogFactor);\n        }";
        },
        exponential2: function exponential2() {
            return "\n        if (fogSettings.x > 0.0) {\n            " + base() + "\n            fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));\n            fogFactor = clamp(fogFactor, 0.0, 1.0);\n            base = mix(fogColor, base, fogFactor);\n        }";
        }
    };

    /**
     * Max directional light allowed
     *
     * @static
     * @constant
     * @name MAX_DIRECTIONAL
     * @type {string}
     */
    var MAX_DIRECTIONAL = 1;

    /**
     * directional light id
     *
     * @static
     * @constant
     * @name DIRECTIONAL_LIGHT
     * @type {string}
     */
    var DIRECTIONAL_LIGHT = 1000;

    /**
     * basic shader id
     *
     * @static
     * @constant
     * @name SHADER_BASIC
     * @type {string}
     */
    var SHADER_BASIC = 2000;

    /**
     * default shader id
     *
     * @static
     * @constant
     * @name SHADER_DEFAULT
     * @type {string}
     */
    var SHADER_DEFAULT = 2001;

    /**
     * billboard shader id
     *
     * @static
     * @constant
     * @name SHADER_BILLBOARD
     * @type {string}
     */
    var SHADER_BILLBOARD = 2002;

    /**
     * shadow shader id
     *
     * @static
     * @constant
     * @name SHADER_SHADOW
     * @type {string}
     */
    var SHADER_SHADOW = 2003;

    /**
     * sem shader id
     *
     * @static
     * @constant
     * @name SHADER_SEM
     * @type {string}
     */
    var SHADER_SEM = 2004;

    /**
     * custom shader id
     *
     * @static
     * @constant
     * @name SHADER_CUSTOM
     * @type {string}
     */
    var SHADER_CUSTOM = 2500;

    /**
     * shader draw modes
     *
     * @static
     * @constant
     * @name DRAW
     * @type {object}
     * @property {number} POINTS
     * @property {number} LINES
     * @property {number} TRIANGLES
     */
    var DRAW = {
      POINTS: 0,
      LINES: 1,
      TRIANGLES: 4
    };

    /**
     * triangle side
     *
     * @static
     * @constant
     * @name SIDE
     * @type {object}
     * @property {number} FRONT
     * @property {number} BACK
     * @property {number} BOTH
     */
    var SIDE = {
      FRONT: 0,
      BACK: 1,
      BOTH: 2
    };

    /**
     * context types
     *
     * @static
     * @constant
     * @name CONTEXT
     * @type {object}
     * @property {number} WEBGL
     * @property {number} WEBGL2
     */
    var CONTEXT = {
      WEBGL: 'webgl',
      WEBGL2: 'webgl2'
    };

    var constants = /*#__PURE__*/Object.freeze({
        MAX_DIRECTIONAL: MAX_DIRECTIONAL,
        DIRECTIONAL_LIGHT: DIRECTIONAL_LIGHT,
        SHADER_BASIC: SHADER_BASIC,
        SHADER_DEFAULT: SHADER_DEFAULT,
        SHADER_BILLBOARD: SHADER_BILLBOARD,
        SHADER_SHADOW: SHADER_SHADOW,
        SHADER_SEM: SHADER_SEM,
        SHADER_CUSTOM: SHADER_CUSTOM,
        DRAW: DRAW,
        SIDE: SIDE,
        CONTEXT: CONTEXT
    });

    var library = "lowww-" + "core";
    var version = "1.1.0";

    // per session
    var gl = null;
    var contextType = null;

    // test context webgl and webgl2
    var testContext1 = document.createElement('canvas').getContext(CONTEXT.WEBGL);
    var testContext2 = document.createElement('canvas').getContext(CONTEXT.WEBGL2);

    var extensions = {
        // used globally
        vertexArrayObject: testContext1.getExtension('OES_vertex_array_object'),

        // used for instancing
        instancedArrays: testContext1.getExtension('ANGLE_instanced_arrays'),

        // used for flat shading
        standardDerivatives: testContext1.getExtension('OES_standard_derivatives'),

        // depth texture
        depthTextures: testContext1.getExtension('WEBGL_depth_texture')
    };

    var setContextType = function setContextType(preferred) {
        var gl2 = testContext2 && CONTEXT.WEBGL2;
        var gl1 = testContext1 && CONTEXT.WEBGL;
        contextType = preferred || gl2 || gl1;

        if (contextType === CONTEXT.WEBGL2) {
            extensions.vertexArrayObject = true;
            extensions.instancedArrays = true;
            extensions.standardDerivatives = true;
            extensions.depthTexture = true;
        }

        return contextType;
    };

    var getContextType = function getContextType() {
        return contextType;
    };

    var setContext = function setContext(context) {
        gl = context;
        if (getContextType() === CONTEXT.WEBGL) {
            extensions.vertexArrayObject = gl.getExtension('OES_vertex_array_object');
            extensions.instancedArrays = gl.getExtension('ANGLE_instanced_arrays');
            extensions.standardDerivatives = gl.getExtension('OES_standard_derivatives');
            extensions.depthTextures = gl.getExtension('WEBGL_depth_texture');
        }
    };

    var getContext = function getContext() {
        return gl;
    };

    var supports = function supports() {
        return extensions;
    };

    var UBO = {
        scene: function scene() {
            if (getContextType() === CONTEXT.WEBGL2) {
                return '\n            uniform perScene {\n                mat4 projectionMatrix;\n                mat4 viewMatrix;\n                vec4 fogSettings;\n                vec4 fogColor;\n                float iGlobalTime;\n                vec4 globalClipSettings;\n                vec4 globalClipPlane0;\n                vec4 globalClipPlane1;\n                vec4 globalClipPlane2;\n            };';
            }

            return '\n        uniform mat4 projectionMatrix;\n        uniform mat4 viewMatrix;\n        uniform vec4 fogSettings;\n        uniform vec4 fogColor;\n        uniform float iGlobalTime;\n        uniform vec4 globalClipSettings;\n        uniform vec4 globalClipPlane0;\n        uniform vec4 globalClipPlane1;\n        uniform vec4 globalClipPlane2;';
        },

        model: function model() {
            if (getContextType() === CONTEXT.WEBGL2) {
                return '\n            uniform perModel {\n                mat4 modelMatrix;\n                mat4 normalMatrix;\n                vec4 localClipSettings;\n                vec4 localClipPlane0;\n                vec4 localClipPlane1;\n                vec4 localClipPlane2;\n            };';
            }
            return '\n            uniform mat4 modelMatrix;\n            uniform mat4 normalMatrix;\n            uniform vec4 localClipSettings;\n            uniform vec4 localClipPlane0;\n            uniform vec4 localClipPlane1;\n            uniform vec4 localClipPlane2;';
        },

        lights: function lights() {
            if (getContextType() === CONTEXT.WEBGL2) {
                return '\n                #define MAX_DIRECTIONAL ' + MAX_DIRECTIONAL + '\n\n                struct Directional {\n                    vec4 dlPosition;\n                    vec4 dlColor;\n                    float flIntensity;\n                };\n\n                uniform directional {\n                    Directional directionalLights[MAX_DIRECTIONAL];\n                };';
            }

            return '\n            #define MAX_DIRECTIONAL ' + MAX_DIRECTIONAL + '\n\n            struct Directional {\n                vec4 dlPosition;\n                vec4 dlColor;\n                float flIntensity;\n            };\n\n            uniform Directional directionalLights[MAX_DIRECTIONAL];';
        }
    };

    var NOISE = function NOISE() {
        return "\n    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 permute(vec4 x){return mod289((x*34.+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284-.853735*r;}vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}float cnoise(vec3 P){vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.);Pi0=mod289(Pi0);Pi1=mod289(Pi1);vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);vec4 ix=vec4(Pi0.r,Pi1.r,Pi0.r,Pi1.r),iy=vec4(Pi0.gg,Pi1.gg),iz0=Pi0.bbbb,iz1=Pi1.bbbb,ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1),gx0=ixy0*(1./7.),gy0=fract(floor(gx0)*(1./7.))-.5;gx0=fract(gx0);vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);vec4 gx1=ixy1*(1./7.),gy1=fract(floor(gx1)*(1./7.))-.5;gx1=fract(gx1);vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);vec3 g000=vec3(gx0.r,gy0.r,gz0.r),g100=vec3(gx0.g,gy0.g,gz0.g),g010=vec3(gx0.b,gy0.b,gz0.b),g110=vec3(gx0.a,gy0.a,gz0.a),g001=vec3(gx1.r,gy1.r,gz1.r),g101=vec3(gx1.g,gy1.g,gz1.g),g011=vec3(gx1.b,gy1.b,gz1.b),g111=vec3(gx1.a,gy1.a,gz1.a);vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.r;g010*=norm0.g;g100*=norm0.b;g110*=norm0.a;vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.r;g011*=norm1.g;g101*=norm1.b;g111*=norm1.a;float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.r,Pf0.gb)),n010=dot(g010,vec3(Pf0.r,Pf1.g,Pf0.b)),n110=dot(g110,vec3(Pf1.rg,Pf0.b)),n001=dot(g001,vec3(Pf0.rg,Pf1.b)),n101=dot(g101,vec3(Pf1.r,Pf0.g,Pf1.b)),n011=dot(g011,vec3(Pf0.r,Pf1.gb)),n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.b);vec2 n_yz=mix(n_z.rg,n_z.ba,fade_xyz.g);float n_xyz=mix(n_yz.r,n_yz.g,fade_xyz.r);return 2.2*n_xyz;}float pnoise(vec3 P,vec3 rep){vec3 Pi0=mod(floor(P),rep),Pi1=mod(Pi0+vec3(1.),rep);Pi0=mod289(Pi0);Pi1=mod289(Pi1);vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);vec4 ix=vec4(Pi0.r,Pi1.r,Pi0.r,Pi1.r),iy=vec4(Pi0.gg,Pi1.gg),iz0=Pi0.bbbb,iz1=Pi1.bbbb,ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1),gx0=ixy0*(1./7.),gy0=fract(floor(gx0)*(1./7.))-.5;gx0=fract(gx0);vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);vec4 gx1=ixy1*(1./7.),gy1=fract(floor(gx1)*(1./7.))-.5;gx1=fract(gx1);vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);vec3 g000=vec3(gx0.r,gy0.r,gz0.r),g100=vec3(gx0.g,gy0.g,gz0.g),g010=vec3(gx0.b,gy0.b,gz0.b),g110=vec3(gx0.a,gy0.a,gz0.a),g001=vec3(gx1.r,gy1.r,gz1.r),g101=vec3(gx1.g,gy1.g,gz1.g),g011=vec3(gx1.b,gy1.b,gz1.b),g111=vec3(gx1.a,gy1.a,gz1.a);vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.r;g010*=norm0.g;g100*=norm0.b;g110*=norm0.a;vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.r;g011*=norm1.g;g101*=norm1.b;g111*=norm1.a;float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.r,Pf0.gb)),n010=dot(g010,vec3(Pf0.r,Pf1.g,Pf0.b)),n110=dot(g110,vec3(Pf1.rg,Pf0.b)),n001=dot(g001,vec3(Pf0.rg,Pf1.b)),n101=dot(g101,vec3(Pf1.r,Pf0.g,Pf1.b)),n011=dot(g011,vec3(Pf0.r,Pf1.gb)),n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.b);vec2 n_yz=mix(n_z.rg,n_z.ba,fade_xyz.g);float n_xyz=mix(n_yz.r,n_yz.g,fade_xyz.r);return 2.2*n_xyz;}\n";
    };

    var CLIPPING = {

        vertex_pre: function vertex_pre() {
            return "\n        out vec4 local_eyespace;\n        out vec4 global_eyespace;";
        },

        vertex: function vertex() {
            return "\n        local_eyespace = modelMatrix * vec4(a_position, 1.0);\n        global_eyespace = viewMatrix * modelMatrix * vec4(a_position, 1.0);";
        },

        fragment_pre: function fragment_pre() {
            return "\n        in vec4 local_eyespace;\n        in vec4 global_eyespace;";
        },

        fragment: function fragment() {
            return "\n        if (localClipSettings.x > 0.0) {\n            if(dot(local_eyespace, localClipPlane0) < 0.0) discard;\n            if(dot(local_eyespace, localClipPlane1) < 0.0) discard;\n            if(dot(local_eyespace, localClipPlane2) < 0.0) discard;\n        }\n\n        if (globalClipSettings.x > 0.0) {\n            if(dot(global_eyespace, globalClipPlane0) < 0.0) discard;\n            if(dot(global_eyespace, globalClipPlane1) < 0.0) discard;\n            if(dot(global_eyespace, globalClipPlane2) < 0.0) discard;\n        }";
        }

    };

    var EXTENSIONS = {

        vertex: function vertex() {
            if (getContextType() === CONTEXT.WEBGL2) {
                return '';
            }
            return '';
        },

        fragment: function fragment() {
            if (getContextType() === CONTEXT.WEBGL2) {
                return '';
            }
            return '\n        #extension GL_OES_standard_derivatives : enable';
        }

    };

    function hard() {
        return "\n    float hardShadow1(sampler2D shadowMap) {\n        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;\n        vec2 uv = shadowCoord.xy;\n        float shadow = texture(shadowMap, uv).r;\n\n        float visibility = 1.0;\n        float shadowAmount = 0.5;\n\n        float cosTheta = clamp(dot(v_normal, vShadowCoord.xyz), 0.0, 1.0);\n        float bias = 0.00005 * tan(acos(cosTheta)); // cosTheta is dot( n,l ), clamped between 0 and 1\n        bias = clamp(bias, 0.0, 0.001);\n\n        if (shadow < shadowCoord.z - bias){\n            visibility = shadowAmount;\n        }\n        return visibility;\n    }\n\n    float hardShadow2(sampler2D shadowMap) {\n        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;\n        vec2 uv = shadowCoord.xy;\n\n        float lightDepth1 = texture(shadowMap, uv).r;\n        float lightDepth2 = clamp(shadowCoord.z, 0.0, 1.0);\n        float bias = 0.0001;\n\n        return step(lightDepth2, lightDepth1+bias);\n    }\n\n    float hardShadow3(sampler2D shadowMap) {\n        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;\n        vec2 uv = shadowCoord.xy;\n\n        float visibility = 1.0;\n        float shadowAmount = 0.5;\n        float bias = 0.00005;\n\n        vec2 poissonDisk[16];\n        poissonDisk[0] = vec2(-0.94201624, -0.39906216);\n        poissonDisk[1] = vec2(0.94558609, -0.76890725);\n        poissonDisk[2] = vec2(-0.094184101, -0.92938870);\n        poissonDisk[3] = vec2(0.34495938, 0.29387760);\n        poissonDisk[4] = vec2(-0.91588581, 0.45771432);\n        poissonDisk[5] = vec2(-0.81544232, -0.87912464);\n        poissonDisk[6] = vec2(-0.38277543, 0.27676845);\n        poissonDisk[7] = vec2(0.97484398, 0.75648379);\n        poissonDisk[8] = vec2(0.44323325, -0.97511554);\n        poissonDisk[9] = vec2(0.53742981, -0.47373420);\n        poissonDisk[10] = vec2(-0.26496911, -0.41893023);\n        poissonDisk[11] = vec2(0.79197514, 0.19090188);\n        poissonDisk[12] = vec2(-0.24188840, 0.99706507);\n        poissonDisk[13] = vec2(-0.81409955, 0.91437590);\n        poissonDisk[14] = vec2(0.19984126, 0.78641367);\n        poissonDisk[15] = vec2(0.14383161, -0.14100790);\n\n        for (int i=0;i<16;i++) {\n            if ( texture(shadowMap, uv + poissonDisk[i]/700.0).r < shadowCoord.z-bias ){\n                visibility -= 0.02;\n            }\n        }\n\n        return visibility;\n    }\n\n    ";
    }

    var SHADOW = {
        vertex_pre: function vertex_pre() {
            return "\n        uniform mat4 shadowMatrix;\n        out vec4 vShadowCoord;";
        },

        vertex: function vertex() {
            return "\n        vShadowCoord = shadowMatrix * modelMatrix * vec4(a_position, 1.0);";
        },

        fragment_pre: function fragment_pre() {
            return "\n        uniform sampler2D shadowMap;\n        in vec4 vShadowCoord;\n\n        " + hard();
        },

        fragment: function fragment() {
            return "\n        // shadows\n        float shadow = 1.0;\n\n        // OPTION 1\n        shadow = hardShadow1(shadowMap);\n\n        base *= shadow;\n        ";
        }

    };



    var index = /*#__PURE__*/Object.freeze({
        UBO: UBO,
        LIGHT: LIGHT,
        FOG: FOG,
        NOISE: NOISE,
        CLIPPING: CLIPPING,
        EXTENSIONS: EXTENSIONS,
        SHADOW: SHADOW
    });

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * Common utilities
     * @module glMatrix
     */

    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;

    var degree = Math.PI / 180;

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * 3x3 Matrix
     * @module mat3
     */

    /**
     * Creates a new identity mat3
     *
     * @returns {mat3} a new 3x3 matrix
     */
    function create$2() {
      var out = new ARRAY_TYPE(9);
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 1;
      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 1;
      return out;
    }

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * @class 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @name mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */
    function create$3() {
      var out = new ARRAY_TYPE(16);
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }

    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function copy$3(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }

    /**
     * Create a new mat4 with the given values
     *
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m03 Component in column 0, row 3 position (index 3)
     * @param {Number} m10 Component in column 1, row 0 position (index 4)
     * @param {Number} m11 Component in column 1, row 1 position (index 5)
     * @param {Number} m12 Component in column 1, row 2 position (index 6)
     * @param {Number} m13 Component in column 1, row 3 position (index 7)
     * @param {Number} m20 Component in column 2, row 0 position (index 8)
     * @param {Number} m21 Component in column 2, row 1 position (index 9)
     * @param {Number} m22 Component in column 2, row 2 position (index 10)
     * @param {Number} m23 Component in column 2, row 3 position (index 11)
     * @param {Number} m30 Component in column 3, row 0 position (index 12)
     * @param {Number} m31 Component in column 3, row 1 position (index 13)
     * @param {Number} m32 Component in column 3, row 2 position (index 14)
     * @param {Number} m33 Component in column 3, row 3 position (index 15)
     * @returns {mat4} A new mat4
     */
    function fromValues$3(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      var out = new ARRAY_TYPE(16);
      out[0] = m00;
      out[1] = m01;
      out[2] = m02;
      out[3] = m03;
      out[4] = m10;
      out[5] = m11;
      out[6] = m12;
      out[7] = m13;
      out[8] = m20;
      out[9] = m21;
      out[10] = m22;
      out[11] = m23;
      out[12] = m30;
      out[13] = m31;
      out[14] = m32;
      out[15] = m33;
      return out;
    }

    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */
    function identity$3(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }

    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function transpose$2(out, a) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a12 = a[6],
            a13 = a[7];
        var a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
      } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
      }

      return out;
    }

    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function invert$3(out, a) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];

      var b00 = a00 * a11 - a01 * a10;
      var b01 = a00 * a12 - a02 * a10;
      var b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11;
      var b04 = a01 * a13 - a03 * a11;
      var b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30;
      var b07 = a20 * a32 - a22 * a30;
      var b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31;
      var b10 = a21 * a33 - a23 * a31;
      var b11 = a22 * a33 - a23 * a32;

      // Calculate the determinant
      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      if (!det) {
        return null;
      }
      det = 1.0 / det;

      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

      return out;
    }

    /**
     * Multiplies two mat4s
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    function multiply$3(out, a, b) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];

      // Cache only the current line of the second matrix
      var b0 = b[0],
          b1 = b[1],
          b2 = b[2],
          b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return out;
    }

    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to translate
     * @param {vec3} v vector to translate by
     * @returns {mat4} out
     */
    function translate$2(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00 = void 0,
          a01 = void 0,
          a02 = void 0,
          a03 = void 0;
      var a10 = void 0,
          a11 = void 0,
          a12 = void 0,
          a13 = void 0;
      var a20 = void 0,
          a21 = void 0,
          a22 = void 0,
          a23 = void 0;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
        a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
        a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

        out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
        out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
        out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }

    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {vec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/
    function scale$3(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];

      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }

    /**
     * Rotates a mat4 by the given angle around the given axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @param {vec3} axis the axis to rotate around
     * @returns {mat4} out
     */
    function rotate$3(out, a, rad, axis) {
      var x = axis[0],
          y = axis[1],
          z = axis[2];
      var len = Math.sqrt(x * x + y * y + z * z);
      var s = void 0,
          c = void 0,
          t = void 0;
      var a00 = void 0,
          a01 = void 0,
          a02 = void 0,
          a03 = void 0;
      var a10 = void 0,
          a11 = void 0,
          a12 = void 0,
          a13 = void 0;
      var a20 = void 0,
          a21 = void 0,
          a22 = void 0,
          a23 = void 0;
      var b00 = void 0,
          b01 = void 0,
          b02 = void 0;
      var b10 = void 0,
          b11 = void 0,
          b12 = void 0;
      var b20 = void 0,
          b21 = void 0,
          b22 = void 0;

      if (Math.abs(len) < EPSILON) {
        return null;
      }

      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;

      s = Math.sin(rad);
      c = Math.cos(rad);
      t = 1 - c;

      a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
      a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
      a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

      // Construct the elements of the rotation matrix
      b00 = x * x * t + c;b01 = y * x * t + z * s;b02 = z * x * t - y * s;
      b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
      b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

      // Perform rotation-specific matrix multiplication
      out[0] = a00 * b00 + a10 * b01 + a20 * b02;
      out[1] = a01 * b00 + a11 * b01 + a21 * b02;
      out[2] = a02 * b00 + a12 * b01 + a22 * b02;
      out[3] = a03 * b00 + a13 * b01 + a23 * b02;
      out[4] = a00 * b10 + a10 * b11 + a20 * b12;
      out[5] = a01 * b10 + a11 * b11 + a21 * b12;
      out[6] = a02 * b10 + a12 * b11 + a22 * b12;
      out[7] = a03 * b10 + a13 * b11 + a23 * b12;
      out[8] = a00 * b20 + a10 * b21 + a20 * b22;
      out[9] = a01 * b20 + a11 * b21 + a21 * b22;
      out[10] = a02 * b20 + a12 * b21 + a22 * b22;
      out[11] = a03 * b20 + a13 * b21 + a23 * b22;

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      }
      return out;
    }

    /**
     * Generates a perspective projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2);
      var nf = 1 / (near - far);
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = (far + near) * nf;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[14] = 2 * far * near * nf;
      out[15] = 0;
      return out;
    }

    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    function ortho(out, left, right, bottom, top, near, far) {
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis. 
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    function lookAt(out, eye, center, up) {
      var x0 = void 0,
          x1 = void 0,
          x2 = void 0,
          y0 = void 0,
          y1 = void 0,
          y2 = void 0,
          z0 = void 0,
          z1 = void 0,
          z2 = void 0,
          len = void 0;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity$3(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;

      len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;

      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;

      len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;

      return out;
    }

    /**
     * Generates a matrix that makes something look at something else.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    function targetTo(out, eye, target, up) {
      var eyex = eye[0],
          eyey = eye[1],
          eyez = eye[2],
          upx = up[0],
          upy = up[1],
          upz = up[2];

      var z0 = eyex - target[0],
          z1 = eyey - target[1],
          z2 = eyez - target[2];

      var len = z0 * z0 + z1 * z1 + z2 * z2;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
      }

      var x0 = upy * z2 - upz * z1,
          x1 = upz * z0 - upx * z2,
          x2 = upx * z1 - upy * z0;

      len = x0 * x0 + x1 * x1 + x2 * x2;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      out[0] = x0;
      out[1] = x1;
      out[2] = x2;
      out[3] = 0;
      out[4] = z1 * x2 - z2 * x1;
      out[5] = z2 * x0 - z0 * x2;
      out[6] = z0 * x1 - z1 * x0;
      out[7] = 0;
      out[8] = z0;
      out[9] = z1;
      out[10] = z2;
      out[11] = 0;
      out[12] = eyex;
      out[13] = eyey;
      out[14] = eyez;
      out[15] = 1;
      return out;
    }

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */
    function create$4() {
      var out = new ARRAY_TYPE(3);
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      return out;
    }

    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length(a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */
    function fromValues$4(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }

    /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
    function copy$4(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      return out;
    }

    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
    function normalize(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;
      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
      }
      return out;
    }

    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function cross(out, a, b) {
      var ax = a[0],
          ay = a[1],
          az = a[2];
      var bx = b[0],
          by = b[1],
          bz = b[2];

      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }

    /**
     * Alias for {@link vec3.length}
     * @function
     */
    var len = length;

    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach = function () {
      var vec = create$4();

      return function (a, stride, offset, count, fn, arg) {
        var i = void 0,
            l = void 0;
        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
        }

        return a;
      };
    }();

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * 4 Dimensional Vector
     * @module vec4
     */

    /**
     * Creates a new, empty vec4
     *
     * @returns {vec4} a new 4D vector
     */
    function create$5() {
      var out = new ARRAY_TYPE(4);
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      return out;
    }

    /**
     * Creates a new vec4 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {vec4} a new 4D vector
     */
    function fromValues$5(x, y, z, w) {
      var out = new ARRAY_TYPE(4);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      out[3] = w;
      return out;
    }

    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to normalize
     * @returns {vec4} out
     */
    function normalize$1(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var w = a[3];
      var len = x * x + y * y + z * z + w * w;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
      }
      return out;
    }

    /**
     * Perform some operation over an array of vec4s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach$1 = function () {
      var vec = create$5();

      return function (a, stride, offset, count, fn, arg) {
        var i = void 0,
            l = void 0;
        if (!stride) {
          stride = 4;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
          fn(vec, vec, arg);
          a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
        }

        return a;
      };
    }();

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * Quaternion
     * @module quat
     */

    /**
     * Creates a new identity quat
     *
     * @returns {quat} a new quaternion
     */
    function create$6() {
      var out = new ARRAY_TYPE(4);
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    }

    /**
     * Set a quat to the identity quaternion
     *
     * @param {quat} out the receiving quaternion
     * @returns {quat} out
     */
    function identity$4(out) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    }

    /**
     * Sets a quat from the given angle and rotation axis,
     * then returns it.
     *
     * @param {quat} out the receiving quaternion
     * @param {vec3} axis the axis around which to rotate
     * @param {Number} rad the angle in radians
     * @returns {quat} out
     **/
    function setAxisAngle(out, axis, rad) {
      rad = rad * 0.5;
      var s = Math.sin(rad);
      out[0] = s * axis[0];
      out[1] = s * axis[1];
      out[2] = s * axis[2];
      out[3] = Math.cos(rad);
      return out;
    }

    /**
     * Gets the rotation axis and angle for a given
     *  quaternion. If a quaternion is created with
     *  setAxisAngle, this method will return the same
     *  values as providied in the original parameter list
     *  OR functionally equivalent values.
     * Example: The quaternion formed by axis [0, 0, 1] and
     *  angle -90 is the same as the quaternion formed by
     *  [0, 0, 1] and 270. This method favors the latter.
     * @param  {vec3} out_axis  Vector receiving the axis of rotation
     * @param  {quat} q     Quaternion to be decomposed
     * @return {Number}     Angle, in radians, of the rotation
     */
    function getAxisAngle(out_axis, q) {
      var rad = Math.acos(q[3]) * 2.0;
      var s = Math.sin(rad / 2.0);
      if (s != 0.0) {
        out_axis[0] = q[0] / s;
        out_axis[1] = q[1] / s;
        out_axis[2] = q[2] / s;
      } else {
        // If s is zero, return any axis (no rotation - axis does not matter)
        out_axis[0] = 1;
        out_axis[1] = 0;
        out_axis[2] = 0;
      }
      return rad;
    }

    /**
     * Rotates a quaternion by the given angle about the X axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateX$2(out, a, rad) {
      rad *= 0.5;

      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var bx = Math.sin(rad),
          bw = Math.cos(rad);

      out[0] = ax * bw + aw * bx;
      out[1] = ay * bw + az * bx;
      out[2] = az * bw - ay * bx;
      out[3] = aw * bw - ax * bx;
      return out;
    }

    /**
     * Rotates a quaternion by the given angle about the Y axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateY$2(out, a, rad) {
      rad *= 0.5;

      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var by = Math.sin(rad),
          bw = Math.cos(rad);

      out[0] = ax * bw - az * by;
      out[1] = ay * bw + aw * by;
      out[2] = az * bw + ax * by;
      out[3] = aw * bw - ay * by;
      return out;
    }

    /**
     * Rotates a quaternion by the given angle about the Z axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateZ$2(out, a, rad) {
      rad *= 0.5;

      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var bz = Math.sin(rad),
          bw = Math.cos(rad);

      out[0] = ax * bw + ay * bz;
      out[1] = ay * bw - ax * bz;
      out[2] = az * bw + aw * bz;
      out[3] = aw * bw - az * bz;
      return out;
    }

    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {quat} out
     */
    function slerp(out, a, b, t) {
      // benchmarks:
      //    http://jsperf.com/quaternion-slerp-implementations
      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3];
      var bx = b[0],
          by = b[1],
          bz = b[2],
          bw = b[3];

      var omega = void 0,
          cosom = void 0,
          sinom = void 0,
          scale0 = void 0,
          scale1 = void 0;

      // calc cosine
      cosom = ax * bx + ay * by + az * bz + aw * bw;
      // adjust signs (if necessary)
      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      // calculate coefficients
      if (1.0 - cosom > 0.000001) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
      }
      // calculate final values
      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;

      return out;
    }

    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     *
     * @param {quat} out the receiving quaternion
     * @param {mat3} m rotation matrix
     * @returns {quat} out
     * @function
     */
    function fromMat3(out, m) {
      // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
      // article "Quaternion Calculus and Fast Animation".
      var fTrace = m[0] + m[4] + m[8];
      var fRoot = void 0;

      if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)
        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
      } else {
        // |w| <= 1/2
        var i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        var j = (i + 1) % 3;
        var k = (i + 2) % 3;

        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
      }

      return out;
    }

    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */
    var normalize$2 = normalize$1;

    /**
     * Sets a quaternion to represent the shortest rotation from one
     * vector to another.
     *
     * Both vectors are assumed to be unit length.
     *
     * @param {quat} out the receiving quaternion.
     * @param {vec3} a the initial vector
     * @param {vec3} b the destination vector
     * @returns {quat} out
     */
    var rotationTo = function () {
      var tmpvec3 = create$4();
      var xUnitVec3 = fromValues$4(1, 0, 0);
      var yUnitVec3 = fromValues$4(0, 1, 0);

      return function (out, a, b) {
        var dot$$1 = dot(a, b);
        if (dot$$1 < -0.999999) {
          cross(tmpvec3, xUnitVec3, a);
          if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
          normalize(tmpvec3, tmpvec3);
          setAxisAngle(out, tmpvec3, Math.PI);
          return out;
        } else if (dot$$1 > 0.999999) {
          out[0] = 0;
          out[1] = 0;
          out[2] = 0;
          out[3] = 1;
          return out;
        } else {
          cross(tmpvec3, a, b);
          out[0] = tmpvec3[0];
          out[1] = tmpvec3[1];
          out[2] = tmpvec3[2];
          out[3] = 1 + dot$$1;
          return normalize$2(out, out);
        }
      };
    }();

    /**
     * Performs a spherical linear interpolation with two control points
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {quat} c the third operand
     * @param {quat} d the fourth operand
     * @param {Number} t interpolation amount
     * @returns {quat} out
     */
    var sqlerp = function () {
      var temp1 = create$6();
      var temp2 = create$6();

      return function (out, a, b, c, d, t) {
        slerp(temp1, a, d, t);
        slerp(temp2, b, c, t);
        slerp(out, temp1, temp2, 2 * t * (1 - t));

        return out;
      };
    }();

    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     *
     * @param {vec3} view  the vector representing the viewing direction
     * @param {vec3} right the vector representing the local "right" direction
     * @param {vec3} up    the vector representing the local "up" direction
     * @returns {quat} out
     */
    var setAxes = function () {
      var matr = create$2();

      return function (out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return normalize$2(out, fromMat3(out, matr));
      };
    }();

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE. */

    /**
     * 2 Dimensional Vector
     * @module vec2
     */

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */
    function create$8() {
      var out = new ARRAY_TYPE(2);
      out[0] = 0;
      out[1] = 0;
      return out;
    }

    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach$2 = function () {
      var vec = create$8();

      return function (a, stride, offset, count, fn, arg) {
        var i = void 0,
            l = void 0;
        if (!stride) {
          stride = 2;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];vec[1] = a[i + 1];
          fn(vec, vec, arg);
          a[i] = vec[0];a[i + 1] = vec[1];
        }

        return a;
      };
    }();

    /**
     * @fileoverview gl-matrix - High performance matrix and vector operations
     * @author Brandon Jones
     * @author Colin MacKenzie IV
     * @version 2.4.0
     */

    // pvt
    function normalize$5(array) {
        return fromValues$4(array[0] / 255, array[1] / 255, array[2] / 255);
    }

    function hexIntToRgb(hex) {
        var r = hex >> 16;
        var g = hex >> 8 & 0xFF; // eslint-disable-line
        var b = hex & 0xFF;
        return fromValues$4(r, g, b);
    }

    function hexStringToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? fromValues$4(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    function rgbToHex(r, g, b) {
        var hexR = componentToHex(r);
        var hexG = componentToHex(g);
        var hexB = componentToHex(b);
        return '#' + hexR + hexG + hexB;
    }

    function convert(hex) {
        var color = create$4();
        var rgb = typeof hex === 'number' ? hexIntToRgb(hex) : hexStringToRgb(hex);
        copy$4(color, normalize$5(rgb));
        return color;
    }

    var color = /*#__PURE__*/Object.freeze({
        hexIntToRgb: hexIntToRgb,
        hexStringToRgb: hexStringToRgb,
        componentToHex: componentToHex,
        rgbToHex: rgbToHex,
        convert: convert
    });

    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function mod(m, n) {
        return (m % n + n) % n;
    }

    var math = /*#__PURE__*/Object.freeze({
        randomRange: randomRange,
        mod: mod
    });

    var WORD_REGX = function WORD_REGX(word) {
        return new RegExp('\\b' + word + '\\b', 'gi');
    };

    var LINE_REGX = function LINE_REGX(word) {
        return new RegExp('' + word, 'gi');
    };

    var VERTEX = [{
        match: WORD_REGX('in'),
        replace: 'attribute'
    }, {
        match: WORD_REGX('out'),
        replace: 'varying'
    }];

    var FRAGMENT = [{
        match: WORD_REGX('in'),
        replace: 'varying'
    }, {
        match: LINE_REGX('out vec4 outColor;'),
        replace: ''
    }, {
        match: WORD_REGX('outColor'),
        replace: 'gl_FragColor'
    }, {
        match: WORD_REGX('textureProj'),
        replace: 'texture2DProj'
    }, {
        match: WORD_REGX('texture'),
        replace: function replace(shader) {
            // Find all texture defintions
            var textureGlobalRegx = new RegExp('\\btexture\\b', 'gi');

            // Find single texture definition
            var textureSingleRegx = new RegExp('\\btexture\\b', 'i');

            // Gets the texture call signature e.g texture(uTexture1, vUv);
            var textureUniformNameRegx = new RegExp(/texture\(([^)]+)\)/, 'i');

            // Get all matching occurances
            var matches = shader.match(textureGlobalRegx);
            var replacement = '';

            // If nothing matches return
            if (matches === null) return shader;

            // Replace each occurance by it's uniform type
            /* eslint-disable */
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = matches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var i = _step.value;

                    var match = shader.match(textureUniformNameRegx)[0];
                    if (match) {
                        var uniformName = match.replace('texture(', '').split(',')[0];
                        var uniformType = shader.match('(.*?) ' + uniformName, 'i')[1].replace(/^\s+|\s+$/gm, '');
                        uniformType = uniformType.split(' ')[1];

                        switch (uniformType) {
                            case 'sampler2D':
                                replacement = 'texture2D';
                                break;
                            case 'samplerCube':
                                replacement = 'textureCube';
                                break;
                            default:
                                break;
                        }
                    }
                    shader = shader.replace(textureSingleRegx, replacement);
                }
                /* eslint-enable */
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return shader;
        }
    }];

    var GENERIC = [{
        match: LINE_REGX('#version 300 es'),
        replace: ''
    }];

    var VERTEX_RULES = [].concat(GENERIC, VERTEX);
    var FRAGMENT_RULES = [].concat(GENERIC, FRAGMENT);

    /**
     *
     */
    var transform = function transform(code) {
        return code
        // removes //
        .replace(/[ \t]*\/\/.*\n/g, '')
        // remove /* */
        .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
        // removes multiple white spaces
        .replace(/^\s+|\s+$|\s+(?=\s)/g, '');
    };

    /**
     * Replaces es300 syntax to es100
     */
    function parse(shader, shaderType) {
        if (getContextType() === CONTEXT.WEBGL2) {
            return shader;
        }

        var rules = shaderType === 'vertex' ? VERTEX_RULES : FRAGMENT_RULES;
        rules.forEach(function (rule) {
            if (typeof rule.replace === 'function') {
                shader = rule.replace(shader);
            } else {
                shader = shader.replace(rule.match, rule.replace);
            }
        });

        return transform(shader);
    }



    var index$1 = /*#__PURE__*/Object.freeze({
        color: color,
        math: math,
        glsl3to1: parse
    });

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    var toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      } else {
        return Array.from(arr);
      }
    };

    var Vector3 = function () {
        function Vector3() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            classCallCheck(this, Vector3);

            this.data = fromValues$4(x, y, z);
        }

        createClass(Vector3, [{
            key: 'set',
            value: function set$$1(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
        }, {
            key: 'x',
            set: function set$$1(value) {
                this.data[0] = value;
            },
            get: function get$$1() {
                return this.data[0];
            }
        }, {
            key: 'y',
            set: function set$$1(value) {
                this.data[1] = value;
            },
            get: function get$$1() {
                return this.data[1];
            }
        }, {
            key: 'z',
            set: function set$$1(value) {
                this.data[2] = value;
            },
            get: function get$$1() {
                return this.data[2];
            }
        }]);
        return Vector3;
    }();

    var uuid = 0;
    var axisAngle = 0;
    var quaternionAxisAngle = create$4();

    var Object3 = function () {
        function Object3() {
            classCallCheck(this, Object3);

            this.uid = uuid++;

            this.parent = null;
            this.children = [];

            this.position = new Vector3();
            this.rotation = new Vector3();
            this.scale = new Vector3(1, 1, 1);

            this._transparent = false;
            this._visible = true;

            this.quaternion = create$6();

            this.target = create$4();
            this.up = fromValues$4(0, 1, 0);
            this.lookToTarget = false;

            this.matrices = {
                parent: create$3(),
                model: create$3(),
                lookAt: create$3()
            };

            this.dirty = {
                sorting: false,
                transparent: false,
                attributes: false,
                shader: false
            };

            this.sceneGraphSorter = false;
        }

        createClass(Object3, [{
            key: 'updateMatrices',
            value: function updateMatrices() {
                identity$3(this.matrices.parent);
                identity$3(this.matrices.model);
                identity$3(this.matrices.lookAt);
                identity$4(this.quaternion);

                if (this.parent) {
                    copy$3(this.matrices.parent, this.parent.matrices.model);
                    multiply$3(this.matrices.model, this.matrices.model, this.matrices.parent);
                }

                if (this.lookToTarget) {
                    targetTo(this.matrices.lookAt, this.position.data, this.target, this.up);
                    multiply$3(this.matrices.model, this.matrices.model, this.matrices.lookAt);
                } else {
                    translate$2(this.matrices.model, this.matrices.model, this.position.data);
                    rotateX$2(this.quaternion, this.quaternion, this.rotation.x);
                    rotateY$2(this.quaternion, this.quaternion, this.rotation.y);
                    rotateZ$2(this.quaternion, this.quaternion, this.rotation.z);
                    axisAngle = getAxisAngle(quaternionAxisAngle, this.quaternion);
                    rotate$3(this.matrices.model, this.matrices.model, axisAngle, quaternionAxisAngle);
                }
                scale$3(this.matrices.model, this.matrices.model, this.scale.data);
            }
        }, {
            key: 'init',
            value: function init() {
                // to be overriden;
            }
        }, {
            key: 'add',
            value: function add$$1(model) {
                model.parent = this;
                this.children.push(model);
                this.dirty.sorting = true;
            }
        }, {
            key: 'remove',
            value: function remove(model) {
                var index = this.children.indexOf(model);
                if (index !== -1) {
                    model.destroy();
                    this.children.splice(index, 1);
                    this.dirty.sorting = true;
                }
            }
        }, {
            key: 'traverse',
            value: function traverse(object) {
                // if traversed object is the scene
                if (object === undefined) {
                    object = this;
                    this.sceneGraphSorter = true;
                }

                for (var i = 0; i < object.children.length; i++) {
                    this.traverse(object.children[i]);
                }

                if (object.parent !== null) {
                    object.updateMatrices();
                }

                // NOTE
                // to improve performance, we also check if the objects are dirty when we traverse them.
                // this avoids having a second loop through the graph scene.
                //
                // if any element gets added / removed from scene
                // or if its transparency changes, we need to sort them again into
                // opaque / transparent arrays
                if (object.dirty.sorting || object.dirty.transparent) {
                    object.dirty.transparent = false;
                    this.sceneGraphSorter = true;
                }

                return this.sceneGraphSorter;
            }
        }, {
            key: 'transparent',
            set: function set$$1(value) {
                this.dirty.transparent = this.transparent !== value;
                this._transparent = value;
            },
            get: function get$$1() {
                return this._transparent;
            }
        }, {
            key: 'visible',
            set: function set$$1(value) {
                this.dirty.sorting = this.visible !== value;
                this._visible = value;
            },
            get: function get$$1() {
                return this._visible;
            }
        }]);
        return Object3;
    }();

    var OrthographicCamera = function (_Object) {
        inherits(OrthographicCamera, _Object);

        function OrthographicCamera() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, OrthographicCamera);

            var _this = possibleConstructorReturn(this, (OrthographicCamera.__proto__ || Object.getPrototypeOf(OrthographicCamera)).call(this));

            Object.assign(_this, {
                left: -1,
                right: 1,
                top: 1,
                bottom: -1,
                near: -1000,
                far: 1000
            }, params);

            _this.matrices.projection = create$3();
            return _this;
        }

        createClass(OrthographicCamera, [{
            key: 'lookAt',
            value: function lookAt$$1(v) {
                copy$4(this.target, v);
            }
        }, {
            key: 'updateCameraMatrix',
            value: function updateCameraMatrix() {
                // left, right, bottom, top, near, far
                ortho(this.matrices.projection, this.left, this.right, this.bottom, this.top, this.near, this.far);
            }
        }]);
        return OrthographicCamera;
    }(Object3);

    var PerspectiveCamera = function (_Object) {
        inherits(PerspectiveCamera, _Object);

        function PerspectiveCamera() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, PerspectiveCamera);

            var _this = possibleConstructorReturn(this, (PerspectiveCamera.__proto__ || Object.getPrototypeOf(PerspectiveCamera)).call(this));

            Object.assign(_this, {
                near: 1,
                far: 1000,
                fov: 35
            }, params);

            _this.matrices.projection = create$3();
            return _this;
        }

        createClass(PerspectiveCamera, [{
            key: 'lookAt',
            value: function lookAt$$1(v) {
                copy$4(this.target, v);
            }
        }, {
            key: 'updateCameraMatrix',
            value: function updateCameraMatrix(width, height) {
                perspective(this.matrices.projection, this.fov * (Math.PI / 180), width / height, this.near, this.far);
            }
        }]);
        return PerspectiveCamera;
    }(Object3);



    var index$2 = /*#__PURE__*/Object.freeze({
        Orthographic: OrthographicCamera,
        Perspective: PerspectiveCamera
    });

    var Basic = function Basic() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, Basic);

        var color = props.color || fromValues$4(1, 1, 1);

        var vertex = '#version 300 es\n            ' + EXTENSIONS.vertex() + '\n\n            in vec3 a_position;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n\n            void main() {\n                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n            }\n        ';

        var fragment = '#version 300 es\n            ' + EXTENSIONS.fragment() + '\n\n            precision highp float;\n            precision highp int;\n\n            ' + UBO.scene() + '\n\n            uniform vec3 u_color;\n\n            out vec4 outColor;\n\n            void main() {\n                vec4 base = vec4(u_color, 1.0);\n\n                ' + FOG.linear() + '\n\n                outColor = base;\n            }\n        ';

        return Object.assign({
            type: SHADER_BASIC,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES
        }, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                u_color: {
                    type: 'vec3',
                    value: color
                }
            }
        });
    };

    var Texture = function () {
        function Texture() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, Texture);

            var gl = getContext();

            Object.assign(this, {
                magFilter: gl.NEAREST,
                minFilter: gl.NEAREST,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                transparent: false
            }, props);

            var data = new Uint8Array([255, 255, 255, 255]);
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
            if (this.transparent) {
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            }

            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        createClass(Texture, [{
            key: 'fromImage',
            value: function fromImage(url) {
                var _this = this;

                var img = new Image();
                img.crossOrigin = '';
                img.onload = function () {
                    _this.update(img);
                };
                img.src = url;
            }
        }, {
            key: 'update',
            value: function update(image) {
                var gl = getContext();
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }]);
        return Texture;
    }();

    var Default = function Default() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, Default);

        var color = props.color || fromValues$4(1, 1, 1);
        this.map = new Texture({ transparent: true });

        // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/620678/red.jpg'.
        if (props.map) {
            this.map.fromImage(props.map);
        }

        // texture: new Texture()
        if (props.texture) {
            this.map = props.texture;
        }

        var vertex = '#version 300 es\n            ' + EXTENSIONS.vertex() + '\n\n            in vec3 a_position;\n            in vec3 a_normal;\n            in vec2 a_uv;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + CLIPPING.vertex_pre() + '\n            ' + SHADOW.vertex_pre() + '\n\n            out vec3 fragVertexEc;\n            out vec2 v_uv;\n            out vec3 v_normal;\n\n            void main() {\n                vec4 worldPosition = modelMatrix * vec4(a_position, 1.0);\n                vec4 position = projectionMatrix * viewMatrix * worldPosition;\n                gl_Position = position;\n\n                fragVertexEc = position.xyz; // worldPosition.xyz;\n                v_uv = a_uv;\n                v_normal = (normalMatrix * vec4(a_normal, 1.0)).xyz;\n\n                ' + SHADOW.vertex() + '\n                ' + CLIPPING.vertex() + '\n            }\n        ';

        var fragment = '#version 300 es\n            ' + EXTENSIONS.fragment() + '\n\n            precision highp float;\n            precision highp int;\n\n            in vec3 fragVertexEc;\n            in vec2 v_uv;\n            in vec3 v_normal;\n\n            ' + CLIPPING.fragment_pre() + '\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + UBO.lights() + '\n\n            uniform sampler2D u_map;\n            uniform vec3 u_color;\n\n            ' + SHADOW.fragment_pre() + '\n\n            out vec4 outColor;\n\n            void main() {\n                vec3 v_normal = normalize(cross(dFdx(fragVertexEc), dFdy(fragVertexEc)));\n\n                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);\n                base += vec4(u_color, 1.0);\n                base *= texture(u_map, v_uv);\n\n                ' + SHADOW.fragment() + '\n                ' + LIGHT.factory() + '\n                ' + FOG.linear() + '\n                ' + CLIPPING.fragment() + '\n\n                outColor = base;\n            }\n        ';

        return Object.assign({
            type: SHADER_DEFAULT,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES
        }, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture
                },

                u_color: {
                    type: 'vec3',
                    value: color
                }
            }
        });
    };

    var Billboard = function Billboard() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, Billboard);

        this.map = new Texture();

        if (props.map) {
            this.map.fromImage(props.map);
        }

        if (props.texture) {
            this.map = props.texture;
        }

        var vertex = '#version 300 es\n            ' + EXTENSIONS.vertex() + '\n\n            in vec3 a_position;\n            in vec2 a_uv;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n\n            out vec2 v_uv;\n\n            void main() {\n                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n                v_uv = a_uv;\n            }\n        ';

        var fragment = '#version 300 es\n            ' + EXTENSIONS.fragment() + '\n\n            precision highp float;\n            precision highp int;\n\n            in vec2 v_uv;\n\n            ' + UBO.scene() + '\n\n            uniform sampler2D u_map;\n\n            out vec4 outColor;\n\n            void main() {\n                // depth map\n                float z = texture(u_map, v_uv).r;\n                float n = 1.0;\n                float f = 1000.0;\n                float c = (2.0 * n) / (f + n - z * (f - n));\n\n                // draw depth\n                outColor = vec4(c);\n            }\n        ';

        return Object.assign({
            type: SHADER_BILLBOARD,
            mode: DRAW.TRIANGLES
        }, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture
                }
            }
        });
    };

    var Sem = function Sem() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, Sem);

        this.map = new Texture({ transparent: true });

        if (props.map) {
            this.map.fromImage(props.map);
        }

        // texture: new Texture()
        if (props.texture) {
            this.map = props.texture;
        }

        var vertex = '#version 300 es\n            ' + EXTENSIONS.vertex() + '\n\n            in vec3 a_position;\n            in vec3 a_normal;\n            in vec2 a_uv;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + CLIPPING.vertex_pre() + '\n\n            out vec2 v_uv;\n\n            void main() {\n                vec4 position = viewMatrix * modelMatrix * vec4(a_position, 1.0);\n                gl_Position = projectionMatrix * position;\n\n                vec3 v_e = vec3(position);\n                vec3 v_n = mat3(viewMatrix * modelMatrix) * a_normal;\n                vec3 r = reflect(normalize(v_e), normalize(v_n));\n                float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.0, 2.0));\n                v_uv = r.xy / m + 0.5;\n\n                ' + CLIPPING.vertex() + '\n            }\n        ';

        var fragment = '#version 300 es\n            ' + EXTENSIONS.fragment() + '\n\n            precision highp float;\n            precision highp int;\n\n            in vec2 v_uv;\n\n            ' + CLIPPING.fragment_pre() + '\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + UBO.lights() + '\n\n            uniform sampler2D u_map;\n\n            out vec4 outColor;\n\n            void main() {\n                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);\n\n                base += texture(u_map, v_uv);\n\n                ' + FOG.linear() + '\n                ' + CLIPPING.fragment() + '\n\n                outColor = base;\n            }\n        ';

        return Object.assign({
            type: SHADER_SEM
        }, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture
                }
            }
        });
    };



    var index$3 = /*#__PURE__*/Object.freeze({
        Basic: Basic,
        Default: Default,
        Billboard: Billboard,
        Sem: Sem
    });

    var PROGRAM_POOL = {};

    function createShader(gl, str, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);

            gl.deleteShader(shader);
            console.error(error, str);
            throw new Error(error);
        }

        return shader;
    }

    var createProgram = function createProgram(gl, vertex, fragment, programID) {
        var pool = PROGRAM_POOL["pool_" + programID];
        if (!pool) {
            var vs = createShader(gl, vertex, gl.VERTEX_SHADER);
            var fs = createShader(gl, fragment, gl.FRAGMENT_SHADER);

            var program = gl.createProgram();

            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);

            PROGRAM_POOL["pool_" + programID] = program;

            return program;
        }

        return pool;
    };

    var Ubo = function () {
        function Ubo(data, boundLocation) {
            classCallCheck(this, Ubo);

            var gl = getContext();
            this.boundLocation = boundLocation;

            this.data = new Float32Array(data);

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
            gl.bufferData(gl.UNIFORM_BUFFER, this.data, gl.STATIC_DRAW); // DYNAMIC_DRAW
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        }

        createClass(Ubo, [{
            key: 'bind',
            value: function bind() {
                var gl = getContext();
                gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
                // gl.bindBufferBase(gl.UNIFORM_BUFFER, null); // MAYBE?
            }
        }, {
            key: 'update',
            value: function update(data) {
                var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

                var gl = getContext();

                this.data.set(data, offset);

                gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
                gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.data, 0, null);
                gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            }
        }]);
        return Ubo;
    }();

    var Vao = function () {
        function Vao() {
            classCallCheck(this, Vao);

            var gl = getContext();

            var _supports = supports(),
                vertexArrayObject = _supports.vertexArrayObject;

            if (getContextType() === CONTEXT.WEBGL2) {
                this.vao = gl.createVertexArray();
                gl.bindVertexArray(this.vao);
            } else if (vertexArrayObject) {
                this.vao = supports().vertexArrayObject.createVertexArrayOES();
                vertexArrayObject.bindVertexArrayOES(this.vao);
            }
        }

        createClass(Vao, [{
            key: 'bind',
            value: function bind() {
                var gl = getContext();

                var _supports2 = supports(),
                    vertexArrayObject = _supports2.vertexArrayObject;

                if (getContextType() === CONTEXT.WEBGL2) {
                    gl.bindVertexArray(this.vao);
                } else if (vertexArrayObject) {
                    vertexArrayObject.bindVertexArrayOES(this.vao);
                }
            }
        }, {
            key: 'unbind',
            value: function unbind() {
                var gl = getContext();

                var _supports3 = supports(),
                    vertexArrayObject = _supports3.vertexArrayObject;

                if (getContextType() === CONTEXT.WEBGL2) {
                    gl.bindVertexArray(null);
                } else if (vertexArrayObject) {
                    vertexArrayObject.bindVertexArrayOES(null);
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                var gl = getContext();

                var _supports4 = supports(),
                    vertexArrayObject = _supports4.vertexArrayObject;

                if (getContextType() === CONTEXT.WEBGL2) {
                    gl.deleteVertexArray(this.vao);
                } else if (vertexArrayObject) {
                    vertexArrayObject.deleteVertexArrayOES(this.vao);
                }
                this.vao = null;
            }
        }]);
        return Vao;
    }();

    var getTypeSize = function getTypeSize(type) {
        switch (type) {
            case 'float':
                return 1;
            case 'vec2':
                return 2;
            case 'vec3':
                return 3;
            case 'vec4':
            case 'mat2':
                return 4;
            case 'mat3':
                return 9;
            case 'mat4':
                return 16;
            default:
                throw new Error('"' + type + '" is an unknown type');
        }
    };

    var initAttributes = function initAttributes(attributes, program) {
        var gl = getContext();

        for (var prop in attributes) {
            var current = attributes[prop];
            var location = gl.getAttribLocation(program, prop);

            var b = current.buffer;
            if (!current.buffer) {
                b = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, current.value, gl.STATIC_DRAW); // or DYNAMIC_DRAW
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            Object.assign(current, {
                location: location,
                buffer: b
            });
        }
    };

    var bindAttributes = function bindAttributes(attributes) {
        var gl = getContext();

        Object.keys(attributes).forEach(function (key) {
            var _attributes$key = attributes[key],
                location = _attributes$key.location,
                buffer = _attributes$key.buffer,
                size = _attributes$key.size,
                instanced = _attributes$key.instanced;


            if (location !== -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(location);

                var divisor = instanced ? 1 : 0;
                if (getContextType() === CONTEXT.WEBGL2) {
                    gl.vertexAttribDivisor(location, divisor);
                } else {
                    supports().instancedArrays.vertexAttribDivisorANGLE(location, divisor);
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        });
    };

    var updateAttributes = function updateAttributes(attributes) {
        var gl = getContext();
        Object.keys(attributes).forEach(function (key) {
            var _attributes$key2 = attributes[key],
                location = _attributes$key2.location,
                buffer = _attributes$key2.buffer,
                value = _attributes$key2.value;


            if (location !== -1) {
                gl.enableVertexAttribArray(location);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        });
    };

    var initUniforms = function initUniforms(uniforms, program) {
        var gl = getContext();

        var textureIndices = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5];

        var i = 0;

        Object.keys(uniforms).forEach(function (prop) {
            var current = uniforms[prop];
            var location = gl.getUniformLocation(program, prop);

            Object.assign(current, {
                location: location
            });

            if (current.type === 'sampler2D') {
                current.textureIndex = i;
                current.activeTexture = textureIndices[i];
                i++;
            }
        });
    };

    var updateUniforms = function updateUniforms(uniforms) {
        var gl = getContext();
        Object.keys(uniforms).forEach(function (key) {
            var uniform = uniforms[key];

            switch (uniform.type) {
                case 'mat4':
                    gl.uniformMatrix4fv(uniform.location, false, uniform.value);
                    break;
                case 'mat3':
                    gl.uniformMatrix3fv(uniform.location, false, uniform.value);
                    break;
                case 'vec4':
                    gl.uniform4fv(uniform.location, uniform.value);
                    break;
                case 'vec3':
                    gl.uniform3fv(uniform.location, uniform.value);
                    break;
                case 'vec2':
                    gl.uniform2fv(uniform.location, uniform.value);
                    break;
                case 'float':
                    gl.uniform1f(uniform.location, uniform.value);
                    break;
                case 'sampler2D':
                    gl.activeTexture(uniform.activeTexture);
                    gl.bindTexture(gl.TEXTURE_2D, uniform.value);
                    gl.uniform1i(uniform.location, uniform.textureIndex);
                    break;
                default:
                    throw new Error('"' + uniform.type + '" is an unknown uniform type');
            }
        });
    };

    // used for speed optimisation
    var WEBGL2 = false;

    var Model = function (_Object) {
        inherits(Model, _Object);

        function Model() {
            classCallCheck(this, Model);

            var _this = possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this));

            _this.attributes = {};
            _this.uniforms = {};

            // z fight
            _this.polygonOffset = false;
            _this.polygonOffsetFactor = 0;
            _this.polygonOffsetUnits = 1;

            // clipping planes
            _this.clipping = {
                enable: false,
                planes: [create$5(), create$5(), create$5()]
            };

            // instancing
            _this.instanceCount = 0;
            _this.isInstance = false;

            // rendering mode
            _this.mode = DRAW.TRIANGLES;

            // rendering side
            _this.side = SIDE.FRONT;

            // type
            _this.type = String(SHADER_CUSTOM);

            // creates shadow
            _this.shadows = true;
            return _this;
        }

        createClass(Model, [{
            key: 'setAttribute',
            value: function setAttribute(name, type, value) {
                var size = getTypeSize(type);
                this.attributes[name] = {
                    value: value,
                    size: size
                };
            }
        }, {
            key: 'setIndex',
            value: function setIndex(value) {
                this.indices = {
                    value: value
                };
            }
        }, {
            key: 'setUniform',
            value: function setUniform(name, type, value) {
                this.uniforms[name] = {
                    value: value,
                    type: type
                };
            }
        }, {
            key: 'setShader',
            value: function setShader(vertex, fragment) {
                this.vertex = vertex;
                this.fragment = fragment;
            }
        }, {
            key: 'setInstanceAttribute',
            value: function setInstanceAttribute(name, type, value) {
                var size = getTypeSize(type);
                this.attributes[name] = {
                    value: value,
                    size: size,
                    instanced: true
                };
            }
        }, {
            key: 'setInstanceCount',
            value: function setInstanceCount(value) {
                this.instanceCount = value;
                if (this.instanceCount > 0) {
                    this.isInstance = true;
                } else {
                    this.isInstance = false;
                }
            }
        }, {
            key: 'init',
            value: function init() {
                var gl = getContext();

                WEBGL2 = getContextType() === CONTEXT.WEBGL2;

                // object material
                if (this.vertex && this.fragment) {
                    if (!WEBGL2) {
                        this.vertex = parse(this.vertex, 'vertex');
                        this.fragment = parse(this.fragment, 'fragment');
                    }

                    this.program = createProgram(gl, this.vertex, this.fragment, this.type);
                    gl.useProgram(this.program);

                    this.vao = new Vao();

                    initAttributes(this.attributes, this.program);
                    initUniforms(this.uniforms, this.program);

                    if (this.indices && !this.indices.buffer) {
                        this.indices.buffer = gl.createBuffer();
                    }

                    // this.vao.bind();
                    // this.bind();
                    // this.vao.unbind();
                    // this.unbind();
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.program = null;
            }
        }, {
            key: 'bind',
            value: function bind() {
                var gl = getContext();

                bindAttributes(this.attributes, this.program);

                if (this.indices) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices.value, gl.STATIC_DRAW);
                }
            }
        }, {
            key: 'unbind',
            value: function unbind() {
                var gl = getContext();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
        }, {
            key: 'update',
            value: function update(inShadowMap) {
                var gl = getContext();

                if (this.dirty.attributes) {
                    updateAttributes(this.attributes);
                    this.dirty.attributes = true;
                }

                updateUniforms(this.uniforms);

                // enable depth test and culling
                // TODO: maybe this can have own variables per model.
                // for example render targets don't need depth test
                // if (this.shadows === false) {
                //     gl.disable(gl.DEPTH_TEST);
                // }
                // gl.enable(gl.CULL_FACE);
                // gl.disable(gl.BLEND);

                if (this.polygonOffset) {
                    gl.enable(gl.POLYGON_OFFSET_FILL);
                    gl.polygonOffset(this.polygonOffsetFactor, this.polygonOffsetUnits);
                } else {
                    gl.disable(gl.POLYGON_OFFSET_FILL);
                }

                // https://webgl2fundamentals.org/webgl/lessons/webgl-text-texture.html
                // The most common solution for pretty much all transparent rendering is
                // to draw all the opaque stuff first,
                // then after, draw all the transparent stuff sorted by z distance
                // with the depth buffer testing on but depth buffer updating off
                if (this.transparent) {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    gl.disable(gl.DEPTH_TEST);
                }

                // double side material
                if (this.side === SIDE.FRONT) {
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK);
                } else if (this.side === SIDE.BACK) {
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.FRONT);
                } else if (this.side === SIDE.BOTH) {
                    gl.disable(gl.CULL_FACE);
                }

                if (inShadowMap) {
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.FRONT);
                }
            }
        }, {
            key: 'draw',
            value: function draw() {
                var gl = getContext();

                if (this.isInstance) {
                    if (WEBGL2) {
                        gl.drawElementsInstanced(this.mode, this.indices.value.length, gl.UNSIGNED_SHORT, 0, this.instanceCount);
                    } else {
                        supports().instancedArrays.drawElementsInstancedANGLE(this.mode, this.indices.value.length, gl.UNSIGNED_SHORT, 0, this.instanceCount);
                    }
                } else if (this.indices) {
                    gl.drawElements(this.mode, this.indices.value.length, gl.UNSIGNED_SHORT, 0);
                } else {
                    gl.drawArrays(this.mode, 0, this.attributes.a_position.value.length / 3);
                }
            }
        }]);
        return Model;
    }(Object3);

    var shaderID = 0;

    var Mesh = function (_Model) {
        inherits(Mesh, _Model);

        function Mesh() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, Mesh);

            var _this = possibleConstructorReturn(this, (Mesh.__proto__ || Object.getPrototypeOf(Mesh)).call(this));

            _this._shader = null;

            var _params$geometry = params.geometry,
                positions = _params$geometry.positions,
                indices = _params$geometry.indices,
                normals = _params$geometry.normals,
                uvs = _params$geometry.uvs;

            var _ref = params.shader || new Default({ color: params.color, map: params.map }),
                vertex = _ref.vertex,
                fragment = _ref.fragment,
                uniforms = _ref.uniforms,
                type = _ref.type,
                mode = _ref.mode;

            // if there's a type, assign it, so we can sort by type in the renderer.


            if (type !== undefined) {
                _this.type = type;
            } else {
                _this.type = SHADER_CUSTOM + '-' + shaderID++;
            }

            if (mode !== undefined) {
                _this.mode = mode;
            }

            _this.setAttribute('a_position', 'vec3', new Float32Array(positions));
            if (indices) {
                _this.setIndex(new Uint16Array(indices));
            }
            if (normals) {
                _this.setAttribute('a_normal', 'vec3', new Float32Array(normals));
            }
            if (uvs) {
                _this.setAttribute('a_uv', 'vec2', new Float32Array(uvs));
            }

            Object.keys(uniforms).forEach(function (key) {
                _this.setUniform(key, uniforms[key].type, uniforms[key].value);
            });

            _this.setShader(vertex, fragment);
            return _this;
        }

        createClass(Mesh, [{
            key: 'shader',
            set: function set(shader) {
                this.dirty.shader = true;
                this._shader = shader;
                if (shader.type !== undefined) {
                    this.type = shader.type;
                } else {
                    this.type = SHADER_CUSTOM;
                }
                this.setShader(shader.vertex, shader.fragment);
            },
            get: function get$$1() {
                return this._shader;
            }
        }]);
        return Mesh;
    }(Model);

    var AxisHelper = function (_Model) {
        inherits(AxisHelper, _Model);

        function AxisHelper() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, AxisHelper);

            var _this = possibleConstructorReturn(this, (AxisHelper.__proto__ || Object.getPrototypeOf(AxisHelper)).call(this));

            var size = props && props.size || 10;
            var g1 = { positions: [].concat(toConsumableArray(fromValues$4(0, 0, 0)), toConsumableArray(fromValues$4(size, 0, 0))) };
            var g2 = { positions: [].concat(toConsumableArray(fromValues$4(0, 0, 0)), toConsumableArray(fromValues$4(0, size, 0))) };
            var g3 = { positions: [].concat(toConsumableArray(fromValues$4(0, 0, 0)), toConsumableArray(fromValues$4(0, 0, size))) };

            var m1 = new Basic({ color: fromValues$4(1, 0, 0), wireframe: true });
            var m2 = new Basic({ color: fromValues$4(0, 1, 0), wireframe: true });
            var m3 = new Basic({ color: fromValues$4(0, 0, 1), wireframe: true });

            var x = new Mesh({ geometry: g1, shader: m1 });
            _this.add(x);

            var y = new Mesh({ geometry: g2, shader: m2 });
            _this.add(y);

            var z = new Mesh({ geometry: g3, shader: m3 });
            _this.add(z);
            return _this;
        }

        return AxisHelper;
    }(Model);

    // import { DRAW } from '../constants';

    var AxisHelper$1 = function (_Model) {
        inherits(AxisHelper, _Model);

        function AxisHelper() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, AxisHelper);

            var _this = possibleConstructorReturn(this, (AxisHelper.__proto__ || Object.getPrototypeOf(AxisHelper)).call(this));

            var size = props && props.size || 1;
            var geometry = {
                positions: []
            };

            // extract geometry
            var sx = props.model.scale.x;
            var sy = props.model.scale.y;
            var sz = props.model.scale.z;

            var length$$1 = props.model.attributes.a_normal.value.length / 3;
            for (var i = 0; i < length$$1; i++) {
                var i3 = i * 3;
                var v0x = sx * props.model.attributes.a_position.value[i3 + 0];
                var v0y = sy * props.model.attributes.a_position.value[i3 + 1];
                var v0z = sz * props.model.attributes.a_position.value[i3 + 2];
                var nx = props.model.attributes.a_normal.value[i3 + 0];
                var ny = props.model.attributes.a_normal.value[i3 + 1];
                var nz = props.model.attributes.a_normal.value[i3 + 2];
                var v1x = v0x + size * nx;
                var v1y = v0y + size * ny;
                var v1z = v0z + size * nz;
                geometry.positions = geometry.positions.concat([v0x, v0y, v0z, v1x, v1y, v1z]);
            }

            var shader = new Basic({ color: fromValues$4(0, 1, 1), wireframe: true });
            var n = new Mesh({ geometry: geometry, shader: shader });
            _this.add(n);

            _this.reference = props.model;
            // mode = DRAW.LINES
            return _this;
        }

        createClass(AxisHelper, [{
            key: 'update',
            value: function update() {
                get(AxisHelper.prototype.__proto__ || Object.getPrototypeOf(AxisHelper.prototype), 'update', this).call(this);

                copy$4(this.position.data, this.reference.position.data);
                copy$4(this.rotation.data, this.reference.rotation.data);
                this.lookToTarget = this.reference.lookToTarget;
            }
        }]);
        return AxisHelper;
    }(Model);



    var index$4 = /*#__PURE__*/Object.freeze({
        Axis: AxisHelper,
        Normals: AxisHelper$1
    });

    function resize(domElement, width, height, ratio) {
        domElement.width = width * ratio;
        domElement.height = height * ratio;
        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';
    }

    function unsupported() {
        var div = document.createElement('div');
        div.innerHTML = 'Your browser doesn\'t support WebGL.<br><a href="https://get.webgl.org">Get WebGL</a>';
        div.style.display = 'table';
        div.style.margin = '20px auto 0 auto';
        div.style.border = '1px solid #333';
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        div.style.borderRadius = '4px';
        div.style.padding = '10px';
        div.style.fontFamily = 'monospace';
        div.style.fontSize = '12px';
        div.style.textAlign = 'center';
        return div;
    }

    var Light = function () {
        function Light() {
            classCallCheck(this, Light);

            this.position = create$4();
        }

        createClass(Light, [{
            key: 'destroy',
            value: function destroy() {
                // TODO
            }
        }]);
        return Light;
    }();

    var Directional = function (_Light) {
        inherits(Directional, _Light);

        function Directional() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, Directional);

            var _this = possibleConstructorReturn(this, (Directional.__proto__ || Object.getPrototypeOf(Directional)).call(this));

            _this.type = DIRECTIONAL_LIGHT;

            _this.color = props.color || fromValues$4(1, 1, 1);
            _this.intensity = props.intensity || 0.989;
            return _this;
        }

        return Directional;
    }(Light);

    var Scene = function (_Object) {
        inherits(Scene, _Object);

        function Scene() {
            classCallCheck(this, Scene);

            var _this = possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).call(this));

            _this.lights = {
                directional: []
            };

            _this.fog = {
                enable: false,
                color: fromValues$5(0, 0, 0, 1),
                start: 500,
                end: 1000,
                density: 0.00025
            };

            _this.clipping = {
                enable: false,
                planes: [create$5(), create$5(), create$5()]
            };

            // add sun
            var directional = new Directional({
                near: 1,
                far: 1000
            });
            directional.position[0] = 125;
            directional.position[1] = 250;
            directional.position[2] = 500;
            _this.addLight(directional);
            return _this;
        }

        createClass(Scene, [{
            key: 'addLight',
            value: function addLight(light) {
                switch (light.type) {
                    case DIRECTIONAL_LIGHT:
                        this.lights.directional.push(light);
                        break;
                    default:
                    // unsupported light
                }
            }
        }, {
            key: 'removeLight',
            value: function removeLight(light) {
                var index = this.lights.directional.indexOf(light);
                if (index !== -1) {
                    light.destroy();
                    this.lights.directional.splice(index, 1);
                }
            }
        }]);
        return Scene;
    }(Object3);

    var RenderTarget = function () {
        function RenderTarget() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, RenderTarget);

            var gl = getContext();

            // some default props
            Object.assign(this, {
                width: 512,
                height: 512,
                internalformat: gl.DEPTH_COMPONENT,
                type: gl.UNSIGNED_SHORT
            }, props);

            if (getContextType() === CONTEXT.WEBGL2) {
                this.internalformat = gl.DEPTH_COMPONENT24;
                this.type = gl.UNSIGNED_INT;
            }

            // frame buffer
            this.frameBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

            // texture
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            // depth texture
            this.depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.internalformat, this.width, this.height, 0, gl.DEPTH_COMPONENT, this.type, null);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        createClass(RenderTarget, [{
            key: 'setSize',
            value: function setSize(width, height) {
                var gl = getContext();
                this.width = width;
                this.height = height;

                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.bindTexture(gl.TEXTURE_2D, null);

                gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, this.internalformat, this.width, this.height, 0, gl.DEPTH_COMPONENT, this.type, null);
                gl.bindTexture(gl.TEXTURE_2D, null);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
        }]);
        return RenderTarget;
    }();

    var ShadowMapRenderer = function () {
        function ShadowMapRenderer() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, ShadowMapRenderer);

            // size of texture
            this.width = props.width || 1024;
            this.height = props.height || 1024;

            // create render target
            var width = this.width,
                height = this.height;

            this.rt = new RenderTarget({ width: width, height: height });

            // matrices
            this.matrices = {
                view: create$3(),
                shadow: create$3(),
                bias: fromValues$3(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0)
            };

            // origin of directional light
            this.camera = new PerspectiveCamera({
                fov: 60,
                near: 1,
                far: 1000
            });

            this.camera = new OrthographicCamera();
            this.camera.position.z = 1; // TODO: remove this when fix lookAt bug on gl-matrix
            this.setLightOrigin(props.light || fromValues$4(100, 250, 500));
        }

        // move the camera to the light position


        createClass(ShadowMapRenderer, [{
            key: 'setLightOrigin',
            value: function setLightOrigin(vec) {
                // CAMERA

                // update camera position
                copy$4(this.camera.position.data, vec);

                // update view matrix
                identity$3(this.matrices.view);
                lookAt(this.matrices.view, this.camera.position.data, this.camera.target, this.camera.up);

                // SHADOW
                identity$3(this.matrices.shadow);
                multiply$3(this.matrices.shadow, this.camera.matrices.projection, this.matrices.view);
                multiply$3(this.matrices.shadow, this.matrices.bias, this.matrices.shadow);
            }

            /*
            TODO:
            maybe create a program just for shadows. this avoids having to change program
            in complex scenes just to write for the depth buffer.
            find a way to bypass the changeProgram on the renderer to accomodate this.
            */

        }]);
        return ShadowMapRenderer;
    }();

    var lastProgram = void 0;

    var sort = false;
    var startTime = Date.now();
    var WEBGL2$1 = false;

    var time = create$5();
    var fog = create$5();

    var matrices = {
        view: create$3(),
        normal: create$3(),
        modelView: create$3(),
        inversedModelView: create$3()
    };

    var cachedScene = null; // scene
    var cachedCamera = null; // camera

    var Renderer = function () {
        function Renderer() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, Renderer);

            this.supported = false;

            this.sorted = {
                opaque: [],
                transparent: [],
                shadow: []
            };

            this.performance = {
                opaque: 0,
                transparent: 0,
                shadow: 0,
                vertices: 0,
                instances: 0
            };

            this.ratio = props.ratio || window.devicePixelRatio;
            this.shadows = props.shadows || false;
            this.domElement = props.canvas || document.createElement('canvas');

            var contextType = setContextType(props.contextType);
            var gl = this.domElement.getContext(contextType, Object.assign({}, {
                antialias: false
            }, props));

            var session = supports();

            if (gl && (session.vertexArrayObject && session.instancedArrays && session.standardDerivatives && session.depthTextures || window.gli !== null)) {
                if (props.greeting !== false) {
                    var _console;

                    var lib = 'color:#666;font-size:x-small;font-weight:bold;';
                    var parameters = 'color:#777;font-size:x-small';
                    var values = 'color:#f33;font-size:x-small';
                    var args = ['%c' + library + ' - %cversion: %c' + version + ' %crunning: %c' + gl.getParameter(gl.VERSION), lib, parameters, values, parameters, values];

                    (_console = console).log.apply(_console, args);
                }

                setContext(gl);

                WEBGL2$1 = getContextType() === CONTEXT.WEBGL2;

                this.init();
            } else {
                this.domElement = unsupported();
            }
        }

        createClass(Renderer, [{
            key: 'init',
            value: function init() {
                this.supported = true;

                if (WEBGL2$1) {
                    this.perScene = new Ubo([].concat(toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(fog), toConsumableArray(create$5()), toConsumableArray(time), toConsumableArray(create$5()), toConsumableArray(create$5()), toConsumableArray(create$5()), toConsumableArray(create$5())), 0);

                    this.perModel = new Ubo([].concat(toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(create$5()), toConsumableArray(create$5()), toConsumableArray(create$5()), toConsumableArray(create$5())), 1);

                    this.directional = new Ubo(new Float32Array(MAX_DIRECTIONAL * 12), 2);
                }

                // shadows
                this.shadowmap = new ShadowMapRenderer();
            }
        }, {
            key: 'setSize',
            value: function setSize(width, height) {
                if (!this.supported) return;
                resize(this.domElement, width, height, this.ratio);
            }
        }, {
            key: 'setRatio',
            value: function setRatio(value) {
                this.ratio = value;
            }
        }, {
            key: 'changeProgram',
            value: function changeProgram(program) {
                var gl = getContext();
                gl.useProgram(program);

                if (WEBGL2$1) {
                    var sLocation = gl.getUniformBlockIndex(program, 'perScene');
                    var mLocation = gl.getUniformBlockIndex(program, 'perModel');
                    var dLocation = gl.getUniformBlockIndex(program, 'directional');
                    gl.uniformBlockBinding(program, sLocation, this.perScene.boundLocation);
                    gl.uniformBlockBinding(program, mLocation, this.perModel.boundLocation);

                    // is directional light in shader
                    if (dLocation === this.directional.boundLocation) {
                        gl.uniformBlockBinding(program, dLocation, this.directional.boundLocation);
                    }
                }
            }
        }, {
            key: 'draw',
            value: function draw(scene, camera, width, height) {
                if (!this.supported) return;
                // only necessary for webgl1 compatibility.
                cachedScene = scene;
                cachedCamera = camera;

                var gl = getContext();

                gl.enable(gl.DEPTH_TEST); // TODO: maybe change this to model.js ?
                gl.enable(gl.CULL_FACE); // TODO: maybe change this to model.js ?
                gl.disable(gl.BLEND); // TODO: maybe change this to model.js ?

                camera.updateCameraMatrix(width, height);

                // common matrices
                identity$3(matrices.view);
                lookAt(matrices.view, camera.position.data, camera.target, camera.up);

                // check if sorting is needed whilst traversing through the scene graph
                sort = scene.traverse();

                // if sorting is needed, reset stuff
                if (sort) {
                    this.sorted.opaque = [];
                    this.sorted.transparent = [];
                    this.sorted.shadow = [];

                    // can be deprecated, but its kind of cool
                    this.performance.opaque = 0;
                    this.performance.transparent = 0;
                    this.performance.shadow = 0;
                    this.performance.vertices = 0;
                    this.performance.instances = 0;

                    this.sort(scene);
                }

                // update time
                time[0] = (Date.now() - startTime) / 1000;
                fog[0] = scene.fog.enable;
                fog[1] = scene.fog.start;
                fog[2] = scene.fog.end;
                fog[3] = scene.fog.density;

                if (WEBGL2$1) {
                    // bind common buffers
                    this.perScene.bind();
                    this.perModel.bind();
                    this.directional.bind();

                    this.perScene.update([].concat(toConsumableArray(camera.matrices.projection), toConsumableArray(matrices.view), toConsumableArray(fog), toConsumableArray(scene.fog.color), toConsumableArray(time), [scene.clipping.enable, 0, 0, 0], toConsumableArray(scene.clipping.planes[0]), toConsumableArray(scene.clipping.planes[1]), toConsumableArray(scene.clipping.planes[2])));

                    for (var i = 0; i < scene.lights.directional.length; i++) {
                        this.directional.update([].concat(toConsumableArray(scene.lights.directional[i].position), [0]).concat([].concat(toConsumableArray(scene.lights.directional[i].color), [0]), [scene.lights.directional[i].intensity, 0, 0, 0]), i * 12);
                    }
                }

                // update light in shadowmap
                this.shadowmap.setLightOrigin(scene.lights.directional[0].position);

                // 1) render objects to shadowmap
                if (this.renderShadow) {
                    for (var _i = 0; _i < this.sorted.shadow.length; _i++) {
                        this.renderObject(this.sorted.shadow[_i], this.sorted.shadow[_i].program, true);
                    }
                    // return;
                }

                // 2) render opaque objects
                for (var _i2 = 0; _i2 < this.sorted.opaque.length; _i2++) {
                    this.renderObject(this.sorted.opaque[_i2], this.sorted.opaque[_i2].program);
                }

                // 3) sort and render transparent objects
                // expensive to sort transparent items per z-index.
                this.sorted.transparent.sort(function (a, b) {
                    return a.position.z - b.position.z;
                });

                for (var _i3 = 0; _i3 < this.sorted.transparent.length; _i3++) {
                    this.renderObject(this.sorted.transparent[_i3], this.sorted.transparent[_i3].program);
                }

                // 4) render gui
                // TODO
            }
        }, {
            key: 'rtt',
            value: function rtt(_ref) {
                var renderTarget = _ref.renderTarget,
                    scene = _ref.scene,
                    camera = _ref.camera,
                    _ref$clearColor = _ref.clearColor,
                    clearColor = _ref$clearColor === undefined ? [0, 0, 0, 1] : _ref$clearColor;
                // maybe order is important
                if (!this.supported) return;

                var gl = getContext();

                gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.frameBuffer);

                gl.viewport(0, 0, renderTarget.width, renderTarget.height);
                gl.clearColor.apply(gl, toConsumableArray(clearColor));
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                this.draw(scene, camera, renderTarget.width, renderTarget.height);

                gl.bindTexture(gl.TEXTURE_2D, renderTarget.texture);
                gl.bindTexture(gl.TEXTURE_2D, null);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
        }, {
            key: 'render',
            value: function render(scene, camera) {
                if (!this.supported) return;
                var gl = getContext();

                // render shadows
                if (this.shadows) {
                    // render scene to texture
                    this.renderShadow = true;
                    this.rtt({
                        renderTarget: this.shadowmap.rt,
                        scene: scene,
                        camera: this.shadowmap.camera,
                        clearColor: [1, 1, 1, 1]
                    });

                    this.renderShadow = false;
                }

                // render scene
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                this.draw(scene, camera, gl.canvas.width, gl.canvas.height);

                // TODO: render GUI objects
            }
        }, {
            key: 'updateMatrices',
            value: function updateMatrices(matrix) {
                identity$3(matrices.modelView);
                copy$3(matrices.modelView, matrix);
                invert$3(matrices.inversedModelView, matrices.modelView);
                transpose$2(matrices.inversedModelView, matrices.inversedModelView);
                identity$3(matrices.normal);
                copy$3(matrices.normal, matrices.inversedModelView);
            }
        }, {
            key: 'sort',
            value: function sort(object) {
                for (var i = 0; i < object.children.length; i++) {
                    this.sort(object.children[i]);
                }

                if (object.visible && !(object instanceof Scene)) {
                    // adds object to a opaque or transparent
                    if (object.transparent) {
                        this.sorted.transparent.push(object);
                        this.performance.transparent++;
                    } else {
                        this.sorted.opaque.push(object);
                        this.performance.opaque++;
                    }

                    // if shadows enabled on renderer, and shadows are enabled on object
                    if (this.shadows && object.shadows) {
                        this.sorted.shadow.push(object);
                        this.performance.shadow++;
                    }

                    // count vertice number
                    if (object.attributes.a_position) {
                        this.performance.vertices += object.attributes.a_position.value.length / 3;
                    }

                    // count instances
                    if (object.isInstance) {
                        this.performance.instances += object.instanceCount;
                    }
                }

                // sorting complete
                object.dirty.sorting = false;
            }
        }, {
            key: 'renderObject',
            value: function renderObject(object, program) {
                var inShadowMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                // its the parent node (scene.js)
                if (object.parent === null) {
                    return;
                }

                this.updateMatrices(object.matrices.model);

                if (object.dirty.shader) {
                    object.dirty.shader = false;

                    if (program) {
                        object.destroy();
                    }
                }

                if (!program) {
                    this.initUniformsPerModel(object);
                    object.init();
                    return;
                }

                if (lastProgram !== program) {
                    lastProgram = program;
                    this.changeProgram(lastProgram, object.type);
                }

                object.bind();

                this.updateUniformsPerModel(object);

                object.update(inShadowMap);
                object.draw();

                object.unbind();
            }
        }, {
            key: 'initUniformsPerModel',
            value: function initUniformsPerModel(object) {
                if (!WEBGL2$1) {
                    // per scene
                    object.setUniform('projectionMatrix', 'mat4', create$3());
                    object.setUniform('viewMatrix', 'mat4', create$3());
                    object.setUniform('fogSettings', 'vec4', fog);
                    object.setUniform('fogColor', 'vec4', create$5());
                    object.setUniform('iGlobalTime', 'float', time[0]);
                    object.setUniform('globalClipSettings', 'vec4', create$5());
                    object.setUniform('globalClipPlane0', 'vec4', create$5());
                    object.setUniform('globalClipPlane1', 'vec4', create$5());
                    object.setUniform('globalClipPlane2', 'vec4', create$5());
                    // per object
                    object.setUniform('modelMatrix', 'mat4', create$3());
                    object.setUniform('normalMatrix', 'mat4', create$3());
                    object.setUniform('localClipSettings', 'vec4', create$5());
                    object.setUniform('localClipPlane0', 'vec4', create$5());
                    object.setUniform('localClipPlane1', 'vec4', create$5());
                    object.setUniform('localClipPlane2', 'vec4', create$5());

                    // lights
                    object.setUniform('dlPosition', 'vec4', create$5());
                    object.setUniform('dlColor', 'vec4', create$5());
                    object.setUniform('flIntensity', 'float', 0);
                }

                object.setUniform('shadowMap', 'sampler2D', 0);
                object.setUniform('shadowMatrix', 'mat4', create$3());
                object.setUniform('shadowNear', 'float', 0);
                object.setUniform('shadowFar', 'float', 0);
            }
        }, {
            key: 'updateUniformsPerModel',
            value: function updateUniformsPerModel(object) {
                if (WEBGL2$1) {
                    this.perModel.update([].concat(toConsumableArray(object.matrices.model), toConsumableArray(matrices.normal), [object.clipping.enable, 0, 0, 0], toConsumableArray(object.clipping.planes[0]), toConsumableArray(object.clipping.planes[1]), toConsumableArray(object.clipping.planes[2])));
                } else {
                    // because UBO are webgl2 only, we need to manually add everything
                    // as uniforms
                    // per scene uniforms update
                    object.uniforms.projectionMatrix.value = cachedCamera.matrices.projection;
                    object.uniforms.viewMatrix.value = matrices.view;
                    object.uniforms.fogSettings.value = fog;
                    object.uniforms.fogColor.value = cachedScene.fog.color;
                    object.uniforms.iGlobalTime.value = time[0];
                    object.uniforms.globalClipSettings.value = [cachedScene.clipping.enable, 0, 0, 0];
                    object.uniforms.globalClipPlane0.value = cachedScene.clipping.planes[0];
                    object.uniforms.globalClipPlane1.value = cachedScene.clipping.planes[1];
                    object.uniforms.globalClipPlane2.value = cachedScene.clipping.planes[2];

                    // per model uniforms update
                    object.uniforms.modelMatrix.value = object.matrices.model;
                    object.uniforms.normalMatrix.value = matrices.normal;
                    object.uniforms.localClipSettings.value = [object.clipping.enable, 0, 0, 0];
                    object.uniforms.localClipPlane0.value = object.clipping.planes[0];
                    object.uniforms.localClipPlane1.value = object.clipping.planes[0];
                    object.uniforms.localClipPlane2.value = object.clipping.planes[0];
                }

                // test SHADOW
                object.uniforms.shadowMap.value = this.shadowmap.rt.depthTexture;
                object.uniforms.shadowMatrix.value = this.shadowmap.matrices.shadow;
                object.uniforms.shadowNear.value = this.shadowmap.camera.near;
                object.uniforms.shadowFar.value = this.shadowmap.camera.far;
            }
        }]);
        return Renderer;
    }();

    var Pass = function () {
        function Pass(props) {
            classCallCheck(this, Pass);

            this.scene = new Scene();

            var vertex = props.vertex,
                fragment = props.fragment,
                uniforms = props.uniforms;


            this.vertex = vertex;
            this.fragment = fragment;
            this.uniforms = uniforms;

            this.enable = true;
        }

        createClass(Pass, [{
            key: 'compile',
            value: function compile() {
                var shader = {
                    vertex: '#version 300 es\n                in vec3 a_position;\n                in vec3 a_normal;\n                in vec2 a_uv;\n\n                ' + UBO.scene() + '\n                ' + UBO.model() + '\n\n                ' + this.vertex,

                    fragment: '#version 300 es\n                precision highp float;\n                precision highp int;\n\n                ' + UBO.scene() + '\n                ' + UBO.model() + '\n\n                out vec4 outColor;\n                ' + this.fragment,
                    uniforms: this.uniforms
                };

                var geometry = {
                    positions: [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0],
                    indices: [0, 1, 2, 0, 2, 3],
                    uvs: [0, 0, 1, 0, 1, 1, 0, 1]
                };
                this.quad = new Mesh({ geometry: geometry, shader: shader });
                this.scene.add(this.quad);
            }
        }, {
            key: 'setUniform',
            value: function setUniform(key, value) {
                this.quad.uniforms[key].value = value;
            }
        }]);
        return Pass;
    }();

    var Basic$1 = {

        uniforms: {
            u_input: { type: 'sampler2D', value: null }
        },

        vertex: '\n    out vec2 v_uv;\n    void main() {\n        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n        v_uv = a_uv;\n    }',

        fragment: '\n    in vec2 v_uv;\n\n    uniform sampler2D u_input;\n\n    void main() {\n        outColor = texture(u_input, v_uv);\n    }'

    };

    var Composer = function () {
        function Composer(props) {
            classCallCheck(this, Composer);

            this.renderer = new Renderer(props);
            this.domElement = this.renderer.domElement;

            this.camera = new OrthographicCamera();
            this.camera.position.z = 100;

            this.passes = [];

            this.clearColor = fromValues$5(0, 0, 0, 1);

            this.screen = new Pass(Basic$1);
            this.screen.compile();

            this.buffers = [new RenderTarget(), new RenderTarget()];

            this.read = this.buffers[1];
            this.write = this.buffers[0];
        }

        createClass(Composer, [{
            key: 'setSize',
            value: function setSize(width, height) {
                this.renderer.setSize(width, height);
                this.read.setSize(width, height);
                this.write.setSize(width, height);
            }
        }, {
            key: 'setRatio',
            value: function setRatio(ratio) {
                this.renderer.setRatio(ratio);
            }
        }, {
            key: 'pass',
            value: function pass(_pass) {
                this.passes.push(_pass);
            }
        }, {
            key: 'compile',
            value: function compile() {
                for (var i = 0; i < this.passes.length; i++) {
                    this.passes[i].compile();
                }
            }
        }, {
            key: 'renderToTexture',
            value: function renderToTexture(renderTarget, scene, camera) {
                this.renderer.rtt({
                    renderTarget: renderTarget,
                    scene: scene,
                    camera: camera,
                    clearColor: this.clearColor
                });
            }
        }, {
            key: 'resetBuffers',
            value: function resetBuffers() {
                this.read = this.buffers[1];
                this.write = this.buffers[0];
            }
        }, {
            key: 'swapBuffers',
            value: function swapBuffers() {
                this.temp = this.read;
                this.read = this.write;
                this.write = this.temp;
            }
        }, {
            key: 'render',
            value: function render(scene, camera) {
                this.resetBuffers();
                this.renderToTexture(this.write, scene, camera);

                // ping pong textures through passes
                var total = this.passes.length;
                for (var i = 0; i < total; i++) {
                    if (this.passes[i].enable) {
                        this.swapBuffers();
                        this.passes[i].setUniform('u_input', this.read.texture);
                        this.renderToTexture(this.write, this.passes[i].scene, this.camera);
                    }
                }

                // render last pass to screen
                this.screen.setUniform('u_input', this.write.texture);
                this.renderer.render(this.screen.scene, this.camera);
            }
        }]);
        return Composer;
    }();

    var Performance = function () {
        function Performance() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, Performance);

            this.theme = params.theme || {
                font: 'font-family:sans-serif;font-size:xx-small;font-weight:bold;line-height:15px;-moz-osx-font-smoothing: grayscale;-webkit-font-smoothing: antialiased;',
                color1: '#242424',
                color2: '#2a2a2a',
                color3: '#666',
                color4: '#999'
            };

            var container = document.createElement('div');
            container.style.cssText = 'position:fixed;bottom:0;left:0;min-width:80px;opacity:0.9;z-index:10000;';

            this.holder = document.createElement('div');
            this.holder.style.cssText = 'padding:3px;background-color:' + this.theme.color1 + ';';
            container.appendChild(this.holder);

            var title = document.createElement('div');
            title.style.cssText = this.theme.font + ';color:' + this.theme.color3 + ';';
            title.innerHTML = 'Performance';
            this.holder.appendChild(title);

            this.msTexts = [];

            this.domElement = container;
        }

        createClass(Performance, [{
            key: 'rebuild',
            value: function rebuild(params) {
                var _this = this;

                this.msTexts = [];
                Object.keys(params).forEach(function (key) {
                    var element = document.createElement('div');
                    element.style.cssText = _this.theme.font + ';color:' + _this.theme.color4 + ';background-color:' + _this.theme.color2 + ';';
                    _this.holder.appendChild(element);
                    _this.msTexts[key] = element;
                });
            }
        }, {
            key: 'update',
            value: function update(renderer) {
                var _this2 = this;

                if (Object.keys(this.msTexts).length !== Object.keys(renderer.performance).length) {
                    this.rebuild(renderer.performance);
                }

                Object.keys(renderer.performance).forEach(function (key) {
                    _this2.msTexts[key].textContent = key + ': ' + renderer.performance[key];
                });
            }
        }]);
        return Performance;
    }();

    exports.chunks = index;
    exports.utils = index$1;
    exports.cameras = index$2;
    exports.shaders = index$3;
    exports.helpers = index$4;
    exports.constants = constants;
    exports.Renderer = Renderer;
    exports.Object3 = Object3;
    exports.Scene = Scene;
    exports.Model = Model;
    exports.Mesh = Mesh;
    exports.Texture = Texture;
    exports.RenderTarget = RenderTarget;
    exports.Composer = Composer;
    exports.Pass = Pass;
    exports.Performance = Performance;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2xpZ2h0LmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2ZvZy5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvc2Vzc2lvbi5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy91Ym8uanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3Mvbm9pc2UuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvY2xpcHBpbmcuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvZXh0ZW5zaW9ucy5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9zaGFkb3cuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvY29tbW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvbWF0MmQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvbWF0My5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9tYXQ0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvdmVjNC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9xdWF0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3F1YXQyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXguanMiLCIuLi9zcmMvdXRpbHMvY29sb3IuanMiLCIuLi9zcmMvdXRpbHMvbWF0aC5qcyIsIi4uL3NyYy91dGlscy9nbHNsLXBhcnNlci5qcyIsIi4uL3NyYy9jb3JlL3ZlY3RvcjMuanMiLCIuLi9zcmMvY29yZS9vYmplY3QzLmpzIiwiLi4vc3JjL2NhbWVyYXMvb3J0aG9ncmFwaGljLmpzIiwiLi4vc3JjL2NhbWVyYXMvcGVyc3BlY3RpdmUuanMiLCIuLi9zcmMvc2hhZGVycy9iYXNpYy5qcyIsIi4uL3NyYy9jb3JlL3RleHR1cmUuanMiLCIuLi9zcmMvc2hhZGVycy9kZWZhdWx0LmpzIiwiLi4vc3JjL3NoYWRlcnMvYmlsbGJvYXJkLmpzIiwiLi4vc3JjL3NoYWRlcnMvc2VtLmpzIiwiLi4vc3JjL2dsL3Byb2dyYW0uanMiLCIuLi9zcmMvZ2wvdWJvLmpzIiwiLi4vc3JjL2dsL3Zhby5qcyIsIi4uL3NyYy9nbC90eXBlcy5qcyIsIi4uL3NyYy9nbC9hdHRyaWJ1dGVzLmpzIiwiLi4vc3JjL2dsL3VuaWZvcm1zLmpzIiwiLi4vc3JjL2NvcmUvbW9kZWwuanMiLCIuLi9zcmMvY29yZS9tZXNoLmpzIiwiLi4vc3JjL2hlbHBlcnMvYXhpcy5qcyIsIi4uL3NyYy9oZWxwZXJzL25vcm1hbC5qcyIsIi4uL3NyYy91dGlscy9kb20uanMiLCIuLi9zcmMvY29yZS9saWdodHMuanMiLCIuLi9zcmMvY29yZS9zY2VuZS5qcyIsIi4uL3NyYy9jb3JlL3J0LmpzIiwiLi4vc3JjL2NvcmUvc2hhZG93LW1hcC1yZW5kZXJlci5qcyIsIi4uL3NyYy9jb3JlL3JlbmRlcmVyLmpzIiwiLi4vc3JjL2NvcmUvcGFzcy5qcyIsIi4uL3NyYy9wYXNzZXMvYmFzaWMuanMiLCIuLi9zcmMvY29yZS9jb21wb3Nlci5qcyIsIi4uL3NyYy9jb3JlL3BlcmZvcm1hbmNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IExJR0hUID0ge1xuICAgIGZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgLy8gZmFjdG9yeSBsaWdodFxuICAgICAgICB2ZWMzIGludmVyc2VMaWdodERpcmVjdGlvbiA9IG5vcm1hbGl6ZSh2ZWMzKC0wLjI1LCAtMC4yNSwgMS4wKSk7XG4gICAgICAgIHZlYzMgZGlyZWN0aW9uYWxDb2xvciA9IHZlYzMobWF4KGRvdCh2X25vcm1hbCwgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uKSwgMC4wKSk7XG4gICAgICAgIHZlYzMgZmFjdG9yeSA9IG1peCh2ZWMzKDAuMCksIGRpcmVjdGlvbmFsQ29sb3IsIDAuOTg5KTsgLy8gbGlnaHQgaW50ZW5zaXR5XG4gICAgICAgIGJhc2UucmdiICo9IGZhY3Rvcnk7XG5cbiAgICAgICAgJHtMSUdIVC5kaXJlY3Rpb25hbCgpfWA7XG4gICAgfSxcblxuICAgIGRpcmVjdGlvbmFsOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAvLyB2ZWMzIGRjb2xvciA9IHZlYzMoMC4wMSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gZm9yIChpbnQgaSA9IDA7IGkgPCBNQVhfRElSRUNUSU9OQUw7IGkrKykge1xuICAgICAgICAgICAgLy8gICAgIHZlYzMgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uID0gbm9ybWFsaXplKGRpcmVjdGlvbmFsTGlnaHRzW2ldLmRsUG9zaXRpb24ueHl6KTtcbiAgICAgICAgICAgIC8vICAgICB2ZWMzIGxpZ2h0ID0gdmVjMyhtYXgoZG90KHZfbm9ybWFsLCBpbnZlcnNlTGlnaHREaXJlY3Rpb24pLCAwLjApKTtcbiAgICAgICAgICAgIC8vICAgICB2ZWMzIGRpcmVjdGlvbmFsQ29sb3IgPSBkaXJlY3Rpb25hbExpZ2h0c1tpXS5kbENvbG9yLnJnYiAqIGxpZ2h0O1xuICAgICAgICAgICAgLy8gICAgIGRjb2xvciArPSBtaXgoZGNvbG9yLCBkaXJlY3Rpb25hbENvbG9yLCBkaXJlY3Rpb25hbExpZ2h0c1tpXS5mbEludGVuc2l0eSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBkY29sb3IgLz0gZmxvYXQoTUFYX0RJUkVDVElPTkFMKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBiYXNlLnJnYiAqPSBkY29sb3I7XG4gICAgICAgIGA7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7XG4gICAgTElHSFQsXG59O1xuIiwiZnVuY3Rpb24gYmFzZSgpIHtcbiAgICByZXR1cm4gYFxuICAgIGZsb2F0IGZvZ1N0YXJ0ID0gZm9nU2V0dGluZ3MueTtcbiAgICBmbG9hdCBmb2dFbmQgPSBmb2dTZXR0aW5ncy56O1xuICAgIGZsb2F0IGZvZ0RlbnNpdHkgPSBmb2dTZXR0aW5ncy5hO1xuXG4gICAgZmxvYXQgZGlzdCA9IDAuMDtcbiAgICBmbG9hdCBmb2dGYWN0b3IgPSAwLjA7XG4gICAgZGlzdCA9IGdsX0ZyYWdDb29yZC56IC8gZ2xfRnJhZ0Nvb3JkLnc7YDtcbn1cblxuY29uc3QgRk9HID0ge1xuICAgIGxpbmVhcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAoZm9nRW5kIC0gZGlzdCkgLyAoZm9nRW5kIC0gZm9nU3RhcnQpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxuICAgIGV4cG9uZW50aWFsOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIGlmIChmb2dTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICAke2Jhc2UoKX1cbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IDEuMCAvIGV4cChkaXN0ICogZm9nRGVuc2l0eSk7XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSBjbGFtcChmb2dGYWN0b3IsIDAuMCwgMS4wKTtcbiAgICAgICAgICAgIGJhc2UgPSBtaXgoZm9nQ29sb3IsIGJhc2UsIGZvZ0ZhY3Rvcik7XG4gICAgICAgIH1gO1xuICAgIH0sXG4gICAgZXhwb25lbnRpYWwyOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIGlmIChmb2dTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICAke2Jhc2UoKX1cbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IDEuMCAvIGV4cCgoZGlzdCAqIGZvZ0RlbnNpdHkpICogKGRpc3QgKiBmb2dEZW5zaXR5KSk7XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSBjbGFtcChmb2dGYWN0b3IsIDAuMCwgMS4wKTtcbiAgICAgICAgICAgIGJhc2UgPSBtaXgoZm9nQ29sb3IsIGJhc2UsIGZvZ0ZhY3Rvcik7XG4gICAgICAgIH1gO1xuICAgIH0sXG59O1xuXG5leHBvcnQge1xuICAgIEZPRyxcbn07XG4iLCIvKipcbiAqIE1heCBkaXJlY3Rpb25hbCBsaWdodCBhbGxvd2VkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBNQVhfRElSRUNUSU9OQUxcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBNQVhfRElSRUNUSU9OQUwgPSAxO1xuXG4vKipcbiAqIGRpcmVjdGlvbmFsIGxpZ2h0IGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBESVJFQ1RJT05BTF9MSUdIVFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IERJUkVDVElPTkFMX0xJR0hUID0gMTAwMDtcblxuLyoqXG4gKiBiYXNpYyBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9CQVNJQ1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9CQVNJQyA9IDIwMDA7XG5cbi8qKlxuICogZGVmYXVsdCBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9ERUZBVUxUXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0RFRkFVTFQgPSAyMDAxO1xuXG4vKipcbiAqIGJpbGxib2FyZCBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9CSUxMQk9BUkRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQklMTEJPQVJEID0gMjAwMjtcblxuLyoqXG4gKiBzaGFkb3cgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfU0hBRE9XXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX1NIQURPVyA9IDIwMDM7XG5cbi8qKlxuICogc2VtIHNoYWRlciBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0hBREVSX1NFTVxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9TRU0gPSAyMDA0O1xuXG4vKipcbiAqIGN1c3RvbSBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9DVVNUT01cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQ1VTVE9NID0gMjUwMDtcblxuLyoqXG4gKiBzaGFkZXIgZHJhdyBtb2Rlc1xuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgRFJBV1xuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBQT0lOVFNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBMSU5FU1xuICogQHByb3BlcnR5IHtudW1iZXJ9IFRSSUFOR0xFU1xuICovXG5leHBvcnQgY29uc3QgRFJBVyA9IHtcbiAgICBQT0lOVFM6IDAsXG4gICAgTElORVM6IDEsXG4gICAgVFJJQU5HTEVTOiA0LFxufTtcblxuLyoqXG4gKiB0cmlhbmdsZSBzaWRlXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSURFXG4gKiBAdHlwZSB7b2JqZWN0fVxuICogQHByb3BlcnR5IHtudW1iZXJ9IEZST05UXG4gKiBAcHJvcGVydHkge251bWJlcn0gQkFDS1xuICogQHByb3BlcnR5IHtudW1iZXJ9IEJPVEhcbiAqL1xuZXhwb3J0IGNvbnN0IFNJREUgPSB7XG4gICAgRlJPTlQ6IDAsXG4gICAgQkFDSzogMSxcbiAgICBCT1RIOiAyLFxufTtcblxuLyoqXG4gKiBjb250ZXh0IHR5cGVzXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBDT05URVhUXG4gKiBAdHlwZSB7b2JqZWN0fVxuICogQHByb3BlcnR5IHtudW1iZXJ9IFdFQkdMXG4gKiBAcHJvcGVydHkge251bWJlcn0gV0VCR0wyXG4gKi9cbmV4cG9ydCBjb25zdCBDT05URVhUID0ge1xuICAgIFdFQkdMOiAnd2ViZ2wnLFxuICAgIFdFQkdMMjogJ3dlYmdsMicsXG59O1xuIiwiaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuY29uc3QgbGlicmFyeSA9IGBsb3d3dy0ke19fTElCUkFSWV9ffWA7XG5jb25zdCB2ZXJzaW9uID0gX19WRVJTSU9OX187XG5cbi8vIHBlciBzZXNzaW9uXG5sZXQgZ2wgPSBudWxsO1xubGV0IGNvbnRleHRUeXBlID0gbnVsbDtcblxuLy8gdGVzdCBjb250ZXh0IHdlYmdsIGFuZCB3ZWJnbDJcbmNvbnN0IHRlc3RDb250ZXh0MSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoQ09OVEVYVC5XRUJHTCk7XG5jb25zdCB0ZXN0Q29udGV4dDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KENPTlRFWFQuV0VCR0wyKTtcblxuY29uc3QgZXh0ZW5zaW9ucyA9IHtcbiAgICAvLyB1c2VkIGdsb2JhbGx5XG4gICAgdmVydGV4QXJyYXlPYmplY3Q6IHRlc3RDb250ZXh0MS5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JyksXG5cbiAgICAvLyB1c2VkIGZvciBpbnN0YW5jaW5nXG4gICAgaW5zdGFuY2VkQXJyYXlzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJyksXG5cbiAgICAvLyB1c2VkIGZvciBmbGF0IHNoYWRpbmdcbiAgICBzdGFuZGFyZERlcml2YXRpdmVzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKSxcblxuICAgIC8vIGRlcHRoIHRleHR1cmVcbiAgICBkZXB0aFRleHR1cmVzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyksXG59O1xuXG5jb25zdCBzZXRDb250ZXh0VHlwZSA9IChwcmVmZXJyZWQpID0+IHtcbiAgICBjb25zdCBnbDIgPSB0ZXN0Q29udGV4dDIgJiYgQ09OVEVYVC5XRUJHTDI7XG4gICAgY29uc3QgZ2wxID0gdGVzdENvbnRleHQxICYmIENPTlRFWFQuV0VCR0w7XG4gICAgY29udGV4dFR5cGUgPSBwcmVmZXJyZWQgfHwgZ2wyIHx8IGdsMTtcblxuICAgIGlmIChjb250ZXh0VHlwZSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgZXh0ZW5zaW9ucy52ZXJ0ZXhBcnJheU9iamVjdCA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuaW5zdGFuY2VkQXJyYXlzID0gdHJ1ZTtcbiAgICAgICAgZXh0ZW5zaW9ucy5zdGFuZGFyZERlcml2YXRpdmVzID0gdHJ1ZTtcbiAgICAgICAgZXh0ZW5zaW9ucy5kZXB0aFRleHR1cmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZXh0VHlwZTtcbn07XG5cbmNvbnN0IGdldENvbnRleHRUeXBlID0gKCkgPT4gY29udGV4dFR5cGU7XG5cbmNvbnN0IHNldENvbnRleHQgPSAoY29udGV4dCkgPT4ge1xuICAgIGdsID0gY29udGV4dDtcbiAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTCkge1xuICAgICAgICBleHRlbnNpb25zLnZlcnRleEFycmF5T2JqZWN0ID0gZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpO1xuICAgICAgICBleHRlbnNpb25zLmluc3RhbmNlZEFycmF5cyA9IGdsLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgICAgICBleHRlbnNpb25zLnN0YW5kYXJkRGVyaXZhdGl2ZXMgPSBnbC5nZXRFeHRlbnNpb24oJ09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycpO1xuICAgICAgICBleHRlbnNpb25zLmRlcHRoVGV4dHVyZXMgPSBnbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlcHRoX3RleHR1cmUnKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRDb250ZXh0ID0gKCkgPT4gZ2w7XG5cbmNvbnN0IHN1cHBvcnRzID0gKCkgPT4gZXh0ZW5zaW9ucztcblxuZXhwb3J0IHtcbiAgICBsaWJyYXJ5LFxuICAgIHZlcnNpb24sXG4gICAgc2V0Q29udGV4dCxcbiAgICBnZXRDb250ZXh0LFxuICAgIHNldENvbnRleHRUeXBlLFxuICAgIGdldENvbnRleHRUeXBlLFxuICAgIHN1cHBvcnRzLFxufTtcbiIsImltcG9ydCB7IENPTlRFWFQsIE1BWF9ESVJFQ1RJT05BTCB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uLy4uL3Nlc3Npb24nO1xuXG5jb25zdCBVQk8gPSB7XG4gICAgc2NlbmU6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgdW5pZm9ybSBwZXJTY2VuZSB7XG4gICAgICAgICAgICAgICAgbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuICAgICAgICAgICAgICAgIG1hdDQgdmlld01hdHJpeDtcbiAgICAgICAgICAgICAgICB2ZWM0IGZvZ1NldHRpbmdzO1xuICAgICAgICAgICAgICAgIHZlYzQgZm9nQ29sb3I7XG4gICAgICAgICAgICAgICAgZmxvYXQgaUdsb2JhbFRpbWU7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwUGxhbmUwO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMTtcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBQbGFuZTI7XG4gICAgICAgICAgICB9O2A7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHZpZXdNYXRyaXg7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBmb2dTZXR0aW5ncztcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGZvZ0NvbG9yO1xuICAgICAgICB1bmlmb3JtIGZsb2F0IGlHbG9iYWxUaW1lO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFNldHRpbmdzO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMDtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBQbGFuZTE7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwUGxhbmUyO2A7XG4gICAgfSxcblxuICAgIG1vZGVsOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gcGVyTW9kZWwge1xuICAgICAgICAgICAgICAgIG1hdDQgbW9kZWxNYXRyaXg7XG4gICAgICAgICAgICAgICAgbWF0NCBub3JtYWxNYXRyaXg7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBTZXR0aW5ncztcbiAgICAgICAgICAgICAgICB2ZWM0IGxvY2FsQ2xpcFBsYW5lMDtcbiAgICAgICAgICAgICAgICB2ZWM0IGxvY2FsQ2xpcFBsYW5lMTtcbiAgICAgICAgICAgICAgICB2ZWM0IGxvY2FsQ2xpcFBsYW5lMjtcbiAgICAgICAgICAgIH07YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IG1vZGVsTWF0cml4O1xuICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IG5vcm1hbE1hdHJpeDtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBTZXR0aW5ncztcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBQbGFuZTA7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwUGxhbmUxO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFBsYW5lMjtgO1xuICAgIH0sXG5cbiAgICBsaWdodHM6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICNkZWZpbmUgTUFYX0RJUkVDVElPTkFMICR7TUFYX0RJUkVDVElPTkFMfVxuXG4gICAgICAgICAgICAgICAgc3RydWN0IERpcmVjdGlvbmFsIHtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBkbFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IGRsQ29sb3I7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGZsSW50ZW5zaXR5O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB1bmlmb3JtIGRpcmVjdGlvbmFsIHtcbiAgICAgICAgICAgICAgICAgICAgRGlyZWN0aW9uYWwgZGlyZWN0aW9uYWxMaWdodHNbTUFYX0RJUkVDVElPTkFMXTtcbiAgICAgICAgICAgICAgICB9O2A7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgI2RlZmluZSBNQVhfRElSRUNUSU9OQUwgJHtNQVhfRElSRUNUSU9OQUx9XG5cbiAgICAgICAgICAgIHN0cnVjdCBEaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgdmVjNCBkbFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHZlYzQgZGxDb2xvcjtcbiAgICAgICAgICAgICAgICBmbG9hdCBmbEludGVuc2l0eTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHVuaWZvcm0gRGlyZWN0aW9uYWwgZGlyZWN0aW9uYWxMaWdodHNbTUFYX0RJUkVDVElPTkFMXTtgO1xuICAgIH0sXG59O1xuXG5leHBvcnQge1xuICAgIFVCTyxcbn07XG4iLCJjb25zdCBOT0lTRSA9ICgpID0+IHtcbiAgICByZXR1cm4gYFxuICAgIHZlYzMgbW9kMjg5KHZlYzMgeCl7cmV0dXJuIHgtZmxvb3IoeCooMS4vMjg5LikpKjI4OS47fXZlYzQgbW9kMjg5KHZlYzQgeCl7cmV0dXJuIHgtZmxvb3IoeCooMS4vMjg5LikpKjI4OS47fXZlYzQgcGVybXV0ZSh2ZWM0IHgpe3JldHVybiBtb2QyODkoKHgqMzQuKzEuKSp4KTt9dmVjNCB0YXlsb3JJbnZTcXJ0KHZlYzQgcil7cmV0dXJuIDEuNzkyODQtLjg1MzczNSpyO312ZWMzIGZhZGUodmVjMyB0KXtyZXR1cm4gdCp0KnQqKHQqKHQqNi4tMTUuKSsxMC4pO31mbG9hdCBjbm9pc2UodmVjMyBQKXt2ZWMzIFBpMD1mbG9vcihQKSxQaTE9UGkwK3ZlYzMoMS4pO1BpMD1tb2QyODkoUGkwKTtQaTE9bW9kMjg5KFBpMSk7dmVjMyBQZjA9ZnJhY3QoUCksUGYxPVBmMC12ZWMzKDEuKTt2ZWM0IGl4PXZlYzQoUGkwLnIsUGkxLnIsUGkwLnIsUGkxLnIpLGl5PXZlYzQoUGkwLmdnLFBpMS5nZyksaXowPVBpMC5iYmJiLGl6MT1QaTEuYmJiYixpeHk9cGVybXV0ZShwZXJtdXRlKGl4KStpeSksaXh5MD1wZXJtdXRlKGl4eStpejApLGl4eTE9cGVybXV0ZShpeHkraXoxKSxneDA9aXh5MCooMS4vNy4pLGd5MD1mcmFjdChmbG9vcihneDApKigxLi83LikpLS41O2d4MD1mcmFjdChneDApO3ZlYzQgZ3owPXZlYzQoLjUpLWFicyhneDApLWFicyhneTApLHN6MD1zdGVwKGd6MCx2ZWM0KDAuKSk7Z3gwLT1zejAqKHN0ZXAoMC4sZ3gwKS0uNSk7Z3kwLT1zejAqKHN0ZXAoMC4sZ3kwKS0uNSk7dmVjNCBneDE9aXh5MSooMS4vNy4pLGd5MT1mcmFjdChmbG9vcihneDEpKigxLi83LikpLS41O2d4MT1mcmFjdChneDEpO3ZlYzQgZ3oxPXZlYzQoLjUpLWFicyhneDEpLWFicyhneTEpLHN6MT1zdGVwKGd6MSx2ZWM0KDAuKSk7Z3gxLT1zejEqKHN0ZXAoMC4sZ3gxKS0uNSk7Z3kxLT1zejEqKHN0ZXAoMC4sZ3kxKS0uNSk7dmVjMyBnMDAwPXZlYzMoZ3gwLnIsZ3kwLnIsZ3owLnIpLGcxMDA9dmVjMyhneDAuZyxneTAuZyxnejAuZyksZzAxMD12ZWMzKGd4MC5iLGd5MC5iLGd6MC5iKSxnMTEwPXZlYzMoZ3gwLmEsZ3kwLmEsZ3owLmEpLGcwMDE9dmVjMyhneDEucixneTEucixnejEuciksZzEwMT12ZWMzKGd4MS5nLGd5MS5nLGd6MS5nKSxnMDExPXZlYzMoZ3gxLmIsZ3kxLmIsZ3oxLmIpLGcxMTE9dmVjMyhneDEuYSxneTEuYSxnejEuYSk7dmVjNCBub3JtMD10YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDAsZzAwMCksZG90KGcwMTAsZzAxMCksZG90KGcxMDAsZzEwMCksZG90KGcxMTAsZzExMCkpKTtnMDAwKj1ub3JtMC5yO2cwMTAqPW5vcm0wLmc7ZzEwMCo9bm9ybTAuYjtnMTEwKj1ub3JtMC5hO3ZlYzQgbm9ybTE9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAxLGcwMDEpLGRvdChnMDExLGcwMTEpLGRvdChnMTAxLGcxMDEpLGRvdChnMTExLGcxMTEpKSk7ZzAwMSo9bm9ybTEucjtnMDExKj1ub3JtMS5nO2cxMDEqPW5vcm0xLmI7ZzExMSo9bm9ybTEuYTtmbG9hdCBuMDAwPWRvdChnMDAwLFBmMCksbjEwMD1kb3QoZzEwMCx2ZWMzKFBmMS5yLFBmMC5nYikpLG4wMTA9ZG90KGcwMTAsdmVjMyhQZjAucixQZjEuZyxQZjAuYikpLG4xMTA9ZG90KGcxMTAsdmVjMyhQZjEucmcsUGYwLmIpKSxuMDAxPWRvdChnMDAxLHZlYzMoUGYwLnJnLFBmMS5iKSksbjEwMT1kb3QoZzEwMSx2ZWMzKFBmMS5yLFBmMC5nLFBmMS5iKSksbjAxMT1kb3QoZzAxMSx2ZWMzKFBmMC5yLFBmMS5nYikpLG4xMTE9ZG90KGcxMTEsUGYxKTt2ZWMzIGZhZGVfeHl6PWZhZGUoUGYwKTt2ZWM0IG5fej1taXgodmVjNChuMDAwLG4xMDAsbjAxMCxuMTEwKSx2ZWM0KG4wMDEsbjEwMSxuMDExLG4xMTEpLGZhZGVfeHl6LmIpO3ZlYzIgbl95ej1taXgobl96LnJnLG5fei5iYSxmYWRlX3h5ei5nKTtmbG9hdCBuX3h5ej1taXgobl95ei5yLG5feXouZyxmYWRlX3h5ei5yKTtyZXR1cm4gMi4yKm5feHl6O31mbG9hdCBwbm9pc2UodmVjMyBQLHZlYzMgcmVwKXt2ZWMzIFBpMD1tb2QoZmxvb3IoUCkscmVwKSxQaTE9bW9kKFBpMCt2ZWMzKDEuKSxyZXApO1BpMD1tb2QyODkoUGkwKTtQaTE9bW9kMjg5KFBpMSk7dmVjMyBQZjA9ZnJhY3QoUCksUGYxPVBmMC12ZWMzKDEuKTt2ZWM0IGl4PXZlYzQoUGkwLnIsUGkxLnIsUGkwLnIsUGkxLnIpLGl5PXZlYzQoUGkwLmdnLFBpMS5nZyksaXowPVBpMC5iYmJiLGl6MT1QaTEuYmJiYixpeHk9cGVybXV0ZShwZXJtdXRlKGl4KStpeSksaXh5MD1wZXJtdXRlKGl4eStpejApLGl4eTE9cGVybXV0ZShpeHkraXoxKSxneDA9aXh5MCooMS4vNy4pLGd5MD1mcmFjdChmbG9vcihneDApKigxLi83LikpLS41O2d4MD1mcmFjdChneDApO3ZlYzQgZ3owPXZlYzQoLjUpLWFicyhneDApLWFicyhneTApLHN6MD1zdGVwKGd6MCx2ZWM0KDAuKSk7Z3gwLT1zejAqKHN0ZXAoMC4sZ3gwKS0uNSk7Z3kwLT1zejAqKHN0ZXAoMC4sZ3kwKS0uNSk7dmVjNCBneDE9aXh5MSooMS4vNy4pLGd5MT1mcmFjdChmbG9vcihneDEpKigxLi83LikpLS41O2d4MT1mcmFjdChneDEpO3ZlYzQgZ3oxPXZlYzQoLjUpLWFicyhneDEpLWFicyhneTEpLHN6MT1zdGVwKGd6MSx2ZWM0KDAuKSk7Z3gxLT1zejEqKHN0ZXAoMC4sZ3gxKS0uNSk7Z3kxLT1zejEqKHN0ZXAoMC4sZ3kxKS0uNSk7dmVjMyBnMDAwPXZlYzMoZ3gwLnIsZ3kwLnIsZ3owLnIpLGcxMDA9dmVjMyhneDAuZyxneTAuZyxnejAuZyksZzAxMD12ZWMzKGd4MC5iLGd5MC5iLGd6MC5iKSxnMTEwPXZlYzMoZ3gwLmEsZ3kwLmEsZ3owLmEpLGcwMDE9dmVjMyhneDEucixneTEucixnejEuciksZzEwMT12ZWMzKGd4MS5nLGd5MS5nLGd6MS5nKSxnMDExPXZlYzMoZ3gxLmIsZ3kxLmIsZ3oxLmIpLGcxMTE9dmVjMyhneDEuYSxneTEuYSxnejEuYSk7dmVjNCBub3JtMD10YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDAsZzAwMCksZG90KGcwMTAsZzAxMCksZG90KGcxMDAsZzEwMCksZG90KGcxMTAsZzExMCkpKTtnMDAwKj1ub3JtMC5yO2cwMTAqPW5vcm0wLmc7ZzEwMCo9bm9ybTAuYjtnMTEwKj1ub3JtMC5hO3ZlYzQgbm9ybTE9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAxLGcwMDEpLGRvdChnMDExLGcwMTEpLGRvdChnMTAxLGcxMDEpLGRvdChnMTExLGcxMTEpKSk7ZzAwMSo9bm9ybTEucjtnMDExKj1ub3JtMS5nO2cxMDEqPW5vcm0xLmI7ZzExMSo9bm9ybTEuYTtmbG9hdCBuMDAwPWRvdChnMDAwLFBmMCksbjEwMD1kb3QoZzEwMCx2ZWMzKFBmMS5yLFBmMC5nYikpLG4wMTA9ZG90KGcwMTAsdmVjMyhQZjAucixQZjEuZyxQZjAuYikpLG4xMTA9ZG90KGcxMTAsdmVjMyhQZjEucmcsUGYwLmIpKSxuMDAxPWRvdChnMDAxLHZlYzMoUGYwLnJnLFBmMS5iKSksbjEwMT1kb3QoZzEwMSx2ZWMzKFBmMS5yLFBmMC5nLFBmMS5iKSksbjAxMT1kb3QoZzAxMSx2ZWMzKFBmMC5yLFBmMS5nYikpLG4xMTE9ZG90KGcxMTEsUGYxKTt2ZWMzIGZhZGVfeHl6PWZhZGUoUGYwKTt2ZWM0IG5fej1taXgodmVjNChuMDAwLG4xMDAsbjAxMCxuMTEwKSx2ZWM0KG4wMDEsbjEwMSxuMDExLG4xMTEpLGZhZGVfeHl6LmIpO3ZlYzIgbl95ej1taXgobl96LnJnLG5fei5iYSxmYWRlX3h5ei5nKTtmbG9hdCBuX3h5ej1taXgobl95ei5yLG5feXouZyxmYWRlX3h5ei5yKTtyZXR1cm4gMi4yKm5feHl6O31cbmA7XG59O1xuXG5leHBvcnQge1xuICAgIE5PSVNFLFxufTtcbiIsImNvbnN0IENMSVBQSU5HID0ge1xuXG4gICAgdmVydGV4X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBvdXQgdmVjNCBsb2NhbF9leWVzcGFjZTtcbiAgICAgICAgb3V0IHZlYzQgZ2xvYmFsX2V5ZXNwYWNlO2A7XG4gICAgfSxcblxuICAgIHZlcnRleDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBsb2NhbF9leWVzcGFjZSA9IG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICBnbG9iYWxfZXllc3BhY2UgPSB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7YDtcbiAgICB9LFxuXG4gICAgZnJhZ21lbnRfcHJlOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIGluIHZlYzQgbG9jYWxfZXllc3BhY2U7XG4gICAgICAgIGluIHZlYzQgZ2xvYmFsX2V5ZXNwYWNlO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIGlmIChsb2NhbENsaXBTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICBpZihkb3QobG9jYWxfZXllc3BhY2UsIGxvY2FsQ2xpcFBsYW5lMCkgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgICAgICBpZihkb3QobG9jYWxfZXllc3BhY2UsIGxvY2FsQ2xpcFBsYW5lMSkgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgICAgICBpZihkb3QobG9jYWxfZXllc3BhY2UsIGxvY2FsQ2xpcFBsYW5lMikgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ2xvYmFsQ2xpcFNldHRpbmdzLnggPiAwLjApIHtcbiAgICAgICAgICAgIGlmKGRvdChnbG9iYWxfZXllc3BhY2UsIGdsb2JhbENsaXBQbGFuZTApIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGdsb2JhbF9leWVzcGFjZSwgZ2xvYmFsQ2xpcFBsYW5lMSkgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgICAgICBpZihkb3QoZ2xvYmFsX2V5ZXNwYWNlLCBnbG9iYWxDbGlwUGxhbmUyKSA8IDAuMCkgZGlzY2FyZDtcbiAgICAgICAgfWA7XG4gICAgfSxcblxufTtcblxuZXhwb3J0IHtcbiAgICBDTElQUElORyxcbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uLy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IEVYVEVOU0lPTlMgPSB7XG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAjZXh0ZW5zaW9uIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcyA6IGVuYWJsZWA7XG4gICAgfSxcblxufTtcblxuZXhwb3J0IHtcbiAgICBFWFRFTlNJT05TLFxufTtcbiIsImZ1bmN0aW9uIGhhcmQoKSB7XG4gICAgcmV0dXJuIGBcbiAgICBmbG9hdCBoYXJkU2hhZG93MShzYW1wbGVyMkQgc2hhZG93TWFwKSB7XG4gICAgICAgIHZlYzQgc2hhZG93Q29vcmQgPSB2U2hhZG93Q29vcmQgLyB2U2hhZG93Q29vcmQudztcbiAgICAgICAgdmVjMiB1diA9IHNoYWRvd0Nvb3JkLnh5O1xuICAgICAgICBmbG9hdCBzaGFkb3cgPSB0ZXh0dXJlKHNoYWRvd01hcCwgdXYpLnI7XG5cbiAgICAgICAgZmxvYXQgdmlzaWJpbGl0eSA9IDEuMDtcbiAgICAgICAgZmxvYXQgc2hhZG93QW1vdW50ID0gMC41O1xuXG4gICAgICAgIGZsb2F0IGNvc1RoZXRhID0gY2xhbXAoZG90KHZfbm9ybWFsLCB2U2hhZG93Q29vcmQueHl6KSwgMC4wLCAxLjApO1xuICAgICAgICBmbG9hdCBiaWFzID0gMC4wMDAwNSAqIHRhbihhY29zKGNvc1RoZXRhKSk7IC8vIGNvc1RoZXRhIGlzIGRvdCggbixsICksIGNsYW1wZWQgYmV0d2VlbiAwIGFuZCAxXG4gICAgICAgIGJpYXMgPSBjbGFtcChiaWFzLCAwLjAsIDAuMDAxKTtcblxuICAgICAgICBpZiAoc2hhZG93IDwgc2hhZG93Q29vcmQueiAtIGJpYXMpe1xuICAgICAgICAgICAgdmlzaWJpbGl0eSA9IHNoYWRvd0Ftb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmlzaWJpbGl0eTtcbiAgICB9XG5cbiAgICBmbG9hdCBoYXJkU2hhZG93MihzYW1wbGVyMkQgc2hhZG93TWFwKSB7XG4gICAgICAgIHZlYzQgc2hhZG93Q29vcmQgPSB2U2hhZG93Q29vcmQgLyB2U2hhZG93Q29vcmQudztcbiAgICAgICAgdmVjMiB1diA9IHNoYWRvd0Nvb3JkLnh5O1xuXG4gICAgICAgIGZsb2F0IGxpZ2h0RGVwdGgxID0gdGV4dHVyZShzaGFkb3dNYXAsIHV2KS5yO1xuICAgICAgICBmbG9hdCBsaWdodERlcHRoMiA9IGNsYW1wKHNoYWRvd0Nvb3JkLnosIDAuMCwgMS4wKTtcbiAgICAgICAgZmxvYXQgYmlhcyA9IDAuMDAwMTtcblxuICAgICAgICByZXR1cm4gc3RlcChsaWdodERlcHRoMiwgbGlnaHREZXB0aDErYmlhcyk7XG4gICAgfVxuXG4gICAgZmxvYXQgaGFyZFNoYWRvdzMoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcblxuICAgICAgICBmbG9hdCB2aXNpYmlsaXR5ID0gMS4wO1xuICAgICAgICBmbG9hdCBzaGFkb3dBbW91bnQgPSAwLjU7XG4gICAgICAgIGZsb2F0IGJpYXMgPSAwLjAwMDA1O1xuXG4gICAgICAgIHZlYzIgcG9pc3NvbkRpc2tbMTZdO1xuICAgICAgICBwb2lzc29uRGlza1swXSA9IHZlYzIoLTAuOTQyMDE2MjQsIC0wLjM5OTA2MjE2KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMV0gPSB2ZWMyKDAuOTQ1NTg2MDksIC0wLjc2ODkwNzI1KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMl0gPSB2ZWMyKC0wLjA5NDE4NDEwMSwgLTAuOTI5Mzg4NzApO1xuICAgICAgICBwb2lzc29uRGlza1szXSA9IHZlYzIoMC4zNDQ5NTkzOCwgMC4yOTM4Nzc2MCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzRdID0gdmVjMigtMC45MTU4ODU4MSwgMC40NTc3MTQzMik7XG4gICAgICAgIHBvaXNzb25EaXNrWzVdID0gdmVjMigtMC44MTU0NDIzMiwgLTAuODc5MTI0NjQpO1xuICAgICAgICBwb2lzc29uRGlza1s2XSA9IHZlYzIoLTAuMzgyNzc1NDMsIDAuMjc2NzY4NDUpO1xuICAgICAgICBwb2lzc29uRGlza1s3XSA9IHZlYzIoMC45NzQ4NDM5OCwgMC43NTY0ODM3OSk7XG4gICAgICAgIHBvaXNzb25EaXNrWzhdID0gdmVjMigwLjQ0MzIzMzI1LCAtMC45NzUxMTU1NCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzldID0gdmVjMigwLjUzNzQyOTgxLCAtMC40NzM3MzQyMCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzEwXSA9IHZlYzIoLTAuMjY0OTY5MTEsIC0wLjQxODkzMDIzKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTFdID0gdmVjMigwLjc5MTk3NTE0LCAwLjE5MDkwMTg4KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTJdID0gdmVjMigtMC4yNDE4ODg0MCwgMC45OTcwNjUwNyk7XG4gICAgICAgIHBvaXNzb25EaXNrWzEzXSA9IHZlYzIoLTAuODE0MDk5NTUsIDAuOTE0Mzc1OTApO1xuICAgICAgICBwb2lzc29uRGlza1sxNF0gPSB2ZWMyKDAuMTk5ODQxMjYsIDAuNzg2NDEzNjcpO1xuICAgICAgICBwb2lzc29uRGlza1sxNV0gPSB2ZWMyKDAuMTQzODMxNjEsIC0wLjE0MTAwNzkwKTtcblxuICAgICAgICBmb3IgKGludCBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgICAgIGlmICggdGV4dHVyZShzaGFkb3dNYXAsIHV2ICsgcG9pc3NvbkRpc2tbaV0vNzAwLjApLnIgPCBzaGFkb3dDb29yZC56LWJpYXMgKXtcbiAgICAgICAgICAgICAgICB2aXNpYmlsaXR5IC09IDAuMDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmlzaWJpbGl0eTtcbiAgICB9XG5cbiAgICBgO1xufVxuXG5jb25zdCBTSEFET1cgPSB7XG4gICAgdmVydGV4X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICB1bmlmb3JtIG1hdDQgc2hhZG93TWF0cml4O1xuICAgICAgICBvdXQgdmVjNCB2U2hhZG93Q29vcmQ7YDtcbiAgICB9LFxuXG4gICAgdmVydGV4OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIHZTaGFkb3dDb29yZCA9IHNoYWRvd01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCBzaGFkb3dNYXA7XG4gICAgICAgIGluIHZlYzQgdlNoYWRvd0Nvb3JkO1xuXG4gICAgICAgICR7aGFyZCgpfWA7XG4gICAgfSxcblxuICAgIGZyYWdtZW50OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIC8vIHNoYWRvd3NcbiAgICAgICAgZmxvYXQgc2hhZG93ID0gMS4wO1xuXG4gICAgICAgIC8vIE9QVElPTiAxXG4gICAgICAgIHNoYWRvdyA9IGhhcmRTaGFkb3cxKHNoYWRvd01hcCk7XG5cbiAgICAgICAgYmFzZSAqPSBzaGFkb3c7XG4gICAgICAgIGA7XG4gICAgfSxcblxufTtcblxuZXhwb3J0IHtcbiAgICBTSEFET1csXG59O1xuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbi8qKlxyXG4gKiBDb21tb24gdXRpbGl0aWVzXHJcbiAqIEBtb2R1bGUgZ2xNYXRyaXhcclxuICovXHJcblxyXG4vLyBDb25maWd1cmF0aW9uIENvbnN0YW50c1xyXG5leHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xyXG5leHBvcnQgbGV0IEFSUkFZX1RZUEUgPSAodHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpID8gRmxvYXQzMkFycmF5IDogQXJyYXk7XHJcbmV4cG9ydCBjb25zdCBSQU5ET00gPSBNYXRoLnJhbmRvbTtcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHRoZSB0eXBlIG9mIGFycmF5IHVzZWQgd2hlbiBjcmVhdGluZyBuZXcgdmVjdG9ycyBhbmQgbWF0cmljZXNcclxuICpcclxuICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcclxuICBBUlJBWV9UWVBFID0gdHlwZTtcclxufVxyXG5cclxuY29uc3QgZGVncmVlID0gTWF0aC5QSSAvIDE4MDtcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IERlZ3JlZSBUbyBSYWRpYW5cclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGEpIHtcclxuICByZXR1cm4gYSAqIGRlZ3JlZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudHMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHZhbHVlLCB3aXRoaW4gYW4gYWJzb2x1dGVcclxuICogb3IgcmVsYXRpdmUgdG9sZXJhbmNlIG9mIGdsTWF0cml4LkVQU0lMT04gKGFuIGFic29sdXRlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciB2YWx1ZXMgbGVzc1xyXG4gKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIFRoZSBmaXJzdCBudW1iZXIgdG8gdGVzdC5cclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG51bWJlcnMgYXJlIGFwcHJveGltYXRlbHkgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBNYXRoLmFicyhhIC0gYikgPD0gRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSk7XHJcbn1cclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiXHJcblxyXG4vKipcclxuICogMngyIE1hdHJpeFxyXG4gKiBAbW9kdWxlIG1hdDJcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBhIG1hdHJpeCB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDIgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgbWF0MiB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAzKVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0IEEgbmV3IDJ4MiBtYXRyaXhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMTAsIG0xMSkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSBtMDA7XHJcbiAgb3V0WzFdID0gbTAxO1xyXG4gIG91dFsyXSA9IG0xMDtcclxuICBvdXRbM10gPSBtMTE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDIgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTEwLCBtMTEpIHtcclxuICBvdXRbMF0gPSBtMDA7XHJcbiAgb3V0WzFdID0gbTAxO1xyXG4gIG91dFsyXSA9IG0xMDtcclxuICBvdXRbM10gPSBtMTE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0MlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcclxuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlXHJcbiAgLy8gc29tZSB2YWx1ZXNcclxuICBpZiAob3V0ID09PSBhKSB7XHJcbiAgICBsZXQgYTEgPSBhWzFdO1xyXG4gICAgb3V0WzFdID0gYVsyXTtcclxuICAgIG91dFsyXSA9IGExO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXRbMF0gPSBhWzBdO1xyXG4gICAgb3V0WzFdID0gYVsyXTtcclxuICAgIG91dFsyXSA9IGFbMV07XHJcbiAgICBvdXRbM10gPSBhWzNdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEludmVydHMgYSBtYXQyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XHJcblxyXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuICBsZXQgZGV0ID0gYTAgKiBhMyAtIGEyICogYTE7XHJcblxyXG4gIGlmICghZGV0KSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgZGV0ID0gMS4wIC8gZGV0O1xyXG5cclxuICBvdXRbMF0gPSAgYTMgKiBkZXQ7XHJcbiAgb3V0WzFdID0gLWExICogZGV0O1xyXG4gIG91dFsyXSA9IC1hMiAqIGRldDtcclxuICBvdXRbM10gPSAgYTAgKiBkZXQ7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDJcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xyXG4gIC8vIENhY2hpbmcgdGhpcyB2YWx1ZSBpcyBuZXNzZWNhcnkgaWYgb3V0ID09IGFcclxuICBsZXQgYTAgPSBhWzBdO1xyXG4gIG91dFswXSA9ICBhWzNdO1xyXG4gIG91dFsxXSA9IC1hWzFdO1xyXG4gIG91dFsyXSA9IC1hWzJdO1xyXG4gIG91dFszXSA9ICBhMDtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcclxuICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzJdICogYVsxXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xyXG4gIG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxO1xyXG4gIG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxO1xyXG4gIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xyXG4gIG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgb3V0WzBdID0gYTAgKiAgYyArIGEyICogcztcclxuICBvdXRbMV0gPSBhMSAqICBjICsgYTMgKiBzO1xyXG4gIG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGM7XHJcbiAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQyIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XHJcbiAgbGV0IHYwID0gdlswXSwgdjEgPSB2WzFdO1xyXG4gIG91dFswXSA9IGEwICogdjA7XHJcbiAgb3V0WzFdID0gYTEgKiB2MDtcclxuICBvdXRbMl0gPSBhMiAqIHYxO1xyXG4gIG91dFszXSA9IGEzICogdjE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0Mi5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDIucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgb3V0WzBdID0gYztcclxuICBvdXRbMV0gPSBzO1xyXG4gIG91dFsyXSA9IC1zO1xyXG4gIG91dFszXSA9IGM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0Mi5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDIuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgbWF0MiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xyXG4gIG91dFswXSA9IHZbMF07XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IHZbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcclxuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpKSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgTCwgRCBhbmQgVSBtYXRyaWNlcyAoTG93ZXIgdHJpYW5ndWxhciwgRGlhZ29uYWwgYW5kIFVwcGVyIHRyaWFuZ3VsYXIpIGJ5IGZhY3Rvcml6aW5nIHRoZSBpbnB1dCBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBMIHRoZSBsb3dlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IEQgdGhlIGRpYWdvbmFsIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IFUgdGhlIHVwcGVyIHRyaWFuZ3VsYXIgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgaW5wdXQgbWF0cml4IHRvIGZhY3Rvcml6ZVxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBMRFUoTCwgRCwgVSwgYSkge1xyXG4gIExbMl0gPSBhWzJdL2FbMF07XHJcbiAgVVswXSA9IGFbMF07XHJcbiAgVVsxXSA9IGFbMV07XHJcbiAgVVszXSA9IGFbM10gLSBMWzJdICogVVsxXTtcclxuICByZXR1cm4gW0wsIEQsIFVdO1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0MidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSArIGJbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xyXG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICBvdXRbMl0gPSBhWzJdICogYjtcclxuICBvdXRbM10gPSBhWzNdICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0MidzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xyXG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcclxuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XHJcbiAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcclxuXHJcbi8qKlxyXG4gKiAyeDMgTWF0cml4XHJcbiAqIEBtb2R1bGUgbWF0MmRcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XHJcbiAqIDxwcmU+XHJcbiAqIFthLCBjLCB0eCxcclxuICogIGIsIGQsIHR5XVxyXG4gKiA8L3ByZT5cclxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxyXG4gKiA8cHJlPlxyXG4gKiBbYSwgYywgdHgsXHJcbiAqICBiLCBkLCB0eSxcclxuICogIDAsIDAsIDFdXHJcbiAqIDwvcHJlPlxyXG4gKiBUaGUgbGFzdCByb3cgaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJkXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNik7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMTtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gY2xvbmVcclxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg2KTtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDJkIHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDJkfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgb3V0WzRdID0gYVs0XTtcclxuICBvdXRbNV0gPSBhWzVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBtYXQyZCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDE7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgbWF0MmQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBDb21wb25lbnQgQiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgQ29tcG9uZW50IEMgKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdHggQ29tcG9uZW50IFRYIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdHkgQ29tcG9uZW50IFRZIChpbmRleCA1KVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IEEgbmV3IG1hdDJkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhhLCBiLCBjLCBkLCB0eCwgdHkpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNik7XHJcbiAgb3V0WzBdID0gYTtcclxuICBvdXRbMV0gPSBiO1xyXG4gIG91dFsyXSA9IGM7XHJcbiAgb3V0WzNdID0gZDtcclxuICBvdXRbNF0gPSB0eDtcclxuICBvdXRbNV0gPSB0eTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MmQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQ29tcG9uZW50IEEgKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIENvbXBvbmVudCBCIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBDb21wb25lbnQgQyAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IGQgQ29tcG9uZW50IEQgKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eCBDb21wb25lbnQgVFggKGluZGV4IDQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eSBDb21wb25lbnQgVFkgKGluZGV4IDUpXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgYSwgYiwgYywgZCwgdHgsIHR5KSB7XHJcbiAgb3V0WzBdID0gYTtcclxuICBvdXRbMV0gPSBiO1xyXG4gIG91dFsyXSA9IGM7XHJcbiAgb3V0WzNdID0gZDtcclxuICBvdXRbNF0gPSB0eDtcclxuICBvdXRbNV0gPSB0eTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogSW52ZXJ0cyBhIG1hdDJkXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xyXG4gIGxldCBhYSA9IGFbMF0sIGFiID0gYVsxXSwgYWMgPSBhWzJdLCBhZCA9IGFbM107XHJcbiAgbGV0IGF0eCA9IGFbNF0sIGF0eSA9IGFbNV07XHJcblxyXG4gIGxldCBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhYztcclxuICBpZighZGV0KXtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBkZXQgPSAxLjAgLyBkZXQ7XHJcblxyXG4gIG91dFswXSA9IGFkICogZGV0O1xyXG4gIG91dFsxXSA9IC1hYiAqIGRldDtcclxuICBvdXRbMl0gPSAtYWMgKiBkZXQ7XHJcbiAgb3V0WzNdID0gYWEgKiBkZXQ7XHJcbiAgb3V0WzRdID0gKGFjICogYXR5IC0gYWQgKiBhdHgpICogZGV0O1xyXG4gIG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyZFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XHJcbiAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsxXSAqIGFbMl07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyZCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV07XHJcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXSwgYjQgPSBiWzRdLCBiNSA9IGJbNV07XHJcbiAgb3V0WzBdID0gYTAgKiBiMCArIGEyICogYjE7XHJcbiAgb3V0WzFdID0gYTEgKiBiMCArIGEzICogYjE7XHJcbiAgb3V0WzJdID0gYTAgKiBiMiArIGEyICogYjM7XHJcbiAgb3V0WzNdID0gYTEgKiBiMiArIGEzICogYjM7XHJcbiAgb3V0WzRdID0gYTAgKiBiNCArIGEyICogYjUgKyBhNDtcclxuICBvdXRbNV0gPSBhMSAqIGI0ICsgYTMgKiBiNSArIGE1O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0MmQgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV07XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuICBvdXRbMF0gPSBhMCAqICBjICsgYTIgKiBzO1xyXG4gIG91dFsxXSA9IGExICogIGMgKyBhMyAqIHM7XHJcbiAgb3V0WzJdID0gYTAgKiAtcyArIGEyICogYztcclxuICBvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjO1xyXG4gIG91dFs0XSA9IGE0O1xyXG4gIG91dFs1XSA9IGE1O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdO1xyXG4gIGxldCB2MCA9IHZbMF0sIHYxID0gdlsxXTtcclxuICBvdXRbMF0gPSBhMCAqIHYwO1xyXG4gIG91dFsxXSA9IGExICogdjA7XHJcbiAgb3V0WzJdID0gYTIgKiB2MTtcclxuICBvdXRbM10gPSBhMyAqIHYxO1xyXG4gIG91dFs0XSA9IGE0O1xyXG4gIG91dFs1XSA9IGE1O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2xhdGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDJkfSBvdXRcclxuICoqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdO1xyXG4gIGxldCB2MCA9IHZbMF0sIHYxID0gdlsxXTtcclxuICBvdXRbMF0gPSBhMDtcclxuICBvdXRbMV0gPSBhMTtcclxuICBvdXRbMl0gPSBhMjtcclxuICBvdXRbM10gPSBhMztcclxuICBvdXRbNF0gPSBhMCAqIHYwICsgYTIgKiB2MSArIGE0O1xyXG4gIG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTU7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQyZC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpLCBjID0gTWF0aC5jb3MocmFkKTtcclxuICBvdXRbMF0gPSBjO1xyXG4gIG91dFsxXSA9IHM7XHJcbiAgb3V0WzJdID0gLXM7XHJcbiAgb3V0WzNdID0gYztcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQyZC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVNjYWxpbmcob3V0LCB2KSB7XHJcbiAgb3V0WzBdID0gdlswXTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gdlsxXTtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0MmQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDE7XHJcbiAgb3V0WzRdID0gdlswXTtcclxuICBvdXRbNV0gPSB2WzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MmRcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgK1xyXG4gICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MmRcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xyXG4gIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgMSkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQyZCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xyXG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xyXG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xyXG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xyXG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgb3V0WzRdID0gYVs0XSAqIGI7XHJcbiAgb3V0WzVdID0gYVs1XSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDJkJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge21hdDJkfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xyXG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcclxuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XHJcbiAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xyXG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcclxuICBvdXRbNV0gPSBhWzVdICsgKGJbNV0gKiBzY2FsZSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG4gKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG4gKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdLCBiNCA9IGJbNF0sIGI1ID0gYls1XTtcclxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkpO1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5tdWx0aXBseX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcclxuXHJcbi8qKlxyXG4gKiAzeDMgTWF0cml4XHJcbiAqIEBtb2R1bGUgbWF0M1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcclxuICpcclxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDkpO1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMTtcclxuICBvdXRbNV0gPSAwO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzRdO1xyXG4gIG91dFs0XSA9IGFbNV07XHJcbiAgb3V0WzVdID0gYVs2XTtcclxuICBvdXRbNl0gPSBhWzhdO1xyXG4gIG91dFs3XSA9IGFbOV07XHJcbiAgb3V0WzhdID0gYVsxMF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICBvdXRbNl0gPSBhWzZdO1xyXG4gIG91dFs3XSA9IGFbN107XHJcbiAgb3V0WzhdID0gYVs4XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIG91dFs4XSA9IGFbOF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBtYXQzIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcclxuICBvdXRbMF0gPSBtMDA7XHJcbiAgb3V0WzFdID0gbTAxO1xyXG4gIG91dFsyXSA9IG0wMjtcclxuICBvdXRbM10gPSBtMTA7XHJcbiAgb3V0WzRdID0gbTExO1xyXG4gIG91dFs1XSA9IG0xMjtcclxuICBvdXRbNl0gPSBtMjA7XHJcbiAgb3V0WzddID0gbTIxO1xyXG4gIG91dFs4XSA9IG0yMjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMDI7XHJcbiAgb3V0WzNdID0gbTEwO1xyXG4gIG91dFs0XSA9IG0xMTtcclxuICBvdXRbNV0gPSBtMTI7XHJcbiAgb3V0WzZdID0gbTIwO1xyXG4gIG91dFs3XSA9IG0yMTtcclxuICBvdXRbOF0gPSBtMjI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAxO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcclxuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXHJcbiAgaWYgKG91dCA9PT0gYSkge1xyXG4gICAgbGV0IGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGExMiA9IGFbNV07XHJcbiAgICBvdXRbMV0gPSBhWzNdO1xyXG4gICAgb3V0WzJdID0gYVs2XTtcclxuICAgIG91dFszXSA9IGEwMTtcclxuICAgIG91dFs1XSA9IGFbN107XHJcbiAgICBvdXRbNl0gPSBhMDI7XHJcbiAgICBvdXRbN10gPSBhMTI7XHJcbiAgfSBlbHNlIHtcclxuICAgIG91dFswXSA9IGFbMF07XHJcbiAgICBvdXRbMV0gPSBhWzNdO1xyXG4gICAgb3V0WzJdID0gYVs2XTtcclxuICAgIG91dFszXSA9IGFbMV07XHJcbiAgICBvdXRbNF0gPSBhWzRdO1xyXG4gICAgb3V0WzVdID0gYVs3XTtcclxuICAgIG91dFs2XSA9IGFbMl07XHJcbiAgICBvdXRbN10gPSBhWzVdO1xyXG4gICAgb3V0WzhdID0gYVs4XTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbnZlcnRzIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcclxuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcclxuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcclxuXHJcbiAgbGV0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcclxuICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcclxuICBsZXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcbiAgbGV0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcclxuXHJcbiAgaWYgKCFkZXQpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBkZXQgPSAxLjAgLyBkZXQ7XHJcblxyXG4gIG91dFswXSA9IGIwMSAqIGRldDtcclxuICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XHJcbiAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XHJcbiAgb3V0WzNdID0gYjExICogZGV0O1xyXG4gIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xyXG4gIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcclxuICBvdXRbNl0gPSBiMjEgKiBkZXQ7XHJcbiAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xyXG4gIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xyXG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xyXG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xyXG5cclxuICBvdXRbMF0gPSAoYTExICogYTIyIC0gYTEyICogYTIxKTtcclxuICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcclxuICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcclxuICBvdXRbM10gPSAoYTEyICogYTIwIC0gYTEwICogYTIyKTtcclxuICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcclxuICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcclxuICBvdXRbNl0gPSAoYTEwICogYTIxIC0gYTExICogYTIwKTtcclxuICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcclxuICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xyXG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xyXG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xyXG5cclxuICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XHJcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XHJcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XHJcblxyXG4gIGxldCBiMDAgPSBiWzBdLCBiMDEgPSBiWzFdLCBiMDIgPSBiWzJdO1xyXG4gIGxldCBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdO1xyXG4gIGxldCBiMjAgPSBiWzZdLCBiMjEgPSBiWzddLCBiMjIgPSBiWzhdO1xyXG5cclxuICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XHJcbiAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xyXG4gIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcclxuXHJcbiAgb3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xyXG4gIG91dFs0XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMTtcclxuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XHJcblxyXG4gIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcclxuICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XHJcbiAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcbiAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXHJcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxyXG4gICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcclxuICAgIHggPSB2WzBdLCB5ID0gdlsxXTtcclxuXHJcbiAgb3V0WzBdID0gYTAwO1xyXG4gIG91dFsxXSA9IGEwMTtcclxuICBvdXRbMl0gPSBhMDI7XHJcblxyXG4gIG91dFszXSA9IGExMDtcclxuICBvdXRbNF0gPSBhMTE7XHJcbiAgb3V0WzVdID0gYTEyO1xyXG5cclxuICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcclxuICBvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMTtcclxuICBvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXHJcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxyXG4gICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcclxuXHJcbiAgICBzID0gTWF0aC5zaW4ocmFkKSxcclxuICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcclxuICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcclxuICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcclxuXHJcbiAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XHJcbiAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XHJcbiAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XHJcblxyXG4gIG91dFs2XSA9IGEyMDtcclxuICBvdXRbN10gPSBhMjE7XHJcbiAgb3V0WzhdID0gYTIyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xyXG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV07XHJcblxyXG4gIG91dFswXSA9IHggKiBhWzBdO1xyXG4gIG91dFsxXSA9IHggKiBhWzFdO1xyXG4gIG91dFsyXSA9IHggKiBhWzJdO1xyXG5cclxuICBvdXRbM10gPSB5ICogYVszXTtcclxuICBvdXRbNF0gPSB5ICogYVs0XTtcclxuICBvdXRbNV0gPSB5ICogYVs1XTtcclxuXHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIG91dFs4XSA9IGFbOF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IDE7XHJcbiAgb3V0WzVdID0gMDtcclxuICBvdXRbNl0gPSB2WzBdO1xyXG4gIG91dFs3XSA9IHZbMV07XHJcbiAgb3V0WzhdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGVcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpLCBjID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgb3V0WzBdID0gYztcclxuICBvdXRbMV0gPSBzO1xyXG4gIG91dFsyXSA9IDA7XHJcblxyXG4gIG91dFszXSA9IC1zO1xyXG4gIG91dFs0XSA9IGM7XHJcbiAgb3V0WzVdID0gMDtcclxuXHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDMuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xyXG4gIG91dFswXSA9IHZbMF07XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG5cclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IHZbMV07XHJcbiAgb3V0WzVdID0gMDtcclxuXHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY29weVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQyZChvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gMDtcclxuXHJcbiAgb3V0WzNdID0gYVsyXTtcclxuICBvdXRbNF0gPSBhWzNdO1xyXG4gIG91dFs1XSA9IDA7XHJcblxyXG4gIG91dFs2XSA9IGFbNF07XHJcbiAgb3V0WzddID0gYVs1XTtcclxuICBvdXRbOF0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuKlxyXG4qIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cclxuKlxyXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xyXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcclxuICBsZXQgeDIgPSB4ICsgeDtcclxuICBsZXQgeTIgPSB5ICsgeTtcclxuICBsZXQgejIgPSB6ICsgejtcclxuXHJcbiAgbGV0IHh4ID0geCAqIHgyO1xyXG4gIGxldCB5eCA9IHkgKiB4MjtcclxuICBsZXQgeXkgPSB5ICogeTI7XHJcbiAgbGV0IHp4ID0geiAqIHgyO1xyXG4gIGxldCB6eSA9IHogKiB5MjtcclxuICBsZXQgenogPSB6ICogejI7XHJcbiAgbGV0IHd4ID0gdyAqIHgyO1xyXG4gIGxldCB3eSA9IHcgKiB5MjtcclxuICBsZXQgd3ogPSB3ICogejI7XHJcblxyXG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xyXG4gIG91dFszXSA9IHl4IC0gd3o7XHJcbiAgb3V0WzZdID0genggKyB3eTtcclxuXHJcbiAgb3V0WzFdID0geXggKyB3ejtcclxuICBvdXRbNF0gPSAxIC0geHggLSB6ejtcclxuICBvdXRbN10gPSB6eSAtIHd4O1xyXG5cclxuICBvdXRbMl0gPSB6eCAtIHd5O1xyXG4gIG91dFs1XSA9IHp5ICsgd3g7XHJcbiAgb3V0WzhdID0gMSAtIHh4IC0geXk7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcclxuKlxyXG4qIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxyXG4qXHJcbiogQHJldHVybnMge21hdDN9IG91dFxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsRnJvbU1hdDQob3V0LCBhKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XHJcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XHJcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcclxuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XHJcblxyXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XHJcbiAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcclxuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xyXG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XHJcbiAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcclxuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xyXG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XHJcbiAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcclxuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xyXG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XHJcbiAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcclxuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcclxuXHJcbiAgaWYgKCFkZXQpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBkZXQgPSAxLjAgLyBkZXQ7XHJcblxyXG4gIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xyXG4gIG91dFsxXSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xyXG4gIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xyXG5cclxuICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcclxuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcclxuICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcclxuXHJcbiAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XHJcbiAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XHJcbiAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSAyRCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggb2YgeW91ciBnbCBjb250ZXh0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICBvdXRbMF0gPSAyIC8gd2lkdGg7XHJcbiAgICBvdXRbMV0gPSAwO1xyXG4gICAgb3V0WzJdID0gMDtcclxuICAgIG91dFszXSA9IDA7XHJcbiAgICBvdXRbNF0gPSAtMiAvIGhlaWdodDtcclxuICAgIG91dFs1XSA9IDA7XHJcbiAgICBvdXRbNl0gPSAtMTtcclxuICAgIG91dFs3XSA9IDE7XHJcbiAgICBvdXRbOF0gPSAxO1xyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ21hdDMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArXHJcbiAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgK1xyXG4gICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcclxuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQzJ3NcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICsgYlszXTtcclxuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcclxuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcclxuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcclxuICBvdXRbN10gPSBhWzddICsgYls3XTtcclxuICBvdXRbOF0gPSBhWzhdICsgYls4XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xyXG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xyXG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xyXG4gIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xyXG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xyXG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICBvdXRbMl0gPSBhWzJdICogYjtcclxuICBvdXRbM10gPSBhWzNdICogYjtcclxuICBvdXRbNF0gPSBhWzRdICogYjtcclxuICBvdXRbNV0gPSBhWzVdICogYjtcclxuICBvdXRbNl0gPSBhWzZdICogYjtcclxuICBvdXRbN10gPSBhWzddICogYjtcclxuICBvdXRbOF0gPSBhWzhdICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0MydzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xyXG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcclxuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XHJcbiAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xyXG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcclxuICBvdXRbNV0gPSBhWzVdICsgKGJbNV0gKiBzY2FsZSk7XHJcbiAgb3V0WzZdID0gYVs2XSArIChiWzZdICogc2NhbGUpO1xyXG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcclxuICBvdXRbOF0gPSBhWzhdICsgKGJbOF0gKiBzY2FsZSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiZcclxuICAgICAgICAgYVszXSA9PT0gYlszXSAmJiBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiZcclxuICAgICAgICAgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG4gKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLCBhNiA9IGFbNl0sIGE3ID0gYVs3XSwgYTggPSBhWzhdO1xyXG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdLCBiNiA9IGJbNl0sIGI3ID0gYls3XSwgYjggPSBiWzhdO1xyXG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTQgLSBiNCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTYgLSBiNikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTcgLSBiNykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAY2xhc3MgNHg0IE1hdHJpeDxicj5Gb3JtYXQ6IGNvbHVtbi1tYWpvciwgd2hlbiB0eXBlZCBvdXQgaXQgbG9va3MgbGlrZSByb3ctbWFqb3I8YnI+VGhlIG1hdHJpY2VzIGFyZSBiZWluZyBwb3N0IG11bHRpcGxpZWQuXHJcbiAqIEBuYW1lIG1hdDRcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDE7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gMTtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gMDtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcclxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICBvdXRbNl0gPSBhWzZdO1xyXG4gIG91dFs3XSA9IGFbN107XHJcbiAgb3V0WzhdID0gYVs4XTtcclxuICBvdXRbOV0gPSBhWzldO1xyXG4gIG91dFsxMF0gPSBhWzEwXTtcclxuICBvdXRbMTFdID0gYVsxMV07XHJcbiAgb3V0WzEyXSA9IGFbMTJdO1xyXG4gIG91dFsxM10gPSBhWzEzXTtcclxuICBvdXRbMTRdID0gYVsxNF07XHJcbiAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICBvdXRbNl0gPSBhWzZdO1xyXG4gIG91dFs3XSA9IGFbN107XHJcbiAgb3V0WzhdID0gYVs4XTtcclxuICBvdXRbOV0gPSBhWzldO1xyXG4gIG91dFsxMF0gPSBhWzEwXTtcclxuICBvdXRbMTFdID0gYVsxMV07XHJcbiAgb3V0WzEyXSA9IGFbMTJdO1xyXG4gIG91dFsxM10gPSBhWzEzXTtcclxuICBvdXRbMTRdID0gYVsxNF07XHJcbiAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMyBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA2KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA5KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMwIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDAgcG9zaXRpb24gKGluZGV4IDEyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMzIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDMgcG9zaXRpb24gKGluZGV4IDE1KVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMobTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcclxuICBvdXRbMF0gPSBtMDA7XHJcbiAgb3V0WzFdID0gbTAxO1xyXG4gIG91dFsyXSA9IG0wMjtcclxuICBvdXRbM10gPSBtMDM7XHJcbiAgb3V0WzRdID0gbTEwO1xyXG4gIG91dFs1XSA9IG0xMTtcclxuICBvdXRbNl0gPSBtMTI7XHJcbiAgb3V0WzddID0gbTEzO1xyXG4gIG91dFs4XSA9IG0yMDtcclxuICBvdXRbOV0gPSBtMjE7XHJcbiAgb3V0WzEwXSA9IG0yMjtcclxuICBvdXRbMTFdID0gbTIzO1xyXG4gIG91dFsxMl0gPSBtMzA7XHJcbiAgb3V0WzEzXSA9IG0zMTtcclxuICBvdXRbMTRdID0gbTMyO1xyXG4gIG91dFsxNV0gPSBtMzM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcclxuICBvdXRbMF0gPSBtMDA7XHJcbiAgb3V0WzFdID0gbTAxO1xyXG4gIG91dFsyXSA9IG0wMjtcclxuICBvdXRbM10gPSBtMDM7XHJcbiAgb3V0WzRdID0gbTEwO1xyXG4gIG91dFs1XSA9IG0xMTtcclxuICBvdXRbNl0gPSBtMTI7XHJcbiAgb3V0WzddID0gbTEzO1xyXG4gIG91dFs4XSA9IG0yMDtcclxuICBvdXRbOV0gPSBtMjE7XHJcbiAgb3V0WzEwXSA9IG0yMjtcclxuICBvdXRbMTFdID0gbTIzO1xyXG4gIG91dFsxMl0gPSBtMzA7XHJcbiAgb3V0WzEzXSA9IG0zMTtcclxuICBvdXRbMTRdID0gbTMyO1xyXG4gIG91dFsxNV0gPSBtMzM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAxO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IDE7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcclxuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXHJcbiAgaWYgKG91dCA9PT0gYSkge1xyXG4gICAgbGV0IGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XHJcbiAgICBsZXQgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcclxuICAgIGxldCBhMjMgPSBhWzExXTtcclxuXHJcbiAgICBvdXRbMV0gPSBhWzRdO1xyXG4gICAgb3V0WzJdID0gYVs4XTtcclxuICAgIG91dFszXSA9IGFbMTJdO1xyXG4gICAgb3V0WzRdID0gYTAxO1xyXG4gICAgb3V0WzZdID0gYVs5XTtcclxuICAgIG91dFs3XSA9IGFbMTNdO1xyXG4gICAgb3V0WzhdID0gYTAyO1xyXG4gICAgb3V0WzldID0gYTEyO1xyXG4gICAgb3V0WzExXSA9IGFbMTRdO1xyXG4gICAgb3V0WzEyXSA9IGEwMztcclxuICAgIG91dFsxM10gPSBhMTM7XHJcbiAgICBvdXRbMTRdID0gYTIzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXRbMF0gPSBhWzBdO1xyXG4gICAgb3V0WzFdID0gYVs0XTtcclxuICAgIG91dFsyXSA9IGFbOF07XHJcbiAgICBvdXRbM10gPSBhWzEyXTtcclxuICAgIG91dFs0XSA9IGFbMV07XHJcbiAgICBvdXRbNV0gPSBhWzVdO1xyXG4gICAgb3V0WzZdID0gYVs5XTtcclxuICAgIG91dFs3XSA9IGFbMTNdO1xyXG4gICAgb3V0WzhdID0gYVsyXTtcclxuICAgIG91dFs5XSA9IGFbNl07XHJcbiAgICBvdXRbMTBdID0gYVsxMF07XHJcbiAgICBvdXRbMTFdID0gYVsxNF07XHJcbiAgICBvdXRbMTJdID0gYVszXTtcclxuICAgIG91dFsxM10gPSBhWzddO1xyXG4gICAgb3V0WzE0XSA9IGFbMTFdO1xyXG4gICAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEludmVydHMgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xyXG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XHJcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xyXG5cclxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xyXG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XHJcbiAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcclxuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xyXG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XHJcbiAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcclxuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xyXG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XHJcbiAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcclxuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xyXG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XHJcbiAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG4gIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XHJcblxyXG4gIGlmICghZGV0KSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgZGV0ID0gMS4wIC8gZGV0O1xyXG5cclxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcclxuICBvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcclxuICBvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcclxuICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcclxuICBvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcclxuICBvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcclxuICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcclxuICBvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcclxuICBvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcclxuICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcclxuICBvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XHJcbiAgb3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xyXG4gIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcclxuICBvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XHJcbiAgb3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xyXG4gIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XHJcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XHJcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcclxuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XHJcblxyXG4gIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XHJcbiAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcclxuICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xyXG4gIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XHJcbiAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcclxuICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xyXG4gIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XHJcbiAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcclxuICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xyXG4gIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XHJcbiAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcclxuICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xyXG4gIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XHJcbiAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcclxuICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xyXG4gIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcclxuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcclxuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xyXG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcclxuXHJcbiAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcclxuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xyXG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XHJcbiAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcclxuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xyXG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XHJcbiAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcclxuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xyXG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XHJcbiAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcclxuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xyXG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XHJcblxyXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gbWF0NHNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xyXG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XHJcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xyXG5cclxuICAvLyBDYWNoZSBvbmx5IHRoZSBjdXJyZW50IGxpbmUgb2YgdGhlIHNlY29uZCBtYXRyaXhcclxuICBsZXQgYjAgID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcclxuICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XHJcbiAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xyXG4gIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcclxuICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XHJcblxyXG4gIGIwID0gYls0XTsgYjEgPSBiWzVdOyBiMiA9IGJbNl07IGIzID0gYls3XTtcclxuICBvdXRbNF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XHJcbiAgb3V0WzVdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xyXG4gIG91dFs2XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcclxuICBvdXRbN10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XHJcblxyXG4gIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xyXG4gIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcclxuICBvdXRbOV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XHJcbiAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcclxuICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xyXG5cclxuICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xyXG4gIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XHJcbiAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcclxuICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xyXG4gIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcclxuICBsZXQgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcclxuICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xyXG4gIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XHJcbiAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcclxuXHJcbiAgaWYgKGEgPT09IG91dCkge1xyXG4gICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xyXG4gICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xyXG4gICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XHJcbiAgfSBlbHNlIHtcclxuICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XHJcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xyXG4gICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xyXG5cclxuICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcclxuICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcclxuICAgIG91dFs4XSA9IGEyMDsgb3V0WzldID0gYTIxOyBvdXRbMTBdID0gYTIyOyBvdXRbMTFdID0gYTIzO1xyXG5cclxuICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzMgbm90IHVzaW5nIHZlY3Rvcml6YXRpb25cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcclxuICBsZXQgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcclxuXHJcbiAgb3V0WzBdID0gYVswXSAqIHg7XHJcbiAgb3V0WzFdID0gYVsxXSAqIHg7XHJcbiAgb3V0WzJdID0gYVsyXSAqIHg7XHJcbiAgb3V0WzNdID0gYVszXSAqIHg7XHJcbiAgb3V0WzRdID0gYVs0XSAqIHk7XHJcbiAgb3V0WzVdID0gYVs1XSAqIHk7XHJcbiAgb3V0WzZdID0gYVs2XSAqIHk7XHJcbiAgb3V0WzddID0gYVs3XSAqIHk7XHJcbiAgb3V0WzhdID0gYVs4XSAqIHo7XHJcbiAgb3V0WzldID0gYVs5XSAqIHo7XHJcbiAgb3V0WzEwXSA9IGFbMTBdICogejtcclxuICBvdXRbMTFdID0gYVsxMV0gKiB6O1xyXG4gIG91dFsxMl0gPSBhWzEyXTtcclxuICBvdXRbMTNdID0gYVsxM107XHJcbiAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gIG91dFsxNV0gPSBhWzE1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xyXG4gIGxldCB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdO1xyXG4gIGxldCBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcclxuICBsZXQgcywgYywgdDtcclxuICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xyXG4gIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XHJcbiAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcclxuICBsZXQgYjAwLCBiMDEsIGIwMjtcclxuICBsZXQgYjEwLCBiMTEsIGIxMjtcclxuICBsZXQgYjIwLCBiMjEsIGIyMjtcclxuXHJcbiAgaWYgKE1hdGguYWJzKGxlbikgPCBnbE1hdHJpeC5FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XHJcblxyXG4gIGxlbiA9IDEgLyBsZW47XHJcbiAgeCAqPSBsZW47XHJcbiAgeSAqPSBsZW47XHJcbiAgeiAqPSBsZW47XHJcblxyXG4gIHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGMgPSBNYXRoLmNvcyhyYWQpO1xyXG4gIHQgPSAxIC0gYztcclxuXHJcbiAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcclxuICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xyXG4gIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcclxuXHJcbiAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XHJcbiAgYjAwID0geCAqIHggKiB0ICsgYzsgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xyXG4gIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcclxuICBiMjAgPSB4ICogeiAqIHQgKyB5ICogczsgYjIxID0geSAqIHogKiB0IC0geCAqIHM7IGIyMiA9IHogKiB6ICogdCArIGM7XHJcblxyXG4gIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcbiAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xyXG4gIG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcclxuICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XHJcbiAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xyXG4gIG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcclxuICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XHJcbiAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xyXG4gIG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcclxuICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XHJcbiAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xyXG4gIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XHJcbiAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcclxuXHJcbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xyXG4gICAgb3V0WzEyXSA9IGFbMTJdO1xyXG4gICAgb3V0WzEzXSA9IGFbMTNdO1xyXG4gICAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gICAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuICBsZXQgYTEwID0gYVs0XTtcclxuICBsZXQgYTExID0gYVs1XTtcclxuICBsZXQgYTEyID0gYVs2XTtcclxuICBsZXQgYTEzID0gYVs3XTtcclxuICBsZXQgYTIwID0gYVs4XTtcclxuICBsZXQgYTIxID0gYVs5XTtcclxuICBsZXQgYTIyID0gYVsxMF07XHJcbiAgbGV0IGEyMyA9IGFbMTFdO1xyXG5cclxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcclxuICAgIG91dFswXSAgPSBhWzBdO1xyXG4gICAgb3V0WzFdICA9IGFbMV07XHJcbiAgICBvdXRbMl0gID0gYVsyXTtcclxuICAgIG91dFszXSAgPSBhWzNdO1xyXG4gICAgb3V0WzEyXSA9IGFbMTJdO1xyXG4gICAgb3V0WzEzXSA9IGFbMTNdO1xyXG4gICAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gICAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIH1cclxuXHJcbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xyXG4gIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xyXG4gIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xyXG4gIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xyXG4gIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xyXG4gIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xyXG4gIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcclxuICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgbGV0IGEwMCA9IGFbMF07XHJcbiAgbGV0IGEwMSA9IGFbMV07XHJcbiAgbGV0IGEwMiA9IGFbMl07XHJcbiAgbGV0IGEwMyA9IGFbM107XHJcbiAgbGV0IGEyMCA9IGFbOF07XHJcbiAgbGV0IGEyMSA9IGFbOV07XHJcbiAgbGV0IGEyMiA9IGFbMTBdO1xyXG4gIGxldCBhMjMgPSBhWzExXTtcclxuXHJcbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcbiAgICBvdXRbNF0gID0gYVs0XTtcclxuICAgIG91dFs1XSAgPSBhWzVdO1xyXG4gICAgb3V0WzZdICA9IGFbNl07XHJcbiAgICBvdXRbN10gID0gYVs3XTtcclxuICAgIG91dFsxMl0gPSBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhWzE1XTtcclxuICB9XHJcblxyXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogcztcclxuICBvdXRbMV0gPSBhMDEgKiBjIC0gYTIxICogcztcclxuICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogcztcclxuICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogcztcclxuICBvdXRbOF0gPSBhMDAgKiBzICsgYTIwICogYztcclxuICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogYztcclxuICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGM7XHJcbiAgb3V0WzExXSA9IGEwMyAqIHMgKyBhMjMgKiBjO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG4gIGxldCBhMDAgPSBhWzBdO1xyXG4gIGxldCBhMDEgPSBhWzFdO1xyXG4gIGxldCBhMDIgPSBhWzJdO1xyXG4gIGxldCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMTAgPSBhWzRdO1xyXG4gIGxldCBhMTEgPSBhWzVdO1xyXG4gIGxldCBhMTIgPSBhWzZdO1xyXG4gIGxldCBhMTMgPSBhWzddO1xyXG5cclxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XHJcbiAgICBvdXRbOF0gID0gYVs4XTtcclxuICAgIG91dFs5XSAgPSBhWzldO1xyXG4gICAgb3V0WzEwXSA9IGFbMTBdO1xyXG4gICAgb3V0WzExXSA9IGFbMTFdO1xyXG4gICAgb3V0WzEyXSA9IGFbMTJdO1xyXG4gICAgb3V0WzEzXSA9IGFbMTNdO1xyXG4gICAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gICAgb3V0WzE1XSA9IGFbMTVdO1xyXG4gIH1cclxuXHJcbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xyXG4gIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xyXG4gIG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzO1xyXG4gIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xyXG4gIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xyXG4gIG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzO1xyXG4gIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xyXG4gIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDE7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gMTtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gdlswXTtcclxuICBvdXRbMTNdID0gdlsxXTtcclxuICBvdXRbMTRdID0gdlsyXTtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjM30gdiBTY2FsaW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVNjYWxpbmcob3V0LCB2KSB7XHJcbiAgb3V0WzBdID0gdlswXTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IHZbMV07XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gdlsyXTtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gMDtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGUgYXJvdW5kIGEgZ2l2ZW4gYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZShkZXN0LCBkZXN0LCByYWQsIGF4aXMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQsIGF4aXMpIHtcclxuICBsZXQgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXTtcclxuICBsZXQgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XHJcbiAgbGV0IHMsIGMsIHQ7XHJcblxyXG4gIGlmIChNYXRoLmFicyhsZW4pIDwgZ2xNYXRyaXguRVBTSUxPTikgeyByZXR1cm4gbnVsbDsgfVxyXG5cclxuICBsZW4gPSAxIC8gbGVuO1xyXG4gIHggKj0gbGVuO1xyXG4gIHkgKj0gbGVuO1xyXG4gIHogKj0gbGVuO1xyXG5cclxuICBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBjID0gTWF0aC5jb3MocmFkKTtcclxuICB0ID0gMSAtIGM7XHJcblxyXG4gIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcbiAgb3V0WzBdID0geCAqIHggKiB0ICsgYztcclxuICBvdXRbMV0gPSB5ICogeCAqIHQgKyB6ICogcztcclxuICBvdXRbMl0gPSB6ICogeCAqIHQgLSB5ICogcztcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IHggKiB5ICogdCAtIHogKiBzO1xyXG4gIG91dFs1XSA9IHkgKiB5ICogdCArIGM7XHJcbiAgb3V0WzZdID0geiAqIHkgKiB0ICsgeCAqIHM7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSB4ICogeiAqIHQgKyB5ICogcztcclxuICBvdXRbOV0gPSB5ICogeiAqIHQgLSB4ICogcztcclxuICBvdXRbMTBdID0geiAqIHogKiB0ICsgYztcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gMDtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZVgoZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVhSb3RhdGlvbihvdXQsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcblxyXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICBvdXRbMF0gID0gMTtcclxuICBvdXRbMV0gID0gMDtcclxuICBvdXRbMl0gID0gMDtcclxuICBvdXRbM10gID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IGM7XHJcbiAgb3V0WzZdID0gcztcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gLXM7XHJcbiAgb3V0WzEwXSA9IGM7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5yb3RhdGVZKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcbiAgb3V0WzBdICA9IGM7XHJcbiAgb3V0WzFdICA9IDA7XHJcbiAgb3V0WzJdICA9IC1zO1xyXG4gIG91dFszXSAgPSAwO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gMTtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gcztcclxuICBvdXRbOV0gPSAwO1xyXG4gIG91dFsxMF0gPSBjO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSAwO1xyXG4gIG91dFsxM10gPSAwO1xyXG4gIG91dFsxNF0gPSAwO1xyXG4gIG91dFsxNV0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFswXSAgPSBjO1xyXG4gIG91dFsxXSAgPSBzO1xyXG4gIG91dFsyXSAgPSAwO1xyXG4gIG91dFszXSAgPSAwO1xyXG4gIG91dFs0XSA9IC1zO1xyXG4gIG91dFs1XSA9IGM7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gMTtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gMDtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcclxuICAvLyBRdWF0ZXJuaW9uIG1hdGhcclxuICBsZXQgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM107XHJcbiAgbGV0IHgyID0geCArIHg7XHJcbiAgbGV0IHkyID0geSArIHk7XHJcbiAgbGV0IHoyID0geiArIHo7XHJcblxyXG4gIGxldCB4eCA9IHggKiB4MjtcclxuICBsZXQgeHkgPSB4ICogeTI7XHJcbiAgbGV0IHh6ID0geCAqIHoyO1xyXG4gIGxldCB5eSA9IHkgKiB5MjtcclxuICBsZXQgeXogPSB5ICogejI7XHJcbiAgbGV0IHp6ID0geiAqIHoyO1xyXG4gIGxldCB3eCA9IHcgKiB4MjtcclxuICBsZXQgd3kgPSB3ICogeTI7XHJcbiAgbGV0IHd6ID0gdyAqIHoyO1xyXG5cclxuICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xyXG4gIG91dFsxXSA9IHh5ICsgd3o7XHJcbiAgb3V0WzJdID0geHogLSB3eTtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IHh5IC0gd3o7XHJcbiAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcclxuICBvdXRbNl0gPSB5eiArIHd4O1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0geHogKyB3eTtcclxuICBvdXRbOV0gPSB5eiAtIHd4O1xyXG4gIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSB2WzBdO1xyXG4gIG91dFsxM10gPSB2WzFdO1xyXG4gIG91dFsxNF0gPSB2WzJdO1xyXG4gIG91dFsxNV0gPSAxO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGZyb20gYSBkdWFsIHF1YXQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IE1hdHJpeFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0MihvdXQsIGEpIHtcclxuICBsZXQgdHJhbnNsYXRpb24gPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcclxuICBsZXQgYnggPSAtYVswXSwgYnkgPSAtYVsxXSwgYnogPSAtYVsyXSwgYncgPSBhWzNdLFxyXG4gIGF4ID0gYVs0XSwgYXkgPSBhWzVdLCBheiA9IGFbNl0sIGF3ID0gYVs3XTtcclxuICBcclxuICBsZXQgbWFnbml0dWRlID0gYnggKiBieCArIGJ5ICogYnkgKyBieiAqIGJ6ICsgYncgKiBidztcclxuICAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcclxuICBpZiAobWFnbml0dWRlID4gMCkge1xyXG4gICAgdHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyIC8gbWFnbml0dWRlO1xyXG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyIC8gbWFnbml0dWRlO1xyXG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyIC8gbWFnbml0dWRlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFuc2xhdGlvblswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDI7XHJcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDI7XHJcbiAgICB0cmFuc2xhdGlvblsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDI7XHJcbiAgfVxyXG4gIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgYSwgdHJhbnNsYXRpb24pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuICogIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XHJcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgbWF0KSB7XHJcbiAgb3V0WzBdID0gbWF0WzEyXTtcclxuICBvdXRbMV0gPSBtYXRbMTNdO1xyXG4gIG91dFsyXSA9IG1hdFsxNF07XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxyXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcclxuICogIHdpdGggYSBub3JtYWxpemVkIFF1YXRlcm5pb24gcGFyYW10ZXIsIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZVxyXG4gKiAgdGhlIHNhbWUgYXMgdGhlIHNjYWxpbmcgdmVjdG9yXHJcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50XHJcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNjYWxpbmcob3V0LCBtYXQpIHtcclxuICBsZXQgbTExID0gbWF0WzBdO1xyXG4gIGxldCBtMTIgPSBtYXRbMV07XHJcbiAgbGV0IG0xMyA9IG1hdFsyXTtcclxuICBsZXQgbTIxID0gbWF0WzRdO1xyXG4gIGxldCBtMjIgPSBtYXRbNV07XHJcbiAgbGV0IG0yMyA9IG1hdFs2XTtcclxuICBsZXQgbTMxID0gbWF0WzhdO1xyXG4gIGxldCBtMzIgPSBtYXRbOV07XHJcbiAgbGV0IG0zMyA9IG1hdFsxMF07XHJcblxyXG4gIG91dFswXSA9IE1hdGguc3FydChtMTEgKiBtMTEgKyBtMTIgKiBtMTIgKyBtMTMgKiBtMTMpO1xyXG4gIG91dFsxXSA9IE1hdGguc3FydChtMjEgKiBtMjEgKyBtMjIgKiBtMjIgKyBtMjMgKiBtMjMpO1xyXG4gIG91dFsyXSA9IE1hdGguc3FydChtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzMpO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxyXG4gKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcclxuICogIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLCB0aGUgcmV0dXJuZWQgcXVhdGVybmlvbiB3aWxsIGJlIHRoZVxyXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcbiAqIEByZXR1cm4ge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvdGF0aW9uKG91dCwgbWF0KSB7XHJcbiAgLy8gQWxnb3JpdGhtIHRha2VuIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cclxuICBsZXQgdHJhY2UgPSBtYXRbMF0gKyBtYXRbNV0gKyBtYXRbMTBdO1xyXG4gIGxldCBTID0gMDtcclxuXHJcbiAgaWYgKHRyYWNlID4gMCkge1xyXG4gICAgUyA9IE1hdGguc3FydCh0cmFjZSArIDEuMCkgKiAyO1xyXG4gICAgb3V0WzNdID0gMC4yNSAqIFM7XHJcbiAgICBvdXRbMF0gPSAobWF0WzZdIC0gbWF0WzldKSAvIFM7XHJcbiAgICBvdXRbMV0gPSAobWF0WzhdIC0gbWF0WzJdKSAvIFM7XHJcbiAgICBvdXRbMl0gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFM7XHJcbiAgfSBlbHNlIGlmICgobWF0WzBdID4gbWF0WzVdKSAmJiAobWF0WzBdID4gbWF0WzEwXSkpIHtcclxuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzBdIC0gbWF0WzVdIC0gbWF0WzEwXSkgKiAyO1xyXG4gICAgb3V0WzNdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xyXG4gICAgb3V0WzBdID0gMC4yNSAqIFM7XHJcbiAgICBvdXRbMV0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFM7XHJcbiAgICBvdXRbMl0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XHJcbiAgfSBlbHNlIGlmIChtYXRbNV0gPiBtYXRbMTBdKSB7XHJcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFs1XSAtIG1hdFswXSAtIG1hdFsxMF0pICogMjtcclxuICAgIG91dFszXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gUztcclxuICAgIG91dFswXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gUztcclxuICAgIG91dFsxXSA9IDAuMjUgKiBTO1xyXG4gICAgb3V0WzJdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFsxMF0gLSBtYXRbMF0gLSBtYXRbNV0pICogMjtcclxuICAgIG91dFszXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gUztcclxuICAgIG91dFswXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gUztcclxuICAgIG91dFsxXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gUztcclxuICAgIG91dFsyXSA9IDAuMjUgKiBTO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUob3V0LCBxLCB2LCBzKSB7XHJcbiAgLy8gUXVhdGVybmlvbiBtYXRoXHJcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xyXG4gIGxldCB4MiA9IHggKyB4O1xyXG4gIGxldCB5MiA9IHkgKyB5O1xyXG4gIGxldCB6MiA9IHogKyB6O1xyXG5cclxuICBsZXQgeHggPSB4ICogeDI7XHJcbiAgbGV0IHh5ID0geCAqIHkyO1xyXG4gIGxldCB4eiA9IHggKiB6MjtcclxuICBsZXQgeXkgPSB5ICogeTI7XHJcbiAgbGV0IHl6ID0geSAqIHoyO1xyXG4gIGxldCB6eiA9IHogKiB6MjtcclxuICBsZXQgd3ggPSB3ICogeDI7XHJcbiAgbGV0IHd5ID0gdyAqIHkyO1xyXG4gIGxldCB3eiA9IHcgKiB6MjtcclxuICBsZXQgc3ggPSBzWzBdO1xyXG4gIGxldCBzeSA9IHNbMV07XHJcbiAgbGV0IHN6ID0gc1syXTtcclxuXHJcbiAgb3V0WzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XHJcbiAgb3V0WzFdID0gKHh5ICsgd3opICogc3g7XHJcbiAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAoeHkgLSB3eikgKiBzeTtcclxuICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcclxuICBvdXRbNl0gPSAoeXogKyB3eCkgKiBzeTtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xyXG4gIG91dFs5XSA9ICh5eiAtIHd4KSAqIHN6O1xyXG4gIG91dFsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gdlswXTtcclxuICBvdXRbMTNdID0gdlsxXTtcclxuICBvdXRbMTRdID0gdlsyXTtcclxuICBvdXRbMTVdID0gMTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlLCByb3RhdGluZyBhbmQgc2NhbGluZyBhcm91bmQgdGhlIGdpdmVuIG9yaWdpblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgb3JpZ2luKTtcclxuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcclxuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgbmVnYXRpdmVPcmlnaW4pO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IG8gVGhlIG9yaWdpbiB2ZWN0b3IgYXJvdW5kIHdoaWNoIHRvIHNjYWxlIGFuZCByb3RhdGVcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVPcmlnaW4ob3V0LCBxLCB2LCBzLCBvKSB7XHJcbiAgLy8gUXVhdGVybmlvbiBtYXRoXHJcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xyXG4gIGxldCB4MiA9IHggKyB4O1xyXG4gIGxldCB5MiA9IHkgKyB5O1xyXG4gIGxldCB6MiA9IHogKyB6O1xyXG5cclxuICBsZXQgeHggPSB4ICogeDI7XHJcbiAgbGV0IHh5ID0geCAqIHkyO1xyXG4gIGxldCB4eiA9IHggKiB6MjtcclxuICBsZXQgeXkgPSB5ICogeTI7XHJcbiAgbGV0IHl6ID0geSAqIHoyO1xyXG4gIGxldCB6eiA9IHogKiB6MjtcclxuICBsZXQgd3ggPSB3ICogeDI7XHJcbiAgbGV0IHd5ID0gdyAqIHkyO1xyXG4gIGxldCB3eiA9IHcgKiB6MjtcclxuXHJcbiAgbGV0IHN4ID0gc1swXTtcclxuICBsZXQgc3kgPSBzWzFdO1xyXG4gIGxldCBzeiA9IHNbMl07XHJcblxyXG4gIGxldCBveCA9IG9bMF07XHJcbiAgbGV0IG95ID0gb1sxXTtcclxuICBsZXQgb3ogPSBvWzJdO1xyXG5cclxuICBsZXQgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xyXG4gIGxldCBvdXQxID0gKHh5ICsgd3opICogc3g7XHJcbiAgbGV0IG91dDIgPSAoeHogLSB3eSkgKiBzeDtcclxuICBsZXQgb3V0NCA9ICh4eSAtIHd6KSAqIHN5O1xyXG4gIGxldCBvdXQ1ID0gKDEgLSAoeHggKyB6eikpICogc3k7XHJcbiAgbGV0IG91dDYgPSAoeXogKyB3eCkgKiBzeTtcclxuICBsZXQgb3V0OCA9ICh4eiArIHd5KSAqIHN6O1xyXG4gIGxldCBvdXQ5ID0gKHl6IC0gd3gpICogc3o7XHJcbiAgbGV0IG91dDEwID0gKDEgLSAoeHggKyB5eSkpICogc3o7XHJcblxyXG4gIG91dFswXSA9IG91dDA7XHJcbiAgb3V0WzFdID0gb3V0MTtcclxuICBvdXRbMl0gPSBvdXQyO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gb3V0NDtcclxuICBvdXRbNV0gPSBvdXQ1O1xyXG4gIG91dFs2XSA9IG91dDY7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSBvdXQ4O1xyXG4gIG91dFs5XSA9IG91dDk7XHJcbiAgb3V0WzEwXSA9IG91dDEwO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSB2WzBdICsgb3ggLSAob3V0MCAqIG94ICsgb3V0NCAqIG95ICsgb3V0OCAqIG96KTtcclxuICBvdXRbMTNdID0gdlsxXSArIG95IC0gKG91dDEgKiBveCArIG91dDUgKiBveSArIG91dDkgKiBveik7XHJcbiAgb3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KTtcclxuICBvdXRbMTVdID0gMTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cclxuICpcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xyXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcclxuICBsZXQgeDIgPSB4ICsgeDtcclxuICBsZXQgeTIgPSB5ICsgeTtcclxuICBsZXQgejIgPSB6ICsgejtcclxuXHJcbiAgbGV0IHh4ID0geCAqIHgyO1xyXG4gIGxldCB5eCA9IHkgKiB4MjtcclxuICBsZXQgeXkgPSB5ICogeTI7XHJcbiAgbGV0IHp4ID0geiAqIHgyO1xyXG4gIGxldCB6eSA9IHogKiB5MjtcclxuICBsZXQgenogPSB6ICogejI7XHJcbiAgbGV0IHd4ID0gdyAqIHgyO1xyXG4gIGxldCB3eSA9IHcgKiB5MjtcclxuICBsZXQgd3ogPSB3ICogejI7XHJcblxyXG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xyXG4gIG91dFsxXSA9IHl4ICsgd3o7XHJcbiAgb3V0WzJdID0genggLSB3eTtcclxuICBvdXRbM10gPSAwO1xyXG5cclxuICBvdXRbNF0gPSB5eCAtIHd6O1xyXG4gIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xyXG4gIG91dFs2XSA9IHp5ICsgd3g7XHJcbiAgb3V0WzddID0gMDtcclxuXHJcbiAgb3V0WzhdID0genggKyB3eTtcclxuICBvdXRbOV0gPSB6eSAtIHd4O1xyXG4gIG91dFsxMF0gPSAxIC0geHggLSB5eTtcclxuICBvdXRbMTFdID0gMDtcclxuXHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcnVzdHVtKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuICBsZXQgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCk7XHJcbiAgbGV0IHRiID0gMSAvICh0b3AgLSBib3R0b20pO1xyXG4gIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XHJcbiAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gKG5lYXIgKiAyKSAqIHRiO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsO1xyXG4gIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XHJcbiAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xyXG4gIG91dFsxMV0gPSAtMTtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gKGZhciAqIG5lYXIgKiAyKSAqIG5mO1xyXG4gIG91dFsxNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcclxuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcclxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xyXG4gIGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpO1xyXG4gIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XHJcbiAgb3V0WzBdID0gZiAvIGFzcGVjdDtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IGY7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IDA7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XHJcbiAgb3V0WzExXSA9IC0xO1xyXG4gIG91dFsxMl0gPSAwO1xyXG4gIG91dFsxM10gPSAwO1xyXG4gIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XHJcbiAgb3V0WzE1XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXHJcbiAqIFRoaXMgaXMgcHJpbWFyaWx5IHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBwcm9qZWN0aW9uIG1hdHJpY2VzIHRvIGJlIHVzZWRcclxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldyhvdXQsIGZvdiwgbmVhciwgZmFyKSB7XHJcbiAgbGV0IHVwVGFuID0gTWF0aC50YW4oZm92LnVwRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xyXG4gIGxldCBkb3duVGFuID0gTWF0aC50YW4oZm92LmRvd25EZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XHJcbiAgbGV0IGxlZnRUYW4gPSBNYXRoLnRhbihmb3YubGVmdERlZ3JlZXMgKiBNYXRoLlBJLzE4MC4wKTtcclxuICBsZXQgcmlnaHRUYW4gPSBNYXRoLnRhbihmb3YucmlnaHREZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XHJcbiAgbGV0IHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pO1xyXG4gIGxldCB5U2NhbGUgPSAyLjAgLyAodXBUYW4gKyBkb3duVGFuKTtcclxuXHJcbiAgb3V0WzBdID0geFNjYWxlO1xyXG4gIG91dFsxXSA9IDAuMDtcclxuICBvdXRbMl0gPSAwLjA7XHJcbiAgb3V0WzNdID0gMC4wO1xyXG4gIG91dFs0XSA9IDAuMDtcclxuICBvdXRbNV0gPSB5U2NhbGU7XHJcbiAgb3V0WzZdID0gMC4wO1xyXG4gIG91dFs3XSA9IDAuMDtcclxuICBvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KTtcclxuICBvdXRbOV0gPSAoKHVwVGFuIC0gZG93blRhbikgKiB5U2NhbGUgKiAwLjUpO1xyXG4gIG91dFsxMF0gPSBmYXIgLyAobmVhciAtIGZhcik7XHJcbiAgb3V0WzExXSA9IC0xLjA7XHJcbiAgb3V0WzEyXSA9IDAuMDtcclxuICBvdXRbMTNdID0gMC4wO1xyXG4gIG91dFsxNF0gPSAoZmFyICogbmVhcikgLyAobmVhciAtIGZhcik7XHJcbiAgb3V0WzE1XSA9IDAuMDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvcnRobyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XHJcbiAgbGV0IGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xyXG4gIGxldCBidCA9IDEgLyAoYm90dG9tIC0gdG9wKTtcclxuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gIG91dFswXSA9IC0yICogbHI7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAtMiAqIGJ0O1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IDIgKiBuZjtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcclxuICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcclxuICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzLiBcclxuICogSWYgeW91IHdhbnQgYSBtYXRyaXggdGhhdCBhY3R1YWxseSBtYWtlcyBhbiBvYmplY3QgbG9vayBhdCBhbm90aGVyIG9iamVjdCwgeW91IHNob3VsZCB1c2UgdGFyZ2V0VG8gaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvb2tBdChvdXQsIGV5ZSwgY2VudGVyLCB1cCkge1xyXG4gIGxldCB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW47XHJcbiAgbGV0IGV5ZXggPSBleWVbMF07XHJcbiAgbGV0IGV5ZXkgPSBleWVbMV07XHJcbiAgbGV0IGV5ZXogPSBleWVbMl07XHJcbiAgbGV0IHVweCA9IHVwWzBdO1xyXG4gIGxldCB1cHkgPSB1cFsxXTtcclxuICBsZXQgdXB6ID0gdXBbMl07XHJcbiAgbGV0IGNlbnRlcnggPSBjZW50ZXJbMF07XHJcbiAgbGV0IGNlbnRlcnkgPSBjZW50ZXJbMV07XHJcbiAgbGV0IGNlbnRlcnogPSBjZW50ZXJbMl07XHJcblxyXG4gIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcbiAgICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IGdsTWF0cml4LkVQU0lMT04gJiZcclxuICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgZ2xNYXRyaXguRVBTSUxPTikge1xyXG4gICAgcmV0dXJuIGlkZW50aXR5KG91dCk7XHJcbiAgfVxyXG5cclxuICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xyXG4gIHoxID0gZXlleSAtIGNlbnRlcnk7XHJcbiAgejIgPSBleWV6IC0gY2VudGVyejtcclxuXHJcbiAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xyXG4gIHowICo9IGxlbjtcclxuICB6MSAqPSBsZW47XHJcbiAgejIgKj0gbGVuO1xyXG5cclxuICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XHJcbiAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xyXG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcclxuICBsZW4gPSBNYXRoLnNxcnQoeDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyKTtcclxuICBpZiAoIWxlbikge1xyXG4gICAgeDAgPSAwO1xyXG4gICAgeDEgPSAwO1xyXG4gICAgeDIgPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW4gPSAxIC8gbGVuO1xyXG4gICAgeDAgKj0gbGVuO1xyXG4gICAgeDEgKj0gbGVuO1xyXG4gICAgeDIgKj0gbGVuO1xyXG4gIH1cclxuXHJcbiAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcclxuICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xyXG4gIHkyID0gejAgKiB4MSAtIHoxICogeDA7XHJcblxyXG4gIGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpO1xyXG4gIGlmICghbGVuKSB7XHJcbiAgICB5MCA9IDA7XHJcbiAgICB5MSA9IDA7XHJcbiAgICB5MiA9IDA7XHJcbiAgfSBlbHNlIHtcclxuICAgIGxlbiA9IDEgLyBsZW47XHJcbiAgICB5MCAqPSBsZW47XHJcbiAgICB5MSAqPSBsZW47XHJcbiAgICB5MiAqPSBsZW47XHJcbiAgfVxyXG5cclxuICBvdXRbMF0gPSB4MDtcclxuICBvdXRbMV0gPSB5MDtcclxuICBvdXRbMl0gPSB6MDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IHgxO1xyXG4gIG91dFs1XSA9IHkxO1xyXG4gIG91dFs2XSA9IHoxO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0geDI7XHJcbiAgb3V0WzldID0geTI7XHJcbiAgb3V0WzEwXSA9IHoyO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XHJcbiAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcclxuICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xyXG4gIG91dFsxNV0gPSAxO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgbWF0cml4IHRoYXQgbWFrZXMgc29tZXRoaW5nIGxvb2sgYXQgc29tZXRoaW5nIGVsc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xyXG4gIGxldCBleWV4ID0gZXllWzBdLFxyXG4gICAgICBleWV5ID0gZXllWzFdLFxyXG4gICAgICBleWV6ID0gZXllWzJdLFxyXG4gICAgICB1cHggPSB1cFswXSxcclxuICAgICAgdXB5ID0gdXBbMV0sXHJcbiAgICAgIHVweiA9IHVwWzJdO1xyXG5cclxuICBsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxyXG4gICAgICB6MSA9IGV5ZXkgLSB0YXJnZXRbMV0sXHJcbiAgICAgIHoyID0gZXlleiAtIHRhcmdldFsyXTtcclxuXHJcbiAgbGV0IGxlbiA9IHowKnowICsgejEqejEgKyB6Mip6MjtcclxuICBpZiAobGVuID4gMCkge1xyXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgejAgKj0gbGVuO1xyXG4gICAgejEgKj0gbGVuO1xyXG4gICAgejIgKj0gbGVuO1xyXG4gIH1cclxuXHJcbiAgbGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcclxuICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxyXG4gICAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XHJcblxyXG4gIGxlbiA9IHgwKngwICsgeDEqeDEgKyB4Mip4MjtcclxuICBpZiAobGVuID4gMCkge1xyXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgeDAgKj0gbGVuO1xyXG4gICAgeDEgKj0gbGVuO1xyXG4gICAgeDIgKj0gbGVuO1xyXG4gIH1cclxuXHJcbiAgb3V0WzBdID0geDA7XHJcbiAgb3V0WzFdID0geDE7XHJcbiAgb3V0WzJdID0geDI7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcclxuICBvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MjtcclxuICBvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IHowO1xyXG4gIG91dFs5XSA9IHoxO1xyXG4gIG91dFsxMF0gPSB6MjtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gZXlleDtcclxuICBvdXRbMTNdID0gZXlleTtcclxuICBvdXRbMTRdID0gZXllejtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcclxuICAgICAgICAgIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICtcclxuICAgICAgICAgIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgK1xyXG4gICAgICAgICAgYVsxMl0gKyAnLCAnICsgYVsxM10gKyAnLCAnICsgYVsxNF0gKyAnLCAnICsgYVsxNV0gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcclxuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSArIE1hdGgucG93KGFbOV0sIDIpICsgTWF0aC5wb3coYVsxMF0sIDIpICsgTWF0aC5wb3coYVsxMV0sIDIpICsgTWF0aC5wb3coYVsxMl0sIDIpICsgTWF0aC5wb3coYVsxM10sIDIpICsgTWF0aC5wb3coYVsxNF0sIDIpICsgTWF0aC5wb3coYVsxNV0sIDIpICkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQ0J3NcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICsgYlszXTtcclxuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcclxuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcclxuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcclxuICBvdXRbN10gPSBhWzddICsgYls3XTtcclxuICBvdXRbOF0gPSBhWzhdICsgYls4XTtcclxuICBvdXRbOV0gPSBhWzldICsgYls5XTtcclxuICBvdXRbMTBdID0gYVsxMF0gKyBiWzEwXTtcclxuICBvdXRbMTFdID0gYVsxMV0gKyBiWzExXTtcclxuICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXTtcclxuICBvdXRbMTNdID0gYVsxM10gKyBiWzEzXTtcclxuICBvdXRbMTRdID0gYVsxNF0gKyBiWzE0XTtcclxuICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xyXG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xyXG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xyXG4gIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xyXG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xyXG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xyXG4gIG91dFs5XSA9IGFbOV0gLSBiWzldO1xyXG4gIG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdO1xyXG4gIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xyXG4gIG91dFsxMl0gPSBhWzEyXSAtIGJbMTJdO1xyXG4gIG91dFsxM10gPSBhWzEzXSAtIGJbMTNdO1xyXG4gIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xyXG4gIG91dFsxNV0gPSBhWzE1XSAtIGJbMTVdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgb3V0WzRdID0gYVs0XSAqIGI7XHJcbiAgb3V0WzVdID0gYVs1XSAqIGI7XHJcbiAgb3V0WzZdID0gYVs2XSAqIGI7XHJcbiAgb3V0WzddID0gYVs3XSAqIGI7XHJcbiAgb3V0WzhdID0gYVs4XSAqIGI7XHJcbiAgb3V0WzldID0gYVs5XSAqIGI7XHJcbiAgb3V0WzEwXSA9IGFbMTBdICogYjtcclxuICBvdXRbMTFdID0gYVsxMV0gKiBiO1xyXG4gIG91dFsxMl0gPSBhWzEyXSAqIGI7XHJcbiAgb3V0WzEzXSA9IGFbMTNdICogYjtcclxuICBvdXRbMTRdID0gYVsxNF0gKiBiO1xyXG4gIG91dFsxNV0gPSBhWzE1XSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcclxuICBvdXRbNF0gPSBhWzRdICsgKGJbNF0gKiBzY2FsZSk7XHJcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xyXG4gIG91dFs2XSA9IGFbNl0gKyAoYls2XSAqIHNjYWxlKTtcclxuICBvdXRbN10gPSBhWzddICsgKGJbN10gKiBzY2FsZSk7XHJcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xyXG4gIG91dFs5XSA9IGFbOV0gKyAoYls5XSAqIHNjYWxlKTtcclxuICBvdXRbMTBdID0gYVsxMF0gKyAoYlsxMF0gKiBzY2FsZSk7XHJcbiAgb3V0WzExXSA9IGFbMTFdICsgKGJbMTFdICogc2NhbGUpO1xyXG4gIG91dFsxMl0gPSBhWzEyXSArIChiWzEyXSAqIHNjYWxlKTtcclxuICBvdXRbMTNdID0gYVsxM10gKyAoYlsxM10gKiBzY2FsZSk7XHJcbiAgb3V0WzE0XSA9IGFbMTRdICsgKGJbMTRdICogc2NhbGUpO1xyXG4gIG91dFsxNV0gPSBhWzE1XSArIChiWzE1XSAqIHNjYWxlKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmXHJcbiAgICAgICAgIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XSAmJiBhWzZdID09PSBiWzZdICYmIGFbN10gPT09IGJbN10gJiZcclxuICAgICAgICAgYVs4XSA9PT0gYls4XSAmJiBhWzldID09PSBiWzldICYmIGFbMTBdID09PSBiWzEwXSAmJiBhWzExXSA9PT0gYlsxMV0gJiZcclxuICAgICAgICAgYVsxMl0gPT09IGJbMTJdICYmIGFbMTNdID09PSBiWzEzXSAmJiBhWzE0XSA9PT0gYlsxNF0gJiYgYVsxNV0gPT09IGJbMTVdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgID0gYVswXSwgIGExICA9IGFbMV0sICBhMiAgPSBhWzJdLCAgYTMgID0gYVszXTtcclxuICBsZXQgYTQgID0gYVs0XSwgIGE1ICA9IGFbNV0sICBhNiAgPSBhWzZdLCAgYTcgID0gYVs3XTtcclxuICBsZXQgYTggID0gYVs4XSwgIGE5ICA9IGFbOV0sICBhMTAgPSBhWzEwXSwgYTExID0gYVsxMV07XHJcbiAgbGV0IGExMiA9IGFbMTJdLCBhMTMgPSBhWzEzXSwgYTE0ID0gYVsxNF0sIGExNSA9IGFbMTVdO1xyXG5cclxuICBsZXQgYjAgID0gYlswXSwgIGIxICA9IGJbMV0sICBiMiAgPSBiWzJdLCAgYjMgID0gYlszXTtcclxuICBsZXQgYjQgID0gYls0XSwgIGI1ICA9IGJbNV0sICBiNiAgPSBiWzZdLCAgYjcgID0gYls3XTtcclxuICBsZXQgYjggID0gYls4XSwgIGI5ICA9IGJbOV0sICBiMTAgPSBiWzEwXSwgYjExID0gYlsxMV07XHJcbiAgbGV0IGIxMiA9IGJbMTJdLCBiMTMgPSBiWzEzXSwgYjE0ID0gYlsxNF0sIGIxNSA9IGJbMTVdO1xyXG5cclxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE3IC0gYjcpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE4IC0gYjgpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE5IC0gYjkpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOSksIE1hdGguYWJzKGI5KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExMCAtIGIxMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMCksIE1hdGguYWJzKGIxMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMTEgLSBiMTEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTEpLCBNYXRoLmFicyhiMTEpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTEyIC0gYjEyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEyKSwgTWF0aC5hYnMoYjEyKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExMyAtIGIxMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMyksIE1hdGguYWJzKGIxMykpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMTQgLSBiMTQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTQpLCBNYXRoLmFicyhiMTQpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTE1IC0gYjE1KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE1KSwgTWF0aC5hYnMoYjE1KSkpO1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XHJcblxyXG4vKipcclxuICogMyBEaW1lbnNpb25hbCBWZWN0b3JcclxuICogQG1vZHVsZSB2ZWMzXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcclxuICpcclxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XHJcbiAgb3V0WzBdID0gMDtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XHJcbiAgbGV0IHggPSBhWzBdO1xyXG4gIGxldCB5ID0gYVsxXTtcclxuICBsZXQgeiA9IGFbMl07XHJcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xyXG4gIG91dFswXSA9IHg7XHJcbiAgb3V0WzFdID0geTtcclxuICBvdXRbMl0gPSB6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XHJcbiAgb3V0WzBdID0geDtcclxuICBvdXRbMV0gPSB5O1xyXG4gIG91dFsyXSA9IHo7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBmbG9vclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICBvdXRbMl0gPSBhWzJdICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcclxuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xyXG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XHJcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xyXG4gIGxldCB4ID0gYlswXSAtIGFbMF07XHJcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcclxuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xyXG4gIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xyXG4gIGxldCB4ID0gYVswXTtcclxuICBsZXQgeSA9IGFbMV07XHJcbiAgbGV0IHogPSBhWzJdO1xyXG4gIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xyXG4gIG91dFswXSA9IC1hWzBdO1xyXG4gIG91dFsxXSA9IC1hWzFdO1xyXG4gIG91dFsyXSA9IC1hWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xyXG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XHJcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTm9ybWFsaXplIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xyXG4gIGxldCB4ID0gYVswXTtcclxuICBsZXQgeSA9IGFbMV07XHJcbiAgbGV0IHogPSBhWzJdO1xyXG4gIGxldCBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XHJcbiAgaWYgKGxlbiA+IDApIHtcclxuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XHJcbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xyXG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcclxuICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XHJcbiAgfVxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xyXG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcclxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXTtcclxuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXTtcclxuXHJcbiAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XHJcbiAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XHJcbiAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XHJcbiAgbGV0IGF4ID0gYVswXTtcclxuICBsZXQgYXkgPSBhWzFdO1xyXG4gIGxldCBheiA9IGFbMl07XHJcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XHJcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XHJcbiAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgaGVybWl0ZSBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcbiAgbGV0IGZhY3RvclRpbWVzMiA9IHQgKiB0O1xyXG4gIGxldCBmYWN0b3IxID0gZmFjdG9yVGltZXMyICogKDIgKiB0IC0gMykgKyAxO1xyXG4gIGxldCBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHQ7XHJcbiAgbGV0IGZhY3RvcjMgPSBmYWN0b3JUaW1lczIgKiAodCAtIDEpO1xyXG4gIGxldCBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogKDMgLSAyICogdCk7XHJcblxyXG4gIG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0O1xyXG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xyXG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUGVyZm9ybXMgYSBiZXppZXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcbiAgbGV0IGludmVyc2VGYWN0b3IgPSAxIC0gdDtcclxuICBsZXQgaW52ZXJzZUZhY3RvclRpbWVzVHdvID0gaW52ZXJzZUZhY3RvciAqIGludmVyc2VGYWN0b3I7XHJcbiAgbGV0IGZhY3RvclRpbWVzMiA9IHQgKiB0O1xyXG4gIGxldCBmYWN0b3IxID0gaW52ZXJzZUZhY3RvclRpbWVzVHdvICogaW52ZXJzZUZhY3RvcjtcclxuICBsZXQgZmFjdG9yMiA9IDMgKiB0ICogaW52ZXJzZUZhY3RvclRpbWVzVHdvO1xyXG4gIGxldCBmYWN0b3IzID0gMyAqIGZhY3RvclRpbWVzMiAqIGludmVyc2VGYWN0b3I7XHJcbiAgbGV0IGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiB0O1xyXG5cclxuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcclxuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcclxuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xyXG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xyXG5cclxuICBsZXQgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcclxuICBsZXQgeiA9IChnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCkgLSAxLjA7XHJcbiAgbGV0IHpTY2FsZSA9IE1hdGguc3FydCgxLjAteip6KSAqIHNjYWxlO1xyXG5cclxuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZTtcclxuICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTtcclxuICBvdXRbMl0gPSB6ICogc2NhbGU7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXHJcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xyXG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xyXG4gIGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xyXG4gIHcgPSB3IHx8IDEuMDtcclxuICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcclxuICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gdztcclxuICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XHJcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XHJcbiAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xyXG4gIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcclxuICBvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcclxuICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xyXG4gICAgLy8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXHJcbiAgICBsZXQgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdO1xyXG4gICAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XHJcbiAgICAvLyB2YXIgcXZlYyA9IFtxeCwgcXksIHF6XTtcclxuICAgIC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xyXG4gICAgbGV0IHV2eCA9IHF5ICogeiAtIHF6ICogeSxcclxuICAgICAgICB1dnkgPSBxeiAqIHggLSBxeCAqIHosXHJcbiAgICAgICAgdXZ6ID0gcXggKiB5IC0gcXkgKiB4O1xyXG4gICAgLy8gdmFyIHV1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIHV2KTtcclxuICAgIGxldCB1dXZ4ID0gcXkgKiB1dnogLSBxeiAqIHV2eSxcclxuICAgICAgICB1dXZ5ID0gcXogKiB1dnggLSBxeCAqIHV2eixcclxuICAgICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDtcclxuICAgIC8vIHZlYzMuc2NhbGUodXYsIHV2LCAyICogdyk7XHJcbiAgICBsZXQgdzIgPSBxdyAqIDI7XHJcbiAgICB1dnggKj0gdzI7XHJcbiAgICB1dnkgKj0gdzI7XHJcbiAgICB1dnogKj0gdzI7XHJcbiAgICAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcclxuICAgIHV1dnggKj0gMjtcclxuICAgIHV1dnkgKj0gMjtcclxuICAgIHV1dnogKj0gMjtcclxuICAgIC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xyXG4gICAgb3V0WzBdID0geCArIHV2eCArIHV1dng7XHJcbiAgICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcclxuICAgIG91dFsyXSA9IHogKyB1dnogKyB1dXZ6O1xyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgYiwgYyl7XHJcbiAgbGV0IHAgPSBbXSwgcj1bXTtcclxuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBwWzJdID0gYVsyXSAtIGJbMl07XHJcblxyXG4gIC8vcGVyZm9ybSByb3RhdGlvblxyXG4gIHJbMF0gPSBwWzBdO1xyXG4gIHJbMV0gPSBwWzFdKk1hdGguY29zKGMpIC0gcFsyXSpNYXRoLnNpbihjKTtcclxuICByWzJdID0gcFsxXSpNYXRoLnNpbihjKSArIHBbMl0qTWF0aC5jb3MoYyk7XHJcblxyXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgYiwgYyl7XHJcbiAgbGV0IHAgPSBbXSwgcj1bXTtcclxuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBwWzJdID0gYVsyXSAtIGJbMl07XHJcblxyXG4gIC8vcGVyZm9ybSByb3RhdGlvblxyXG4gIHJbMF0gPSBwWzJdKk1hdGguc2luKGMpICsgcFswXSpNYXRoLmNvcyhjKTtcclxuICByWzFdID0gcFsxXTtcclxuICByWzJdID0gcFsyXSpNYXRoLmNvcyhjKSAtIHBbMF0qTWF0aC5zaW4oYyk7XHJcblxyXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgYiwgYyl7XHJcbiAgbGV0IHAgPSBbXSwgcj1bXTtcclxuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBwWzJdID0gYVsyXSAtIGJbMl07XHJcblxyXG4gIC8vcGVyZm9ybSByb3RhdGlvblxyXG4gIHJbMF0gPSBwWzBdKk1hdGguY29zKGMpIC0gcFsxXSpNYXRoLnNpbihjKTtcclxuICByWzFdID0gcFswXSpNYXRoLnNpbihjKSArIHBbMV0qTWF0aC5jb3MoYyk7XHJcbiAgclsyXSA9IHBbMl07XHJcblxyXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcclxuICBsZXQgdGVtcEEgPSBmcm9tVmFsdWVzKGFbMF0sIGFbMV0sIGFbMl0pO1xyXG4gIGxldCB0ZW1wQiA9IGZyb21WYWx1ZXMoYlswXSwgYlsxXSwgYlsyXSk7XHJcblxyXG4gIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpO1xyXG4gIG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpO1xyXG5cclxuICBsZXQgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XHJcblxyXG4gIGlmKGNvc2luZSA+IDEuMCkge1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG4gIGVsc2UgaWYoY29zaW5lIDwgLTEuMCkge1xyXG4gICAgcmV0dXJuIE1hdGguUEk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ3ZlYzMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXTtcclxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkpO1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXZpZGV9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRpdiA9IGRpdmlkZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRpc3QgPSBkaXN0YW5jZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuICogQHJldHVybnMge0FycmF5fSBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHZlYyA9IGNyZWF0ZSgpO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XHJcbiAgICBsZXQgaSwgbDtcclxuICAgIGlmKCFzdHJpZGUpIHtcclxuICAgICAgc3RyaWRlID0gMztcclxuICAgIH1cclxuXHJcbiAgICBpZighb2Zmc2V0KSB7XHJcbiAgICAgIG9mZnNldCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoY291bnQpIHtcclxuICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGwgPSBhLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XHJcbiAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdO1xyXG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcclxuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfTtcclxufSkoKTtcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIDQgRGltZW5zaW9uYWwgVmVjdG9yXHJcbiAqIEBtb2R1bGUgdmVjNFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XHJcbiAqXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG4gIG91dFswXSA9IDA7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeiwgdykge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSB4O1xyXG4gIG91dFsxXSA9IHk7XHJcbiAgb3V0WzJdID0gejtcclxuICBvdXRbM10gPSB3O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjNCB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHosIHcpIHtcclxuICBvdXRbMF0gPSB4O1xyXG4gIG91dFsxXSA9IHk7XHJcbiAgb3V0WzJdID0gejtcclxuICBvdXRbM10gPSB3O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICsgYlszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gKiBiWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC8gYlszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNlaWxcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XHJcbiAgb3V0WzNdID0gTWF0aC5jZWlsKGFbM10pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGZsb29yXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcclxuICBvdXRbM10gPSBNYXRoLmZsb29yKGFbM10pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcclxuICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XHJcbiAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcm91bmRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pO1xyXG4gIG91dFszXSA9IE1hdGgucm91bmQoYVszXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICBvdXRbMl0gPSBhWzJdICogYjtcclxuICBvdXRbM10gPSBhWzNdICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XHJcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcclxuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xyXG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XHJcbiAgbGV0IHcgPSBiWzNdIC0gYVszXTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xyXG4gIGxldCB4ID0gYlswXSAtIGFbMF07XHJcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcclxuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xyXG4gIGxldCB3ID0gYlszXSAtIGFbM107XHJcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIGxldCB6ID0gYVsyXTtcclxuICBsZXQgdyA9IGFbM107XHJcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIGxldCB6ID0gYVsyXTtcclxuICBsZXQgdyA9IGFbM107XHJcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcclxufVxyXG5cclxuLyoqXHJcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gLWFbMF07XHJcbiAgb3V0WzFdID0gLWFbMV07XHJcbiAgb3V0WzJdID0gLWFbMl07XHJcbiAgb3V0WzNdID0gLWFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xyXG4gIG91dFswXSA9IDEuMCAvIGFbMF07XHJcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcclxuICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xyXG4gIG91dFszXSA9IDEuMCAvIGFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIGxldCB6ID0gYVsyXTtcclxuICBsZXQgdyA9IGFbM107XHJcbiAgbGV0IGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcclxuICBpZiAobGVuID4gMCkge1xyXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgb3V0WzBdID0geCAqIGxlbjtcclxuICAgIG91dFsxXSA9IHkgKiBsZW47XHJcbiAgICBvdXRbMl0gPSB6ICogbGVuO1xyXG4gICAgb3V0WzNdID0gdyAqIGxlbjtcclxuICB9XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XHJcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXSArIGFbM10gKiBiWzNdO1xyXG59XHJcblxyXG4vKipcclxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcclxuICBsZXQgYXggPSBhWzBdO1xyXG4gIGxldCBheSA9IGFbMV07XHJcbiAgbGV0IGF6ID0gYVsyXTtcclxuICBsZXQgYXcgPSBhWzNdO1xyXG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xyXG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xyXG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xyXG4gIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgdmVjdG9yU2NhbGUpIHtcclxuICB2ZWN0b3JTY2FsZSA9IHZlY3RvclNjYWxlIHx8IDEuMDtcclxuXHJcbiAgLy9UT0RPOiBUaGlzIGlzIGEgcHJldHR5IGF3ZnVsIHdheSBvZiBkb2luZyB0aGlzLiBGaW5kIHNvbWV0aGluZyBiZXR0ZXIuXHJcbiAgb3V0WzBdID0gZ2xNYXRyaXguUkFORE9NKCk7XHJcbiAgb3V0WzFdID0gZ2xNYXRyaXguUkFORE9NKCk7XHJcbiAgb3V0WzJdID0gZ2xNYXRyaXguUkFORE9NKCk7XHJcbiAgb3V0WzNdID0gZ2xNYXRyaXguUkFORE9NKCk7XHJcbiAgbm9ybWFsaXplKG91dCwgb3V0KTtcclxuICBzY2FsZShvdXQsIG91dCwgdmVjdG9yU2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBtYXQ0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XHJcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xyXG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcclxuICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xyXG4gIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xyXG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xyXG4gIGxldCBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM107XHJcblxyXG4gIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXHJcbiAgbGV0IGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xyXG4gIGxldCBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcclxuICBsZXQgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHg7XHJcbiAgbGV0IGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcclxuXHJcbiAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxyXG4gIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XHJcbiAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcclxuICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xyXG4gIHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XHJcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xyXG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGl2aWRlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XHJcblxyXG4vKipcclxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjNHMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xyXG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG4gICAgbGV0IGksIGw7XHJcbiAgICBpZighc3RyaWRlKSB7XHJcbiAgICAgIHN0cmlkZSA9IDQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIW9mZnNldCkge1xyXG4gICAgICBvZmZzZXQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGNvdW50KSB7XHJcbiAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsID0gYS5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG4gICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTsgdmVjWzNdID0gYVtpKzNdO1xyXG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcclxuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07IGFbaSszXSA9IHZlY1szXTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYTtcclxuICB9O1xyXG59KSgpO1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCJcclxuaW1wb3J0ICogYXMgbWF0MyBmcm9tIFwiLi9tYXQzLmpzXCJcclxuaW1wb3J0ICogYXMgdmVjMyBmcm9tIFwiLi92ZWMzLmpzXCJcclxuaW1wb3J0ICogYXMgdmVjNCBmcm9tIFwiLi92ZWM0LmpzXCJcclxuXHJcbi8qKlxyXG4gKiBRdWF0ZXJuaW9uXHJcbiAqIEBtb2R1bGUgcXVhdFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcclxuICpcclxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG4gIG91dFswXSA9IDA7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcclxuICogdGhlbiByZXR1cm5zIGl0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xyXG4gIHJhZCA9IHJhZCAqIDAuNTtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgb3V0WzBdID0gcyAqIGF4aXNbMF07XHJcbiAgb3V0WzFdID0gcyAqIGF4aXNbMV07XHJcbiAgb3V0WzJdID0gcyAqIGF4aXNbMl07XHJcbiAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgcm90YXRpb24gYXhpcyBhbmQgYW5nbGUgZm9yIGEgZ2l2ZW5cclxuICogIHF1YXRlcm5pb24uIElmIGEgcXVhdGVybmlvbiBpcyBjcmVhdGVkIHdpdGhcclxuICogIHNldEF4aXNBbmdsZSwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdGhlIHNhbWVcclxuICogIHZhbHVlcyBhcyBwcm92aWRpZWQgaW4gdGhlIG9yaWdpbmFsIHBhcmFtZXRlciBsaXN0XHJcbiAqICBPUiBmdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB2YWx1ZXMuXHJcbiAqIEV4YW1wbGU6IFRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieSBheGlzIFswLCAwLCAxXSBhbmRcclxuICogIGFuZ2xlIC05MCBpcyB0aGUgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBmb3JtZWQgYnlcclxuICogIFswLCAwLCAxXSBhbmQgMjcwLiBUaGlzIG1ldGhvZCBmYXZvcnMgdGhlIGxhdHRlci5cclxuICogQHBhcmFtICB7dmVjM30gb3V0X2F4aXMgIFZlY3RvciByZWNlaXZpbmcgdGhlIGF4aXMgb2Ygcm90YXRpb25cclxuICogQHBhcmFtICB7cXVhdH0gcSAgICAgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgIEFuZ2xlLCBpbiByYWRpYW5zLCBvZiB0aGUgcm90YXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRBeGlzQW5nbGUob3V0X2F4aXMsIHEpIHtcclxuICBsZXQgcmFkID0gTWF0aC5hY29zKHFbM10pICogMi4wO1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkIC8gMi4wKTtcclxuICBpZiAocyAhPSAwLjApIHtcclxuICAgIG91dF9heGlzWzBdID0gcVswXSAvIHM7XHJcbiAgICBvdXRfYXhpc1sxXSA9IHFbMV0gLyBzO1xyXG4gICAgb3V0X2F4aXNbMl0gPSBxWzJdIC8gcztcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gSWYgcyBpcyB6ZXJvLCByZXR1cm4gYW55IGF4aXMgKG5vIHJvdGF0aW9uIC0gYXhpcyBkb2VzIG5vdCBtYXR0ZXIpXHJcbiAgICBvdXRfYXhpc1swXSA9IDE7XHJcbiAgICBvdXRfYXhpc1sxXSA9IDA7XHJcbiAgICBvdXRfYXhpc1syXSA9IDA7XHJcbiAgfVxyXG4gIHJldHVybiByYWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xyXG4gIGxldCBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XHJcblxyXG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XHJcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcclxuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xyXG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xyXG4gIHJhZCAqPSAwLjU7XHJcblxyXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XHJcbiAgbGV0IGJ4ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcclxuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcclxuICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcclxuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XHJcbiAgcmFkICo9IDAuNTtcclxuXHJcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcclxuICBsZXQgYnkgPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XHJcblxyXG4gIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xyXG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xyXG4gIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xyXG4gIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcclxuICByYWQgKj0gMC41O1xyXG5cclxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xyXG4gIGxldCBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XHJcbiAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XHJcbiAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XHJcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxyXG4gKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxyXG4gKiBBbnkgZXhpc3RpbmcgVyBjb21wb25lbnQgd2lsbCBiZSBpZ25vcmVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIFcgY29tcG9uZW50IG9mXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVXKG91dCwgYSkge1xyXG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xyXG5cclxuICBvdXRbMF0gPSB4O1xyXG4gIG91dFsxXSA9IHk7XHJcbiAgb3V0WzJdID0gejtcclxuICBvdXRbM10gPSBNYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xyXG4gIC8vIGJlbmNobWFya3M6XHJcbiAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcclxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xyXG4gIGxldCBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XHJcblxyXG4gIGxldCBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcclxuXHJcbiAgLy8gY2FsYyBjb3NpbmVcclxuICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XHJcbiAgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXHJcbiAgaWYgKCBjb3NvbSA8IDAuMCApIHtcclxuICAgIGNvc29tID0gLWNvc29tO1xyXG4gICAgYnggPSAtIGJ4O1xyXG4gICAgYnkgPSAtIGJ5O1xyXG4gICAgYnogPSAtIGJ6O1xyXG4gICAgYncgPSAtIGJ3O1xyXG4gIH1cclxuICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXHJcbiAgaWYgKCAoMS4wIC0gY29zb20pID4gMC4wMDAwMDEgKSB7XHJcbiAgICAvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcclxuICAgIG9tZWdhICA9IE1hdGguYWNvcyhjb3NvbSk7XHJcbiAgICBzaW5vbSAgPSBNYXRoLnNpbihvbWVnYSk7XHJcbiAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcclxuICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxyXG4gICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxyXG4gICAgc2NhbGUwID0gMS4wIC0gdDtcclxuICAgIHNjYWxlMSA9IHQ7XHJcbiAgfVxyXG4gIC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcclxuICBvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4O1xyXG4gIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XHJcbiAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcclxuICBvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcclxuICBsZXQgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTM7XHJcbiAgbGV0IGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xyXG5cclxuICAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxyXG5cclxuICBvdXRbMF0gPSAtYTAqaW52RG90O1xyXG4gIG91dFsxXSA9IC1hMSppbnZEb3Q7XHJcbiAgb3V0WzJdID0gLWEyKmludkRvdDtcclxuICBvdXRbM10gPSBhMyppbnZEb3Q7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcclxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAtYVswXTtcclxuICBvdXRbMV0gPSAtYVsxXTtcclxuICBvdXRbMl0gPSAtYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxyXG4gKlxyXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxyXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XHJcbiAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcclxuICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cclxuICBsZXQgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xyXG4gIGxldCBmUm9vdDtcclxuXHJcbiAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XHJcbiAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXHJcbiAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcclxuICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xyXG4gICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcclxuICAgIG91dFswXSA9IChtWzVdLW1bN10pKmZSb290O1xyXG4gICAgb3V0WzFdID0gKG1bNl0tbVsyXSkqZlJvb3Q7XHJcbiAgICBvdXRbMl0gPSAobVsxXS1tWzNdKSpmUm9vdDtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gfHd8IDw9IDEvMlxyXG4gICAgbGV0IGkgPSAwO1xyXG4gICAgaWYgKCBtWzRdID4gbVswXSApXHJcbiAgICAgIGkgPSAxO1xyXG4gICAgaWYgKCBtWzhdID4gbVtpKjMraV0gKVxyXG4gICAgICBpID0gMjtcclxuICAgIGxldCBqID0gKGkrMSklMztcclxuICAgIGxldCBrID0gKGkrMiklMztcclxuXHJcbiAgICBmUm9vdCA9IE1hdGguc3FydChtW2kqMytpXS1tW2oqMytqXS1tW2sqMytrXSArIDEuMCk7XHJcbiAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcclxuICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XHJcbiAgICBvdXRbM10gPSAobVtqKjMra10gLSBtW2sqMytqXSkgKiBmUm9vdDtcclxuICAgIG91dFtqXSA9IChtW2oqMytpXSArIG1baSozK2pdKSAqIGZSb290O1xyXG4gICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gZXVsZXIgYW5nbGUgeCwgeSwgei5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7eH0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBYIGF4aXMgaW4gZGVncmVlcy5cclxuICogQHBhcmFtIHt5fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFkgYXhpcyBpbiBkZWdyZWVzLlxyXG4gKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbUV1bGVyKG91dCwgeCwgeSwgeikge1xyXG4gICAgbGV0IGhhbGZUb1JhZCA9IDAuNSAqIE1hdGguUEkgLyAxODAuMDtcclxuICAgIHggKj0gaGFsZlRvUmFkO1xyXG4gICAgeSAqPSBoYWxmVG9SYWQ7XHJcbiAgICB6ICo9IGhhbGZUb1JhZDtcclxuXHJcbiAgICBsZXQgc3ggPSBNYXRoLnNpbih4KTtcclxuICAgIGxldCBjeCA9IE1hdGguY29zKHgpO1xyXG4gICAgbGV0IHN5ID0gTWF0aC5zaW4oeSk7XHJcbiAgICBsZXQgY3kgPSBNYXRoLmNvcyh5KTtcclxuICAgIGxldCBzeiA9IE1hdGguc2luKHopO1xyXG4gICAgbGV0IGN6ID0gTWF0aC5jb3Moeik7XHJcblxyXG4gICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xyXG4gICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xyXG4gICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xyXG4gICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGNsb25lID0gdmVjNC5jbG9uZTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGNvcHkgPSB2ZWM0LmNvcHk7XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNldCA9IHZlYzQuc2V0O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHF1YXQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBhZGQgPSB2ZWM0LmFkZDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc2NhbGUgPSB2ZWM0LnNjYWxlO1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkb3QgPSB2ZWM0LmRvdDtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxlcnAgPSB2ZWM0LmxlcnA7XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW5ndGggPSB2ZWM0Lmxlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxpemUgYSBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgcXVhdGVybmlvbi5cclxuICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgcXVhdGVybmlvbi5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZXhhY3RFcXVhbHMgPSB2ZWM0LmV4YWN0RXF1YWxzO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHF1YXRlcm5pb25zIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZXF1YWxzID0gdmVjNC5lcXVhbHM7XHJcblxyXG4vKipcclxuICogU2V0cyBhIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IHRoZSBzaG9ydGVzdCByb3RhdGlvbiBmcm9tIG9uZVxyXG4gKiB2ZWN0b3IgdG8gYW5vdGhlci5cclxuICpcclxuICogQm90aCB2ZWN0b3JzIGFyZSBhc3N1bWVkIHRvIGJlIHVuaXQgbGVuZ3RoLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHJvdGF0aW9uVG8gPSAoZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHRtcHZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xyXG4gIGxldCB4VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMSwwLDApO1xyXG4gIGxldCB5VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMCwxLDApO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XHJcbiAgICBsZXQgZG90ID0gdmVjMy5kb3QoYSwgYik7XHJcbiAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XHJcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeFVuaXRWZWMzLCBhKTtcclxuICAgICAgaWYgKHZlYzMubGVuKHRtcHZlYzMpIDwgMC4wMDAwMDEpXHJcbiAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xyXG4gICAgICB2ZWMzLm5vcm1hbGl6ZSh0bXB2ZWMzLCB0bXB2ZWMzKTtcclxuICAgICAgc2V0QXhpc0FuZ2xlKG91dCwgdG1wdmVjMywgTWF0aC5QSSk7XHJcbiAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9IGVsc2UgaWYgKGRvdCA+IDAuOTk5OTk5KSB7XHJcbiAgICAgIG91dFswXSA9IDA7XHJcbiAgICAgIG91dFsxXSA9IDA7XHJcbiAgICAgIG91dFsyXSA9IDA7XHJcbiAgICAgIG91dFszXSA9IDE7XHJcbiAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIGEsIGIpO1xyXG4gICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xyXG4gICAgICBvdXRbMV0gPSB0bXB2ZWMzWzFdO1xyXG4gICAgICBvdXRbMl0gPSB0bXB2ZWMzWzJdO1xyXG4gICAgICBvdXRbM10gPSAxICsgZG90O1xyXG4gICAgICByZXR1cm4gbm9ybWFsaXplKG91dCwgb3V0KTtcclxuICAgIH1cclxuICB9O1xyXG59KSgpO1xyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FsZXJwID0gKGZ1bmN0aW9uICgpIHtcclxuICBsZXQgdGVtcDEgPSBjcmVhdGUoKTtcclxuICBsZXQgdGVtcDIgPSBjcmVhdGUoKTtcclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uIChvdXQsIGEsIGIsIGMsIGQsIHQpIHtcclxuICAgIHNsZXJwKHRlbXAxLCBhLCBkLCB0KTtcclxuICAgIHNsZXJwKHRlbXAyLCBiLCBjLCB0KTtcclxuICAgIHNsZXJwKG91dCwgdGVtcDEsIHRlbXAyLCAyICogdCAqICgxIC0gdCkpO1xyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfTtcclxufSgpKTtcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxyXG4gKiBheGVzLiBFYWNoIGF4aXMgaXMgYSB2ZWMzIGFuZCBpcyBleHBlY3RlZCB0byBiZSB1bml0IGxlbmd0aCBhbmRcclxuICogcGVycGVuZGljdWxhciB0byBhbGwgb3RoZXIgc3BlY2lmaWVkIGF4ZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gcmlnaHQgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwicmlnaHRcIiBkaXJlY3Rpb25cclxuICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc2V0QXhlcyA9IChmdW5jdGlvbigpIHtcclxuICBsZXQgbWF0ciA9IG1hdDMuY3JlYXRlKCk7XHJcblxyXG4gIHJldHVybiBmdW5jdGlvbihvdXQsIHZpZXcsIHJpZ2h0LCB1cCkge1xyXG4gICAgbWF0clswXSA9IHJpZ2h0WzBdO1xyXG4gICAgbWF0clszXSA9IHJpZ2h0WzFdO1xyXG4gICAgbWF0cls2XSA9IHJpZ2h0WzJdO1xyXG5cclxuICAgIG1hdHJbMV0gPSB1cFswXTtcclxuICAgIG1hdHJbNF0gPSB1cFsxXTtcclxuICAgIG1hdHJbN10gPSB1cFsyXTtcclxuXHJcbiAgICBtYXRyWzJdID0gLXZpZXdbMF07XHJcbiAgICBtYXRyWzVdID0gLXZpZXdbMV07XHJcbiAgICBtYXRyWzhdID0gLXZpZXdbMl07XHJcblxyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIGZyb21NYXQzKG91dCwgbWF0cikpO1xyXG4gIH07XHJcbn0pKCk7XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XHJcbmltcG9ydCAqIGFzIHF1YXQgZnJvbSBcIi4vcXVhdC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBtYXQ0IGZyb20gXCIuL21hdDQuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBEdWFsIFF1YXRlcm5pb248YnI+XHJcbiAqIEZvcm1hdDogW3JlYWwsIGR1YWxdPGJyPlxyXG4gKiBRdWF0ZXJuaW9uIGZvcm1hdDogWFlaVzxicj5cclxuICogTWFrZSBzdXJlIHRvIGhhdmUgbm9ybWFsaXplZCBkdWFsIHF1YXRlcm5pb25zLCBvdGhlcndpc2UgdGhlIGZ1bmN0aW9ucyBtYXkgbm90IHdvcmsgYXMgaW50ZW5kZWQuPGJyPlxyXG4gKiBAbW9kdWxlIHF1YXQyXHJcbiAqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IGR1YWwgcXVhdFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IGEgbmV3IGR1YWwgcXVhdGVybmlvbiBbcmVhbCAtPiByb3RhdGlvbiwgZHVhbCAtPiB0cmFuc2xhdGlvbl1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IGRxID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOCk7XHJcbiAgZHFbMF0gPSAwO1xyXG4gIGRxWzFdID0gMDtcclxuICBkcVsyXSA9IDA7XHJcbiAgZHFbM10gPSAxO1xyXG4gIGRxWzRdID0gMDtcclxuICBkcVs1XSA9IDA7XHJcbiAgZHFbNl0gPSAwO1xyXG4gIGRxWzddID0gMDtcclxuICByZXR1cm4gZHE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgbGV0IGRxID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOCk7XHJcbiAgZHFbMF0gPSBhWzBdO1xyXG4gIGRxWzFdID0gYVsxXTtcclxuICBkcVsyXSA9IGFbMl07XHJcbiAgZHFbM10gPSBhWzNdO1xyXG4gIGRxWzRdID0gYVs0XTtcclxuICBkcVs1XSA9IGFbNV07XHJcbiAgZHFbNl0gPSBhWzZdO1xyXG4gIGRxWzddID0gYVs3XTtcclxuICByZXR1cm4gZHE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6MiwgdzIpIHtcclxuICBsZXQgZHEgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg4KTtcclxuICBkcVswXSA9IHgxO1xyXG4gIGRxWzFdID0geTE7XHJcbiAgZHFbMl0gPSB6MTtcclxuICBkcVszXSA9IHcxO1xyXG4gIGRxWzRdID0geDI7XHJcbiAgZHFbNV0gPSB5MjtcclxuICBkcVs2XSA9IHoyO1xyXG4gIGRxWzddID0gdzI7XHJcbiAgcmV0dXJuIGRxO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gdmFsdWVzIChxdWF0IGFuZCB0cmFuc2xhdGlvbilcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblZhbHVlcyh4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6Mikge1xyXG4gIGxldCBkcSA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDgpO1xyXG4gIGRxWzBdID0geDE7XHJcbiAgZHFbMV0gPSB5MTtcclxuICBkcVsyXSA9IHoxO1xyXG4gIGRxWzNdID0gdzE7XHJcbiAgbGV0IGF4ID0geDIgKiAwLjUsXHJcbiAgICBheSA9IHkyICogMC41LFxyXG4gICAgYXogPSB6MiAqIDAuNTtcclxuICBkcVs0XSA9IGF4ICogdzEgKyBheSAqIHoxIC0gYXogKiB5MTtcclxuICBkcVs1XSA9IGF5ICogdzEgKyBheiAqIHgxIC0gYXggKiB6MTtcclxuICBkcVs2XSA9IGF6ICogdzEgKyBheCAqIHkxIC0gYXkgKiB4MTtcclxuICBkcVs3XSA9IC1heCAqIHgxIC0gYXkgKiB5MSAtIGF6ICogejE7XHJcbiAgcmV0dXJuIGRxO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgcXVhdGVybmlvbiBhbmQgYSB0cmFuc2xhdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB0IHRyYW5sYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgcSwgdCkge1xyXG4gIGxldCBheCA9IHRbMF0gKiAwLjUsXHJcbiAgICBheSA9IHRbMV0gKiAwLjUsXHJcbiAgICBheiA9IHRbMl0gKiAwLjUsXHJcbiAgICBieCA9IHFbMF0sXHJcbiAgICBieSA9IHFbMV0sXHJcbiAgICBieiA9IHFbMl0sXHJcbiAgICBidyA9IHFbM107XHJcbiAgb3V0WzBdID0gYng7XHJcbiAgb3V0WzFdID0gYnk7XHJcbiAgb3V0WzJdID0gYno7XHJcbiAgb3V0WzNdID0gYnc7XHJcbiAgb3V0WzRdID0gYXggKiBidyArIGF5ICogYnogLSBheiAqIGJ5O1xyXG4gIG91dFs1XSA9IGF5ICogYncgKyBheiAqIGJ4IC0gYXggKiBiejtcclxuICBvdXRbNl0gPSBheiAqIGJ3ICsgYXggKiBieSAtIGF5ICogYng7XHJcbiAgb3V0WzddID0gLWF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgdHJhbnNsYXRpb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjM30gdCB0cmFuc2xhdGlvbiB2ZWN0b3JcclxuICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdCkge1xyXG4gIG91dFswXSA9IDA7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDE7XHJcbiAgb3V0WzRdID0gdFswXSAqIDAuNTtcclxuICBvdXRbNV0gPSB0WzFdICogMC41O1xyXG4gIG91dFs2XSA9IHRbMl0gKiAwLjU7XHJcbiAgb3V0WzddID0gMDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBxIHRoZSBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHEpIHtcclxuICBvdXRbMF0gPSBxWzBdO1xyXG4gIG91dFsxXSA9IHFbMV07XHJcbiAgb3V0WzJdID0gcVsyXTtcclxuICBvdXRbM10gPSBxWzNdO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gMDtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgZHVhbCBxdWF0IGZyb20gYSBtYXRyaXggKDR4NClcclxuICogXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xyXG4gIC8vVE9ETyBPcHRpbWl6ZSB0aGlzIFxyXG4gIGxldCBvdXRlciA9IHF1YXQuY3JlYXRlKCk7XHJcbiAgbWF0NC5nZXRSb3RhdGlvbihvdXRlciwgYSk7XHJcbiAgbGV0IHQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcclxuICBtYXQ0LmdldFRyYW5zbGF0aW9uKHQsIGEpO1xyXG4gIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgb3V0ZXIsIHQpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgZHVhbCBxdWF0IHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIHNvdXJjZSBkdWFsIHF1YXRlcm5pb25cclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICBvdXRbNl0gPSBhWzZdO1xyXG4gIG91dFs3XSA9IGFbN107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCBhIGR1YWwgcXVhdCB0byB0aGUgaWRlbnRpdHkgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gMDtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6MiwgdzIpIHtcclxuICBvdXRbMF0gPSB4MTtcclxuICBvdXRbMV0gPSB5MTtcclxuICBvdXRbMl0gPSB6MTtcclxuICBvdXRbM10gPSB3MTtcclxuXHJcbiAgb3V0WzRdID0geDI7XHJcbiAgb3V0WzVdID0geTI7XHJcbiAgb3V0WzZdID0gejI7XHJcbiAgb3V0WzddID0gdzI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHJlYWwgcGFydCBvZiBhIGR1YWwgcXVhdFxyXG4gKiBAcGFyYW0gIHtxdWF0fSBvdXQgcmVhbCBwYXJ0XHJcbiAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG4gKiBAcmV0dXJuIHtxdWF0fSByZWFsIHBhcnRcclxuICovXHJcbmV4cG9ydCBjb25zdCBnZXRSZWFsID0gcXVhdC5jb3B5O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGR1YWwgcGFydCBvZiBhIGR1YWwgcXVhdFxyXG4gKiBAcGFyYW0gIHtxdWF0fSBvdXQgZHVhbCBwYXJ0XHJcbiAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG4gKiBAcmV0dXJuIHtxdWF0fSBkdWFsIHBhcnRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREdWFsKG91dCwgYSkge1xyXG4gIG91dFswXSA9IGFbNF07XHJcbiAgb3V0WzFdID0gYVs1XTtcclxuICBvdXRbMl0gPSBhWzZdO1xyXG4gIG91dFszXSA9IGFbN107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgcmVhbCBjb21wb25lbnQgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcmVhbCBwYXJ0XHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNldFJlYWwgPSBxdWF0LmNvcHk7XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBkdWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSBkdWFsIHBhcnRcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHVhbChvdXQsIHEpIHtcclxuICBvdXRbNF0gPSBxWzBdO1xyXG4gIG91dFs1XSA9IHFbMV07XHJcbiAgb3V0WzZdID0gcVsyXTtcclxuICBvdXRbN10gPSBxWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSB0cmFuc2xhdGlvbiBvZiBhIG5vcm1hbGl6ZWQgZHVhbCBxdWF0XHJcbiAqIEBwYXJhbSAge3ZlYzN9IG91dCB0cmFuc2xhdGlvblxyXG4gKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxyXG4gKiBAcmV0dXJuIHt2ZWMzfSB0cmFuc2xhdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgYSkge1xyXG4gIGxldCBheCA9IGFbNF0sXHJcbiAgICBheSA9IGFbNV0sXHJcbiAgICBheiA9IGFbNl0sXHJcbiAgICBhdyA9IGFbN10sXHJcbiAgICBieCA9IC1hWzBdLFxyXG4gICAgYnkgPSAtYVsxXSxcclxuICAgIGJ6ID0gLWFbMl0sXHJcbiAgICBidyA9IGFbM107XHJcbiAgb3V0WzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMjtcclxuICBvdXRbMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyO1xyXG4gIG91dFsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zbGF0ZXMgYSBkdWFsIHF1YXQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHRyYW5zbGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcclxuICBsZXQgYXgxID0gYVswXSxcclxuICAgIGF5MSA9IGFbMV0sXHJcbiAgICBhejEgPSBhWzJdLFxyXG4gICAgYXcxID0gYVszXSxcclxuICAgIGJ4MSA9IHZbMF0gKiAwLjUsXHJcbiAgICBieTEgPSB2WzFdICogMC41LFxyXG4gICAgYnoxID0gdlsyXSAqIDAuNSxcclxuICAgIGF4MiA9IGFbNF0sXHJcbiAgICBheTIgPSBhWzVdLFxyXG4gICAgYXoyID0gYVs2XSxcclxuICAgIGF3MiA9IGFbN107XHJcbiAgb3V0WzBdID0gYXgxO1xyXG4gIG91dFsxXSA9IGF5MTtcclxuICBvdXRbMl0gPSBhejE7XHJcbiAgb3V0WzNdID0gYXcxO1xyXG4gIG91dFs0XSA9IGF3MSAqIGJ4MSArIGF5MSAqIGJ6MSAtIGF6MSAqIGJ5MSArIGF4MjtcclxuICBvdXRbNV0gPSBhdzEgKiBieTEgKyBhejEgKiBieDEgLSBheDEgKiBiejEgKyBheTI7XHJcbiAgb3V0WzZdID0gYXcxICogYnoxICsgYXgxICogYnkxIC0gYXkxICogYngxICsgYXoyO1xyXG4gIG91dFs3XSA9IC1heDEgKiBieDEgLSBheTEgKiBieTEgLSBhejEgKiBiejEgKyBhdzI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBYIGF4aXNcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IGJ4ID0gLWFbMF0sXHJcbiAgICBieSA9IC1hWzFdLFxyXG4gICAgYnogPSAtYVsyXSxcclxuICAgIGJ3ID0gYVszXSxcclxuICAgIGF4ID0gYVs0XSxcclxuICAgIGF5ID0gYVs1XSxcclxuICAgIGF6ID0gYVs2XSxcclxuICAgIGF3ID0gYVs3XSxcclxuICAgIGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcbiAgICBheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG4gICAgYXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuICAgIGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XHJcbiAgcXVhdC5yb3RhdGVYKG91dCwgYSwgcmFkKTtcclxuICBieCA9IG91dFswXTtcclxuICBieSA9IG91dFsxXTtcclxuICBieiA9IG91dFsyXTtcclxuICBidyA9IG91dFszXTtcclxuICBvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieTtcclxuICBvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBiejtcclxuICBvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieDtcclxuICBvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBiejtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFkgYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcclxuICBsZXQgYnggPSAtYVswXSxcclxuICAgIGJ5ID0gLWFbMV0sXHJcbiAgICBieiA9IC1hWzJdLFxyXG4gICAgYncgPSBhWzNdLFxyXG4gICAgYXggPSBhWzRdLFxyXG4gICAgYXkgPSBhWzVdLFxyXG4gICAgYXogPSBhWzZdLFxyXG4gICAgYXcgPSBhWzddLFxyXG4gICAgYXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuICAgIGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcbiAgICBhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG4gICAgYXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcclxuICBxdWF0LnJvdGF0ZVkob3V0LCBhLCByYWQpO1xyXG4gIGJ4ID0gb3V0WzBdO1xyXG4gIGJ5ID0gb3V0WzFdO1xyXG4gIGJ6ID0gb3V0WzJdO1xyXG4gIGJ3ID0gb3V0WzNdO1xyXG4gIG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5O1xyXG4gIG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6O1xyXG4gIG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4O1xyXG4gIG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWiBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBieCA9IC1hWzBdLFxyXG4gICAgYnkgPSAtYVsxXSxcclxuICAgIGJ6ID0gLWFbMl0sXHJcbiAgICBidyA9IGFbM10sXHJcbiAgICBheCA9IGFbNF0sXHJcbiAgICBheSA9IGFbNV0sXHJcbiAgICBheiA9IGFbNl0sXHJcbiAgICBhdyA9IGFbN10sXHJcbiAgICBheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG4gICAgYXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuICAgIGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcbiAgICBhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xyXG4gIHF1YXQucm90YXRlWihvdXQsIGEsIHJhZCk7XHJcbiAgYnggPSBvdXRbMF07XHJcbiAgYnkgPSBvdXRbMV07XHJcbiAgYnogPSBvdXRbMl07XHJcbiAgYncgPSBvdXRbM107XHJcbiAgb3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnk7XHJcbiAgb3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYno7XHJcbiAgb3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYng7XHJcbiAgb3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYno7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYnkgYSBnaXZlbiBxdWF0ZXJuaW9uIChhICogcSlcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlQnlRdWF0QXBwZW5kKG91dCwgYSwgcSkge1xyXG4gIGxldCBxeCA9IHFbMF0sXHJcbiAgICBxeSA9IHFbMV0sXHJcbiAgICBxeiA9IHFbMl0sXHJcbiAgICBxdyA9IHFbM10sXHJcbiAgICBheCA9IGFbMF0sXHJcbiAgICBheSA9IGFbMV0sXHJcbiAgICBheiA9IGFbMl0sXHJcbiAgICBhdyA9IGFbM107XHJcblxyXG4gIG91dFswXSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXk7XHJcbiAgb3V0WzFdID0gYXkgKiBxdyArIGF3ICogcXkgKyBheiAqIHF4IC0gYXggKiBxejtcclxuICBvdXRbMl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4O1xyXG4gIG91dFszXSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXo7XHJcbiAgYXggPSBhWzRdO1xyXG4gIGF5ID0gYVs1XTtcclxuICBheiA9IGFbNl07XHJcbiAgYXcgPSBhWzddO1xyXG4gIG91dFs0XSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXk7XHJcbiAgb3V0WzVdID0gYXkgKiBxdyArIGF3ICogcXkgKyBheiAqIHF4IC0gYXggKiBxejtcclxuICBvdXRbNl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4O1xyXG4gIG91dFs3XSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXo7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYnkgYSBnaXZlbiBxdWF0ZXJuaW9uIChxICogYSlcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHJvdGF0ZSBieVxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlQnlRdWF0UHJlcGVuZChvdXQsIHEsIGEpIHtcclxuICBsZXQgcXggPSBxWzBdLFxyXG4gICAgcXkgPSBxWzFdLFxyXG4gICAgcXogPSBxWzJdLFxyXG4gICAgcXcgPSBxWzNdLFxyXG4gICAgYnggPSBhWzBdLFxyXG4gICAgYnkgPSBhWzFdLFxyXG4gICAgYnogPSBhWzJdLFxyXG4gICAgYncgPSBhWzNdO1xyXG5cclxuICBvdXRbMF0gPSBxeCAqIGJ3ICsgcXcgKiBieCArIHF5ICogYnogLSBxeiAqIGJ5O1xyXG4gIG91dFsxXSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYno7XHJcbiAgb3V0WzJdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieDtcclxuICBvdXRbM10gPSBxdyAqIGJ3IC0gcXggKiBieCAtIHF5ICogYnkgLSBxeiAqIGJ6O1xyXG4gIGJ4ID0gYVs0XTtcclxuICBieSA9IGFbNV07XHJcbiAgYnogPSBhWzZdO1xyXG4gIGJ3ID0gYVs3XTtcclxuICBvdXRbNF0gPSBxeCAqIGJ3ICsgcXcgKiBieCArIHF5ICogYnogLSBxeiAqIGJ5O1xyXG4gIG91dFs1XSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYno7XHJcbiAgb3V0WzZdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieDtcclxuICBvdXRbN10gPSBxdyAqIGJ3IC0gcXggKiBieCAtIHF5ICogYnkgLSBxeiAqIGJ6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCBhIGdpdmVuIGF4aXMuIERvZXMgdGhlIG5vcm1hbGlzYXRpb24gYXV0b21hdGljYWxseVxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIGhvdyBmYXIgdGhlIHJvdGF0aW9uIHNob3VsZCBiZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZUFyb3VuZEF4aXMob3V0LCBhLCBheGlzLCByYWQpIHtcclxuICAvL1NwZWNpYWwgY2FzZSBmb3IgcmFkID0gMFxyXG4gIGlmIChNYXRoLmFicyhyYWQpIDwgZ2xNYXRyaXguRVBTSUxPTikge1xyXG4gICAgcmV0dXJuIGNvcHkob3V0LCBhKTtcclxuICB9XHJcbiAgbGV0IGF4aXNMZW5ndGggPSBNYXRoLnNxcnQoYXhpc1swXSAqIGF4aXNbMF0gKyBheGlzWzFdICogYXhpc1sxXSArIGF4aXNbMl0gKiBheGlzWzJdKTtcclxuXHJcbiAgcmFkID0gcmFkICogMC41O1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYnggPSBzICogYXhpc1swXSAvIGF4aXNMZW5ndGg7XHJcbiAgbGV0IGJ5ID0gcyAqIGF4aXNbMV0gLyBheGlzTGVuZ3RoO1xyXG4gIGxldCBieiA9IHMgKiBheGlzWzJdIC8gYXhpc0xlbmd0aDtcclxuICBsZXQgYncgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICBsZXQgYXgxID0gYVswXSxcclxuICAgIGF5MSA9IGFbMV0sXHJcbiAgICBhejEgPSBhWzJdLFxyXG4gICAgYXcxID0gYVszXTtcclxuICBvdXRbMF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieTtcclxuICBvdXRbMV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBiejtcclxuICBvdXRbMl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieDtcclxuICBvdXRbM10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBiejtcclxuXHJcbiAgbGV0IGF4ID0gYVs0XSxcclxuICAgIGF5ID0gYVs1XSxcclxuICAgIGF6ID0gYVs2XSxcclxuICAgIGF3ID0gYVs3XTtcclxuICBvdXRbNF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xyXG4gIG91dFs1XSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XHJcbiAgb3V0WzZdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcclxuICBvdXRbN10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gZHVhbCBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xyXG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xyXG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xyXG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xyXG4gIG91dFs3XSA9IGFbN10gKyBiWzddO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBkdWFsIHF1YXQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIGxldCBheDAgPSBhWzBdLFxyXG4gICAgYXkwID0gYVsxXSxcclxuICAgIGF6MCA9IGFbMl0sXHJcbiAgICBhdzAgPSBhWzNdLFxyXG4gICAgYngxID0gYls0XSxcclxuICAgIGJ5MSA9IGJbNV0sXHJcbiAgICBiejEgPSBiWzZdLFxyXG4gICAgYncxID0gYls3XSxcclxuICAgIGF4MSA9IGFbNF0sXHJcbiAgICBheTEgPSBhWzVdLFxyXG4gICAgYXoxID0gYVs2XSxcclxuICAgIGF3MSA9IGFbN10sXHJcbiAgICBieDAgPSBiWzBdLFxyXG4gICAgYnkwID0gYlsxXSxcclxuICAgIGJ6MCA9IGJbMl0sXHJcbiAgICBidzAgPSBiWzNdO1xyXG4gIG91dFswXSA9IGF4MCAqIGJ3MCArIGF3MCAqIGJ4MCArIGF5MCAqIGJ6MCAtIGF6MCAqIGJ5MDtcclxuICBvdXRbMV0gPSBheTAgKiBidzAgKyBhdzAgKiBieTAgKyBhejAgKiBieDAgLSBheDAgKiBiejA7XHJcbiAgb3V0WzJdID0gYXowICogYncwICsgYXcwICogYnowICsgYXgwICogYnkwIC0gYXkwICogYngwO1xyXG4gIG91dFszXSA9IGF3MCAqIGJ3MCAtIGF4MCAqIGJ4MCAtIGF5MCAqIGJ5MCAtIGF6MCAqIGJ6MDtcclxuICBvdXRbNF0gPSBheDAgKiBidzEgKyBhdzAgKiBieDEgKyBheTAgKiBiejEgLSBhejAgKiBieTEgKyBheDEgKiBidzAgKyBhdzEgKiBieDAgKyBheTEgKiBiejAgLSBhejEgKiBieTA7XHJcbiAgb3V0WzVdID0gYXkwICogYncxICsgYXcwICogYnkxICsgYXowICogYngxIC0gYXgwICogYnoxICsgYXkxICogYncwICsgYXcxICogYnkwICsgYXoxICogYngwIC0gYXgxICogYnowO1xyXG4gIG91dFs2XSA9IGF6MCAqIGJ3MSArIGF3MCAqIGJ6MSArIGF4MCAqIGJ5MSAtIGF5MCAqIGJ4MSArIGF6MSAqIGJ3MCArIGF3MSAqIGJ6MCArIGF4MSAqIGJ5MCAtIGF5MSAqIGJ4MDtcclxuICBvdXRbN10gPSBhdzAgKiBidzEgLSBheDAgKiBieDEgLSBheTAgKiBieTEgLSBhejAgKiBiejEgKyBhdzEgKiBidzAgLSBheDEgKiBieDAgLSBheTEgKiBieTAgLSBhejEgKiBiejA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyBhIGR1YWwgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0XHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdCB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIGR1YWwgcXVhdCBieVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICBvdXRbMl0gPSBhWzJdICogYjtcclxuICBvdXRbM10gPSBhWzNdICogYjtcclxuICBvdXRbNF0gPSBhWzRdICogYjtcclxuICBvdXRbNV0gPSBhWzVdICogYjtcclxuICBvdXRbNl0gPSBhWzZdICogYjtcclxuICBvdXRbN10gPSBhWzddICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIGR1YWwgcXVhdCdzIChUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIHJlYWwgcGFydHMpXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkb3QgPSBxdWF0LmRvdDtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIGR1YWwgcXVhdHMnc1xyXG4gKiBOT1RFOiBUaGUgcmVzdWx0aW5nIGR1YWwgcXVhdGVybmlvbnMgd29uJ3QgYWx3YXlzIGJlIG5vcm1hbGl6ZWQgKFRoZSBlcnJvciBpcyBtb3N0IG5vdGljZWFibGUgd2hlbiB0ID0gMC41KVxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRcclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcclxuICBsZXQgbXQgPSAxIC0gdDtcclxuICBpZiAoZG90KGEsIGIpIDwgMCkgdCA9IC10O1xyXG5cclxuICBvdXRbMF0gPSBhWzBdICogbXQgKyBiWzBdICogdDtcclxuICBvdXRbMV0gPSBhWzFdICogbXQgKyBiWzFdICogdDtcclxuICBvdXRbMl0gPSBhWzJdICogbXQgKyBiWzJdICogdDtcclxuICBvdXRbM10gPSBhWzNdICogbXQgKyBiWzNdICogdDtcclxuICBvdXRbNF0gPSBhWzRdICogbXQgKyBiWzRdICogdDtcclxuICBvdXRbNV0gPSBhWzVdICogbXQgKyBiWzVdICogdDtcclxuICBvdXRbNl0gPSBhWzZdICogbXQgKyBiWzZdICogdDtcclxuICBvdXRbN10gPSBhWzddICogbXQgKyBiWzddICogdDtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBkdWFsIHF1YXQuIElmIHRoZXkgYXJlIG5vcm1hbGl6ZWQsIGNvbmp1Z2F0ZSBpcyBjaGVhcGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuICBsZXQgc3FsZW4gPSBzcXVhcmVkTGVuZ3RoKGEpO1xyXG4gIG91dFswXSA9IC1hWzBdIC8gc3FsZW47XHJcbiAgb3V0WzFdID0gLWFbMV0gLyBzcWxlbjtcclxuICBvdXRbMl0gPSAtYVsyXSAvIHNxbGVuO1xyXG4gIG91dFszXSA9IGFbM10gLyBzcWxlbjtcclxuICBvdXRbNF0gPSAtYVs0XSAvIHNxbGVuO1xyXG4gIG91dFs1XSA9IC1hWzVdIC8gc3FsZW47XHJcbiAgb3V0WzZdID0gLWFbNl0gLyBzcWxlbjtcclxuICBvdXRbN10gPSBhWzddIC8gc3FsZW47XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIGR1YWwgcXVhdFxyXG4gKiBJZiB0aGUgZHVhbCBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdDIuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29uanVnYXRlKG91dCwgYSkge1xyXG4gIG91dFswXSA9IC1hWzBdO1xyXG4gIG91dFsxXSA9IC1hWzFdO1xyXG4gIG91dFsyXSA9IC1hWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgb3V0WzRdID0gLWFbNF07XHJcbiAgb3V0WzVdID0gLWFbNV07XHJcbiAgb3V0WzZdID0gLWFbNl07XHJcbiAgb3V0WzddID0gYVs3XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgZHVhbCBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGVuZ3RoID0gcXVhdC5sZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5sZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIGR1YWwgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzcXVhcmVkTGVuZ3RoID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxpemUgYSBkdWFsIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XHJcbiAgbGV0IG1hZ25pdHVkZSA9IHNxdWFyZWRMZW5ndGgoYSk7XHJcbiAgaWYgKG1hZ25pdHVkZSA+IDApIHtcclxuICAgIG1hZ25pdHVkZSA9IE1hdGguc3FydChtYWduaXR1ZGUpO1xyXG4gICAgb3V0WzBdID0gYVswXSAvIG1hZ25pdHVkZTtcclxuICAgIG91dFsxXSA9IGFbMV0gLyBtYWduaXR1ZGU7XHJcbiAgICBvdXRbMl0gPSBhWzJdIC8gbWFnbml0dWRlO1xyXG4gICAgb3V0WzNdID0gYVszXSAvIG1hZ25pdHVkZTtcclxuICAgIG91dFs0XSA9IGFbNF0gLyBtYWduaXR1ZGU7XHJcbiAgICBvdXRbNV0gPSBhWzVdIC8gbWFnbml0dWRlO1xyXG4gICAgb3V0WzZdID0gYVs2XSAvIG1hZ25pdHVkZTtcclxuICAgIG91dFs3XSA9IGFbN10gLyBtYWduaXR1ZGU7XHJcbiAgfVxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgZHVhbCBxdWF0ZW5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZHVhbCBxdWF0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ3F1YXQyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArXHJcbiAgICBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IGR1YWwgcXVhdGVybmlvbi5cclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIGR1YWwgcXVhdGVybmlvbi5cclxuICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdGVybmlvbnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmXHJcbiAgICBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiYgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IGR1YWwgcXVhdC5cclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIGR1YWwgcXVhdC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdHMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLFxyXG4gICAgYTEgPSBhWzFdLFxyXG4gICAgYTIgPSBhWzJdLFxyXG4gICAgYTMgPSBhWzNdLFxyXG4gICAgYTQgPSBhWzRdLFxyXG4gICAgYTUgPSBhWzVdLFxyXG4gICAgYTYgPSBhWzZdLFxyXG4gICAgYTcgPSBhWzddO1xyXG4gIGxldCBiMCA9IGJbMF0sXHJcbiAgICBiMSA9IGJbMV0sXHJcbiAgICBiMiA9IGJbMl0sXHJcbiAgICBiMyA9IGJbM10sXHJcbiAgICBiNCA9IGJbNF0sXHJcbiAgICBiNSA9IGJbNV0sXHJcbiAgICBiNiA9IGJbNl0sXHJcbiAgICBiNyA9IGJbN107XHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG4gICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcbiAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuICAgIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG4gICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXHJcbiAgICBNYXRoLmFicyhhNiAtIGI2KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuICAgIE1hdGguYWJzKGE3IC0gYjcpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSk7XHJcbn1cclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIDIgRGltZW5zaW9uYWwgVmVjdG9yXHJcbiAqIEBtb2R1bGUgdmVjMlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXHJcbiAqXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xyXG4gIG91dFswXSA9IDA7XHJcbiAgb3V0WzFdID0gMDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcclxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHkpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XHJcbiAgb3V0WzBdID0geDtcclxuICBvdXRbMV0gPSB5O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSkge1xyXG4gIG91dFswXSA9IHg7XHJcbiAgb3V0WzFdID0geTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNlaWxcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gZmxvb3JcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJvdW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3VuZCAob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKiBiO1xyXG4gIG91dFsxXSA9IGFbMV0gKiBiO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcclxuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxyXG4gICAgeSA9IGJbMV0gLSBhWzFdO1xyXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xyXG4gIHZhciB4ID0gYlswXSAtIGFbMF0sXHJcbiAgICB5ID0gYlsxXSAtIGFbMV07XHJcbiAgcmV0dXJuIHgqeCArIHkqeTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XHJcbiAgdmFyIHggPSBhWzBdLFxyXG4gICAgeSA9IGFbMV07XHJcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aCAoYSkge1xyXG4gIHZhciB4ID0gYVswXSxcclxuICAgIHkgPSBhWzFdO1xyXG4gIHJldHVybiB4KnggKyB5Knk7XHJcbn07XHJcblxyXG4vKipcclxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAtYVswXTtcclxuICBvdXRbMV0gPSAtYVsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xyXG4gIG91dFswXSA9IDEuMCAvIGFbMF07XHJcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcclxuICB2YXIgeCA9IGFbMF0sXHJcbiAgICB5ID0gYVsxXTtcclxuICB2YXIgbGVuID0geCp4ICsgeSp5O1xyXG4gIGlmIChsZW4gPiAwKSB7XHJcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcclxuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XHJcbiAgfVxyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcclxuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXHJcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XHJcbiAgdmFyIHogPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xyXG4gIG91dFswXSA9IG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gejtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XHJcbiAgdmFyIGF4ID0gYVswXSxcclxuICAgIGF5ID0gYVsxXTtcclxuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcclxuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xyXG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xyXG4gIHZhciByID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xyXG4gIG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGU7XHJcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XHJcbiAgdmFyIHggPSBhWzBdLFxyXG4gICAgeSA9IGFbMV07XHJcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcclxuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MmRcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcclxuICB2YXIgeCA9IGFbMF0sXHJcbiAgICB5ID0gYVsxXTtcclxuICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XTtcclxuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcclxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XHJcbiAgdmFyIHggPSBhWzBdLFxyXG4gICAgeSA9IGFbMV07XHJcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XHJcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XHJcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXHJcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xyXG4gIGxldCB4ID0gYVswXTtcclxuICBsZXQgeSA9IGFbMV07XHJcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xyXG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICd2ZWMyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGV4YWN0bHkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV07XHJcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdO1xyXG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXZpZGV9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRpdiA9IGRpdmlkZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRpc3QgPSBkaXN0YW5jZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZERpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cclxuICpcclxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcclxuICBsZXQgdmVjID0gY3JlYXRlKCk7XHJcblxyXG4gIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuICAgIGxldCBpLCBsO1xyXG4gICAgaWYoIXN0cmlkZSkge1xyXG4gICAgICBzdHJpZGUgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFvZmZzZXQpIHtcclxuICAgICAgb2Zmc2V0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZihjb3VudCkge1xyXG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbCA9IGEubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdO1xyXG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcclxuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhO1xyXG4gIH07XHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGdsLW1hdHJpeCAtIEhpZ2ggcGVyZm9ybWFuY2UgbWF0cml4IGFuZCB2ZWN0b3Igb3BlcmF0aW9uc1xyXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcclxuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcclxuICogQHZlcnNpb24gMi40LjBcclxuICovXHJcblxyXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG4vLyBFTkQgSEVBREVSXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9nbC1tYXRyaXgvY29tbW9uLmpzXCI7XHJcbmltcG9ydCAqIGFzIG1hdDIgZnJvbSBcIi4vZ2wtbWF0cml4L21hdDIuanNcIjtcclxuaW1wb3J0ICogYXMgbWF0MmQgZnJvbSBcIi4vZ2wtbWF0cml4L21hdDJkLmpzXCI7XHJcbmltcG9ydCAqIGFzIG1hdDMgZnJvbSBcIi4vZ2wtbWF0cml4L21hdDMuanNcIjtcclxuaW1wb3J0ICogYXMgbWF0NCBmcm9tIFwiLi9nbC1tYXRyaXgvbWF0NC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBxdWF0IGZyb20gXCIuL2dsLW1hdHJpeC9xdWF0LmpzXCI7XHJcbmltcG9ydCAqIGFzIHF1YXQyIGZyb20gXCIuL2dsLW1hdHJpeC9xdWF0Mi5qc1wiO1xyXG5pbXBvcnQgKiBhcyB2ZWMyIGZyb20gXCIuL2dsLW1hdHJpeC92ZWMyLmpzXCI7XHJcbmltcG9ydCAqIGFzIHZlYzMgZnJvbSBcIi4vZ2wtbWF0cml4L3ZlYzMuanNcIjtcclxuaW1wb3J0ICogYXMgdmVjNCBmcm9tIFwiLi9nbC1tYXRyaXgvdmVjNC5qc1wiO1xyXG5cclxuZXhwb3J0IHtcclxuICBnbE1hdHJpeCxcclxuICBtYXQyLCBtYXQyZCwgbWF0MywgbWF0NCxcclxuICBxdWF0LCBxdWF0MixcclxuICB2ZWMyLCB2ZWMzLCB2ZWM0LFxyXG59O1xyXG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcblxuLy8gcHZ0XG5mdW5jdGlvbiBub3JtYWxpemUoYXJyYXkpIHtcbiAgICByZXR1cm4gdmVjMy5mcm9tVmFsdWVzKFxuICAgICAgICBhcnJheVswXSAvIDI1NSxcbiAgICAgICAgYXJyYXlbMV0gLyAyNTUsXG4gICAgICAgIGFycmF5WzJdIC8gMjU1LFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhJbnRUb1JnYihoZXgpIHtcbiAgICBjb25zdCByID0gaGV4ID4+IDE2O1xuICAgIGNvbnN0IGcgPSBoZXggPj4gOCAmIDB4RkY7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBjb25zdCBiID0gaGV4ICYgMHhGRjtcbiAgICByZXR1cm4gdmVjMy5mcm9tVmFsdWVzKHIsIGcsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4U3RyaW5nVG9SZ2IoaGV4KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgcmV0dXJuIHJlc3VsdCA/IHZlYzMuZnJvbVZhbHVlcyhcbiAgICAgICAgcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgIHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuICAgICAgICBwYXJzZUludChyZXN1bHRbM10sIDE2KSxcbiAgICApIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudFRvSGV4KGMpIHtcbiAgICBjb25zdCBoZXggPSBjLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PT0gMSA/IGAwJHtoZXh9YCA6IGhleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYlRvSGV4KHIsIGcsIGIpIHtcbiAgICBjb25zdCBoZXhSID0gY29tcG9uZW50VG9IZXgocik7XG4gICAgY29uc3QgaGV4RyA9IGNvbXBvbmVudFRvSGV4KGcpO1xuICAgIGNvbnN0IGhleEIgPSBjb21wb25lbnRUb0hleChiKTtcbiAgICByZXR1cm4gYCMke2hleFJ9JHtoZXhHfSR7aGV4Qn1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydChoZXgpIHtcbiAgICBjb25zdCBjb2xvciA9IHZlYzMuY3JlYXRlKCk7XG4gICAgY29uc3QgcmdiID0gdHlwZW9mIGhleCA9PT0gJ251bWJlcicgPyBoZXhJbnRUb1JnYihoZXgpIDogaGV4U3RyaW5nVG9SZ2IoaGV4KTtcbiAgICB2ZWMzLmNvcHkoY29sb3IsIG5vcm1hbGl6ZShyZ2IpKTtcbiAgICByZXR1cm4gY29sb3I7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcmFuZG9tUmFuZ2UobWluLCBtYXgpIHtcbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2QobSwgbikge1xuICAgIHJldHVybiAoKG0gJSBuKSArIG4pICUgbjtcbn1cbiIsImltcG9ydCB7IGdldENvbnRleHRUeXBlIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY29uc3QgV09SRF9SRUdYID0gKHdvcmQpID0+IHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXFxcXGIke3dvcmR9XFxcXGJgLCAnZ2knKTtcbn07XG5cbmNvbnN0IExJTkVfUkVHWCA9ICh3b3JkKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYCR7d29yZH1gLCAnZ2knKTtcbn07XG5cbmNvbnN0IFZFUlRFWCA9IFtcbiAgICB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ2luJyksXG4gICAgICAgIHJlcGxhY2U6ICdhdHRyaWJ1dGUnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0JyksXG4gICAgICAgIHJlcGxhY2U6ICd2YXJ5aW5nJyxcbiAgICB9LFxuXTtcblxuY29uc3QgRlJBR01FTlQgPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAndmFyeWluZycsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogTElORV9SRUdYKCdvdXQgdmVjNCBvdXRDb2xvcjsnKSxcbiAgICAgICAgcmVwbGFjZTogJycsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdvdXRDb2xvcicpLFxuICAgICAgICByZXBsYWNlOiAnZ2xfRnJhZ0NvbG9yJyxcbiAgICB9LCB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ3RleHR1cmVQcm9qJyksXG4gICAgICAgIHJlcGxhY2U6ICd0ZXh0dXJlMkRQcm9qJyxcbiAgICB9LCB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ3RleHR1cmUnKSxcbiAgICAgICAgcmVwbGFjZShzaGFkZXIpIHtcbiAgICAgICAgICAgIC8vIEZpbmQgYWxsIHRleHR1cmUgZGVmaW50aW9uc1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZUdsb2JhbFJlZ3ggPSBuZXcgUmVnRXhwKCdcXFxcYnRleHR1cmVcXFxcYicsICdnaScpO1xuXG4gICAgICAgICAgICAvLyBGaW5kIHNpbmdsZSB0ZXh0dXJlIGRlZmluaXRpb25cbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVTaW5nbGVSZWd4ID0gbmV3IFJlZ0V4cCgnXFxcXGJ0ZXh0dXJlXFxcXGInLCAnaScpO1xuXG4gICAgICAgICAgICAvLyBHZXRzIHRoZSB0ZXh0dXJlIGNhbGwgc2lnbmF0dXJlIGUuZyB0ZXh0dXJlKHVUZXh0dXJlMSwgdlV2KTtcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVVbmlmb3JtTmFtZVJlZ3ggPSBuZXcgUmVnRXhwKC90ZXh0dXJlXFwoKFteKV0rKVxcKS8sICdpJyk7XG5cbiAgICAgICAgICAgIC8vIEdldCBhbGwgbWF0Y2hpbmcgb2NjdXJhbmNlc1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNoYWRlci5tYXRjaCh0ZXh0dXJlR2xvYmFsUmVneCk7XG4gICAgICAgICAgICBsZXQgcmVwbGFjZW1lbnQgPSAnJztcblxuICAgICAgICAgICAgLy8gSWYgbm90aGluZyBtYXRjaGVzIHJldHVyblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHJldHVybiBzaGFkZXI7XG5cbiAgICAgICAgICAgIC8vIFJlcGxhY2UgZWFjaCBvY2N1cmFuY2UgYnkgaXQncyB1bmlmb3JtIHR5cGVcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlICovXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGkgb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gc2hhZGVyLm1hdGNoKHRleHR1cmVVbmlmb3JtTmFtZVJlZ3gpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtTmFtZSA9IG1hdGNoLnJlcGxhY2UoJ3RleHR1cmUoJywgJycpLnNwbGl0KCcsJylbMF07XG4gICAgICAgICAgICAgICAgICAgIGxldCB1bmlmb3JtVHlwZSA9IHNoYWRlci5tYXRjaChgKC4qPykgJHt1bmlmb3JtTmFtZX1gLCAnaScpWzFdLnJlcGxhY2UoL15cXHMrfFxccyskL2dtLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm1UeXBlID0gdW5pZm9ybVR5cGUuc3BsaXQoJyAnKVsxXTtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHVuaWZvcm1UeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXIyRCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudCA9ICd0ZXh0dXJlMkQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXJDdWJlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50ID0gJ3RleHR1cmVDdWJlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hhZGVyID0gc2hhZGVyLnJlcGxhY2UodGV4dHVyZVNpbmdsZVJlZ3gsIHJlcGxhY2VtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgKi9cbiAgICAgICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgICAgIH0sXG4gICAgfV07XG5cbmNvbnN0IEdFTkVSSUMgPSBbe1xuICAgIG1hdGNoOiBMSU5FX1JFR1goJyN2ZXJzaW9uIDMwMCBlcycpLFxuICAgIHJlcGxhY2U6ICcnLFxufV07XG5cbmNvbnN0IFZFUlRFWF9SVUxFUyA9IFsuLi5HRU5FUklDLCAuLi5WRVJURVhdO1xuY29uc3QgRlJBR01FTlRfUlVMRVMgPSBbLi4uR0VORVJJQywgLi4uRlJBR01FTlRdO1xuXG4vKipcbiAqXG4gKi9cbmNvbnN0IHRyYW5zZm9ybSA9IChjb2RlKSA9PiB7XG4gICAgcmV0dXJuIGNvZGVcbiAgICAgICAgLy8gcmVtb3ZlcyAvL1xuICAgICAgICAucmVwbGFjZSgvWyBcXHRdKlxcL1xcLy4qXFxuL2csICcnKVxuICAgICAgICAvLyByZW1vdmUgLyogKi9cbiAgICAgICAgLnJlcGxhY2UoL1sgXFx0XSpcXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKVxuICAgICAgICAvLyByZW1vdmVzIG11bHRpcGxlIHdoaXRlIHNwYWNlc1xuICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyR8XFxzKyg/PVxccykvZywgJycpO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyBlczMwMCBzeW50YXggdG8gZXMxMDBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2Uoc2hhZGVyLCBzaGFkZXJUeXBlKSB7XG4gICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfVxuXG4gICAgY29uc3QgcnVsZXMgPSBzaGFkZXJUeXBlID09PSAndmVydGV4JyA/IFZFUlRFWF9SVUxFUyA6IEZSQUdNRU5UX1JVTEVTO1xuICAgIHJ1bGVzLmZvckVhY2goKHJ1bGUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBydWxlLnJlcGxhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHNoYWRlciA9IHJ1bGUucmVwbGFjZShzaGFkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hhZGVyID0gc2hhZGVyLnJlcGxhY2UocnVsZS5tYXRjaCwgcnVsZS5yZXBsYWNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRyYW5zZm9ybShzaGFkZXIpO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNsYXNzIFZlY3RvcjMge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDApIHtcbiAgICAgICAgdGhpcy5kYXRhID0gdmVjMy5mcm9tVmFsdWVzKHgsIHksIHopO1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgfVxuXG4gICAgc2V0IHgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XG4gICAgfVxuXG4gICAgc2V0IHkodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XG4gICAgfVxuXG4gICAgc2V0IHoodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzJdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3IzO1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCwgcXVhdCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL3ZlY3RvcjMnO1xuXG5sZXQgdXVpZCA9IDA7XG5sZXQgYXhpc0FuZ2xlID0gMDtcbmNvbnN0IHF1YXRlcm5pb25BeGlzQW5nbGUgPSB2ZWMzLmNyZWF0ZSgpO1xuXG5jbGFzcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51aWQgPSB1dWlkKys7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXcgVmVjdG9yMygpO1xuICAgICAgICB0aGlzLnNjYWxlID0gbmV3IFZlY3RvcjMoMSwgMSwgMSk7XG5cbiAgICAgICAgdGhpcy5fdHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uID0gcXVhdC5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMudXAgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMubG9va1RvVGFyZ2V0ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5tYXRyaWNlcyA9IHtcbiAgICAgICAgICAgIHBhcmVudDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIG1vZGVsOiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgbG9va0F0OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlydHkgPSB7XG4gICAgICAgICAgICBzb3J0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgc2hhZGVyOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXQgdHJhbnNwYXJlbnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS50cmFuc3BhcmVudCA9IHRoaXMudHJhbnNwYXJlbnQgIT09IHZhbHVlO1xuICAgICAgICB0aGlzLl90cmFuc3BhcmVudCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB0cmFuc3BhcmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zcGFyZW50O1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRoaXMudmlzaWJsZSAhPT0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3Zpc2libGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdmlzaWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cmljZXMoKSB7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5wYXJlbnQpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubW9kZWwpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgcXVhdC5pZGVudGl0eSh0aGlzLnF1YXRlcm5pb24pO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgbWF0NC5jb3B5KHRoaXMubWF0cmljZXMucGFyZW50LCB0aGlzLnBhcmVudC5tYXRyaWNlcy5tb2RlbCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMucGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvb2tUb1RhcmdldCkge1xuICAgICAgICAgICAgbWF0NC50YXJnZXRUbyh0aGlzLm1hdHJpY2VzLmxvb2tBdCwgdGhpcy5wb3NpdGlvbi5kYXRhLCB0aGlzLnRhcmdldCwgdGhpcy51cCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMucG9zaXRpb24uZGF0YSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVgodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueCk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVkodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVoodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueik7XG4gICAgICAgICAgICBheGlzQW5nbGUgPSBxdWF0LmdldEF4aXNBbmdsZShxdWF0ZXJuaW9uQXhpc0FuZ2xlLCB0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICAgICAgbWF0NC5yb3RhdGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgYXhpc0FuZ2xlLCBxdWF0ZXJuaW9uQXhpc0FuZ2xlKTtcbiAgICAgICAgfVxuICAgICAgICBtYXQ0LnNjYWxlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMuc2NhbGUuZGF0YSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgLy8gdG8gYmUgb3ZlcnJpZGVuO1xuICAgIH1cblxuICAgIGFkZChtb2RlbCkge1xuICAgICAgICBtb2RlbC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobW9kZWwpO1xuICAgICAgICB0aGlzLmRpcnR5LnNvcnRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlbW92ZShtb2RlbCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihtb2RlbCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmF2ZXJzZShvYmplY3QpIHtcbiAgICAgICAgLy8gaWYgdHJhdmVyc2VkIG9iamVjdCBpcyB0aGUgc2NlbmVcbiAgICAgICAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYmplY3QgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zY2VuZUdyYXBoU29ydGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2JqZWN0LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRyYXZlcnNlKG9iamVjdC5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0LnBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZU1hdHJpY2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFXG4gICAgICAgIC8vIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UsIHdlIGFsc28gY2hlY2sgaWYgdGhlIG9iamVjdHMgYXJlIGRpcnR5IHdoZW4gd2UgdHJhdmVyc2UgdGhlbS5cbiAgICAgICAgLy8gdGhpcyBhdm9pZHMgaGF2aW5nIGEgc2Vjb25kIGxvb3AgdGhyb3VnaCB0aGUgZ3JhcGggc2NlbmUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIGFueSBlbGVtZW50IGdldHMgYWRkZWQgLyByZW1vdmVkIGZyb20gc2NlbmVcbiAgICAgICAgLy8gb3IgaWYgaXRzIHRyYW5zcGFyZW5jeSBjaGFuZ2VzLCB3ZSBuZWVkIHRvIHNvcnQgdGhlbSBhZ2FpbiBpbnRvXG4gICAgICAgIC8vIG9wYXF1ZSAvIHRyYW5zcGFyZW50IGFycmF5c1xuICAgICAgICBpZiAob2JqZWN0LmRpcnR5LnNvcnRpbmcgfHxcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2NlbmVHcmFwaFNvcnRlcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdDM7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIE9ydGhvZ3JhcGhpY0NhbWVyYSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBsZWZ0OiAtMSxcbiAgICAgICAgICAgIHJpZ2h0OiAxLFxuICAgICAgICAgICAgdG9wOiAxLFxuICAgICAgICAgICAgYm90dG9tOiAtMSxcbiAgICAgICAgICAgIG5lYXI6IC0xMDAwLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgoKSB7XG4gICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyXG4gICAgICAgIG1hdDQub3J0aG8oXG4gICAgICAgICAgICB0aGlzLm1hdHJpY2VzLnByb2plY3Rpb24sXG4gICAgICAgICAgICB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0aGlzLnJpZ2h0LFxuICAgICAgICAgICAgdGhpcy5ib3R0b20sXG4gICAgICAgICAgICB0aGlzLnRvcCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3J0aG9ncmFwaGljQ2FtZXJhO1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgT2JqZWN0MyBmcm9tICcuLi9jb3JlL29iamVjdDMnO1xuXG5jbGFzcyBQZXJzcGVjdGl2ZUNhbWVyYSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBuZWFyOiAxLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICAgICAgZm92OiAzNSxcbiAgICAgICAgfSwgcGFyYW1zKTtcblxuICAgICAgICB0aGlzLm1hdHJpY2VzLnByb2plY3Rpb24gPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIH1cblxuICAgIGxvb2tBdCh2KSB7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLnRhcmdldCwgdik7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FtZXJhTWF0cml4KHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgbWF0NC5wZXJzcGVjdGl2ZShcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgIHRoaXMuZm92ICogKE1hdGguUEkgLyAxODApLFxuICAgICAgICAgICAgd2lkdGggLyBoZWlnaHQsXG4gICAgICAgICAgICB0aGlzLm5lYXIsXG4gICAgICAgICAgICB0aGlzLmZhcixcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBlcnNwZWN0aXZlQ2FtZXJhO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBVQk8sIEZPRywgRVhURU5TSU9OUyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9CQVNJQywgRFJBVyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEJhc2ljIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuXG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgdV9jb2xvcjtcblxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGJhc2UgPSB2ZWM0KHVfY29sb3IsIDEuMCk7XG5cbiAgICAgICAgICAgICAgICAke0ZPRy5saW5lYXIoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfQkFTSUMsXG4gICAgICAgICAgICBtb2RlOiBwcm9wcy53aXJlZnJhbWUgPT09IHRydWUgPyBEUkFXLkxJTkVTIDogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB1X2NvbG9yOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2ZWMzJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbG9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2ljO1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJy4uL3Nlc3Npb24nO1xuXG5jbGFzcyBUZXh0dXJlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgbWFnRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgbWluRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgd3JhcFM6IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVDogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShbMjU1LCAyNTUsIDI1NSwgMjU1XSk7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCAxLCAxLCAwLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMubWFnRmlsdGVyKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMubWluRmlsdGVyKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgdGhpcy53cmFwUyk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMud3JhcFQpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIH1cblxuICAgIGZyb21JbWFnZSh1cmwpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoaW1nKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW1hZ2UpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vY29yZS90ZXh0dXJlJztcbmltcG9ydCB7IFVCTywgTElHSFQsIEZPRywgQ0xJUFBJTkcsIEVYVEVOU0lPTlMsIFNIQURPVyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9ERUZBVUxULCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgRGVmYXVsdCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHByb3BzLmNvbG9yIHx8IHZlYzMuZnJvbVZhbHVlcygxLCAxLCAxKTtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgVGV4dHVyZSh7IHRyYW5zcGFyZW50OiB0cnVlIH0pO1xuXG4gICAgICAgIC8vIG1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzYyMDY3OC9yZWQuanBnJy5cbiAgICAgICAgaWYgKHByb3BzLm1hcCkge1xuICAgICAgICAgICAgdGhpcy5tYXAuZnJvbUltYWdlKHByb3BzLm1hcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZXh0dXJlOiBuZXcgVGV4dHVyZSgpXG4gICAgICAgIGlmIChwcm9wcy50ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcCA9IHByb3BzLnRleHR1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICBpbiB2ZWMyIGFfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXhfcHJlKCl9XG4gICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXhfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWMzIGZyYWdWZXJ0ZXhFYztcbiAgICAgICAgICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgICAgICAgICBvdXQgdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgd29ybGRQb3NpdGlvbiA9IG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgICAgIHZlYzQgcG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIHdvcmxkUG9zaXRpb247XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgICAgICAgICAgIGZyYWdWZXJ0ZXhFYyA9IHBvc2l0aW9uLnh5ejsgLy8gd29ybGRQb3NpdGlvbi54eXo7XG4gICAgICAgICAgICAgICAgdl91diA9IGFfdXY7XG4gICAgICAgICAgICAgICAgdl9ub3JtYWwgPSAobm9ybWFsTWF0cml4ICogdmVjNChhX25vcm1hbCwgMS4wKSkueHl6O1xuXG4gICAgICAgICAgICAgICAgJHtTSEFET1cudmVydGV4KCl9XG4gICAgICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICBpbiB2ZWMzIGZyYWdWZXJ0ZXhFYztcbiAgICAgICAgICAgIGluIHZlYzIgdl91djtcbiAgICAgICAgICAgIGluIHZlYzMgdl9ub3JtYWw7XG5cbiAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtVQk8ubGlnaHRzKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfbWFwO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWMzIHVfY29sb3I7XG5cbiAgICAgICAgICAgICR7U0hBRE9XLmZyYWdtZW50X3ByZSgpfVxuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzMgdl9ub3JtYWwgPSBub3JtYWxpemUoY3Jvc3MoZEZkeChmcmFnVmVydGV4RWMpLCBkRmR5KGZyYWdWZXJ0ZXhFYykpKTtcblxuICAgICAgICAgICAgICAgIHZlYzQgYmFzZSA9IHZlYzQoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgICAgICAgICAgICBiYXNlICs9IHZlYzQodV9jb2xvciwgMS4wKTtcbiAgICAgICAgICAgICAgICBiYXNlICo9IHRleHR1cmUodV9tYXAsIHZfdXYpO1xuXG4gICAgICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnQoKX1cbiAgICAgICAgICAgICAgICAke0xJR0hULmZhY3RvcnkoKX1cbiAgICAgICAgICAgICAgICAke0ZPRy5saW5lYXIoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IGJhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgdHlwZTogU0hBREVSX0RFRkFVTFQsXG4gICAgICAgICAgICBtb2RlOiBwcm9wcy53aXJlZnJhbWUgPT09IHRydWUgPyBEUkFXLkxJTkVTIDogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2FtcGxlcjJEJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubWFwLnRleHR1cmUsXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHVfY29sb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlYzMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29sb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGVmYXVsdDtcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2NvcmUvdGV4dHVyZSc7XG5pbXBvcnQgeyBVQk8sIEVYVEVOU0lPTlMgfSBmcm9tICcuL2NodW5rcyc7XG5pbXBvcnQgeyBTSEFERVJfQklMTEJPQVJELCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQmlsbGJvYXJkIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IFRleHR1cmUoKTtcblxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9wcy50ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcCA9IHByb3BzLnRleHR1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdl91diA9IGFfdXY7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuXG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X21hcDtcblxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICAvLyBkZXB0aCBtYXBcbiAgICAgICAgICAgICAgICBmbG9hdCB6ID0gdGV4dHVyZSh1X21hcCwgdl91dikucjtcbiAgICAgICAgICAgICAgICBmbG9hdCBuID0gMS4wO1xuICAgICAgICAgICAgICAgIGZsb2F0IGYgPSAxMDAwLjA7XG4gICAgICAgICAgICAgICAgZmxvYXQgYyA9ICgyLjAgKiBuKSAvIChmICsgbiAtIHogKiAoZiAtIG4pKTtcblxuICAgICAgICAgICAgICAgIC8vIGRyYXcgZGVwdGhcbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IHZlYzQoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgdHlwZTogU0hBREVSX0JJTExCT0FSRCxcbiAgICAgICAgICAgIG1vZGU6IERSQVcuVFJJQU5HTEVTLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdV9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NhbXBsZXIyRCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1hcC50ZXh0dXJlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJpbGxib2FyZDtcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2NvcmUvdGV4dHVyZSc7XG5pbXBvcnQgeyBVQk8sIEZPRywgQ0xJUFBJTkcsIEVYVEVOU0lPTlMgfSBmcm9tICcuL2NodW5rcyc7XG5pbXBvcnQgeyBTSEFERVJfU0VNIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgU2VtIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IFRleHR1cmUoeyB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcblxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRleHR1cmU6IG5ldyBUZXh0dXJlKClcbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgcG9zaXRpb24gPSB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogcG9zaXRpb247XG5cbiAgICAgICAgICAgICAgICB2ZWMzIHZfZSA9IHZlYzMocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHZlYzMgdl9uID0gbWF0Myh2aWV3TWF0cml4ICogbW9kZWxNYXRyaXgpICogYV9ub3JtYWw7XG4gICAgICAgICAgICAgICAgdmVjMyByID0gcmVmbGVjdChub3JtYWxpemUodl9lKSwgbm9ybWFsaXplKHZfbikpO1xuICAgICAgICAgICAgICAgIGZsb2F0IG0gPSAyLjAgKiBzcXJ0KHBvdyhyLngsIDIuMCkgKyBwb3coci55LCAyLjApICsgcG93KHIueiArIDEuMCwgMi4wKSk7XG4gICAgICAgICAgICAgICAgdl91diA9IHIueHkgLyBtICsgMC41O1xuXG4gICAgICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtVQk8ubGlnaHRzKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfbWFwO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgYmFzZSA9IHZlYzQoMC4wLCAwLjAsIDAuMCwgMS4wKTtcblxuICAgICAgICAgICAgICAgIGJhc2UgKz0gdGV4dHVyZSh1X21hcCwgdl91dik7XG5cbiAgICAgICAgICAgICAgICAke0ZPRy5saW5lYXIoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IGJhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgdHlwZTogU0hBREVSX1NFTSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzYW1wbGVyMkQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZW07XG4iLCJjb25zdCBQUk9HUkFNX1BPT0wgPSB7fTtcblxuZnVuY3Rpb24gY3JlYXRlU2hhZGVyKGdsLCBzdHIsIHR5cGUpIHtcbiAgICBjb25zdCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG5cbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzdHIpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcblxuICAgIGNvbnN0IGNvbXBpbGVkID0gZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpO1xuXG4gICAgaWYgKCFjb21waWxlZCkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcblxuICAgICAgICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvciwgc3RyKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hhZGVyO1xufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlUHJvZ3JhbSA9IChnbCwgdmVydGV4LCBmcmFnbWVudCwgcHJvZ3JhbUlEKSA9PiB7XG4gICAgY29uc3QgcG9vbCA9IFBST0dSQU1fUE9PTFtgcG9vbF8ke3Byb2dyYW1JRH1gXTtcbiAgICBpZiAoIXBvb2wpIHtcbiAgICAgICAgY29uc3QgdnMgPSBjcmVhdGVTaGFkZXIoZ2wsIHZlcnRleCwgZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIGNvbnN0IGZzID0gY3JlYXRlU2hhZGVyKGdsLCBmcmFnbWVudCwgZ2wuRlJBR01FTlRfU0hBREVSKTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuXG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2cyk7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcyk7XG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICAgIFBST0dSQU1fUE9PTFtgcG9vbF8ke3Byb2dyYW1JRH1gXSA9IHByb2dyYW07XG5cbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvb2w7XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJy4uL3Nlc3Npb24nO1xuXG5jbGFzcyBVYm8ge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGJvdW5kTG9jYXRpb24pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMuYm91bmRMb2NhdGlvbiA9IGJvdW5kTG9jYXRpb247XG5cbiAgICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuZGF0YSwgZ2wuU1RBVElDX0RSQVcpOyAvLyBEWU5BTUlDX0RSQVdcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmJvdW5kTG9jYXRpb24sIHRoaXMuYnVmZmVyKTtcbiAgICAgICAgLy8gZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpOyAvLyBNQVlCRT9cbiAgICB9XG5cbiAgICB1cGRhdGUoZGF0YSwgb2Zmc2V0ID0gMCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICB0aGlzLmRhdGEuc2V0KGRhdGEsIG9mZnNldCk7XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCAwLCB0aGlzLmRhdGEsIDAsIG51bGwpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFVibztcbiIsImltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFZhbyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgdGhpcy52YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdGhpcy52YW8gPSBzdXBwb3J0cygpLnZlcnRleEFycmF5T2JqZWN0LmNyZWF0ZVZlcnRleEFycmF5T0VTKCk7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5iaW5kVmVydGV4QXJyYXlPRVModGhpcy52YW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5iaW5kVmVydGV4QXJyYXlPRVModGhpcy52YW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5iaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuYmluZFZlcnRleEFycmF5T0VTKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICBnbC5kZWxldGVWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmRlbGV0ZVZlcnRleEFycmF5T0VTKHRoaXMudmFvKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbyA9IG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYW87XG4iLCJleHBvcnQgY29uc3QgZ2V0VHlwZVNpemUgPSAodHlwZSkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAndmVjMic6XG4gICAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ3ZlYzMnOlxuICAgICAgICByZXR1cm4gMztcbiAgICBjYXNlICd2ZWM0JzpcbiAgICBjYXNlICdtYXQyJzpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgY2FzZSAnbWF0Myc6XG4gICAgICAgIHJldHVybiA5O1xuICAgIGNhc2UgJ21hdDQnOlxuICAgICAgICByZXR1cm4gMTY7XG4gICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7dHlwZX1cIiBpcyBhbiB1bmtub3duIHR5cGVgKTtcbiAgICB9XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGNvbnN0IGluaXRBdHRyaWJ1dGVzID0gKGF0dHJpYnV0ZXMsIHByb2dyYW0pID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgIGZvciAoY29uc3QgcHJvcCBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBhdHRyaWJ1dGVzW3Byb3BdO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIHByb3ApO1xuXG4gICAgICAgIGxldCBiID0gY3VycmVudC5idWZmZXI7XG4gICAgICAgIGlmICghY3VycmVudC5idWZmZXIpIHtcbiAgICAgICAgICAgIGIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBiKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGN1cnJlbnQudmFsdWUsIGdsLlNUQVRJQ19EUkFXKTsgLy8gb3IgRFlOQU1JQ19EUkFXXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGN1cnJlbnQsIHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgYnVmZmVyOiBiLFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgYmluZEF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcykgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIGluc3RhbmNlZCxcbiAgICAgICAgfSA9IGF0dHJpYnV0ZXNba2V5XTtcblxuICAgICAgICBpZiAobG9jYXRpb24gIT09IC0xKSB7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIHNpemUsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpdmlzb3IgPSBpbnN0YW5jZWQgPyAxIDogMDtcbiAgICAgICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYkRpdmlzb3IobG9jYXRpb24sIGRpdmlzb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdXBwb3J0cygpLmluc3RhbmNlZEFycmF5cy52ZXJ0ZXhBdHRyaWJEaXZpc29yQU5HTEUobG9jYXRpb24sIGRpdmlzb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVBdHRyaWJ1dGVzID0gKGF0dHJpYnV0ZXMpID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgfSA9IGF0dHJpYnV0ZXNba2V5XTtcblxuICAgICAgICBpZiAobG9jYXRpb24gIT09IC0xKSB7XG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB2YWx1ZSwgZ2wuRFlOQU1JQ19EUkFXKTtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsImltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICcuLi9zZXNzaW9uJztcblxuZXhwb3J0IGNvbnN0IGluaXRVbmlmb3JtcyA9ICh1bmlmb3JtcywgcHJvZ3JhbSkgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgY29uc3QgdGV4dHVyZUluZGljZXMgPSBbXG4gICAgICAgIGdsLlRFWFRVUkUwLFxuICAgICAgICBnbC5URVhUVVJFMSxcbiAgICAgICAgZ2wuVEVYVFVSRTIsXG4gICAgICAgIGdsLlRFWFRVUkUzLFxuICAgICAgICBnbC5URVhUVVJFNCxcbiAgICAgICAgZ2wuVEVYVFVSRTUsXG4gICAgXTtcblxuICAgIGxldCBpID0gMDtcblxuICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB1bmlmb3Jtc1twcm9wXTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgcHJvcCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihjdXJyZW50LCB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnQudHlwZSA9PT0gJ3NhbXBsZXIyRCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnQudGV4dHVyZUluZGV4ID0gaTtcbiAgICAgICAgICAgIGN1cnJlbnQuYWN0aXZlVGV4dHVyZSA9IHRleHR1cmVJbmRpY2VzW2ldO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlVW5pZm9ybXMgPSAodW5pZm9ybXMpID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICBPYmplY3Qua2V5cyh1bmlmb3JtcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHVuaWZvcm0gPSB1bmlmb3Jtc1trZXldO1xuXG4gICAgICAgIHN3aXRjaCAodW5pZm9ybS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21hdDQnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWF0Myc6XG4gICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd2ZWM0JzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm00ZnYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndmVjMyc6XG4gICAgICAgICAgICBnbC51bmlmb3JtM2Z2KHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZlYzInOlxuICAgICAgICAgICAgZ2wudW5pZm9ybTJmdih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmbG9hdCc6XG4gICAgICAgICAgICBnbC51bmlmb3JtMWYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2FtcGxlcjJEJzpcbiAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUodW5pZm9ybS5hY3RpdmVUZXh0dXJlKTtcbiAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udGV4dHVyZUluZGV4KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7dW5pZm9ybS50eXBlfVwiIGlzIGFuIHVua25vd24gdW5pZm9ybSB0eXBlYCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4iLCJpbXBvcnQgeyB2ZWM0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4vb2JqZWN0Myc7XG5pbXBvcnQgeyBjcmVhdGVQcm9ncmFtIH0gZnJvbSAnLi4vZ2wvcHJvZ3JhbSc7XG5pbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQsIERSQVcsIFNJREUsIFNIQURFUl9DVVNUT00gfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHtcbiAgICBiaW5kQXR0cmlidXRlcyxcbiAgICBnZXRUeXBlU2l6ZSxcbiAgICBpbml0QXR0cmlidXRlcyxcbiAgICBpbml0VW5pZm9ybXMsXG4gICAgdXBkYXRlVW5pZm9ybXMsXG4gICAgdXBkYXRlQXR0cmlidXRlcyxcbiAgICBWYW8sXG59IGZyb20gJy4uL2dsJztcbmltcG9ydCB7IGdsc2wzdG8xIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG4vLyB1c2VkIGZvciBzcGVlZCBvcHRpbWlzYXRpb25cbmxldCBXRUJHTDIgPSBmYWxzZTtcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHt9O1xuXG4gICAgICAgIC8vIHogZmlnaHRcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucG9seWdvbk9mZnNldEZhY3RvciA9IDA7XG4gICAgICAgIHRoaXMucG9seWdvbk9mZnNldFVuaXRzID0gMTtcblxuICAgICAgICAvLyBjbGlwcGluZyBwbGFuZXNcbiAgICAgICAgdGhpcy5jbGlwcGluZyA9IHtcbiAgICAgICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBwbGFuZXM6IFtcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gaW5zdGFuY2luZ1xuICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzSW5zdGFuY2UgPSBmYWxzZTtcblxuICAgICAgICAvLyByZW5kZXJpbmcgbW9kZVxuICAgICAgICB0aGlzLm1vZGUgPSBEUkFXLlRSSUFOR0xFUztcblxuICAgICAgICAvLyByZW5kZXJpbmcgc2lkZVxuICAgICAgICB0aGlzLnNpZGUgPSBTSURFLkZST05UO1xuXG4gICAgICAgIC8vIHR5cGVcbiAgICAgICAgdGhpcy50eXBlID0gU3RyaW5nKFNIQURFUl9DVVNUT00pO1xuXG4gICAgICAgIC8vIGNyZWF0ZXMgc2hhZG93XG4gICAgICAgIHRoaXMuc2hhZG93cyA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0QXR0cmlidXRlKG5hbWUsIHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBnZXRUeXBlU2l6ZSh0eXBlKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNldEluZGV4KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNldFVuaWZvcm0obmFtZSwgdHlwZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRTaGFkZXIodmVydGV4LCBmcmFnbWVudCkge1xuICAgICAgICB0aGlzLnZlcnRleCA9IHZlcnRleDtcbiAgICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuICAgIH1cblxuICAgIHNldEluc3RhbmNlQXR0cmlidXRlKG5hbWUsIHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBnZXRUeXBlU2l6ZSh0eXBlKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgaW5zdGFuY2VkOiB0cnVlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNldEluc3RhbmNlQ291bnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50ID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5zdGFuY2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0luc3RhbmNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBXRUJHTDIgPSBnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMjtcblxuICAgICAgICAvLyBvYmplY3QgbWF0ZXJpYWxcbiAgICAgICAgaWYgKHRoaXMudmVydGV4ICYmIHRoaXMuZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIGlmICghV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0ZXggPSBnbHNsM3RvMSh0aGlzLnZlcnRleCwgJ3ZlcnRleCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhZ21lbnQgPSBnbHNsM3RvMSh0aGlzLmZyYWdtZW50LCAnZnJhZ21lbnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9ncmFtID0gY3JlYXRlUHJvZ3JhbShnbCwgdGhpcy52ZXJ0ZXgsIHRoaXMuZnJhZ21lbnQsIHRoaXMudHlwZSk7XG4gICAgICAgICAgICBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG5cbiAgICAgICAgICAgIHRoaXMudmFvID0gbmV3IFZhbygpO1xuXG4gICAgICAgICAgICBpbml0QXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMsIHRoaXMucHJvZ3JhbSk7XG4gICAgICAgICAgICBpbml0VW5pZm9ybXModGhpcy51bmlmb3JtcywgdGhpcy5wcm9ncmFtKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNlcyAmJiAhdGhpcy5pbmRpY2VzLmJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhpcy52YW8uYmluZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5iaW5kKCk7XG4gICAgICAgICAgICAvLyB0aGlzLnZhby51bmJpbmQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGJpbmRBdHRyaWJ1dGVzKHRoaXMuYXR0cmlidXRlcywgdGhpcy5wcm9ncmFtKTtcblxuICAgICAgICBpZiAodGhpcy5pbmRpY2VzKSB7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmluZGljZXMuYnVmZmVyKTtcbiAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kaWNlcy52YWx1ZSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5iaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGluU2hhZG93TWFwKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpcnR5LmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZXModGhpcy5hdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkuYXR0cmlidXRlcyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVVbmlmb3Jtcyh0aGlzLnVuaWZvcm1zKTtcblxuICAgICAgICAvLyBlbmFibGUgZGVwdGggdGVzdCBhbmQgY3VsbGluZ1xuICAgICAgICAvLyBUT0RPOiBtYXliZSB0aGlzIGNhbiBoYXZlIG93biB2YXJpYWJsZXMgcGVyIG1vZGVsLlxuICAgICAgICAvLyBmb3IgZXhhbXBsZSByZW5kZXIgdGFyZ2V0cyBkb24ndCBuZWVkIGRlcHRoIHRlc3RcbiAgICAgICAgLy8gaWYgKHRoaXMuc2hhZG93cyA9PT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIC8vIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuXG4gICAgICAgIGlmICh0aGlzLnBvbHlnb25PZmZzZXQpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5QT0xZR09OX09GRlNFVF9GSUxMKTtcbiAgICAgICAgICAgIGdsLnBvbHlnb25PZmZzZXQodGhpcy5wb2x5Z29uT2Zmc2V0RmFjdG9yLCB0aGlzLnBvbHlnb25PZmZzZXRVbml0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLlBPTFlHT05fT0ZGU0VUX0ZJTEwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaHR0cHM6Ly93ZWJnbDJmdW5kYW1lbnRhbHMub3JnL3dlYmdsL2xlc3NvbnMvd2ViZ2wtdGV4dC10ZXh0dXJlLmh0bWxcbiAgICAgICAgLy8gVGhlIG1vc3QgY29tbW9uIHNvbHV0aW9uIGZvciBwcmV0dHkgbXVjaCBhbGwgdHJhbnNwYXJlbnQgcmVuZGVyaW5nIGlzXG4gICAgICAgIC8vIHRvIGRyYXcgYWxsIHRoZSBvcGFxdWUgc3R1ZmYgZmlyc3QsXG4gICAgICAgIC8vIHRoZW4gYWZ0ZXIsIGRyYXcgYWxsIHRoZSB0cmFuc3BhcmVudCBzdHVmZiBzb3J0ZWQgYnkgeiBkaXN0YW5jZVxuICAgICAgICAvLyB3aXRoIHRoZSBkZXB0aCBidWZmZXIgdGVzdGluZyBvbiBidXQgZGVwdGggYnVmZmVyIHVwZGF0aW5nIG9mZlxuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgICAgICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvdWJsZSBzaWRlIG1hdGVyaWFsXG4gICAgICAgIGlmICh0aGlzLnNpZGUgPT09IFNJREUuRlJPTlQpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWRlID09PSBTSURFLkJBQ0spIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2lkZSA9PT0gU0lERS5CT1RIKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5TaGFkb3dNYXApIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJbnN0YW5jZSkge1xuICAgICAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50c0luc3RhbmNlZChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljZXMudmFsdWUubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBnbC5VTlNJR05FRF9TSE9SVCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRzKCkuaW5zdGFuY2VkQXJyYXlzLmRyYXdFbGVtZW50c0luc3RhbmNlZEFOR0xFKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy52YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JULFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmluZGljZXMpIHtcbiAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyh0aGlzLm1vZGUsIHRoaXMuaW5kaWNlcy52YWx1ZS5sZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXModGhpcy5tb2RlLCAwLCB0aGlzLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZS5sZW5ndGggLyAzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XG4iLCJpbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBEZWZhdWx0IH0gZnJvbSAnLi4vc2hhZGVycyc7XG5pbXBvcnQgeyBTSEFERVJfQ1VTVE9NIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxubGV0IHNoYWRlcklEID0gMDtcbmNsYXNzIE1lc2ggZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLl9zaGFkZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9ID0gcGFyYW1zLmdlb21ldHJ5O1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbW9kZSxcbiAgICAgICAgfSA9IHBhcmFtcy5zaGFkZXIgfHwgbmV3IERlZmF1bHQoeyBjb2xvcjogcGFyYW1zLmNvbG9yLCBtYXA6IHBhcmFtcy5tYXAgfSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBhIHR5cGUsIGFzc2lnbiBpdCwgc28gd2UgY2FuIHNvcnQgYnkgdHlwZSBpbiB0aGUgcmVuZGVyZXIuXG4gICAgICAgIGlmICh0eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBgJHtTSEFERVJfQ1VTVE9NfS0ke3NoYWRlcklEKyt9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV9wb3NpdGlvbicsICd2ZWMzJywgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpKTtcbiAgICAgICAgaWYgKGluZGljZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SW5kZXgobmV3IFVpbnQxNkFycmF5KGluZGljZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9ybWFscykge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2Ffbm9ybWFsJywgJ3ZlYzMnLCBuZXcgRmxvYXQzMkFycmF5KG5vcm1hbHMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXZzKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV91dicsICd2ZWMyJywgbmV3IEZsb2F0MzJBcnJheSh1dnMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0VW5pZm9ybShrZXksIHVuaWZvcm1zW2tleV0udHlwZSwgdW5pZm9ybXNba2V5XS52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U2hhZGVyKHZlcnRleCwgZnJhZ21lbnQpO1xuICAgIH1cblxuICAgIHNldCBzaGFkZXIoc2hhZGVyKSB7XG4gICAgICAgIHRoaXMuZGlydHkuc2hhZGVyID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fc2hhZGVyID0gc2hhZGVyO1xuICAgICAgICBpZiAoc2hhZGVyLnR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gc2hhZGVyLnR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBTSEFERVJfQ1VTVE9NO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U2hhZGVyKHNoYWRlci52ZXJ0ZXgsIHNoYWRlci5mcmFnbWVudCk7XG4gICAgfVxuXG4gICAgZ2V0IHNoYWRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYWRlcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc2g7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBNZXNoIGZyb20gJy4uL2NvcmUvbWVzaCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vY29yZS9tb2RlbCc7XG5pbXBvcnQgeyBCYXNpYyB9IGZyb20gJy4uL3NoYWRlcnMnO1xuXG5jbGFzcyBBeGlzSGVscGVyIGV4dGVuZHMgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCBzaXplID0gKHByb3BzICYmIHByb3BzLnNpemUpIHx8IDEwO1xuICAgICAgICBjb25zdCBnMSA9IHsgcG9zaXRpb25zOiBbLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIDApLCAuLi52ZWMzLmZyb21WYWx1ZXMoc2l6ZSwgMCwgMCldIH07XG4gICAgICAgIGNvbnN0IGcyID0geyBwb3NpdGlvbnM6IFsuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksIC4uLnZlYzMuZnJvbVZhbHVlcygwLCBzaXplLCAwKV0gfTtcbiAgICAgICAgY29uc3QgZzMgPSB7IHBvc2l0aW9uczogWy4uLnZlYzMuZnJvbVZhbHVlcygwLCAwLCAwKSwgLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIHNpemUpXSB9O1xuXG4gICAgICAgIGNvbnN0IG0xID0gbmV3IEJhc2ljKHsgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygxLCAwLCAwKSwgd2lyZWZyYW1lOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBtMiA9IG5ldyBCYXNpYyh7IGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMCksIHdpcmVmcmFtZTogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgbTMgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDAsIDAsIDEpLCB3aXJlZnJhbWU6IHRydWUgfSk7XG5cblxuICAgICAgICBjb25zdCB4ID0gbmV3IE1lc2goeyBnZW9tZXRyeTogZzEsIHNoYWRlcjogbTEgfSk7XG4gICAgICAgIHRoaXMuYWRkKHgpO1xuXG4gICAgICAgIGNvbnN0IHkgPSBuZXcgTWVzaCh7IGdlb21ldHJ5OiBnMiwgc2hhZGVyOiBtMiB9KTtcbiAgICAgICAgdGhpcy5hZGQoeSk7XG5cbiAgICAgICAgY29uc3QgeiA9IG5ldyBNZXNoKHsgZ2VvbWV0cnk6IGczLCBzaGFkZXI6IG0zIH0pO1xuICAgICAgICB0aGlzLmFkZCh6KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBBeGlzSGVscGVyO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgTWVzaCBmcm9tICcuLi9jb3JlL21lc2gnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uL2NvcmUvbW9kZWwnO1xuaW1wb3J0IHsgQmFzaWMgfSBmcm9tICcuLi9zaGFkZXJzJztcbi8vIGltcG9ydCB7IERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBBeGlzSGVscGVyIGV4dGVuZHMgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBjb25zdCBzaXplID0gKHByb3BzICYmIHByb3BzLnNpemUpIHx8IDE7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0ge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBbXSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBleHRyYWN0IGdlb21ldHJ5XG4gICAgICAgIGNvbnN0IHN4ID0gcHJvcHMubW9kZWwuc2NhbGUueDtcbiAgICAgICAgY29uc3Qgc3kgPSBwcm9wcy5tb2RlbC5zY2FsZS55O1xuICAgICAgICBjb25zdCBzeiA9IHByb3BzLm1vZGVsLnNjYWxlLno7XG5cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZS5sZW5ndGggLyAzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpMyA9IGkgKiAzO1xuICAgICAgICAgICAgY29uc3QgdjB4ID0gc3ggKiBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWVbaTMgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IHYweSA9IHN5ICogcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlW2kzICsgMV07XG4gICAgICAgICAgICBjb25zdCB2MHogPSBzeiAqIHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZVtpMyArIDJdO1xuICAgICAgICAgICAgY29uc3QgbnggPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlW2kzICsgMF07XG4gICAgICAgICAgICBjb25zdCBueSA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWVbaTMgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IG56ID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZVtpMyArIDJdO1xuICAgICAgICAgICAgY29uc3QgdjF4ID0gdjB4ICsgKHNpemUgKiBueCk7XG4gICAgICAgICAgICBjb25zdCB2MXkgPSB2MHkgKyAoc2l6ZSAqIG55KTtcbiAgICAgICAgICAgIGNvbnN0IHYxeiA9IHYweiArIChzaXplICogbnopO1xuICAgICAgICAgICAgZ2VvbWV0cnkucG9zaXRpb25zID0gZ2VvbWV0cnkucG9zaXRpb25zLmNvbmNhdChbdjB4LCB2MHksIHYweiwgdjF4LCB2MXksIHYxel0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hhZGVyID0gbmV3IEJhc2ljKHsgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAxKSwgd2lyZWZyYW1lOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBuID0gbmV3IE1lc2goeyBnZW9tZXRyeSwgc2hhZGVyIH0pO1xuICAgICAgICB0aGlzLmFkZChuKTtcblxuICAgICAgICB0aGlzLnJlZmVyZW5jZSA9IHByb3BzLm1vZGVsO1xuICAgICAgICAvLyBtb2RlID0gRFJBVy5MSU5FU1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlKCk7XG5cbiAgICAgICAgdmVjMy5jb3B5KHRoaXMucG9zaXRpb24uZGF0YSwgdGhpcy5yZWZlcmVuY2UucG9zaXRpb24uZGF0YSk7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLnJvdGF0aW9uLmRhdGEsIHRoaXMucmVmZXJlbmNlLnJvdGF0aW9uLmRhdGEpO1xuICAgICAgICB0aGlzLmxvb2tUb1RhcmdldCA9IHRoaXMucmVmZXJlbmNlLmxvb2tUb1RhcmdldDtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBBeGlzSGVscGVyO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZShkb21FbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCByYXRpbykge1xuICAgIGRvbUVsZW1lbnQud2lkdGggPSB3aWR0aCAqIHJhdGlvO1xuICAgIGRvbUVsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0ICogcmF0aW87XG4gICAgZG9tRWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBkb21FbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnN1cHBvcnRlZCgpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gJ1lvdXIgYnJvd3NlciBkb2VzblxcJ3Qgc3VwcG9ydCBXZWJHTC48YnI+PGEgaHJlZj1cImh0dHBzOi8vZ2V0LndlYmdsLm9yZ1wiPkdldCBXZWJHTDwvYT4nO1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlJztcbiAgICBkaXYuc3R5bGUubWFyZ2luID0gJzIwcHggYXV0byAwIGF1dG8nO1xuICAgIGRpdi5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkICMzMzMnO1xuICAgIGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpJztcbiAgICBkaXYuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMTBweCc7XG4gICAgZGl2LnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICBkaXYuc3R5bGUuZm9udFNpemUgPSAnMTJweCc7XG4gICAgZGl2LnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHJldHVybiBkaXY7XG59XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4Jztcbi8vIGltcG9ydCBWZWN0b3IzIGZyb20gJy4uL2NvcmUvdmVjdG9yMyc7XG5pbXBvcnQgeyBESVJFQ1RJT05BTF9MSUdIVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIExpZ2h0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgLy8gVE9ET1xuICAgIH1cbn1cblxuY2xhc3MgRGlyZWN0aW9uYWwgZXh0ZW5kcyBMaWdodCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IERJUkVDVElPTkFMX0xJR0hUO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBwcm9wcy5jb2xvciB8fCB2ZWMzLmZyb21WYWx1ZXMoMSwgMSwgMSk7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gcHJvcHMuaW50ZW5zaXR5IHx8IDAuOTg5O1xuICAgIH1cbn1cblxuZXhwb3J0IHtcbiAgICBEaXJlY3Rpb25hbCxcbn07XG4iLCJpbXBvcnQgeyB2ZWM0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4vb2JqZWN0Myc7XG5pbXBvcnQgeyBEaXJlY3Rpb25hbCB9IGZyb20gJy4vbGlnaHRzJztcbmltcG9ydCB7IERJUkVDVElPTkFMX0xJR0hUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmxpZ2h0cyA9IHtcbiAgICAgICAgICAgIGRpcmVjdGlvbmFsOiBbXSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZvZyA9IHtcbiAgICAgICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBjb2xvcjogdmVjNC5mcm9tVmFsdWVzKDAsIDAsIDAsIDEpLFxuICAgICAgICAgICAgc3RhcnQ6IDUwMCxcbiAgICAgICAgICAgIGVuZDogMTAwMCxcbiAgICAgICAgICAgIGRlbnNpdHk6IDAuMDAwMjUsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGlwcGluZyA9IHtcbiAgICAgICAgICAgIGVuYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBwbGFuZXM6IFtcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gYWRkIHN1blxuICAgICAgICBjb25zdCBkaXJlY3Rpb25hbCA9IG5ldyBEaXJlY3Rpb25hbCh7XG4gICAgICAgICAgICBuZWFyOiAxLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICB9KTtcbiAgICAgICAgZGlyZWN0aW9uYWwucG9zaXRpb25bMF0gPSAxMjU7XG4gICAgICAgIGRpcmVjdGlvbmFsLnBvc2l0aW9uWzFdID0gMjUwO1xuICAgICAgICBkaXJlY3Rpb25hbC5wb3NpdGlvblsyXSA9IDUwMDtcbiAgICAgICAgdGhpcy5hZGRMaWdodChkaXJlY3Rpb25hbCk7XG4gICAgfVxuXG4gICAgYWRkTGlnaHQobGlnaHQpIHtcbiAgICAgICAgc3dpdGNoIChsaWdodC50eXBlKSB7XG4gICAgICAgIGNhc2UgRElSRUNUSU9OQUxfTElHSFQ6XG4gICAgICAgICAgICB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5wdXNoKGxpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gdW5zdXBwb3J0ZWQgbGlnaHRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZUxpZ2h0KGxpZ2h0KSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saWdodHMuZGlyZWN0aW9uYWwuaW5kZXhPZihsaWdodCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGxpZ2h0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMubGlnaHRzLmRpcmVjdGlvbmFsLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lO1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCwgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBSZW5kZXJUYXJnZXQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgLy8gc29tZSBkZWZhdWx0IHByb3BzXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgd2lkdGg6IDUxMixcbiAgICAgICAgICAgIGhlaWdodDogNTEyLFxuICAgICAgICAgICAgaW50ZXJuYWxmb3JtYXQ6IGdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgIHR5cGU6IGdsLlVOU0lHTkVEX1NIT1JULFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsZm9ybWF0ID0gZ2wuREVQVEhfQ09NUE9ORU5UMjQ7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBnbC5VTlNJR05FRF9JTlQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmcmFtZSBidWZmZXJcbiAgICAgICAgdGhpcy5mcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mcmFtZUJ1ZmZlcik7XG5cbiAgICAgICAgLy8gdGV4dHVyZVxuICAgICAgICB0aGlzLnRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBkZXB0aCB0ZXh0dXJlXG4gICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmRlcHRoVGV4dHVyZSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgdGhpcy50eXBlLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgKTtcblxuICAgICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcbiAgICAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgZ2wuQ09MT1JfQVRUQUNITUVOVDAsXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGdsLkRFUFRIX0FUVEFDSE1FTlQsXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUsXG4gICAgICAgICAgICAwLFxuICAgICAgICApO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmRlcHRoVGV4dHVyZSk7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgdGhpcy50eXBlLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlclRhcmdldDtcbiIsImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IFJlbmRlclRhcmdldCBmcm9tICcuL3J0JztcbmltcG9ydCBQZXJzcGVjdGl2ZSBmcm9tICcuLi9jYW1lcmFzL3BlcnNwZWN0aXZlJztcbmltcG9ydCBPcnRob2dyYXBoaWMgZnJvbSAnLi4vY2FtZXJhcy9vcnRob2dyYXBoaWMnO1xuXG5jbGFzcyBTaGFkb3dNYXBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICAvLyBzaXplIG9mIHRleHR1cmVcbiAgICAgICAgdGhpcy53aWR0aCA9IHByb3BzLndpZHRoIHx8IDEwMjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcHJvcHMuaGVpZ2h0IHx8IDEwMjQ7XG5cbiAgICAgICAgLy8gY3JlYXRlIHJlbmRlciB0YXJnZXRcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzO1xuICAgICAgICB0aGlzLnJ0ID0gbmV3IFJlbmRlclRhcmdldCh7IHdpZHRoLCBoZWlnaHQgfSk7XG5cbiAgICAgICAgLy8gbWF0cmljZXNcbiAgICAgICAgdGhpcy5tYXRyaWNlcyA9IHtcbiAgICAgICAgICAgIHZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBzaGFkb3c6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBiaWFzOiBtYXQ0LmZyb21WYWx1ZXMoXG4gICAgICAgICAgICAgICAgMC41LCAwLjAsIDAuMCwgMC4wLFxuICAgICAgICAgICAgICAgIDAuMCwgMC41LCAwLjAsIDAuMCxcbiAgICAgICAgICAgICAgICAwLjAsIDAuMCwgMC41LCAwLjAsXG4gICAgICAgICAgICAgICAgMC41LCAwLjUsIDAuNSwgMS4wLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBvcmlnaW4gb2YgZGlyZWN0aW9uYWwgbGlnaHRcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgUGVyc3BlY3RpdmUoe1xuICAgICAgICAgICAgZm92OiA2MCxcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IE9ydGhvZ3JhcGhpYygpO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gMTsgLy8gVE9ETzogcmVtb3ZlIHRoaXMgd2hlbiBmaXggbG9va0F0IGJ1ZyBvbiBnbC1tYXRyaXhcbiAgICAgICAgdGhpcy5zZXRMaWdodE9yaWdpbihwcm9wcy5saWdodCB8fCB2ZWMzLmZyb21WYWx1ZXMoMTAwLCAyNTAsIDUwMCkpO1xuICAgIH1cblxuICAgIC8vIG1vdmUgdGhlIGNhbWVyYSB0byB0aGUgbGlnaHQgcG9zaXRpb25cbiAgICBzZXRMaWdodE9yaWdpbih2ZWMpIHtcbiAgICAgICAgLy8gQ0FNRVJBXG5cbiAgICAgICAgLy8gdXBkYXRlIGNhbWVyYSBwb3NpdGlvblxuICAgICAgICB2ZWMzLmNvcHkodGhpcy5jYW1lcmEucG9zaXRpb24uZGF0YSwgdmVjKTtcblxuICAgICAgICAvLyB1cGRhdGUgdmlldyBtYXRyaXhcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpY2VzLnZpZXcpO1xuICAgICAgICBtYXQ0Lmxvb2tBdChcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMudmlldyxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLmRhdGEsXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS50YXJnZXQsXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS51cCxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBTSEFET1dcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpY2VzLnNoYWRvdyk7XG4gICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5tYXRyaWNlcy5zaGFkb3csIHRoaXMuY2FtZXJhLm1hdHJpY2VzLnByb2plY3Rpb24sIHRoaXMubWF0cmljZXMudmlldyk7XG4gICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5tYXRyaWNlcy5zaGFkb3csIHRoaXMubWF0cmljZXMuYmlhcywgdGhpcy5tYXRyaWNlcy5zaGFkb3cpO1xuICAgIH1cblxuICAgIC8qXG4gICAgVE9ETzpcbiAgICBtYXliZSBjcmVhdGUgYSBwcm9ncmFtIGp1c3QgZm9yIHNoYWRvd3MuIHRoaXMgYXZvaWRzIGhhdmluZyB0byBjaGFuZ2UgcHJvZ3JhbVxuICAgIGluIGNvbXBsZXggc2NlbmVzIGp1c3QgdG8gd3JpdGUgZm9yIHRoZSBkZXB0aCBidWZmZXIuXG4gICAgZmluZCBhIHdheSB0byBieXBhc3MgdGhlIGNoYW5nZVByb2dyYW0gb24gdGhlIHJlbmRlcmVyIHRvIGFjY29tb2RhdGUgdGhpcy5cbiAgICAqL1xufVxuXG5leHBvcnQgZGVmYXVsdCBTaGFkb3dNYXBSZW5kZXJlcjtcbiIsImltcG9ydCB7IHZlYzQsIG1hdDQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgbGlicmFyeSwgdmVyc2lvbiwgc2V0Q29udGV4dCwgZ2V0Q29udGV4dCwgc2V0Q29udGV4dFR5cGUsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCwgTUFYX0RJUkVDVElPTkFMIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IHJlc2l6ZSwgdW5zdXBwb3J0ZWQgfSBmcm9tICcuLi91dGlscy9kb20nO1xuaW1wb3J0IHsgVWJvIH0gZnJvbSAnLi4vZ2wnO1xuXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi9zY2VuZSc7XG5pbXBvcnQgU2hhZG93TWFwUmVuZGVyZXIgZnJvbSAnLi9zaGFkb3ctbWFwLXJlbmRlcmVyJztcblxubGV0IGxhc3RQcm9ncmFtO1xuXG5sZXQgc29ydCA9IGZhbHNlO1xuY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbmxldCBXRUJHTDIgPSBmYWxzZTtcblxuY29uc3QgdGltZSA9IHZlYzQuY3JlYXRlKCk7XG5jb25zdCBmb2cgPSB2ZWM0LmNyZWF0ZSgpO1xuXG5jb25zdCBtYXRyaWNlcyA9IHtcbiAgICB2aWV3OiBtYXQ0LmNyZWF0ZSgpLFxuICAgIG5vcm1hbDogbWF0NC5jcmVhdGUoKSxcbiAgICBtb2RlbFZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgaW52ZXJzZWRNb2RlbFZpZXc6IG1hdDQuY3JlYXRlKCksXG59O1xuXG5sZXQgY2FjaGVkU2NlbmUgPSBudWxsOyAvLyBzY2VuZVxubGV0IGNhY2hlZENhbWVyYSA9IG51bGw7IC8vIGNhbWVyYVxuXG5jbGFzcyBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICB0aGlzLnN1cHBvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc29ydGVkID0ge1xuICAgICAgICAgICAgb3BhcXVlOiBbXSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBbXSxcbiAgICAgICAgICAgIHNoYWRvdzogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgICAgICAgIG9wYXF1ZTogMCxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAwLFxuICAgICAgICAgICAgc2hhZG93OiAwLFxuICAgICAgICAgICAgdmVydGljZXM6IDAsXG4gICAgICAgICAgICBpbnN0YW5jZXM6IDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yYXRpbyA9IHByb3BzLnJhdGlvIHx8IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLnNoYWRvd3MgPSBwcm9wcy5zaGFkb3dzIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSBwcm9wcy5jYW52YXMgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICAgICAgY29uc3QgY29udGV4dFR5cGUgPSBzZXRDb250ZXh0VHlwZShwcm9wcy5jb250ZXh0VHlwZSk7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5kb21FbGVtZW50LmdldENvbnRleHQoY29udGV4dFR5cGUsIE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgICAgIH0sIHByb3BzKSk7XG5cbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdsICYmXG4gICAgICAgICAgICAoKHNlc3Npb24udmVydGV4QXJyYXlPYmplY3QgJiZcbiAgICAgICAgICAgIHNlc3Npb24uaW5zdGFuY2VkQXJyYXlzICYmXG4gICAgICAgICAgICBzZXNzaW9uLnN0YW5kYXJkRGVyaXZhdGl2ZXMgJiZcbiAgICAgICAgICAgIHNlc3Npb24uZGVwdGhUZXh0dXJlcykgfHwgd2luZG93LmdsaSAhPT0gbnVsbClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuZ3JlZXRpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGliID0gJ2NvbG9yOiM2NjY7Zm9udC1zaXplOngtc21hbGw7Zm9udC13ZWlnaHQ6Ym9sZDsnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAnY29sb3I6Izc3Nztmb250LXNpemU6eC1zbWFsbCc7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gJ2NvbG9yOiNmMzM7Zm9udC1zaXplOngtc21hbGwnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICAgICAgICAgIGAlYyR7bGlicmFyeX0gLSAlY3ZlcnNpb246ICVjJHt2ZXJzaW9ufSAlY3J1bm5pbmc6ICVjJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuVkVSU0lPTil9YCxcbiAgICAgICAgICAgICAgICAgICAgbGliLCBwYXJhbWV0ZXJzLCB2YWx1ZXMsIHBhcmFtZXRlcnMsIHZhbHVlcyxcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldENvbnRleHQoZ2wpO1xuXG4gICAgICAgICAgICBXRUJHTDIgPSBnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMjtcblxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSB1bnN1cHBvcnRlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5zdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMucGVyU2NlbmUgPSBuZXcgVWJvKFtcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBwcm9qZWN0aW9uIG1hdHJpeFxuICAgICAgICAgICAgICAgIC4uLm1hdDQuY3JlYXRlKCksIC8vIHZpZXcgbWF0cml4XG4gICAgICAgICAgICAgICAgLi4uZm9nLCAvLyBmb2cgdmVjNCh1c2VfZm9nLCBzdGFydCwgZW5kLCBkZW5zaXR5KVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGZvZyBjb2xvclxuICAgICAgICAgICAgICAgIC4uLnRpbWUsIC8vIHZlYzQoaUdsb2JhbFRpbWUsIEVNUFRZLCBFTVBUWSwgRU1QVFkpXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXAgc2V0dGluZ3MgKHVzZV9jbGlwcGluZywgRU1QVFksIEVNUFRZLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXBwaW5nIHBsYW5lIDBcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBnbG9iYWwgY2xpcHBpbmcgcGxhbmUgMVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAyXG4gICAgICAgICAgICBdLCAwKTtcblxuICAgICAgICAgICAgdGhpcy5wZXJNb2RlbCA9IG5ldyBVYm8oW1xuICAgICAgICAgICAgICAgIC4uLm1hdDQuY3JlYXRlKCksIC8vIG1vZGVsIG1hdHJpeFxuICAgICAgICAgICAgICAgIC4uLm1hdDQuY3JlYXRlKCksIC8vIG5vcm1hbCBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwIHNldHRpbmdzICh1c2VfY2xpcHBpbmcsIEVNUFRZLCBFTVBUWSwgRU1QVFkpO1xuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXBwaW5nIHBsYW5lIDBcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwcGluZyBwbGFuZSAxXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcHBpbmcgcGxhbmUgMlxuICAgICAgICAgICAgXSwgMSk7XG5cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwgPSBuZXcgVWJvKG5ldyBGbG9hdDMyQXJyYXkoTUFYX0RJUkVDVElPTkFMICogMTIpLCAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNoYWRvd3NcbiAgICAgICAgdGhpcy5zaGFkb3dtYXAgPSBuZXcgU2hhZG93TWFwUmVuZGVyZXIoKTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuICAgICAgICByZXNpemUodGhpcy5kb21FbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCB0aGlzLnJhdGlvKTtcbiAgICB9XG5cbiAgICBzZXRSYXRpbyh2YWx1ZSkge1xuICAgICAgICB0aGlzLnJhdGlvID0gdmFsdWU7XG4gICAgfVxuXG4gICAgY2hhbmdlUHJvZ3JhbShwcm9ncmFtKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNMb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sICdwZXJTY2VuZScpO1xuICAgICAgICAgICAgY29uc3QgbUxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgJ3Blck1vZGVsJyk7XG4gICAgICAgICAgICBjb25zdCBkTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCAnZGlyZWN0aW9uYWwnKTtcbiAgICAgICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgc0xvY2F0aW9uLCB0aGlzLnBlclNjZW5lLmJvdW5kTG9jYXRpb24pO1xuICAgICAgICAgICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhwcm9ncmFtLCBtTG9jYXRpb24sIHRoaXMucGVyTW9kZWwuYm91bmRMb2NhdGlvbik7XG5cbiAgICAgICAgICAgIC8vIGlzIGRpcmVjdGlvbmFsIGxpZ2h0IGluIHNoYWRlclxuICAgICAgICAgICAgaWYgKGRMb2NhdGlvbiA9PT0gdGhpcy5kaXJlY3Rpb25hbC5ib3VuZExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhwcm9ncmFtLCBkTG9jYXRpb24sIHRoaXMuZGlyZWN0aW9uYWwuYm91bmRMb2NhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KHNjZW5lLCBjYW1lcmEsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuICAgICAgICAvLyBvbmx5IG5lY2Vzc2FyeSBmb3Igd2ViZ2wxIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGNhY2hlZFNjZW5lID0gc2NlbmU7XG4gICAgICAgIGNhY2hlZENhbWVyYSA9IGNhbWVyYTtcblxuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cbiAgICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cblxuICAgICAgICBjYW1lcmEudXBkYXRlQ2FtZXJhTWF0cml4KHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIC8vIGNvbW1vbiBtYXRyaWNlc1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLnZpZXcpO1xuICAgICAgICBtYXQ0Lmxvb2tBdChtYXRyaWNlcy52aWV3LCBjYW1lcmEucG9zaXRpb24uZGF0YSwgY2FtZXJhLnRhcmdldCwgY2FtZXJhLnVwKTtcblxuICAgICAgICAvLyBjaGVjayBpZiBzb3J0aW5nIGlzIG5lZWRlZCB3aGlsc3QgdHJhdmVyc2luZyB0aHJvdWdoIHRoZSBzY2VuZSBncmFwaFxuICAgICAgICBzb3J0ID0gc2NlbmUudHJhdmVyc2UoKTtcblxuICAgICAgICAvLyBpZiBzb3J0aW5nIGlzIG5lZWRlZCwgcmVzZXQgc3R1ZmZcbiAgICAgICAgaWYgKHNvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLm9wYXF1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLnNoYWRvdyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBjYW4gYmUgZGVwcmVjYXRlZCwgYnV0IGl0cyBraW5kIG9mIGNvb2xcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uub3BhcXVlID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudHJhbnNwYXJlbnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5zaGFkb3cgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS52ZXJ0aWNlcyA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLmluc3RhbmNlcyA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuc29ydChzY2VuZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGltZVxuICAgICAgICB0aW1lWzBdID0gKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICAgICAgZm9nWzBdID0gc2NlbmUuZm9nLmVuYWJsZTtcbiAgICAgICAgZm9nWzFdID0gc2NlbmUuZm9nLnN0YXJ0O1xuICAgICAgICBmb2dbMl0gPSBzY2VuZS5mb2cuZW5kO1xuICAgICAgICBmb2dbM10gPSBzY2VuZS5mb2cuZGVuc2l0eTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICAvLyBiaW5kIGNvbW1vbiBidWZmZXJzXG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lLmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwuYmluZCgpO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25hbC5iaW5kKCk7XG5cbiAgICAgICAgICAgIHRoaXMucGVyU2NlbmUudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAuLi5jYW1lcmEubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgICAgICAuLi5tYXRyaWNlcy52aWV3LFxuICAgICAgICAgICAgICAgIC4uLmZvZyxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5mb2cuY29sb3IsXG4gICAgICAgICAgICAgICAgLi4udGltZSxcbiAgICAgICAgICAgICAgICAuLi5bc2NlbmUuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5jbGlwcGluZy5wbGFuZXNbMF0sXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuY2xpcHBpbmcucGxhbmVzWzFdLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmNsaXBwaW5nLnBsYW5lc1syXSxcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAgICAgLi4uWy4uLnNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFtpXS5wb3NpdGlvbiwgMF0sXG4gICAgICAgICAgICAgICAgICAgIC4uLlsuLi5zY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbaV0uY29sb3IsIDBdLFxuICAgICAgICAgICAgICAgICAgICAuLi5bc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsW2ldLmludGVuc2l0eSwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgXSwgaSAqIDEyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBsaWdodCBpbiBzaGFkb3dtYXBcbiAgICAgICAgdGhpcy5zaGFkb3dtYXAuc2V0TGlnaHRPcmlnaW4oc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsWzBdLnBvc2l0aW9uKTtcblxuICAgICAgICAvLyAxKSByZW5kZXIgb2JqZWN0cyB0byBzaGFkb3dtYXBcbiAgICAgICAgaWYgKHRoaXMucmVuZGVyU2hhZG93KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkLnNoYWRvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyT2JqZWN0KHRoaXMuc29ydGVkLnNoYWRvd1tpXSwgdGhpcy5zb3J0ZWQuc2hhZG93W2ldLnByb2dyYW0sIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMikgcmVuZGVyIG9wYXF1ZSBvYmplY3RzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3J0ZWQub3BhcXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdCh0aGlzLnNvcnRlZC5vcGFxdWVbaV0sIHRoaXMuc29ydGVkLm9wYXF1ZVtpXS5wcm9ncmFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMpIHNvcnQgYW5kIHJlbmRlciB0cmFuc3BhcmVudCBvYmplY3RzXG4gICAgICAgIC8vIGV4cGVuc2l2ZSB0byBzb3J0IHRyYW5zcGFyZW50IGl0ZW1zIHBlciB6LWluZGV4LlxuICAgICAgICB0aGlzLnNvcnRlZC50cmFuc3BhcmVudC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGEucG9zaXRpb24ueiAtIGIucG9zaXRpb24ueik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyT2JqZWN0KHRoaXMuc29ydGVkLnRyYW5zcGFyZW50W2ldLCB0aGlzLnNvcnRlZC50cmFuc3BhcmVudFtpXS5wcm9ncmFtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDQpIHJlbmRlciBndWlcbiAgICAgICAgLy8gVE9ET1xuICAgIH1cblxuICAgIHJ0dCh7XG4gICAgICAgIHJlbmRlclRhcmdldCxcbiAgICAgICAgc2NlbmUsXG4gICAgICAgIGNhbWVyYSxcbiAgICAgICAgY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSxcbiAgICB9KSB7IC8vIG1heWJlIG9yZGVyIGlzIGltcG9ydGFudFxuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCByZW5kZXJUYXJnZXQuZnJhbWVCdWZmZXIpO1xuXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHJlbmRlclRhcmdldC53aWR0aCwgcmVuZGVyVGFyZ2V0LmhlaWdodCk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoLi4uY2xlYXJDb2xvcik7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgICAgICB0aGlzLmRyYXcoc2NlbmUsIGNhbWVyYSwgcmVuZGVyVGFyZ2V0LndpZHRoLCByZW5kZXJUYXJnZXQuaGVpZ2h0KTtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCByZW5kZXJUYXJnZXQudGV4dHVyZSk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICAvLyByZW5kZXIgc2hhZG93c1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dzKSB7XG4gICAgICAgICAgICAvLyByZW5kZXIgc2NlbmUgdG8gdGV4dHVyZVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ydHQoe1xuICAgICAgICAgICAgICAgIHJlbmRlclRhcmdldDogdGhpcy5zaGFkb3dtYXAucnQsXG4gICAgICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLnNoYWRvd21hcC5jYW1lcmEsXG4gICAgICAgICAgICAgICAgY2xlYXJDb2xvcjogWzEsIDEsIDEsIDFdLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyU2hhZG93ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW5kZXIgc2NlbmVcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLCAwLCAwLCAxKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgICAgIHRoaXMuZHJhdyhzY2VuZSwgY2FtZXJhLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vIFRPRE86IHJlbmRlciBHVUkgb2JqZWN0c1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpY2VzKG1hdHJpeCkge1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLm1vZGVsVmlldyk7XG4gICAgICAgIG1hdDQuY29weShtYXRyaWNlcy5tb2RlbFZpZXcsIG1hdHJpeCk7XG4gICAgICAgIG1hdDQuaW52ZXJ0KG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3LCBtYXRyaWNlcy5tb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LnRyYW5zcG9zZShtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldywgbWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLm5vcm1hbCk7XG4gICAgICAgIG1hdDQuY29weShtYXRyaWNlcy5ub3JtYWwsIG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3KTtcbiAgICB9XG5cbiAgICBzb3J0KG9iamVjdCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9iamVjdC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zb3J0KG9iamVjdC5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0LnZpc2libGUgJiYgIShvYmplY3QgaW5zdGFuY2VvZiBTY2VuZSkpIHtcbiAgICAgICAgICAgIC8vIGFkZHMgb2JqZWN0IHRvIGEgb3BhcXVlIG9yIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBpZiAob2JqZWN0LnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQucHVzaChvYmplY3QpO1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudHJhbnNwYXJlbnQrKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQub3BhcXVlLnB1c2gob2JqZWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLm9wYXF1ZSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBzaGFkb3dzIGVuYWJsZWQgb24gcmVuZGVyZXIsIGFuZCBzaGFkb3dzIGFyZSBlbmFibGVkIG9uIG9iamVjdFxuICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93cyAmJiBvYmplY3Quc2hhZG93cykge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLnNoYWRvdy5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5zaGFkb3crKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY291bnQgdmVydGljZSBudW1iZXJcbiAgICAgICAgICAgIGlmIChvYmplY3QuYXR0cmlidXRlcy5hX3Bvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS52ZXJ0aWNlcyArPSBvYmplY3QuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlLmxlbmd0aCAvIDM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvdW50IGluc3RhbmNlc1xuICAgICAgICAgICAgaWYgKG9iamVjdC5pc0luc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5pbnN0YW5jZXMgKz0gb2JqZWN0Lmluc3RhbmNlQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzb3J0aW5nIGNvbXBsZXRlXG4gICAgICAgIG9iamVjdC5kaXJ0eS5zb3J0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyT2JqZWN0KG9iamVjdCwgcHJvZ3JhbSwgaW5TaGFkb3dNYXAgPSBmYWxzZSkge1xuICAgICAgICAvLyBpdHMgdGhlIHBhcmVudCBub2RlIChzY2VuZS5qcylcbiAgICAgICAgaWYgKG9iamVjdC5wYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlTWF0cmljZXMob2JqZWN0Lm1hdHJpY2VzLm1vZGVsKTtcblxuICAgICAgICBpZiAob2JqZWN0LmRpcnR5LnNoYWRlcikge1xuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnNoYWRlciA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAocHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIG9iamVjdC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByb2dyYW0pIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KTtcbiAgICAgICAgICAgIG9iamVjdC5pbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdFByb2dyYW0gIT09IHByb2dyYW0pIHtcbiAgICAgICAgICAgIGxhc3RQcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlUHJvZ3JhbShsYXN0UHJvZ3JhbSwgb2JqZWN0LnR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqZWN0LmJpbmQoKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KTtcblxuICAgICAgICBvYmplY3QudXBkYXRlKGluU2hhZG93TWFwKTtcbiAgICAgICAgb2JqZWN0LmRyYXcoKTtcblxuICAgICAgICBvYmplY3QudW5iaW5kKCk7XG4gICAgfVxuXG4gICAgaW5pdFVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KSB7XG4gICAgICAgIGlmICghV0VCR0wyKSB7XG4gICAgICAgICAgICAvLyBwZXIgc2NlbmVcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdwcm9qZWN0aW9uTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCd2aWV3TWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdmb2dTZXR0aW5ncycsICd2ZWM0JywgZm9nKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdmb2dDb2xvcicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnaUdsb2JhbFRpbWUnLCAnZmxvYXQnLCB0aW1lWzBdKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwU2V0dGluZ3MnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTAnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTEnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTInLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgLy8gcGVyIG9iamVjdFxuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ21vZGVsTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdub3JtYWxNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFNldHRpbmdzJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBQbGFuZTAnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFBsYW5lMScsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwUGxhbmUyJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcblxuICAgICAgICAgICAgLy8gbGlnaHRzXG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZGxQb3NpdGlvbicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZGxDb2xvcicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZmxJbnRlbnNpdHknLCAnZmxvYXQnLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dNYXAnLCAnc2FtcGxlcjJEJywgMCk7XG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TmVhcicsICdmbG9hdCcsIDApO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93RmFyJywgJ2Zsb2F0JywgMCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVW5pZm9ybXNQZXJNb2RlbChvYmplY3QpIHtcbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgdGhpcy5wZXJNb2RlbC51cGRhdGUoW1xuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5tYXRyaWNlcy5tb2RlbCxcbiAgICAgICAgICAgICAgICAuLi5tYXRyaWNlcy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgLi4uW29iamVjdC5jbGlwcGluZy5lbmFibGUsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF0sXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0LmNsaXBwaW5nLnBsYW5lc1sxXSxcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QuY2xpcHBpbmcucGxhbmVzWzJdLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBiZWNhdXNlIFVCTyBhcmUgd2ViZ2wyIG9ubHksIHdlIG5lZWQgdG8gbWFudWFsbHkgYWRkIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIC8vIGFzIHVuaWZvcm1zXG4gICAgICAgICAgICAvLyBwZXIgc2NlbmUgdW5pZm9ybXMgdXBkYXRlXG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeC52YWx1ZSA9IGNhY2hlZENhbWVyYS5tYXRyaWNlcy5wcm9qZWN0aW9uO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnZpZXdNYXRyaXgudmFsdWUgPSBtYXRyaWNlcy52aWV3O1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmZvZ1NldHRpbmdzLnZhbHVlID0gZm9nO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmZvZ0NvbG9yLnZhbHVlID0gY2FjaGVkU2NlbmUuZm9nLmNvbG9yO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmlHbG9iYWxUaW1lLnZhbHVlID0gdGltZVswXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwU2V0dGluZ3MudmFsdWUgPSBbY2FjaGVkU2NlbmUuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwUGxhbmUwLnZhbHVlID0gY2FjaGVkU2NlbmUuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBQbGFuZTEudmFsdWUgPSBjYWNoZWRTY2VuZS5jbGlwcGluZy5wbGFuZXNbMV07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFBsYW5lMi52YWx1ZSA9IGNhY2hlZFNjZW5lLmNsaXBwaW5nLnBsYW5lc1syXTtcblxuICAgICAgICAgICAgLy8gcGVyIG1vZGVsIHVuaWZvcm1zIHVwZGF0ZVxuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLm1vZGVsTWF0cml4LnZhbHVlID0gb2JqZWN0Lm1hdHJpY2VzLm1vZGVsO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLm5vcm1hbE1hdHJpeC52YWx1ZSA9IG1hdHJpY2VzLm5vcm1hbDtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBTZXR0aW5ncy52YWx1ZSA9IFtvYmplY3QuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBQbGFuZTAudmFsdWUgPSBvYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFBsYW5lMS52YWx1ZSA9IG9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwUGxhbmUyLnZhbHVlID0gb2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRlc3QgU0hBRE9XXG4gICAgICAgIG9iamVjdC51bmlmb3Jtcy5zaGFkb3dNYXAudmFsdWUgPSB0aGlzLnNoYWRvd21hcC5ydC5kZXB0aFRleHR1cmU7XG4gICAgICAgIG9iamVjdC51bmlmb3Jtcy5zaGFkb3dNYXRyaXgudmFsdWUgPSB0aGlzLnNoYWRvd21hcC5tYXRyaWNlcy5zaGFkb3c7XG4gICAgICAgIG9iamVjdC51bmlmb3Jtcy5zaGFkb3dOZWFyLnZhbHVlID0gdGhpcy5zaGFkb3dtYXAuY2FtZXJhLm5lYXI7XG4gICAgICAgIG9iamVjdC51bmlmb3Jtcy5zaGFkb3dGYXIudmFsdWUgPSB0aGlzLnNoYWRvd21hcC5jYW1lcmEuZmFyO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyZXI7XG4iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi9zY2VuZSc7XG5pbXBvcnQgTWVzaCBmcm9tICcuL21lc2gnO1xuaW1wb3J0IHsgVUJPIH0gZnJvbSAnLi4vc2hhZGVycy9jaHVua3MnO1xuXG5jbGFzcyBQYXNzIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFNjZW5lKCk7XG5cbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcyB9ID0gcHJvcHM7XG5cbiAgICAgICAgdGhpcy52ZXJ0ZXggPSB2ZXJ0ZXg7XG4gICAgICAgIHRoaXMuZnJhZ21lbnQgPSBmcmFnbWVudDtcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHVuaWZvcm1zO1xuXG4gICAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb21waWxlKCkge1xuICAgICAgICBjb25zdCBzaGFkZXIgPSB7XG4gICAgICAgICAgICB2ZXJ0ZXg6IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG4gICAgICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgICAgICBpbiB2ZWMyIGFfdXY7XG5cbiAgICAgICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG5cbiAgICAgICAgICAgICAgICAke3RoaXMudmVydGV4fWAsXG5cbiAgICAgICAgICAgIGZyYWdtZW50OiBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG5cbiAgICAgICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcbiAgICAgICAgICAgICAgICAke3RoaXMuZnJhZ21lbnR9YCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0ge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBbLTEsIC0xLCAwLCAxLCAtMSwgMCwgMSwgMSwgMCwgLTEsIDEsIDBdLFxuICAgICAgICAgICAgaW5kaWNlczogWzAsIDEsIDIsIDAsIDIsIDNdLFxuICAgICAgICAgICAgdXZzOiBbMCwgMCwgMSwgMCwgMSwgMSwgMCwgMV0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucXVhZCA9IG5ldyBNZXNoKHsgZ2VvbWV0cnksIHNoYWRlciB9KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5xdWFkKTtcbiAgICB9XG5cbiAgICBzZXRVbmlmb3JtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5xdWFkLnVuaWZvcm1zW2tleV0udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhc3M7XG4iLCJjb25zdCBCYXNpYyA9IHtcblxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgfSxcblxuICAgIHZlcnRleDogYFxuICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgIHZfdXYgPSBhX3V2O1xuICAgIH1gLFxuXG4gICAgZnJhZ21lbnQ6IGBcbiAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2lucHV0O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBvdXRDb2xvciA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG4gICAgfWAsXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2ljO1xuIiwiaW1wb3J0IHsgdmVjNCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBPcnRob2dyYXBoaWMgfSBmcm9tICcuLi9jYW1lcmFzJztcbmltcG9ydCBSZW5kZXJlciBmcm9tICcuL3JlbmRlcmVyJztcbmltcG9ydCBSZW5kZXJUYXJnZXQgZnJvbSAnLi9ydCc7XG5pbXBvcnQgUGFzcyBmcm9tICcuL3Bhc3MnO1xuaW1wb3J0IHsgQmFzaWMgfSBmcm9tICcuLi9wYXNzZXMnO1xuXG5jbGFzcyBDb21wb3NlciB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcblxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBPcnRob2dyYXBoaWMoKTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IDEwMDtcblxuICAgICAgICB0aGlzLnBhc3NlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY2xlYXJDb2xvciA9IHZlYzQuZnJvbVZhbHVlcygwLCAwLCAwLCAxKTtcblxuICAgICAgICB0aGlzLnNjcmVlbiA9IG5ldyBQYXNzKEJhc2ljKTtcbiAgICAgICAgdGhpcy5zY3JlZW4uY29tcGlsZSgpO1xuXG4gICAgICAgIHRoaXMuYnVmZmVycyA9IFtcbiAgICAgICAgICAgIG5ldyBSZW5kZXJUYXJnZXQoKSxcbiAgICAgICAgICAgIG5ldyBSZW5kZXJUYXJnZXQoKSxcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLnJlYWQgPSB0aGlzLmJ1ZmZlcnNbMV07XG4gICAgICAgIHRoaXMud3JpdGUgPSB0aGlzLmJ1ZmZlcnNbMF07XG4gICAgfVxuXG4gICAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZWFkLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMud3JpdGUuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBzZXRSYXRpbyhyYXRpbykge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFJhdGlvKHJhdGlvKTtcbiAgICB9XG5cbiAgICBwYXNzKHBhc3MpIHtcbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICB9XG5cbiAgICBjb21waWxlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBhc3Nlc1tpXS5jb21waWxlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXJUb1RleHR1cmUocmVuZGVyVGFyZ2V0LCBzY2VuZSwgY2FtZXJhKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIucnR0KHtcbiAgICAgICAgICAgIHJlbmRlclRhcmdldCxcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgY2FtZXJhLFxuICAgICAgICAgICAgY2xlYXJDb2xvcjogdGhpcy5jbGVhckNvbG9yLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXNldEJ1ZmZlcnMoKSB7XG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMuYnVmZmVyc1sxXTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHRoaXMuYnVmZmVyc1swXTtcbiAgICB9XG5cbiAgICBzd2FwQnVmZmVycygpIHtcbiAgICAgICAgdGhpcy50ZW1wID0gdGhpcy5yZWFkO1xuICAgICAgICB0aGlzLnJlYWQgPSB0aGlzLndyaXRlO1xuICAgICAgICB0aGlzLndyaXRlID0gdGhpcy50ZW1wO1xuICAgIH1cblxuICAgIHJlbmRlcihzY2VuZSwgY2FtZXJhKSB7XG4gICAgICAgIHRoaXMucmVzZXRCdWZmZXJzKCk7XG4gICAgICAgIHRoaXMucmVuZGVyVG9UZXh0dXJlKHRoaXMud3JpdGUsIHNjZW5lLCBjYW1lcmEpO1xuXG4gICAgICAgIC8vIHBpbmcgcG9uZyB0ZXh0dXJlcyB0aHJvdWdoIHBhc3Nlc1xuICAgICAgICBjb25zdCB0b3RhbCA9IHRoaXMucGFzc2VzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXNzZXNbaV0uZW5hYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zd2FwQnVmZmVycygpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc2VzW2ldLnNldFVuaWZvcm0oJ3VfaW5wdXQnLCB0aGlzLnJlYWQudGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUb1RleHR1cmUodGhpcy53cml0ZSwgdGhpcy5wYXNzZXNbaV0uc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbmRlciBsYXN0IHBhc3MgdG8gc2NyZWVuXG4gICAgICAgIHRoaXMuc2NyZWVuLnNldFVuaWZvcm0oJ3VfaW5wdXQnLCB0aGlzLndyaXRlLnRleHR1cmUpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjcmVlbi5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9zZXI7XG4iLCJjbGFzcyBQZXJmb3JtYW5jZSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgdGhpcy50aGVtZSA9IHBhcmFtcy50aGVtZSB8fCB7XG4gICAgICAgICAgICBmb250OiAnZm9udC1mYW1pbHk6c2Fucy1zZXJpZjtmb250LXNpemU6eHgtc21hbGw7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4Oy1tb3otb3N4LWZvbnQtc21vb3RoaW5nOiBncmF5c2NhbGU7LXdlYmtpdC1mb250LXNtb290aGluZzogYW50aWFsaWFzZWQ7JyxcbiAgICAgICAgICAgIGNvbG9yMTogJyMyNDI0MjQnLFxuICAgICAgICAgICAgY29sb3IyOiAnIzJhMmEyYScsXG4gICAgICAgICAgICBjb2xvcjM6ICcjNjY2JyxcbiAgICAgICAgICAgIGNvbG9yNDogJyM5OTknLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDtib3R0b206MDtsZWZ0OjA7bWluLXdpZHRoOjgwcHg7b3BhY2l0eTowLjk7ei1pbmRleDoxMDAwMDsnO1xuXG4gICAgICAgIHRoaXMuaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuaG9sZGVyLnN0eWxlLmNzc1RleHQgPSBgcGFkZGluZzozcHg7YmFja2dyb3VuZC1jb2xvcjoke3RoaXMudGhlbWUuY29sb3IxfTtgO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ob2xkZXIpO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBgJHt0aGlzLnRoZW1lLmZvbnR9O2NvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjN9O2A7XG4gICAgICAgIHRpdGxlLmlubmVySFRNTCA9ICdQZXJmb3JtYW5jZSc7XG4gICAgICAgIHRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgICAgICB0aGlzLm1zVGV4dHMgPSBbXTtcblxuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjb250YWluZXI7XG4gICAgfVxuXG4gICAgcmVidWlsZChwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5tc1RleHRzID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBgJHt0aGlzLnRoZW1lLmZvbnR9O2NvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjR9O2JhY2tncm91bmQtY29sb3I6JHt0aGlzLnRoZW1lLmNvbG9yMn07YDtcbiAgICAgICAgICAgIHRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5tc1RleHRzW2tleV0gPSBlbGVtZW50O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGUocmVuZGVyZXIpIHtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXNUZXh0cykubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhyZW5kZXJlci5wZXJmb3JtYW5jZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnJlYnVpbGQocmVuZGVyZXIucGVyZm9ybWFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXMocmVuZGVyZXIucGVyZm9ybWFuY2UpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tc1RleHRzW2tleV0udGV4dENvbnRlbnQgPSBgJHtrZXl9OiAke3JlbmRlcmVyLnBlcmZvcm1hbmNlW2tleV19YDtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQZXJmb3JtYW5jZTtcbiJdLCJuYW1lcyI6WyJMSUdIVCIsImZhY3RvcnkiLCJkaXJlY3Rpb25hbCIsImJhc2UiLCJGT0ciLCJsaW5lYXIiLCJleHBvbmVudGlhbCIsImV4cG9uZW50aWFsMiIsIk1BWF9ESVJFQ1RJT05BTCIsIkRJUkVDVElPTkFMX0xJR0hUIiwiU0hBREVSX0JBU0lDIiwiU0hBREVSX0RFRkFVTFQiLCJTSEFERVJfQklMTEJPQVJEIiwiU0hBREVSX1NIQURPVyIsIlNIQURFUl9TRU0iLCJTSEFERVJfQ1VTVE9NIiwiRFJBVyIsIlBPSU5UUyIsIkxJTkVTIiwiVFJJQU5HTEVTIiwiU0lERSIsIkZST05UIiwiQkFDSyIsIkJPVEgiLCJDT05URVhUIiwiV0VCR0wiLCJXRUJHTDIiLCJsaWJyYXJ5IiwidmVyc2lvbiIsImdsIiwiY29udGV4dFR5cGUiLCJ0ZXN0Q29udGV4dDEiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRDb250ZXh0IiwidGVzdENvbnRleHQyIiwiZXh0ZW5zaW9ucyIsInZlcnRleEFycmF5T2JqZWN0IiwiZ2V0RXh0ZW5zaW9uIiwiaW5zdGFuY2VkQXJyYXlzIiwic3RhbmRhcmREZXJpdmF0aXZlcyIsImRlcHRoVGV4dHVyZXMiLCJzZXRDb250ZXh0VHlwZSIsInByZWZlcnJlZCIsImdsMiIsImdsMSIsImRlcHRoVGV4dHVyZSIsImdldENvbnRleHRUeXBlIiwic2V0Q29udGV4dCIsImNvbnRleHQiLCJzdXBwb3J0cyIsIlVCTyIsInNjZW5lIiwibW9kZWwiLCJsaWdodHMiLCJOT0lTRSIsIkNMSVBQSU5HIiwidmVydGV4X3ByZSIsInZlcnRleCIsImZyYWdtZW50X3ByZSIsImZyYWdtZW50IiwiRVhURU5TSU9OUyIsImhhcmQiLCJTSEFET1ciLCJFUFNJTE9OIiwiQVJSQVlfVFlQRSIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiZGVncmVlIiwiTWF0aCIsIlBJIiwiY3JlYXRlIiwib3V0IiwiZ2xNYXRyaXgiLCJjb3B5IiwiYSIsImZyb21WYWx1ZXMiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMDMiLCJtMTAiLCJtMTEiLCJtMTIiLCJtMTMiLCJtMjAiLCJtMjEiLCJtMjIiLCJtMjMiLCJtMzAiLCJtMzEiLCJtMzIiLCJtMzMiLCJpZGVudGl0eSIsInRyYW5zcG9zZSIsImEwMSIsImEwMiIsImEwMyIsImExMiIsImExMyIsImEyMyIsImludmVydCIsImEwMCIsImExMCIsImExMSIsImEyMCIsImEyMSIsImEyMiIsImEzMCIsImEzMSIsImEzMiIsImEzMyIsImIwMCIsImIwMSIsImIwMiIsImIwMyIsImIwNCIsImIwNSIsImIwNiIsImIwNyIsImIwOCIsImIwOSIsImIxMCIsImIxMSIsImRldCIsIm11bHRpcGx5IiwiYiIsImIwIiwiYjEiLCJiMiIsImIzIiwidHJhbnNsYXRlIiwidiIsIngiLCJ5IiwieiIsInNjYWxlIiwicm90YXRlIiwicmFkIiwiYXhpcyIsImxlbiIsInNxcnQiLCJzIiwiYyIsInQiLCJiMTIiLCJiMjAiLCJiMjEiLCJiMjIiLCJhYnMiLCJzaW4iLCJjb3MiLCJwZXJzcGVjdGl2ZSIsImZvdnkiLCJhc3BlY3QiLCJuZWFyIiwiZmFyIiwiZiIsInRhbiIsIm5mIiwib3J0aG8iLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJ0b3AiLCJsciIsImJ0IiwibG9va0F0IiwiZXllIiwiY2VudGVyIiwidXAiLCJ4MCIsIngxIiwieDIiLCJ5MCIsInkxIiwieTIiLCJ6MCIsInoxIiwiejIiLCJleWV4IiwiZXlleSIsImV5ZXoiLCJ1cHgiLCJ1cHkiLCJ1cHoiLCJjZW50ZXJ4IiwiY2VudGVyeSIsImNlbnRlcnoiLCJ0YXJnZXRUbyIsInRhcmdldCIsImxlbmd0aCIsIm5vcm1hbGl6ZSIsImRvdCIsImNyb3NzIiwiYXgiLCJheSIsImF6IiwiYngiLCJieSIsImJ6IiwiZm9yRWFjaCIsInZlYyIsInN0cmlkZSIsIm9mZnNldCIsImNvdW50IiwiZm4iLCJhcmciLCJpIiwibCIsIm1pbiIsInciLCJzZXRBeGlzQW5nbGUiLCJnZXRBeGlzQW5nbGUiLCJvdXRfYXhpcyIsInEiLCJhY29zIiwicm90YXRlWCIsImF3IiwiYnciLCJyb3RhdGVZIiwicm90YXRlWiIsInNsZXJwIiwib21lZ2EiLCJjb3NvbSIsInNpbm9tIiwic2NhbGUwIiwic2NhbGUxIiwiZnJvbU1hdDMiLCJtIiwiZlRyYWNlIiwiZlJvb3QiLCJqIiwiayIsInZlYzQiLCJyb3RhdGlvblRvIiwidG1wdmVjMyIsInZlYzMiLCJ4VW5pdFZlYzMiLCJ5VW5pdFZlYzMiLCJzcWxlcnAiLCJ0ZW1wMSIsInRlbXAyIiwiZCIsInNldEF4ZXMiLCJtYXRyIiwibWF0MyIsInZpZXciLCJhcnJheSIsImhleEludFRvUmdiIiwiaGV4IiwiciIsImciLCJoZXhTdHJpbmdUb1JnYiIsInJlc3VsdCIsImV4ZWMiLCJwYXJzZUludCIsImNvbXBvbmVudFRvSGV4IiwidG9TdHJpbmciLCJyZ2JUb0hleCIsImhleFIiLCJoZXhHIiwiaGV4QiIsImNvbnZlcnQiLCJjb2xvciIsInJnYiIsInJhbmRvbVJhbmdlIiwibWF4IiwicmFuZG9tIiwibW9kIiwibiIsIldPUkRfUkVHWCIsIndvcmQiLCJSZWdFeHAiLCJMSU5FX1JFR1giLCJWRVJURVgiLCJtYXRjaCIsInJlcGxhY2UiLCJGUkFHTUVOVCIsInNoYWRlciIsInRleHR1cmVHbG9iYWxSZWd4IiwidGV4dHVyZVNpbmdsZVJlZ3giLCJ0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4IiwibWF0Y2hlcyIsInJlcGxhY2VtZW50IiwidW5pZm9ybU5hbWUiLCJzcGxpdCIsInVuaWZvcm1UeXBlIiwiR0VORVJJQyIsIlZFUlRFWF9SVUxFUyIsIkZSQUdNRU5UX1JVTEVTIiwidHJhbnNmb3JtIiwiY29kZSIsInBhcnNlIiwic2hhZGVyVHlwZSIsInJ1bGVzIiwicnVsZSIsIlZlY3RvcjMiLCJkYXRhIiwidmFsdWUiLCJ1dWlkIiwiYXhpc0FuZ2xlIiwicXVhdGVybmlvbkF4aXNBbmdsZSIsIk9iamVjdDMiLCJ1aWQiLCJwYXJlbnQiLCJjaGlsZHJlbiIsInBvc2l0aW9uIiwicm90YXRpb24iLCJfdHJhbnNwYXJlbnQiLCJfdmlzaWJsZSIsInF1YXRlcm5pb24iLCJxdWF0IiwibG9va1RvVGFyZ2V0IiwibWF0cmljZXMiLCJtYXQ0IiwiZGlydHkiLCJzb3J0aW5nIiwidHJhbnNwYXJlbnQiLCJhdHRyaWJ1dGVzIiwic2NlbmVHcmFwaFNvcnRlciIsInB1c2giLCJpbmRleCIsImluZGV4T2YiLCJkZXN0cm95Iiwic3BsaWNlIiwib2JqZWN0IiwidW5kZWZpbmVkIiwidHJhdmVyc2UiLCJ1cGRhdGVNYXRyaWNlcyIsInZpc2libGUiLCJPcnRob2dyYXBoaWNDYW1lcmEiLCJwYXJhbXMiLCJPYmplY3QiLCJhc3NpZ24iLCJwcm9qZWN0aW9uIiwiUGVyc3BlY3RpdmVDYW1lcmEiLCJmb3YiLCJ3aWR0aCIsImhlaWdodCIsIkJhc2ljIiwicHJvcHMiLCJ0eXBlIiwibW9kZSIsIndpcmVmcmFtZSIsInVuaWZvcm1zIiwidV9jb2xvciIsIlRleHR1cmUiLCJtYWdGaWx0ZXIiLCJORUFSRVNUIiwibWluRmlsdGVyIiwid3JhcFMiLCJDTEFNUF9UT19FREdFIiwid3JhcFQiLCJVaW50OEFycmF5IiwidGV4dHVyZSIsImNyZWF0ZVRleHR1cmUiLCJiaW5kVGV4dHVyZSIsIlRFWFRVUkVfMkQiLCJ0ZXhJbWFnZTJEIiwiUkdCQSIsIlVOU0lHTkVEX0JZVEUiLCJ0ZXhQYXJhbWV0ZXJpIiwiVEVYVFVSRV9NQUdfRklMVEVSIiwiVEVYVFVSRV9NSU5fRklMVEVSIiwiVEVYVFVSRV9XUkFQX1MiLCJURVhUVVJFX1dSQVBfVCIsInBpeGVsU3RvcmVpIiwiVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMIiwidXJsIiwiaW1nIiwiSW1hZ2UiLCJjcm9zc09yaWdpbiIsIm9ubG9hZCIsInVwZGF0ZSIsInNyYyIsImltYWdlIiwiZ2VuZXJhdGVNaXBtYXAiLCJVTlBBQ0tfRkxJUF9ZX1dFQkdMIiwiRGVmYXVsdCIsIm1hcCIsImZyb21JbWFnZSIsInVfbWFwIiwiQmlsbGJvYXJkIiwiU2VtIiwiUFJPR1JBTV9QT09MIiwiY3JlYXRlU2hhZGVyIiwic3RyIiwic2hhZGVyU291cmNlIiwiY29tcGlsZVNoYWRlciIsImNvbXBpbGVkIiwiZ2V0U2hhZGVyUGFyYW1ldGVyIiwiQ09NUElMRV9TVEFUVVMiLCJlcnJvciIsImdldFNoYWRlckluZm9Mb2ciLCJkZWxldGVTaGFkZXIiLCJjb25zb2xlIiwiRXJyb3IiLCJjcmVhdGVQcm9ncmFtIiwicHJvZ3JhbUlEIiwicG9vbCIsInZzIiwiVkVSVEVYX1NIQURFUiIsImZzIiwiRlJBR01FTlRfU0hBREVSIiwicHJvZ3JhbSIsImF0dGFjaFNoYWRlciIsImxpbmtQcm9ncmFtIiwiVWJvIiwiYm91bmRMb2NhdGlvbiIsImJ1ZmZlciIsImNyZWF0ZUJ1ZmZlciIsImJpbmRCdWZmZXIiLCJVTklGT1JNX0JVRkZFUiIsImJ1ZmZlckRhdGEiLCJTVEFUSUNfRFJBVyIsImJpbmRCdWZmZXJCYXNlIiwic2V0IiwiYnVmZmVyU3ViRGF0YSIsIlZhbyIsInZhbyIsImNyZWF0ZVZlcnRleEFycmF5IiwiYmluZFZlcnRleEFycmF5IiwiY3JlYXRlVmVydGV4QXJyYXlPRVMiLCJiaW5kVmVydGV4QXJyYXlPRVMiLCJkZWxldGVWZXJ0ZXhBcnJheSIsImRlbGV0ZVZlcnRleEFycmF5T0VTIiwiZ2V0VHlwZVNpemUiLCJpbml0QXR0cmlidXRlcyIsInByb3AiLCJjdXJyZW50IiwibG9jYXRpb24iLCJnZXRBdHRyaWJMb2NhdGlvbiIsIkFSUkFZX0JVRkZFUiIsImJpbmRBdHRyaWJ1dGVzIiwia2V5cyIsImtleSIsInNpemUiLCJpbnN0YW5jZWQiLCJ2ZXJ0ZXhBdHRyaWJQb2ludGVyIiwiRkxPQVQiLCJlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSIsImRpdmlzb3IiLCJ2ZXJ0ZXhBdHRyaWJEaXZpc29yIiwidmVydGV4QXR0cmliRGl2aXNvckFOR0xFIiwidXBkYXRlQXR0cmlidXRlcyIsIkRZTkFNSUNfRFJBVyIsImluaXRVbmlmb3JtcyIsInRleHR1cmVJbmRpY2VzIiwiVEVYVFVSRTAiLCJURVhUVVJFMSIsIlRFWFRVUkUyIiwiVEVYVFVSRTMiLCJURVhUVVJFNCIsIlRFWFRVUkU1IiwiZ2V0VW5pZm9ybUxvY2F0aW9uIiwidGV4dHVyZUluZGV4IiwiYWN0aXZlVGV4dHVyZSIsInVwZGF0ZVVuaWZvcm1zIiwidW5pZm9ybSIsInVuaWZvcm1NYXRyaXg0ZnYiLCJ1bmlmb3JtTWF0cml4M2Z2IiwidW5pZm9ybTRmdiIsInVuaWZvcm0zZnYiLCJ1bmlmb3JtMmZ2IiwidW5pZm9ybTFmIiwidW5pZm9ybTFpIiwiTW9kZWwiLCJwb2x5Z29uT2Zmc2V0IiwicG9seWdvbk9mZnNldEZhY3RvciIsInBvbHlnb25PZmZzZXRVbml0cyIsImNsaXBwaW5nIiwiZW5hYmxlIiwicGxhbmVzIiwiaW5zdGFuY2VDb3VudCIsImlzSW5zdGFuY2UiLCJzaWRlIiwiU3RyaW5nIiwic2hhZG93cyIsIm5hbWUiLCJpbmRpY2VzIiwiZ2xzbDN0bzEiLCJ1c2VQcm9ncmFtIiwiRUxFTUVOVF9BUlJBWV9CVUZGRVIiLCJpblNoYWRvd01hcCIsIlBPTFlHT05fT0ZGU0VUX0ZJTEwiLCJkaXNhYmxlIiwiQkxFTkQiLCJibGVuZEZ1bmMiLCJTUkNfQUxQSEEiLCJPTkVfTUlOVVNfU1JDX0FMUEhBIiwiREVQVEhfVEVTVCIsIkNVTExfRkFDRSIsImN1bGxGYWNlIiwiZHJhd0VsZW1lbnRzSW5zdGFuY2VkIiwiVU5TSUdORURfU0hPUlQiLCJkcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSIsImRyYXdFbGVtZW50cyIsImRyYXdBcnJheXMiLCJhX3Bvc2l0aW9uIiwic2hhZGVySUQiLCJNZXNoIiwiX3NoYWRlciIsImdlb21ldHJ5IiwicG9zaXRpb25zIiwibm9ybWFscyIsInV2cyIsInNldEF0dHJpYnV0ZSIsInNldEluZGV4IiwiVWludDE2QXJyYXkiLCJzZXRVbmlmb3JtIiwic2V0U2hhZGVyIiwiQXhpc0hlbHBlciIsImcxIiwiZzIiLCJnMyIsIm0xIiwibTIiLCJtMyIsImFkZCIsInN4Iiwic3kiLCJzeiIsImFfbm9ybWFsIiwiaTMiLCJ2MHgiLCJ2MHkiLCJ2MHoiLCJueCIsIm55IiwibnoiLCJ2MXgiLCJ2MXkiLCJ2MXoiLCJjb25jYXQiLCJyZWZlcmVuY2UiLCJyZXNpemUiLCJkb21FbGVtZW50IiwicmF0aW8iLCJzdHlsZSIsInVuc3VwcG9ydGVkIiwiZGl2IiwiaW5uZXJIVE1MIiwiZGlzcGxheSIsIm1hcmdpbiIsImJvcmRlciIsImJhY2tncm91bmRDb2xvciIsImJvcmRlclJhZGl1cyIsInBhZGRpbmciLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0ZXh0QWxpZ24iLCJMaWdodCIsIkRpcmVjdGlvbmFsIiwiaW50ZW5zaXR5IiwiU2NlbmUiLCJmb2ciLCJzdGFydCIsImVuZCIsImRlbnNpdHkiLCJhZGRMaWdodCIsImxpZ2h0IiwiUmVuZGVyVGFyZ2V0IiwiaW50ZXJuYWxmb3JtYXQiLCJERVBUSF9DT01QT05FTlQiLCJERVBUSF9DT01QT05FTlQyNCIsIlVOU0lHTkVEX0lOVCIsImZyYW1lQnVmZmVyIiwiY3JlYXRlRnJhbWVidWZmZXIiLCJiaW5kRnJhbWVidWZmZXIiLCJGUkFNRUJVRkZFUiIsIkxJTkVBUiIsImZyYW1lYnVmZmVyVGV4dHVyZTJEIiwiQ09MT1JfQVRUQUNITUVOVDAiLCJERVBUSF9BVFRBQ0hNRU5UIiwiU2hhZG93TWFwUmVuZGVyZXIiLCJydCIsInNoYWRvdyIsImJpYXMiLCJjYW1lcmEiLCJQZXJzcGVjdGl2ZSIsIk9ydGhvZ3JhcGhpYyIsInNldExpZ2h0T3JpZ2luIiwibGFzdFByb2dyYW0iLCJzb3J0Iiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInRpbWUiLCJub3JtYWwiLCJtb2RlbFZpZXciLCJpbnZlcnNlZE1vZGVsVmlldyIsImNhY2hlZFNjZW5lIiwiY2FjaGVkQ2FtZXJhIiwiUmVuZGVyZXIiLCJzdXBwb3J0ZWQiLCJzb3J0ZWQiLCJvcGFxdWUiLCJwZXJmb3JtYW5jZSIsInZlcnRpY2VzIiwiaW5zdGFuY2VzIiwid2luZG93IiwiZGV2aWNlUGl4ZWxSYXRpbyIsImNhbnZhcyIsImFudGlhbGlhcyIsInNlc3Npb24iLCJnbGkiLCJncmVldGluZyIsImxpYiIsInBhcmFtZXRlcnMiLCJ2YWx1ZXMiLCJhcmdzIiwiZ2V0UGFyYW1ldGVyIiwiVkVSU0lPTiIsImxvZyIsImluaXQiLCJwZXJTY2VuZSIsInBlck1vZGVsIiwic2hhZG93bWFwIiwic0xvY2F0aW9uIiwiZ2V0VW5pZm9ybUJsb2NrSW5kZXgiLCJtTG9jYXRpb24iLCJkTG9jYXRpb24iLCJ1bmlmb3JtQmxvY2tCaW5kaW5nIiwidXBkYXRlQ2FtZXJhTWF0cml4IiwiYmluZCIsInJlbmRlclNoYWRvdyIsInJlbmRlck9iamVjdCIsInJlbmRlclRhcmdldCIsImNsZWFyQ29sb3IiLCJ2aWV3cG9ydCIsImNsZWFyIiwiQ09MT1JfQlVGRkVSX0JJVCIsIkRFUFRIX0JVRkZFUl9CSVQiLCJkcmF3IiwicnR0IiwibWF0cml4IiwiaW5pdFVuaWZvcm1zUGVyTW9kZWwiLCJjaGFuZ2VQcm9ncmFtIiwidXBkYXRlVW5pZm9ybXNQZXJNb2RlbCIsInVuYmluZCIsInByb2plY3Rpb25NYXRyaXgiLCJ2aWV3TWF0cml4IiwiZm9nU2V0dGluZ3MiLCJmb2dDb2xvciIsImlHbG9iYWxUaW1lIiwiZ2xvYmFsQ2xpcFNldHRpbmdzIiwiZ2xvYmFsQ2xpcFBsYW5lMCIsImdsb2JhbENsaXBQbGFuZTEiLCJnbG9iYWxDbGlwUGxhbmUyIiwibW9kZWxNYXRyaXgiLCJub3JtYWxNYXRyaXgiLCJsb2NhbENsaXBTZXR0aW5ncyIsImxvY2FsQ2xpcFBsYW5lMCIsImxvY2FsQ2xpcFBsYW5lMSIsImxvY2FsQ2xpcFBsYW5lMiIsInNoYWRvd01hcCIsInNoYWRvd01hdHJpeCIsInNoYWRvd05lYXIiLCJzaGFkb3dGYXIiLCJQYXNzIiwicXVhZCIsInVfaW5wdXQiLCJDb21wb3NlciIsInJlbmRlcmVyIiwicGFzc2VzIiwic2NyZWVuIiwiY29tcGlsZSIsImJ1ZmZlcnMiLCJyZWFkIiwid3JpdGUiLCJzZXRTaXplIiwic2V0UmF0aW8iLCJwYXNzIiwidGVtcCIsInJlc2V0QnVmZmVycyIsInJlbmRlclRvVGV4dHVyZSIsInRvdGFsIiwic3dhcEJ1ZmZlcnMiLCJyZW5kZXIiLCJQZXJmb3JtYW5jZSIsInRoZW1lIiwiZm9udCIsImNvbG9yMSIsImNvbG9yMiIsImNvbG9yMyIsImNvbG9yNCIsImNvbnRhaW5lciIsImNzc1RleHQiLCJob2xkZXIiLCJhcHBlbmRDaGlsZCIsInRpdGxlIiwibXNUZXh0cyIsImVsZW1lbnQiLCJyZWJ1aWxkIiwidGV4dENvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFBLElBQU1BLFFBQVE7SUFDVkMsYUFBUyxtQkFBTTtJQUNYLDZVQU9FRCxNQUFNRSxXQUFOLEVBUEY7SUFRSCxLQVZTOztJQVlWQSxpQkFBYSx1QkFBTTtJQUNmO0lBYUg7SUExQlMsQ0FBZDs7SUNBQSxTQUFTQyxJQUFULEdBQWdCO0lBQ1o7SUFRSDs7SUFFRCxJQUFNQyxNQUFNO0lBQ1JDLFlBQVEsa0JBQU07SUFDVixzRUFFTUYsTUFGTjtJQU9ILEtBVE87SUFVUkcsaUJBQWEsdUJBQU07SUFDZixzRUFFTUgsTUFGTjtJQU9ILEtBbEJPO0lBbUJSSSxrQkFBYyx3QkFBTTtJQUNoQixzRUFFTUosTUFGTjtJQU9IO0lBM0JPLENBQVo7O0lDWEE7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNSyxrQkFBa0IsQ0FBeEI7O0lBRVA7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNQyxvQkFBb0IsSUFBMUI7O0lBRVA7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNQyxlQUFlLElBQXJCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsaUJBQWlCLElBQXZCOztJQUVQOzs7Ozs7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
