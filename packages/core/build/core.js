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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2xpZ2h0LmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2ZvZy5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvc2Vzc2lvbi5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy91Ym8uanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3Mvbm9pc2UuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvY2xpcHBpbmcuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvZXh0ZW5zaW9ucy5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9zaGFkb3cuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvY29tbW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvbWF0NC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvcXVhdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMyLmpzIiwiLi4vc3JjL3V0aWxzL2NvbG9yLmpzIiwiLi4vc3JjL3V0aWxzL21hdGguanMiLCIuLi9zcmMvdXRpbHMvZ2xzbC1wYXJzZXIuanMiLCIuLi9zcmMvY29yZS92ZWN0b3IzLmpzIiwiLi4vc3JjL2NvcmUvb2JqZWN0My5qcyIsIi4uL3NyYy9jYW1lcmFzL29ydGhvZ3JhcGhpYy5qcyIsIi4uL3NyYy9jYW1lcmFzL3BlcnNwZWN0aXZlLmpzIiwiLi4vc3JjL3NoYWRlcnMvYmFzaWMuanMiLCIuLi9zcmMvY29yZS90ZXh0dXJlLmpzIiwiLi4vc3JjL3NoYWRlcnMvZGVmYXVsdC5qcyIsIi4uL3NyYy9zaGFkZXJzL2JpbGxib2FyZC5qcyIsIi4uL3NyYy9zaGFkZXJzL3NlbS5qcyIsIi4uL3NyYy9nbC9wcm9ncmFtLmpzIiwiLi4vc3JjL2dsL3Viby5qcyIsIi4uL3NyYy9nbC92YW8uanMiLCIuLi9zcmMvZ2wvdHlwZXMuanMiLCIuLi9zcmMvZ2wvYXR0cmlidXRlcy5qcyIsIi4uL3NyYy9nbC91bmlmb3Jtcy5qcyIsIi4uL3NyYy9jb3JlL21vZGVsLmpzIiwiLi4vc3JjL2NvcmUvbWVzaC5qcyIsIi4uL3NyYy9oZWxwZXJzL2F4aXMuanMiLCIuLi9zcmMvaGVscGVycy9ub3JtYWwuanMiLCIuLi9zcmMvdXRpbHMvZG9tLmpzIiwiLi4vc3JjL2NvcmUvbGlnaHRzLmpzIiwiLi4vc3JjL2NvcmUvc2NlbmUuanMiLCIuLi9zcmMvY29yZS9ydC5qcyIsIi4uL3NyYy9jb3JlL3NoYWRvdy1tYXAtcmVuZGVyZXIuanMiLCIuLi9zcmMvY29yZS9yZW5kZXJlci5qcyIsIi4uL3NyYy9jb3JlL3Bhc3MuanMiLCIuLi9zcmMvcGFzc2VzL2Jhc2ljLmpzIiwiLi4vc3JjL2NvcmUvY29tcG9zZXIuanMiLCIuLi9zcmMvY29yZS9wZXJmb3JtYW5jZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBMSUdIVCA9IHtcbiAgICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIC8vIGZhY3RvcnkgbGlnaHRcbiAgICAgICAgdmVjMyBpbnZlcnNlTGlnaHREaXJlY3Rpb24gPSBub3JtYWxpemUodmVjMygtMC4yNSwgLTAuMjUsIDEuMCkpO1xuICAgICAgICB2ZWMzIGRpcmVjdGlvbmFsQ29sb3IgPSB2ZWMzKG1heChkb3Qodl9ub3JtYWwsIGludmVyc2VMaWdodERpcmVjdGlvbiksIDAuMCkpO1xuICAgICAgICB2ZWMzIGZhY3RvcnkgPSBtaXgodmVjMygwLjApLCBkaXJlY3Rpb25hbENvbG9yLCAwLjk4OSk7IC8vIGxpZ2h0IGludGVuc2l0eVxuICAgICAgICBiYXNlLnJnYiAqPSBmYWN0b3J5O1xuXG4gICAgICAgICR7TElHSFQuZGlyZWN0aW9uYWwoKX1gO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25hbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgLy8gdmVjMyBkY29sb3IgPSB2ZWMzKDAuMDEpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGZvciAoaW50IGkgPSAwOyBpIDwgTUFYX0RJUkVDVElPTkFMOyBpKyspIHtcbiAgICAgICAgICAgIC8vICAgICB2ZWMzIGludmVyc2VMaWdodERpcmVjdGlvbiA9IG5vcm1hbGl6ZShkaXJlY3Rpb25hbExpZ2h0c1tpXS5kbFBvc2l0aW9uLnh5eik7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBsaWdodCA9IHZlYzMobWF4KGRvdCh2X25vcm1hbCwgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uKSwgMC4wKSk7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBkaXJlY3Rpb25hbENvbG9yID0gZGlyZWN0aW9uYWxMaWdodHNbaV0uZGxDb2xvci5yZ2IgKiBsaWdodDtcbiAgICAgICAgICAgIC8vICAgICBkY29sb3IgKz0gbWl4KGRjb2xvciwgZGlyZWN0aW9uYWxDb2xvciwgZGlyZWN0aW9uYWxMaWdodHNbaV0uZmxJbnRlbnNpdHkpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gZGNvbG9yIC89IGZsb2F0KE1BWF9ESVJFQ1RJT05BTCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gYmFzZS5yZ2IgKj0gZGNvbG9yO1xuICAgICAgICBgO1xuICAgIH0sXG59O1xuXG5leHBvcnQge1xuICAgIExJR0hULFxufTtcbiIsImZ1bmN0aW9uIGJhc2UoKSB7XG4gICAgcmV0dXJuIGBcbiAgICBmbG9hdCBmb2dTdGFydCA9IGZvZ1NldHRpbmdzLnk7XG4gICAgZmxvYXQgZm9nRW5kID0gZm9nU2V0dGluZ3MuejtcbiAgICBmbG9hdCBmb2dEZW5zaXR5ID0gZm9nU2V0dGluZ3MuYTtcblxuICAgIGZsb2F0IGRpc3QgPSAwLjA7XG4gICAgZmxvYXQgZm9nRmFjdG9yID0gMC4wO1xuICAgIGRpc3QgPSBnbF9GcmFnQ29vcmQueiAvIGdsX0ZyYWdDb29yZC53O2A7XG59XG5cbmNvbnN0IEZPRyA9IHtcbiAgICBsaW5lYXI6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgaWYgKGZvZ1NldHRpbmdzLnggPiAwLjApIHtcbiAgICAgICAgICAgICR7YmFzZSgpfVxuICAgICAgICAgICAgZm9nRmFjdG9yID0gKGZvZ0VuZCAtIGRpc3QpIC8gKGZvZ0VuZCAtIGZvZ1N0YXJ0KTtcbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IGNsYW1wKGZvZ0ZhY3RvciwgMC4wLCAxLjApO1xuICAgICAgICAgICAgYmFzZSA9IG1peChmb2dDb2xvciwgYmFzZSwgZm9nRmFjdG9yKTtcbiAgICAgICAgfWA7XG4gICAgfSxcbiAgICBleHBvbmVudGlhbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoZGlzdCAqIGZvZ0RlbnNpdHkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxuICAgIGV4cG9uZW50aWFsMjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoKGRpc3QgKiBmb2dEZW5zaXR5KSAqIChkaXN0ICogZm9nRGVuc2l0eSkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBGT0csXG59O1xuIiwiLyoqXG4gKiBNYXggZGlyZWN0aW9uYWwgbGlnaHQgYWxsb3dlZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgTUFYX0RJUkVDVElPTkFMXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgTUFYX0RJUkVDVElPTkFMID0gMTtcblxuLyoqXG4gKiBkaXJlY3Rpb25hbCBsaWdodCBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgRElSRUNUSU9OQUxfTElHSFRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBESVJFQ1RJT05BTF9MSUdIVCA9IDEwMDA7XG5cbi8qKlxuICogYmFzaWMgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQkFTSUNcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQkFTSUMgPSAyMDAwO1xuXG4vKipcbiAqIGRlZmF1bHQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfREVGQVVMVFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9ERUZBVUxUID0gMjAwMTtcblxuLyoqXG4gKiBiaWxsYm9hcmQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQklMTEJPQVJEXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0JJTExCT0FSRCA9IDIwMDI7XG5cbi8qKlxuICogc2hhZG93IHNoYWRlciBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0hBREVSX1NIQURPV1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9TSEFET1cgPSAyMDAzO1xuXG4vKipcbiAqIHNlbSBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9TRU1cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfU0VNID0gMjAwNDtcblxuLyoqXG4gKiBjdXN0b20gc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQ1VTVE9NXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0NVU1RPTSA9IDI1MDA7XG5cbi8qKlxuICogc2hhZGVyIGRyYXcgbW9kZXNcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIERSQVdcbiAqIEB0eXBlIHtvYmplY3R9XG4gKiBAcHJvcGVydHkge251bWJlcn0gUE9JTlRTXG4gKiBAcHJvcGVydHkge251bWJlcn0gTElORVNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBUUklBTkdMRVNcbiAqL1xuZXhwb3J0IGNvbnN0IERSQVcgPSB7XG4gICAgUE9JTlRTOiAwLFxuICAgIExJTkVTOiAxLFxuICAgIFRSSUFOR0xFUzogNCxcbn07XG5cbi8qKlxuICogdHJpYW5nbGUgc2lkZVxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0lERVxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBGUk9OVFxuICogQHByb3BlcnR5IHtudW1iZXJ9IEJBQ0tcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCT1RIXG4gKi9cbmV4cG9ydCBjb25zdCBTSURFID0ge1xuICAgIEZST05UOiAwLFxuICAgIEJBQ0s6IDEsXG4gICAgQk9USDogMixcbn07XG5cbi8qKlxuICogY29udGV4dCB0eXBlc1xuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgQ09OVEVYVFxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBXRUJHTFxuICogQHByb3BlcnR5IHtudW1iZXJ9IFdFQkdMMlxuICovXG5leHBvcnQgY29uc3QgQ09OVEVYVCA9IHtcbiAgICBXRUJHTDogJ3dlYmdsJyxcbiAgICBXRUJHTDI6ICd3ZWJnbDInLFxufTtcbiIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IGxpYnJhcnkgPSBgbG93d3ctJHtfX0xJQlJBUllfX31gO1xuY29uc3QgdmVyc2lvbiA9IF9fVkVSU0lPTl9fO1xuXG4vLyBwZXIgc2Vzc2lvblxubGV0IGdsID0gbnVsbDtcbmxldCBjb250ZXh0VHlwZSA9IG51bGw7XG5cbi8vIHRlc3QgY29udGV4dCB3ZWJnbCBhbmQgd2ViZ2wyXG5jb25zdCB0ZXN0Q29udGV4dDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KENPTlRFWFQuV0VCR0wpO1xuY29uc3QgdGVzdENvbnRleHQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dChDT05URVhULldFQkdMMik7XG5cbmNvbnN0IGV4dGVuc2lvbnMgPSB7XG4gICAgLy8gdXNlZCBnbG9iYWxseVxuICAgIHZlcnRleEFycmF5T2JqZWN0OiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpLFxuXG4gICAgLy8gdXNlZCBmb3IgaW5zdGFuY2luZ1xuICAgIGluc3RhbmNlZEFycmF5czogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpLFxuXG4gICAgLy8gdXNlZCBmb3IgZmxhdCBzaGFkaW5nXG4gICAgc3RhbmRhcmREZXJpdmF0aXZlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyksXG5cbiAgICAvLyBkZXB0aCB0ZXh0dXJlXG4gICAgZGVwdGhUZXh0dXJlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpLFxufTtcblxuY29uc3Qgc2V0Q29udGV4dFR5cGUgPSAocHJlZmVycmVkKSA9PiB7XG4gICAgY29uc3QgZ2wyID0gdGVzdENvbnRleHQyICYmIENPTlRFWFQuV0VCR0wyO1xuICAgIGNvbnN0IGdsMSA9IHRlc3RDb250ZXh0MSAmJiBDT05URVhULldFQkdMO1xuICAgIGNvbnRleHRUeXBlID0gcHJlZmVycmVkIHx8IGdsMiB8fCBnbDE7XG5cbiAgICBpZiAoY29udGV4dFR5cGUgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIGV4dGVuc2lvbnMudmVydGV4QXJyYXlPYmplY3QgPSB0cnVlO1xuICAgICAgICBleHRlbnNpb25zLmluc3RhbmNlZEFycmF5cyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuc3RhbmRhcmREZXJpdmF0aXZlcyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuZGVwdGhUZXh0dXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dFR5cGU7XG59O1xuXG5jb25zdCBnZXRDb250ZXh0VHlwZSA9ICgpID0+IGNvbnRleHRUeXBlO1xuXG5jb25zdCBzZXRDb250ZXh0ID0gKGNvbnRleHQpID0+IHtcbiAgICBnbCA9IGNvbnRleHQ7XG4gICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wpIHtcbiAgICAgICAgZXh0ZW5zaW9ucy52ZXJ0ZXhBcnJheU9iamVjdCA9IGdsLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5pbnN0YW5jZWRBcnJheXMgPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5zdGFuZGFyZERlcml2YXRpdmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5kZXB0aFRleHR1cmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyk7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0Q29udGV4dCA9ICgpID0+IGdsO1xuXG5jb25zdCBzdXBwb3J0cyA9ICgpID0+IGV4dGVuc2lvbnM7XG5cbmV4cG9ydCB7XG4gICAgbGlicmFyeSxcbiAgICB2ZXJzaW9uLFxuICAgIHNldENvbnRleHQsXG4gICAgZ2V0Q29udGV4dCxcbiAgICBzZXRDb250ZXh0VHlwZSxcbiAgICBnZXRDb250ZXh0VHlwZSxcbiAgICBzdXBwb3J0cyxcbn07XG4iLCJpbXBvcnQgeyBDT05URVhULCBNQVhfRElSRUNUSU9OQUwgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcblxuY29uc3QgVUJPID0ge1xuICAgIHNjZW5lOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gcGVyU2NlbmUge1xuICAgICAgICAgICAgICAgIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgICAgICAgICBtYXQ0IHZpZXdNYXRyaXg7XG4gICAgICAgICAgICAgICAgdmVjNCBmb2dTZXR0aW5ncztcbiAgICAgICAgICAgICAgICB2ZWM0IGZvZ0NvbG9yO1xuICAgICAgICAgICAgICAgIGZsb2F0IGlHbG9iYWxUaW1lO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFNldHRpbmdzO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMDtcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwUGxhbmUyO1xuICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgIHVuaWZvcm0gbWF0NCB2aWV3TWF0cml4O1xuICAgICAgICB1bmlmb3JtIHZlYzQgZm9nU2V0dGluZ3M7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBmb2dDb2xvcjtcbiAgICAgICAgdW5pZm9ybSBmbG9hdCBpR2xvYmFsVGltZTtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBTZXR0aW5ncztcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBQbGFuZTA7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwUGxhbmUxO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMjtgO1xuICAgIH0sXG5cbiAgICBtb2RlbDogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICB1bmlmb3JtIHBlck1vZGVsIHtcbiAgICAgICAgICAgICAgICBtYXQ0IG1vZGVsTWF0cml4O1xuICAgICAgICAgICAgICAgIG1hdDQgbm9ybWFsTWF0cml4O1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTA7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTI7XG4gICAgICAgICAgICB9O2A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBub3JtYWxNYXRyaXg7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwUGxhbmUwO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFBsYW5lMTtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBQbGFuZTI7YDtcbiAgICB9LFxuXG4gICAgbGlnaHRzOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAjZGVmaW5lIE1BWF9ESVJFQ1RJT05BTCAke01BWF9ESVJFQ1RJT05BTH1cblxuICAgICAgICAgICAgICAgIHN0cnVjdCBEaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBkbENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBmbEludGVuc2l0eTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBkaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07XG4gICAgICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICNkZWZpbmUgTUFYX0RJUkVDVElPTkFMICR7TUFYX0RJUkVDVElPTkFMfVxuXG4gICAgICAgICAgICBzdHJ1Y3QgRGlyZWN0aW9uYWwge1xuICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB2ZWM0IGRsQ29sb3I7XG4gICAgICAgICAgICAgICAgZmxvYXQgZmxJbnRlbnNpdHk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB1bmlmb3JtIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBVQk8sXG59O1xuIiwiY29uc3QgTk9JU0UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICB2ZWMzIG1vZDI4OSh2ZWMzIHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IG1vZDI4OSh2ZWM0IHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IHBlcm11dGUodmVjNCB4KXtyZXR1cm4gbW9kMjg5KCh4KjM0LisxLikqeCk7fXZlYzQgdGF5bG9ySW52U3FydCh2ZWM0IHIpe3JldHVybiAxLjc5Mjg0LS44NTM3MzUqcjt9dmVjMyBmYWRlKHZlYzMgdCl7cmV0dXJuIHQqdCp0Kih0Kih0KjYuLTE1LikrMTAuKTt9ZmxvYXQgY25vaXNlKHZlYzMgUCl7dmVjMyBQaTA9Zmxvb3IoUCksUGkxPVBpMCt2ZWMzKDEuKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9ZmxvYXQgcG5vaXNlKHZlYzMgUCx2ZWMzIHJlcCl7dmVjMyBQaTA9bW9kKGZsb29yKFApLHJlcCksUGkxPW1vZChQaTArdmVjMygxLikscmVwKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9XG5gO1xufTtcblxuZXhwb3J0IHtcbiAgICBOT0lTRSxcbn07XG4iLCJjb25zdCBDTElQUElORyA9IHtcblxuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgb3V0IHZlYzQgbG9jYWxfZXllc3BhY2U7XG4gICAgICAgIG91dCB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgbG9jYWxfZXllc3BhY2UgPSBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgZ2xvYmFsX2V5ZXNwYWNlID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpbiB2ZWM0IGxvY2FsX2V5ZXNwYWNlO1xuICAgICAgICBpbiB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAobG9jYWxDbGlwU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTApIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTIpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdsb2JhbENsaXBTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICBpZihkb3QoZ2xvYmFsX2V5ZXNwYWNlLCBnbG9iYWxDbGlwUGxhbmUwKSA8IDAuMCkgZGlzY2FyZDtcbiAgICAgICAgICAgIGlmKGRvdChnbG9iYWxfZXllc3BhY2UsIGdsb2JhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGdsb2JhbF9leWVzcGFjZSwgZ2xvYmFsQ2xpcFBsYW5lMikgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgIH1gO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgQ0xJUFBJTkcsXG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuXG5jb25zdCBFWFRFTlNJT05TID0ge1xuXG4gICAgdmVydGV4OiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuXG4gICAgZnJhZ21lbnQ6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGVgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgRVhURU5TSU9OUyxcbn07XG4iLCJmdW5jdGlvbiBoYXJkKCkge1xuICAgIHJldHVybiBgXG4gICAgZmxvYXQgaGFyZFNoYWRvdzEoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcbiAgICAgICAgZmxvYXQgc2hhZG93ID0gdGV4dHVyZShzaGFkb3dNYXAsIHV2KS5yO1xuXG4gICAgICAgIGZsb2F0IHZpc2liaWxpdHkgPSAxLjA7XG4gICAgICAgIGZsb2F0IHNoYWRvd0Ftb3VudCA9IDAuNTtcblxuICAgICAgICBmbG9hdCBjb3NUaGV0YSA9IGNsYW1wKGRvdCh2X25vcm1hbCwgdlNoYWRvd0Nvb3JkLnh5eiksIDAuMCwgMS4wKTtcbiAgICAgICAgZmxvYXQgYmlhcyA9IDAuMDAwMDUgKiB0YW4oYWNvcyhjb3NUaGV0YSkpOyAvLyBjb3NUaGV0YSBpcyBkb3QoIG4sbCApLCBjbGFtcGVkIGJldHdlZW4gMCBhbmQgMVxuICAgICAgICBiaWFzID0gY2xhbXAoYmlhcywgMC4wLCAwLjAwMSk7XG5cbiAgICAgICAgaWYgKHNoYWRvdyA8IHNoYWRvd0Nvb3JkLnogLSBiaWFzKXtcbiAgICAgICAgICAgIHZpc2liaWxpdHkgPSBzaGFkb3dBbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgZmxvYXQgaGFyZFNoYWRvdzIoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcblxuICAgICAgICBmbG9hdCBsaWdodERlcHRoMSA9IHRleHR1cmUoc2hhZG93TWFwLCB1dikucjtcbiAgICAgICAgZmxvYXQgbGlnaHREZXB0aDIgPSBjbGFtcChzaGFkb3dDb29yZC56LCAwLjAsIDEuMCk7XG4gICAgICAgIGZsb2F0IGJpYXMgPSAwLjAwMDE7XG5cbiAgICAgICAgcmV0dXJuIHN0ZXAobGlnaHREZXB0aDIsIGxpZ2h0RGVwdGgxK2JpYXMpO1xuICAgIH1cblxuICAgIGZsb2F0IGhhcmRTaGFkb3czKHNhbXBsZXIyRCBzaGFkb3dNYXApIHtcbiAgICAgICAgdmVjNCBzaGFkb3dDb29yZCA9IHZTaGFkb3dDb29yZCAvIHZTaGFkb3dDb29yZC53O1xuICAgICAgICB2ZWMyIHV2ID0gc2hhZG93Q29vcmQueHk7XG5cbiAgICAgICAgZmxvYXQgdmlzaWJpbGl0eSA9IDEuMDtcbiAgICAgICAgZmxvYXQgc2hhZG93QW1vdW50ID0gMC41O1xuICAgICAgICBmbG9hdCBiaWFzID0gMC4wMDAwNTtcblxuICAgICAgICB2ZWMyIHBvaXNzb25EaXNrWzE2XTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMF0gPSB2ZWMyKC0wLjk0MjAxNjI0LCAtMC4zOTkwNjIxNik7XG4gICAgICAgIHBvaXNzb25EaXNrWzFdID0gdmVjMigwLjk0NTU4NjA5LCAtMC43Njg5MDcyNSk7XG4gICAgICAgIHBvaXNzb25EaXNrWzJdID0gdmVjMigtMC4wOTQxODQxMDEsIC0wLjkyOTM4ODcwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbM10gPSB2ZWMyKDAuMzQ0OTU5MzgsIDAuMjkzODc3NjApO1xuICAgICAgICBwb2lzc29uRGlza1s0XSA9IHZlYzIoLTAuOTE1ODg1ODEsIDAuNDU3NzE0MzIpO1xuICAgICAgICBwb2lzc29uRGlza1s1XSA9IHZlYzIoLTAuODE1NDQyMzIsIC0wLjg3OTEyNDY0KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbNl0gPSB2ZWMyKC0wLjM4Mjc3NTQzLCAwLjI3Njc2ODQ1KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbN10gPSB2ZWMyKDAuOTc0ODQzOTgsIDAuNzU2NDgzNzkpO1xuICAgICAgICBwb2lzc29uRGlza1s4XSA9IHZlYzIoMC40NDMyMzMyNSwgLTAuOTc1MTE1NTQpO1xuICAgICAgICBwb2lzc29uRGlza1s5XSA9IHZlYzIoMC41Mzc0Mjk4MSwgLTAuNDczNzM0MjApO1xuICAgICAgICBwb2lzc29uRGlza1sxMF0gPSB2ZWMyKC0wLjI2NDk2OTExLCAtMC40MTg5MzAyMyk7XG4gICAgICAgIHBvaXNzb25EaXNrWzExXSA9IHZlYzIoMC43OTE5NzUxNCwgMC4xOTA5MDE4OCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzEyXSA9IHZlYzIoLTAuMjQxODg4NDAsIDAuOTk3MDY1MDcpO1xuICAgICAgICBwb2lzc29uRGlza1sxM10gPSB2ZWMyKC0wLjgxNDA5OTU1LCAwLjkxNDM3NTkwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTRdID0gdmVjMigwLjE5OTg0MTI2LCAwLjc4NjQxMzY3KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTVdID0gdmVjMigwLjE0MzgzMTYxLCAtMC4xNDEwMDc5MCk7XG5cbiAgICAgICAgZm9yIChpbnQgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgICAgICBpZiAoIHRleHR1cmUoc2hhZG93TWFwLCB1diArIHBvaXNzb25EaXNrW2ldLzcwMC4wKS5yIDwgc2hhZG93Q29vcmQuei1iaWFzICl7XG4gICAgICAgICAgICAgICAgdmlzaWJpbGl0eSAtPSAwLjAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgYDtcbn1cblxuY29uc3QgU0hBRE9XID0ge1xuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHNoYWRvd01hdHJpeDtcbiAgICAgICAgb3V0IHZlYzQgdlNoYWRvd0Nvb3JkO2A7XG4gICAgfSxcblxuICAgIHZlcnRleDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICB2U2hhZG93Q29vcmQgPSBzaGFkb3dNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgc2hhZG93TWFwO1xuICAgICAgICBpbiB2ZWM0IHZTaGFkb3dDb29yZDtcblxuICAgICAgICAke2hhcmQoKX1gO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAvLyBzaGFkb3dzXG4gICAgICAgIGZsb2F0IHNoYWRvdyA9IDEuMDtcblxuICAgICAgICAvLyBPUFRJT04gMVxuICAgICAgICBzaGFkb3cgPSBoYXJkU2hhZG93MShzaGFkb3dNYXApO1xuXG4gICAgICAgIGJhc2UgKj0gc2hhZG93O1xuICAgICAgICBgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgU0hBRE9XLFxufTtcbiIsIi8qKlxuICogQ29tbW9uIHV0aWxpdGllc1xuICogQG1vZHVsZSBnbE1hdHJpeFxuICovXG5cbi8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXG5leHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuZXhwb3J0IGxldCBBUlJBWV9UWVBFID0gKHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xuZXhwb3J0IGNvbnN0IFJBTkRPTSA9IE1hdGgucmFuZG9tO1xuXG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcbiAgQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmNvbnN0IGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG5cbi8qKlxuICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xuICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXG4gKiBvciByZWxhdGl2ZSB0b2xlcmFuY2Ugb2YgZ2xNYXRyaXguRVBTSUxPTiAoYW4gYWJzb2x1dGUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIHZhbHVlcyBsZXNzXG4gKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxuICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpO1xufVxuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogM3gzIE1hdHJpeFxuICogQG1vZHVsZSBtYXQzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDE7XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDQob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbNF07XG4gIG91dFs0XSA9IGFbNV07XG4gIG91dFs1XSA9IGFbNl07XG4gIG91dFs2XSA9IGFbOF07XG4gIG91dFs3XSA9IGFbOV07XG4gIG91dFs4XSA9IGFbMTBdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0MyB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTEwO1xuICBvdXRbNF0gPSBtMTE7XG4gIG91dFs1XSA9IG0xMjtcbiAgb3V0WzZdID0gbTIwO1xuICBvdXRbN10gPSBtMjE7XG4gIG91dFs4XSA9IG0yMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMTA7XG4gIG91dFs0XSA9IG0xMTtcbiAgb3V0WzVdID0gbTEyO1xuICBvdXRbNl0gPSBtMjA7XG4gIG91dFs3XSA9IG0yMTtcbiAgb3V0WzhdID0gbTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIGxldCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xuICAgIG91dFsxXSA9IGFbM107XG4gICAgb3V0WzJdID0gYVs2XTtcbiAgICBvdXRbM10gPSBhMDE7XG4gICAgb3V0WzVdID0gYVs3XTtcbiAgICBvdXRbNl0gPSBhMDI7XG4gICAgb3V0WzddID0gYTEyO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGFbMV07XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGFbMl07XG4gICAgb3V0WzddID0gYVs1XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICBsZXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xuICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcbiAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcblxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgaWYgKCFkZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgb3V0WzBdID0gYjAxICogZGV0O1xuICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gIG91dFswXSA9IChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpO1xuICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gIG91dFszXSA9IChhMTIgKiBhMjAgLSBhMTAgKiBhMjIpO1xuICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XG4gIG91dFs2XSA9IChhMTAgKiBhMjEgLSBhMTEgKiBhMjApO1xuICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgbGV0IGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl07XG4gIGxldCBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdO1xuICBsZXQgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcblxuICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG4gICAgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gIG91dFswXSA9IGEwMDtcbiAgb3V0WzFdID0gYTAxO1xuICBvdXRbMl0gPSBhMDI7XG5cbiAgb3V0WzNdID0gYTEwO1xuICBvdXRbNF0gPSBhMTE7XG4gIG91dFs1XSA9IGExMjtcblxuICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gIG91dFs2XSA9IGEyMDtcbiAgb3V0WzddID0gYTIxO1xuICBvdXRbOF0gPSBhMjI7XG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgb3V0WzBdID0geCAqIGFbMF07XG4gIG91dFsxXSA9IHggKiBhWzFdO1xuICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICBvdXRbM10gPSB5ICogYVszXTtcbiAgb3V0WzRdID0geSAqIGFbNF07XG4gIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gdlswXTtcbiAgb3V0WzddID0gdlsxXTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKSwgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYztcbiAgb3V0WzFdID0gcztcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAtcztcbiAgb3V0WzRdID0gYztcbiAgb3V0WzVdID0gMDtcblxuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB2WzFdO1xuICBvdXRbNV0gPSAwO1xuXG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSAwO1xuXG4gIG91dFszXSA9IGFbMl07XG4gIG91dFs0XSA9IGFbM107XG4gIG91dFs1XSA9IDA7XG5cbiAgb3V0WzZdID0gYVs0XTtcbiAgb3V0WzddID0gYVs1XTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHl4ID0geSAqIHgyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB6eCA9IHogKiB4MjtcbiAgbGV0IHp5ID0geiAqIHkyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gIG91dFszXSA9IHl4IC0gd3o7XG4gIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgb3V0WzFdID0geXggKyB3ejtcbiAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgb3V0WzJdID0genggLSB3eTtcbiAgb3V0WzVdID0genkgKyB3eDtcbiAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXG4gIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cbiAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICBvdXRbOF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gLTE7XG4gICAgb3V0WzddID0gMTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0MygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICtcbiAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgK1xuICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XG4gIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpKSlcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuXG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgb3V0WzNdID0gYVszXSAqIGI7XG4gIG91dFs0XSA9IGFbNF0gKiBiO1xuICBvdXRbNV0gPSBhWzVdICogYjtcbiAgb3V0WzZdID0gYVs2XSAqIGI7XG4gIG91dFs3XSA9IGFbN10gKiBiO1xuICBvdXRbOF0gPSBhWzhdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cbiAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmXG4gICAgICAgICBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XSAmJlxuICAgICAgICAgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sIGE2ID0gYVs2XSwgYTcgPSBhWzddLCBhOCA9IGFbOF07XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdLCBiNiA9IGJbNl0sIGI3ID0gYls3XSwgYjggPSBiWzhdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogNHg0IE1hdHJpeDxicj5Gb3JtYXQ6IGNvbHVtbi1tYWpvciwgd2hlbiB0eXBlZCBvdXQgaXQgbG9va3MgbGlrZSByb3ctbWFqb3I8YnI+VGhlIG1hdHJpY2VzIGFyZSBiZWluZyBwb3N0IG11bHRpcGxpZWQuXG4gKiBAbW9kdWxlIG1hdDRcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgb3V0WzldID0gYVs5XTtcbiAgb3V0WzEwXSA9IGFbMTBdO1xuICBvdXRbMTFdID0gYVsxMV07XG4gIG91dFsxMl0gPSBhWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdO1xuICBvdXRbMTRdID0gYVsxNF07XG4gIG91dFsxNV0gPSBhWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgb3V0WzldID0gYVs5XTtcbiAgb3V0WzEwXSA9IGFbMTBdO1xuICBvdXRbMTFdID0gYVsxMV07XG4gIG91dFsxMl0gPSBhWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdO1xuICBvdXRbMTRdID0gYVsxNF07XG4gIG91dFsxNV0gPSBhWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICBpZiAob3V0ID09PSBhKSB7XG4gICAgbGV0IGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XG4gICAgbGV0IGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gICAgbGV0IGEyMyA9IGFbMTFdO1xuXG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGEwMTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGEwMjtcbiAgICBvdXRbOV0gPSBhMTI7XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhMDM7XG4gICAgb3V0WzEzXSA9IGExMztcbiAgICBvdXRbMTRdID0gYTIzO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGFbMV07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGFbMl07XG4gICAgb3V0WzldID0gYVs2XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhWzNdO1xuICAgIG91dFsxM10gPSBhWzddO1xuICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gIG91dFsyXSAgPSAgKGEwMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTExICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gIG91dFs1XSAgPSAgKGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs4XSAgPSAgKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSk7XG4gIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gIG91dFsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XG4gIG91dFsxNF0gPSAtKGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICBsZXQgYjAgID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcbiAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbMV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gIGIwID0gYls0XTsgYjEgPSBiWzVdOyBiMiA9IGJbNl07IGIzID0gYls3XTtcbiAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gIG91dFs2XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuICBvdXRbOF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgb3V0WzExXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICBvdXRbMTNdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuXG4gIGlmIChhID09PSBvdXQpIHtcbiAgICBvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XTtcbiAgfSBlbHNlIHtcbiAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgb3V0WzBdID0gYTAwOyBvdXRbMV0gPSBhMDE7IG91dFsyXSA9IGEwMjsgb3V0WzNdID0gYTAzO1xuICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcbiAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICBsZXQgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcblxuICBvdXRbMF0gPSBhWzBdICogeDtcbiAgb3V0WzFdID0gYVsxXSAqIHg7XG4gIG91dFsyXSA9IGFbMl0gKiB4O1xuICBvdXRbM10gPSBhWzNdICogeDtcbiAgb3V0WzRdID0gYVs0XSAqIHk7XG4gIG91dFs1XSA9IGFbNV0gKiB5O1xuICBvdXRbNl0gPSBhWzZdICogeTtcbiAgb3V0WzddID0gYVs3XSAqIHk7XG4gIG91dFs4XSA9IGFbOF0gKiB6O1xuICBvdXRbOV0gPSBhWzldICogejtcbiAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICBsZXQgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXTtcbiAgbGV0IGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICBsZXQgcywgYywgdDtcbiAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcbiAgbGV0IGIwMCwgYjAxLCBiMDI7XG4gIGxldCBiMTAsIGIxMSwgYjEyO1xuICBsZXQgYjIwLCBiMjEsIGIyMjtcblxuICBpZiAobGVuIDwgZ2xNYXRyaXguRVBTSUxPTikgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGxlbiA9IDEgLyBsZW47XG4gIHggKj0gbGVuO1xuICB5ICo9IGxlbjtcbiAgeiAqPSBsZW47XG5cbiAgcyA9IE1hdGguc2luKHJhZCk7XG4gIGMgPSBNYXRoLmNvcyhyYWQpO1xuICB0ID0gMSAtIGM7XG5cbiAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcbiAgbGV0IGExMCA9IGFbNF07XG4gIGxldCBhMTEgPSBhWzVdO1xuICBsZXQgYTEyID0gYVs2XTtcbiAgbGV0IGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdO1xuICBsZXQgYTIxID0gYVs5XTtcbiAgbGV0IGEyMiA9IGFbMTBdO1xuICBsZXQgYTIzID0gYVsxMV07XG5cbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgb3V0WzBdICA9IGFbMF07XG4gICAgb3V0WzFdICA9IGFbMV07XG4gICAgb3V0WzJdICA9IGFbMl07XG4gICAgb3V0WzNdICA9IGFbM107XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9XG5cbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcbiAgb3V0WzVdID0gYTExICogYyArIGEyMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcbiAgb3V0WzhdID0gYTIwICogYyAtIGExMCAqIHM7XG4gIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XG4gIG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogcztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuICBsZXQgYTAwID0gYVswXTtcbiAgbGV0IGEwMSA9IGFbMV07XG4gIGxldCBhMDIgPSBhWzJdO1xuICBsZXQgYTAzID0gYVszXTtcbiAgbGV0IGEyMCA9IGFbOF07XG4gIGxldCBhMjEgPSBhWzldO1xuICBsZXQgYTIyID0gYVsxMF07XG4gIGxldCBhMjMgPSBhWzExXTtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbNF0gID0gYVs0XTtcbiAgICBvdXRbNV0gID0gYVs1XTtcbiAgICBvdXRbNl0gID0gYVs2XTtcbiAgICBvdXRbN10gID0gYVs3XTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzO1xuICBvdXRbMV0gPSBhMDEgKiBjIC0gYTIxICogcztcbiAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzO1xuICBvdXRbOF0gPSBhMDAgKiBzICsgYTIwICogYztcbiAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogYztcbiAgb3V0WzExXSA9IGEwMyAqIHMgKyBhMjMgKiBjO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG4gIGxldCBhMDAgPSBhWzBdO1xuICBsZXQgYTAxID0gYVsxXTtcbiAgbGV0IGEwMiA9IGFbMl07XG4gIGxldCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XTtcbiAgbGV0IGExMSA9IGFbNV07XG4gIGxldCBhMTIgPSBhWzZdO1xuICBsZXQgYTEzID0gYVs3XTtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgb3V0WzhdICA9IGFbOF07XG4gICAgb3V0WzldICA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogcztcbiAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogcztcbiAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogcztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSB2WzBdO1xuICBvdXRbMTNdID0gdlsxXTtcbiAgb3V0WzE0XSA9IHZbMl07XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMzfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gdlsxXTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IHZbMl07XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZSBhcm91bmQgYSBnaXZlbiBheGlzXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnJvdGF0ZShkZXN0LCBkZXN0LCByYWQsIGF4aXMpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkLCBheGlzKSB7XG4gIGxldCB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdO1xuICBsZXQgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIGxldCBzLCBjLCB0O1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG5cbiAgbGVuID0gMSAvIGxlbjtcbiAgeCAqPSBsZW47XG4gIHkgKj0gbGVuO1xuICB6ICo9IGxlbjtcblxuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYztcblxuICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbMF0gPSB4ICogeCAqIHQgKyBjO1xuICBvdXRbMV0gPSB5ICogeCAqIHQgKyB6ICogcztcbiAgb3V0WzJdID0geiAqIHggKiB0IC0geSAqIHM7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHggKiB5ICogdCAtIHogKiBzO1xuICBvdXRbNV0gPSB5ICogeSAqIHQgKyBjO1xuICBvdXRbNl0gPSB6ICogeSAqIHQgKyB4ICogcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geCAqIHogKiB0ICsgeSAqIHM7XG4gIG91dFs5XSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICBvdXRbMTBdID0geiAqIHogKiB0ICsgYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWChkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IDE7XG4gIG91dFsxXSAgPSAwO1xuICBvdXRbMl0gID0gMDtcbiAgb3V0WzNdICA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IGM7XG4gIG91dFs2XSA9IHM7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IC1zO1xuICBvdXRbMTBdID0gYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IGM7XG4gIG91dFsxXSAgPSAwO1xuICBvdXRbMl0gID0gLXM7XG4gIG91dFszXSAgPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSBzO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdICA9IGM7XG4gIG91dFsxXSAgPSBzO1xuICBvdXRbMl0gID0gMDtcbiAgb3V0WzNdICA9IDA7XG4gIG91dFs0XSA9IC1zO1xuICBvdXRbNV0gPSBjO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gIG91dFsxXSA9IHh5ICsgd3o7XG4gIG91dFsyXSA9IHh6IC0gd3k7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHh5IC0gd3o7XG4gIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gIG91dFs2XSA9IHl6ICsgd3g7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHh6ICsgd3k7XG4gIG91dFs5XSA9IHl6IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBNYXRyaXhcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQyKG91dCwgYSkge1xuICBsZXQgdHJhbnNsYXRpb24gPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgbGV0IGJ4ID0gLWFbMF0sIGJ5ID0gLWFbMV0sIGJ6ID0gLWFbMl0sIGJ3ID0gYVszXSxcbiAgYXggPSBhWzRdLCBheSA9IGFbNV0sIGF6ID0gYVs2XSwgYXcgPSBhWzddO1xuXG4gIGxldCBtYWduaXR1ZGUgPSBieCAqIGJ4ICsgYnkgKiBieSArIGJ6ICogYnogKyBidyAqIGJ3O1xuICAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcbiAgaWYgKG1hZ25pdHVkZSA+IDApIHtcbiAgICB0cmFuc2xhdGlvblswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDIgLyBtYWduaXR1ZGU7XG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyIC8gbWFnbml0dWRlO1xuICAgIHRyYW5zbGF0aW9uWzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMiAvIG1hZ25pdHVkZTtcbiAgfSBlbHNlIHtcbiAgICB0cmFuc2xhdGlvblswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDI7XG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyO1xuICAgIHRyYW5zbGF0aW9uWzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMjtcbiAgfVxuICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXG4gKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcbiAgb3V0WzBdID0gbWF0WzEyXTtcbiAgb3V0WzFdID0gbWF0WzEzXTtcbiAgb3V0WzJdID0gbWF0WzE0XTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcbiAqICB0aGUgc2FtZSBhcyB0aGUgc2NhbGluZyB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICBsZXQgbTExID0gbWF0WzBdO1xuICBsZXQgbTEyID0gbWF0WzFdO1xuICBsZXQgbTEzID0gbWF0WzJdO1xuICBsZXQgbTIxID0gbWF0WzRdO1xuICBsZXQgbTIyID0gbWF0WzVdO1xuICBsZXQgbTIzID0gbWF0WzZdO1xuICBsZXQgbTMxID0gbWF0WzhdO1xuICBsZXQgbTMyID0gbWF0WzldO1xuICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICBvdXRbMF0gPSBNYXRoLnNxcnQobTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzKTtcbiAgb3V0WzFdID0gTWF0aC5zcXJ0KG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMyk7XG4gIG91dFsyXSA9IE1hdGguc3FydChtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzMpO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um90YXRpb24ob3V0LCBtYXQpIHtcbiAgLy8gQWxnb3JpdGhtIHRha2VuIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cbiAgbGV0IHRyYWNlID0gbWF0WzBdICsgbWF0WzVdICsgbWF0WzEwXTtcbiAgbGV0IFMgPSAwO1xuXG4gIGlmICh0cmFjZSA+IDApIHtcbiAgICBTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDI7XG4gICAgb3V0WzNdID0gMC4yNSAqIFM7XG4gICAgb3V0WzBdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xuICAgIG91dFsxXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gUztcbiAgICBvdXRbMl0gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFM7XG4gIH0gZWxzZSBpZiAoKG1hdFswXSA+IG1hdFs1XSkgJiYgKG1hdFswXSA+IG1hdFsxMF0pKSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMF0gLSBtYXRbNV0gLSBtYXRbMTBdKSAqIDI7XG4gICAgb3V0WzNdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xuICAgIG91dFswXSA9IDAuMjUgKiBTO1xuICAgIG91dFsxXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gUztcbiAgICBvdXRbMl0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XG4gIH0gZWxzZSBpZiAobWF0WzVdID4gbWF0WzEwXSkge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzVdIC0gbWF0WzBdIC0gbWF0WzEwXSkgKiAyO1xuICAgIG91dFszXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gUztcbiAgICBvdXRbMF0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFM7XG4gICAgb3V0WzFdID0gMC4yNSAqIFM7XG4gICAgb3V0WzJdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTO1xuICB9IGVsc2Uge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzEwXSAtIG1hdFswXSAtIG1hdFs1XSkgKiAyO1xuICAgIG91dFszXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gUztcbiAgICBvdXRbMF0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XG4gICAgb3V0WzFdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTO1xuICAgIG91dFsyXSA9IDAuMjUgKiBTO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuICBsZXQgc3ggPSBzWzBdO1xuICBsZXQgc3kgPSBzWzFdO1xuICBsZXQgc3ogPSBzWzJdO1xuXG4gIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgb3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZSwgcm90YXRpbmcgYW5kIHNjYWxpbmcgYXJvdW5kIHRoZSBnaXZlbiBvcmlnaW5cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgb3JpZ2luKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBuZWdhdGl2ZU9yaWdpbik7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gbyBUaGUgb3JpZ2luIHZlY3RvciBhcm91bmQgd2hpY2ggdG8gc2NhbGUgYW5kIHJvdGF0ZVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbihvdXQsIHEsIHYsIHMsIG8pIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB4eSA9IHggKiB5MjtcbiAgbGV0IHh6ID0geCAqIHoyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB5eiA9IHkgKiB6MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIGxldCBzeCA9IHNbMF07XG4gIGxldCBzeSA9IHNbMV07XG4gIGxldCBzeiA9IHNbMl07XG5cbiAgbGV0IG94ID0gb1swXTtcbiAgbGV0IG95ID0gb1sxXTtcbiAgbGV0IG96ID0gb1syXTtcblxuICBsZXQgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBsZXQgb3V0MSA9ICh4eSArIHd6KSAqIHN4O1xuICBsZXQgb3V0MiA9ICh4eiAtIHd5KSAqIHN4O1xuICBsZXQgb3V0NCA9ICh4eSAtIHd6KSAqIHN5O1xuICBsZXQgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICBsZXQgb3V0NiA9ICh5eiArIHd4KSAqIHN5O1xuICBsZXQgb3V0OCA9ICh4eiArIHd5KSAqIHN6O1xuICBsZXQgb3V0OSA9ICh5eiAtIHd4KSAqIHN6O1xuICBsZXQgb3V0MTAgPSAoMSAtICh4eCArIHl5KSkgKiBzejtcblxuICBvdXRbMF0gPSBvdXQwO1xuICBvdXRbMV0gPSBvdXQxO1xuICBvdXRbMl0gPSBvdXQyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSBvdXQ0O1xuICBvdXRbNV0gPSBvdXQ1O1xuICBvdXRbNl0gPSBvdXQ2O1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSBvdXQ4O1xuICBvdXRbOV0gPSBvdXQ5O1xuICBvdXRbMTBdID0gb3V0MTA7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveik7XG4gIG91dFsxM10gPSB2WzFdICsgb3kgLSAob3V0MSAqIG94ICsgb3V0NSAqIG95ICsgb3V0OSAqIG96KTtcbiAgb3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcbiAgbGV0IHgyID0geCArIHg7XG4gIGxldCB5MiA9IHkgKyB5O1xuICBsZXQgejIgPSB6ICsgejtcblxuICBsZXQgeHggPSB4ICogeDI7XG4gIGxldCB5eCA9IHkgKiB4MjtcbiAgbGV0IHl5ID0geSAqIHkyO1xuICBsZXQgenggPSB6ICogeDI7XG4gIGxldCB6eSA9IHogKiB5MjtcbiAgbGV0IHp6ID0geiAqIHoyO1xuICBsZXQgd3ggPSB3ICogeDI7XG4gIGxldCB3eSA9IHcgKiB5MjtcbiAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICBvdXRbMV0gPSB5eCArIHd6O1xuICBvdXRbMl0gPSB6eCAtIHd5O1xuICBvdXRbM10gPSAwO1xuXG4gIG91dFs0XSA9IHl4IC0gd3o7XG4gIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICBvdXRbNl0gPSB6eSArIHd4O1xuICBvdXRbN10gPSAwO1xuXG4gIG91dFs4XSA9IHp4ICsgd3k7XG4gIG91dFs5XSA9IHp5IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgb3V0WzExXSA9IDA7XG5cbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZydXN0dW0ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICBsZXQgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCk7XG4gIGxldCB0YiA9IDEgLyAodG9wIC0gYm90dG9tKTtcbiAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XG4gIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gIG91dFsxNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gIGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpO1xuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSBmO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gIG91dFsxMV0gPSAtMTtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICBvdXRbMTVdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBmaWVsZCBvZiB2aWV3LlxuICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3KG91dCwgZm92LCBuZWFyLCBmYXIpIHtcbiAgbGV0IHVwVGFuID0gTWF0aC50YW4oZm92LnVwRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgZG93blRhbiA9IE1hdGgudGFuKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgbGVmdFRhbiA9IE1hdGgudGFuKGZvdi5sZWZ0RGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xuICBsZXQgcmlnaHRUYW4gPSBNYXRoLnRhbihmb3YucmlnaHREZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XG4gIGxldCB4U2NhbGUgPSAyLjAgLyAobGVmdFRhbiArIHJpZ2h0VGFuKTtcbiAgbGV0IHlTY2FsZSA9IDIuMCAvICh1cFRhbiArIGRvd25UYW4pO1xuXG4gIG91dFswXSA9IHhTY2FsZTtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIG91dFszXSA9IDAuMDtcbiAgb3V0WzRdID0gMC4wO1xuICBvdXRbNV0gPSB5U2NhbGU7XG4gIG91dFs2XSA9IDAuMDtcbiAgb3V0WzddID0gMC4wO1xuICBvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KTtcbiAgb3V0WzldID0gKCh1cFRhbiAtIGRvd25UYW4pICogeVNjYWxlICogMC41KTtcbiAgb3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzExXSA9IC0xLjA7XG4gIG91dFsxMl0gPSAwLjA7XG4gIG91dFsxM10gPSAwLjA7XG4gIG91dFsxNF0gPSAoZmFyICogbmVhcikgLyAobmVhciAtIGZhcik7XG4gIG91dFsxNV0gPSAwLjA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgbGV0IGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICBsZXQgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XG4gIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gIG91dFswXSA9IC0yICogbHI7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IC0yICogYnQ7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAyICogbmY7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXMuXG4gKiBJZiB5b3Ugd2FudCBhIG1hdHJpeCB0aGF0IGFjdHVhbGx5IG1ha2VzIGFuIG9iamVjdCBsb29rIGF0IGFub3RoZXIgb2JqZWN0LCB5b3Ugc2hvdWxkIHVzZSB0YXJnZXRUbyBpbnN0ZWFkLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcbiAgbGV0IHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbjtcbiAgbGV0IGV5ZXggPSBleWVbMF07XG4gIGxldCBleWV5ID0gZXllWzFdO1xuICBsZXQgZXlleiA9IGV5ZVsyXTtcbiAgbGV0IHVweCA9IHVwWzBdO1xuICBsZXQgdXB5ID0gdXBbMV07XG4gIGxldCB1cHogPSB1cFsyXTtcbiAgbGV0IGNlbnRlcnggPSBjZW50ZXJbMF07XG4gIGxldCBjZW50ZXJ5ID0gY2VudGVyWzFdO1xuICBsZXQgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJlxuICAgICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJlxuICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgZ2xNYXRyaXguRVBTSUxPTikge1xuICAgIHJldHVybiBpZGVudGl0eShvdXQpO1xuICB9XG5cbiAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gIHowICo9IGxlbjtcbiAgejEgKj0gbGVuO1xuICB6MiAqPSBsZW47XG5cbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gIGlmICghbGVuKSB7XG4gICAgeDAgPSAwO1xuICAgIHgxID0gMDtcbiAgICB4MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4MCAqPSBsZW47XG4gICAgeDEgKj0gbGVuO1xuICAgIHgyICo9IGxlbjtcbiAgfVxuXG4gIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gIGlmICghbGVuKSB7XG4gICAgeTAgPSAwO1xuICAgIHkxID0gMDtcbiAgICB5MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB5MCAqPSBsZW47XG4gICAgeTEgKj0gbGVuO1xuICAgIHkyICo9IGxlbjtcbiAgfVxuXG4gIG91dFswXSA9IHgwO1xuICBvdXRbMV0gPSB5MDtcbiAgb3V0WzJdID0gejA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHgxO1xuICBvdXRbNV0gPSB5MTtcbiAgb3V0WzZdID0gejE7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHgyO1xuICBvdXRbOV0gPSB5MjtcbiAgb3V0WzEwXSA9IHoyO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgb3V0WzE1XSA9IDE7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0VG8ob3V0LCBleWUsIHRhcmdldCwgdXApIHtcbiAgbGV0IGV5ZXggPSBleWVbMF0sXG4gICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICB1cHogPSB1cFsyXTtcblxuICBsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxuICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxuICAgICAgejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xuXG4gIGxldCBsZW4gPSB6MCp6MCArIHoxKnoxICsgejIqejI7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuICB9XG5cbiAgbGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcbiAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcbiAgICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcblxuICBsZW4gPSB4MCp4MCArIHgxKngxICsgeDIqeDI7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHgwICo9IGxlbjtcbiAgICB4MSAqPSBsZW47XG4gICAgeDIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHgxO1xuICBvdXRbMl0gPSB4MjtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XG4gIG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICBvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gejA7XG4gIG91dFs5XSA9IHoxO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gZXlleDtcbiAgb3V0WzEzXSA9IGV5ZXk7XG4gIG91dFsxNF0gPSBleWV6O1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xuICAgICAgICAgIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICtcbiAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICtcbiAgICAgICAgICBhWzEyXSArICcsICcgKyBhWzEzXSArICcsICcgKyBhWzE0XSArICcsICcgKyBhWzE1XSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSArIE1hdGgucG93KGFbOV0sIDIpICsgTWF0aC5wb3coYVsxMF0sIDIpICsgTWF0aC5wb3coYVsxMV0sIDIpICsgTWF0aC5wb3coYVsxMl0sIDIpICsgTWF0aC5wb3coYVsxM10sIDIpICsgTWF0aC5wb3coYVsxNF0sIDIpICsgTWF0aC5wb3coYVsxNV0sIDIpICkpXG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgb3V0WzddID0gYVs3XSArIGJbN107XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICBvdXRbOV0gPSBhWzldICsgYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSArIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSArIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICBvdXRbOV0gPSBhWzldIC0gYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdIC0gYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdIC0gYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgb3V0WzRdID0gYVs0XSAqIGI7XG4gIG91dFs1XSA9IGFbNV0gKiBiO1xuICBvdXRbNl0gPSBhWzZdICogYjtcbiAgb3V0WzddID0gYVs3XSAqIGI7XG4gIG91dFs4XSA9IGFbOF0gKiBiO1xuICBvdXRbOV0gPSBhWzldICogYjtcbiAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgb3V0WzExXSA9IGFbMTFdICogYjtcbiAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgb3V0WzE0XSA9IGFbMTRdICogYjtcbiAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQ0J3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xuICBvdXRbOV0gPSBhWzldICsgKGJbOV0gKiBzY2FsZSk7XG4gIG91dFsxMF0gPSBhWzEwXSArIChiWzEwXSAqIHNjYWxlKTtcbiAgb3V0WzExXSA9IGFbMTFdICsgKGJbMTFdICogc2NhbGUpO1xuICBvdXRbMTJdID0gYVsxMl0gKyAoYlsxMl0gKiBzY2FsZSk7XG4gIG91dFsxM10gPSBhWzEzXSArIChiWzEzXSAqIHNjYWxlKTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgKGJbMTRdICogc2NhbGUpO1xuICBvdXRbMTVdID0gYVsxNV0gKyAoYlsxNV0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJlxuICAgICAgICAgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XSAmJlxuICAgICAgICAgYVs4XSA9PT0gYls4XSAmJiBhWzldID09PSBiWzldICYmIGFbMTBdID09PSBiWzEwXSAmJiBhWzExXSA9PT0gYlsxMV0gJiZcbiAgICAgICAgIGFbMTJdID09PSBiWzEyXSAmJiBhWzEzXSA9PT0gYlsxM10gJiYgYVsxNF0gPT09IGJbMTRdICYmIGFbMTVdID09PSBiWzE1XTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgID0gYVswXSwgIGExICA9IGFbMV0sICBhMiAgPSBhWzJdLCAgYTMgID0gYVszXTtcbiAgbGV0IGE0ICA9IGFbNF0sICBhNSAgPSBhWzVdLCAgYTYgID0gYVs2XSwgIGE3ICA9IGFbN107XG4gIGxldCBhOCAgPSBhWzhdLCAgYTkgID0gYVs5XSwgIGExMCA9IGFbMTBdLCBhMTEgPSBhWzExXTtcbiAgbGV0IGExMiA9IGFbMTJdLCBhMTMgPSBhWzEzXSwgYTE0ID0gYVsxNF0sIGExNSA9IGFbMTVdO1xuXG4gIGxldCBiMCAgPSBiWzBdLCAgYjEgID0gYlsxXSwgIGIyICA9IGJbMl0sICBiMyAgPSBiWzNdO1xuICBsZXQgYjQgID0gYls0XSwgIGI1ICA9IGJbNV0sICBiNiAgPSBiWzZdLCAgYjcgID0gYls3XTtcbiAgbGV0IGI4ICA9IGJbOF0sICBiOSAgPSBiWzldLCAgYjEwID0gYlsxMF0sIGIxMSA9IGJbMTFdO1xuICBsZXQgYjEyID0gYlsxMl0sIGIxMyA9IGJbMTNdLCBiMTQgPSBiWzE0XSwgYjE1ID0gYlsxNV07XG5cbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTQgLSBiNCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNiAtIGI2KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTcgLSBiNykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE4IC0gYjgpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhOSAtIGI5KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTkpLCBNYXRoLmFicyhiOSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEwIC0gYjEwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEwKSwgTWF0aC5hYnMoYjEwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTEgLSBiMTEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTEpLCBNYXRoLmFicyhiMTEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExMiAtIGIxMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMiksIE1hdGguYWJzKGIxMikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEzIC0gYjEzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEzKSwgTWF0aC5hYnMoYjEzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTQgLSBiMTQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTQpLCBNYXRoLmFicyhiMTQpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExNSAtIGIxNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNSksIE1hdGguYWJzKGIxNSkpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWMzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXG4gKlxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIGxldCB4ID0gYlswXSAtIGFbMF07XG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IGxlbiA9IHgqeCArIHkqeSArIHoqejtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXTtcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gIGxldCBheCA9IGFbMF07XG4gIGxldCBheSA9IGFbMV07XG4gIGxldCBheiA9IGFbMl07XG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBoZXJtaXRlIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgbGV0IGZhY3RvcjEgPSBmYWN0b3JUaW1lczIgKiAoMiAqIHQgLSAzKSArIDE7XG4gIGxldCBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHQ7XG4gIGxldCBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKTtcbiAgbGV0IGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiAoMyAtIDIgKiB0KTtcblxuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBiZXppZXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmV6aWVyKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICBsZXQgaW52ZXJzZUZhY3RvciA9IDEgLSB0O1xuICBsZXQgaW52ZXJzZUZhY3RvclRpbWVzVHdvID0gaW52ZXJzZUZhY3RvciAqIGludmVyc2VGYWN0b3I7XG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgbGV0IGZhY3RvcjEgPSBpbnZlcnNlRmFjdG9yVGltZXNUd28gKiBpbnZlcnNlRmFjdG9yO1xuICBsZXQgZmFjdG9yMiA9IDMgKiB0ICogaW52ZXJzZUZhY3RvclRpbWVzVHdvO1xuICBsZXQgZmFjdG9yMyA9IDMgKiBmYWN0b3JUaW1lczIgKiBpbnZlcnNlRmFjdG9yO1xuICBsZXQgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqIHQ7XG5cbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcblxuICBsZXQgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgbGV0IHogPSAoZ2xNYXRyaXguUkFORE9NKCkgKiAyLjApIC0gMS4wO1xuICBsZXQgelNjYWxlID0gTWF0aC5zcXJ0KDEuMC16KnopICogc2NhbGU7XG5cbiAgb3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGU7XG4gIG91dFsxXSA9IE1hdGguc2luKHIpICogelNjYWxlO1xuICBvdXRbMl0gPSB6ICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gIGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xuICB3ID0gdyB8fCAxLjA7XG4gIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3O1xuICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gdztcbiAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKiBDYW4gYWxzbyBiZSB1c2VkIGZvciBkdWFsIHF1YXRlcm5pb25zLiAoTXVsdGlwbHkgaXQgd2l0aCB0aGUgcmVhbCBwYXJ0KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxuICAgIGxldCBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM107XG4gICAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XG4gICAgLy8gdmFyIHV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgYSk7XG4gICAgbGV0IHV2eCA9IHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgdXZ5ID0gcXogKiB4IC0gcXggKiB6LFxuICAgICAgICB1dnogPSBxeCAqIHkgLSBxeSAqIHg7XG4gICAgLy8gdmFyIHV1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIHV2KTtcbiAgICBsZXQgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnksXG4gICAgICAgIHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6LFxuICAgICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDtcbiAgICAvLyB2ZWMzLnNjYWxlKHV2LCB1diwgMiAqIHcpO1xuICAgIGxldCB3MiA9IHF3ICogMjtcbiAgICB1dnggKj0gdzI7XG4gICAgdXZ5ICo9IHcyO1xuICAgIHV2eiAqPSB3MjtcbiAgICAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcbiAgICB1dXZ4ICo9IDI7XG4gICAgdXV2eSAqPSAyO1xuICAgIHV1dnogKj0gMjtcbiAgICAvLyByZXR1cm4gdmVjMy5hZGQob3V0LCBhLCB2ZWMzLmFkZChvdXQsIHV2LCB1dXYpKTtcbiAgICBvdXRbMF0gPSB4ICsgdXZ4ICsgdXV2eDtcbiAgICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgICBvdXRbMl0gPSB6ICsgdXZ6ICsgdXV2ejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIGIsIGMpe1xuICBsZXQgcCA9IFtdLCByPVtdO1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBwWzJdID0gYVsyXSAtIGJbMl07XG5cbiAgLy9wZXJmb3JtIHJvdGF0aW9uXG4gIHJbMF0gPSBwWzBdO1xuICByWzFdID0gcFsxXSpNYXRoLmNvcyhjKSAtIHBbMl0qTWF0aC5zaW4oYyk7XG4gIHJbMl0gPSBwWzFdKk1hdGguc2luKGMpICsgcFsyXSpNYXRoLmNvcyhjKTtcblxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKXtcbiAgbGV0IHAgPSBbXSwgcj1bXTtcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xuXG4gIC8vcGVyZm9ybSByb3RhdGlvblxuICByWzBdID0gcFsyXSpNYXRoLnNpbihjKSArIHBbMF0qTWF0aC5jb3MoYyk7XG4gIHJbMV0gPSBwWzFdO1xuICByWzJdID0gcFsyXSpNYXRoLmNvcyhjKSAtIHBbMF0qTWF0aC5zaW4oYyk7XG5cbiAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgYiwgYyl7XG4gIGxldCBwID0gW10sIHI9W107XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTtcblxuICAvL3BlcmZvcm0gcm90YXRpb25cbiAgclswXSA9IHBbMF0qTWF0aC5jb3MoYykgLSBwWzFdKk1hdGguc2luKGMpO1xuICByWzFdID0gcFswXSpNYXRoLnNpbihjKSArIHBbMV0qTWF0aC5jb3MoYyk7XG4gIHJbMl0gPSBwWzJdO1xuXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgb3V0WzBdID0gclswXSArIGJbMF07XG4gIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICBsZXQgdGVtcEEgPSBmcm9tVmFsdWVzKGFbMF0sIGFbMV0sIGFbMl0pO1xuICBsZXQgdGVtcEIgPSBmcm9tVmFsdWVzKGJbMF0sIGJbMV0sIGJbMl0pO1xuXG4gIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpO1xuICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTtcblxuICBsZXQgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XG5cbiAgaWYoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgZWxzZSBpZihjb3NpbmUgPCAtMS4wKSB7XG4gICAgcmV0dXJuIE1hdGguUEk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXTtcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMztcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07XG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSkoKTtcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuXG4vKipcbiAqIDQgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbW9kdWxlIHZlYzRcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeiwgdykge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC8gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5jZWlsKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLmZsb29yKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICBvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5yb3VuZChhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICBsZXQgdyA9IGJbM10gLSBhWzNdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgbGV0IHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IHcgPSBhWzNdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgdyA9IGFbM107XG4gIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gLWFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gIG91dFswXSA9IDEuMCAvIGFbMF07XG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gIG91dFszXSA9IDEuMCAvIGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgdyA9IGFbM107XG4gIGxldCBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIG91dFswXSA9IHggKiBsZW47XG4gICAgb3V0WzFdID0geSAqIGxlbjtcbiAgICBvdXRbMl0gPSB6ICogbGVuO1xuICAgIG91dFszXSA9IHcgKiBsZW47XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICBsZXQgYXggPSBhWzBdO1xuICBsZXQgYXkgPSBhWzFdO1xuICBsZXQgYXogPSBhWzJdO1xuICBsZXQgYXcgPSBhWzNdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgdmVjdG9yU2NhbGUpIHtcbiAgdmVjdG9yU2NhbGUgPSB2ZWN0b3JTY2FsZSB8fCAxLjA7XG5cbiAgLy8gTWFyc2FnbGlhLCBHZW9yZ2UuIENob29zaW5nIGEgUG9pbnQgZnJvbSB0aGUgU3VyZmFjZSBvZiBhXG4gIC8vIFNwaGVyZS4gQW5uLiBNYXRoLiBTdGF0aXN0LiA0MyAoMTk3MiksIG5vLiAyLCA2NDUtLTY0Ni5cbiAgLy8gaHR0cDovL3Byb2plY3RldWNsaWQub3JnL2V1Y2xpZC5hb21zLzExNzc2OTI2NDQ7XG4gIHZhciB2MSwgdjIsIHYzLCB2NDtcbiAgdmFyIHMxLCBzMjtcbiAgZG8ge1xuICAgIHYxID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICB2MiA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgczEgPSB2MSAqIHYxICsgdjIgKiB2MjtcbiAgfSB3aGlsZSAoczEgPj0gMSk7XG4gIGRvIHtcbiAgICB2MyA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgdjQgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHMyID0gdjMgKiB2MyArIHY0ICogdjQ7XG4gIH0gd2hpbGUgKHMyID49IDEpO1xuXG4gIHZhciBkID0gTWF0aC5zcXJ0KCgxIC0gczEpIC8gczIpO1xuICBvdXRbMF0gPSBzY2FsZSAqIHYxO1xuICBvdXRbMV0gPSBzY2FsZSAqIHYyO1xuICBvdXRbMl0gPSBzY2FsZSAqIHYzICogZDtcbiAgb3V0WzNdID0gc2NhbGUgKiB2NCAqIGQ7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3O1xuICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gIGxldCBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM107XG5cbiAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgbGV0IGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xuICBsZXQgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gIGxldCBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeDtcbiAgbGV0IGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWM0cyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gNDtcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07IHZlY1szXSA9IGFbaSszXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07IGFbaSszXSA9IHZlY1szXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIlxuaW1wb3J0ICogYXMgbWF0MyBmcm9tIFwiLi9tYXQzLmpzXCJcbmltcG9ydCAqIGFzIHZlYzMgZnJvbSBcIi4vdmVjMy5qc1wiXG5pbXBvcnQgKiBhcyB2ZWM0IGZyb20gXCIuL3ZlYzQuanNcIlxuXG4vKipcbiAqIFF1YXRlcm5pb25cbiAqIEBtb2R1bGUgcXVhdFxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XG4gKlxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcbiAgcmFkID0gcmFkICogMC41O1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcm90YXRpb24gYXhpcyBhbmQgYW5nbGUgZm9yIGEgZ2l2ZW5cbiAqICBxdWF0ZXJuaW9uLiBJZiBhIHF1YXRlcm5pb24gaXMgY3JlYXRlZCB3aXRoXG4gKiAgc2V0QXhpc0FuZ2xlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgc2FtZVxuICogIHZhbHVlcyBhcyBwcm92aWRpZWQgaW4gdGhlIG9yaWdpbmFsIHBhcmFtZXRlciBsaXN0XG4gKiAgT1IgZnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdmFsdWVzLlxuICogRXhhbXBsZTogVGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5IGF4aXMgWzAsIDAsIDFdIGFuZFxuICogIGFuZ2xlIC05MCBpcyB0aGUgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBmb3JtZWQgYnlcbiAqICBbMCwgMCwgMV0gYW5kIDI3MC4gVGhpcyBtZXRob2QgZmF2b3JzIHRoZSBsYXR0ZXIuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXRfYXhpcyAgVmVjdG9yIHJlY2VpdmluZyB0aGUgYXhpcyBvZiByb3RhdGlvblxuICogQHBhcmFtICB7cXVhdH0gcSAgICAgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBBbmdsZSwgaW4gcmFkaWFucywgb2YgdGhlIHJvdGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBeGlzQW5nbGUob3V0X2F4aXMsIHEpIHtcbiAgbGV0IHJhZCA9IE1hdGguYWNvcyhxWzNdKSAqIDIuMDtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQgLyAyLjApO1xuICBpZiAocyAhPSAwLjApIHtcbiAgICBvdXRfYXhpc1swXSA9IHFbMF0gLyBzO1xuICAgIG91dF9heGlzWzFdID0gcVsxXSAvIHM7XG4gICAgb3V0X2F4aXNbMl0gPSBxWzJdIC8gcztcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiBzIGlzIHplcm8sIHJldHVybiBhbnkgYXhpcyAobm8gcm90YXRpb24gLSBheGlzIGRvZXMgbm90IG1hdHRlcilcbiAgICBvdXRfYXhpc1swXSA9IDE7XG4gICAgb3V0X2F4aXNbMV0gPSAwO1xuICAgIG91dF9heGlzWzJdID0gMDtcbiAgfVxuICByZXR1cm4gcmFkO1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcblxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gIG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4O1xuICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieSA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG5cbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ6ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICBvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVcob3V0LCBhKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IE1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xuICAvLyBiZW5jaG1hcmtzOlxuICAvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gIGxldCBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcblxuICAvLyBjYWxjIGNvc2luZVxuICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XG4gIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICBpZiAoIGNvc29tIDwgMC4wICkge1xuICAgIGNvc29tID0gLWNvc29tO1xuICAgIGJ4ID0gLSBieDtcbiAgICBieSA9IC0gYnk7XG4gICAgYnogPSAtIGJ6O1xuICAgIGJ3ID0gLSBidztcbiAgfVxuICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gIGlmICggKDEuMCAtIGNvc29tKSA+IDAuMDAwMDAxICkge1xuICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgIG9tZWdhICA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgc2lub20gID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgIHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tO1xuICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcbiAgfSBlbHNlIHtcbiAgICAvLyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlXG4gICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgIHNjYWxlMCA9IDEuMCAtIHQ7XG4gICAgc2NhbGUxID0gdDtcbiAgfVxuICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXG4gIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcbiAgbGV0IGRvdCA9IGEwKmEwICsgYTEqYTEgKyBhMiphMiArIGEzKmEzO1xuICBsZXQgaW52RG90ID0gZG90ID8gMS4wL2RvdCA6IDA7XG5cbiAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICBvdXRbMV0gPSAtYTEqaW52RG90O1xuICBvdXRbMl0gPSAtYTIqaW52RG90O1xuICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxuICpcbiAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQzKG91dCwgbSkge1xuICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgbGV0IGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgbGV0IGZSb290O1xuXG4gIGlmICggZlRyYWNlID4gMC4wICkge1xuICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICBmUm9vdCA9IDAuNS9mUm9vdDsgIC8vIDEvKDR3KVxuICAgIG91dFswXSA9IChtWzVdLW1bN10pKmZSb290O1xuICAgIG91dFsxXSA9IChtWzZdLW1bMl0pKmZSb290O1xuICAgIG91dFsyXSA9IChtWzFdLW1bM10pKmZSb290O1xuICB9IGVsc2Uge1xuICAgIC8vIHx3fCA8PSAxLzJcbiAgICBsZXQgaSA9IDA7XG4gICAgaWYgKCBtWzRdID4gbVswXSApXG4gICAgICBpID0gMTtcbiAgICBpZiAoIG1bOF0gPiBtW2kqMytpXSApXG4gICAgICBpID0gMjtcbiAgICBsZXQgaiA9IChpKzEpJTM7XG4gICAgbGV0IGsgPSAoaSsyKSUzO1xuXG4gICAgZlJvb3QgPSBNYXRoLnNxcnQobVtpKjMraV0tbVtqKjMral0tbVtrKjMra10gKyAxLjApO1xuICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgb3V0WzNdID0gKG1baiozK2tdIC0gbVtrKjMral0pICogZlJvb3Q7XG4gICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3l9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWSBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIHgsIHksIHopIHtcbiAgICBsZXQgaGFsZlRvUmFkID0gMC41ICogTWF0aC5QSSAvIDE4MC4wO1xuICAgIHggKj0gaGFsZlRvUmFkO1xuICAgIHkgKj0gaGFsZlRvUmFkO1xuICAgIHogKj0gaGFsZlRvUmFkO1xuXG4gICAgbGV0IHN4ID0gTWF0aC5zaW4oeCk7XG4gICAgbGV0IGN4ID0gTWF0aC5jb3MoeCk7XG4gICAgbGV0IHN5ID0gTWF0aC5zaW4oeSk7XG4gICAgbGV0IGN5ID0gTWF0aC5jb3MoeSk7XG4gICAgbGV0IHN6ID0gTWF0aC5zaW4oeik7XG4gICAgbGV0IGN6ID0gTWF0aC5jb3Moeik7XG5cbiAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gY2xvbmVcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZG90ID0gdmVjNC5kb3Q7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBjb25zdCBsZW5ndGggPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4YWN0RXF1YWxzID0gdmVjNC5leGFjdEVxdWFscztcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVxdWFscyA9IHZlYzQuZXF1YWxzO1xuXG4vKipcbiAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcbiAqIHZlY3RvciB0byBhbm90aGVyLlxuICpcbiAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIGRlc3RpbmF0aW9uIHZlY3RvclxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3Qgcm90YXRpb25UbyA9IChmdW5jdGlvbigpIHtcbiAgbGV0IHRtcHZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xuICBsZXQgeFVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDEsMCwwKTtcbiAgbGV0IHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLDEsMCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIGxldCBkb3QgPSB2ZWMzLmRvdChhLCBiKTtcbiAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XG4gICAgICBpZiAodmVjMy5sZW4odG1wdmVjMykgPCAwLjAwMDAwMSlcbiAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICBzZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgb3V0WzBdID0gMDtcbiAgICAgIG91dFsxXSA9IDA7XG4gICAgICBvdXRbMl0gPSAwO1xuICAgICAgb3V0WzNdID0gMTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgYSwgYik7XG4gICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xuICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcbiAgICAgIG91dFsyXSA9IHRtcHZlYzNbMl07XG4gICAgICBvdXRbM10gPSAxICsgZG90O1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgfVxuICB9O1xufSkoKTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gZCB0aGUgZm91cnRoIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGNvbnN0IHNxbGVycCA9IChmdW5jdGlvbiAoKSB7XG4gIGxldCB0ZW1wMSA9IGNyZWF0ZSgpO1xuICBsZXQgdGVtcDIgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICAgIHNsZXJwKHRlbXAxLCBhLCBkLCB0KTtcbiAgICBzbGVycCh0ZW1wMiwgYiwgYywgdCk7XG4gICAgc2xlcnAob3V0LCB0ZW1wMSwgdGVtcDIsIDIgKiB0ICogKDEgLSB0KSk7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9O1xufSgpKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3Qgc2V0QXhlcyA9IChmdW5jdGlvbigpIHtcbiAgbGV0IG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbihvdXQsIHZpZXcsIHJpZ2h0LCB1cCkge1xuICAgIG1hdHJbMF0gPSByaWdodFswXTtcbiAgICBtYXRyWzNdID0gcmlnaHRbMV07XG4gICAgbWF0cls2XSA9IHJpZ2h0WzJdO1xuXG4gICAgbWF0clsxXSA9IHVwWzBdO1xuICAgIG1hdHJbNF0gPSB1cFsxXTtcbiAgICBtYXRyWzddID0gdXBbMl07XG5cbiAgICBtYXRyWzJdID0gLXZpZXdbMF07XG4gICAgbWF0cls1XSA9IC12aWV3WzFdO1xuICAgIG1hdHJbOF0gPSAtdmlld1syXTtcblxuICAgIHJldHVybiBub3JtYWxpemUob3V0LCBmcm9tTWF0MyhvdXQsIG1hdHIpKTtcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWMyXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXG4gKlxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5KSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNlaWxcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kIChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgeSA9IGJbMV0gLSBhWzFdO1xuICByZXR1cm4geCp4ICsgeSp5O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aCAoYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIHJldHVybiB4KnggKyB5Knk7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICB2YXIgbGVuID0geCp4ICsgeSp5O1xuICBpZiAobGVuID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gIG91dFswXSA9IG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdLFxuICAgIGF5ID0gYVsxXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcbiAgdmFyIHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gIG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGU7XG4gIG91dFsxXSA9IE1hdGguc2luKHIpICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgMkQgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzJcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgdmVjMiBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCBiLCBjKSB7XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgbGV0IHAwID0gYVswXSAtIGJbMF0sXG4gIHAxID0gYVsxXSAtIGJbMV0sXG4gIHNpbkMgPSBNYXRoLnNpbihjKSxcbiAgY29zQyA9IE1hdGguY29zKGMpO1xuICBcbiAgLy9wZXJmb3JtIHJvdGF0aW9uIGFuZCB0cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSBwMCpjb3NDIC0gcDEqc2luQyArIGJbMF07XG4gIG91dFsxXSA9IHAwKnNpbkMgKyBwMSpjb3NDICsgYlsxXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gMkQgdmVjdG9yc1xuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICBsZXQgeDEgPSBhWzBdLFxuICAgIHkxID0gYVsxXSxcbiAgICB4MiA9IGJbMF0sXG4gICAgeTIgPSBiWzFdO1xuICBcbiAgbGV0IGxlbjEgPSB4MSp4MSArIHkxKnkxO1xuICBpZiAobGVuMSA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbjEgPSAxIC8gTWF0aC5zcXJ0KGxlbjEpO1xuICB9XG4gIFxuICBsZXQgbGVuMiA9IHgyKngyICsgeTIqeTI7XG4gIGlmIChsZW4yID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuMiA9IDEgLyBNYXRoLnNxcnQobGVuMik7XG4gIH1cbiAgXG4gIGxldCBjb3NpbmUgPSAoeDEgKiB4MiArIHkxICogeTIpICogbGVuMSAqIGxlbjI7XG4gIFxuICBcbiAgaWYoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgZWxzZSBpZihjb3NpbmUgPCAtMS4wKSB7XG4gICAgcmV0dXJuIE1hdGguUEk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnKSc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdO1xuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV07XG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGl2ID0gZGl2aWRlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGlzdCA9IGRpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzJzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzIuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgbGV0IGksIGw7XG4gICAgaWYoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMjtcbiAgICB9XG5cbiAgICBpZighb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbi8vIHB2dFxuZnVuY3Rpb24gbm9ybWFsaXplKGFycmF5KSB7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhcbiAgICAgICAgYXJyYXlbMF0gLyAyNTUsXG4gICAgICAgIGFycmF5WzFdIC8gMjU1LFxuICAgICAgICBhcnJheVsyXSAvIDI1NSxcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4SW50VG9SZ2IoaGV4KSB7XG4gICAgY29uc3QgciA9IGhleCA+PiAxNjtcbiAgICBjb25zdCBnID0gaGV4ID4+IDggJiAweEZGOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgY29uc3QgYiA9IGhleCAmIDB4RkY7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhyLCBnLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleFN0cmluZ1RvUmdiKGhleCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHJldHVybiByZXN1bHQgPyB2ZWMzLmZyb21WYWx1ZXMoXG4gICAgICAgIHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgICBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcbiAgICAgICAgcGFyc2VJbnQocmVzdWx0WzNdLCAxNiksXG4gICAgKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgaGV4UiA9IGNvbXBvbmVudFRvSGV4KHIpO1xuICAgIGNvbnN0IGhleEcgPSBjb21wb25lbnRUb0hleChnKTtcbiAgICBjb25zdCBoZXhCID0gY29tcG9uZW50VG9IZXgoYik7XG4gICAgcmV0dXJuIGAjJHtoZXhSfSR7aGV4R30ke2hleEJ9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoaGV4KSB7XG4gICAgY29uc3QgY29sb3IgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIGNvbnN0IHJnYiA9IHR5cGVvZiBoZXggPT09ICdudW1iZXInID8gaGV4SW50VG9SZ2IoaGV4KSA6IGhleFN0cmluZ1RvUmdiKGhleCk7XG4gICAgdmVjMy5jb3B5KGNvbG9yLCBub3JtYWxpemUocmdiKSk7XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kKG0sIG4pIHtcbiAgICByZXR1cm4gKChtICUgbikgKyBuKSAlIG47XG59XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IFdPUkRfUkVHWCA9ICh3b3JkKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYFxcXFxiJHt3b3JkfVxcXFxiYCwgJ2dpJyk7XG59O1xuXG5jb25zdCBMSU5FX1JFR1ggPSAod29yZCkgPT4ge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGAke3dvcmR9YCwgJ2dpJyk7XG59O1xuXG5jb25zdCBWRVJURVggPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAnYXR0cmlidXRlJyxcbiAgICB9LCB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ291dCcpLFxuICAgICAgICByZXBsYWNlOiAndmFyeWluZycsXG4gICAgfSxcbl07XG5cbmNvbnN0IEZSQUdNRU5UID0gW1xuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnaW4nKSxcbiAgICAgICAgcmVwbGFjZTogJ3ZhcnlpbmcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IExJTkVfUkVHWCgnb3V0IHZlYzQgb3V0Q29sb3I7JyksXG4gICAgICAgIHJlcGxhY2U6ICcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0Q29sb3InKSxcbiAgICAgICAgcmVwbGFjZTogJ2dsX0ZyYWdDb2xvcicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlUHJvaicpLFxuICAgICAgICByZXBsYWNlOiAndGV4dHVyZTJEUHJvaicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlJyksXG4gICAgICAgIHJlcGxhY2Uoc2hhZGVyKSB7XG4gICAgICAgICAgICAvLyBGaW5kIGFsbCB0ZXh0dXJlIGRlZmludGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVHbG9iYWxSZWd4ID0gbmV3IFJlZ0V4cCgnXFxcXGJ0ZXh0dXJlXFxcXGInLCAnZ2knKTtcblxuICAgICAgICAgICAgLy8gRmluZCBzaW5nbGUgdGV4dHVyZSBkZWZpbml0aW9uXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlU2luZ2xlUmVneCA9IG5ldyBSZWdFeHAoJ1xcXFxidGV4dHVyZVxcXFxiJywgJ2knKTtcblxuICAgICAgICAgICAgLy8gR2V0cyB0aGUgdGV4dHVyZSBjYWxsIHNpZ25hdHVyZSBlLmcgdGV4dHVyZSh1VGV4dHVyZTEsIHZVdik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4ID0gbmV3IFJlZ0V4cCgvdGV4dHVyZVxcKChbXildKylcXCkvLCAnaScpO1xuXG4gICAgICAgICAgICAvLyBHZXQgYWxsIG1hdGNoaW5nIG9jY3VyYW5jZXNcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBzaGFkZXIubWF0Y2godGV4dHVyZUdsb2JhbFJlZ3gpO1xuICAgICAgICAgICAgbGV0IHJlcGxhY2VtZW50ID0gJyc7XG5cbiAgICAgICAgICAgIC8vIElmIG5vdGhpbmcgbWF0Y2hlcyByZXR1cm5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSByZXR1cm4gc2hhZGVyO1xuXG4gICAgICAgICAgICAvLyBSZXBsYWNlIGVhY2ggb2NjdXJhbmNlIGJ5IGl0J3MgdW5pZm9ybSB0eXBlXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IHNoYWRlci5tYXRjaCh0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4KVswXTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pZm9ybU5hbWUgPSBtYXRjaC5yZXBsYWNlKCd0ZXh0dXJlKCcsICcnKS5zcGxpdCgnLCcpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdW5pZm9ybVR5cGUgPSBzaGFkZXIubWF0Y2goYCguKj8pICR7dW5pZm9ybU5hbWV9YCwgJ2knKVsxXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtVHlwZSA9IHVuaWZvcm1UeXBlLnNwbGl0KCcgJylbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh1bmlmb3JtVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSAndGV4dHVyZTJEJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyQ3ViZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudCA9ICd0ZXh0dXJlQ3ViZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNoYWRlciA9IHNoYWRlci5yZXBsYWNlKHRleHR1cmVTaW5nbGVSZWd4LCByZXBsYWNlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlICovXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgICB9LFxuICAgIH1dO1xuXG5jb25zdCBHRU5FUklDID0gW3tcbiAgICBtYXRjaDogTElORV9SRUdYKCcjdmVyc2lvbiAzMDAgZXMnKSxcbiAgICByZXBsYWNlOiAnJyxcbn1dO1xuXG5jb25zdCBWRVJURVhfUlVMRVMgPSBbLi4uR0VORVJJQywgLi4uVkVSVEVYXTtcbmNvbnN0IEZSQUdNRU5UX1JVTEVTID0gWy4uLkdFTkVSSUMsIC4uLkZSQUdNRU5UXTtcblxuLy8gY29uc3QgdHJhbnNmb3JtID0gKGNvZGUpID0+IHtcbi8vICAgICByZXR1cm4gY29kZVxuLy8gICAgICAgICAvLyByZW1vdmVzIC8vXG4vLyAgICAgICAgIC5yZXBsYWNlKC9bIFxcdF0qXFwvXFwvLipcXG4vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZSAvKiAqL1xuLy8gICAgICAgICAucmVwbGFjZSgvWyBcXHRdKlxcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZXMgbXVsdGlwbGUgd2hpdGUgc3BhY2VzXG4vLyAgICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJHxcXHMrKD89XFxzKS9nLCAnJyk7XG4vLyB9O1xuXG4vKipcbiAqIFJlcGxhY2VzIGVzMzAwIHN5bnRheCB0byBlczEwMFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShzaGFkZXIsIHNoYWRlclR5cGUpIHtcbiAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9XG5cbiAgICBjb25zdCBydWxlcyA9IHNoYWRlclR5cGUgPT09ICd2ZXJ0ZXgnID8gVkVSVEVYX1JVTEVTIDogRlJBR01FTlRfUlVMRVM7XG4gICAgcnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJ1bGUucmVwbGFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc2hhZGVyID0gcnVsZS5yZXBsYWNlKHNoYWRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGFkZXIgPSBzaGFkZXIucmVwbGFjZShydWxlLm1hdGNoLCBydWxlLnJlcGxhY2UpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2hhZGVyO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNsYXNzIFZlY3RvcjMge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDApIHtcbiAgICAgICAgdGhpcy5kYXRhID0gdmVjMy5mcm9tVmFsdWVzKHgsIHksIHopO1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgfVxuXG4gICAgc2V0IHgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XG4gICAgfVxuXG4gICAgc2V0IHkodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XG4gICAgfVxuXG4gICAgc2V0IHoodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kYXRhWzJdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3IzO1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCwgcXVhdCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL3ZlY3RvcjMnO1xuXG5sZXQgdXVpZCA9IDA7XG5sZXQgYXhpc0FuZ2xlID0gMDtcbmNvbnN0IHF1YXRlcm5pb25BeGlzQW5nbGUgPSB2ZWMzLmNyZWF0ZSgpO1xuXG5jbGFzcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy51aWQgPSB1dWlkKys7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzKCk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXcgVmVjdG9yMygpO1xuICAgICAgICB0aGlzLnNjYWxlID0gbmV3IFZlY3RvcjMoMSwgMSwgMSk7XG5cbiAgICAgICAgdGhpcy5fdHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uID0gcXVhdC5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMudXAgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMCk7XG4gICAgICAgIHRoaXMubG9va1RvVGFyZ2V0ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5tYXRyaWNlcyA9IHtcbiAgICAgICAgICAgIHBhcmVudDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIG1vZGVsOiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgbG9va0F0OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlydHkgPSB7XG4gICAgICAgICAgICBzb3J0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgc2hhZGVyOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXQgdHJhbnNwYXJlbnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS50cmFuc3BhcmVudCA9IHRoaXMudHJhbnNwYXJlbnQgIT09IHZhbHVlO1xuICAgICAgICB0aGlzLl90cmFuc3BhcmVudCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB0cmFuc3BhcmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zcGFyZW50O1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRoaXMudmlzaWJsZSAhPT0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3Zpc2libGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdmlzaWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cmljZXMoKSB7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5wYXJlbnQpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubW9kZWwpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgcXVhdC5pZGVudGl0eSh0aGlzLnF1YXRlcm5pb24pO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgbWF0NC5jb3B5KHRoaXMubWF0cmljZXMucGFyZW50LCB0aGlzLnBhcmVudC5tYXRyaWNlcy5tb2RlbCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMucGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvb2tUb1RhcmdldCkge1xuICAgICAgICAgICAgbWF0NC50YXJnZXRUbyh0aGlzLm1hdHJpY2VzLmxvb2tBdCwgdGhpcy5wb3NpdGlvbi5kYXRhLCB0aGlzLnRhcmdldCwgdGhpcy51cCk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubG9va0F0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMucG9zaXRpb24uZGF0YSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVgodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueCk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVkodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVoodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueik7XG4gICAgICAgICAgICBheGlzQW5nbGUgPSBxdWF0LmdldEF4aXNBbmdsZShxdWF0ZXJuaW9uQXhpc0FuZ2xlLCB0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICAgICAgbWF0NC5yb3RhdGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgYXhpc0FuZ2xlLCBxdWF0ZXJuaW9uQXhpc0FuZ2xlKTtcbiAgICAgICAgfVxuICAgICAgICBtYXQ0LnNjYWxlKHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMubWF0cmljZXMubW9kZWwsIHRoaXMuc2NhbGUuZGF0YSk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgLy8gdG8gYmUgb3ZlcnJpZGVuO1xuICAgIH1cblxuICAgIGFkZChtb2RlbCkge1xuICAgICAgICBtb2RlbC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobW9kZWwpO1xuICAgICAgICB0aGlzLmRpcnR5LnNvcnRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlbW92ZShtb2RlbCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihtb2RlbCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmF2ZXJzZShvYmplY3QpIHtcbiAgICAgICAgLy8gaWYgdHJhdmVyc2VkIG9iamVjdCBpcyB0aGUgc2NlbmVcbiAgICAgICAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYmplY3QgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zY2VuZUdyYXBoU29ydGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2JqZWN0LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRyYXZlcnNlKG9iamVjdC5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0LnBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgb2JqZWN0LnVwZGF0ZU1hdHJpY2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFXG4gICAgICAgIC8vIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UsIHdlIGFsc28gY2hlY2sgaWYgdGhlIG9iamVjdHMgYXJlIGRpcnR5IHdoZW4gd2UgdHJhdmVyc2UgdGhlbS5cbiAgICAgICAgLy8gdGhpcyBhdm9pZHMgaGF2aW5nIGEgc2Vjb25kIGxvb3AgdGhyb3VnaCB0aGUgZ3JhcGggc2NlbmUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIGFueSBlbGVtZW50IGdldHMgYWRkZWQgLyByZW1vdmVkIGZyb20gc2NlbmVcbiAgICAgICAgLy8gb3IgaWYgaXRzIHRyYW5zcGFyZW5jeSBjaGFuZ2VzLCB3ZSBuZWVkIHRvIHNvcnQgdGhlbSBhZ2FpbiBpbnRvXG4gICAgICAgIC8vIG9wYXF1ZSAvIHRyYW5zcGFyZW50IGFycmF5c1xuICAgICAgICBpZiAob2JqZWN0LmRpcnR5LnNvcnRpbmcgfHxcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2NlbmVHcmFwaFNvcnRlcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdDM7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIE9ydGhvZ3JhcGhpY0NhbWVyYSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBsZWZ0OiAtMSxcbiAgICAgICAgICAgIHJpZ2h0OiAxLFxuICAgICAgICAgICAgdG9wOiAxLFxuICAgICAgICAgICAgYm90dG9tOiAtMSxcbiAgICAgICAgICAgIG5lYXI6IC0xMDAwLFxuICAgICAgICAgICAgZmFyOiAxMDAwLFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGVzIHByb2plY3Rpb24gbWF0cml4XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbnVtYmVycyBhcmUgYXBwcm94aW1hdGVseSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHVwZGF0ZUNhbWVyYU1hdHJpeCgpIHtcbiAgICAgICAgLy8gbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXJcbiAgICAgICAgbWF0NC5vcnRobyhcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRoaXMucmlnaHQsXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSxcbiAgICAgICAgICAgIHRoaXMudG9wLFxuICAgICAgICAgICAgdGhpcy5uZWFyLFxuICAgICAgICAgICAgdGhpcy5mYXIsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcnRob2dyYXBoaWNDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgICAgICBmb3Y6IDM1LFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgdGhpcy5mb3YgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICAgICAgICB3aWR0aCAvIGhlaWdodCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyc3BlY3RpdmVDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFVCTywgRk9HLCBFWFRFTlNJT05TIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0JBU0lDLCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQmFzaWMge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSBwcm9wcy5jb2xvciB8fCB2ZWMzLmZyb21WYWx1ZXMoMSwgMSwgMSk7XG5cbiAgICAgICAgY29uc3QgdmVydGV4ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLnZlcnRleCgpfVxuXG4gICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gdmVjMyB1X2NvbG9yO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgYmFzZSA9IHZlYzQodV9jb2xvciwgMS4wKTtcblxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuXG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHR5cGU6IFNIQURFUl9CQVNJQyxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfY29sb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlYzMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29sb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBtYWdGaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KFsyNTUsIDI1NSwgMjU1LCAyNTVdKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIDEsIDEsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5tYWdGaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5taW5GaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLndyYXBTKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgdGhpcy53cmFwVCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZnJvbUltYWdlKHVybCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShpbWcpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgIH1cblxuICAgIHVwZGF0ZShpbWFnZSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBMSUdIVCwgRk9HLCBDTElQUElORywgRVhURU5TSU9OUywgU0hBRE9XIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0RFRkFVTFQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBEZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgLy8gbWFwOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vNjIwNjc4L3JlZC5qcGcnLlxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRleHR1cmU6IG5ldyBUZXh0dXJlKClcbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cbiAgICAgICAgICAgICR7U0hBRE9XLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcbiAgICAgICAgICAgIG91dCB2ZWMzIHZfbm9ybWFsO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogd29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgZnJhZ1ZlcnRleEVjID0gcG9zaXRpb24ueHl6OyAvLyB3b3JsZFBvc2l0aW9uLnh5ejtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgICAgICB2X25vcm1hbCA9IChub3JtYWxNYXRyaXggKiB2ZWM0KGFfbm9ybWFsLCAxLjApKS54eXo7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuICAgICAgICAgICAgaW4gdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgdV9jb2xvcjtcblxuICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyB2X25vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KGZyYWdWZXJ0ZXhFYyksIGRGZHkoZnJhZ1ZlcnRleEVjKSkpO1xuXG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gdmVjNCh1X2NvbG9yLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKj0gdGV4dHVyZSh1X21hcCwgdl91dik7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy5mcmFnbWVudCgpfVxuICAgICAgICAgICAgICAgICR7TElHSFQuZmFjdG9yeSgpfVxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfREVGQVVMVCxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzYW1wbGVyMkQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgdV9jb2xvcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjMycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb2xvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0O1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vY29yZS90ZXh0dXJlJztcbmltcG9ydCB7IFVCTywgRVhURU5TSU9OUyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9CSUxMQk9BUkQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBCaWxsYm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgVGV4dHVyZSgpO1xuXG4gICAgICAgIGlmIChwcm9wcy5tYXApIHtcbiAgICAgICAgICAgIHRoaXMubWFwLmZyb21JbWFnZShwcm9wcy5tYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfbWFwO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIC8vIGRlcHRoIG1hcFxuICAgICAgICAgICAgICAgIGZsb2F0IHogPSB0ZXh0dXJlKHVfbWFwLCB2X3V2KS5yO1xuICAgICAgICAgICAgICAgIGZsb2F0IG4gPSAxLjA7XG4gICAgICAgICAgICAgICAgZmxvYXQgZiA9IDEwMDAuMDtcbiAgICAgICAgICAgICAgICBmbG9hdCBjID0gKDIuMCAqIG4pIC8gKGYgKyBuIC0geiAqIChmIC0gbikpO1xuXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBkZXB0aFxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gdmVjNChjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfQklMTEJPQVJELFxuICAgICAgICAgICAgbW9kZTogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2FtcGxlcjJEJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubWFwLnRleHR1cmUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmlsbGJvYXJkO1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vY29yZS90ZXh0dXJlJztcbmltcG9ydCB7IFVCTywgRk9HLCBDTElQUElORywgRVhURU5TSU9OUyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9TRU0gfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBTZW0ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgVGV4dHVyZSh7IHRyYW5zcGFyZW50OiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChwcm9wcy5tYXApIHtcbiAgICAgICAgICAgIHRoaXMubWFwLmZyb21JbWFnZShwcm9wcy5tYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGV4dHVyZTogbmV3IFRleHR1cmUoKVxuICAgICAgICBpZiAocHJvcHMudGV4dHVyZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAgPSBwcm9wcy50ZXh0dXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmVydGV4ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLnZlcnRleCgpfVxuXG4gICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG4gICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xuICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cbiAgICAgICAgICAgICR7Q0xJUFBJTkcudmVydGV4X3ByZSgpfVxuXG4gICAgICAgICAgICBvdXQgdmVjMiB2X3V2O1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBwb3NpdGlvbjtcblxuICAgICAgICAgICAgICAgIHZlYzMgdl9lID0gdmVjMyhwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdmVjMyB2X24gPSBtYXQzKHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCkgKiBhX25vcm1hbDtcbiAgICAgICAgICAgICAgICB2ZWMzIHIgPSByZWZsZWN0KG5vcm1hbGl6ZSh2X2UpLCBub3JtYWxpemUodl9uKSk7XG4gICAgICAgICAgICAgICAgZmxvYXQgbSA9IDIuMCAqIHNxcnQocG93KHIueCwgMi4wKSArIHBvdyhyLnksIDIuMCkgKyBwb3coci56ICsgMS4wLCAyLjApKTtcbiAgICAgICAgICAgICAgICB2X3V2ID0gci54eSAvIG0gKyAwLjU7XG5cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzIgdl91djtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuXG4gICAgICAgICAgICAgICAgYmFzZSArPSB0ZXh0dXJlKHVfbWFwLCB2X3V2KTtcblxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfU0VNLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdV9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NhbXBsZXIyRCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1hcC50ZXh0dXJlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbTtcbiIsImNvbnN0IFBST0dSQU1fUE9PTCA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVTaGFkZXIoZ2wsIHN0ciwgdHlwZSkge1xuICAgIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHN0cik7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgY29uc3QgY29tcGlsZWQgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyk7XG5cbiAgICBpZiAoIWNvbXBpbGVkKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihzaGFkZXIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLCBzdHIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVQcm9ncmFtID0gKGdsLCB2ZXJ0ZXgsIGZyYWdtZW50LCBwcm9ncmFtSUQpID0+IHtcbiAgICBjb25zdCBwb29sID0gUFJPR1JBTV9QT09MW2Bwb29sXyR7cHJvZ3JhbUlEfWBdO1xuICAgIGlmICghcG9vbCkge1xuICAgICAgICBjb25zdCB2cyA9IGNyZWF0ZVNoYWRlcihnbCwgdmVydGV4LCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgY29uc3QgZnMgPSBjcmVhdGVTaGFkZXIoZ2wsIGZyYWdtZW50LCBnbC5GUkFHTUVOVF9TSEFERVIpO1xuXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG5cbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgUFJPR1JBTV9QT09MW2Bwb29sXyR7cHJvZ3JhbUlEfWBdID0gcHJvZ3JhbTtcblxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9vbDtcbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFVibyB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgYm91bmRMb2NhdGlvbikge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgdGhpcy5ib3VuZExvY2F0aW9uID0gYm91bmRMb2NhdGlvbjtcblxuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5kYXRhLCBnbC5TVEFUSUNfRFJBVyk7IC8vIERZTkFNSUNfRFJBV1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYm91bmRMb2NhdGlvbiwgdGhpcy5idWZmZXIpO1xuICAgICAgICAvLyBnbC5iaW5kQnVmZmVyQmFzZShnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7IC8vIE1BWUJFP1xuICAgIH1cblxuICAgIHVwZGF0ZShkYXRhLCBvZmZzZXQgPSAwKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIHRoaXMuZGF0YS5zZXQoZGF0YSwgb2Zmc2V0KTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIDAsIHRoaXMuZGF0YSwgMCwgbnVsbCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVWJvO1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgVmFvIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLnZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnZhbyA9IHN1cHBvcnRzKCkudmVydGV4QXJyYXlPYmplY3QuY3JlYXRlVmVydGV4QXJyYXlPRVMoKTtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5iaW5kVmVydGV4QXJyYXlPRVMobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIGdsLmRlbGV0ZVZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuZGVsZXRlVmVydGV4QXJyYXlPRVModGhpcy52YW8pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFvID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZhbztcbiIsImV4cG9ydCBjb25zdCBnZXRUeXBlU2l6ZSA9ICh0eXBlKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnZmxvYXQnOlxuICAgICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndmVjMyc6XG4gICAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ3ZlYzQnOlxuICAgIGNhc2UgJ21hdDInOlxuICAgICAgICByZXR1cm4gNDtcbiAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgcmV0dXJuIDk7XG4gICAgY2FzZSAnbWF0NCc6XG4gICAgICAgIHJldHVybiAxNjtcbiAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt0eXBlfVwiIGlzIGFuIHVua25vd24gdHlwZWApO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgaW5pdEF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcywgcHJvZ3JhbSkgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGF0dHJpYnV0ZXNbcHJvcF07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgcHJvcCk7XG5cbiAgICAgICAgbGV0IGIgPSBjdXJyZW50LmJ1ZmZlcjtcbiAgICAgICAgaWYgKCFjdXJyZW50LmJ1ZmZlcikge1xuICAgICAgICAgICAgYiA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgY3VycmVudC52YWx1ZSwgZ2wuU1RBVElDX0RSQVcpOyAvLyBvciBEWU5BTUlDX0RSQVdcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oY3VycmVudCwge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXI6IGIsXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBiaW5kQXR0cmlidXRlcyA9IChhdHRyaWJ1dGVzKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgaW5zdGFuY2VkLFxuICAgICAgICB9ID0gYXR0cmlidXRlc1trZXldO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgc2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgZGl2aXNvciA9IGluc3RhbmNlZCA/IDEgOiAwO1xuICAgICAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcihsb2NhdGlvbiwgZGl2aXNvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRzKCkuaW5zdGFuY2VkQXJyYXlzLnZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRShsb2NhdGlvbiwgZGl2aXNvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcykgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9ID0gYXR0cmlidXRlc1trZXldO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xuICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZhbHVlLCBnbC5EWU5BTUlDX0RSQVcpO1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJy4uL3Nlc3Npb24nO1xuXG5leHBvcnQgY29uc3QgaW5pdFVuaWZvcm1zID0gKHVuaWZvcm1zLCBwcm9ncmFtKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICBjb25zdCB0ZXh0dXJlSW5kaWNlcyA9IFtcbiAgICAgICAgZ2wuVEVYVFVSRTAsXG4gICAgICAgIGdsLlRFWFRVUkUxLFxuICAgICAgICBnbC5URVhUVVJFMixcbiAgICAgICAgZ2wuVEVYVFVSRTMsXG4gICAgICAgIGdsLlRFWFRVUkU0LFxuICAgICAgICBnbC5URVhUVVJFNSxcbiAgICBdO1xuXG4gICAgbGV0IGkgPSAwO1xuXG4gICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHVuaWZvcm1zW3Byb3BdO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBwcm9wKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGN1cnJlbnQsIHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY3VycmVudC50eXBlID09PSAnc2FtcGxlcjJEJykge1xuICAgICAgICAgICAgY3VycmVudC50ZXh0dXJlSW5kZXggPSBpO1xuICAgICAgICAgICAgY3VycmVudC5hY3RpdmVUZXh0dXJlID0gdGV4dHVyZUluZGljZXNbaV07XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVVbmlmb3JtcyA9ICh1bmlmb3JtcykgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdW5pZm9ybSA9IHVuaWZvcm1zW2tleV07XG5cbiAgICAgICAgc3dpdGNoICh1bmlmb3JtLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbWF0NCc6XG4gICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYodW5pZm9ybS5sb2NhdGlvbiwgZmFsc2UsIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZlYzQnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybTRmdih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm0zZnYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICBnbC51bmlmb3JtMmZ2KHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm0xZih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZSh1bmlmb3JtLmFjdGl2ZVRleHR1cmUpO1xuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBnbC51bmlmb3JtMWkodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS50ZXh0dXJlSW5kZXgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt1bmlmb3JtLnR5cGV9XCIgaXMgYW4gdW5rbm93biB1bmlmb3JtIHR5cGVgKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IGNyZWF0ZVByb2dyYW0gfSBmcm9tICcuLi9nbC9wcm9ncmFtJztcbmltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCwgRFJBVywgU0lERSwgU0hBREVSX0NVU1RPTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICAgIGJpbmRBdHRyaWJ1dGVzLFxuICAgIGdldFR5cGVTaXplLFxuICAgIGluaXRBdHRyaWJ1dGVzLFxuICAgIGluaXRVbmlmb3JtcyxcbiAgICB1cGRhdGVVbmlmb3JtcyxcbiAgICB1cGRhdGVBdHRyaWJ1dGVzLFxuICAgIFZhbyxcbn0gZnJvbSAnLi4vZ2wnO1xuaW1wb3J0IHsgZ2xzbDN0bzEgfSBmcm9tICcuLi91dGlscyc7XG5cbi8vIHVzZWQgZm9yIHNwZWVkIG9wdGltaXNhdGlvblxubGV0IFdFQkdMMiA9IGZhbHNlO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0ge307XG5cbiAgICAgICAgLy8geiBmaWdodFxuICAgICAgICB0aGlzLnBvbHlnb25PZmZzZXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0RmFjdG9yID0gMDtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0VW5pdHMgPSAxO1xuXG4gICAgICAgIC8vIGNsaXBwaW5nIHBsYW5lc1xuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW1xuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpbnN0YW5jaW5nXG4gICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHJlbmRlcmluZyBtb2RlXG4gICAgICAgIHRoaXMubW9kZSA9IERSQVcuVFJJQU5HTEVTO1xuXG4gICAgICAgIC8vIHJlbmRlcmluZyBzaWRlXG4gICAgICAgIHRoaXMuc2lkZSA9IFNJREUuRlJPTlQ7XG5cbiAgICAgICAgLy8gdHlwZVxuICAgICAgICB0aGlzLnR5cGUgPSBTdHJpbmcoU0hBREVSX0NVU1RPTSk7XG5cbiAgICAgICAgLy8gY3JlYXRlcyBzaGFkb3dcbiAgICAgICAgdGhpcy5zaGFkb3dzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXRBdHRyaWJ1dGUobmFtZSwgdHlwZSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdldFR5cGVTaXplKHR5cGUpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0SW5kZXgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbmRpY2VzID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0VW5pZm9ybShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnVuaWZvcm1zW25hbWVdID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNldFNoYWRlcih2ZXJ0ZXgsIGZyYWdtZW50KSB7XG4gICAgICAgIHRoaXMudmVydGV4ID0gdmVydGV4O1xuICAgICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG4gICAgfVxuXG4gICAgc2V0SW5zdGFuY2VBdHRyaWJ1dGUobmFtZSwgdHlwZSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdldFR5cGVTaXplKHR5cGUpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICBpbnN0YW5jZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0SW5zdGFuY2VDb3VudCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5zdGFuY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIFdFQkdMMiA9IGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyO1xuXG4gICAgICAgIC8vIG9iamVjdCBtYXRlcmlhbFxuICAgICAgICBpZiAodGhpcy52ZXJ0ZXggJiYgdGhpcy5mcmFnbWVudCkge1xuICAgICAgICAgICAgaWYgKCFXRUJHTDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnRleCA9IGdsc2wzdG8xKHRoaXMudmVydGV4LCAndmVydGV4Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IGdsc2wzdG8xKHRoaXMuZnJhZ21lbnQsICdmcmFnbWVudCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBjcmVhdGVQcm9ncmFtKGdsLCB0aGlzLnZlcnRleCwgdGhpcy5mcmFnbWVudCwgdGhpcy50eXBlKTtcbiAgICAgICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcblxuICAgICAgICAgICAgdGhpcy52YW8gPSBuZXcgVmFvKCk7XG5cbiAgICAgICAgICAgIGluaXRBdHRyaWJ1dGVzKHRoaXMuYXR0cmlidXRlcywgdGhpcy5wcm9ncmFtKTtcbiAgICAgICAgICAgIGluaXRVbmlmb3Jtcyh0aGlzLnVuaWZvcm1zLCB0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbmRpY2VzICYmICF0aGlzLmluZGljZXMuYnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLmJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGlzLnZhby5iaW5kKCk7XG4gICAgICAgICAgICAvLyB0aGlzLmJpbmQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMudmFvLnVuYmluZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy51bmJpbmQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgYmluZEF0dHJpYnV0ZXModGhpcy5hdHRyaWJ1dGVzLCB0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgIGlmICh0aGlzLmluZGljZXMpIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kaWNlcy5idWZmZXIpO1xuICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5pbmRpY2VzLnZhbHVlLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW5TaGFkb3dNYXApIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlydHkuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eS5hdHRyaWJ1dGVzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZVVuaWZvcm1zKHRoaXMudW5pZm9ybXMpO1xuXG4gICAgICAgIC8vIGVuYWJsZSBkZXB0aCB0ZXN0IGFuZCBjdWxsaW5nXG4gICAgICAgIC8vIFRPRE86IG1heWJlIHRoaXMgY2FuIGhhdmUgb3duIHZhcmlhYmxlcyBwZXIgbW9kZWwuXG4gICAgICAgIC8vIGZvciBleGFtcGxlIHJlbmRlciB0YXJnZXRzIGRvbid0IG5lZWQgZGVwdGggdGVzdFxuICAgICAgICAvLyBpZiAodGhpcy5zaGFkb3dzID09PSBmYWxzZSkge1xuICAgICAgICAvLyAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgLy8gZ2wuZGlzYWJsZShnbC5CTEVORCk7XG5cbiAgICAgICAgaWYgKHRoaXMucG9seWdvbk9mZnNldCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLlBPTFlHT05fT0ZGU0VUX0ZJTEwpO1xuICAgICAgICAgICAgZ2wucG9seWdvbk9mZnNldCh0aGlzLnBvbHlnb25PZmZzZXRGYWN0b3IsIHRoaXMucG9seWdvbk9mZnNldFVuaXRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuUE9MWUdPTl9PRkZTRVRfRklMTCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBodHRwczovL3dlYmdsMmZ1bmRhbWVudGFscy5vcmcvd2ViZ2wvbGVzc29ucy93ZWJnbC10ZXh0LXRleHR1cmUuaHRtbFxuICAgICAgICAvLyBUaGUgbW9zdCBjb21tb24gc29sdXRpb24gZm9yIHByZXR0eSBtdWNoIGFsbCB0cmFuc3BhcmVudCByZW5kZXJpbmcgaXNcbiAgICAgICAgLy8gdG8gZHJhdyBhbGwgdGhlIG9wYXF1ZSBzdHVmZiBmaXJzdCxcbiAgICAgICAgLy8gdGhlbiBhZnRlciwgZHJhdyBhbGwgdGhlIHRyYW5zcGFyZW50IHN0dWZmIHNvcnRlZCBieSB6IGRpc3RhbmNlXG4gICAgICAgIC8vIHdpdGggdGhlIGRlcHRoIGJ1ZmZlciB0ZXN0aW5nIG9uIGJ1dCBkZXB0aCBidWZmZXIgdXBkYXRpbmcgb2ZmXG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgICAgICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG91YmxlIHNpZGUgbWF0ZXJpYWxcbiAgICAgICAgaWYgKHRoaXMuc2lkZSA9PT0gU0lERS5GUk9OVCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNpZGUgPT09IFNJREUuQkFDSykge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWRlID09PSBTSURFLkJPVEgpIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpblNoYWRvd01hcCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBpZiAodGhpcy5pc0luc3RhbmNlKSB7XG4gICAgICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzSW5zdGFuY2VkKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy52YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JULFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHMoKS5pbnN0YW5jZWRBcnJheXMuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5kaWNlcykge1xuICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKHRoaXMubW9kZSwgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyh0aGlzLm1vZGUsIDAsIHRoaXMuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlLmxlbmd0aCAvIDMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb2RlbDtcbiIsImltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IERlZmF1bHQgfSBmcm9tICcuLi9zaGFkZXJzJztcbmltcG9ydCB7IFNIQURFUl9DVVNUT00gfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5sZXQgc2hhZGVySUQgPSAwO1xuY2xhc3MgTWVzaCBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX3NoYWRlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgaW5kaWNlcyxcbiAgICAgICAgICAgIG5vcm1hbHMsXG4gICAgICAgICAgICB1dnMsXG4gICAgICAgIH0gPSBwYXJhbXMuZ2VvbWV0cnk7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBtb2RlLFxuICAgICAgICB9ID0gcGFyYW1zLnNoYWRlciB8fCBuZXcgRGVmYXVsdCh7IGNvbG9yOiBwYXJhbXMuY29sb3IsIG1hcDogcGFyYW1zLm1hcCB9KTtcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGEgdHlwZSwgYXNzaWduIGl0LCBzbyB3ZSBjYW4gc29ydCBieSB0eXBlIGluIHRoZSByZW5kZXJlci5cbiAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IGAke1NIQURFUl9DVVNUT019LSR7c2hhZGVySUQrK31gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhX3Bvc2l0aW9uJywgJ3ZlYzMnLCBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucykpO1xuICAgICAgICBpZiAoaW5kaWNlcykge1xuICAgICAgICAgICAgdGhpcy5zZXRJbmRleChuZXcgVWludDE2QXJyYXkoaW5kaWNlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3JtYWxzKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV9ub3JtYWwnLCAndmVjMycsIG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1dnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhX3V2JywgJ3ZlYzInLCBuZXcgRmxvYXQzMkFycmF5KHV2cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRVbmlmb3JtKGtleSwgdW5pZm9ybXNba2V5XS50eXBlLCB1bmlmb3Jtc1trZXldLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaGFkZXIodmVydGV4LCBmcmFnbWVudCk7XG4gICAgfVxuXG4gICAgc2V0IHNoYWRlcihzaGFkZXIpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS5zaGFkZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zaGFkZXIgPSBzaGFkZXI7XG4gICAgICAgIGlmIChzaGFkZXIudHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBzaGFkZXIudHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFNIQURFUl9DVVNUT007XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTaGFkZXIoc2hhZGVyLnZlcnRleCwgc2hhZGVyLmZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBnZXQgc2hhZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhZGVyO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzaDtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi4vY29yZS9tZXNoJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9jb3JlL21vZGVsJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vc2hhZGVycyc7XG5cbmNsYXNzIEF4aXNIZWxwZXIgZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSAocHJvcHMgJiYgcHJvcHMuc2l6ZSkgfHwgMTA7XG4gICAgICAgIGNvbnN0IGcxID0geyBwb3NpdGlvbnM6IFsuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksIC4uLnZlYzMuZnJvbVZhbHVlcyhzaXplLCAwLCAwKV0gfTtcbiAgICAgICAgY29uc3QgZzIgPSB7IHBvc2l0aW9uczogWy4uLnZlYzMuZnJvbVZhbHVlcygwLCAwLCAwKSwgLi4udmVjMy5mcm9tVmFsdWVzKDAsIHNpemUsIDApXSB9O1xuICAgICAgICBjb25zdCBnMyA9IHsgcG9zaXRpb25zOiBbLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIDApLCAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgc2l6ZSldIH07XG5cbiAgICAgICAgY29uc3QgbTEgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDEsIDAsIDApLCB3aXJlZnJhbWU6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IG0yID0gbmV3IEJhc2ljKHsgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKSwgd2lyZWZyYW1lOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBtMyA9IG5ldyBCYXNpYyh7IGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMSksIHdpcmVmcmFtZTogdHJ1ZSB9KTtcblxuXG4gICAgICAgIGNvbnN0IHggPSBuZXcgTWVzaCh7IGdlb21ldHJ5OiBnMSwgc2hhZGVyOiBtMSB9KTtcbiAgICAgICAgdGhpcy5hZGQoeCk7XG5cbiAgICAgICAgY29uc3QgeSA9IG5ldyBNZXNoKHsgZ2VvbWV0cnk6IGcyLCBzaGFkZXI6IG0yIH0pO1xuICAgICAgICB0aGlzLmFkZCh5KTtcblxuICAgICAgICBjb25zdCB6ID0gbmV3IE1lc2goeyBnZW9tZXRyeTogZzMsIHNoYWRlcjogbTMgfSk7XG4gICAgICAgIHRoaXMuYWRkKHopO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEF4aXNIZWxwZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBNZXNoIGZyb20gJy4uL2NvcmUvbWVzaCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vY29yZS9tb2RlbCc7XG5pbXBvcnQgeyBCYXNpYyB9IGZyb20gJy4uL3NoYWRlcnMnO1xuLy8gaW1wb3J0IHsgRFJBVyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEF4aXNIZWxwZXIgZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSAocHJvcHMgJiYgcHJvcHMuc2l6ZSkgfHwgMTtcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGV4dHJhY3QgZ2VvbWV0cnlcbiAgICAgICAgY29uc3Qgc3ggPSBwcm9wcy5tb2RlbC5zY2FsZS54O1xuICAgICAgICBjb25zdCBzeSA9IHByb3BzLm1vZGVsLnNjYWxlLnk7XG4gICAgICAgIGNvbnN0IHN6ID0gcHJvcHMubW9kZWwuc2NhbGUuejtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlLmxlbmd0aCAvIDM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGkzID0gaSAqIDM7XG4gICAgICAgICAgICBjb25zdCB2MHggPSBzeCAqIHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZVtpMyArIDBdO1xuICAgICAgICAgICAgY29uc3QgdjB5ID0gc3kgKiBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWVbaTMgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IHYweiA9IHN6ICogcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCBueCA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWVbaTMgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IG55ID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZVtpMyArIDFdO1xuICAgICAgICAgICAgY29uc3QgbnogPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCB2MXggPSB2MHggKyAoc2l6ZSAqIG54KTtcbiAgICAgICAgICAgIGNvbnN0IHYxeSA9IHYweSArIChzaXplICogbnkpO1xuICAgICAgICAgICAgY29uc3QgdjF6ID0gdjB6ICsgKHNpemUgKiBueik7XG4gICAgICAgICAgICBnZW9tZXRyeS5wb3NpdGlvbnMgPSBnZW9tZXRyeS5wb3NpdGlvbnMuY29uY2F0KFt2MHgsIHYweSwgdjB6LCB2MXgsIHYxeSwgdjF6XSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGFkZXIgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDAsIDEsIDEpLCB3aXJlZnJhbWU6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IG4gPSBuZXcgTWVzaCh7IGdlb21ldHJ5LCBzaGFkZXIgfSk7XG4gICAgICAgIHRoaXMuYWRkKG4pO1xuXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gcHJvcHMubW9kZWw7XG4gICAgICAgIC8vIG1vZGUgPSBEUkFXLkxJTkVTXG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBzdXBlci51cGRhdGUoKTtcblxuICAgICAgICB2ZWMzLmNvcHkodGhpcy5wb3NpdGlvbi5kYXRhLCB0aGlzLnJlZmVyZW5jZS5wb3NpdGlvbi5kYXRhKTtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMucm90YXRpb24uZGF0YSwgdGhpcy5yZWZlcmVuY2Uucm90YXRpb24uZGF0YSk7XG4gICAgICAgIHRoaXMubG9va1RvVGFyZ2V0ID0gdGhpcy5yZWZlcmVuY2UubG9va1RvVGFyZ2V0O1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEF4aXNIZWxwZXI7XG4iLCJleHBvcnQgZnVuY3Rpb24gcmVzaXplKGRvbUVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHJhdGlvKSB7XG4gICAgZG9tRWxlbWVudC53aWR0aCA9IHdpZHRoICogcmF0aW87XG4gICAgZG9tRWxlbWVudC5oZWlnaHQgPSBoZWlnaHQgKiByYXRpbztcbiAgICBkb21FbGVtZW50LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIGRvbUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc3VwcG9ydGVkKCkge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5pbm5lckhUTUwgPSAnWW91ciBicm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IFdlYkdMLjxicj48YSBocmVmPVwiaHR0cHM6Ly9nZXQud2ViZ2wub3JnXCI+R2V0IFdlYkdMPC9hPic7XG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgIGRpdi5zdHlsZS5tYXJnaW4gPSAnMjBweCBhdXRvIDAgYXV0byc7XG4gICAgZGl2LnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzMzMyc7XG4gICAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSknO1xuICAgIGRpdi5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcbiAgICBkaXYuc3R5bGUucGFkZGluZyA9ICcxMHB4JztcbiAgICBkaXYuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGRpdi5zdHlsZS5mb250U2l6ZSA9ICcxMnB4JztcbiAgICBkaXYuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgcmV0dXJuIGRpdjtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuLy8gaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vY29yZS92ZWN0b3IzJztcbmltcG9ydCB7IERJUkVDVElPTkFMX0xJR0hUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgTGlnaHQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gdmVjMy5jcmVhdGUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICAvLyBUT0RPXG4gICAgfVxufVxuXG5jbGFzcyBEaXJlY3Rpb25hbCBleHRlbmRzIExpZ2h0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gRElSRUNUSU9OQUxfTElHSFQ7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IHByb3BzLmNvbG9yIHx8IHZlYzMuZnJvbVZhbHVlcygxLCAxLCAxKTtcbiAgICAgICAgdGhpcy5pbnRlbnNpdHkgPSBwcm9wcy5pbnRlbnNpdHkgfHwgMC45ODk7XG4gICAgfVxufVxuXG5leHBvcnQge1xuICAgIERpcmVjdGlvbmFsLFxufTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IERpcmVjdGlvbmFsIH0gZnJvbSAnLi9saWdodHMnO1xuaW1wb3J0IHsgRElSRUNUSU9OQUxfTElHSFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMubGlnaHRzID0ge1xuICAgICAgICAgICAgZGlyZWN0aW9uYWw6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZm9nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbG9yOiB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSksXG4gICAgICAgICAgICBzdGFydDogNTAwLFxuICAgICAgICAgICAgZW5kOiAxMDAwLFxuICAgICAgICAgICAgZGVuc2l0eTogMC4wMDAyNSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW1xuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGQgc3VuXG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbmFsID0gbmV3IERpcmVjdGlvbmFsKHtcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgIH0pO1xuICAgICAgICBkaXJlY3Rpb25hbC5wb3NpdGlvblswXSA9IDEyNTtcbiAgICAgICAgZGlyZWN0aW9uYWwucG9zaXRpb25bMV0gPSAyNTA7XG4gICAgICAgIGRpcmVjdGlvbmFsLnBvc2l0aW9uWzJdID0gNTAwO1xuICAgICAgICB0aGlzLmFkZExpZ2h0KGRpcmVjdGlvbmFsKTtcbiAgICB9XG5cbiAgICBhZGRMaWdodChsaWdodCkge1xuICAgICAgICBzd2l0Y2ggKGxpZ2h0LnR5cGUpIHtcbiAgICAgICAgY2FzZSBESVJFQ1RJT05BTF9MSUdIVDpcbiAgICAgICAgICAgIHRoaXMubGlnaHRzLmRpcmVjdGlvbmFsLnB1c2gobGlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaWdodFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTGlnaHQobGlnaHQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5pbmRleE9mKGxpZ2h0KTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlnaHQuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5saWdodHMuZGlyZWN0aW9uYWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmU7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFJlbmRlclRhcmdldCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICAvLyBzb21lIGRlZmF1bHQgcHJvcHNcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICB3aWR0aDogNTEyLFxuICAgICAgICAgICAgaGVpZ2h0OiA1MTIsXG4gICAgICAgICAgICBpbnRlcm5hbGZvcm1hdDogZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgdHlwZTogZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgIH0sIHByb3BzKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxmb3JtYXQgPSBnbC5ERVBUSF9DT01QT05FTlQyNDtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IGdsLlVOU0lHTkVEX0lOVDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZyYW1lIGJ1ZmZlclxuICAgICAgICB0aGlzLmZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZyYW1lQnVmZmVyKTtcblxuICAgICAgICAvLyB0ZXh0dXJlXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGRlcHRoIHRleHR1cmVcbiAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuXG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgICAgICBnbC5DT0xPUl9BVFRBQ0hNRU5UMCxcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUsXG4gICAgICAgICAgICAwLFxuICAgICAgICApO1xuICAgICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcbiAgICAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgZ2wuREVQVEhfQVRUQUNITUVOVCxcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyVGFyZ2V0O1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vcnQnO1xuaW1wb3J0IFBlcnNwZWN0aXZlIGZyb20gJy4uL2NhbWVyYXMvcGVyc3BlY3RpdmUnO1xuaW1wb3J0IE9ydGhvZ3JhcGhpYyBmcm9tICcuLi9jYW1lcmFzL29ydGhvZ3JhcGhpYyc7XG5cbmNsYXNzIFNoYWRvd01hcFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIC8vIHNpemUgb2YgdGV4dHVyZVxuICAgICAgICB0aGlzLndpZHRoID0gcHJvcHMud2lkdGggfHwgMTAyNDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBwcm9wcy5oZWlnaHQgfHwgMTAyNDtcblxuICAgICAgICAvLyBjcmVhdGUgcmVuZGVyIHRhcmdldFxuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXM7XG4gICAgICAgIHRoaXMucnQgPSBuZXcgUmVuZGVyVGFyZ2V0KHsgd2lkdGgsIGhlaWdodCB9KTtcblxuICAgICAgICAvLyBtYXRyaWNlc1xuICAgICAgICB0aGlzLm1hdHJpY2VzID0ge1xuICAgICAgICAgICAgdmlldzogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIHNoYWRvdzogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIGJpYXM6IG1hdDQuZnJvbVZhbHVlcyhcbiAgICAgICAgICAgICAgICAwLjUsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAgICAgICAgICAgMC4wLCAwLjUsIDAuMCwgMC4wLFxuICAgICAgICAgICAgICAgIDAuMCwgMC4wLCAwLjUsIDAuMCxcbiAgICAgICAgICAgICAgICAwLjUsIDAuNSwgMC41LCAxLjAsXG4gICAgICAgICAgICApLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG9yaWdpbiBvZiBkaXJlY3Rpb25hbCBsaWdodFxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZSh7XG4gICAgICAgICAgICBmb3Y6IDYwLFxuICAgICAgICAgICAgbmVhcjogMSxcbiAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxOyAvLyBUT0RPOiByZW1vdmUgdGhpcyB3aGVuIGZpeCBsb29rQXQgYnVnIG9uIGdsLW1hdHJpeFxuICAgICAgICB0aGlzLnNldExpZ2h0T3JpZ2luKHByb3BzLmxpZ2h0IHx8IHZlYzMuZnJvbVZhbHVlcygxMDAsIDI1MCwgNTAwKSk7XG4gICAgfVxuXG4gICAgLy8gbW92ZSB0aGUgY2FtZXJhIHRvIHRoZSBsaWdodCBwb3NpdGlvblxuICAgIHNldExpZ2h0T3JpZ2luKHZlYykge1xuICAgICAgICAvLyBDQU1FUkFcblxuICAgICAgICAvLyB1cGRhdGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgIHZlYzMuY29weSh0aGlzLmNhbWVyYS5wb3NpdGlvbi5kYXRhLCB2ZWMpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB2aWV3IG1hdHJpeFxuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMudmlldyk7XG4gICAgICAgIG1hdDQubG9va0F0KFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy52aWV3LFxuICAgICAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uZGF0YSxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnRhcmdldCxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnVwLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNIQURPV1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMuc2hhZG93KTtcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLm1hdHJpY2VzLnNoYWRvdywgdGhpcy5jYW1lcmEubWF0cmljZXMucHJvamVjdGlvbiwgdGhpcy5tYXRyaWNlcy52aWV3KTtcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLm1hdHJpY2VzLnNoYWRvdywgdGhpcy5tYXRyaWNlcy5iaWFzLCB0aGlzLm1hdHJpY2VzLnNoYWRvdyk7XG4gICAgfVxuXG4gICAgLypcbiAgICBUT0RPOlxuICAgIG1heWJlIGNyZWF0ZSBhIHByb2dyYW0ganVzdCBmb3Igc2hhZG93cy4gdGhpcyBhdm9pZHMgaGF2aW5nIHRvIGNoYW5nZSBwcm9ncmFtXG4gICAgaW4gY29tcGxleCBzY2VuZXMganVzdCB0byB3cml0ZSBmb3IgdGhlIGRlcHRoIGJ1ZmZlci5cbiAgICBmaW5kIGEgd2F5IHRvIGJ5cGFzcyB0aGUgY2hhbmdlUHJvZ3JhbSBvbiB0aGUgcmVuZGVyZXIgdG8gYWNjb21vZGF0ZSB0aGlzLlxuICAgICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoYWRvd01hcFJlbmRlcmVyO1xuIiwiaW1wb3J0IHsgdmVjNCwgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBsaWJyYXJ5LCB2ZXJzaW9uLCBzZXRDb250ZXh0LCBnZXRDb250ZXh0LCBzZXRDb250ZXh0VHlwZSwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhULCBNQVhfRElSRUNUSU9OQUwgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVzaXplLCB1bnN1cHBvcnRlZCB9IGZyb20gJy4uL3V0aWxzL2RvbSc7XG5pbXBvcnQgeyBVYm8gfSBmcm9tICcuLi9nbCc7XG5cbmltcG9ydCBTY2VuZSBmcm9tICcuL3NjZW5lJztcbmltcG9ydCBTaGFkb3dNYXBSZW5kZXJlciBmcm9tICcuL3NoYWRvdy1tYXAtcmVuZGVyZXInO1xuXG5sZXQgbGFzdFByb2dyYW07XG5cbmxldCBzb3J0ID0gZmFsc2U7XG5jb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xubGV0IFdFQkdMMiA9IGZhbHNlO1xuXG5jb25zdCB0aW1lID0gdmVjNC5jcmVhdGUoKTtcbmNvbnN0IGZvZyA9IHZlYzQuY3JlYXRlKCk7XG5cbmNvbnN0IG1hdHJpY2VzID0ge1xuICAgIHZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgbm9ybWFsOiBtYXQ0LmNyZWF0ZSgpLFxuICAgIG1vZGVsVmlldzogbWF0NC5jcmVhdGUoKSxcbiAgICBpbnZlcnNlZE1vZGVsVmlldzogbWF0NC5jcmVhdGUoKSxcbn07XG5cbmxldCBjYWNoZWRTY2VuZSA9IG51bGw7IC8vIHNjZW5lXG5sZXQgY2FjaGVkQ2FtZXJhID0gbnVsbDsgLy8gY2FtZXJhXG5cbmNsYXNzIFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHRoaXMuc3VwcG9ydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zb3J0ZWQgPSB7XG4gICAgICAgICAgICBvcGFxdWU6IFtdLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IFtdLFxuICAgICAgICAgICAgc2hhZG93OiBbXSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBlcmZvcm1hbmNlID0ge1xuICAgICAgICAgICAgb3BhcXVlOiAwLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IDAsXG4gICAgICAgICAgICBzaGFkb3c6IDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogMCxcbiAgICAgICAgICAgIGluc3RhbmNlczogMCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJhdGlvID0gcHJvcHMucmF0aW8gfHwgd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuc2hhZG93cyA9IHByb3BzLnNoYWRvd3MgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IHByb3BzLmNhbnZhcyB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICAgICAgICBjb25zdCBjb250ZXh0VHlwZSA9IHNldENvbnRleHRUeXBlKHByb3BzLmNvbnRleHRUeXBlKTtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmRvbUVsZW1lbnQuZ2V0Q29udGV4dChjb250ZXh0VHlwZSwgT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgYW50aWFsaWFzOiBmYWxzZSxcbiAgICAgICAgfSwgcHJvcHMpKTtcblxuICAgICAgICBjb25zdCBzZXNzaW9uID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2wgJiZcbiAgICAgICAgICAgICgoc2Vzc2lvbi52ZXJ0ZXhBcnJheU9iamVjdCAmJlxuICAgICAgICAgICAgc2Vzc2lvbi5pbnN0YW5jZWRBcnJheXMgJiZcbiAgICAgICAgICAgIHNlc3Npb24uc3RhbmRhcmREZXJpdmF0aXZlcyAmJlxuICAgICAgICAgICAgc2Vzc2lvbi5kZXB0aFRleHR1cmVzKSB8fCB3aW5kb3cuZ2xpICE9PSBudWxsKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5ncmVldGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaWIgPSAnY29sb3I6IzY2Njtmb250LXNpemU6eC1zbWFsbDtmb250LXdlaWdodDpib2xkOyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9ICdjb2xvcjojNzc3O2ZvbnQtc2l6ZTp4LXNtYWxsJztcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSAnY29sb3I6I2YzMztmb250LXNpemU6eC1zbWFsbCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgICAgICAgICAgYCVjJHtsaWJyYXJ5fSAtICVjdmVyc2lvbjogJWMke3ZlcnNpb259ICVjcnVubmluZzogJWMke2dsLmdldFBhcmFtZXRlcihnbC5WRVJTSU9OKX1gLFxuICAgICAgICAgICAgICAgICAgICBsaWIsIHBhcmFtZXRlcnMsIHZhbHVlcywgcGFyYW1ldGVycywgdmFsdWVzLFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0Q29udGV4dChnbCk7XG5cbiAgICAgICAgICAgIFdFQkdMMiA9IGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyO1xuXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IHVuc3VwcG9ydGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLnN1cHBvcnRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgdGhpcy5wZXJTY2VuZSA9IG5ldyBVYm8oW1xuICAgICAgICAgICAgICAgIC4uLm1hdDQuY3JlYXRlKCksIC8vIHByb2plY3Rpb24gbWF0cml4XG4gICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gdmlldyBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi5mb2csIC8vIGZvZyB2ZWM0KHVzZV9mb2csIHN0YXJ0LCBlbmQsIGRlbnNpdHkpXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZm9nIGNvbG9yXG4gICAgICAgICAgICAgICAgLi4udGltZSwgLy8gdmVjNChpR2xvYmFsVGltZSwgRU1QVFksIEVNUFRZLCBFTVBUWSlcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBnbG9iYWwgY2xpcCBzZXR0aW5ncyAodXNlX2NsaXBwaW5nLCBFTVBUWSwgRU1QVFksIEVNUFRZKTtcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBnbG9iYWwgY2xpcHBpbmcgcGxhbmUgMFxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAxXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXBwaW5nIHBsYW5lIDJcbiAgICAgICAgICAgIF0sIDApO1xuXG4gICAgICAgICAgICB0aGlzLnBlck1vZGVsID0gbmV3IFVibyhbXG4gICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gbW9kZWwgbWF0cml4XG4gICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gbm9ybWFsIG1hdHJpeFxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXAgc2V0dGluZ3MgKHVzZV9jbGlwcGluZywgRU1QVFksIEVNUFRZLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcHBpbmcgcGxhbmUgMFxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXBwaW5nIHBsYW5lIDFcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwcGluZyBwbGFuZSAyXG4gICAgICAgICAgICBdLCAxKTtcblxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25hbCA9IG5ldyBVYm8obmV3IEZsb2F0MzJBcnJheShNQVhfRElSRUNUSU9OQUwgKiAxMiksIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hhZG93c1xuICAgICAgICB0aGlzLnNoYWRvd21hcCA9IG5ldyBTaGFkb3dNYXBSZW5kZXJlcigpO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG4gICAgICAgIHJlc2l6ZSh0aGlzLmRvbUVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHRoaXMucmF0aW8pO1xuICAgIH1cblxuICAgIHNldFJhdGlvKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucmF0aW8gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjaGFuZ2VQcm9ncmFtKHByb2dyYW0pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgY29uc3Qgc0xvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgJ3BlclNjZW5lJyk7XG4gICAgICAgICAgICBjb25zdCBtTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCAncGVyTW9kZWwnKTtcbiAgICAgICAgICAgIGNvbnN0IGRMb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sICdkaXJlY3Rpb25hbCcpO1xuICAgICAgICAgICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhwcm9ncmFtLCBzTG9jYXRpb24sIHRoaXMucGVyU2NlbmUuYm91bmRMb2NhdGlvbik7XG4gICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIG1Mb2NhdGlvbiwgdGhpcy5wZXJNb2RlbC5ib3VuZExvY2F0aW9uKTtcblxuICAgICAgICAgICAgLy8gaXMgZGlyZWN0aW9uYWwgbGlnaHQgaW4gc2hhZGVyXG4gICAgICAgICAgICBpZiAoZExvY2F0aW9uID09PSB0aGlzLmRpcmVjdGlvbmFsLmJvdW5kTG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIGRMb2NhdGlvbiwgdGhpcy5kaXJlY3Rpb25hbC5ib3VuZExvY2F0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXcoc2NlbmUsIGNhbWVyYSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG4gICAgICAgIC8vIG9ubHkgbmVjZXNzYXJ5IGZvciB3ZWJnbDEgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgY2FjaGVkU2NlbmUgPSBzY2VuZTtcbiAgICAgICAgY2FjaGVkQ2FtZXJhID0gY2FtZXJhO1xuXG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTsgLy8gVE9ETzogbWF5YmUgY2hhbmdlIHRoaXMgdG8gbW9kZWwuanMgP1xuICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTsgLy8gVE9ETzogbWF5YmUgY2hhbmdlIHRoaXMgdG8gbW9kZWwuanMgP1xuICAgICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKTsgLy8gVE9ETzogbWF5YmUgY2hhbmdlIHRoaXMgdG8gbW9kZWwuanMgP1xuXG4gICAgICAgIGNhbWVyYS51cGRhdGVDYW1lcmFNYXRyaXgod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgLy8gY29tbW9uIG1hdHJpY2VzXG4gICAgICAgIG1hdDQuaWRlbnRpdHkobWF0cmljZXMudmlldyk7XG4gICAgICAgIG1hdDQubG9va0F0KG1hdHJpY2VzLnZpZXcsIGNhbWVyYS5wb3NpdGlvbi5kYXRhLCBjYW1lcmEudGFyZ2V0LCBjYW1lcmEudXApO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHNvcnRpbmcgaXMgbmVlZGVkIHdoaWxzdCB0cmF2ZXJzaW5nIHRocm91Z2ggdGhlIHNjZW5lIGdyYXBoXG4gICAgICAgIHNvcnQgPSBzY2VuZS50cmF2ZXJzZSgpO1xuXG4gICAgICAgIC8vIGlmIHNvcnRpbmcgaXMgbmVlZGVkLCByZXNldCBzdHVmZlxuICAgICAgICBpZiAoc29ydCkge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWQub3BhcXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnNvcnRlZC50cmFuc3BhcmVudCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWQuc2hhZG93ID0gW107XG5cbiAgICAgICAgICAgIC8vIGNhbiBiZSBkZXByZWNhdGVkLCBidXQgaXRzIGtpbmQgb2YgY29vbFxuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5vcGFxdWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS50cmFuc3BhcmVudCA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnNoYWRvdyA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnZlcnRpY2VzID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UuaW5zdGFuY2VzID0gMDtcblxuICAgICAgICAgICAgdGhpcy5zb3J0KHNjZW5lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aW1lXG4gICAgICAgIHRpbWVbMF0gPSAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgICAgICBmb2dbMF0gPSBzY2VuZS5mb2cuZW5hYmxlO1xuICAgICAgICBmb2dbMV0gPSBzY2VuZS5mb2cuc3RhcnQ7XG4gICAgICAgIGZvZ1syXSA9IHNjZW5lLmZvZy5lbmQ7XG4gICAgICAgIGZvZ1szXSA9IHNjZW5lLmZvZy5kZW5zaXR5O1xuXG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIC8vIGJpbmQgY29tbW9uIGJ1ZmZlcnNcbiAgICAgICAgICAgIHRoaXMucGVyU2NlbmUuYmluZCgpO1xuICAgICAgICAgICAgdGhpcy5wZXJNb2RlbC5iaW5kKCk7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsLmJpbmQoKTtcblxuICAgICAgICAgICAgdGhpcy5wZXJTY2VuZS51cGRhdGUoW1xuICAgICAgICAgICAgICAgIC4uLmNhbWVyYS5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgICAgIC4uLm1hdHJpY2VzLnZpZXcsXG4gICAgICAgICAgICAgICAgLi4uZm9nLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmZvZy5jb2xvcixcbiAgICAgICAgICAgICAgICAuLi50aW1lLFxuICAgICAgICAgICAgICAgIC4uLltzY2VuZS5jbGlwcGluZy5lbmFibGUsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmNsaXBwaW5nLnBsYW5lc1swXSxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5jbGlwcGluZy5wbGFuZXNbMV0sXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuY2xpcHBpbmcucGxhbmVzWzJdLFxuICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25hbC51cGRhdGUoW1xuICAgICAgICAgICAgICAgICAgICAuLi5bLi4uc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsW2ldLnBvc2l0aW9uLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgLi4uWy4uLnNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFtpXS5jb2xvciwgMF0sXG4gICAgICAgICAgICAgICAgICAgIC4uLltzY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbaV0uaW50ZW5zaXR5LCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBdLCBpICogMTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGxpZ2h0IGluIHNoYWRvd21hcFxuICAgICAgICB0aGlzLnNoYWRvd21hcC5zZXRMaWdodE9yaWdpbihzY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbMF0ucG9zaXRpb24pO1xuXG4gICAgICAgIC8vIDEpIHJlbmRlciBvYmplY3RzIHRvIHNoYWRvd21hcFxuICAgICAgICBpZiAodGhpcy5yZW5kZXJTaGFkb3cpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3J0ZWQuc2hhZG93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QodGhpcy5zb3J0ZWQuc2hhZG93W2ldLCB0aGlzLnNvcnRlZC5zaGFkb3dbaV0ucHJvZ3JhbSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyKSByZW5kZXIgb3BhcXVlIG9iamVjdHNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZC5vcGFxdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyT2JqZWN0KHRoaXMuc29ydGVkLm9wYXF1ZVtpXSwgdGhpcy5zb3J0ZWQub3BhcXVlW2ldLnByb2dyYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMykgc29ydCBhbmQgcmVuZGVyIHRyYW5zcGFyZW50IG9iamVjdHNcbiAgICAgICAgLy8gZXhwZW5zaXZlIHRvIHNvcnQgdHJhbnNwYXJlbnQgaXRlbXMgcGVyIHotaW5kZXguXG4gICAgICAgIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoYS5wb3NpdGlvbi56IC0gYi5wb3NpdGlvbi56KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZC50cmFuc3BhcmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QodGhpcy5zb3J0ZWQudHJhbnNwYXJlbnRbaV0sIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50W2ldLnByb2dyYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNCkgcmVuZGVyIGd1aVxuICAgICAgICAvLyBUT0RPXG4gICAgfVxuXG4gICAgcnR0KHtcbiAgICAgICAgcmVuZGVyVGFyZ2V0LFxuICAgICAgICBzY2VuZSxcbiAgICAgICAgY2FtZXJhLFxuICAgICAgICBjbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdLFxuICAgIH0pIHsgLy8gbWF5YmUgb3JkZXIgaXMgaW1wb3J0YW50XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHJlbmRlclRhcmdldC5mcmFtZUJ1ZmZlcik7XG5cbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgcmVuZGVyVGFyZ2V0LndpZHRoLCByZW5kZXJUYXJnZXQuaGVpZ2h0KTtcbiAgICAgICAgZ2wuY2xlYXJDb2xvciguLi5jbGVhckNvbG9yKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgICAgIHRoaXMuZHJhdyhzY2VuZSwgY2FtZXJhLCByZW5kZXJUYXJnZXQud2lkdGgsIHJlbmRlclRhcmdldC5oZWlnaHQpO1xuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHJlbmRlclRhcmdldC50ZXh0dXJlKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICByZW5kZXIoc2NlbmUsIGNhbWVyYSkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBzaGFkb3dzXG4gICAgICAgIGlmICh0aGlzLnNoYWRvd3MpIHtcbiAgICAgICAgICAgIC8vIHJlbmRlciBzY2VuZSB0byB0ZXh0dXJlXG4gICAgICAgICAgICB0aGlzLnJlbmRlclNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJ0dCh7XG4gICAgICAgICAgICAgICAgcmVuZGVyVGFyZ2V0OiB0aGlzLnNoYWRvd21hcC5ydCxcbiAgICAgICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuc2hhZG93bWFwLmNhbWVyYSxcbiAgICAgICAgICAgICAgICBjbGVhckNvbG9yOiBbMSwgMSwgMSwgMV0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXJTaGFkb3cgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbmRlciBzY2VuZVxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDEpO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgdGhpcy5kcmF3KHNjZW5lLCBjYW1lcmEsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgLy8gVE9ETzogcmVuZGVyIEdVSSBvYmplY3RzXG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cmljZXMobWF0cml4KSB7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkobWF0cmljZXMubW9kZWxWaWV3KTtcbiAgICAgICAgbWF0NC5jb3B5KG1hdHJpY2VzLm1vZGVsVmlldywgbWF0cml4KTtcbiAgICAgICAgbWF0NC5pbnZlcnQobWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcsIG1hdHJpY2VzLm1vZGVsVmlldyk7XG4gICAgICAgIG1hdDQudHJhbnNwb3NlKG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3LCBtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldyk7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkobWF0cmljZXMubm9ybWFsKTtcbiAgICAgICAgbWF0NC5jb3B5KG1hdHJpY2VzLm5vcm1hbCwgbWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcpO1xuICAgIH1cblxuICAgIHNvcnQob2JqZWN0KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2JqZWN0LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNvcnQob2JqZWN0LmNoaWxkcmVuW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmplY3QudmlzaWJsZSAmJiAhKG9iamVjdCBpbnN0YW5jZW9mIFNjZW5lKSkge1xuICAgICAgICAgICAgLy8gYWRkcyBvYmplY3QgdG8gYSBvcGFxdWUgb3IgdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGlmIChvYmplY3QudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvcnRlZC50cmFuc3BhcmVudC5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS50cmFuc3BhcmVudCsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvcnRlZC5vcGFxdWUucHVzaChvYmplY3QpO1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uub3BhcXVlKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHNoYWRvd3MgZW5hYmxlZCBvbiByZW5kZXJlciwgYW5kIHNoYWRvd3MgYXJlIGVuYWJsZWQgb24gb2JqZWN0XG4gICAgICAgICAgICBpZiAodGhpcy5zaGFkb3dzICYmIG9iamVjdC5zaGFkb3dzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQuc2hhZG93LnB1c2gob2JqZWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnNoYWRvdysrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb3VudCB2ZXJ0aWNlIG51bWJlclxuICAgICAgICAgICAgaWYgKG9iamVjdC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnZlcnRpY2VzICs9IG9iamVjdC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWUubGVuZ3RoIC8gMztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY291bnQgaW5zdGFuY2VzXG4gICAgICAgICAgICBpZiAob2JqZWN0LmlzSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLmluc3RhbmNlcyArPSBvYmplY3QuaW5zdGFuY2VDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNvcnRpbmcgY29tcGxldGVcbiAgICAgICAgb2JqZWN0LmRpcnR5LnNvcnRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZW5kZXJPYmplY3Qob2JqZWN0LCBwcm9ncmFtLCBpblNoYWRvd01hcCA9IGZhbHNlKSB7XG4gICAgICAgIC8vIGl0cyB0aGUgcGFyZW50IG5vZGUgKHNjZW5lLmpzKVxuICAgICAgICBpZiAob2JqZWN0LnBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVNYXRyaWNlcyhvYmplY3QubWF0cmljZXMubW9kZWwpO1xuXG4gICAgICAgIGlmIChvYmplY3QuZGlydHkuc2hhZGVyKSB7XG4gICAgICAgICAgICBvYmplY3QuZGlydHkuc2hhZGVyID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChwcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcHJvZ3JhbSkge1xuICAgICAgICAgICAgdGhpcy5pbml0VW5pZm9ybXNQZXJNb2RlbChvYmplY3QpO1xuICAgICAgICAgICAgb2JqZWN0LmluaXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXN0UHJvZ3JhbSAhPT0gcHJvZ3JhbSkge1xuICAgICAgICAgICAgbGFzdFByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VQcm9ncmFtKGxhc3RQcm9ncmFtLCBvYmplY3QudHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBvYmplY3QuYmluZCgpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybXNQZXJNb2RlbChvYmplY3QpO1xuXG4gICAgICAgIG9iamVjdC51cGRhdGUoaW5TaGFkb3dNYXApO1xuICAgICAgICBvYmplY3QuZHJhdygpO1xuXG4gICAgICAgIG9iamVjdC51bmJpbmQoKTtcbiAgICB9XG5cbiAgICBpbml0VW5pZm9ybXNQZXJNb2RlbChvYmplY3QpIHtcbiAgICAgICAgaWYgKCFXRUJHTDIpIHtcbiAgICAgICAgICAgIC8vIHBlciBzY2VuZVxuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3Byb2plY3Rpb25NYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3ZpZXdNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2ZvZ1NldHRpbmdzJywgJ3ZlYzQnLCBmb2cpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2ZvZ0NvbG9yJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdpR2xvYmFsVGltZScsICdmbG9hdCcsIHRpbWVbMF0pO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBTZXR0aW5ncycsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZ2xvYmFsQ2xpcFBsYW5lMCcsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZ2xvYmFsQ2xpcFBsYW5lMScsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZ2xvYmFsQ2xpcFBsYW5lMicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICAvLyBwZXIgb2JqZWN0XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbW9kZWxNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ25vcm1hbE1hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwU2V0dGluZ3MnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFBsYW5lMCcsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwUGxhbmUxJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBQbGFuZTInLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuXG4gICAgICAgICAgICAvLyBsaWdodHNcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdkbFBvc2l0aW9uJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdkbENvbG9yJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdmbEludGVuc2l0eScsICdmbG9hdCcsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd01hcCcsICdzYW1wbGVyMkQnLCAwKTtcbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd01hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dOZWFyJywgJ2Zsb2F0JywgMCk7XG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dGYXInLCAnZmxvYXQnLCAwKTtcbiAgICB9XG5cbiAgICB1cGRhdGVVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCkge1xuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLnBlck1vZGVsLnVwZGF0ZShbXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0Lm1hdHJpY2VzLm1vZGVsLFxuICAgICAgICAgICAgICAgIC4uLm1hdHJpY2VzLm5vcm1hbCxcbiAgICAgICAgICAgICAgICAuLi5bb2JqZWN0LmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXSxcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QuY2xpcHBpbmcucGxhbmVzWzFdLFxuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5jbGlwcGluZy5wbGFuZXNbMl0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgVUJPIGFyZSB3ZWJnbDIgb25seSwgd2UgbmVlZCB0byBtYW51YWxseSBhZGQgZXZlcnl0aGluZ1xuICAgICAgICAgICAgLy8gYXMgdW5pZm9ybXNcbiAgICAgICAgICAgIC8vIHBlciBzY2VuZSB1bmlmb3JtcyB1cGRhdGVcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LnZhbHVlID0gY2FjaGVkQ2FtZXJhLm1hdHJpY2VzLnByb2plY3Rpb247XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMudmlld01hdHJpeC52YWx1ZSA9IG1hdHJpY2VzLnZpZXc7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZm9nU2V0dGluZ3MudmFsdWUgPSBmb2c7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZm9nQ29sb3IudmFsdWUgPSBjYWNoZWRTY2VuZS5mb2cuY29sb3I7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuaUdsb2JhbFRpbWUudmFsdWUgPSB0aW1lWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBTZXR0aW5ncy52YWx1ZSA9IFtjYWNoZWRTY2VuZS5jbGlwcGluZy5lbmFibGUsIDAsIDAsIDBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBQbGFuZTAudmFsdWUgPSBjYWNoZWRTY2VuZS5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFBsYW5lMS52YWx1ZSA9IGNhY2hlZFNjZW5lLmNsaXBwaW5nLnBsYW5lc1sxXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwUGxhbmUyLnZhbHVlID0gY2FjaGVkU2NlbmUuY2xpcHBpbmcucGxhbmVzWzJdO1xuXG4gICAgICAgICAgICAvLyBwZXIgbW9kZWwgdW5pZm9ybXMgdXBkYXRlXG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubW9kZWxNYXRyaXgudmFsdWUgPSBvYmplY3QubWF0cmljZXMubW9kZWw7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubm9ybWFsTWF0cml4LnZhbHVlID0gbWF0cmljZXMubm9ybWFsO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFNldHRpbmdzLnZhbHVlID0gW29iamVjdC5jbGlwcGluZy5lbmFibGUsIDAsIDAsIDBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFBsYW5lMC52YWx1ZSA9IG9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwUGxhbmUxLnZhbHVlID0gb2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBQbGFuZTIudmFsdWUgPSBvYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGVzdCBTSEFET1dcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd01hcC52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLnJ0LmRlcHRoVGV4dHVyZTtcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd01hdHJpeC52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLm1hdHJpY2VzLnNoYWRvdztcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd05lYXIudmFsdWUgPSB0aGlzLnNoYWRvd21hcC5jYW1lcmEubmVhcjtcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd0Zhci52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLmNhbWVyYS5mYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJlcjtcbiIsImltcG9ydCBTY2VuZSBmcm9tICcuL3NjZW5lJztcbmltcG9ydCBNZXNoIGZyb20gJy4vbWVzaCc7XG5pbXBvcnQgeyBVQk8gfSBmcm9tICcuLi9zaGFkZXJzL2NodW5rcyc7XG5cbmNsYXNzIFBhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoKTtcblxuICAgICAgICBjb25zdCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zIH0gPSBwcm9wcztcblxuICAgICAgICB0aGlzLnZlcnRleCA9IHZlcnRleDtcbiAgICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0gdW5pZm9ybXM7XG5cbiAgICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIGNvbnN0IHNoYWRlciA9IHtcbiAgICAgICAgICAgIHZlcnRleDogYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xuICAgICAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgICAgICR7dGhpcy52ZXJ0ZXh9YCxcblxuICAgICAgICAgICAgZnJhZ21lbnQ6IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuICAgICAgICAgICAgICAgICR7dGhpcy5mcmFnbWVudH1gLFxuICAgICAgICAgICAgdW5pZm9ybXM6IHRoaXMudW5pZm9ybXMsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFstMSwgLTEsIDAsIDEsIC0xLCAwLCAxLCAxLCAwLCAtMSwgMSwgMF0sXG4gICAgICAgICAgICBpbmRpY2VzOiBbMCwgMSwgMiwgMCwgMiwgM10sXG4gICAgICAgICAgICB1dnM6IFswLCAwLCAxLCAwLCAxLCAxLCAwLCAxXSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5xdWFkID0gbmV3IE1lc2goeyBnZW9tZXRyeSwgc2hhZGVyIH0pO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnF1YWQpO1xuICAgIH1cblxuICAgIHNldFVuaWZvcm0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnF1YWQudW5pZm9ybXNba2V5XS52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFzcztcbiIsImNvbnN0IEJhc2ljID0ge1xuXG4gICAgdW5pZm9ybXM6IHtcbiAgICAgICAgdV9pbnB1dDogeyB0eXBlOiAnc2FtcGxlcjJEJywgdmFsdWU6IG51bGwgfSxcbiAgICB9LFxuXG4gICAgdmVydGV4OiBgXG4gICAgb3V0IHZlYzIgdl91djtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgdl91diA9IGFfdXY7XG4gICAgfWAsXG5cbiAgICBmcmFnbWVudDogYFxuICAgIGluIHZlYzIgdl91djtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW5wdXQ7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIG91dENvbG9yID0gdGV4dHVyZSh1X2lucHV0LCB2X3V2KTtcbiAgICB9YCxcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7XG4iLCJpbXBvcnQgeyB2ZWM0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IE9ydGhvZ3JhcGhpYyB9IGZyb20gJy4uL2NhbWVyYXMnO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vcmVuZGVyZXInO1xuaW1wb3J0IFJlbmRlclRhcmdldCBmcm9tICcuL3J0JztcbmltcG9ydCBQYXNzIGZyb20gJy4vcGFzcyc7XG5pbXBvcnQgeyBCYXNpYyB9IGZyb20gJy4uL3Bhc3Nlcyc7XG5cbmNsYXNzIENvbXBvc2VyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gdGhpcy5yZW5kZXJlci5kb21FbGVtZW50O1xuXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IE9ydGhvZ3JhcGhpYygpO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gMTAwO1xuXG4gICAgICAgIHRoaXMucGFzc2VzID0gW107XG5cbiAgICAgICAgdGhpcy5jbGVhckNvbG9yID0gdmVjNC5mcm9tVmFsdWVzKDAsIDAsIDAsIDEpO1xuXG4gICAgICAgIHRoaXMuc2NyZWVuID0gbmV3IFBhc3MoQmFzaWMpO1xuICAgICAgICB0aGlzLnNjcmVlbi5jb21waWxlKCk7XG5cbiAgICAgICAgdGhpcy5idWZmZXJzID0gW1xuICAgICAgICAgICAgbmV3IFJlbmRlclRhcmdldCgpLFxuICAgICAgICAgICAgbmV3IFJlbmRlclRhcmdldCgpLFxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMuYnVmZmVyc1sxXTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHRoaXMuYnVmZmVyc1swXTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLnJlYWQuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy53cml0ZS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIHNldFJhdGlvKHJhdGlvKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0UmF0aW8ocmF0aW8pO1xuICAgIH1cblxuICAgIHBhc3MocGFzcykge1xuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgIH1cblxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFzc2VzW2ldLmNvbXBpbGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlclRvVGV4dHVyZShyZW5kZXJUYXJnZXQsIHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5ydHQoe1xuICAgICAgICAgICAgcmVuZGVyVGFyZ2V0LFxuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICBjYW1lcmEsXG4gICAgICAgICAgICBjbGVhckNvbG9yOiB0aGlzLmNsZWFyQ29sb3IsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlc2V0QnVmZmVycygpIHtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy5idWZmZXJzWzFdO1xuICAgICAgICB0aGlzLndyaXRlID0gdGhpcy5idWZmZXJzWzBdO1xuICAgIH1cblxuICAgIHN3YXBCdWZmZXJzKCkge1xuICAgICAgICB0aGlzLnRlbXAgPSB0aGlzLnJlYWQ7XG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMud3JpdGU7XG4gICAgICAgIHRoaXMud3JpdGUgPSB0aGlzLnRlbXA7XG4gICAgfVxuXG4gICAgcmVuZGVyKHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgdGhpcy5yZXNldEJ1ZmZlcnMoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb1RleHR1cmUodGhpcy53cml0ZSwgc2NlbmUsIGNhbWVyYSk7XG5cbiAgICAgICAgLy8gcGluZyBwb25nIHRleHR1cmVzIHRocm91Z2ggcGFzc2VzXG4gICAgICAgIGNvbnN0IHRvdGFsID0gdGhpcy5wYXNzZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhc3Nlc1tpXS5lbmFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXBCdWZmZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzZXNbaV0uc2V0VW5pZm9ybSgndV9pbnB1dCcsIHRoaXMucmVhZC50ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRvVGV4dHVyZSh0aGlzLndyaXRlLCB0aGlzLnBhc3Nlc1tpXS5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVuZGVyIGxhc3QgcGFzcyB0byBzY3JlZW5cbiAgICAgICAgdGhpcy5zY3JlZW4uc2V0VW5pZm9ybSgndV9pbnB1dCcsIHRoaXMud3JpdGUudGV4dHVyZSk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NyZWVuLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb3NlcjtcbiIsImNsYXNzIFBlcmZvcm1hbmNlIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICB0aGlzLnRoZW1lID0gcGFyYW1zLnRoZW1lIHx8IHtcbiAgICAgICAgICAgIGZvbnQ6ICdmb250LWZhbWlseTpzYW5zLXNlcmlmO2ZvbnQtc2l6ZTp4eC1zbWFsbDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHg7LW1vei1vc3gtZm9udC1zbW9vdGhpbmc6IGdyYXlzY2FsZTstd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsnLFxuICAgICAgICAgICAgY29sb3IxOiAnIzI0MjQyNCcsXG4gICAgICAgICAgICBjb2xvcjI6ICcjMmEyYTJhJyxcbiAgICAgICAgICAgIGNvbG9yMzogJyM2NjYnLFxuICAgICAgICAgICAgY29sb3I0OiAnIzk5OScsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmZpeGVkO2JvdHRvbTowO2xlZnQ6MDttaW4td2lkdGg6ODBweDtvcGFjaXR5OjAuOTt6LWluZGV4OjEwMDAwOyc7XG5cbiAgICAgICAgdGhpcy5ob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5ob2xkZXIuc3R5bGUuY3NzVGV4dCA9IGBwYWRkaW5nOjNweDtiYWNrZ3JvdW5kLWNvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjF9O2A7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmhvbGRlcik7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IGAke3RoaXMudGhlbWUuZm9udH07Y29sb3I6JHt0aGlzLnRoZW1lLmNvbG9yM307YDtcbiAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ1BlcmZvcm1hbmNlJztcbiAgICAgICAgdGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gICAgICAgIHRoaXMubXNUZXh0cyA9IFtdO1xuXG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICByZWJ1aWxkKHBhcmFtcykge1xuICAgICAgICB0aGlzLm1zVGV4dHMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGAke3RoaXMudGhlbWUuZm9udH07Y29sb3I6JHt0aGlzLnRoZW1lLmNvbG9yNH07YmFja2dyb3VuZC1jb2xvcjoke3RoaXMudGhlbWUuY29sb3IyfTtgO1xuICAgICAgICAgICAgdGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLm1zVGV4dHNba2V5XSA9IGVsZW1lbnQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZShyZW5kZXJlcikge1xuICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tc1RleHRzKS5sZW5ndGggIT09IE9iamVjdC5rZXlzKHJlbmRlcmVyLnBlcmZvcm1hbmNlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucmVidWlsZChyZW5kZXJlci5wZXJmb3JtYW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyhyZW5kZXJlci5wZXJmb3JtYW5jZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1zVGV4dHNba2V5XS50ZXh0Q29udGVudCA9IGAke2tleX06ICR7cmVuZGVyZXIucGVyZm9ybWFuY2Vba2V5XX1gO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBlcmZvcm1hbmNlO1xuIiwiLyoqXG4gKiBDb3JlXG4gKiBAbW9kdWxlIGNvcmVcbiAqL1xuaW1wb3J0ICogYXMgY2h1bmtzIGZyb20gJy4vc2hhZGVycy9jaHVua3MnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgKiBhcyBjYW1lcmFzIGZyb20gJy4vY2FtZXJhcyc7XG5pbXBvcnQgKiBhcyBzaGFkZXJzIGZyb20gJy4vc2hhZGVycyc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgKiBhcyBjb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMnO1xuXG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9jb3JlL3JlbmRlcmVyJztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4vY29yZS9vYmplY3QzJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL2NvcmUvc2NlbmUnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vY29yZS9tb2RlbCc7XG5pbXBvcnQgTWVzaCBmcm9tICcuL2NvcmUvbWVzaCc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL2NvcmUvdGV4dHVyZSc7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vY29yZS9ydCc7XG5pbXBvcnQgQ29tcG9zZXIgZnJvbSAnLi9jb3JlL2NvbXBvc2VyJztcbmltcG9ydCBQYXNzIGZyb20gJy4vY29yZS9wYXNzJztcbmltcG9ydCBQZXJmb3JtYW5jZSBmcm9tICcuL2NvcmUvcGVyZm9ybWFuY2UnO1xuXG5leHBvcnQge1xuICAgIGNodW5rcyxcbiAgICB1dGlscyxcbiAgICBjYW1lcmFzLFxuICAgIHNoYWRlcnMsXG4gICAgaGVscGVycyxcbiAgICBjb25zdGFudHMsXG4gICAgUmVuZGVyZXIsXG4gICAgT2JqZWN0MyxcbiAgICBTY2VuZSxcbiAgICBNb2RlbCxcbiAgICBNZXNoLFxuICAgIFRleHR1cmUsXG4gICAgUmVuZGVyVGFyZ2V0LFxuICAgIENvbXBvc2VyLFxuICAgIFBhc3MsXG4gICAgUGVyZm9ybWFuY2UsXG59O1xuIl0sIm5hbWVzIjpbIkxJR0hUIiwiZmFjdG9yeSIsImRpcmVjdGlvbmFsIiwiYmFzZSIsIkZPRyIsImxpbmVhciIsImV4cG9uZW50aWFsIiwiZXhwb25lbnRpYWwyIiwiTUFYX0RJUkVDVElPTkFMIiwiRElSRUNUSU9OQUxfTElHSFQiLCJTSEFERVJfQkFTSUMiLCJTSEFERVJfREVGQVVMVCIsIlNIQURFUl9CSUxMQk9BUkQiLCJTSEFERVJfU0hBRE9XIiwiU0hBREVSX1NFTSIsIlNIQURFUl9DVVNUT00iLCJEUkFXIiwiUE9JTlRTIiwiTElORVMiLCJUUklBTkdMRVMiLCJTSURFIiwiRlJPTlQiLCJCQUNLIiwiQk9USCIsIkNPTlRFWFQiLCJXRUJHTCIsIldFQkdMMiIsImxpYnJhcnkiLCJ2ZXJzaW9uIiwiZ2wiLCJjb250ZXh0VHlwZSIsInRlc3RDb250ZXh0MSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldENvbnRleHQiLCJ0ZXN0Q29udGV4dDIiLCJleHRlbnNpb25zIiwidmVydGV4QXJyYXlPYmplY3QiLCJnZXRFeHRlbnNpb24iLCJpbnN0YW5jZWRBcnJheXMiLCJzdGFuZGFyZERlcml2YXRpdmVzIiwiZGVwdGhUZXh0dXJlcyIsInNldENvbnRleHRUeXBlIiwicHJlZmVycmVkIiwiZ2wyIiwiZ2wxIiwiZGVwdGhUZXh0dXJlIiwiZ2V0Q29udGV4dFR5cGUiLCJzZXRDb250ZXh0IiwiY29udGV4dCIsInN1cHBvcnRzIiwiVUJPIiwic2NlbmUiLCJtb2RlbCIsImxpZ2h0cyIsIk5PSVNFIiwiQ0xJUFBJTkciLCJ2ZXJ0ZXhfcHJlIiwidmVydGV4IiwiZnJhZ21lbnRfcHJlIiwiZnJhZ21lbnQiLCJFWFRFTlNJT05TIiwiaGFyZCIsIlNIQURPVyIsIkVQU0lMT04iLCJBUlJBWV9UWVBFIiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJkZWdyZWUiLCJNYXRoIiwiUEkiLCJjcmVhdGUiLCJvdXQiLCJnbE1hdHJpeCIsImNvcHkiLCJhIiwiZnJvbVZhbHVlcyIsIm0wMCIsIm0wMSIsIm0wMiIsIm0wMyIsIm0xMCIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMCIsIm0yMSIsIm0yMiIsIm0yMyIsIm0zMCIsIm0zMSIsIm0zMiIsIm0zMyIsImlkZW50aXR5IiwidHJhbnNwb3NlIiwiYTAxIiwiYTAyIiwiYTAzIiwiYTEyIiwiYTEzIiwiYTIzIiwiaW52ZXJ0IiwiYTAwIiwiYTEwIiwiYTExIiwiYTIwIiwiYTIxIiwiYTIyIiwiYTMwIiwiYTMxIiwiYTMyIiwiYTMzIiwiYjAwIiwiYjAxIiwiYjAyIiwiYjAzIiwiYjA0IiwiYjA1IiwiYjA2IiwiYjA3IiwiYjA4IiwiYjA5IiwiYjEwIiwiYjExIiwiZGV0IiwibXVsdGlwbHkiLCJiIiwiYjAiLCJiMSIsImIyIiwiYjMiLCJ0cmFuc2xhdGUiLCJ2IiwieCIsInkiLCJ6Iiwic2NhbGUiLCJyb3RhdGUiLCJyYWQiLCJheGlzIiwibGVuIiwic3FydCIsInMiLCJjIiwidCIsImIxMiIsImIyMCIsImIyMSIsImIyMiIsInNpbiIsImNvcyIsInBlcnNwZWN0aXZlIiwiZm92eSIsImFzcGVjdCIsIm5lYXIiLCJmYXIiLCJmIiwidGFuIiwibmYiLCJvcnRobyIsImxlZnQiLCJyaWdodCIsImJvdHRvbSIsInRvcCIsImxyIiwiYnQiLCJsb29rQXQiLCJleWUiLCJjZW50ZXIiLCJ1cCIsIngwIiwieDEiLCJ4MiIsInkwIiwieTEiLCJ5MiIsInowIiwiejEiLCJ6MiIsImV5ZXgiLCJleWV5IiwiZXlleiIsInVweCIsInVweSIsInVweiIsImNlbnRlcngiLCJjZW50ZXJ5IiwiY2VudGVyeiIsImFicyIsInRhcmdldFRvIiwidGFyZ2V0IiwibGVuZ3RoIiwibm9ybWFsaXplIiwiZG90IiwiY3Jvc3MiLCJheCIsImF5IiwiYXoiLCJieCIsImJ5IiwiYnoiLCJmb3JFYWNoIiwidmVjIiwic3RyaWRlIiwib2Zmc2V0IiwiY291bnQiLCJmbiIsImFyZyIsImkiLCJsIiwibWluIiwidyIsInNldEF4aXNBbmdsZSIsImdldEF4aXNBbmdsZSIsIm91dF9heGlzIiwicSIsImFjb3MiLCJyb3RhdGVYIiwiYXciLCJidyIsInJvdGF0ZVkiLCJyb3RhdGVaIiwic2xlcnAiLCJvbWVnYSIsImNvc29tIiwic2lub20iLCJzY2FsZTAiLCJzY2FsZTEiLCJmcm9tTWF0MyIsIm0iLCJmVHJhY2UiLCJmUm9vdCIsImoiLCJrIiwidmVjNCIsInJvdGF0aW9uVG8iLCJ0bXB2ZWMzIiwidmVjMyIsInhVbml0VmVjMyIsInlVbml0VmVjMyIsInNxbGVycCIsInRlbXAxIiwidGVtcDIiLCJkIiwic2V0QXhlcyIsIm1hdHIiLCJtYXQzIiwidmlldyIsImFycmF5IiwiaGV4SW50VG9SZ2IiLCJoZXgiLCJyIiwiZyIsImhleFN0cmluZ1RvUmdiIiwicmVzdWx0IiwiZXhlYyIsInBhcnNlSW50IiwiY29tcG9uZW50VG9IZXgiLCJ0b1N0cmluZyIsInJnYlRvSGV4IiwiaGV4UiIsImhleEciLCJoZXhCIiwiY29udmVydCIsImNvbG9yIiwicmdiIiwicmFuZG9tUmFuZ2UiLCJtYXgiLCJyYW5kb20iLCJtb2QiLCJuIiwiV09SRF9SRUdYIiwid29yZCIsIlJlZ0V4cCIsIkxJTkVfUkVHWCIsIlZFUlRFWCIsIm1hdGNoIiwicmVwbGFjZSIsIkZSQUdNRU5UIiwic2hhZGVyIiwidGV4dHVyZUdsb2JhbFJlZ3giLCJ0ZXh0dXJlU2luZ2xlUmVneCIsInRleHR1cmVVbmlmb3JtTmFtZVJlZ3giLCJtYXRjaGVzIiwicmVwbGFjZW1lbnQiLCJ1bmlmb3JtTmFtZSIsInNwbGl0IiwidW5pZm9ybVR5cGUiLCJHRU5FUklDIiwiVkVSVEVYX1JVTEVTIiwiRlJBR01FTlRfUlVMRVMiLCJwYXJzZSIsInNoYWRlclR5cGUiLCJydWxlcyIsInJ1bGUiLCJWZWN0b3IzIiwiZGF0YSIsInZhbHVlIiwidXVpZCIsImF4aXNBbmdsZSIsInF1YXRlcm5pb25BeGlzQW5nbGUiLCJPYmplY3QzIiwidWlkIiwicGFyZW50IiwiY2hpbGRyZW4iLCJwb3NpdGlvbiIsInJvdGF0aW9uIiwiX3RyYW5zcGFyZW50IiwiX3Zpc2libGUiLCJxdWF0ZXJuaW9uIiwicXVhdCIsImxvb2tUb1RhcmdldCIsIm1hdHJpY2VzIiwibWF0NCIsImRpcnR5Iiwic29ydGluZyIsInRyYW5zcGFyZW50IiwiYXR0cmlidXRlcyIsInNjZW5lR3JhcGhTb3J0ZXIiLCJwdXNoIiwiaW5kZXgiLCJpbmRleE9mIiwiZGVzdHJveSIsInNwbGljZSIsIm9iamVjdCIsInVuZGVmaW5lZCIsInRyYXZlcnNlIiwidXBkYXRlTWF0cmljZXMiLCJ2aXNpYmxlIiwiT3J0aG9ncmFwaGljQ2FtZXJhIiwicGFyYW1zIiwiT2JqZWN0IiwiYXNzaWduIiwicHJvamVjdGlvbiIsIlBlcnNwZWN0aXZlQ2FtZXJhIiwiZm92Iiwid2lkdGgiLCJoZWlnaHQiLCJCYXNpYyIsInByb3BzIiwidHlwZSIsIm1vZGUiLCJ3aXJlZnJhbWUiLCJ1bmlmb3JtcyIsInVfY29sb3IiLCJUZXh0dXJlIiwibWFnRmlsdGVyIiwiTkVBUkVTVCIsIm1pbkZpbHRlciIsIndyYXBTIiwiQ0xBTVBfVE9fRURHRSIsIndyYXBUIiwiVWludDhBcnJheSIsInRleHR1cmUiLCJjcmVhdGVUZXh0dXJlIiwiYmluZFRleHR1cmUiLCJURVhUVVJFXzJEIiwidGV4SW1hZ2UyRCIsIlJHQkEiLCJVTlNJR05FRF9CWVRFIiwidGV4UGFyYW1ldGVyaSIsIlRFWFRVUkVfTUFHX0ZJTFRFUiIsIlRFWFRVUkVfTUlOX0ZJTFRFUiIsIlRFWFRVUkVfV1JBUF9TIiwiVEVYVFVSRV9XUkFQX1QiLCJwaXhlbFN0b3JlaSIsIlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCIsInVybCIsImltZyIsIkltYWdlIiwiY3Jvc3NPcmlnaW4iLCJvbmxvYWQiLCJ1cGRhdGUiLCJzcmMiLCJpbWFnZSIsImdlbmVyYXRlTWlwbWFwIiwiVU5QQUNLX0ZMSVBfWV9XRUJHTCIsIkRlZmF1bHQiLCJtYXAiLCJmcm9tSW1hZ2UiLCJ1X21hcCIsIkJpbGxib2FyZCIsIlNlbSIsIlBST0dSQU1fUE9PTCIsImNyZWF0ZVNoYWRlciIsInN0ciIsInNoYWRlclNvdXJjZSIsImNvbXBpbGVTaGFkZXIiLCJjb21waWxlZCIsImdldFNoYWRlclBhcmFtZXRlciIsIkNPTVBJTEVfU1RBVFVTIiwiZXJyb3IiLCJnZXRTaGFkZXJJbmZvTG9nIiwiZGVsZXRlU2hhZGVyIiwiY29uc29sZSIsIkVycm9yIiwiY3JlYXRlUHJvZ3JhbSIsInByb2dyYW1JRCIsInBvb2wiLCJ2cyIsIlZFUlRFWF9TSEFERVIiLCJmcyIsIkZSQUdNRU5UX1NIQURFUiIsInByb2dyYW0iLCJhdHRhY2hTaGFkZXIiLCJsaW5rUHJvZ3JhbSIsIlVibyIsImJvdW5kTG9jYXRpb24iLCJidWZmZXIiLCJjcmVhdGVCdWZmZXIiLCJiaW5kQnVmZmVyIiwiVU5JRk9STV9CVUZGRVIiLCJidWZmZXJEYXRhIiwiU1RBVElDX0RSQVciLCJiaW5kQnVmZmVyQmFzZSIsInNldCIsImJ1ZmZlclN1YkRhdGEiLCJWYW8iLCJ2YW8iLCJjcmVhdGVWZXJ0ZXhBcnJheSIsImJpbmRWZXJ0ZXhBcnJheSIsImNyZWF0ZVZlcnRleEFycmF5T0VTIiwiYmluZFZlcnRleEFycmF5T0VTIiwiZGVsZXRlVmVydGV4QXJyYXkiLCJkZWxldGVWZXJ0ZXhBcnJheU9FUyIsImdldFR5cGVTaXplIiwiaW5pdEF0dHJpYnV0ZXMiLCJwcm9wIiwiY3VycmVudCIsImxvY2F0aW9uIiwiZ2V0QXR0cmliTG9jYXRpb24iLCJBUlJBWV9CVUZGRVIiLCJiaW5kQXR0cmlidXRlcyIsImtleXMiLCJrZXkiLCJzaXplIiwiaW5zdGFuY2VkIiwidmVydGV4QXR0cmliUG9pbnRlciIsIkZMT0FUIiwiZW5hYmxlVmVydGV4QXR0cmliQXJyYXkiLCJkaXZpc29yIiwidmVydGV4QXR0cmliRGl2aXNvciIsInZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRSIsInVwZGF0ZUF0dHJpYnV0ZXMiLCJEWU5BTUlDX0RSQVciLCJpbml0VW5pZm9ybXMiLCJ0ZXh0dXJlSW5kaWNlcyIsIlRFWFRVUkUwIiwiVEVYVFVSRTEiLCJURVhUVVJFMiIsIlRFWFRVUkUzIiwiVEVYVFVSRTQiLCJURVhUVVJFNSIsImdldFVuaWZvcm1Mb2NhdGlvbiIsInRleHR1cmVJbmRleCIsImFjdGl2ZVRleHR1cmUiLCJ1cGRhdGVVbmlmb3JtcyIsInVuaWZvcm0iLCJ1bmlmb3JtTWF0cml4NGZ2IiwidW5pZm9ybU1hdHJpeDNmdiIsInVuaWZvcm00ZnYiLCJ1bmlmb3JtM2Z2IiwidW5pZm9ybTJmdiIsInVuaWZvcm0xZiIsInVuaWZvcm0xaSIsIk1vZGVsIiwicG9seWdvbk9mZnNldCIsInBvbHlnb25PZmZzZXRGYWN0b3IiLCJwb2x5Z29uT2Zmc2V0VW5pdHMiLCJjbGlwcGluZyIsImVuYWJsZSIsInBsYW5lcyIsImluc3RhbmNlQ291bnQiLCJpc0luc3RhbmNlIiwic2lkZSIsIlN0cmluZyIsInNoYWRvd3MiLCJuYW1lIiwiaW5kaWNlcyIsImdsc2wzdG8xIiwidXNlUHJvZ3JhbSIsIkVMRU1FTlRfQVJSQVlfQlVGRkVSIiwiaW5TaGFkb3dNYXAiLCJQT0xZR09OX09GRlNFVF9GSUxMIiwiZGlzYWJsZSIsIkJMRU5EIiwiYmxlbmRGdW5jIiwiU1JDX0FMUEhBIiwiT05FX01JTlVTX1NSQ19BTFBIQSIsIkRFUFRIX1RFU1QiLCJDVUxMX0ZBQ0UiLCJjdWxsRmFjZSIsImRyYXdFbGVtZW50c0luc3RhbmNlZCIsIlVOU0lHTkVEX1NIT1JUIiwiZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUiLCJkcmF3RWxlbWVudHMiLCJkcmF3QXJyYXlzIiwiYV9wb3NpdGlvbiIsInNoYWRlcklEIiwiTWVzaCIsIl9zaGFkZXIiLCJnZW9tZXRyeSIsInBvc2l0aW9ucyIsIm5vcm1hbHMiLCJ1dnMiLCJzZXRBdHRyaWJ1dGUiLCJzZXRJbmRleCIsIlVpbnQxNkFycmF5Iiwic2V0VW5pZm9ybSIsInNldFNoYWRlciIsIkF4aXNIZWxwZXIiLCJnMSIsImcyIiwiZzMiLCJtMSIsIm0yIiwibTMiLCJhZGQiLCJzeCIsInN5Iiwic3oiLCJhX25vcm1hbCIsImkzIiwidjB4IiwidjB5IiwidjB6IiwibngiLCJueSIsIm56IiwidjF4IiwidjF5IiwidjF6IiwiY29uY2F0IiwicmVmZXJlbmNlIiwicmVzaXplIiwiZG9tRWxlbWVudCIsInJhdGlvIiwic3R5bGUiLCJ1bnN1cHBvcnRlZCIsImRpdiIsImlubmVySFRNTCIsImRpc3BsYXkiLCJtYXJnaW4iLCJib3JkZXIiLCJiYWNrZ3JvdW5kQ29sb3IiLCJib3JkZXJSYWRpdXMiLCJwYWRkaW5nIiwiZm9udEZhbWlseSIsImZvbnRTaXplIiwidGV4dEFsaWduIiwiTGlnaHQiLCJEaXJlY3Rpb25hbCIsImludGVuc2l0eSIsIlNjZW5lIiwiZm9nIiwic3RhcnQiLCJlbmQiLCJkZW5zaXR5IiwiYWRkTGlnaHQiLCJsaWdodCIsIlJlbmRlclRhcmdldCIsImludGVybmFsZm9ybWF0IiwiREVQVEhfQ09NUE9ORU5UIiwiREVQVEhfQ09NUE9ORU5UMjQiLCJVTlNJR05FRF9JTlQiLCJmcmFtZUJ1ZmZlciIsImNyZWF0ZUZyYW1lYnVmZmVyIiwiYmluZEZyYW1lYnVmZmVyIiwiRlJBTUVCVUZGRVIiLCJMSU5FQVIiLCJmcmFtZWJ1ZmZlclRleHR1cmUyRCIsIkNPTE9SX0FUVEFDSE1FTlQwIiwiREVQVEhfQVRUQUNITUVOVCIsIlNoYWRvd01hcFJlbmRlcmVyIiwicnQiLCJzaGFkb3ciLCJiaWFzIiwiY2FtZXJhIiwiUGVyc3BlY3RpdmUiLCJPcnRob2dyYXBoaWMiLCJzZXRMaWdodE9yaWdpbiIsImxhc3RQcm9ncmFtIiwic29ydCIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJ0aW1lIiwibm9ybWFsIiwibW9kZWxWaWV3IiwiaW52ZXJzZWRNb2RlbFZpZXciLCJjYWNoZWRTY2VuZSIsImNhY2hlZENhbWVyYSIsIlJlbmRlcmVyIiwic3VwcG9ydGVkIiwic29ydGVkIiwib3BhcXVlIiwicGVyZm9ybWFuY2UiLCJ2ZXJ0aWNlcyIsImluc3RhbmNlcyIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJjYW52YXMiLCJhbnRpYWxpYXMiLCJzZXNzaW9uIiwiZ2xpIiwiZ3JlZXRpbmciLCJsaWIiLCJwYXJhbWV0ZXJzIiwidmFsdWVzIiwiYXJncyIsImdldFBhcmFtZXRlciIsIlZFUlNJT04iLCJsb2ciLCJpbml0IiwicGVyU2NlbmUiLCJwZXJNb2RlbCIsInNoYWRvd21hcCIsInNMb2NhdGlvbiIsImdldFVuaWZvcm1CbG9ja0luZGV4IiwibUxvY2F0aW9uIiwiZExvY2F0aW9uIiwidW5pZm9ybUJsb2NrQmluZGluZyIsInVwZGF0ZUNhbWVyYU1hdHJpeCIsImJpbmQiLCJyZW5kZXJTaGFkb3ciLCJyZW5kZXJPYmplY3QiLCJyZW5kZXJUYXJnZXQiLCJjbGVhckNvbG9yIiwidmlld3BvcnQiLCJjbGVhciIsIkNPTE9SX0JVRkZFUl9CSVQiLCJERVBUSF9CVUZGRVJfQklUIiwiZHJhdyIsInJ0dCIsIm1hdHJpeCIsImluaXRVbmlmb3Jtc1Blck1vZGVsIiwiY2hhbmdlUHJvZ3JhbSIsInVwZGF0ZVVuaWZvcm1zUGVyTW9kZWwiLCJ1bmJpbmQiLCJwcm9qZWN0aW9uTWF0cml4Iiwidmlld01hdHJpeCIsImZvZ1NldHRpbmdzIiwiZm9nQ29sb3IiLCJpR2xvYmFsVGltZSIsImdsb2JhbENsaXBTZXR0aW5ncyIsImdsb2JhbENsaXBQbGFuZTAiLCJnbG9iYWxDbGlwUGxhbmUxIiwiZ2xvYmFsQ2xpcFBsYW5lMiIsIm1vZGVsTWF0cml4Iiwibm9ybWFsTWF0cml4IiwibG9jYWxDbGlwU2V0dGluZ3MiLCJsb2NhbENsaXBQbGFuZTAiLCJsb2NhbENsaXBQbGFuZTEiLCJsb2NhbENsaXBQbGFuZTIiLCJzaGFkb3dNYXAiLCJzaGFkb3dNYXRyaXgiLCJzaGFkb3dOZWFyIiwic2hhZG93RmFyIiwiUGFzcyIsInF1YWQiLCJ1X2lucHV0IiwiQ29tcG9zZXIiLCJyZW5kZXJlciIsInBhc3NlcyIsInNjcmVlbiIsImNvbXBpbGUiLCJidWZmZXJzIiwicmVhZCIsIndyaXRlIiwic2V0U2l6ZSIsInNldFJhdGlvIiwicGFzcyIsInRlbXAiLCJyZXNldEJ1ZmZlcnMiLCJyZW5kZXJUb1RleHR1cmUiLCJ0b3RhbCIsInN3YXBCdWZmZXJzIiwicmVuZGVyIiwiUGVyZm9ybWFuY2UiLCJ0aGVtZSIsImZvbnQiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvcjMiLCJjb2xvcjQiLCJjb250YWluZXIiLCJjc3NUZXh0IiwiaG9sZGVyIiwiYXBwZW5kQ2hpbGQiLCJ0aXRsZSIsIm1zVGV4dHMiLCJlbGVtZW50IiwicmVidWlsZCIsInRleHRDb250ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBQSxJQUFNQSxRQUFRO0lBQ1ZDLGFBQVMsbUJBQU07SUFDWCw2VUFPRUQsTUFBTUUsV0FBTixFQVBGO0lBUUgsS0FWUzs7SUFZVkEsaUJBQWEsdUJBQU07SUFDZjtJQWFIO0lBMUJTLENBQWQ7O0lDQUEsU0FBU0MsSUFBVCxHQUFnQjtJQUNaO0lBUUg7O0lBRUQsSUFBTUMsTUFBTTtJQUNSQyxZQUFRLGtCQUFNO0lBQ1Ysc0VBRU1GLE1BRk47SUFPSCxLQVRPO0lBVVJHLGlCQUFhLHVCQUFNO0lBQ2Ysc0VBRU1ILE1BRk47SUFPSCxLQWxCTztJQW1CUkksa0JBQWMsd0JBQU07SUFDaEIsc0VBRU1KLE1BRk47SUFPSDtJQTNCTyxDQUFaOztJQ1hBOzs7Ozs7OztBQVFBLElBQU8sSUFBTUssa0JBQWtCLENBQXhCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsb0JBQW9CLElBQTFCOztJQUVQOzs7Ozs7OztBQVFBLElBQU8sSUFBTUMsZUFBZSxJQUFyQjs7SUFFUDs7Ozs7Ozs7QUFRQSxJQUFPLElBQU1DLGlCQUFpQixJQUF2Qjs7SUFFUDs7Ozs7Ozs7QUFRQSxJQUFPLElBQU1DLG1CQUFtQixJQUF6Qjs7SUFFUDs7Ozs7Ozs7QUFRQSxJQUFPLElBQU1DLGdCQUFnQixJQUF0Qjs7SUFFUDs7Ozs7Ozs7QUFRQSxJQUFPLElBQU1DLGFBQWEsSUFBbkI7O0lBRVA7Ozs7Ozs7O0FBUUEsSUFBTyxJQUFNQyxnQkFB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
