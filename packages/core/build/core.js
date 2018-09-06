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
    var version = "1.1.5";

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

    /**
     * Common utilities
     * @module glMatrix
     */

    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;

    var degree = Math.PI / 180;

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

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
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

      if (len < EPSILON) {
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
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
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
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
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

    // const transform = (code) => {
    //     return code
    //         // removes //
    //         .replace(/[ \t]*\/\/.*\n/g, '')
    //         // remove /* */
    //         .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
    //         // removes multiple white spaces
    //         .replace(/^\s+|\s+$|\s+(?=\s)/g, '');
    // };

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

        return shader;
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

            /**
             * updates projection matrix
             *
             * @param {Number} a The first number to test.
             * @param {Number} b The second number to test.
             * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
             */

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

        var vertex = '#version 300 es\n            ' + EXTENSIONS.vertex() + '\n\n            in vec3 a_position;\n            in vec3 a_normal;\n            in vec2 a_uv;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + CLIPPING.vertex_pre() + '\n            ' + SHADOW.vertex_pre() + '\n\n            out vec3 fragVertexEc;\n            out vec2 v_uv;\n            out vec3 v_normal;\n\n            void main() {\n                vec4 worldPosition = modelMatrix * vec4(a_position, 1.0);\n                vec4 position = projectionMatrix * viewMatrix * worldPosition;\n                gl_Position = position;\n\n                fragVertexEc = position.xyz; // worldPosition.xyz;\n                v_uv = a_uv;\n                v_normal = (normalMatrix * vec4(a_normal, 1.0)).xyz;\n\n                ' + SHADOW.vertex() + '\n                ' + CLIPPING.vertex() + '\n            }\n        ';

        var fragment = '#version 300 es\n            ' + EXTENSIONS.fragment() + '\n\n            precision highp float;\n            precision highp int;\n\n            in vec3 fragVertexEc;\n            in vec2 v_uv;\n            in vec3 v_normal;\n\n            ' + CLIPPING.fragment_pre() + '\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n            ' + UBO.lights() + '\n\n            ' + SHADOW.fragment_pre() + '\n\n            out vec4 outColor;\n\n            ' + (props.fragment || 'void mainImage( out vec4 fragColor, in vec2 fragCoord ) { fragColor = vec4(0.0, 1.0, 1.0, 1.0); }') + '\n\n            void main() {\n                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);\n                mainImage(base, gl_FragCoord.xy);\n\n                ' + SHADOW.fragment() + '\n                ' + LIGHT.factory() + '\n                ' + FOG.linear() + '\n                ' + CLIPPING.fragment() + '\n\n                outColor = base;\n            }\n        ';

        return Object.assign({
            type: SHADER_BILLBOARD,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES
        }, {
            vertex: vertex,
            fragment: fragment,
            uniforms: {}
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
            key: 'updateVertices',
            value: function updateVertices(data, index) {
                // index of vertice * 3 (xyz) + 0 for X
                // index of vertice * 3 (xyz) + 1 for Y
                // index of vertice * 3 (xyz) + 2 for Z
                this.dirty.attributes = true;
                this.attributes.a_position.value.set(data, index);
            }
        }, {
            key: 'update',
            value: function update(inShadowMap) {
                var gl = getContext();

                if (this.dirty.attributes) {
                    updateAttributes(this.attributes);
                    this.dirty.attributes = false;
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

            var _ref = params.geometry || {},
                positions = _ref.positions,
                indices = _ref.indices,
                normals = _ref.normals,
                uvs = _ref.uvs;

            var _ref2 = params.shader || new Default({ color: params.color, map: params.map }),
                vertex = _ref2.vertex,
                fragment = _ref2.fragment,
                uniforms = _ref2.uniforms,
                type = _ref2.type,
                mode = _ref2.mode;

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

    /**
     * Core
     * @module core
     */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2xpZ2h0LmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2ZvZy5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvc2Vzc2lvbi5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy91Ym8uanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3Mvbm9pc2UuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvY2xpcHBpbmcuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvZXh0ZW5zaW9ucy5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9zaGFkb3cuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvY29tbW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvbWF0NC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvcXVhdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMyLmpzIiwiLi4vc3JjL3V0aWxzL2NvbG9yLmpzIiwiLi4vc3JjL3V0aWxzL21hdGguanMiLCIuLi9zcmMvdXRpbHMvZ2xzbC1wYXJzZXIuanMiLCIuLi9zcmMvY29yZS92ZWN0b3IzLmpzIiwiLi4vc3JjL2NvcmUvb2JqZWN0My5qcyIsIi4uL3NyYy9jYW1lcmFzL29ydGhvZ3JhcGhpYy5qcyIsIi4uL3NyYy9jYW1lcmFzL3BlcnNwZWN0aXZlLmpzIiwiLi4vc3JjL3NoYWRlcnMvYmFzaWMuanMiLCIuLi9zcmMvY29yZS90ZXh0dXJlLmpzIiwiLi4vc3JjL3NoYWRlcnMvZGVmYXVsdC5qcyIsIi4uL3NyYy9zaGFkZXJzL2JpbGxib2FyZC5qcyIsIi4uL3NyYy9zaGFkZXJzL3NlbS5qcyIsIi4uL3NyYy9nbC9wcm9ncmFtLmpzIiwiLi4vc3JjL2dsL3Viby5qcyIsIi4uL3NyYy9nbC92YW8uanMiLCIuLi9zcmMvZ2wvdHlwZXMuanMiLCIuLi9zcmMvZ2wvYXR0cmlidXRlcy5qcyIsIi4uL3NyYy9nbC91bmlmb3Jtcy5qcyIsIi4uL3NyYy9jb3JlL21vZGVsLmpzIiwiLi4vc3JjL2NvcmUvbWVzaC5qcyIsIi4uL3NyYy9oZWxwZXJzL2F4aXMuanMiLCIuLi9zcmMvaGVscGVycy9ub3JtYWwuanMiLCIuLi9zcmMvdXRpbHMvZG9tLmpzIiwiLi4vc3JjL2NvcmUvbGlnaHRzLmpzIiwiLi4vc3JjL2NvcmUvc2NlbmUuanMiLCIuLi9zcmMvY29yZS9ydC5qcyIsIi4uL3NyYy9jb3JlL3NoYWRvdy1tYXAtcmVuZGVyZXIuanMiLCIuLi9zcmMvY29yZS9yZW5kZXJlci5qcyIsIi4uL3NyYy9jb3JlL3Bhc3MuanMiLCIuLi9zcmMvcGFzc2VzL2Jhc2ljLmpzIiwiLi4vc3JjL2NvcmUvY29tcG9zZXIuanMiLCIuLi9zcmMvY29yZS9wZXJmb3JtYW5jZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBMSUdIVCA9IHtcbiAgICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIC8vIGZhY3RvcnkgbGlnaHRcbiAgICAgICAgdmVjMyBpbnZlcnNlTGlnaHREaXJlY3Rpb24gPSBub3JtYWxpemUodmVjMygtMC4yNSwgLTAuMjUsIDEuMCkpO1xuICAgICAgICB2ZWMzIGRpcmVjdGlvbmFsQ29sb3IgPSB2ZWMzKG1heChkb3Qodl9ub3JtYWwsIGludmVyc2VMaWdodERpcmVjdGlvbiksIDAuMCkpO1xuICAgICAgICB2ZWMzIGZhY3RvcnkgPSBtaXgodmVjMygwLjApLCBkaXJlY3Rpb25hbENvbG9yLCAwLjk4OSk7IC8vIGxpZ2h0IGludGVuc2l0eVxuICAgICAgICBiYXNlLnJnYiAqPSBmYWN0b3J5O1xuXG4gICAgICAgICR7TElHSFQuZGlyZWN0aW9uYWwoKX1gO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25hbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgLy8gdmVjMyBkY29sb3IgPSB2ZWMzKDAuMDEpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGZvciAoaW50IGkgPSAwOyBpIDwgTUFYX0RJUkVDVElPTkFMOyBpKyspIHtcbiAgICAgICAgICAgIC8vICAgICB2ZWMzIGludmVyc2VMaWdodERpcmVjdGlvbiA9IG5vcm1hbGl6ZShkaXJlY3Rpb25hbExpZ2h0c1tpXS5kbFBvc2l0aW9uLnh5eik7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBsaWdodCA9IHZlYzMobWF4KGRvdCh2X25vcm1hbCwgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uKSwgMC4wKSk7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBkaXJlY3Rpb25hbENvbG9yID0gZGlyZWN0aW9uYWxMaWdodHNbaV0uZGxDb2xvci5yZ2IgKiBsaWdodDtcbiAgICAgICAgICAgIC8vICAgICBkY29sb3IgKz0gbWl4KGRjb2xvciwgZGlyZWN0aW9uYWxDb2xvciwgZGlyZWN0aW9uYWxMaWdodHNbaV0uZmxJbnRlbnNpdHkpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gZGNvbG9yIC89IGZsb2F0KE1BWF9ESVJFQ1RJT05BTCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gYmFzZS5yZ2IgKj0gZGNvbG9yO1xuICAgICAgICBgO1xuICAgIH0sXG59O1xuXG5leHBvcnQge1xuICAgIExJR0hULFxufTtcbiIsImZ1bmN0aW9uIGJhc2UoKSB7XG4gICAgcmV0dXJuIGBcbiAgICBmbG9hdCBmb2dTdGFydCA9IGZvZ1NldHRpbmdzLnk7XG4gICAgZmxvYXQgZm9nRW5kID0gZm9nU2V0dGluZ3MuejtcbiAgICBmbG9hdCBmb2dEZW5zaXR5ID0gZm9nU2V0dGluZ3MuYTtcblxuICAgIGZsb2F0IGRpc3QgPSAwLjA7XG4gICAgZmxvYXQgZm9nRmFjdG9yID0gMC4wO1xuICAgIGRpc3QgPSBnbF9GcmFnQ29vcmQueiAvIGdsX0ZyYWdDb29yZC53O2A7XG59XG5cbmNvbnN0IEZPRyA9IHtcbiAgICBsaW5lYXI6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgaWYgKGZvZ1NldHRpbmdzLnggPiAwLjApIHtcbiAgICAgICAgICAgICR7YmFzZSgpfVxuICAgICAgICAgICAgZm9nRmFjdG9yID0gKGZvZ0VuZCAtIGRpc3QpIC8gKGZvZ0VuZCAtIGZvZ1N0YXJ0KTtcbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IGNsYW1wKGZvZ0ZhY3RvciwgMC4wLCAxLjApO1xuICAgICAgICAgICAgYmFzZSA9IG1peChmb2dDb2xvciwgYmFzZSwgZm9nRmFjdG9yKTtcbiAgICAgICAgfWA7XG4gICAgfSxcbiAgICBleHBvbmVudGlhbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoZGlzdCAqIGZvZ0RlbnNpdHkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxuICAgIGV4cG9uZW50aWFsMjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoKGRpc3QgKiBmb2dEZW5zaXR5KSAqIChkaXN0ICogZm9nRGVuc2l0eSkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBGT0csXG59O1xuIiwiLyoqXG4gKiBNYXggZGlyZWN0aW9uYWwgbGlnaHQgYWxsb3dlZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgTUFYX0RJUkVDVElPTkFMXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgTUFYX0RJUkVDVElPTkFMID0gMTtcblxuLyoqXG4gKiBkaXJlY3Rpb25hbCBsaWdodCBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgRElSRUNUSU9OQUxfTElHSFRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBESVJFQ1RJT05BTF9MSUdIVCA9IDEwMDA7XG5cbi8qKlxuICogYmFzaWMgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQkFTSUNcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQkFTSUMgPSAyMDAwO1xuXG4vKipcbiAqIGRlZmF1bHQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfREVGQVVMVFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9ERUZBVUxUID0gMjAwMTtcblxuLyoqXG4gKiBiaWxsYm9hcmQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQklMTEJPQVJEXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0JJTExCT0FSRCA9IDIwMDI7XG5cbi8qKlxuICogc2hhZG93IHNoYWRlciBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0hBREVSX1NIQURPV1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9TSEFET1cgPSAyMDAzO1xuXG4vKipcbiAqIHNlbSBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9TRU1cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfU0VNID0gMjAwNDtcblxuLyoqXG4gKiBjdXN0b20gc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQ1VTVE9NXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0NVU1RPTSA9IDI1MDA7XG5cbi8qKlxuICogc2hhZGVyIGRyYXcgbW9kZXNcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIERSQVdcbiAqIEB0eXBlIHtvYmplY3R9XG4gKiBAcHJvcGVydHkge251bWJlcn0gUE9JTlRTXG4gKiBAcHJvcGVydHkge251bWJlcn0gTElORVNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBUUklBTkdMRVNcbiAqL1xuZXhwb3J0IGNvbnN0IERSQVcgPSB7XG4gICAgUE9JTlRTOiAwLFxuICAgIExJTkVTOiAxLFxuICAgIFRSSUFOR0xFUzogNCxcbn07XG5cbi8qKlxuICogdHJpYW5nbGUgc2lkZVxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0lERVxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBGUk9OVFxuICogQHByb3BlcnR5IHtudW1iZXJ9IEJBQ0tcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCT1RIXG4gKi9cbmV4cG9ydCBjb25zdCBTSURFID0ge1xuICAgIEZST05UOiAwLFxuICAgIEJBQ0s6IDEsXG4gICAgQk9USDogMixcbn07XG5cbi8qKlxuICogY29udGV4dCB0eXBlc1xuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgQ09OVEVYVFxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBXRUJHTFxuICogQHByb3BlcnR5IHtudW1iZXJ9IFdFQkdMMlxuICovXG5leHBvcnQgY29uc3QgQ09OVEVYVCA9IHtcbiAgICBXRUJHTDogJ3dlYmdsJyxcbiAgICBXRUJHTDI6ICd3ZWJnbDInLFxufTtcbiIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IGxpYnJhcnkgPSBgbG93d3ctJHtfX0xJQlJBUllfX31gO1xuY29uc3QgdmVyc2lvbiA9IF9fVkVSU0lPTl9fO1xuXG4vLyBwZXIgc2Vzc2lvblxubGV0IGdsID0gbnVsbDtcbmxldCBjb250ZXh0VHlwZSA9IG51bGw7XG5cbi8vIHRlc3QgY29udGV4dCB3ZWJnbCBhbmQgd2ViZ2wyXG5jb25zdCB0ZXN0Q29udGV4dDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KENPTlRFWFQuV0VCR0wpO1xuY29uc3QgdGVzdENvbnRleHQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dChDT05URVhULldFQkdMMik7XG5cbmNvbnN0IGV4dGVuc2lvbnMgPSB7XG4gICAgLy8gdXNlZCBnbG9iYWxseVxuICAgIHZlcnRleEFycmF5T2JqZWN0OiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpLFxuXG4gICAgLy8gdXNlZCBmb3IgaW5zdGFuY2luZ1xuICAgIGluc3RhbmNlZEFycmF5czogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpLFxuXG4gICAgLy8gdXNlZCBmb3IgZmxhdCBzaGFkaW5nXG4gICAgc3RhbmRhcmREZXJpdmF0aXZlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyksXG5cbiAgICAvLyBkZXB0aCB0ZXh0dXJlXG4gICAgZGVwdGhUZXh0dXJlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpLFxufTtcblxuY29uc3Qgc2V0Q29udGV4dFR5cGUgPSAocHJlZmVycmVkKSA9PiB7XG4gICAgY29uc3QgZ2wyID0gdGVzdENvbnRleHQyICYmIENPTlRFWFQuV0VCR0wyO1xuICAgIGNvbnN0IGdsMSA9IHRlc3RDb250ZXh0MSAmJiBDT05URVhULldFQkdMO1xuICAgIGNvbnRleHRUeXBlID0gcHJlZmVycmVkIHx8IGdsMiB8fCBnbDE7XG5cbiAgICBpZiAoY29udGV4dFR5cGUgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIGV4dGVuc2lvbnMudmVydGV4QXJyYXlPYmplY3QgPSB0cnVlO1xuICAgICAgICBleHRlbnNpb25zLmluc3RhbmNlZEFycmF5cyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuc3RhbmRhcmREZXJpdmF0aXZlcyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuZGVwdGhUZXh0dXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dFR5cGU7XG59O1xuXG5jb25zdCBnZXRDb250ZXh0VHlwZSA9ICgpID0+IGNvbnRleHRUeXBlO1xuXG5jb25zdCBzZXRDb250ZXh0ID0gKGNvbnRleHQpID0+IHtcbiAgICBnbCA9IGNvbnRleHQ7XG4gICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wpIHtcbiAgICAgICAgZXh0ZW5zaW9ucy52ZXJ0ZXhBcnJheU9iamVjdCA9IGdsLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5pbnN0YW5jZWRBcnJheXMgPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5zdGFuZGFyZERlcml2YXRpdmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5kZXB0aFRleHR1cmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyk7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0Q29udGV4dCA9ICgpID0+IGdsO1xuXG5jb25zdCBzdXBwb3J0cyA9ICgpID0+IGV4dGVuc2lvbnM7XG5cbmV4cG9ydCB7XG4gICAgbGlicmFyeSxcbiAgICB2ZXJzaW9uLFxuICAgIHNldENvbnRleHQsXG4gICAgZ2V0Q29udGV4dCxcbiAgICBzZXRDb250ZXh0VHlwZSxcbiAgICBnZXRDb250ZXh0VHlwZSxcbiAgICBzdXBwb3J0cyxcbn07XG4iLCJpbXBvcnQgeyBDT05URVhULCBNQVhfRElSRUNUSU9OQUwgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcblxuY29uc3QgVUJPID0ge1xuICAgIHNjZW5lOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gcGVyU2NlbmUge1xuICAgICAgICAgICAgICAgIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgICAgICAgICBtYXQ0IHZpZXdNYXRyaXg7XG4gICAgICAgICAgICAgICAgdmVjNCBmb2dTZXR0aW5ncztcbiAgICAgICAgICAgICAgICB2ZWM0IGZvZ0NvbG9yO1xuICAgICAgICAgICAgICAgIGZsb2F0IGlHbG9iYWxUaW1lO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFNldHRpbmdzO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMDtcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwUGxhbmUyO1xuICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgIHVuaWZvcm0gbWF0NCB2aWV3TWF0cml4O1xuICAgICAgICB1bmlmb3JtIHZlYzQgZm9nU2V0dGluZ3M7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBmb2dDb2xvcjtcbiAgICAgICAgdW5pZm9ybSBmbG9hdCBpR2xvYmFsVGltZTtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBTZXR0aW5ncztcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBQbGFuZTA7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwUGxhbmUxO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMjtgO1xuICAgIH0sXG5cbiAgICBtb2RlbDogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICB1bmlmb3JtIHBlck1vZGVsIHtcbiAgICAgICAgICAgICAgICBtYXQ0IG1vZGVsTWF0cml4O1xuICAgICAgICAgICAgICAgIG1hdDQgbm9ybWFsTWF0cml4O1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTA7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTI7XG4gICAgICAgICAgICB9O2A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBub3JtYWxNYXRyaXg7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwUGxhbmUwO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFBsYW5lMTtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBQbGFuZTI7YDtcbiAgICB9LFxuXG4gICAgbGlnaHRzOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAjZGVmaW5lIE1BWF9ESVJFQ1RJT05BTCAke01BWF9ESVJFQ1RJT05BTH1cblxuICAgICAgICAgICAgICAgIHN0cnVjdCBEaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBkbENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBmbEludGVuc2l0eTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBkaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07XG4gICAgICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICNkZWZpbmUgTUFYX0RJUkVDVElPTkFMICR7TUFYX0RJUkVDVElPTkFMfVxuXG4gICAgICAgICAgICBzdHJ1Y3QgRGlyZWN0aW9uYWwge1xuICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB2ZWM0IGRsQ29sb3I7XG4gICAgICAgICAgICAgICAgZmxvYXQgZmxJbnRlbnNpdHk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB1bmlmb3JtIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBVQk8sXG59O1xuIiwiY29uc3QgTk9JU0UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICB2ZWMzIG1vZDI4OSh2ZWMzIHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IG1vZDI4OSh2ZWM0IHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IHBlcm11dGUodmVjNCB4KXtyZXR1cm4gbW9kMjg5KCh4KjM0LisxLikqeCk7fXZlYzQgdGF5bG9ySW52U3FydCh2ZWM0IHIpe3JldHVybiAxLjc5Mjg0LS44NTM3MzUqcjt9dmVjMyBmYWRlKHZlYzMgdCl7cmV0dXJuIHQqdCp0Kih0Kih0KjYuLTE1LikrMTAuKTt9ZmxvYXQgY25vaXNlKHZlYzMgUCl7dmVjMyBQaTA9Zmxvb3IoUCksUGkxPVBpMCt2ZWMzKDEuKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9ZmxvYXQgcG5vaXNlKHZlYzMgUCx2ZWMzIHJlcCl7dmVjMyBQaTA9bW9kKGZsb29yKFApLHJlcCksUGkxPW1vZChQaTArdmVjMygxLikscmVwKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9XG5gO1xufTtcblxuZXhwb3J0IHtcbiAgICBOT0lTRSxcbn07XG4iLCJjb25zdCBDTElQUElORyA9IHtcblxuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgb3V0IHZlYzQgbG9jYWxfZXllc3BhY2U7XG4gICAgICAgIG91dCB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgbG9jYWxfZXllc3BhY2UgPSBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgZ2xvYmFsX2V5ZXNwYWNlID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpbiB2ZWM0IGxvY2FsX2V5ZXNwYWNlO1xuICAgICAgICBpbiB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAobG9jYWxDbGlwU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTApIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTIpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdsb2JhbENsaXBTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICBpZihkb3QoZ2xvYmFsX2V5ZXNwYWNlLCBnbG9iYWxDbGlwUGxhbmUwKSA8IDAuMCkgZGlzY2FyZDtcbiAgICAgICAgICAgIGlmKGRvdChnbG9iYWxfZXllc3BhY2UsIGdsb2JhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGdsb2JhbF9leWVzcGFjZSwgZ2xvYmFsQ2xpcFBsYW5lMikgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgIH1gO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgQ0xJUFBJTkcsXG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuXG5jb25zdCBFWFRFTlNJT05TID0ge1xuXG4gICAgdmVydGV4OiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuXG4gICAgZnJhZ21lbnQ6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGVgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgRVhURU5TSU9OUyxcbn07XG4iLCJmdW5jdGlvbiBoYXJkKCkge1xuICAgIHJldHVybiBgXG4gICAgZmxvYXQgaGFyZFNoYWRvdzEoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcbiAgICAgICAgZmxvYXQgc2hhZG93ID0gdGV4dHVyZShzaGFkb3dNYXAsIHV2KS5yO1xuXG4gICAgICAgIGZsb2F0IHZpc2liaWxpdHkgPSAxLjA7XG4gICAgICAgIGZsb2F0IHNoYWRvd0Ftb3VudCA9IDAuNTtcblxuICAgICAgICBmbG9hdCBjb3NUaGV0YSA9IGNsYW1wKGRvdCh2X25vcm1hbCwgdlNoYWRvd0Nvb3JkLnh5eiksIDAuMCwgMS4wKTtcbiAgICAgICAgZmxvYXQgYmlhcyA9IDAuMDAwMDUgKiB0YW4oYWNvcyhjb3NUaGV0YSkpOyAvLyBjb3NUaGV0YSBpcyBkb3QoIG4sbCApLCBjbGFtcGVkIGJldHdlZW4gMCBhbmQgMVxuICAgICAgICBiaWFzID0gY2xhbXAoYmlhcywgMC4wLCAwLjAwMSk7XG5cbiAgICAgICAgaWYgKHNoYWRvdyA8IHNoYWRvd0Nvb3JkLnogLSBiaWFzKXtcbiAgICAgICAgICAgIHZpc2liaWxpdHkgPSBzaGFkb3dBbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgZmxvYXQgaGFyZFNoYWRvdzIoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcblxuICAgICAgICBmbG9hdCBsaWdodERlcHRoMSA9IHRleHR1cmUoc2hhZG93TWFwLCB1dikucjtcbiAgICAgICAgZmxvYXQgbGlnaHREZXB0aDIgPSBjbGFtcChzaGFkb3dDb29yZC56LCAwLjAsIDEuMCk7XG4gICAgICAgIGZsb2F0IGJpYXMgPSAwLjAwMDE7XG5cbiAgICAgICAgcmV0dXJuIHN0ZXAobGlnaHREZXB0aDIsIGxpZ2h0RGVwdGgxK2JpYXMpO1xuICAgIH1cblxuICAgIGZsb2F0IGhhcmRTaGFkb3czKHNhbXBsZXIyRCBzaGFkb3dNYXApIHtcbiAgICAgICAgdmVjNCBzaGFkb3dDb29yZCA9IHZTaGFkb3dDb29yZCAvIHZTaGFkb3dDb29yZC53O1xuICAgICAgICB2ZWMyIHV2ID0gc2hhZG93Q29vcmQueHk7XG5cbiAgICAgICAgZmxvYXQgdmlzaWJpbGl0eSA9IDEuMDtcbiAgICAgICAgZmxvYXQgc2hhZG93QW1vdW50ID0gMC41O1xuICAgICAgICBmbG9hdCBiaWFzID0gMC4wMDAwNTtcblxuICAgICAgICB2ZWMyIHBvaXNzb25EaXNrWzE2XTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMF0gPSB2ZWMyKC0wLjk0MjAxNjI0LCAtMC4zOTkwNjIxNik7XG4gICAgICAgIHBvaXNzb25EaXNrWzFdID0gdmVjMigwLjk0NTU4NjA5LCAtMC43Njg5MDcyNSk7XG4gICAgICAgIHBvaXNzb25EaXNrWzJdID0gdmVjMigtMC4wOTQxODQxMDEsIC0wLjkyOTM4ODcwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbM10gPSB2ZWMyKDAuMzQ0OTU5MzgsIDAuMjkzODc3NjApO1xuICAgICAgICBwb2lzc29uRGlza1s0XSA9IHZlYzIoLTAuOTE1ODg1ODEsIDAuNDU3NzE0MzIpO1xuICAgICAgICBwb2lzc29uRGlza1s1XSA9IHZlYzIoLTAuODE1NDQyMzIsIC0wLjg3OTEyNDY0KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbNl0gPSB2ZWMyKC0wLjM4Mjc3NTQzLCAwLjI3Njc2ODQ1KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbN10gPSB2ZWMyKDAuOTc0ODQzOTgsIDAuNzU2NDgzNzkpO1xuICAgICAgICBwb2lzc29uRGlza1s4XSA9IHZlYzIoMC40NDMyMzMyNSwgLTAuOTc1MTE1NTQpO1xuICAgICAgICBwb2lzc29uRGlza1s5XSA9IHZlYzIoMC41Mzc0Mjk4MSwgLTAuNDczNzM0MjApO1xuICAgICAgICBwb2lzc29uRGlza1sxMF0gPSB2ZWMyKC0wLjI2NDk2OTExLCAtMC40MTg5MzAyMyk7XG4gICAgICAgIHBvaXNzb25EaXNrWzExXSA9IHZlYzIoMC43OTE5NzUxNCwgMC4xOTA5MDE4OCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzEyXSA9IHZlYzIoLTAuMjQxODg4NDAsIDAuOTk3MDY1MDcpO1xuICAgICAgICBwb2lzc29uRGlza1sxM10gPSB2ZWMyKC0wLjgxNDA5OTU1LCAwLjkxNDM3NTkwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTRdID0gdmVjMigwLjE5OTg0MTI2LCAwLjc4NjQxMzY3KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTVdID0gdmVjMigwLjE0MzgzMTYxLCAtMC4xNDEwMDc5MCk7XG5cbiAgICAgICAgZm9yIChpbnQgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgICAgICBpZiAoIHRleHR1cmUoc2hhZG93TWFwLCB1diArIHBvaXNzb25EaXNrW2ldLzcwMC4wKS5yIDwgc2hhZG93Q29vcmQuei1iaWFzICl7XG4gICAgICAgICAgICAgICAgdmlzaWJpbGl0eSAtPSAwLjAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgYDtcbn1cblxuY29uc3QgU0hBRE9XID0ge1xuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHNoYWRvd01hdHJpeDtcbiAgICAgICAgb3V0IHZlYzQgdlNoYWRvd0Nvb3JkO2A7XG4gICAgfSxcblxuICAgIHZlcnRleDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICB2U2hhZG93Q29vcmQgPSBzaGFkb3dNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgc2hhZG93TWFwO1xuICAgICAgICBpbiB2ZWM0IHZTaGFkb3dDb29yZDtcblxuICAgICAgICAke2hhcmQoKX1gO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAvLyBzaGFkb3dzXG4gICAgICAgIGZsb2F0IHNoYWRvdyA9IDEuMDtcblxuICAgICAgICAvLyBPUFRJT04gMVxuICAgICAgICBzaGFkb3cgPSBoYXJkU2hhZG93MShzaGFkb3dNYXApO1xuXG4gICAgICAgIGJhc2UgKj0gc2hhZG93O1xuICAgICAgICBgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgU0hBRE9XLFxufTtcbiIsIi8qKlxuICogQ29tbW9uIHV0aWxpdGllc1xuICogQG1vZHVsZSBnbE1hdHJpeFxuICovXG5cbi8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXG5leHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuZXhwb3J0IGxldCBBUlJBWV9UWVBFID0gKHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xuZXhwb3J0IGNvbnN0IFJBTkRPTSA9IE1hdGgucmFuZG9tO1xuXG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcbiAgQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmNvbnN0IGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG5cbi8qKlxuICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xuICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXG4gKiBvciByZWxhdGl2ZSB0b2xlcmFuY2Ugb2YgZ2xNYXRyaXguRVBTSUxPTiAoYW4gYWJzb2x1dGUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIHZhbHVlcyBsZXNzXG4gKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxuICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpO1xufVxuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogM3gzIE1hdHJpeFxuICogQG1vZHVsZSBtYXQzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDE7XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDQob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbNF07XG4gIG91dFs0XSA9IGFbNV07XG4gIG91dFs1XSA9IGFbNl07XG4gIG91dFs2XSA9IGFbOF07XG4gIG91dFs3XSA9IGFbOV07XG4gIG91dFs4XSA9IGFbMTBdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0MyB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTEwO1xuICBvdXRbNF0gPSBtMTE7XG4gIG91dFs1XSA9IG0xMjtcbiAgb3V0WzZdID0gbTIwO1xuICBvdXRbN10gPSBtMjE7XG4gIG91dFs4XSA9IG0yMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMTA7XG4gIG91dFs0XSA9IG0xMTtcbiAgb3V0WzVdID0gbTEyO1xuICBvdXRbNl0gPSBtMjA7XG4gIG91dFs3XSA9IG0yMTtcbiAgb3V0WzhdID0gbTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIGxldCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xuICAgIG91dFsxXSA9IGFbM107XG4gICAgb3V0WzJdID0gYVs2XTtcbiAgICBvdXRbM10gPSBhMDE7XG4gICAgb3V0WzVdID0gYVs3XTtcbiAgICBvdXRbNl0gPSBhMDI7XG4gICAgb3V0WzddID0gYTEyO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGFbMV07XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGFbMl07XG4gICAgb3V0WzddID0gYVs1XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICBsZXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xuICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcbiAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcblxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgaWYgKCFkZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgb3V0WzBdID0gYjAxICogZGV0O1xuICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gIG91dFswXSA9IChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpO1xuICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gIG91dFszXSA9IChhMTIgKiBhMjAgLSBhMTAgKiBhMjIpO1xuICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XG4gIG91dFs2XSA9IChhMTAgKiBhMjEgLSBhMTEgKiBhMjApO1xuICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgbGV0IGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl07XG4gIGxldCBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdO1xuICBsZXQgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcblxuICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG4gICAgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gIG91dFswXSA9IGEwMDtcbiAgb3V0WzFdID0gYTAxO1xuICBvdXRbMl0gPSBhMDI7XG5cbiAgb3V0WzNdID0gYTEwO1xuICBvdXRbNF0gPSBhMTE7XG4gIG91dFs1XSA9IGExMjtcblxuICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gIG91dFs2XSA9IGEyMDtcbiAgb3V0WzddID0gYTIxO1xuICBvdXRbOF0gPSBhMjI7XG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgb3V0WzBdID0geCAqIGFbMF07XG4gIG91dFsxXSA9IHggKiBhWzFdO1xuICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICBvdXRbM10gPSB5ICogYVszXTtcbiAgb3V0WzRdID0geSAqIGFbNF07XG4gIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gdlswXTtcbiAgb3V0WzddID0gdlsxXTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKSwgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYztcbiAgb3V0WzFdID0gcztcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAtcztcbiAgb3V0WzRdID0gYztcbiAgb3V0WzVdID0gMDtcblxuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB2WzFdO1xuICBvdXRbNV0gPSAwO1xuXG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSAwO1xuXG4gIG91dFszXSA9IGFbMl07XG4gIG91dFs0XSA9IGFbM107XG4gIG91dFs1XSA9IDA7XG5cbiAgb3V0WzZdID0gYVs0XTtcbiAgb3V0WzddID0gYVs1XTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHl4ID0geSAqIHgyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB6eCA9IHogKiB4MjtcbiAgbGV0IHp5ID0geiAqIHkyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gIG91dFszXSA9IHl4IC0gd3o7XG4gIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgb3V0WzFdID0geXggKyB3ejtcbiAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgb3V0WzJdID0genggLSB3eTtcbiAgb3V0WzVdID0genkgKyB3eDtcbiAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXG4gIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cbiAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICBvdXRbOF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gLTE7XG4gICAgb3V0WzddID0gMTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0MygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICtcbiAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgK1xuICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XG4gIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpKSlcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuXG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgb3V0WzNdID0gYVszXSAqIGI7XG4gIG91dFs0XSA9IGFbNF0gKiBiO1xuICBvdXRbNV0gPSBhWzVdICogYjtcbiAgb3V0WzZdID0gYVs2XSAqIGI7XG4gIG91dFs3XSA9IGFbN10gKiBiO1xuICBvdXRbOF0gPSBhWzhdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cbiAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmXG4gICAgICAgICBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XSAmJlxuICAgICAgICAgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sIGE2ID0gYVs2XSwgYTcgPSBhWzddLCBhOCA9IGFbOF07XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdLCBiNiA9IGJbNl0sIGI3ID0gYls3XSwgYjggPSBiWzhdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogNHg0IE1hdHJpeDxicj5Gb3JtYXQ6IGNvbHVtbi1tYWpvciwgd2hlbiB0eXBlZCBvdXQgaXQgbG9va3MgbGlrZSByb3ctbWFqb3I8YnI+VGhlIG1hdHJpY2VzIGFyZSBiZWluZyBwb3N0IG11bHRpcGxpZWQuXG4gKiBAbW9kdWxlIG1hdDRcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgb3V0WzldID0gYVs5XTtcbiAgb3V0WzEwXSA9IGFbMTBdO1xuICBvdXRbMTFdID0gYVsxMV07XG4gIG91dFsxMl0gPSBhWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdO1xuICBvdXRbMTRdID0gYVsxNF07XG4gIG91dFsxNV0gPSBhWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgb3V0WzldID0gYVs5XTtcbiAgb3V0WzEwXSA9IGFbMTBdO1xuICBvdXRbMTFdID0gYVsxMV07XG4gIG91dFsxMl0gPSBhWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdO1xuICBvdXRbMTRdID0gYVsxNF07XG4gIG91dFsxNV0gPSBhWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICBpZiAob3V0ID09PSBhKSB7XG4gICAgbGV0IGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XG4gICAgbGV0IGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gICAgbGV0IGEyMyA9IGFbMTFdO1xuXG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGEwMTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGEwMjtcbiAgICBvdXRbOV0gPSBhMTI7XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhMDM7XG4gICAgb3V0WzEzXSA9IGExMztcbiAgICBvdXRbMTRdID0gYTIzO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGFbMV07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGFbMl07XG4gICAgb3V0WzldID0gYVs2XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhWzNdO1xuICAgIG91dFsxM10gPSBhWzddO1xuICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gIG91dFsyXSAgPSAgKGEwMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTExICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gIG91dFs1XSAgPSAgKGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs4XSAgPSAgKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSk7XG4gIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gIG91dFsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XG4gIG91dFsxNF0gPSAtKGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICBsZXQgYjAgID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcbiAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbMV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gIGIwID0gYls0XTsgYjEgPSBiWzVdOyBiMiA9IGJbNl07IGIzID0gYls3XTtcbiAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gIG91dFs2XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuICBvdXRbOF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzExXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbMTNdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuXG4gIGlmIChhID09PSBvdXQpIHtcbiAgICBvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XTtcbiAgfSBlbHNlIHtcbiAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgb3V0WzBdID0gYTAwOyBvdXRbMV0gPSBhMDE7IG91dFsyXSA9IGEwMjsgb3V0WzNdID0gYTAzO1xuICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcbiAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICBsZXQgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcblxuICBvdXRbMF0gPSBhWzBdICogeDtcbiAgb3V0WzFdID0gYVsxXSAqIHg7XG4gIG91dFsyXSA9IGFbMl0gKiB4O1xuICBvdXRbM10gPSBhWzNdICogeDtcbiAgb3V0WzRdID0gYVs0XSAqIHk7XG4gIG91dFs1XSA9IGFbNV0gKiB5O1xuICBvdXRbNl0gPSBhWzZdICogeTtcbiAgb3V0WzddID0gYVs3XSAqIHk7XG4gIG91dFs4XSA9IGFbOF0gKiB6O1xuICBvdXRbOV0gPSBhWzldICogejtcbiAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICBsZXQgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXTtcbiAgbGV0IGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICBsZXQgcywgYywgdDtcbiAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcbiAgbGV0IGIwMCwgYjAxLCBiMDI7XG4gIGxldCBiMTAsIGIxMSwgYjEyO1xuICBsZXQgYjIwLCBiMjEsIGIyMjtcblxuICBpZiAobGVuIDwgZ2xNYXRyaXguRVBTSUxPTikgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGxlbiA9IDEgLyBsZW47XG4gIHggKj0gbGVuO1xuICB5ICo9IGxlbjtcbiAgeiAqPSBsZW47XG5cbiAgcyA9IE1hdGguc2luKHJhZCk7XG4gIGMgPSBNYXRoLmNvcyhyYWQpO1xuICB0ID0gMSAtIGM7XG5cbiAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcbiAgbGV0IGExMCA9IGFbNF07XG4gIGxldCBhMTEgPSBhWzVdO1xuICBsZXQgYTEyID0gYVs2XTtcbiAgbGV0IGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdO1xuICBsZXQgYTIxID0gYVs5XTtcbiAgbGV0IGEyMiA9IGFbMTBdO1xuICBsZXQgYTIzID0gYVsxMV07XG5cbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgb3V0WzBdICA9IGFbMF07XG4gICAgb3V0WzFdICA9IGFbMV07XG4gICAgb3V0WzJdICA9IGFbMl07XG4gICAgb3V0WzNdICA9IGFbM107XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9XG5cbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcbiAgb3V0WzVdID0gYTExICogYyArIGEyMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcbiAgb3V0WzhdID0gYTIwICogYyAtIGExMCAqIHM7XG4gIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XG4gIG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogcztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuICBsZXQgYTAwID0gYVswXTtcbiAgbGV0IGEwMSA9IGFbMV07XG4gIGxldCBhMDIgPSBhWzJdO1xuICBsZXQgYTAzID0gYVszXTtcbiAgbGV0IGEyMCA9IGFbOF07XG4gIGxldCBhMjEgPSBhWzldO1xuICBsZXQgYTIyID0gYVsxMF07XG4gIGxldCBhMjMgPSBhWzExXTtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbNF0gID0gYVs0XTtcbiAgICBvdXRbNV0gID0gYVs1XTtcbiAgICBvdXRbNl0gID0gYVs2XTtcbiAgICBvdXRbN10gID0gYVs3XTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzO1xuICBvdXRbMV0gPSBhMDEgKiBjIC0gYTIxICogcztcbiAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzO1xuICBvdXRbOF0gPSBhMDAgKiBzICsgYTIwICogYztcbiAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogYztcbiAgb3V0WzExXSA9IGEwMyAqIHMgKyBhMjMgKiBjO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG4gIGxldCBhMDAgPSBhWzBdO1xuICBsZXQgYTAxID0gYVsxXTtcbiAgbGV0IGEwMiA9IGFbMl07XG4gIGxldCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XTtcbiAgbGV0IGExMSA9IGFbNV07XG4gIGxldCBhMTIgPSBhWzZdO1xuICBsZXQgYTEzID0gYVs3XTtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgb3V0WzhdICA9IGFbOF07XG4gICAgb3V0WzldICA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogcztcbiAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogcztcbiAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogcztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSB2WzBdO1xuICBvdXRbMTNdID0gdlsxXTtcbiAgb3V0WzE0XSA9IHZbMl07XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMzfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gdlsxXTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IHZbMl07XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZSBhcm91bmQgYSBnaXZlbiBheGlzXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnJvdGF0ZShkZXN0LCBkZXN0LCByYWQsIGF4aXMpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkLCBheGlzKSB7XG4gIGxldCB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdO1xuICBsZXQgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIGxldCBzLCBjLCB0O1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG5cbiAgbGVuID0gMSAvIGxlbjtcbiAgeCAqPSBsZW47XG4gIHkgKj0gbGVuO1xuICB6ICo9IGxlbjtcblxuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYztcblxuICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbMF0gPSB4ICogeCAqIHQgKyBjO1xuICBvdXRbMV0gPSB5ICogeCAqIHQgKyB6ICogcztcbiAgb3V0WzJdID0geiAqIHggKiB0IC0geSAqIHM7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHggKiB5ICogdCAtIHogKiBzO1xuICBvdXRbNV0gPSB5ICogeSAqIHQgKyBjO1xuICBvdXRbNl0gPSB6ICogeSAqIHQgKyB4ICogcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geCAqIHogKiB0ICsgeSAqIHM7XG4gIG91dFs5XSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICBvdXRbMTBdID0geiAqIHogKiB0ICsgYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWChkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IDE7XG4gIG91dFsxXSAgPSAwO1xuICBvdXRbMl0gID0gMDtcbiAgb3V0WzNdICA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IGM7XG4gIG91dFs2XSA9IHM7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IC1zO1xuICBvdXRbMTBdID0gYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IGM7XG4gIG91dFsxXSAgPSAwO1xuICBvdXRbMl0gID0gLXM7XG4gIG91dFszXSAgPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSBzO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IGM7XG4gIG91dFsxXSAgPSBzO1xuICBvdXRbMl0gID0gMDtcbiAgb3V0WzNdICA9IDA7XG4gIG91dFs0XSA9IC1zO1xuICBvdXRbNV0gPSBjO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gIG91dFsxXSA9IHh5ICsgd3o7XG4gIG91dFsyXSA9IHh6IC0gd3k7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHh5IC0gd3o7XG4gIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gIG91dFs2XSA9IHl6ICsgd3g7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHh6ICsgd3k7XG4gIG91dFs5XSA9IHl6IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBNYXRyaXhcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQyKG91dCwgYSkge1xuICBsZXQgdHJhbnNsYXRpb24gPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgbGV0IGJ4ID0gLWFbMF0sIGJ5ID0gLWFbMV0sIGJ6ID0gLWFbMl0sIGJ3ID0gYVszXSxcbiAgYXggPSBhWzRdLCBheSA9IGFbNV0sIGF6ID0gYVs2XSwgYXcgPSBhWzddO1xuXG4gIGxldCBtYWduaXR1ZGUgPSBieCAqIGJ4ICsgYnkgKiBieSArIGJ6ICogYnogKyBidyAqIGJ3O1xuICAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcbiAgaWYgKG1hZ25pdHVkZSA+IDApIHtcbiAgICB0cmFuc2xhdGlvblswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDIgLyBtYWduaXR1ZGU7XG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyIC8gbWFnbml0dWRlO1xuICAgIHRyYW5zbGF0aW9uWzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMiAvIG1hZ25pdHVkZTtcbiAgfSBlbHNlIHtcbiAgICB0cmFuc2xhdGlvblswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDI7XG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyO1xuICAgIHRyYW5zbGF0aW9uWzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMjtcbiAgfVxuICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXG4gKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcbiAgb3V0WzBdID0gbWF0WzEyXTtcbiAgb3V0WzFdID0gbWF0WzEzXTtcbiAgb3V0WzJdID0gbWF0WzE0XTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcbiAqICB0aGUgc2FtZSBhcyB0aGUgc2NhbGluZyB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICBsZXQgbTExID0gbWF0WzBdO1xuICBsZXQgbTEyID0gbWF0WzFdO1xuICBsZXQgbTEzID0gbWF0WzJdO1xuICBsZXQgbTIxID0gbWF0WzRdO1xuICBsZXQgbTIyID0gbWF0WzVdO1xuICBsZXQgbTIzID0gbWF0WzZdO1xuICBsZXQgbTMxID0gbWF0WzhdO1xuICBsZXQgbTMyID0gbWF0WzldO1xuICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICBvdXRbMF0gPSBNYXRoLnNxcnQobTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzKTtcbiAgb3V0WzFdID0gTWF0aC5zcXJ0KG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMyk7XG4gIG91dFsyXSA9IE1hdGguc3FydChtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzMpO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um90YXRpb24ob3V0LCBtYXQpIHtcbiAgLy8gQWxnb3JpdGhtIHRha2VuIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cbiAgbGV0IHRyYWNlID0gbWF0WzBdICsgbWF0WzVdICsgbWF0WzEwXTtcbiAgbGV0IFMgPSAwO1xuXG4gIGlmICh0cmFjZSA+IDApIHtcbiAgICBTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDI7XG4gICAgb3V0WzNdID0gMC4yNSAqIFM7XG4gICAgb3V0WzBdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xuICAgIG91dFsxXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gUztcbiAgICBvdXRbMl0gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFM7XG4gIH0gZWxzZSBpZiAoKG1hdFswXSA+IG1hdFs1XSkgJiYgKG1hdFswXSA+IG1hdFsxMF0pKSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMF0gLSBtYXRbNV0gLSBtYXRbMTBdKSAqIDI7XG4gICAgb3V0WzNdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xuICAgIG91dFswXSA9IDAuMjUgKiBTO1xuICAgIG91dFsxXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gUztcbiAgICBvdXRbMl0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XG4gIH0gZWxzZSBpZiAobWF0WzVdID4gbWF0WzEwXSkge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzVdIC0gbWF0WzBdIC0gbWF0WzEwXSkgKiAyO1xuICAgIG91dFszXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gUztcbiAgICBvdXRbMF0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFM7XG4gICAgb3V0WzFdID0gMC4yNSAqIFM7XG4gICAgb3V0WzJdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTO1xuICB9IGVsc2Uge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzEwXSAtIG1hdFswXSAtIG1hdFs1XSkgKiAyO1xuICAgIG91dFszXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gUztcbiAgICBvdXRbMF0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XG4gICAgb3V0WzFdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTO1xuICAgIG91dFsyXSA9IDAuMjUgKiBTO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuICBsZXQgc3ggPSBzWzBdO1xuICBsZXQgc3kgPSBzWzFdO1xuICBsZXQgc3ogPSBzWzJdO1xuXG4gIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgb3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZSwgcm90YXRpbmcgYW5kIHNjYWxpbmcgYXJvdW5kIHRoZSBnaXZlbiBvcmlnaW5cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgb3JpZ2luKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBuZWdhdGl2ZU9yaWdpbik7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gbyBUaGUgb3JpZ2luIHZlY3RvciBhcm91bmQgd2hpY2ggdG8gc2NhbGUgYW5kIHJvdGF0ZVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbihvdXQsIHEsIHYsIHMsIG8pIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIGxldCBzeCA9IHNbMF07XG4gIGxldCBzeSA9IHNbMV07XG4gIGxldCBzeiA9IHNbMl07XG5cbiAgbGV0IG94ID0gb1swXTtcbiAgbGV0IG95ID0gb1sxXTtcbiAgbGV0IG96ID0gb1syXTtcblxuICBsZXQgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBsZXQgb3V0MSA9ICh4eSArIHd6KSAqIHN4O1xuICBsZXQgb3V0MiA9ICh4eiAtIHd5KSAqIHN4O1xuICBsZXQgb3V0NCA9ICh4eSAtIHd6KSAqIHN5O1xuICBsZXQgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICBsZXQgb3V0NiA9ICh5eiArIHd4KSAqIHN5O1xuICBsZXQgb3V0OCA9ICh4eiArIHd5KSAqIHN6O1xuICBsZXQgb3V0OSA9ICh5eiAtIHd4KSAqIHN6O1xuICBsZXQgb3V0MTAgPSAoMSAtICh4eCArIHl5KSkgKiBzejtcblxuICBvdXRbMF0gPSBvdXQwO1xuICBvdXRbMV0gPSBvdXQxO1xuICBvdXRbMl0gPSBvdXQyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSBvdXQ0O1xuICBvdXRbNV0gPSBvdXQ1O1xuICBvdXRbNl0gPSBvdXQ2O1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSBvdXQ4O1xuICBvdXRbOV0gPSBvdXQ5O1xuICBvdXRbMTBdID0gb3V0MTA7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveik7XG4gIG91dFsxM10gPSB2WzFdICsgb3kgLSAob3V0MSAqIG94ICsgb3V0NSAqIG95ICsgb3V0OSAqIG96KTtcbiAgb3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB5eCA9IHkgKiB4MjtcbiAgbGV0IHl5ID0geSAqIHkyO1xuICBsZXQgenggPSB6ICogeDI7XG4gIGxldCB6eSA9IHogKiB5MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICBvdXRbMV0gPSB5eCArIHd6O1xuICBvdXRbMl0gPSB6eCAtIHd5O1xuICBvdXRbM10gPSAwO1xuXG4gIG91dFs0XSA9IHl4IC0gd3o7XG4gIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICBvdXRbNl0gPSB6eSArIHd4O1xuICBvdXRbN10gPSAwO1xuXG4gIG91dFs4XSA9IHp4ICsgd3k7XG4gIG91dFs5XSA9IHp5IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgb3V0WzExXSA9IDA7XG5cbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZydXN0dW0ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICBsZXQgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCk7XG4gIGxldCB0YiA9IDEgLyAodG9wIC0gYm90dG9tKTtcbiAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XG4gIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gIG91dFsxNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gIGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpO1xuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSBmO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gIG91dFsxMV0gPSAtMTtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICBvdXRbMTVdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBmaWVsZCBvZiB2aWV3LlxuICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3KG91dCwgZm92LCBuZWFyLCBmYXIpIHtcbiAgbGV0IHVwVGFuID0gTWF0aC50YW4oZm92LnVwRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgZG93blRhbiA9IE1hdGgudGFuKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgbGVmdFRhbiA9IE1hdGgudGFuKGZvdi5sZWZ0RGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgcmlnaHRUYW4gPSBNYXRoLnRhbihmb3YucmlnaHREZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XG4gIGxldCB4U2NhbGUgPSAyLjAgLyAobGVmdFRhbiArIHJpZ2h0VGFuKTtcbiAgbGV0IHlTY2FsZSA9IDIuMCAvICh1cFRhbiArIGRvd25UYW4pO1xuXG4gIG91dFswXSA9IHhTY2FsZTtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIG91dFszXSA9IDAuMDtcbiAgb3V0WzRdID0gMC4wO1xuICBvdXRbNV0gPSB5U2NhbGU7XG4gIG91dFs2XSA9IDAuMDtcbiAgb3V0WzddID0gMC4wO1xuICBvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KTtcbiAgb3V0WzldID0gKCh1cFRhbiAtIGRvd25UYW4pICogeVNjYWxlICogMC41KTtcbiAgb3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzExXSA9IC0xLjA7XG4gIG91dFsxMl0gPSAwLjA7XG4gIG91dFsxM10gPSAwLjA7XG4gIG91dFsxNF0gPSAoZmFyICogbmVhcikgLyAobmVhciAtIGZhcik7XG4gIG91dFsxNV0gPSAwLjA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgbGV0IGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICBsZXQgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XG4gIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gIG91dFswXSA9IC0yICogbHI7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IC0yICogYnQ7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAyICogbmY7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXMuXG4gKiBJZiB5b3Ugd2FudCBhIG1hdHJpeCB0aGF0IGFjdHVhbGx5IG1ha2VzIGFuIG9iamVjdCBsb29rIGF0IGFub3RoZXIgb2JqZWN0LCB5b3Ugc2hvdWxkIHVzZSB0YXJnZXRUbyBpbnN0ZWFkLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcbiAgbGV0IHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbjtcbiAgbGV0IGV5ZXggPSBleWVbMF07XG4gIGxldCBleWV5ID0gZXllWzFdO1xuICBsZXQgZXlleiA9IGV5ZVsyXTtcbiAgbGV0IHVweCA9IHVwWzBdO1xuICBsZXQgdXB5ID0gdXBbMV07XG4gIGxldCB1cHogPSB1cFsyXTtcbiAgbGV0IGNlbnRlcnggPSBjZW50ZXJbMF07XG4gIGxldCBjZW50ZXJ5ID0gY2VudGVyWzFdO1xuICBsZXQgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJlxuICAgICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJlxuICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgZ2xNYXRyaXguRVBTSUxPTikge1xuICAgIHJldHVybiBpZGVudGl0eShvdXQpO1xuICB9XG5cbiAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gIHowICo9IGxlbjtcbiAgejEgKj0gbGVuO1xuICB6MiAqPSBsZW47XG5cbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gIGlmICghbGVuKSB7XG4gICAgeDAgPSAwO1xuICAgIHgxID0gMDtcbiAgICB4MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4MCAqPSBsZW47XG4gICAgeDEgKj0gbGVuO1xuICAgIHgyICo9IGxlbjtcbiAgfVxuXG4gIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gIGlmICghbGVuKSB7XG4gICAgeTAgPSAwO1xuICAgIHkxID0gMDtcbiAgICB5MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB5MCAqPSBsZW47XG4gICAgeTEgKj0gbGVuO1xuICAgIHkyICo9IGxlbjtcbiAgfVxuXG4gIG91dFswXSA9IHgwO1xuICBvdXRbMV0gPSB5MDtcbiAgb3V0WzJdID0gejA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHgxO1xuICBvdXRbNV0gPSB5MTtcbiAgb3V0WzZdID0gejE7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHgyO1xuICBvdXRbOV0gPSB5MjtcbiAgb3V0WzEwXSA9IHoyO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0VG8ob3V0LCBleWUsIHRhcmdldCwgdXApIHtcbiAgbGV0IGV5ZXggPSBleWVbMF0sXG4gICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICB1cHogPSB1cFsyXTtcblxuICBsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxuICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxuICAgICAgejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xuXG4gIGxldCBsZW4gPSB6MCp6MCArIHoxKnoxICsgejIqejI7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuICB9XG5cbiAgbGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcbiAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcbiAgICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcblxuICBsZW4gPSB4MCp4MCArIHgxKngxICsgeDIqeDI7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHgwICo9IGxlbjtcbiAgICB4MSAqPSBsZW47XG4gICAgeDIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHgxO1xuICBvdXRbMl0gPSB4MjtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XG4gIG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICBvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gejA7XG4gIG91dFs5XSA9IHoxO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gZXlleDtcbiAgb3V0WzEzXSA9IGV5ZXk7XG4gIG91dFsxNF0gPSBleWV6O1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xuICAgICAgICAgIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICtcbiAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICtcbiAgICAgICAgICBhWzEyXSArICcsICcgKyBhWzEzXSArICcsICcgKyBhWzE0XSArICcsICcgKyBhWzE1XSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSArIE1hdGgucG93KGFbOV0sIDIpICsgTWF0aC5wb3coYVsxMF0sIDIpICsgTWF0aC5wb3coYVsxMV0sIDIpICsgTWF0aC5wb3coYVsxMl0sIDIpICsgTWF0aC5wb3coYVsxM10sIDIpICsgTWF0aC5wb3coYVsxNF0sIDIpICsgTWF0aC5wb3coYVsxNV0sIDIpICkpXG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgb3V0WzddID0gYVs3XSArIGJbN107XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICBvdXRbOV0gPSBhWzldICsgYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSArIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSArIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICBvdXRbOV0gPSBhWzldIC0gYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdIC0gYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdIC0gYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgb3V0WzRdID0gYVs0XSAqIGI7XG4gIG91dFs1XSA9IGFbNV0gKiBiO1xuICBvdXRbNl0gPSBhWzZdICogYjtcbiAgb3V0WzddID0gYVs3XSAqIGI7XG4gIG91dFs4XSA9IGFbOF0gKiBiO1xuICBvdXRbOV0gPSBhWzldICogYjtcbiAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgb3V0WzExXSA9IGFbMTFdICogYjtcbiAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgb3V0WzE0XSA9IGFbMTRdICogYjtcbiAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQ0J3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xuICBvdXRbOV0gPSBhWzldICsgKGJbOV0gKiBzY2FsZSk7XG4gIG91dFsxMF0gPSBhWzEwXSArIChiWzEwXSAqIHNjYWxlKTtcbiAgb3V0WzExXSA9IGFbMTFdICsgKGJbMTFdICogc2NhbGUpO1xuICBvdXRbMTJdID0gYVsxMl0gKyAoYlsxMl0gKiBzY2FsZSk7XG4gIG91dFsxM10gPSBhWzEzXSArIChiWzEzXSAqIHNjYWxlKTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgKGJbMTRdICogc2NhbGUpO1xuICBvdXRbMTVdID0gYVsxNV0gKyAoYlsxNV0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJlxuICAgICAgICAgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XSAmJlxuICAgICAgICAgYVs4XSA9PT0gYls4XSAmJiBhWzldID09PSBiWzldICYmIGFbMTBdID09PSBiWzEwXSAmJiBhWzExXSA9PT0gYlsxMV0gJiZcbiAgICAgICAgIGFbMTJdID09PSBiWzEyXSAmJiBhWzEzXSA9PT0gYlsxM10gJiYgYVsxNF0gPT09IGJbMTRdICYmIGFbMTVdID09PSBiWzE1XTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgID0gYVswXSwgIGExICA9IGFbMV0sICBhMiAgPSBhWzJdLCAgYTMgID0gYVszXTtcbiAgbGV0IGE0ICA9IGFbNF0sICBhNSAgPSBhWzVdLCAgYTYgID0gYVs2XSwgIGE3ICA9IGFbN107XG4gIGxldCBhOCAgPSBhWzhdLCAgYTkgID0gYVs5XSwgIGExMCA9IGFbMTBdLCBhMTEgPSBhWzExXTtcbiAgbGV0IGExMiA9IGFbMTJdLCBhMTMgPSBhWzEzXSwgYTE0ID0gYVsxNF0sIGExNSA9IGFbMTVdO1xuXG4gIGxldCBiMCAgPSBiWzBdLCAgYjEgID0gYlsxXSwgIGIyICA9IGJbMl0sICBiMyAgPSBiWzNdO1xuICBsZXQgYjQgID0gYls0XSwgIGI1ICA9IGJbNV0sICBiNiAgPSBiWzZdLCAgYjcgID0gYls3XTtcbiAgbGV0IGI4ICA9IGJbOF0sICBiOSAgPSBiWzldLCAgYjEwID0gYlsxMF0sIGIxMSA9IGJbMTFdO1xuICBsZXQgYjEyID0gYlsxMl0sIGIxMyA9IGJbMTNdLCBiMTQgPSBiWzE0XSwgYjE1ID0gYlsxNV07XG5cbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTQgLSBiNCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNiAtIGI2KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTcgLSBiNykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE4IC0gYjgpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhOSAtIGI5KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTkpLCBNYXRoLmFicyhiOSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEwIC0gYjEwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEwKSwgTWF0aC5hYnMoYjEwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTEgLSBiMTEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTEpLCBNYXRoLmFicyhiMTEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExMiAtIGIxMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMiksIE1hdGguYWJzKGIxMikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEzIC0gYjEzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEzKSwgTWF0aC5hYnMoYjEzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTQgLSBiMTQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTQpLCBNYXRoLmFicyhiMTQpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExNSAtIGIxNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNSksIE1hdGguYWJzKGIxNSkpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWMzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXG4gKlxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIGxldCB4ID0gYlswXSAtIGFbMF07XG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IGxlbiA9IHgqeCArIHkqeSArIHoqejtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXTtcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gIGxldCBheCA9IGFbMF07XG4gIGxldCBheSA9IGFbMV07XG4gIGxldCBheiA9IGFbMl07XG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBoZXJtaXRlIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgbGV0IGZhY3RvcjEgPSBmYWN0b3JUaW1lczIgKiAoMiAqIHQgLSAzKSArIDE7XG4gIGxldCBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHQ7XG4gIGxldCBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKTtcbiAgbGV0IGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiAoMyAtIDIgKiB0KTtcblxuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBiZXppZXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmV6aWVyKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICBsZXQgaW52ZXJzZUZhY3RvciA9IDEgLSB0O1xuICBsZXQgaW52ZXJzZUZhY3RvclRpbWVzVHdvID0gaW52ZXJzZUZhY3RvciAqIGludmVyc2VGYWN0b3I7XG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgbGV0IGZhY3RvcjEgPSBpbnZlcnNlRmFjdG9yVGltZXNUd28gKiBpbnZlcnNlRmFjdG9yO1xuICBsZXQgZmFjdG9yMiA9IDMgKiB0ICogaW52ZXJzZUZhY3RvclRpbWVzVHdvO1xuICBsZXQgZmFjdG9yMyA9IDMgKiBmYWN0b3JUaW1lczIgKiBpbnZlcnNlRmFjdG9yO1xuICBsZXQgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqIHQ7XG5cbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcblxuICBsZXQgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgbGV0IHogPSAoZ2xNYXRyaXguUkFORE9NKCkgKiAyLjApIC0gMS4wO1xuICBsZXQgelNjYWxlID0gTWF0aC5zcXJ0KDEuMC16KnopICogc2NhbGU7XG5cbiAgb3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGU7XG4gIG91dFsxXSA9IE1hdGguc2luKHIpICogelNjYWxlO1xuICBvdXRbMl0gPSB6ICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gIGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xuICB3ID0gdyB8fCAxLjA7XG4gIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3O1xuICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gdztcbiAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKiBDYW4gYWxzbyBiZSB1c2VkIGZvciBkdWFsIHF1YXRlcm5pb25zLiAoTXVsdGlwbHkgaXQgd2l0aCB0aGUgcmVhbCBwYXJ0KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxuICAgIGxldCBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM107XG4gICAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XG4gICAgLy8gdmFyIHV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgYSk7XG4gICAgbGV0IHV2eCA9IHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgdXZ5ID0gcXogKiB4IC0gcXggKiB6LFxuICAgICAgICB1dnogPSBxeCAqIHkgLSBxeSAqIHg7XG4gICAgLy8gdmFyIHV1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIHV2KTtcbiAgICBsZXQgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnksXG4gICAgICAgIHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6LFxuICAgICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDtcbiAgICAvLyB2ZWMzLnNjYWxlKHV2LCB1diwgMiAqIHcpO1xuICAgIGxldCB3MiA9IHF3ICogMjtcbiAgICB1dnggKj0gdzI7XG4gICAgdXZ5ICo9IHcyO1xuICAgIHV2eiAqPSB3MjtcbiAgICAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcbiAgICB1dXZ4ICo9IDI7XG4gICAgdXV2eSAqPSAyO1xuICAgIHV1dnogKj0gMjtcbiAgICAvLyByZXR1cm4gdmVjMy5hZGQob3V0LCBhLCB2ZWMzLmFkZChvdXQsIHV2LCB1dXYpKTtcbiAgICBvdXRbMF0gPSB4ICsgdXZ4ICsgdXV2eDtcbiAgICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgICBvdXRbMl0gPSB6ICsgdXZ6ICsgdXV2ejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIGIsIGMpe1xuICBsZXQgcCA9IFtdLCByPVtdO1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBwWzJdID0gYVsyXSAtIGJbMl07XG5cbiAgLy9wZXJmb3JtIHJvdGF0aW9uXG4gIHJbMF0gPSBwWzBdO1xuICByWzFdID0gcFsxXSpNYXRoLmNvcyhjKSAtIHBbMl0qTWF0aC5zaW4oYyk7XG4gIHJbMl0gPSBwWzFdKk1hdGguc2luKGMpICsgcFsyXSpNYXRoLmNvcyhjKTtcblxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKXtcbiAgbGV0IHAgPSBbXSwgcj1bXTtcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xuXG4gIC8vcGVyZm9ybSByb3RhdGlvblxuICByWzBdID0gcFsyXSpNYXRoLnNpbihjKSArIHBbMF0qTWF0aC5jb3MoYyk7XG4gIHJbMV0gPSBwWzFdO1xuICByWzJdID0gcFsyXSpNYXRoLmNvcyhjKSAtIHBbMF0qTWF0aC5zaW4oYyk7XG5cbiAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgYiwgYyl7XG4gIGxldCBwID0gW10sIHI9W107XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTtcblxuICAvL3BlcmZvcm0gcm90YXRpb25cbiAgclswXSA9IHBbMF0qTWF0aC5jb3MoYykgLSBwWzFdKk1hdGguc2luKGMpO1xuICByWzFdID0gcFswXSpNYXRoLnNpbihjKSArIHBbMV0qTWF0aC5jb3MoYyk7XG4gIHJbMl0gPSBwWzJdO1xuXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgb3V0WzBdID0gclswXSArIGJbMF07XG4gIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICBsZXQgdGVtcEEgPSBmcm9tVmFsdWVzKGFbMF0sIGFbMV0sIGFbMl0pO1xuICBsZXQgdGVtcEIgPSBmcm9tVmFsdWVzKGJbMF0sIGJbMV0sIGJbMl0pO1xuXG4gIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpO1xuICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTtcblxuICBsZXQgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XG5cbiAgaWYoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgZWxzZSBpZihjb3NpbmUgPCAtMS4wKSB7XG4gICAgcmV0dXJuIE1hdGguUEk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXTtcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMztcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07XG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSkoKTtcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuXG4vKipcbiAqIDQgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbW9kdWxlIHZlYzRcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeiwgdykge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC8gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5jZWlsKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLmZsb29yKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICBvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5yb3VuZChhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICBsZXQgdyA9IGJbM10gLSBhWzNdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgbGV0IHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IHcgPSBhWzNdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgdyA9IGFbM107XG4gIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gLWFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gIG91dFswXSA9IDEuMCAvIGFbMF07XG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gIG91dFszXSA9IDEuMCAvIGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgdyA9IGFbM107XG4gIGxldCBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIG91dFswXSA9IHggKiBsZW47XG4gICAgb3V0WzFdID0geSAqIGxlbjtcbiAgICBvdXRbMl0gPSB6ICogbGVuO1xuICAgIG91dFszXSA9IHcgKiBsZW47XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICBsZXQgYXggPSBhWzBdO1xuICBsZXQgYXkgPSBhWzFdO1xuICBsZXQgYXogPSBhWzJdO1xuICBsZXQgYXcgPSBhWzNdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgdmVjdG9yU2NhbGUpIHtcbiAgdmVjdG9yU2NhbGUgPSB2ZWN0b3JTY2FsZSB8fCAxLjA7XG5cbiAgLy8gTWFyc2FnbGlhLCBHZW9yZ2UuIENob29zaW5nIGEgUG9pbnQgZnJvbSB0aGUgU3VyZmFjZSBvZiBhXG4gIC8vIFNwaGVyZS4gQW5uLiBNYXRoLiBTdGF0aXN0LiA0MyAoMTk3MiksIG5vLiAyLCA2NDUtLTY0Ni5cbiAgLy8gaHR0cDovL3Byb2plY3RldWNsaWQub3JnL2V1Y2xpZC5hb21zLzExNzc2OTI2NDQ7XG4gIHZhciB2MSwgdjIsIHYzLCB2NDtcbiAgdmFyIHMxLCBzMjtcbiAgZG8ge1xuICAgIHYxID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICB2MiA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgczEgPSB2MSAqIHYxICsgdjIgKiB2MjtcbiAgfSB3aGlsZSAoczEgPj0gMSk7XG4gIGRvIHtcbiAgICB2MyA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgdjQgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHMyID0gdjMgKiB2MyArIHY0ICogdjQ7XG4gIH0gd2hpbGUgKHMyID49IDEpO1xuXG4gIHZhciBkID0gTWF0aC5zcXJ0KCgxIC0gczEpIC8gczIpO1xuICBvdXRbMF0gPSBzY2FsZSAqIHYxO1xuICBvdXRbMV0gPSBzY2FsZSAqIHYyO1xuICBvdXRbMl0gPSBzY2FsZSAqIHYzICogZDtcbiAgb3V0WzNdID0gc2NhbGUgKiB2NCAqIGQ7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3O1xuICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gIGxldCBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM107XG5cbiAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgbGV0IGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xuICBsZXQgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gIGxldCBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeDtcbiAgbGV0IGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWM0cyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gNDtcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07IHZlY1szXSA9IGFbaSszXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07IGFbaSszXSA9IHZlY1szXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIlxuaW1wb3J0ICogYXMgbWF0MyBmcm9tIFwiLi9tYXQzLmpzXCJcbmltcG9ydCAqIGFzIHZlYzMgZnJvbSBcIi4vdmVjMy5qc1wiXG5pbXBvcnQgKiBhcyB2ZWM0IGZyb20gXCIuL3ZlYzQuanNcIlxuXG4vKipcbiAqIFF1YXRlcm5pb25cbiAqIEBtb2R1bGUgcXVhdFxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XG4gKlxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcbiAgcmFkID0gcmFkICogMC41O1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcm90YXRpb24gYXhpcyBhbmQgYW5nbGUgZm9yIGEgZ2l2ZW5cbiAqICBxdWF0ZXJuaW9uLiBJZiBhIHF1YXRlcm5pb24gaXMgY3JlYXRlZCB3aXRoXG4gKiAgc2V0QXhpc0FuZ2xlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgc2FtZVxuICogIHZhbHVlcyBhcyBwcm92aWRpZWQgaW4gdGhlIG9yaWdpbmFsIHBhcmFtZXRlciBsaXN0XG4gKiAgT1IgZnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdmFsdWVzLlxuICogRXhhbXBsZTogVGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5IGF4aXMgWzAsIDAsIDFdIGFuZFxuICogIGFuZ2xlIC05MCBpcyB0aGUgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBmb3JtZWQgYnlcbiAqICBbMCwgMCwgMV0gYW5kIDI3MC4gVGhpcyBtZXRob2QgZmF2b3JzIHRoZSBsYXR0ZXIuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXRfYXhpcyAgVmVjdG9yIHJlY2VpdmluZyB0aGUgYXhpcyBvZiByb3RhdGlvblxuICogQHBhcmFtICB7cXVhdH0gcSAgICAgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBBbmdsZSwgaW4gcmFkaWFucywgb2YgdGhlIHJvdGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBeGlzQW5nbGUob3V0X2F4aXMsIHEpIHtcbiAgbGV0IHJhZCA9IE1hdGguYWNvcyhxWzNdKSAqIDIuMDtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQgLyAyLjApO1xuICBpZiAocyAhPSAwLjApIHtcbiAgICBvdXRfYXhpc1swXSA9IHFbMF0gLyBzO1xuICAgIG91dF9heGlzWzFdID0gcVsxXSAvIHM7XG4gICAgb3V0X2F4aXNbMl0gPSBxWzJdIC8gcztcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiBzIGlzIHplcm8sIHJldHVybiBhbnkgYXhpcyAobm8gcm90YXRpb24gLSBheGlzIGRvZXMgbm90IG1hdHRlcilcbiAgICBvdXRfYXhpc1swXSA9IDE7XG4gICAgb3V0X2F4aXNbMV0gPSAwO1xuICAgIG91dF9heGlzWzJdID0gMDtcbiAgfVxuICByZXR1cm4gcmFkO1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcblxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gIG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4O1xuICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieSA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG5cbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ6ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICBvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVcob3V0LCBhKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IE1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xuICAvLyBiZW5jaG1hcmtzOlxuICAvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gIGxldCBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcblxuICAvLyBjYWxjIGNvc2luZVxuICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XG4gIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICBpZiAoIGNvc29tIDwgMC4wICkge1xuICAgIGNvc29tID0gLWNvc29tO1xuICAgIGJ4ID0gLSBieDtcbiAgICBieSA9IC0gYnk7XG4gICAgYnogPSAtIGJ6O1xuICAgIGJ3ID0gLSBidztcbiAgfVxuICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gIGlmICggKDEuMCAtIGNvc29tKSA+IDAuMDAwMDAxICkge1xuICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgIG9tZWdhICA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgc2lub20gID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgIHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tO1xuICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcbiAgfSBlbHNlIHtcbiAgICAvLyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlXG4gICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgIHNjYWxlMCA9IDEuMCAtIHQ7XG4gICAgc2NhbGUxID0gdDtcbiAgfVxuICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXG4gIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcbiAgbGV0IGRvdCA9IGEwKmEwICsgYTEqYTEgKyBhMiphMiArIGEzKmEzO1xuICBsZXQgaW52RG90ID0gZG90ID8gMS4wL2RvdCA6IDA7XG5cbiAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICBvdXRbMV0gPSAtYTEqaW52RG90O1xuICBvdXRbMl0gPSAtYTIqaW52RG90O1xuICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxuICpcbiAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQzKG91dCwgbSkge1xuICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgbGV0IGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgbGV0IGZSb290O1xuXG4gIGlmICggZlRyYWNlID4gMC4wICkge1xuICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICBmUm9vdCA9IDAuNS9mUm9vdDsgIC8vIDEvKDR3KVxuICAgIG91dFswXSA9IChtWzVdLW1bN10pKmZSb290O1xuICAgIG91dFsxXSA9IChtWzZdLW1bMl0pKmZSb290O1xuICAgIG91dFsyXSA9IChtWzFdLW1bM10pKmZSb290O1xuICB9IGVsc2Uge1xuICAgIC8vIHx3fCA8PSAxLzJcbiAgICBsZXQgaSA9IDA7XG4gICAgaWYgKCBtWzRdID4gbVswXSApXG4gICAgICBpID0gMTtcbiAgICBpZiAoIG1bOF0gPiBtW2kqMytpXSApXG4gICAgICBpID0gMjtcbiAgICBsZXQgaiA9IChpKzEpJTM7XG4gICAgbGV0IGsgPSAoaSsyKSUzO1xuXG4gICAgZlJvb3QgPSBNYXRoLnNxcnQobVtpKjMraV0tbVtqKjMral0tbVtrKjMra10gKyAxLjApO1xuICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgb3V0WzNdID0gKG1baiozK2tdIC0gbVtrKjMral0pICogZlJvb3Q7XG4gICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3l9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWSBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIHgsIHksIHopIHtcbiAgICBsZXQgaGFsZlRvUmFkID0gMC41ICogTWF0aC5QSSAvIDE4MC4wO1xuICAgIHggKj0gaGFsZlRvUmFkO1xuICAgIHkgKj0gaGFsZlRvUmFkO1xuICAgIHogKj0gaGFsZlRvUmFkO1xuXG4gICAgbGV0IHN4ID0gTWF0aC5zaW4oeCk7XG4gICAgbGV0IGN4ID0gTWF0aC5jb3MoeCk7XG4gICAgbGV0IHN5ID0gTWF0aC5zaW4oeSk7XG4gICAgbGV0IGN5ID0gTWF0aC5jb3MoeSk7XG4gICAgbGV0IHN6ID0gTWF0aC5zaW4oeik7XG4gICAgbGV0IGN6ID0gTWF0aC5jb3Moeik7XG5cbiAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gY2xvbmVcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZG90ID0gdmVjNC5kb3Q7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBjb25zdCBsZW5ndGggPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4YWN0RXF1YWxzID0gdmVjNC5leGFjdEVxdWFscztcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVxdWFscyA9IHZlYzQuZXF1YWxzO1xuXG4vKipcbiAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcbiAqIHZlY3RvciB0byBhbm90aGVyLlxuICpcbiAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIGRlc3RpbmF0aW9uIHZlY3RvclxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3Qgcm90YXRpb25UbyA9IChmdW5jdGlvbigpIHtcbiAgbGV0IHRtcHZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xuICBsZXQgeFVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDEsMCwwKTtcbiAgbGV0IHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLDEsMCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIGxldCBkb3QgPSB2ZWMzLmRvdChhLCBiKTtcbiAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XG4gICAgICBpZiAodmVjMy5sZW4odG1wdmVjMykgPCAwLjAwMDAwMSlcbiAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICBzZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgb3V0WzBdID0gMDtcbiAgICAgIG91dFsxXSA9IDA7XG4gICAgICBvdXRbMl0gPSAwO1xuICAgICAgb3V0WzNdID0gMTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgYSwgYik7XG4gICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xuICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcbiAgICAgIG91dFsyXSA9IHRtcHZlYzNbMl07XG4gICAgICBvdXRbM10gPSAxICsgZG90O1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgfVxuICB9O1xufSkoKTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gZCB0aGUgZm91cnRoIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGNvbnN0IHNxbGVycCA9IChmdW5jdGlvbiAoKSB7XG4gIGxldCB0ZW1wMSA9IGNyZWF0ZSgpO1xuICBsZXQgdGVtcDIgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICAgIHNsZXJwKHRlbXAxLCBhLCBkLCB0KTtcbiAgICBzbGVycCh0ZW1wMiwgYiwgYywgdCk7XG4gICAgc2xlcnAob3V0LCB0ZW1wMSwgdGVtcDIsIDIgKiB0ICogKDEgLSB0KSk7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9O1xufSgpKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3Qgc2V0QXhlcyA9IChmdW5jdGlvbigpIHtcbiAgbGV0IG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbihvdXQsIHZpZXcsIHJpZ2h0LCB1cCkge1xuICAgIG1hdHJbMF0gPSByaWdodFswXTtcbiAgICBtYXRyWzNdID0gcmlnaHRbMV07XG4gICAgbWF0cls2XSA9IHJpZ2h0WzJdO1xuXG4gICAgbWF0clsxXSA9IHVwWzBdO1xuICAgIG1hdHJbNF0gPSB1cFsxXTtcbiAgICBtYXRyWzddID0gdXBbMl07XG5cbiAgICBtYXRyWzJdID0gLXZpZXdbMF07XG4gICAgbWF0cls1XSA9IC12aWV3WzFdO1xuICAgIG1hdHJbOF0gPSAtdmlld1syXTtcblxuICAgIHJldHVybiBub3JtYWxpemUob3V0LCBmcm9tTWF0MyhvdXQsIG1hdHIpKTtcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWMyXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXG4gKlxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5KSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNlaWxcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kIChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgeSA9IGJbMV0gLSBhWzFdO1xuICByZXR1cm4geCp4ICsgeSp5O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aCAoYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIHJldHVybiB4KnggKyB5Knk7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICB2YXIgbGVuID0geCp4ICsgeSp5O1xuICBpZiAobGVuID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gIG91dFswXSA9IG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdLFxuICAgIGF5ID0gYVsxXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcbiAgdmFyIHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gIG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGU7XG4gIG91dFsxXSA9IE1hdGguc2luKHIpICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgMkQgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzJcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgdmVjMiBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCBiLCBjKSB7XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgbGV0IHAwID0gYVswXSAtIGJbMF0sXG4gIHAxID0gYVsxXSAtIGJbMV0sXG4gIHNpbkMgPSBNYXRoLnNpbihjKSxcbiAgY29zQyA9IE1hdGguY29zKGMpO1xuICBcbiAgLy9wZXJmb3JtIHJvdGF0aW9uIGFuZCB0cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSBwMCpjb3NDIC0gcDEqc2luQyArIGJbMF07XG4gIG91dFsxXSA9IHAwKnNpbkMgKyBwMSpjb3NDICsgYlsxXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gMkQgdmVjdG9yc1xuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICBsZXQgeDEgPSBhWzBdLFxuICAgIHkxID0gYVsxXSxcbiAgICB4MiA9IGJbMF0sXG4gICAgeTIgPSBiWzFdO1xuICBcbiAgbGV0IGxlbjEgPSB4MSp4MSArIHkxKnkxO1xuICBpZiAobGVuMSA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbjEgPSAxIC8gTWF0aC5zcXJ0KGxlbjEpO1xuICB9XG4gIFxuICBsZXQgbGVuMiA9IHgyKngyICsgeTIqeTI7XG4gIGlmIChsZW4yID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuMiA9IDEgLyBNYXRoLnNxcnQobGVuMik7XG4gIH1cbiAgXG4gIGxldCBjb3NpbmUgPSAoeDEgKiB4MiArIHkxICogeTIpICogbGVuMSAqIGxlbjI7XG4gIFxuICBcbiAgaWYoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgZWxzZSBpZihjb3NpbmUgPCAtMS4wKSB7XG4gICAgcmV0dXJuIE1hdGguUEk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnKSc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV07XG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGl2ID0gZGl2aWRlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGlzdCA9IGRpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzJzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzIuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMjtcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbi8vIHB2dFxuZnVuY3Rpb24gbm9ybWFsaXplKGFycmF5KSB7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhcbiAgICAgICAgYXJyYXlbMF0gLyAyNTUsXG4gICAgICAgIGFycmF5WzFdIC8gMjU1LFxuICAgICAgICBhcnJheVsyXSAvIDI1NSxcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4SW50VG9SZ2IoaGV4KSB7XG4gICAgY29uc3QgciA9IGhleCA+PiAxNjtcbiAgICBjb25zdCBnID0gaGV4ID4+IDggJiAweEZGOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgY29uc3QgYiA9IGhleCAmIDB4RkY7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhyLCBnLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleFN0cmluZ1RvUmdiKGhleCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHJldHVybiByZXN1bHQgPyB2ZWMzLmZyb21WYWx1ZXMoXG4gICAgICAgIHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgICBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcbiAgICAgICAgcGFyc2VJbnQocmVzdWx0WzNdLCAxNiksXG4gICAgKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgaGV4UiA9IGNvbXBvbmVudFRvSGV4KHIpO1xuICAgIGNvbnN0IGhleEcgPSBjb21wb25lbnRUb0hleChnKTtcbiAgICBjb25zdCBoZXhCID0gY29tcG9uZW50VG9IZXgoYik7XG4gICAgcmV0dXJuIGAjJHtoZXhSfSR7aGV4R30ke2hleEJ9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoaGV4KSB7XG4gICAgY29uc3QgY29sb3IgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIGNvbnN0IHJnYiA9IHR5cGVvZiBoZXggPT09ICdudW1iZXInID8gaGV4SW50VG9SZ2IoaGV4KSA6IGhleFN0cmluZ1RvUmdiKGhleCk7XG4gICAgdmVjMy5jb3B5KGNvbG9yLCBub3JtYWxpemUocmdiKSk7XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kKG0sIG4pIHtcbiAgICByZXR1cm4gKChtICUgbikgKyBuKSAlIG47XG59XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IFdPUkRfUkVHWCA9ICh3b3JkKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYFxcXFxiJHt3b3JkfVxcXFxiYCwgJ2dpJyk7XG59O1xuXG5jb25zdCBMSU5FX1JFR1ggPSAod29yZCkgPT4ge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGAke3dvcmR9YCwgJ2dpJyk7XG59O1xuXG5jb25zdCBWRVJURVggPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAnYXR0cmlidXRlJyxcbiAgICB9LCB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ291dCcpLFxuICAgICAgICByZXBsYWNlOiAndmFyeWluZycsXG4gICAgfSxcbl07XG5cbmNvbnN0IEZSQUdNRU5UID0gW1xuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnaW4nKSxcbiAgICAgICAgcmVwbGFjZTogJ3ZhcnlpbmcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IExJTkVfUkVHWCgnb3V0IHZlYzQgb3V0Q29sb3I7JyksXG4gICAgICAgIHJlcGxhY2U6ICcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0Q29sb3InKSxcbiAgICAgICAgcmVwbGFjZTogJ2dsX0ZyYWdDb2xvcicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlUHJvaicpLFxuICAgICAgICByZXBsYWNlOiAndGV4dHVyZTJEUHJvaicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlJyksXG4gICAgICAgIHJlcGxhY2Uoc2hhZGVyKSB7XG4gICAgICAgICAgICAvLyBGaW5kIGFsbCB0ZXh0dXJlIGRlZmludGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVHbG9iYWxSZWd4ID0gbmV3IFJlZ0V4cCgnXFxcXGJ0ZXh0dXJlXFxcXGInLCAnZ2knKTtcblxuICAgICAgICAgICAgLy8gRmluZCBzaW5nbGUgdGV4dHVyZSBkZWZpbml0aW9uXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlU2luZ2xlUmVneCA9IG5ldyBSZWdFeHAoJ1xcXFxidGV4dHVyZVxcXFxiJywgJ2knKTtcblxuICAgICAgICAgICAgLy8gR2V0cyB0aGUgdGV4dHVyZSBjYWxsIHNpZ25hdHVyZSBlLmcgdGV4dHVyZSh1VGV4dHVyZTEsIHZVdik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4ID0gbmV3IFJlZ0V4cCgvdGV4dHVyZVxcKChbXildKylcXCkvLCAnaScpO1xuXG4gICAgICAgICAgICAvLyBHZXQgYWxsIG1hdGNoaW5nIG9jY3VyYW5jZXNcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBzaGFkZXIubWF0Y2godGV4dHVyZUdsb2JhbFJlZ3gpO1xuICAgICAgICAgICAgbGV0IHJlcGxhY2VtZW50ID0gJyc7XG5cbiAgICAgICAgICAgIC8vIElmIG5vdGhpbmcgbWF0Y2hlcyByZXR1cm5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSByZXR1cm4gc2hhZGVyO1xuXG4gICAgICAgICAgICAvLyBSZXBsYWNlIGVhY2ggb2NjdXJhbmNlIGJ5IGl0J3MgdW5pZm9ybSB0eXBlXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IHNoYWRlci5tYXRjaCh0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4KVswXTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pZm9ybU5hbWUgPSBtYXRjaC5yZXBsYWNlKCd0ZXh0dXJlKCcsICcnKS5zcGxpdCgnLCcpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdW5pZm9ybVR5cGUgPSBzaGFkZXIubWF0Y2goYCguKj8pICR7dW5pZm9ybU5hbWV9YCwgJ2knKVsxXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtVHlwZSA9IHVuaWZvcm1UeXBlLnNwbGl0KCcgJylbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh1bmlmb3JtVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSAndGV4dHVyZTJEJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyQ3ViZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudCA9ICd0ZXh0dXJlQ3ViZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNoYWRlciA9IHNoYWRlci5yZXBsYWNlKHRleHR1cmVTaW5nbGVSZWd4LCByZXBsYWNlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlICovXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgICB9LFxuICAgIH1dO1xuXG5jb25zdCBHRU5FUklDID0gW3tcbiAgICBtYXRjaDogTElORV9SRUdYKCcjdmVyc2lvbiAzMDAgZXMnKSxcbiAgICByZXBsYWNlOiAnJyxcbn1dO1xuXG5jb25zdCBWRVJURVhfUlVMRVMgPSBbLi4uR0VORVJJQywgLi4uVkVSVEVYXTtcbmNvbnN0IEZSQUdNRU5UX1JVTEVTID0gWy4uLkdFTkVSSUMsIC4uLkZSQUdNRU5UXTtcblxuLy8gY29uc3QgdHJhbnNmb3JtID0gKGNvZGUpID0+IHtcbi8vICAgICByZXR1cm4gY29kZVxuLy8gICAgICAgICAvLyByZW1vdmVzIC8vXG4vLyAgICAgICAgIC5yZXBsYWNlKC9bIFxcdF0qXFwvXFwvLipcXG4vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZSAvKiAqL1xuLy8gICAgICAgICAucmVwbGFjZSgvWyBcXHRdKlxcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZXMgbXVsdGlwbGUgd2hpdGUgc3BhY2VzXG4vLyAgICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJHxcXHMrKD89XFxzKS9nLCAnJyk7XG4vLyB9O1xuXG4vKipcbiAqIFJlcGxhY2VzIGVzMzAwIHN5bnRheCB0byBlczEwMFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShzaGFkZXIsIHNoYWRlclR5cGUpIHtcbiAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9XG5cbiAgICBjb25zdCBydWxlcyA9IHNoYWRlclR5cGUgPT09ICd2ZXJ0ZXgnID8gVkVSVEVYX1JVTEVTIDogRlJBR01FTlRfUlVMRVM7XG4gICAgcnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJ1bGUucmVwbGFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc2hhZGVyID0gcnVsZS5yZXBsYWNlKHNoYWRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGFkZXIgPSBzaGFkZXIucmVwbGFjZShydWxlLm1hdGNoLCBydWxlLnJlcGxhY2UpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2hhZGVyO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNsYXNzIFZlY3RvcjMge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDApIHtcbiAgICAgICAgdGhpcy5kYXRhID0gdmVjMy5mcm9tVmFsdWVzKHgsIHksIHopO1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgfVxuXG4gICAgc2V0IHgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XG4gICAgfVxuXG4gICAgc2V0IHkodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XG4gICAgfVxuXG4gICAgc2V0IHoodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzJdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3IzO1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCwgcXVhdCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL3ZlY3RvcjMnO1xuXG5sZXQgdXVpZCA9IDA7XG5sZXQgYXhpc0FuZ2xlID0gMDtcbmNvbnN0IHF1YXRlcm5pb25BeGlzQW5nbGUgPSB2ZWMzLmNyZWF0ZSgpO1xuXG5jbGFzcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51aWQgPSB1dWlkKys7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXcgVmVjdG9yMygpO1xuICAgICAgICB0aGlzLnNjYWxlID0gbmV3IFZlY3RvcjMoMSwgMSwgMSk7XG5cbiAgICAgICAgdGhpcy5fdHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uID0gcXVhdC5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMudXAgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMubG9va1RvVGFyZ2V0ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5tYXRyaWNlcyA9IHtcbiAgICAgICAgICAgIHBhcmVudDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIG1vZGVsOiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgbG9va0F0OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlydHkgPSB7XG4gICAgICAgICAgICBzb3J0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgc2hhZGVyOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXQgdHJhbnNwYXJlbnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS50cmFuc3BhcmVudCA9IHRoaXMudHJhbnNwYXJlbnQgIT09IHZhbHVlO1xuICAgICAgICB0aGlzLl90cmFuc3BhcmVudCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB0cmFuc3BhcmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zcGFyZW50O1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRoaXMudmlzaWJsZSAhPT0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3Zpc2libGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdmlzaWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cmljZXMoKSB7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5wYXJlbnQpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubW9kZWwpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgcXVhdC5pZGVudGl0eSh0aGlzLnF1YXRlcm5pb24pO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgbWF0NC5jb3B5KHRoaXMubWF0cmljZXMucGFyZW50LCB0aGlzLnBhcmVudC5tYXRyaWNlcy5tb2RlbCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMucGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvb2tUb1RhcmdldCkge1xuICAgICAgICAgICAgbWF0NC50YXJnZXRUbyh0aGlzLm1hdHJpY2VzLmxvb2tBdCwgdGhpcy5wb3NpdGlvbi5kYXRhLCB0aGlzLnRhcmdldCwgdGhpcy51cCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMucG9zaXRpb24uZGF0YSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVgodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueCk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVkodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVoodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueik7XG4gICAgICAgICAgICBheGlzQW5nbGUgPSBxdWF0LmdldEF4aXNBbmdsZShxdWF0ZXJuaW9uQXhpc0FuZ2xlLCB0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICAgICAgbWF0NC5yb3RhdGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgYXhpc0FuZ2xlLCBxdWF0ZXJuaW9uQXhpc0FuZ2xlKTtcbiAgICAgICAgfVxuICAgICAgICBtYXQ0LnNjYWxlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMuc2NhbGUuZGF0YSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgLy8gdG8gYmUgb3ZlcnJpZGVuO1xuICAgIH1cblxuICAgIGFkZChtb2RlbCkge1xuICAgICAgICBtb2RlbC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobW9kZWwpO1xuICAgICAgICB0aGlzLmRpcnR5LnNvcnRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlbW92ZShtb2RlbCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihtb2RlbCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmF2ZXJzZShvYmplY3QpIHtcbiAgICAgICAgLy8gaWYgdHJhdmVyc2VkIG9iamVjdCBpcyB0aGUgc2NlbmVcbiAgICAgICAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYmplY3QgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zY2VuZUdyYXBoU29ydGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2JqZWN0LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRyYXZlcnNlKG9iamVjdC5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0LnBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZU1hdHJpY2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFXG4gICAgICAgIC8vIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UsIHdlIGFsc28gY2hlY2sgaWYgdGhlIG9iamVjdHMgYXJlIGRpcnR5IHdoZW4gd2UgdHJhdmVyc2UgdGhlbS5cbiAgICAgICAgLy8gdGhpcyBhdm9pZHMgaGF2aW5nIGEgc2Vjb25kIGxvb3AgdGhyb3VnaCB0aGUgZ3JhcGggc2NlbmUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIGFueSBlbGVtZW50IGdldHMgYWRkZWQgLyByZW1vdmVkIGZyb20gc2NlbmVcbiAgICAgICAgLy8gb3IgaWYgaXRzIHRyYW5zcGFyZW5jeSBjaGFuZ2VzLCB3ZSBuZWVkIHRvIHNvcnQgdGhlbSBhZ2FpbiBpbnRvXG4gICAgICAgIC8vIG9wYXF1ZSAvIHRyYW5zcGFyZW50IGFycmF5c1xuICAgICAgICBpZiAob2JqZWN0LmRpcnR5LnNvcnRpbmcgfHxcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2NlbmVHcmFwaFNvcnRlcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdDM7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIE9ydGhvZ3JhcGhpY0NhbWVyYSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBsZWZ0OiAtMSxcbiAgICAgICAgICAgIHJpZ2h0OiAxLFxuICAgICAgICAgICAgdG9wOiAxLFxuICAgICAgICAgICAgYm90dG9tOiAtMSxcbiAgICAgICAgICAgIG5lYXI6IC0xMDAwLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGVzIHByb2plY3Rpb24gbWF0cml4XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbnVtYmVycyBhcmUgYXBwcm94aW1hdGVseSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHVwZGF0ZUNhbWVyYU1hdHJpeCgpIHtcbiAgICAgICAgLy8gbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXJcbiAgICAgICAgbWF0NC5vcnRobyhcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRoaXMucmlnaHQsXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSxcbiAgICAgICAgICAgIHRoaXMudG9wLFxuICAgICAgICAgICAgdGhpcy5uZWFyLFxuICAgICAgICAgICAgdGhpcy5mYXIsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcnRob2dyYXBoaWNDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgICAgICBmb3Y6IDM1LFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgdGhpcy5mb3YgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICAgICAgICB3aWR0aCAvIGhlaWdodCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyc3BlY3RpdmVDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFVCTywgRk9HLCBFWFRFTlNJT05TIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0JBU0lDLCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQmFzaWMge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSBwcm9wcy5jb2xvciB8fCB2ZWMzLmZyb21WYWx1ZXMoMSwgMSwgMSk7XG5cbiAgICAgICAgY29uc3QgdmVydGV4ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLnZlcnRleCgpfVxuXG4gICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gdmVjMyB1X2NvbG9yO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgYmFzZSA9IHZlYzQodV9jb2xvciwgMS4wKTtcblxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuXG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHR5cGU6IFNIQURFUl9CQVNJQyxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfY29sb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlYzMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29sb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBtYWdGaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KFsyNTUsIDI1NSwgMjU1LCAyNTVdKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIDEsIDEsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5tYWdGaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5taW5GaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLndyYXBTKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgdGhpcy53cmFwVCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZnJvbUltYWdlKHVybCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShpbWcpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgIH1cblxuICAgIHVwZGF0ZShpbWFnZSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBMSUdIVCwgRk9HLCBDTElQUElORywgRVhURU5TSU9OUywgU0hBRE9XIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0RFRkFVTFQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBEZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgLy8gbWFwOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vNjIwNjc4L3JlZC5qcGcnLlxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRleHR1cmU6IG5ldyBUZXh0dXJlKClcbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cbiAgICAgICAgICAgICR7U0hBRE9XLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcbiAgICAgICAgICAgIG91dCB2ZWMzIHZfbm9ybWFsO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogd29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgZnJhZ1ZlcnRleEVjID0gcG9zaXRpb24ueHl6OyAvLyB3b3JsZFBvc2l0aW9uLnh5ejtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgICAgICB2X25vcm1hbCA9IChub3JtYWxNYXRyaXggKiB2ZWM0KGFfbm9ybWFsLCAxLjApKS54eXo7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuICAgICAgICAgICAgaW4gdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgdV9jb2xvcjtcblxuICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyB2X25vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KGZyYWdWZXJ0ZXhFYyksIGRGZHkoZnJhZ1ZlcnRleEVjKSkpO1xuXG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gdmVjNCh1X2NvbG9yLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKj0gdGV4dHVyZSh1X21hcCwgdl91dik7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy5mcmFnbWVudCgpfVxuICAgICAgICAgICAgICAgICR7TElHSFQuZmFjdG9yeSgpfVxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfREVGQVVMVCxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzYW1wbGVyMkQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgdV9jb2xvcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjMycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb2xvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0O1xuIiwiaW1wb3J0IHsgVUJPLCBMSUdIVCwgRk9HLCBDTElQUElORywgRVhURU5TSU9OUywgU0hBRE9XIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0JJTExCT0FSRCwgRFJBVyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEJpbGxib2FyZCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICBpbiB2ZWMyIGFfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXhfcHJlKCl9XG4gICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXhfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWMzIGZyYWdWZXJ0ZXhFYztcbiAgICAgICAgICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgICAgICAgICBvdXQgdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgd29ybGRQb3NpdGlvbiA9IG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgICAgIHZlYzQgcG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIHdvcmxkUG9zaXRpb247XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgICAgICAgICAgIGZyYWdWZXJ0ZXhFYyA9IHBvc2l0aW9uLnh5ejsgLy8gd29ybGRQb3NpdGlvbi54eXo7XG4gICAgICAgICAgICAgICAgdl91diA9IGFfdXY7XG4gICAgICAgICAgICAgICAgdl9ub3JtYWwgPSAobm9ybWFsTWF0cml4ICogdmVjNChhX25vcm1hbCwgMS4wKSkueHl6O1xuXG4gICAgICAgICAgICAgICAgJHtTSEFET1cudmVydGV4KCl9XG4gICAgICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICBpbiB2ZWMzIGZyYWdWZXJ0ZXhFYztcbiAgICAgICAgICAgIGluIHZlYzIgdl91djtcbiAgICAgICAgICAgIGluIHZlYzMgdl9ub3JtYWw7XG5cbiAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtVQk8ubGlnaHRzKCl9XG5cbiAgICAgICAgICAgICR7U0hBRE9XLmZyYWdtZW50X3ByZSgpfVxuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgJHtwcm9wcy5mcmFnbWVudCB8fCAndm9pZCBtYWluSW1hZ2UoIG91dCB2ZWM0IGZyYWdDb2xvciwgaW4gdmVjMiBmcmFnQ29vcmQgKSB7IGZyYWdDb2xvciA9IHZlYzQoMC4wLCAxLjAsIDEuMCwgMS4wKTsgfSd9XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGJhc2UgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICAgICAgbWFpbkltYWdlKGJhc2UsIGdsX0ZyYWdDb29yZC54eSk7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy5mcmFnbWVudCgpfVxuICAgICAgICAgICAgICAgICR7TElHSFQuZmFjdG9yeSgpfVxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfQklMTEJPQVJELFxuICAgICAgICAgICAgbW9kZTogcHJvcHMud2lyZWZyYW1lID09PSB0cnVlID8gRFJBVy5MSU5FUyA6IERSQVcuVFJJQU5HTEVTLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7fSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCaWxsYm9hcmQ7XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBGT0csIENMSVBQSU5HLCBFWFRFTlNJT05TIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX1NFTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFNlbSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLm1hcCkge1xuICAgICAgICAgICAgdGhpcy5tYXAuZnJvbUltYWdlKHByb3BzLm1hcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZXh0dXJlOiBuZXcgVGV4dHVyZSgpXG4gICAgICAgIGlmIChwcm9wcy50ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcCA9IHByb3BzLnRleHR1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICBpbiB2ZWMyIGFfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXhfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IHBvc2l0aW9uID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgdmVjMyB2X2UgPSB2ZWMzKHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICB2ZWMzIHZfbiA9IG1hdDModmlld01hdHJpeCAqIG1vZGVsTWF0cml4KSAqIGFfbm9ybWFsO1xuICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3Qobm9ybWFsaXplKHZfZSksIG5vcm1hbGl6ZSh2X24pKTtcbiAgICAgICAgICAgICAgICBmbG9hdCBtID0gMi4wICogc3FydChwb3coci54LCAyLjApICsgcG93KHIueSwgMi4wKSArIHBvdyhyLnogKyAxLjAsIDIuMCkpO1xuICAgICAgICAgICAgICAgIHZfdXYgPSByLnh5IC8gbSArIDAuNTtcblxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcudmVydGV4KCl9XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgICAgICAgICAke0NMSVBQSU5HLmZyYWdtZW50X3ByZSgpfVxuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cbiAgICAgICAgICAgICR7VUJPLmxpZ2h0cygpfVxuXG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X21hcDtcblxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGJhc2UgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XG5cbiAgICAgICAgICAgICAgICBiYXNlICs9IHRleHR1cmUodV9tYXAsIHZfdXYpO1xuXG4gICAgICAgICAgICAgICAgJHtGT0cubGluZWFyKCl9XG4gICAgICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHR5cGU6IFNIQURFUl9TRU0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2FtcGxlcjJEJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubWFwLnRleHR1cmUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VtO1xuIiwiY29uc3QgUFJPR1JBTV9QT09MID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihnbCwgc3RyLCB0eXBlKSB7XG4gICAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc3RyKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICBjb25zdCBjb21waWxlZCA9IGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKTtcblxuICAgIGlmICghY29tcGlsZWQpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG5cbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IsIHN0cik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVByb2dyYW0gPSAoZ2wsIHZlcnRleCwgZnJhZ21lbnQsIHByb2dyYW1JRCkgPT4ge1xuICAgIGNvbnN0IHBvb2wgPSBQUk9HUkFNX1BPT0xbYHBvb2xfJHtwcm9ncmFtSUR9YF07XG4gICAgaWYgKCFwb29sKSB7XG4gICAgICAgIGNvbnN0IHZzID0gY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXgsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICBjb25zdCBmcyA9IGNyZWF0ZVNoYWRlcihnbCwgZnJhZ21lbnQsIGdsLkZSQUdNRU5UX1NIQURFUik7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcblxuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdnMpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBQUk9HUkFNX1BPT0xbYHBvb2xfJHtwcm9ncmFtSUR9YF0gPSBwcm9ncmFtO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIHJldHVybiBwb29sO1xufTtcbiIsImltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICcuLi9zZXNzaW9uJztcblxuY2xhc3MgVWJvIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBib3VuZExvY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICB0aGlzLmJvdW5kTG9jYXRpb24gPSBib3VuZExvY2F0aW9uO1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG5cbiAgICAgICAgdGhpcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmRhdGEsIGdsLlNUQVRJQ19EUkFXKTsgLy8gRFlOQU1JQ19EUkFXXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyQmFzZShnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5ib3VuZExvY2F0aW9uLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIC8vIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTsgLy8gTUFZQkU/XG4gICAgfVxuXG4gICAgdXBkYXRlKGRhdGEsIG9mZnNldCA9IDApIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5kYXRhLnNldChkYXRhLCBvZmZzZXQpO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgMCwgdGhpcy5kYXRhLCAwLCBudWxsKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVYm87XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBWYW8ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMudmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKTtcbiAgICAgICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMudmFvID0gc3VwcG9ydHMoKS52ZXJ0ZXhBcnJheU9iamVjdC5jcmVhdGVWZXJ0ZXhBcnJheU9FUygpO1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuYmluZFZlcnRleEFycmF5T0VTKHRoaXMudmFvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuYmluZFZlcnRleEFycmF5T0VTKHRoaXMudmFvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuZGVsZXRlVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5kZWxldGVWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YW8gPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmFvO1xuIiwiZXhwb3J0IGNvbnN0IGdldFR5cGVTaXplID0gKHR5cGUpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdmbG9hdCc6XG4gICAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3ZlYzInOlxuICAgICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAndmVjNCc6XG4gICAgY2FzZSAnbWF0Mic6XG4gICAgICAgIHJldHVybiA0O1xuICAgIGNhc2UgJ21hdDMnOlxuICAgICAgICByZXR1cm4gOTtcbiAgICBjYXNlICdtYXQ0JzpcbiAgICAgICAgcmV0dXJuIDE2O1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke3R5cGV9XCIgaXMgYW4gdW5rbm93biB0eXBlYCk7XG4gICAgfVxufTtcbiIsImltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBjb25zdCBpbml0QXR0cmlidXRlcyA9IChhdHRyaWJ1dGVzLCBwcm9ncmFtKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gYXR0cmlidXRlc1twcm9wXTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBwcm9wKTtcblxuICAgICAgICBsZXQgYiA9IGN1cnJlbnQuYnVmZmVyO1xuICAgICAgICBpZiAoIWN1cnJlbnQuYnVmZmVyKSB7XG4gICAgICAgICAgICBiID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBjdXJyZW50LnZhbHVlLCBnbC5TVEFUSUNfRFJBVyk7IC8vIG9yIERZTkFNSUNfRFJBV1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihjdXJyZW50LCB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGJ1ZmZlcjogYixcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGJpbmRBdHRyaWJ1dGVzID0gKGF0dHJpYnV0ZXMpID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICBpbnN0YW5jZWQsXG4gICAgICAgIH0gPSBhdHRyaWJ1dGVzW2tleV07XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9PSAtMSkge1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCBzaXplLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuXG4gICAgICAgICAgICBjb25zdCBkaXZpc29yID0gaW5zdGFuY2VkID8gMSA6IDA7XG4gICAgICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGxvY2F0aW9uLCBkaXZpc29yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHMoKS5pbnN0YW5jZWRBcnJheXMudmVydGV4QXR0cmliRGl2aXNvckFOR0xFKGxvY2F0aW9uLCBkaXZpc29yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlQXR0cmlidXRlcyA9IChhdHRyaWJ1dGVzKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgIH0gPSBhdHRyaWJ1dGVzW2tleV07XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9PSAtMSkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdmFsdWUsIGdsLkRZTkFNSUNfRFJBVyk7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmV4cG9ydCBjb25zdCBpbml0VW5pZm9ybXMgPSAodW5pZm9ybXMsIHByb2dyYW0pID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgIGNvbnN0IHRleHR1cmVJbmRpY2VzID0gW1xuICAgICAgICBnbC5URVhUVVJFMCxcbiAgICAgICAgZ2wuVEVYVFVSRTEsXG4gICAgICAgIGdsLlRFWFRVUkUyLFxuICAgICAgICBnbC5URVhUVVJFMyxcbiAgICAgICAgZ2wuVEVYVFVSRTQsXG4gICAgICAgIGdsLlRFWFRVUkU1LFxuICAgIF07XG5cbiAgICBsZXQgaSA9IDA7XG5cbiAgICBPYmplY3Qua2V5cyh1bmlmb3JtcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gdW5pZm9ybXNbcHJvcF07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHByb3ApO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oY3VycmVudCwge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjdXJyZW50LnR5cGUgPT09ICdzYW1wbGVyMkQnKSB7XG4gICAgICAgICAgICBjdXJyZW50LnRleHR1cmVJbmRleCA9IGk7XG4gICAgICAgICAgICBjdXJyZW50LmFjdGl2ZVRleHR1cmUgPSB0ZXh0dXJlSW5kaWNlc1tpXTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZVVuaWZvcm1zID0gKHVuaWZvcm1zKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBjb25zdCB1bmlmb3JtID0gdW5pZm9ybXNba2V5XTtcblxuICAgICAgICBzd2l0Y2ggKHVuaWZvcm0udHlwZSkge1xuICAgICAgICBjYXNlICdtYXQ0JzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pZm9ybS5sb2NhdGlvbiwgZmFsc2UsIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21hdDMnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDNmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndmVjNCc6XG4gICAgICAgICAgICBnbC51bmlmb3JtNGZ2KHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZlYzMnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybTNmdih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm0yZnYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmxvYXQnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybTFmKHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NhbXBsZXIyRCc6XG4gICAgICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKHVuaWZvcm0uYWN0aXZlVGV4dHVyZSk7XG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGdsLnVuaWZvcm0xaSh1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnRleHR1cmVJbmRleCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke3VuaWZvcm0udHlwZX1cIiBpcyBhbiB1bmtub3duIHVuaWZvcm0gdHlwZWApO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuIiwiaW1wb3J0IHsgdmVjNCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgT2JqZWN0MyBmcm9tICcuL29iamVjdDMnO1xuaW1wb3J0IHsgY3JlYXRlUHJvZ3JhbSB9IGZyb20gJy4uL2dsL3Byb2dyYW0nO1xuaW1wb3J0IHsgZ2V0Q29udGV4dCwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhULCBEUkFXLCBTSURFLCBTSEFERVJfQ1VTVE9NIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7XG4gICAgYmluZEF0dHJpYnV0ZXMsXG4gICAgZ2V0VHlwZVNpemUsXG4gICAgaW5pdEF0dHJpYnV0ZXMsXG4gICAgaW5pdFVuaWZvcm1zLFxuICAgIHVwZGF0ZVVuaWZvcm1zLFxuICAgIHVwZGF0ZUF0dHJpYnV0ZXMsXG4gICAgVmFvLFxufSBmcm9tICcuLi9nbCc7XG5pbXBvcnQgeyBnbHNsM3RvMSB9IGZyb20gJy4uL3V0aWxzJztcblxuLy8gdXNlZCBmb3Igc3BlZWQgb3B0aW1pc2F0aW9uXG5sZXQgV0VCR0wyID0gZmFsc2U7XG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB7fTtcblxuICAgICAgICAvLyB6IGZpZ2h0XG4gICAgICAgIHRoaXMucG9seWdvbk9mZnNldCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBvbHlnb25PZmZzZXRGYWN0b3IgPSAwO1xuICAgICAgICB0aGlzLnBvbHlnb25PZmZzZXRVbml0cyA9IDE7XG5cbiAgICAgICAgLy8gY2xpcHBpbmcgcGxhbmVzXG4gICAgICAgIHRoaXMuY2xpcHBpbmcgPSB7XG4gICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcGxhbmVzOiBbXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGluc3RhbmNpbmdcbiAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0luc3RhbmNlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gcmVuZGVyaW5nIG1vZGVcbiAgICAgICAgdGhpcy5tb2RlID0gRFJBVy5UUklBTkdMRVM7XG5cbiAgICAgICAgLy8gcmVuZGVyaW5nIHNpZGVcbiAgICAgICAgdGhpcy5zaWRlID0gU0lERS5GUk9OVDtcblxuICAgICAgICAvLyB0eXBlXG4gICAgICAgIHRoaXMudHlwZSA9IFN0cmluZyhTSEFERVJfQ1VTVE9NKTtcblxuICAgICAgICAvLyBjcmVhdGVzIHNoYWRvd1xuICAgICAgICB0aGlzLnNoYWRvd3MgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldEF0dHJpYnV0ZShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBzaXplID0gZ2V0VHlwZVNpemUodHlwZSk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRJbmRleCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluZGljZXMgPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRVbmlmb3JtKG5hbWUsIHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMudW5pZm9ybXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0U2hhZGVyKHZlcnRleCwgZnJhZ21lbnQpIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXggPSB2ZXJ0ZXg7XG4gICAgICAgIHRoaXMuZnJhZ21lbnQgPSBmcmFnbWVudDtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZUF0dHJpYnV0ZShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBzaXplID0gZ2V0VHlwZVNpemUodHlwZSk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIGluc3RhbmNlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZUNvdW50KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZUNvdW50ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0luc3RhbmNlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgV0VCR0wyID0gZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDI7XG5cbiAgICAgICAgLy8gb2JqZWN0IG1hdGVyaWFsXG4gICAgICAgIGlmICh0aGlzLnZlcnRleCAmJiB0aGlzLmZyYWdtZW50KSB7XG4gICAgICAgICAgICBpZiAoIVdFQkdMMikge1xuICAgICAgICAgICAgICAgIHRoaXMudmVydGV4ID0gZ2xzbDN0bzEodGhpcy52ZXJ0ZXgsICd2ZXJ0ZXgnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gZ2xzbDN0bzEodGhpcy5mcmFnbWVudCwgJ2ZyYWdtZW50Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW0oZ2wsIHRoaXMudmVydGV4LCB0aGlzLmZyYWdtZW50LCB0aGlzLnR5cGUpO1xuICAgICAgICAgICAgZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgICAgICB0aGlzLnZhbyA9IG5ldyBWYW8oKTtcblxuICAgICAgICAgICAgaW5pdEF0dHJpYnV0ZXModGhpcy5hdHRyaWJ1dGVzLCB0aGlzLnByb2dyYW0pO1xuICAgICAgICAgICAgaW5pdFVuaWZvcm1zKHRoaXMudW5pZm9ybXMsIHRoaXMucHJvZ3JhbSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluZGljZXMgJiYgIXRoaXMuaW5kaWNlcy5idWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljZXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoaXMudmFvLmJpbmQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuYmluZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy52YW8udW5iaW5kKCk7XG4gICAgICAgICAgICAvLyB0aGlzLnVuYmluZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBiaW5kQXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMsIHRoaXMucHJvZ3JhbSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5kaWNlcykge1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5pbmRpY2VzLmJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmluZGljZXMudmFsdWUsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIHVwZGF0ZVZlcnRpY2VzKGRhdGEsIGluZGV4KSB7XG4gICAgICAgIC8vIGluZGV4IG9mIHZlcnRpY2UgKiAzICh4eXopICsgMCBmb3IgWFxuICAgICAgICAvLyBpbmRleCBvZiB2ZXJ0aWNlICogMyAoeHl6KSArIDEgZm9yIFlcbiAgICAgICAgLy8gaW5kZXggb2YgdmVydGljZSAqIDMgKHh5eikgKyAyIGZvciBaXG4gICAgICAgIHRoaXMuZGlydHkuYXR0cmlidXRlcyA9IHRydWU7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlLnNldChkYXRhLCBpbmRleCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGluU2hhZG93TWFwKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpcnR5LmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZXModGhpcy5hdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkuYXR0cmlidXRlcyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlVW5pZm9ybXModGhpcy51bmlmb3Jtcyk7XG5cbiAgICAgICAgLy8gZW5hYmxlIGRlcHRoIHRlc3QgYW5kIGN1bGxpbmdcbiAgICAgICAgLy8gVE9ETzogbWF5YmUgdGhpcyBjYW4gaGF2ZSBvd24gdmFyaWFibGVzIHBlciBtb2RlbC5cbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgcmVuZGVyIHRhcmdldHMgZG9uJ3QgbmVlZCBkZXB0aCB0ZXN0XG4gICAgICAgIC8vIGlmICh0aGlzLnNoYWRvd3MgPT09IGZhbHNlKSB7XG4gICAgICAgIC8vICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAvLyBnbC5kaXNhYmxlKGdsLkJMRU5EKTtcblxuICAgICAgICBpZiAodGhpcy5wb2x5Z29uT2Zmc2V0KSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuUE9MWUdPTl9PRkZTRVRfRklMTCk7XG4gICAgICAgICAgICBnbC5wb2x5Z29uT2Zmc2V0KHRoaXMucG9seWdvbk9mZnNldEZhY3RvciwgdGhpcy5wb2x5Z29uT2Zmc2V0VW5pdHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5QT0xZR09OX09GRlNFVF9GSUxMKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGh0dHBzOi8vd2ViZ2wyZnVuZGFtZW50YWxzLm9yZy93ZWJnbC9sZXNzb25zL3dlYmdsLXRleHQtdGV4dHVyZS5odG1sXG4gICAgICAgIC8vIFRoZSBtb3N0IGNvbW1vbiBzb2x1dGlvbiBmb3IgcHJldHR5IG11Y2ggYWxsIHRyYW5zcGFyZW50IHJlbmRlcmluZyBpc1xuICAgICAgICAvLyB0byBkcmF3IGFsbCB0aGUgb3BhcXVlIHN0dWZmIGZpcnN0LFxuICAgICAgICAvLyB0aGVuIGFmdGVyLCBkcmF3IGFsbCB0aGUgdHJhbnNwYXJlbnQgc3R1ZmYgc29ydGVkIGJ5IHogZGlzdGFuY2VcbiAgICAgICAgLy8gd2l0aCB0aGUgZGVwdGggYnVmZmVyIHRlc3Rpbmcgb24gYnV0IGRlcHRoIGJ1ZmZlciB1cGRhdGluZyBvZmZcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICAgICAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb3VibGUgc2lkZSBtYXRlcmlhbFxuICAgICAgICBpZiAodGhpcy5zaWRlID09PSBTSURFLkZST05UKSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2lkZSA9PT0gU0lERS5CQUNLKSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkZST05UKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNpZGUgPT09IFNJREUuQk9USCkge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluU2hhZG93TWFwKSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkZST05UKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgICAgICBnbC5kcmF3RWxlbWVudHNJbnN0YW5jZWQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdXBwb3J0cygpLmluc3RhbmNlZEFycmF5cy5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljZXMudmFsdWUubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBnbC5VTlNJR05FRF9TSE9SVCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbmRpY2VzKSB7XG4gICAgICAgICAgICBnbC5kcmF3RWxlbWVudHModGhpcy5tb2RlLCB0aGlzLmluZGljZXMudmFsdWUubGVuZ3RoLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC5kcmF3QXJyYXlzKHRoaXMubW9kZSwgMCwgdGhpcy5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWUubGVuZ3RoIC8gMyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vZGVsO1xuIiwiaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHsgRGVmYXVsdCB9IGZyb20gJy4uL3NoYWRlcnMnO1xuaW1wb3J0IHsgU0hBREVSX0NVU1RPTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmxldCBzaGFkZXJJRCA9IDA7XG5jbGFzcyBNZXNoIGV4dGVuZHMgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fc2hhZGVyID0gbnVsbDtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBpbmRpY2VzLFxuICAgICAgICAgICAgbm9ybWFscyxcbiAgICAgICAgICAgIHV2cyxcbiAgICAgICAgfSA9IHBhcmFtcy5nZW9tZXRyeSB8fCB7fTtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIG1vZGUsXG4gICAgICAgIH0gPSBwYXJhbXMuc2hhZGVyIHx8IG5ldyBEZWZhdWx0KHsgY29sb3I6IHBhcmFtcy5jb2xvciwgbWFwOiBwYXJhbXMubWFwIH0pO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlJ3MgYSB0eXBlLCBhc3NpZ24gaXQsIHNvIHdlIGNhbiBzb3J0IGJ5IHR5cGUgaW4gdGhlIHJlbmRlcmVyLlxuICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gYCR7U0hBREVSX0NVU1RPTX0tJHtzaGFkZXJJRCsrfWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGUgPSBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FfcG9zaXRpb24nLCAndmVjMycsIG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKSk7XG4gICAgICAgIGlmIChpbmRpY2VzKSB7XG4gICAgICAgICAgICB0aGlzLnNldEluZGV4KG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vcm1hbHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhX25vcm1hbCcsICd2ZWMzJywgbmV3IEZsb2F0MzJBcnJheShub3JtYWxzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHV2cykge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FfdXYnLCAndmVjMicsIG5ldyBGbG9hdDMyQXJyYXkodXZzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyh1bmlmb3JtcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFVuaWZvcm0oa2V5LCB1bmlmb3Jtc1trZXldLnR5cGUsIHVuaWZvcm1zW2tleV0udmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNoYWRlcih2ZXJ0ZXgsIGZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBzZXQgc2hhZGVyKHNoYWRlcikge1xuICAgICAgICB0aGlzLmRpcnR5LnNoYWRlciA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NoYWRlciA9IHNoYWRlcjtcbiAgICAgICAgaWYgKHNoYWRlci50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHNoYWRlci50eXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gU0hBREVSX0NVU1RPTTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFNoYWRlcihzaGFkZXIudmVydGV4LCBzaGFkZXIuZnJhZ21lbnQpO1xuICAgIH1cblxuICAgIGdldCBzaGFkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNoO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgTWVzaCBmcm9tICcuLi9jb3JlL21lc2gnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uL2NvcmUvbW9kZWwnO1xuaW1wb3J0IHsgQmFzaWMgfSBmcm9tICcuLi9zaGFkZXJzJztcblxuY2xhc3MgQXhpc0hlbHBlciBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IChwcm9wcyAmJiBwcm9wcy5zaXplKSB8fCAxMDtcbiAgICAgICAgY29uc3QgZzEgPSB7IHBvc2l0aW9uczogWy4uLnZlYzMuZnJvbVZhbHVlcygwLCAwLCAwKSwgLi4udmVjMy5mcm9tVmFsdWVzKHNpemUsIDAsIDApXSB9O1xuICAgICAgICBjb25zdCBnMiA9IHsgcG9zaXRpb25zOiBbLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIDApLCAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgc2l6ZSwgMCldIH07XG4gICAgICAgIGNvbnN0IGczID0geyBwb3NpdGlvbnM6IFsuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksIC4uLnZlYzMuZnJvbVZhbHVlcygwLCAwLCBzaXplKV0gfTtcblxuICAgICAgICBjb25zdCBtMSA9IG5ldyBCYXNpYyh7IGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMSwgMCwgMCksIHdpcmVmcmFtZTogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgbTIgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDAsIDEsIDApLCB3aXJlZnJhbWU6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IG0zID0gbmV3IEJhc2ljKHsgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygwLCAwLCAxKSwgd2lyZWZyYW1lOiB0cnVlIH0pO1xuXG5cbiAgICAgICAgY29uc3QgeCA9IG5ldyBNZXNoKHsgZ2VvbWV0cnk6IGcxLCBzaGFkZXI6IG0xIH0pO1xuICAgICAgICB0aGlzLmFkZCh4KTtcblxuICAgICAgICBjb25zdCB5ID0gbmV3IE1lc2goeyBnZW9tZXRyeTogZzIsIHNoYWRlcjogbTIgfSk7XG4gICAgICAgIHRoaXMuYWRkKHkpO1xuXG4gICAgICAgIGNvbnN0IHogPSBuZXcgTWVzaCh7IGdlb21ldHJ5OiBnMywgc2hhZGVyOiBtMyB9KTtcbiAgICAgICAgdGhpcy5hZGQoeik7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQXhpc0hlbHBlcjtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi4vY29yZS9tZXNoJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9jb3JlL21vZGVsJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vc2hhZGVycyc7XG4vLyBpbXBvcnQgeyBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQXhpc0hlbHBlciBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IChwcm9wcyAmJiBwcm9wcy5zaXplKSB8fCAxO1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZXh0cmFjdCBnZW9tZXRyeVxuICAgICAgICBjb25zdCBzeCA9IHByb3BzLm1vZGVsLnNjYWxlLng7XG4gICAgICAgIGNvbnN0IHN5ID0gcHJvcHMubW9kZWwuc2NhbGUueTtcbiAgICAgICAgY29uc3Qgc3ogPSBwcm9wcy5tb2RlbC5zY2FsZS56O1xuXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWUubGVuZ3RoIC8gMztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaTMgPSBpICogMztcbiAgICAgICAgICAgIGNvbnN0IHYweCA9IHN4ICogcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlW2kzICsgMF07XG4gICAgICAgICAgICBjb25zdCB2MHkgPSBzeSAqIHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZVtpMyArIDFdO1xuICAgICAgICAgICAgY29uc3QgdjB6ID0gc3ogKiBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWVbaTMgKyAyXTtcbiAgICAgICAgICAgIGNvbnN0IG54ID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZVtpMyArIDBdO1xuICAgICAgICAgICAgY29uc3QgbnkgPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlW2kzICsgMV07XG4gICAgICAgICAgICBjb25zdCBueiA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWVbaTMgKyAyXTtcbiAgICAgICAgICAgIGNvbnN0IHYxeCA9IHYweCArIChzaXplICogbngpO1xuICAgICAgICAgICAgY29uc3QgdjF5ID0gdjB5ICsgKHNpemUgKiBueSk7XG4gICAgICAgICAgICBjb25zdCB2MXogPSB2MHogKyAoc2l6ZSAqIG56KTtcbiAgICAgICAgICAgIGdlb21ldHJ5LnBvc2l0aW9ucyA9IGdlb21ldHJ5LnBvc2l0aW9ucy5jb25jYXQoW3YweCwgdjB5LCB2MHosIHYxeCwgdjF5LCB2MXpdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNoYWRlciA9IG5ldyBCYXNpYyh7IGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMSksIHdpcmVmcmFtZTogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgbiA9IG5ldyBNZXNoKHsgZ2VvbWV0cnksIHNoYWRlciB9KTtcbiAgICAgICAgdGhpcy5hZGQobik7XG5cbiAgICAgICAgdGhpcy5yZWZlcmVuY2UgPSBwcm9wcy5tb2RlbDtcbiAgICAgICAgLy8gbW9kZSA9IERSQVcuTElORVNcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZSgpO1xuXG4gICAgICAgIHZlYzMuY29weSh0aGlzLnBvc2l0aW9uLmRhdGEsIHRoaXMucmVmZXJlbmNlLnBvc2l0aW9uLmRhdGEpO1xuICAgICAgICB2ZWMzLmNvcHkodGhpcy5yb3RhdGlvbi5kYXRhLCB0aGlzLnJlZmVyZW5jZS5yb3RhdGlvbi5kYXRhKTtcbiAgICAgICAgdGhpcy5sb29rVG9UYXJnZXQgPSB0aGlzLnJlZmVyZW5jZS5sb29rVG9UYXJnZXQ7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQXhpc0hlbHBlcjtcbiIsImV4cG9ydCBmdW5jdGlvbiByZXNpemUoZG9tRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgcmF0aW8pIHtcbiAgICBkb21FbGVtZW50LndpZHRoID0gd2lkdGggKiByYXRpbztcbiAgICBkb21FbGVtZW50LmhlaWdodCA9IGhlaWdodCAqIHJhdGlvO1xuICAgIGRvbUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgZG9tRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zdXBwb3J0ZWQoKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmlubmVySFRNTCA9ICdZb3VyIGJyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgV2ViR0wuPGJyPjxhIGhyZWY9XCJodHRwczovL2dldC53ZWJnbC5vcmdcIj5HZXQgV2ViR0w8L2E+JztcbiAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICd0YWJsZSc7XG4gICAgZGl2LnN0eWxlLm1hcmdpbiA9ICcyMHB4IGF1dG8gMCBhdXRvJztcbiAgICBkaXYuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCAjMzMzJztcbiAgICBkaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSc7XG4gICAgZGl2LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuICAgIGRpdi5zdHlsZS5wYWRkaW5nID0gJzEwcHgnO1xuICAgIGRpdi5zdHlsZS5mb250RmFtaWx5ID0gJ21vbm9zcGFjZSc7XG4gICAgZGl2LnN0eWxlLmZvbnRTaXplID0gJzEycHgnO1xuICAgIGRpdi5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICByZXR1cm4gZGl2O1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG4vLyBpbXBvcnQgVmVjdG9yMyBmcm9tICcuLi9jb3JlL3ZlY3RvcjMnO1xuaW1wb3J0IHsgRElSRUNUSU9OQUxfTElHSFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBMaWdodCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIC8vIFRPRE9cbiAgICB9XG59XG5cbmNsYXNzIERpcmVjdGlvbmFsIGV4dGVuZHMgTGlnaHQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnR5cGUgPSBESVJFQ1RJT05BTF9MSUdIVDtcblxuICAgICAgICB0aGlzLmNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuICAgICAgICB0aGlzLmludGVuc2l0eSA9IHByb3BzLmludGVuc2l0eSB8fCAwLjk4OTtcbiAgICB9XG59XG5cbmV4cG9ydCB7XG4gICAgRGlyZWN0aW9uYWwsXG59O1xuIiwiaW1wb3J0IHsgdmVjNCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgT2JqZWN0MyBmcm9tICcuL29iamVjdDMnO1xuaW1wb3J0IHsgRGlyZWN0aW9uYWwgfSBmcm9tICcuL2xpZ2h0cyc7XG5pbXBvcnQgeyBESVJFQ1RJT05BTF9MSUdIVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFNjZW5lIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5saWdodHMgPSB7XG4gICAgICAgICAgICBkaXJlY3Rpb25hbDogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5mb2cgPSB7XG4gICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29sb3I6IHZlYzQuZnJvbVZhbHVlcygwLCAwLCAwLCAxKSxcbiAgICAgICAgICAgIHN0YXJ0OiA1MDAsXG4gICAgICAgICAgICBlbmQ6IDEwMDAsXG4gICAgICAgICAgICBkZW5zaXR5OiAwLjAwMDI1LFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xpcHBpbmcgPSB7XG4gICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcGxhbmVzOiBbXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFkZCBzdW5cbiAgICAgICAgY29uc3QgZGlyZWN0aW9uYWwgPSBuZXcgRGlyZWN0aW9uYWwoe1xuICAgICAgICAgICAgbmVhcjogMSxcbiAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGRpcmVjdGlvbmFsLnBvc2l0aW9uWzBdID0gMTI1O1xuICAgICAgICBkaXJlY3Rpb25hbC5wb3NpdGlvblsxXSA9IDI1MDtcbiAgICAgICAgZGlyZWN0aW9uYWwucG9zaXRpb25bMl0gPSA1MDA7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoZGlyZWN0aW9uYWwpO1xuICAgIH1cblxuICAgIGFkZExpZ2h0KGxpZ2h0KSB7XG4gICAgICAgIHN3aXRjaCAobGlnaHQudHlwZSkge1xuICAgICAgICBjYXNlIERJUkVDVElPTkFMX0xJR0hUOlxuICAgICAgICAgICAgdGhpcy5saWdodHMuZGlyZWN0aW9uYWwucHVzaChsaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHVuc3VwcG9ydGVkIGxpZ2h0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVMaWdodChsaWdodCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMubGlnaHRzLmRpcmVjdGlvbmFsLmluZGV4T2YobGlnaHQpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBsaWdodC5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2VuZTtcbiIsImltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgUmVuZGVyVGFyZ2V0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIC8vIHNvbWUgZGVmYXVsdCBwcm9wc1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIHdpZHRoOiA1MTIsXG4gICAgICAgICAgICBoZWlnaHQ6IDUxMixcbiAgICAgICAgICAgIGludGVybmFsZm9ybWF0OiBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0eXBlOiBnbC5VTlNJR05FRF9TSE9SVCxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCA9IGdsLkRFUFRIX0NPTVBPTkVOVDI0O1xuICAgICAgICAgICAgdGhpcy50eXBlID0gZ2wuVU5TSUdORURfSU5UO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZnJhbWUgYnVmZmVyXG4gICAgICAgIHRoaXMuZnJhbWVCdWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZnJhbWVCdWZmZXIpO1xuXG4gICAgICAgIC8vIHRleHR1cmVcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gZGVwdGggdGV4dHVyZVxuICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5kZXB0aFRleHR1cmUpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB0aGlzLmludGVybmFsZm9ybWF0LFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgIHRoaXMudHlwZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGdsLkNPTE9SX0FUVEFDSE1FTlQwLFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICk7XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgICAgICBnbC5ERVBUSF9BVFRBQ0hNRU5ULFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5kZXB0aFRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB0aGlzLmludGVybmFsZm9ybWF0LFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgIHRoaXMudHlwZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJUYXJnZXQ7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBSZW5kZXJUYXJnZXQgZnJvbSAnLi9ydCc7XG5pbXBvcnQgUGVyc3BlY3RpdmUgZnJvbSAnLi4vY2FtZXJhcy9wZXJzcGVjdGl2ZSc7XG5pbXBvcnQgT3J0aG9ncmFwaGljIGZyb20gJy4uL2NhbWVyYXMvb3J0aG9ncmFwaGljJztcblxuY2xhc3MgU2hhZG93TWFwUmVuZGVyZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgLy8gc2l6ZSBvZiB0ZXh0dXJlXG4gICAgICAgIHRoaXMud2lkdGggPSBwcm9wcy53aWR0aCB8fCAxMDI0O1xuICAgICAgICB0aGlzLmhlaWdodCA9IHByb3BzLmhlaWdodCB8fCAxMDI0O1xuXG4gICAgICAgIC8vIGNyZWF0ZSByZW5kZXIgdGFyZ2V0XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5ydCA9IG5ldyBSZW5kZXJUYXJnZXQoeyB3aWR0aCwgaGVpZ2h0IH0pO1xuXG4gICAgICAgIC8vIG1hdHJpY2VzXG4gICAgICAgIHRoaXMubWF0cmljZXMgPSB7XG4gICAgICAgICAgICB2aWV3OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgc2hhZG93OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgYmlhczogbWF0NC5mcm9tVmFsdWVzKFxuICAgICAgICAgICAgICAgIDAuNSwgMC4wLCAwLjAsIDAuMCxcbiAgICAgICAgICAgICAgICAwLjAsIDAuNSwgMC4wLCAwLjAsXG4gICAgICAgICAgICAgICAgMC4wLCAwLjAsIDAuNSwgMC4wLFxuICAgICAgICAgICAgICAgIDAuNSwgMC41LCAwLjUsIDEuMCxcbiAgICAgICAgICAgICksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gb3JpZ2luIG9mIGRpcmVjdGlvbmFsIGxpZ2h0XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFBlcnNwZWN0aXZlKHtcbiAgICAgICAgICAgIGZvdjogNjAsXG4gICAgICAgICAgICBuZWFyOiAxLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBPcnRob2dyYXBoaWMoKTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IDE7IC8vIFRPRE86IHJlbW92ZSB0aGlzIHdoZW4gZml4IGxvb2tBdCBidWcgb24gZ2wtbWF0cml4XG4gICAgICAgIHRoaXMuc2V0TGlnaHRPcmlnaW4ocHJvcHMubGlnaHQgfHwgdmVjMy5mcm9tVmFsdWVzKDEwMCwgMjUwLCA1MDApKTtcbiAgICB9XG5cbiAgICAvLyBtb3ZlIHRoZSBjYW1lcmEgdG8gdGhlIGxpZ2h0IHBvc2l0aW9uXG4gICAgc2V0TGlnaHRPcmlnaW4odmVjKSB7XG4gICAgICAgIC8vIENBTUVSQVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjYW1lcmEgcG9zaXRpb25cbiAgICAgICAgdmVjMy5jb3B5KHRoaXMuY2FtZXJhLnBvc2l0aW9uLmRhdGEsIHZlYyk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHZpZXcgbWF0cml4XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy52aWV3KTtcbiAgICAgICAgbWF0NC5sb29rQXQoXG4gICAgICAgICAgICB0aGlzLm1hdHJpY2VzLnZpZXcsXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5kYXRhLFxuICAgICAgICAgICAgdGhpcy5jYW1lcmEudGFyZ2V0LFxuICAgICAgICAgICAgdGhpcy5jYW1lcmEudXAsXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU0hBRE9XXG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5zaGFkb3cpO1xuICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMuc2hhZG93LCB0aGlzLmNhbWVyYS5tYXRyaWNlcy5wcm9qZWN0aW9uLCB0aGlzLm1hdHJpY2VzLnZpZXcpO1xuICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMuc2hhZG93LCB0aGlzLm1hdHJpY2VzLmJpYXMsIHRoaXMubWF0cmljZXMuc2hhZG93KTtcbiAgICB9XG5cbiAgICAvKlxuICAgIFRPRE86XG4gICAgbWF5YmUgY3JlYXRlIGEgcHJvZ3JhbSBqdXN0IGZvciBzaGFkb3dzLiB0aGlzIGF2b2lkcyBoYXZpbmcgdG8gY2hhbmdlIHByb2dyYW1cbiAgICBpbiBjb21wbGV4IHNjZW5lcyBqdXN0IHRvIHdyaXRlIGZvciB0aGUgZGVwdGggYnVmZmVyLlxuICAgIGZpbmQgYSB3YXkgdG8gYnlwYXNzIHRoZSBjaGFuZ2VQcm9ncmFtIG9uIHRoZSByZW5kZXJlciB0byBhY2NvbW9kYXRlIHRoaXMuXG4gICAgKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2hhZG93TWFwUmVuZGVyZXI7XG4iLCJpbXBvcnQgeyB2ZWM0LCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IGxpYnJhcnksIHZlcnNpb24sIHNldENvbnRleHQsIGdldENvbnRleHQsIHNldENvbnRleHRUeXBlLCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQsIE1BWF9ESVJFQ1RJT05BTCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByZXNpemUsIHVuc3VwcG9ydGVkIH0gZnJvbSAnLi4vdXRpbHMvZG9tJztcbmltcG9ydCB7IFVibyB9IGZyb20gJy4uL2dsJztcblxuaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUnO1xuaW1wb3J0IFNoYWRvd01hcFJlbmRlcmVyIGZyb20gJy4vc2hhZG93LW1hcC1yZW5kZXJlcic7XG5cbmxldCBsYXN0UHJvZ3JhbTtcblxubGV0IHNvcnQgPSBmYWxzZTtcbmNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5sZXQgV0VCR0wyID0gZmFsc2U7XG5cbmNvbnN0IHRpbWUgPSB2ZWM0LmNyZWF0ZSgpO1xuY29uc3QgZm9nID0gdmVjNC5jcmVhdGUoKTtcblxuY29uc3QgbWF0cmljZXMgPSB7XG4gICAgdmlldzogbWF0NC5jcmVhdGUoKSxcbiAgICBub3JtYWw6IG1hdDQuY3JlYXRlKCksXG4gICAgbW9kZWxWaWV3OiBtYXQ0LmNyZWF0ZSgpLFxuICAgIGludmVyc2VkTW9kZWxWaWV3OiBtYXQ0LmNyZWF0ZSgpLFxufTtcblxubGV0IGNhY2hlZFNjZW5lID0gbnVsbDsgLy8gc2NlbmVcbmxldCBjYWNoZWRDYW1lcmEgPSBudWxsOyAvLyBjYW1lcmFcblxuY2xhc3MgUmVuZGVyZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgdGhpcy5zdXBwb3J0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNvcnRlZCA9IHtcbiAgICAgICAgICAgIG9wYXF1ZTogW10sXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogW10sXG4gICAgICAgICAgICBzaGFkb3c6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGVyZm9ybWFuY2UgPSB7XG4gICAgICAgICAgICBvcGFxdWU6IDAsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogMCxcbiAgICAgICAgICAgIHNoYWRvdzogMCxcbiAgICAgICAgICAgIHZlcnRpY2VzOiAwLFxuICAgICAgICAgICAgaW5zdGFuY2VzOiAwLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmF0aW8gPSBwcm9wcy5yYXRpbyB8fCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5zaGFkb3dzID0gcHJvcHMuc2hhZG93cyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gcHJvcHMuY2FudmFzIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG4gICAgICAgIGNvbnN0IGNvbnRleHRUeXBlID0gc2V0Q29udGV4dFR5cGUocHJvcHMuY29udGV4dFR5cGUpO1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZG9tRWxlbWVudC5nZXRDb250ZXh0KGNvbnRleHRUeXBlLCBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBhbnRpYWxpYXM6IGZhbHNlLFxuICAgICAgICB9LCBwcm9wcykpO1xuXG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnbCAmJlxuICAgICAgICAgICAgKChzZXNzaW9uLnZlcnRleEFycmF5T2JqZWN0ICYmXG4gICAgICAgICAgICBzZXNzaW9uLmluc3RhbmNlZEFycmF5cyAmJlxuICAgICAgICAgICAgc2Vzc2lvbi5zdGFuZGFyZERlcml2YXRpdmVzICYmXG4gICAgICAgICAgICBzZXNzaW9uLmRlcHRoVGV4dHVyZXMpIHx8IHdpbmRvdy5nbGkgIT09IG51bGwpXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmdyZWV0aW5nICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpYiA9ICdjb2xvcjojNjY2O2ZvbnQtc2l6ZTp4LXNtYWxsO2ZvbnQtd2VpZ2h0OmJvbGQ7JztcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gJ2NvbG9yOiM3Nzc7Zm9udC1zaXplOngtc21hbGwnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9ICdjb2xvcjojZjMzO2ZvbnQtc2l6ZTp4LXNtYWxsJztcbiAgICAgICAgICAgICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAgICAgICAgICAgICBgJWMke2xpYnJhcnl9IC0gJWN2ZXJzaW9uOiAlYyR7dmVyc2lvbn0gJWNydW5uaW5nOiAlYyR7Z2wuZ2V0UGFyYW1ldGVyKGdsLlZFUlNJT04pfWAsXG4gICAgICAgICAgICAgICAgICAgIGxpYiwgcGFyYW1ldGVycywgdmFsdWVzLCBwYXJhbWV0ZXJzLCB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRDb250ZXh0KGdsKTtcblxuICAgICAgICAgICAgV0VCR0wyID0gZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDI7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gdW5zdXBwb3J0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lID0gbmV3IFVibyhbXG4gICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gcHJvamVjdGlvbiBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyB2aWV3IG1hdHJpeFxuICAgICAgICAgICAgICAgIC4uLmZvZywgLy8gZm9nIHZlYzQodXNlX2ZvZywgc3RhcnQsIGVuZCwgZGVuc2l0eSlcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBmb2cgY29sb3JcbiAgICAgICAgICAgICAgICAuLi50aW1lLCAvLyB2ZWM0KGlHbG9iYWxUaW1lLCBFTVBUWSwgRU1QVFksIEVNUFRZKVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwIHNldHRpbmdzICh1c2VfY2xpcHBpbmcsIEVNUFRZLCBFTVBUWSwgRU1QVFkpO1xuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAwXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXBwaW5nIHBsYW5lIDFcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBnbG9iYWwgY2xpcHBpbmcgcGxhbmUgMlxuICAgICAgICAgICAgXSwgMCk7XG5cbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwgPSBuZXcgVWJvKFtcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBtb2RlbCBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBub3JtYWwgbWF0cml4XG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcCBzZXR0aW5ncyAodXNlX2NsaXBwaW5nLCBFTVBUWSwgRU1QVFksIEVNUFRZKTtcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwcGluZyBwbGFuZSAwXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcHBpbmcgcGxhbmUgMVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXBwaW5nIHBsYW5lIDJcbiAgICAgICAgICAgIF0sIDEpO1xuXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsID0gbmV3IFVibyhuZXcgRmxvYXQzMkFycmF5KE1BWF9ESVJFQ1RJT05BTCAqIDEyKSwgMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaGFkb3dzXG4gICAgICAgIHRoaXMuc2hhZG93bWFwID0gbmV3IFNoYWRvd01hcFJlbmRlcmVyKCk7XG4gICAgfVxuXG4gICAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgcmVzaXplKHRoaXMuZG9tRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgdGhpcy5yYXRpbyk7XG4gICAgfVxuXG4gICAgc2V0UmF0aW8odmFsdWUpIHtcbiAgICAgICAgdGhpcy5yYXRpbyA9IHZhbHVlO1xuICAgIH1cblxuICAgIGNoYW5nZVByb2dyYW0ocHJvZ3JhbSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICBjb25zdCBzTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCAncGVyU2NlbmUnKTtcbiAgICAgICAgICAgIGNvbnN0IG1Mb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sICdwZXJNb2RlbCcpO1xuICAgICAgICAgICAgY29uc3QgZExvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgJ2RpcmVjdGlvbmFsJyk7XG4gICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIHNMb2NhdGlvbiwgdGhpcy5wZXJTY2VuZS5ib3VuZExvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgbUxvY2F0aW9uLCB0aGlzLnBlck1vZGVsLmJvdW5kTG9jYXRpb24pO1xuXG4gICAgICAgICAgICAvLyBpcyBkaXJlY3Rpb25hbCBsaWdodCBpbiBzaGFkZXJcbiAgICAgICAgICAgIGlmIChkTG9jYXRpb24gPT09IHRoaXMuZGlyZWN0aW9uYWwuYm91bmRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgZExvY2F0aW9uLCB0aGlzLmRpcmVjdGlvbmFsLmJvdW5kTG9jYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdyhzY2VuZSwgY2FtZXJhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgLy8gb25seSBuZWNlc3NhcnkgZm9yIHdlYmdsMSBjb21wYXRpYmlsaXR5LlxuICAgICAgICBjYWNoZWRTY2VuZSA9IHNjZW5lO1xuICAgICAgICBjYWNoZWRDYW1lcmEgPSBjYW1lcmE7XG5cbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG4gICAgICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG5cbiAgICAgICAgY2FtZXJhLnVwZGF0ZUNhbWVyYU1hdHJpeCh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAvLyBjb21tb24gbWF0cmljZXNcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy52aWV3KTtcbiAgICAgICAgbWF0NC5sb29rQXQobWF0cmljZXMudmlldywgY2FtZXJhLnBvc2l0aW9uLmRhdGEsIGNhbWVyYS50YXJnZXQsIGNhbWVyYS51cCk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgc29ydGluZyBpcyBuZWVkZWQgd2hpbHN0IHRyYXZlcnNpbmcgdGhyb3VnaCB0aGUgc2NlbmUgZ3JhcGhcbiAgICAgICAgc29ydCA9IHNjZW5lLnRyYXZlcnNlKCk7XG5cbiAgICAgICAgLy8gaWYgc29ydGluZyBpcyBuZWVkZWQsIHJlc2V0IHN0dWZmXG4gICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICB0aGlzLnNvcnRlZC5vcGFxdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50ID0gW107XG4gICAgICAgICAgICB0aGlzLnNvcnRlZC5zaGFkb3cgPSBbXTtcblxuICAgICAgICAgICAgLy8gY2FuIGJlIGRlcHJlY2F0ZWQsIGJ1dCBpdHMga2luZCBvZiBjb29sXG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLm9wYXF1ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnRyYW5zcGFyZW50ID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uuc2hhZG93ID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudmVydGljZXMgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5pbnN0YW5jZXMgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLnNvcnQoc2NlbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIHRpbWVcbiAgICAgICAgdGltZVswXSA9IChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgIGZvZ1swXSA9IHNjZW5lLmZvZy5lbmFibGU7XG4gICAgICAgIGZvZ1sxXSA9IHNjZW5lLmZvZy5zdGFydDtcbiAgICAgICAgZm9nWzJdID0gc2NlbmUuZm9nLmVuZDtcbiAgICAgICAgZm9nWzNdID0gc2NlbmUuZm9nLmRlbnNpdHk7XG5cbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgLy8gYmluZCBjb21tb24gYnVmZmVyc1xuICAgICAgICAgICAgdGhpcy5wZXJTY2VuZS5iaW5kKCk7XG4gICAgICAgICAgICB0aGlzLnBlck1vZGVsLmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwuYmluZCgpO1xuXG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lLnVwZGF0ZShbXG4gICAgICAgICAgICAgICAgLi4uY2FtZXJhLm1hdHJpY2VzLnByb2plY3Rpb24sXG4gICAgICAgICAgICAgICAgLi4ubWF0cmljZXMudmlldyxcbiAgICAgICAgICAgICAgICAuLi5mb2csXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuZm9nLmNvbG9yLFxuICAgICAgICAgICAgICAgIC4uLnRpbWUsXG4gICAgICAgICAgICAgICAgLi4uW3NjZW5lLmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuY2xpcHBpbmcucGxhbmVzWzBdLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmNsaXBwaW5nLnBsYW5lc1sxXSxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5jbGlwcGluZy5wbGFuZXNbMl0sXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2VuZS5saWdodHMuZGlyZWN0aW9uYWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsLnVwZGF0ZShbXG4gICAgICAgICAgICAgICAgICAgIC4uLlsuLi5zY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbaV0ucG9zaXRpb24sIDBdLFxuICAgICAgICAgICAgICAgICAgICAuLi5bLi4uc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsW2ldLmNvbG9yLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgLi4uW3NjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFtpXS5pbnRlbnNpdHksIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIF0sIGkgKiAxMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgbGlnaHQgaW4gc2hhZG93bWFwXG4gICAgICAgIHRoaXMuc2hhZG93bWFwLnNldExpZ2h0T3JpZ2luKHNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFswXS5wb3NpdGlvbik7XG5cbiAgICAgICAgLy8gMSkgcmVuZGVyIG9iamVjdHMgdG8gc2hhZG93bWFwXG4gICAgICAgIGlmICh0aGlzLnJlbmRlclNoYWRvdykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZC5zaGFkb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdCh0aGlzLnNvcnRlZC5zaGFkb3dbaV0sIHRoaXMuc29ydGVkLnNoYWRvd1tpXS5wcm9ncmFtLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIpIHJlbmRlciBvcGFxdWUgb2JqZWN0c1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkLm9wYXF1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QodGhpcy5zb3J0ZWQub3BhcXVlW2ldLCB0aGlzLnNvcnRlZC5vcGFxdWVbaV0ucHJvZ3JhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBzb3J0IGFuZCByZW5kZXIgdHJhbnNwYXJlbnQgb2JqZWN0c1xuICAgICAgICAvLyBleHBlbnNpdmUgdG8gc29ydCB0cmFuc3BhcmVudCBpdGVtcyBwZXIgei1pbmRleC5cbiAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChhLnBvc2l0aW9uLnogLSBiLnBvc2l0aW9uLnopO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkLnRyYW5zcGFyZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdCh0aGlzLnNvcnRlZC50cmFuc3BhcmVudFtpXSwgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnRbaV0ucHJvZ3JhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0KSByZW5kZXIgZ3VpXG4gICAgICAgIC8vIFRPRE9cbiAgICB9XG5cbiAgICBydHQoe1xuICAgICAgICByZW5kZXJUYXJnZXQsXG4gICAgICAgIHNjZW5lLFxuICAgICAgICBjYW1lcmEsXG4gICAgICAgIGNsZWFyQ29sb3IgPSBbMCwgMCwgMCwgMV0sXG4gICAgfSkgeyAvLyBtYXliZSBvcmRlciBpcyBpbXBvcnRhbnRcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgcmVuZGVyVGFyZ2V0LmZyYW1lQnVmZmVyKTtcblxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCByZW5kZXJUYXJnZXQud2lkdGgsIHJlbmRlclRhcmdldC5oZWlnaHQpO1xuICAgICAgICBnbC5jbGVhckNvbG9yKC4uLmNsZWFyQ29sb3IpO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgdGhpcy5kcmF3KHNjZW5lLCBjYW1lcmEsIHJlbmRlclRhcmdldC53aWR0aCwgcmVuZGVyVGFyZ2V0LmhlaWdodCk7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgcmVuZGVyVGFyZ2V0LnRleHR1cmUpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIHJlbmRlcihzY2VuZSwgY2FtZXJhKSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHNoYWRvd3NcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93cykge1xuICAgICAgICAgICAgLy8gcmVuZGVyIHNjZW5lIHRvIHRleHR1cmVcbiAgICAgICAgICAgIHRoaXMucmVuZGVyU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucnR0KHtcbiAgICAgICAgICAgICAgICByZW5kZXJUYXJnZXQ6IHRoaXMuc2hhZG93bWFwLnJ0LFxuICAgICAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5zaGFkb3dtYXAuY2FtZXJhLFxuICAgICAgICAgICAgICAgIGNsZWFyQ29sb3I6IFsxLCAxLCAxLCAxXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlclNoYWRvdyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVuZGVyIHNjZW5lXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgICAgICB0aGlzLmRyYXcoc2NlbmUsIGNhbWVyYSwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvLyBUT0RPOiByZW5kZXIgR1VJIG9iamVjdHNcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaWNlcyhtYXRyaXgpIHtcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy5tb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LmNvcHkobWF0cmljZXMubW9kZWxWaWV3LCBtYXRyaXgpO1xuICAgICAgICBtYXQ0LmludmVydChtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldywgbWF0cmljZXMubW9kZWxWaWV3KTtcbiAgICAgICAgbWF0NC50cmFuc3Bvc2UobWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcsIG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3KTtcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy5ub3JtYWwpO1xuICAgICAgICBtYXQ0LmNvcHkobWF0cmljZXMubm9ybWFsLCBtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldyk7XG4gICAgfVxuXG4gICAgc29ydChvYmplY3QpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc29ydChvYmplY3QuY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iamVjdC52aXNpYmxlICYmICEob2JqZWN0IGluc3RhbmNlb2YgU2NlbmUpKSB7XG4gICAgICAgICAgICAvLyBhZGRzIG9iamVjdCB0byBhIG9wYXF1ZSBvciB0cmFuc3BhcmVudFxuICAgICAgICAgICAgaWYgKG9iamVjdC50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50LnB1c2gob2JqZWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnRyYW5zcGFyZW50Kys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLm9wYXF1ZS5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5vcGFxdWUrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgc2hhZG93cyBlbmFibGVkIG9uIHJlbmRlcmVyLCBhbmQgc2hhZG93cyBhcmUgZW5hYmxlZCBvbiBvYmplY3RcbiAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvd3MgJiYgb2JqZWN0LnNoYWRvd3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvcnRlZC5zaGFkb3cucHVzaChvYmplY3QpO1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uuc2hhZG93Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvdW50IHZlcnRpY2UgbnVtYmVyXG4gICAgICAgICAgICBpZiAob2JqZWN0LmF0dHJpYnV0ZXMuYV9wb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudmVydGljZXMgKz0gb2JqZWN0LmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZS5sZW5ndGggLyAzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb3VudCBpbnN0YW5jZXNcbiAgICAgICAgICAgIGlmIChvYmplY3QuaXNJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UuaW5zdGFuY2VzICs9IG9iamVjdC5pbnN0YW5jZUNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc29ydGluZyBjb21wbGV0ZVxuICAgICAgICBvYmplY3QuZGlydHkuc29ydGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlbmRlck9iamVjdChvYmplY3QsIHByb2dyYW0sIGluU2hhZG93TWFwID0gZmFsc2UpIHtcbiAgICAgICAgLy8gaXRzIHRoZSBwYXJlbnQgbm9kZSAoc2NlbmUuanMpXG4gICAgICAgIGlmIChvYmplY3QucGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZU1hdHJpY2VzKG9iamVjdC5tYXRyaWNlcy5tb2RlbCk7XG5cbiAgICAgICAgaWYgKG9iamVjdC5kaXJ0eS5zaGFkZXIpIHtcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS5zaGFkZXIgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0pIHtcbiAgICAgICAgICAgICAgICBvYmplY3QuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCk7XG4gICAgICAgICAgICBvYmplY3QuaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxhc3RQcm9ncmFtICE9PSBwcm9ncmFtKSB7XG4gICAgICAgICAgICBsYXN0UHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVByb2dyYW0obGFzdFByb2dyYW0sIG9iamVjdC50eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9iamVjdC5iaW5kKCk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCk7XG5cbiAgICAgICAgb2JqZWN0LnVwZGF0ZShpblNoYWRvd01hcCk7XG4gICAgICAgIG9iamVjdC5kcmF3KCk7XG5cbiAgICAgICAgb2JqZWN0LnVuYmluZCgpO1xuICAgIH1cblxuICAgIGluaXRVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCkge1xuICAgICAgICBpZiAoIVdFQkdMMikge1xuICAgICAgICAgICAgLy8gcGVyIHNjZW5lXG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgncHJvamVjdGlvbk1hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgndmlld01hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZm9nU2V0dGluZ3MnLCAndmVjNCcsIGZvZyk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZm9nQ29sb3InLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2lHbG9iYWxUaW1lJywgJ2Zsb2F0JywgdGltZVswXSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZ2xvYmFsQ2xpcFNldHRpbmdzJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUwJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUxJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUyJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIC8vIHBlciBvYmplY3RcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdtb2RlbE1hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbm9ybWFsTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBTZXR0aW5ncycsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwUGxhbmUwJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBQbGFuZTEnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFBsYW5lMicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG5cbiAgICAgICAgICAgIC8vIGxpZ2h0c1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2RsUG9zaXRpb24nLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2RsQ29sb3InLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2ZsSW50ZW5zaXR5JywgJ2Zsb2F0JywgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TWFwJywgJ3NhbXBsZXIyRCcsIDApO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd05lYXInLCAnZmxvYXQnLCAwKTtcbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd0ZhcicsICdmbG9hdCcsIDApO1xuICAgIH1cblxuICAgIHVwZGF0ZVVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KSB7XG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QubWF0cmljZXMubW9kZWwsXG4gICAgICAgICAgICAgICAgLi4ubWF0cmljZXMubm9ybWFsLFxuICAgICAgICAgICAgICAgIC4uLltvYmplY3QuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdLFxuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5jbGlwcGluZy5wbGFuZXNbMV0sXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0LmNsaXBwaW5nLnBsYW5lc1syXSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYmVjYXVzZSBVQk8gYXJlIHdlYmdsMiBvbmx5LCB3ZSBuZWVkIHRvIG1hbnVhbGx5IGFkZCBldmVyeXRoaW5nXG4gICAgICAgICAgICAvLyBhcyB1bmlmb3Jtc1xuICAgICAgICAgICAgLy8gcGVyIHNjZW5lIHVuaWZvcm1zIHVwZGF0ZVxuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgudmFsdWUgPSBjYWNoZWRDYW1lcmEubWF0cmljZXMucHJvamVjdGlvbjtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy52aWV3TWF0cml4LnZhbHVlID0gbWF0cmljZXMudmlldztcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5mb2dTZXR0aW5ncy52YWx1ZSA9IGZvZztcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5mb2dDb2xvci52YWx1ZSA9IGNhY2hlZFNjZW5lLmZvZy5jb2xvcjtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5pR2xvYmFsVGltZS52YWx1ZSA9IHRpbWVbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFNldHRpbmdzLnZhbHVlID0gW2NhY2hlZFNjZW5lLmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFBsYW5lMC52YWx1ZSA9IGNhY2hlZFNjZW5lLmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwUGxhbmUxLnZhbHVlID0gY2FjaGVkU2NlbmUuY2xpcHBpbmcucGxhbmVzWzFdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBQbGFuZTIudmFsdWUgPSBjYWNoZWRTY2VuZS5jbGlwcGluZy5wbGFuZXNbMl07XG5cbiAgICAgICAgICAgIC8vIHBlciBtb2RlbCB1bmlmb3JtcyB1cGRhdGVcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5tb2RlbE1hdHJpeC52YWx1ZSA9IG9iamVjdC5tYXRyaWNlcy5tb2RlbDtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5ub3JtYWxNYXRyaXgudmFsdWUgPSBtYXRyaWNlcy5ub3JtYWw7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwU2V0dGluZ3MudmFsdWUgPSBbb2JqZWN0LmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwUGxhbmUwLnZhbHVlID0gb2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBQbGFuZTEudmFsdWUgPSBvYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFBsYW5lMi52YWx1ZSA9IG9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZXN0IFNIQURPV1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TWFwLnZhbHVlID0gdGhpcy5zaGFkb3dtYXAucnQuZGVwdGhUZXh0dXJlO1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TWF0cml4LnZhbHVlID0gdGhpcy5zaGFkb3dtYXAubWF0cmljZXMuc2hhZG93O1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TmVhci52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLmNhbWVyYS5uZWFyO1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93RmFyLnZhbHVlID0gdGhpcy5zaGFkb3dtYXAuY2FtZXJhLmZhcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyO1xuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi9tZXNoJztcbmltcG9ydCB7IFVCTyB9IGZyb20gJy4uL3NoYWRlcnMvY2h1bmtzJztcblxuY2xhc3MgUGFzcyB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZSgpO1xuXG4gICAgICAgIGNvbnN0IHsgdmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMgfSA9IHByb3BzO1xuXG4gICAgICAgIHRoaXMudmVydGV4ID0gdmVydGV4O1xuICAgICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB1bmlmb3JtcztcblxuICAgICAgICB0aGlzLmVuYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgY29tcGlsZSgpIHtcbiAgICAgICAgY29uc3Qgc2hhZGVyID0ge1xuICAgICAgICAgICAgdmVydGV4OiBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICAgICAgJHt0aGlzLnZlcnRleH1gLFxuXG4gICAgICAgICAgICBmcmFnbWVudDogYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG4gICAgICAgICAgICAgICAgJHt0aGlzLmZyYWdtZW50fWAsXG4gICAgICAgICAgICB1bmlmb3JtczogdGhpcy51bmlmb3JtcyxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogWy0xLCAtMSwgMCwgMSwgLTEsIDAsIDEsIDEsIDAsIC0xLCAxLCAwXSxcbiAgICAgICAgICAgIGluZGljZXM6IFswLCAxLCAyLCAwLCAyLCAzXSxcbiAgICAgICAgICAgIHV2czogWzAsIDAsIDEsIDAsIDEsIDEsIDAsIDFdLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnF1YWQgPSBuZXcgTWVzaCh7IGdlb21ldHJ5LCBzaGFkZXIgfSk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucXVhZCk7XG4gICAgfVxuXG4gICAgc2V0VW5pZm9ybShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucXVhZC51bmlmb3Jtc1trZXldLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXNzO1xuIiwiY29uc3QgQmFzaWMgPSB7XG5cbiAgICB1bmlmb3Jtczoge1xuICAgICAgICB1X2lucHV0OiB7IHR5cGU6ICdzYW1wbGVyMkQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgb3V0Q29sb3IgPSB0ZXh0dXJlKHVfaW5wdXQsIHZfdXYpO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNpYztcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgT3J0aG9ncmFwaGljIH0gZnJvbSAnLi4vY2FtZXJhcyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vcnQnO1xuaW1wb3J0IFBhc3MgZnJvbSAnLi9wYXNzJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vcGFzc2VzJztcblxuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDA7XG5cbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29sb3IgPSB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSk7XG5cbiAgICAgICAgdGhpcy5zY3JlZW4gPSBuZXcgUGFzcyhCYXNpYyk7XG4gICAgICAgIHRoaXMuc2NyZWVuLmNvbXBpbGUoKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBbXG4gICAgICAgICAgICBuZXcgUmVuZGVyVGFyZ2V0KCksXG4gICAgICAgICAgICBuZXcgUmVuZGVyVGFyZ2V0KCksXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy5idWZmZXJzWzFdO1xuICAgICAgICB0aGlzLndyaXRlID0gdGhpcy5idWZmZXJzWzBdO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMucmVhZC5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLndyaXRlLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgc2V0UmF0aW8ocmF0aW8pIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRSYXRpbyhyYXRpbyk7XG4gICAgfVxuXG4gICAgcGFzcyhwYXNzKSB7XG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgfVxuXG4gICAgY29tcGlsZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXNzZXNbaV0uY29tcGlsZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyVG9UZXh0dXJlKHJlbmRlclRhcmdldCwgc2NlbmUsIGNhbWVyYSkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJ0dCh7XG4gICAgICAgICAgICByZW5kZXJUYXJnZXQsXG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgIGNhbWVyYSxcbiAgICAgICAgICAgIGNsZWFyQ29sb3I6IHRoaXMuY2xlYXJDb2xvcixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXRCdWZmZXJzKCkge1xuICAgICAgICB0aGlzLnJlYWQgPSB0aGlzLmJ1ZmZlcnNbMV07XG4gICAgICAgIHRoaXMud3JpdGUgPSB0aGlzLmJ1ZmZlcnNbMF07XG4gICAgfVxuXG4gICAgc3dhcEJ1ZmZlcnMoKSB7XG4gICAgICAgIHRoaXMudGVtcCA9IHRoaXMucmVhZDtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy53cml0ZTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHRoaXMudGVtcDtcbiAgICB9XG5cbiAgICByZW5kZXIoc2NlbmUsIGNhbWVyYSkge1xuICAgICAgICB0aGlzLnJlc2V0QnVmZmVycygpO1xuICAgICAgICB0aGlzLnJlbmRlclRvVGV4dHVyZSh0aGlzLndyaXRlLCBzY2VuZSwgY2FtZXJhKTtcblxuICAgICAgICAvLyBwaW5nIHBvbmcgdGV4dHVyZXMgdGhyb3VnaCBwYXNzZXNcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLnBhc3Nlcy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFzc2VzW2ldLmVuYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3dhcEJ1ZmZlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3Nlc1tpXS5zZXRVbmlmb3JtKCd1X2lucHV0JywgdGhpcy5yZWFkLnRleHR1cmUpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVG9UZXh0dXJlKHRoaXMud3JpdGUsIHRoaXMucGFzc2VzW2ldLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW5kZXIgbGFzdCBwYXNzIHRvIHNjcmVlblxuICAgICAgICB0aGlzLnNjcmVlbi5zZXRVbmlmb3JtKCd1X2lucHV0JywgdGhpcy53cml0ZS50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY3JlZW4uc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvc2VyO1xuIiwiY2xhc3MgUGVyZm9ybWFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHRoaXMudGhlbWUgPSBwYXJhbXMudGhlbWUgfHwge1xuICAgICAgICAgICAgZm9udDogJ2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zaXplOnh4LXNtYWxsO2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweDstbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlOy13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkOycsXG4gICAgICAgICAgICBjb2xvcjE6ICcjMjQyNDI0JyxcbiAgICAgICAgICAgIGNvbG9yMjogJyMyYTJhMmEnLFxuICAgICAgICAgICAgY29sb3IzOiAnIzY2NicsXG4gICAgICAgICAgICBjb2xvcjQ6ICcjOTk5JyxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246Zml4ZWQ7Ym90dG9tOjA7bGVmdDowO21pbi13aWR0aDo4MHB4O29wYWNpdHk6MC45O3otaW5kZXg6MTAwMDA7JztcblxuICAgICAgICB0aGlzLmhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmhvbGRlci5zdHlsZS5jc3NUZXh0ID0gYHBhZGRpbmc6M3B4O2JhY2tncm91bmQtY29sb3I6JHt0aGlzLnRoZW1lLmNvbG9yMX07YDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKTtcblxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aXRsZS5zdHlsZS5jc3NUZXh0ID0gYCR7dGhpcy50aGVtZS5mb250fTtjb2xvcjoke3RoaXMudGhlbWUuY29sb3IzfTtgO1xuICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnUGVyZm9ybWFuY2UnO1xuICAgICAgICB0aGlzLmhvbGRlci5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgdGhpcy5tc1RleHRzID0gW107XG5cbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHJlYnVpbGQocGFyYW1zKSB7XG4gICAgICAgIHRoaXMubXNUZXh0cyA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gYCR7dGhpcy50aGVtZS5mb250fTtjb2xvcjoke3RoaXMudGhlbWUuY29sb3I0fTtiYWNrZ3JvdW5kLWNvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjJ9O2A7XG4gICAgICAgICAgICB0aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMubXNUZXh0c1trZXldID0gZWxlbWVudDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKHJlbmRlcmVyKSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLm1zVGV4dHMpLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMocmVuZGVyZXIucGVyZm9ybWFuY2UpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkKHJlbmRlcmVyLnBlcmZvcm1hbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHJlbmRlcmVyLnBlcmZvcm1hbmNlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMubXNUZXh0c1trZXldLnRleHRDb250ZW50ID0gYCR7a2V5fTogJHtyZW5kZXJlci5wZXJmb3JtYW5jZVtrZXldfWA7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyZm9ybWFuY2U7XG4iLCIvKipcbiAqIENvcmVcbiAqIEBtb2R1bGUgY29yZVxuICovXG5pbXBvcnQgKiBhcyBjaHVua3MgZnJvbSAnLi9zaGFkZXJzL2NodW5rcyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAqIGFzIGNhbWVyYXMgZnJvbSAnLi9jYW1lcmFzJztcbmltcG9ydCAqIGFzIHNoYWRlcnMgZnJvbSAnLi9zaGFkZXJzJztcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCAqIGFzIGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmltcG9ydCBSZW5kZXJlciBmcm9tICcuL2NvcmUvcmVuZGVyZXInO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9jb3JlL29iamVjdDMnO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4vY29yZS9zY2VuZSc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9jb3JlL21vZGVsJztcbmltcG9ydCBNZXNoIGZyb20gJy4vY29yZS9tZXNoJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4vY29yZS90ZXh0dXJlJztcbmltcG9ydCBSZW5kZXJUYXJnZXQgZnJvbSAnLi9jb3JlL3J0JztcbmltcG9ydCBDb21wb3NlciBmcm9tICcuL2NvcmUvY29tcG9zZXInO1xuaW1wb3J0IFBhc3MgZnJvbSAnLi9jb3JlL3Bhc3MnO1xuaW1wb3J0IFBlcmZvcm1hbmNlIGZyb20gJy4vY29yZS9wZXJmb3JtYW5jZSc7XG5cbmV4cG9ydCB7XG4gICAgY2h1bmtzLFxuICAgIHV0aWxzLFxuICAgIGNhbWVyYXMsXG4gICAgc2hhZGVycyxcbiAgICBoZWxwZXJzLFxuICAgIGNvbnN0YW50cyxcbiAgICBSZW5kZXJlcixcbiAgICBPYmplY3QzLFxuICAgIFNjZW5lLFxuICAgIE1vZGVsLFxuICAgIE1lc2gsXG4gICAgVGV4dHVyZSxcbiAgICBSZW5kZXJUYXJnZXQsXG4gICAgQ29tcG9zZXIsXG4gICAgUGFzcyxcbiAgICBQZXJmb3JtYW5jZSxcbn07XG4iXSwibmFtZXMiOlsiTElHSFQiLCJmYWN0b3J5IiwiZGlyZWN0aW9uYWwiLCJiYXNlIiwiRk9HIiwibGluZWFyIiwiZXhwb25lbnRpYWwiLCJleHBvbmVudGlhbDIiLCJNQVhfRElSRUNUSU9OQUwiLCJESVJFQ1RJT05BTF9MSUdIVCIsIlNIQURFUl9CQVNJQyIsIlNIQURFUl9ERUZBVUxUIiwiU0hBREVSX0JJTExCT0FSRCIsIlNIQURFUl9TSEFET1ciLCJTSEFERVJfU0VNIiwiU0hBREVSX0NVU1RPTSIsIkRSQVciLCJQT0lOVFMiLCJMSU5FUyIsIlRSSUFOR0xFUyIsIlNJREUiLCJGUk9OVCIsIkJBQ0siLCJCT1RIIiwiQ09OVEVYVCIsIldFQkdMIiwiV0VCR0wyIiwibGlicmFyeSIsInZlcnNpb24iLCJnbCIsImNvbnRleHRUeXBlIiwidGVzdENvbnRleHQxIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0Q29udGV4dCIsInRlc3RDb250ZXh0MiIsImV4dGVuc2lvbnMiLCJ2ZXJ0ZXhBcnJheU9iamVjdCIsImdldEV4dGVuc2lvbiIsImluc3RhbmNlZEFycmF5cyIsInN0YW5kYXJkRGVyaXZhdGl2ZXMiLCJkZXB0aFRleHR1cmVzIiwic2V0Q29udGV4dFR5cGUiLCJwcmVmZXJyZWQiLCJnbDIiLCJnbDEiLCJkZXB0aFRleHR1cmUiLCJnZXRDb250ZXh0VHlwZSIsInNldENvbnRleHQiLCJjb250ZXh0Iiwic3VwcG9ydHMiLCJVQk8iLCJzY2VuZSIsIm1vZGVsIiwibGlnaHRzIiwiTk9JU0UiLCJDTElQUElORyIsInZlcnRleF9wcmUiLCJ2ZXJ0ZXgiLCJmcmFnbWVudF9wcmUiLCJmcmFnbWVudCIsIkVYVEVOU0lPTlMiLCJoYXJkIiwiU0hBRE9XIiwiRVBTSUxPTiIsIkFSUkFZX1RZUEUiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsImRlZ3JlZSIsIk1hdGgiLCJQSSIsImNyZWF0ZSIsIm91dCIsImdsTWF0cml4IiwiY29weSIsImEiLCJmcm9tVmFsdWVzIiwibTAwIiwibTAxIiwibTAyIiwibTAzIiwibTEwIiwibTExIiwibTEyIiwibTEzIiwibTIwIiwibTIxIiwibTIyIiwibTIzIiwibTMwIiwibTMxIiwibTMyIiwibTMzIiwiaWRlbnRpdHkiLCJ0cmFuc3Bvc2UiLCJhMDEiLCJhMDIiLCJhMDMiLCJhMTIiLCJhMTMiLCJhMjMiLCJpbnZlcnQiLCJhMDAiLCJhMTAiLCJhMTEiLCJhMjAiLCJhMjEiLCJhMjIiLCJhMzAiLCJhMzEiLCJhMzIiLCJhMzMiLCJiMDAiLCJiMDEiLCJiMDIiLCJiMDMiLCJiMDQiLCJiMDUiLCJiMDYiLCJiMDciLCJiMDgiLCJiMDkiLCJiMTAiLCJiMTEiLCJkZXQiLCJtdWx0aXBseSIsImIiLCJiMCIsImIxIiwiYjIiLCJiMyIsInRyYW5zbGF0ZSIsInYiLCJ4IiwieSIsInoiLCJzY2FsZSIsInJvdGF0ZSIsInJhZCIsImF4aXMiLCJsZW4iLCJzcXJ0IiwicyIsImMiLCJ0IiwiYjEyIiwiYjIwIiwiYjIxIiwiYjIyIiwic2luIiwiY29zIiwicGVyc3BlY3RpdmUiLCJmb3Z5IiwiYXNwZWN0IiwibmVhciIsImZhciIsImYiLCJ0YW4iLCJuZiIsIm9ydGhvIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwibHIiLCJidCIsImxvb2tBdCIsImV5ZSIsImNlbnRlciIsInVwIiwieDAiLCJ4MSIsIngyIiwieTAiLCJ5MSIsInkyIiwiejAiLCJ6MSIsInoyIiwiZXlleCIsImV5ZXkiLCJleWV6IiwidXB4IiwidXB5IiwidXB6IiwiY2VudGVyeCIsImNlbnRlcnkiLCJjZW50ZXJ6IiwiYWJzIiwidGFyZ2V0VG8iLCJ0YXJnZXQiLCJsZW5ndGgiLCJub3JtYWxpemUiLCJkb3QiLCJjcm9zcyIsImF4IiwiYXkiLCJheiIsImJ4IiwiYnkiLCJieiIsImZvckVhY2giLCJ2ZWMiLCJzdHJpZGUiLCJvZmZzZXQiLCJjb3VudCIsImZuIiwiYXJnIiwiaSIsImwiLCJtaW4iLCJ3Iiwic2V0QXhpc0FuZ2xlIiwiZ2V0QXhpc0FuZ2xlIiwib3V0X2F4aXMiLCJxIiwiYWNvcyIsInJvdGF0ZVgiLCJhdyIsImJ3Iiwicm90YXRlWSIsInJvdGF0ZVoiLCJzbGVycCIsIm9tZWdhIiwiY29zb20iLCJzaW5vbSIsInNjYWxlMCIsInNjYWxlMSIsImZyb21NYXQzIiwibSIsImZUcmFjZSIsImZSb290IiwiaiIsImsiLCJ2ZWM0Iiwicm90YXRpb25UbyIsInRtcHZlYzMiLCJ2ZWMzIiwieFVuaXRWZWMzIiwieVVuaXRWZWMzIiwic3FsZXJwIiwidGVtcDEiLCJ0ZW1wMiIsImQiLCJzZXRBeGVzIiwibWF0ciIsIm1hdDMiLCJ2aWV3IiwiYXJyYXkiLCJoZXhJbnRUb1JnYiIsImhleCIsInIiLCJnIiwiaGV4U3RyaW5nVG9SZ2IiLCJyZXN1bHQiLCJleGVjIiwicGFyc2VJbnQiLCJjb21wb25lbnRUb0hleCIsInRvU3RyaW5nIiwicmdiVG9IZXgiLCJoZXhSIiwiaGV4RyIsImhleEIiLCJjb252ZXJ0IiwiY29sb3IiLCJyZ2IiLCJyYW5kb21SYW5nZSIsIm1heCIsInJhbmRvbSIsIm1vZCIsIm4iLCJXT1JEX1JFR1giLCJ3b3JkIiwiUmVnRXhwIiwiTElORV9SRUdYIiwiVkVSVEVYIiwibWF0Y2giLCJyZXBsYWNlIiwiRlJBR01FTlQiLCJzaGFkZXIiLCJ0ZXh0dXJlR2xvYmFsUmVneCIsInRleHR1cmVTaW5nbGVSZWd4IiwidGV4dHVyZVVuaWZvcm1OYW1lUmVneCIsIm1hdGNoZXMiLCJyZXBsYWNlbWVudCIsInVuaWZvcm1OYW1lIiwic3BsaXQiLCJ1bmlmb3JtVHlwZSIsIkdFTkVSSUMiLCJWRVJURVhfUlVMRVMiLCJGUkFHTUVOVF9SVUxFUyIsInBhcnNlIiwic2hhZGVyVHlwZSIsInJ1bGVzIiwicnVsZSIsIlZlY3RvcjMiLCJkYXRhIiwidmFsdWUiLCJ1dWlkIiwiYXhpc0FuZ2xlIiwicXVhdGVybmlvbkF4aXNBbmdsZSIsIk9iamVjdDMiLCJ1aWQiLCJwYXJlbnQiLCJjaGlsZHJlbiIsInBvc2l0aW9uIiwicm90YXRpb24iLCJfdHJhbnNwYXJlbnQiLCJfdmlzaWJsZSIsInF1YXRlcm5pb24iLCJxdWF0IiwibG9va1RvVGFyZ2V0IiwibWF0cmljZXMiLCJtYXQ0IiwiZGlydHkiLCJzb3J0aW5nIiwidHJhbnNwYXJlbnQiLCJhdHRyaWJ1dGVzIiwic2NlbmVHcmFwaFNvcnRlciIsInB1c2giLCJpbmRleCIsImluZGV4T2YiLCJkZXN0cm95Iiwic3BsaWNlIiwib2JqZWN0IiwidW5kZWZpbmVkIiwidHJhdmVyc2UiLCJ1cGRhdGVNYXRyaWNlcyIsInZpc2libGUiLCJPcnRob2dyYXBoaWNDYW1lcmEiLCJwYXJhbXMiLCJPYmplY3QiLCJhc3NpZ24iLCJwcm9qZWN0aW9uIiwiUGVyc3BlY3RpdmVDYW1lcmEiLCJmb3YiLCJ3aWR0aCIsImhlaWdodCIsIkJhc2ljIiwicHJvcHMiLCJ0eXBlIiwibW9kZSIsIndpcmVmcmFtZSIsInVuaWZvcm1zIiwidV9jb2xvciIsIlRleHR1cmUiLCJtYWdGaWx0ZXIiLCJORUFSRVNUIiwibWluRmlsdGVyIiwid3JhcFMiLCJDTEFNUF9UT19FREdFIiwid3JhcFQiLCJVaW50OEFycmF5IiwidGV4dHVyZSIsImNyZWF0ZVRleHR1cmUiLCJiaW5kVGV4dHVyZSIsIlRFWFRVUkVfMkQiLCJ0ZXhJbWFnZTJEIiwiUkdCQSIsIlVOU0lHTkVEX0JZVEUiLCJ0ZXhQYXJhbWV0ZXJpIiwiVEVYVFVSRV9NQUdfRklMVEVSIiwiVEVYVFVSRV9NSU5fRklMVEVSIiwiVEVYVFVSRV9XUkFQX1MiLCJURVhUVVJFX1dSQVBfVCIsInBpeGVsU3RvcmVpIiwiVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMIiwidXJsIiwiaW1nIiwiSW1hZ2UiLCJjcm9zc09yaWdpbiIsIm9ubG9hZCIsInVwZGF0ZSIsInNyYyIsImltYWdlIiwiZ2VuZXJhdGVNaXBtYXAiLCJVTlBBQ0tfRkxJUF9ZX1dFQkdMIiwiRGVmYXVsdCIsIm1hcCIsImZyb21JbWFnZSIsInVfbWFwIiwiQmlsbGJvYXJkIiwiU2VtIiwiUFJPR1JBTV9QT09MIiwiY3JlYXRlU2hhZGVyIiwic3RyIiwic2hhZGVyU291cmNlIiwiY29tcGlsZVNoYWRlciIsImNvbXBpbGVkIiwiZ2V0U2hhZGVyUGFyYW1ldGVyIiwiQ09NUElMRV9TVEFUVVMiLCJlcnJvciIsImdldFNoYWRlckluZm9Mb2ciLCJkZWxldGVTaGFkZXIiLCJjb25zb2xlIiwiRXJyb3IiLCJjcmVhdGVQcm9ncmFtIiwicHJvZ3JhbUlEIiwicG9vbCIsInZzIiwiVkVSVEVYX1NIQURFUiIsImZzIiwiRlJBR01FTlRfU0hBREVSIiwicHJvZ3JhbSIsImF0dGFjaFNoYWRlciIsImxpbmtQcm9ncmFtIiwiVWJvIiwiYm91bmRMb2NhdGlvbiIsImJ1ZmZlciIsImNyZWF0ZUJ1ZmZlciIsImJpbmRCdWZmZXIiLCJVTklGT1JNX0JVRkZFUiIsImJ1ZmZlckRhdGEiLCJTVEFUSUNfRFJBVyIsImJpbmRCdWZmZXJCYXNlIiwic2V0IiwiYnVmZmVyU3ViRGF0YSIsIlZhbyIsInZhbyIsImNyZWF0ZVZlcnRleEFycmF5IiwiYmluZFZlcnRleEFycmF5IiwiY3JlYXRlVmVydGV4QXJyYXlPRVMiLCJiaW5kVmVydGV4QXJyYXlPRVMiLCJkZWxldGVWZXJ0ZXhBcnJheSIsImRlbGV0ZVZlcnRleEFycmF5T0VTIiwiZ2V0VHlwZVNpemUiLCJpbml0QXR0cmlidXRlcyIsInByb3AiLCJjdXJyZW50IiwibG9jYXRpb24iLCJnZXRBdHRyaWJMb2NhdGlvbiIsIkFSUkFZX0JVRkZFUiIsImJpbmRBdHRyaWJ1dGVzIiwia2V5cyIsImtleSIsInNpemUiLCJpbnN0YW5jZWQiLCJ2ZXJ0ZXhBdHRyaWJQb2ludGVyIiwiRkxPQVQiLCJlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSIsImRpdmlzb3IiLCJ2ZXJ0ZXhBdHRyaWJEaXZpc29yIiwidmVydGV4QXR0cmliRGl2aXNvckFOR0xFIiwidXBkYXRlQXR0cmlidXRlcyIsIkRZTkFNSUNfRFJBVyIsImluaXRVbmlmb3JtcyIsInRleHR1cmVJbmRpY2VzIiwiVEVYVFVSRTAiLCJURVhUVVJFMSIsIlRFWFRVUkUyIiwiVEVYVFVSRTMiLCJURVhUVVJFNCIsIlRFWFRVUkU1IiwiZ2V0VW5pZm9ybUxvY2F0aW9uIiwidGV4dHVyZUluZGV4IiwiYWN0aXZlVGV4dHVyZSIsInVwZGF0ZVVuaWZvcm1zIiwidW5pZm9ybSIsInVuaWZvcm1NYXRyaXg0ZnYiLCJ1bmlmb3JtTWF0cml4M2Z2IiwidW5pZm9ybTRmdiIsInVuaWZvcm0zZnYiLCJ1bmlmb3JtMmZ2IiwidW5pZm9ybTFmIiwidW5pZm9ybTFpIiwiTW9kZWwiLCJwb2x5Z29uT2Zmc2V0IiwicG9seWdvbk9mZnNldEZhY3RvciIsInBvbHlnb25PZmZzZXRVbml0cyIsImNsaXBwaW5nIiwiZW5hYmxlIiwicGxhbmVzIiwiaW5zdGFuY2VDb3VudCIsImlzSW5zdGFuY2UiLCJzaWRlIiwiU3RyaW5nIiwic2hhZG93cyIsIm5hbWUiLCJpbmRpY2VzIiwiZ2xzbDN0bzEiLCJ1c2VQcm9ncmFtIiwiRUxFTUVOVF9BUlJBWV9CVUZGRVIiLCJhX3Bvc2l0aW9uIiwiaW5TaGFkb3dNYXAiLCJQT0xZR09OX09GRlNFVF9GSUxMIiwiZGlzYWJsZSIsIkJMRU5EIiwiYmxlbmRGdW5jIiwiU1JDX0FMUEhBIiwiT05FX01JTlVTX1NSQ19BTFBIQSIsIkRFUFRIX1RFU1QiLCJDVUxMX0ZBQ0UiLCJjdWxsRmFjZSIsImRyYXdFbGVtZW50c0luc3RhbmNlZCIsIlVOU0lHTkVEX1NIT1JUIiwiZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUiLCJkcmF3RWxlbWVudHMiLCJkcmF3QXJyYXlzIiwic2hhZGVySUQiLCJNZXNoIiwiX3NoYWRlciIsImdlb21ldHJ5IiwicG9zaXRpb25zIiwibm9ybWFscyIsInV2cyIsInNldEF0dHJpYnV0ZSIsInNldEluZGV4IiwiVWludDE2QXJyYXkiLCJzZXRVbmlmb3JtIiwic2V0U2hhZGVyIiwiQXhpc0hlbHBlciIsImcxIiwiZzIiLCJnMyIsIm0xIiwibTIiLCJtMyIsImFkZCIsInN4Iiwic3kiLCJzeiIsImFfbm9ybWFsIiwiaTMiLCJ2MHgiLCJ2MHkiLCJ2MHoiLCJueCIsIm55IiwibnoiLCJ2MXgiLCJ2MXkiLCJ2MXoiLCJjb25jYXQiLCJyZWZlcmVuY2UiLCJyZXNpemUiLCJkb21FbGVtZW50IiwicmF0aW8iLCJzdHlsZSIsInVuc3VwcG9ydGVkIiwiZGl2IiwiaW5uZXJIVE1MIiwiZGlzcGxheSIsIm1hcmdpbiIsImJvcmRlciIsImJhY2tncm91bmRDb2xvciIsImJvcmRlclJhZGl1cyIsInBhZGRpbmciLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0ZXh0QWxpZ24iLCJMaWdodCIsIkRpcmVjdGlvbmFsIiwiaW50ZW5zaXR5IiwiU2NlbmUiLCJmb2ciLCJzdGFydCIsImVuZCIsImRlbnNpdHkiLCJhZGRMaWdodCIsImxpZ2h0IiwiUmVuZGVyVGFyZ2V0IiwiaW50ZXJuYWxmb3JtYXQiLCJERVBUSF9DT01QT05FTlQiLCJERVBUSF9DT01QT05FTlQyNCIsIlVOU0lHTkVEX0lOVCIsImZyYW1lQnVmZmVyIiwiY3JlYXRlRnJhbWVidWZmZXIiLCJiaW5kRnJhbWVidWZmZXIiLCJGUkFNRUJVRkZFUiIsIkxJTkVBUiIsImZyYW1lYnVmZmVyVGV4dHVyZTJEIiwiQ09MT1JfQVRUQUNITUVOVDAiLCJERVBUSF9BVFRBQ0hNRU5UIiwiU2hhZG93TWFwUmVuZGVyZXIiLCJydCIsInNoYWRvdyIsImJpYXMiLCJjYW1lcmEiLCJQZXJzcGVjdGl2ZSIsIk9ydGhvZ3JhcGhpYyIsInNldExpZ2h0T3JpZ2luIiwibGFzdFByb2dyYW0iLCJzb3J0Iiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInRpbWUiLCJub3JtYWwiLCJtb2RlbFZpZXciLCJpbnZlcnNlZE1vZGVsVmlldyIsImNhY2hlZFNjZW5lIiwiY2FjaGVkQ2FtZXJhIiwiUmVuZGVyZXIiLCJzdXBwb3J0ZWQiLCJzb3J0ZWQiLCJvcGFxdWUiLCJwZXJmb3JtYW5jZSIsInZlcnRpY2VzIiwiaW5zdGFuY2VzIiwid2luZG93IiwiZGV2aWNlUGl4ZWxSYXRpbyIsImNhbnZhcyIsImFudGlhbGlhcyIsInNlc3Npb24iLCJnbGkiLCJncmVldGluZyIsImxpYiIsInBhcmFtZXRlcnMiLCJ2YWx1ZXMiLCJhcmdzIiwiZ2V0UGFyYW1ldGVyIiwiVkVSU0lPTiIsImxvZyIsImluaXQiLCJwZXJTY2VuZSIsInBlck1vZGVsIiwic2hhZG93bWFwIiwic0xvY2F0aW9uIiwiZ2V0VW5pZm9ybUJsb2NrSW5kZXgiLCJtTG9jYXRpb24iLCJkTG9jYXRpb24iLCJ1bmlmb3JtQmxvY2tCaW5kaW5nIiwidXBkYXRlQ2FtZXJhTWF0cml4IiwiYmluZCIsInJlbmRlclNoYWRvdyIsInJlbmRlck9iamVjdCIsInJlbmRlclRhcmdldCIsImNsZWFyQ29sb3IiLCJ2aWV3cG9ydCIsImNsZWFyIiwiQ09MT1JfQlVGRkVSX0JJVCIsIkRFUFRIX0JVRkZFUl9CSVQiLCJkcmF3IiwicnR0IiwibWF0cml4IiwiaW5pdFVuaWZvcm1zUGVyTW9kZWwiLCJjaGFuZ2VQcm9ncmFtIiwidXBkYXRlVW5pZm9ybXNQZXJNb2RlbCIsInVuYmluZCIsInByb2plY3Rpb25NYXRyaXgiLCJ2aWV3TWF0cml4IiwiZm9nU2V0dGluZ3MiLCJmb2dDb2xvciIsImlHbG9iYWxUaW1lIiwiZ2xvYmFsQ2xpcFNldHRpbmdzIiwiZ2xvYmFsQ2xpcFBsYW5lMCIsImdsb2JhbENsaXBQbGFuZTEiLCJnbG9iYWxDbGlwUGxhbmUyIiwibW9kZWxNYXRyaXgiLCJub3JtYWxNYXRyaXgiLCJsb2NhbENsaXBTZXR0aW5ncyIsImxvY2FsQ2xpcFBsYW5lMCIsImxvY2FsQ2xpcFBsYW5lMSIsImxvY2FsQ2xpcFBsYW5lMiIsInNoYWRvd01hcCIsInNoYWRvd01hdHJpeCIsInNoYWRvd05lYXIiLCJzaGFkb3dGYXIiLCJQYXNzIiwicXVhZCIsInVfaW5wdXQiLCJDb21wb3NlciIsInJlbmRlcmVyIiwicGFzc2VzIiwic2NyZWVuIiwiY29tcGlsZSIsImJ1ZmZlcnMiLCJyZWFkIiwid3JpdGUiLCJzZXRTaXplIiwic2V0UmF0aW8iLCJwYXNzIiwidGVtcCIsInJlc2V0QnVmZmVycyIsInJlbmRlclRvVGV4dHVyZSIsInRvdGFsIiwic3dhcEJ1ZmZlcnMiLCJyZW5kZXIiLCJQZXJmb3JtYW5jZSIsInRoZW1lIiwiZm9udCIsImNvbG9yMSIsImNvbG9yMiIsImNvbG9yMyIsImNvbG9yNCIsImNvbnRhaW5lciIsImNzc1RleHQiLCJob2xkZXIiLCJhcHBlbmRDaGlsZCIsInRpdGxlIiwibXNUZXh0cyIsImVsZW1lbnQiLCJyZWJ1aWxkIiwidGV4dENvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFBLElBQU1BLFFBQVE7SUFDVkMsYUFBUyxtQkFBTTtJQUNYLDZVQU9FRCxNQUFNRSxXQUFOLEVBUEY7SUFRSCxLQVZTOztJQVlWQSxpQkFBYSx1QkFBTTtJQUNmO0lBYUg7SUExQlMsQ0FBZDs7SUNBQSxTQUFTQyxJQUFULEdBQWdCO0lBQ1o7SUFRSDs7SUFFRCxJQUFNQyxNQUFNO0lBQ1JDLFlBQVEsa0JBQU07SUFDVixzRUFFTUYsTUFGTjtJQU9ILEtBVE87SUFVUkcsaUJBQWEsdUJBQU07SUFDZixzRUFFTUgsTUFGTjtJQU9ILEtBbEJPO0lBbUJSSSxrQkFBYyx3QkFBTTtJQUNoQixzRUFFTUosTUFGTjtJQU9IO0lBM0JPLENBQVo7O0lDWEE7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNSyxrQkFBa0IsQ0FBeEI7O0lBRVA7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNQyxvQkFBb0IsSUFBMUI7O0lBRVA7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNQyxlQUFlLElBQXJCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsaUJBQWlCLElBQXZCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsbUJBQW1CLElBQXpCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsZ0JBQWdCLElBQXRCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsYUFBYSxJQUFuQjs7SUFFUDs7Ozs7Ozs7QUFRQSxJQUFPLElBQU1DLGdCQUFnQixJQUF0Qjs7SUFFUDs7Ozs7Ozs7Ozs7QUFXQSxJQUFPLElBQU1DLE9BQU87SUFDaEJDLFVBQVEsQ0FEUTtJQUVoQkMsU0FBTyxDQUZTO0lBR2hCQyxhQUFXO0lBSEssQ0FBYjs7SUFNUDs7Ozs7Ozs7Ozs7QUFXQSxJ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
