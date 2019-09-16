(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.lowww = global.lowww || {}, global.lowww.core = {})));
}(this, function (exports) { 'use strict';

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
    var version = "1.2.0";

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
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 3x3 Matrix
     * @module mat3
     */

    /**
     * Creates a new identity mat3
     *
     * @returns {mat3} a new 3x3 matrix
     */

    function create() {
      var out = new ARRAY_TYPE(9);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
      }

      out[0] = 1;
      out[4] = 1;
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

    function create$1() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
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

    function copy(out, a) {
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

    function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
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

    function identity(out) {
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

    function transpose(out, a) {
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

    function invert(out, a) {
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
      var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

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

    function multiply(out, a, b) {
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
          a33 = a[15]; // Cache only the current line of the second matrix

      var b0 = b[0],
          b1 = b[1],
          b2 = b[2],
          b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
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

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
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

    function scale(out, a, v) {
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

    function rotate(out, a, rad, axis) {
      var x = axis[0],
          y = axis[1],
          z = axis[2];
      var len = Math.hypot(x, y, z);
      var s, c, t;
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;
      var b00, b01, b02;
      var b10, b11, b12;
      var b20, b21, b22;

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
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11]; // Construct the elements of the rotation matrix

      b00 = x * x * t + c;
      b01 = y * x * t + z * s;
      b02 = z * x * t - y * s;
      b10 = x * y * t - z * s;
      b11 = y * y * t + c;
      b12 = z * y * t + x * s;
      b20 = x * z * t + y * s;
      b21 = y * z * t - x * s;
      b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

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
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
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
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

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
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
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
        return identity(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

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
      len = Math.hypot(y0, y1, y2);

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

    function create$2() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

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
      return Math.hypot(x, y, z);
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues$1(x, y, z) {
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

    function copy$1(out, a) {
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
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
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
      var vec = create$2();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

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
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
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

    function create$3() {
      var out = new ARRAY_TYPE(4);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
      }

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

    function fromValues$2(x, y, z, w) {
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
      }

      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
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
      var vec = create$3();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

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
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          vec[3] = a[i + 3];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
          a[i + 3] = vec[3];
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

    function create$4() {
      var out = new ARRAY_TYPE(4);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      out[3] = 1;
      return out;
    }
    /**
     * Set a quat to the identity quaternion
     *
     * @param {quat} out the receiving quaternion
     * @returns {quat} out
     */

    function identity$1(out) {
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

      if (s > EPSILON) {
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

    function rotateX(out, a, rad) {
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

    function rotateY(out, a, rad) {
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

    function rotateZ(out, a, rad) {
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
      var omega, cosom, sinom, scale0, scale1; // calc cosine

      cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      } // calculate coefficients


      if (1.0 - cosom > EPSILON) {
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
      } // calculate final values


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
      var fRoot;

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
      var tmpvec3 = create$2();
      var xUnitVec3 = fromValues$1(1, 0, 0);
      var yUnitVec3 = fromValues$1(0, 1, 0);
      return function (out, a, b) {
        var dot$1 = dot(a, b);

        if (dot$1 < -0.999999) {
          cross(tmpvec3, xUnitVec3, a);
          if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
          normalize(tmpvec3, tmpvec3);
          setAxisAngle(out, tmpvec3, Math.PI);
          return out;
        } else if (dot$1 > 0.999999) {
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
          out[3] = 1 + dot$1;
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
      var temp1 = create$4();
      var temp2 = create$4();
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
      var matr = create();
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

    // pvt
    function normalize$3(array) {
        return fromValues$1(array[0] / 255, array[1] / 255, array[2] / 255);
    }

    function hexIntToRgb(hex) {
        var r = hex >> 16;
        var g = hex >> 8 & 0xff; // eslint-disable-line
        var b = hex & 0xff;
        return fromValues$1(r, g, b);
    }

    function hexStringToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? fromValues$1(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
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
        var color = create$2();
        var rgb = typeof hex === 'number' ? hexIntToRgb(hex) : hexStringToRgb(hex);
        copy$1(color, normalize$3(rgb));
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

            this.data = fromValues$1(x, y, z);
        }

        createClass(Vector3, [{
            key: 'set',
            value: function set(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
        }, {
            key: 'x',
            set: function set(value) {
                this.data[0] = value;
            },
            get: function get() {
                return this.data[0];
            }
        }, {
            key: 'y',
            set: function set(value) {
                this.data[1] = value;
            },
            get: function get() {
                return this.data[1];
            }
        }, {
            key: 'z',
            set: function set(value) {
                this.data[2] = value;
            },
            get: function get() {
                return this.data[2];
            }
        }]);
        return Vector3;
    }();

    var uuid = 0;
    var axisAngle = 0;
    var quaternionAxisAngle = create$2();

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

            this.quaternion = create$4();

            this.target = create$2();
            this.up = fromValues$1(0, 1, 0);
            this.lookToTarget = false;

            this.matrices = {
                parent: create$1(),
                model: create$1(),
                lookAt: create$1()
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
                identity(this.matrices.parent);
                identity(this.matrices.model);
                identity(this.matrices.lookAt);
                identity$1(this.quaternion);

                if (this.parent) {
                    copy(this.matrices.parent, this.parent.matrices.model);
                    multiply(this.matrices.model, this.matrices.model, this.matrices.parent);
                }

                if (this.lookToTarget) {
                    targetTo(this.matrices.lookAt, this.position.data, this.target, this.up);
                    multiply(this.matrices.model, this.matrices.model, this.matrices.lookAt);
                } else {
                    translate(this.matrices.model, this.matrices.model, this.position.data);
                    rotateX(this.quaternion, this.quaternion, this.rotation.x);
                    rotateY(this.quaternion, this.quaternion, this.rotation.y);
                    rotateZ(this.quaternion, this.quaternion, this.rotation.z);
                    axisAngle = getAxisAngle(quaternionAxisAngle, this.quaternion);
                    rotate(this.matrices.model, this.matrices.model, axisAngle, quaternionAxisAngle);
                }
                scale(this.matrices.model, this.matrices.model, this.scale.data);
            }
        }, {
            key: 'init',
            value: function init() {
                // to be overriden;
            }
        }, {
            key: 'add',
            value: function add(model) {
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
            set: function set(value) {
                this.dirty.transparent = this.transparent !== value;
                this._transparent = value;
            },
            get: function get() {
                return this._transparent;
            }
        }, {
            key: 'visible',
            set: function set(value) {
                this.dirty.sorting = this.visible !== value;
                this._visible = value;
            },
            get: function get() {
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

            _this.matrices.projection = create$1();
            return _this;
        }

        createClass(OrthographicCamera, [{
            key: 'lookAt',
            value: function lookAt(v) {
                copy$1(this.target, v);
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

            _this.matrices.projection = create$1();
            return _this;
        }

        createClass(PerspectiveCamera, [{
            key: 'lookAt',
            value: function lookAt(v) {
                copy$1(this.target, v);
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

        var color = props.color || fromValues$1(1, 1, 1);

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

        var color = props.color || fromValues$1(1, 1, 1);
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
                planes: [create$3(), create$3(), create$3()]
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
            get: function get() {
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
            var g1 = {
                positions: [].concat(toConsumableArray(fromValues$1(0, 0, 0)), toConsumableArray(fromValues$1(size, 0, 0)))
            };
            var g2 = {
                positions: [].concat(toConsumableArray(fromValues$1(0, 0, 0)), toConsumableArray(fromValues$1(0, size, 0)))
            };
            var g3 = {
                positions: [].concat(toConsumableArray(fromValues$1(0, 0, 0)), toConsumableArray(fromValues$1(0, 0, size)))
            };

            var m1 = new Basic({
                color: fromValues$1(1, 0, 0),
                wireframe: true
            });
            var m2 = new Basic({
                color: fromValues$1(0, 1, 0),
                wireframe: true
            });
            var m3 = new Basic({
                color: fromValues$1(0, 0, 1),
                wireframe: true
            });

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

            var length = props.model.attributes.a_normal.value.length / 3;
            for (var i = 0; i < length; i++) {
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

            var shader = new Basic({
                color: fromValues$1(0, 1, 1),
                wireframe: true
            });
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

                copy$1(this.position.data, this.reference.position.data);
                copy$1(this.rotation.data, this.reference.rotation.data);
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

            this.position = create$2();
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

            _this.color = props.color || fromValues$1(1, 1, 1);
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
                color: fromValues$2(0, 0, 0, 1),
                start: 500,
                end: 1000,
                density: 0.00025
            };

            _this.clipping = {
                enable: false,
                planes: [create$3(), create$3(), create$3()]
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
                view: create$1(),
                shadow: create$1(),
                bias: fromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0)
            };

            // origin of directional light
            this.camera = new PerspectiveCamera({
                fov: 60,
                near: 1,
                far: 1000
            });

            this.camera = new OrthographicCamera();
            this.camera.position.z = 1; // TODO: remove this when fix lookAt bug on gl-matrix
            this.setLightOrigin(props.light || fromValues$1(100, 250, 500));
        }

        // move the camera to the light position


        createClass(ShadowMapRenderer, [{
            key: 'setLightOrigin',
            value: function setLightOrigin(vec) {
                // CAMERA

                // update camera position
                copy$1(this.camera.position.data, vec);

                // update view matrix
                identity(this.matrices.view);
                lookAt(this.matrices.view, this.camera.position.data, this.camera.target, this.camera.up);

                // SHADOW
                identity(this.matrices.shadow);
                multiply(this.matrices.shadow, this.camera.matrices.projection, this.matrices.view);
                multiply(this.matrices.shadow, this.matrices.bias, this.matrices.shadow);
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

    var time = create$3();
    var fog = create$3();

    var matrices = {
        view: create$1(),
        normal: create$1(),
        modelView: create$1(),
        inversedModelView: create$1()
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
                    this.perScene = new Ubo([].concat(toConsumableArray(create$1()), toConsumableArray(create$1()), toConsumableArray(fog), toConsumableArray(create$3()), toConsumableArray(time), toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(create$3())), 0);

                    this.perModel = new Ubo([].concat(toConsumableArray(create$1()), toConsumableArray(create$1()), toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(create$3()), toConsumableArray(create$3())), 1);

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
                identity(matrices.view);
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
                identity(matrices.modelView);
                copy(matrices.modelView, matrix);
                invert(matrices.inversedModelView, matrices.modelView);
                transpose(matrices.inversedModelView, matrices.inversedModelView);
                identity(matrices.normal);
                copy(matrices.normal, matrices.inversedModelView);
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
                    object.setUniform('projectionMatrix', 'mat4', create$1());
                    object.setUniform('viewMatrix', 'mat4', create$1());
                    object.setUniform('fogSettings', 'vec4', fog);
                    object.setUniform('fogColor', 'vec4', create$3());
                    object.setUniform('iGlobalTime', 'float', time[0]);
                    object.setUniform('globalClipSettings', 'vec4', create$3());
                    object.setUniform('globalClipPlane0', 'vec4', create$3());
                    object.setUniform('globalClipPlane1', 'vec4', create$3());
                    object.setUniform('globalClipPlane2', 'vec4', create$3());
                    // per object
                    object.setUniform('modelMatrix', 'mat4', create$1());
                    object.setUniform('normalMatrix', 'mat4', create$1());
                    object.setUniform('localClipSettings', 'vec4', create$3());
                    object.setUniform('localClipPlane0', 'vec4', create$3());
                    object.setUniform('localClipPlane1', 'vec4', create$3());
                    object.setUniform('localClipPlane2', 'vec4', create$3());

                    // lights
                    object.setUniform('dlPosition', 'vec4', create$3());
                    object.setUniform('dlColor', 'vec4', create$3());
                    object.setUniform('flIntensity', 'float', 0);
                }

                object.setUniform('shadowMap', 'sampler2D', 0);
                object.setUniform('shadowMatrix', 'mat4', create$1());
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

            this.clearColor = fromValues$2(0, 0, 0, 1);

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

    exports.Composer = Composer;
    exports.Mesh = Mesh;
    exports.Model = Model;
    exports.Object3 = Object3;
    exports.Pass = Pass;
    exports.Performance = Performance;
    exports.RenderTarget = RenderTarget;
    exports.Renderer = Renderer;
    exports.Scene = Scene;
    exports.Texture = Texture;
    exports.cameras = index$2;
    exports.chunks = index;
    exports.constants = constants;
    exports.helpers = index$4;
    exports.shaders = index$3;
    exports.utils = index$1;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2xpZ2h0LmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2ZvZy5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvc2Vzc2lvbi5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy91Ym8uanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3Mvbm9pc2UuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvY2xpcHBpbmcuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvZXh0ZW5zaW9ucy5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9zaGFkb3cuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L2VzbS9jb21tb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L2VzbS9tYXQzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vbWF0NC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZXNtL3ZlYzMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L2VzbS92ZWM0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vcXVhdC5qcyIsIi4uL3NyYy91dGlscy9jb2xvci5qcyIsIi4uL3NyYy91dGlscy9tYXRoLmpzIiwiLi4vc3JjL3V0aWxzL2dsc2wtcGFyc2VyLmpzIiwiLi4vc3JjL2NvcmUvdmVjdG9yMy5qcyIsIi4uL3NyYy9jb3JlL29iamVjdDMuanMiLCIuLi9zcmMvY2FtZXJhcy9vcnRob2dyYXBoaWMuanMiLCIuLi9zcmMvY2FtZXJhcy9wZXJzcGVjdGl2ZS5qcyIsIi4uL3NyYy9zaGFkZXJzL2Jhc2ljLmpzIiwiLi4vc3JjL2NvcmUvdGV4dHVyZS5qcyIsIi4uL3NyYy9zaGFkZXJzL2RlZmF1bHQuanMiLCIuLi9zcmMvc2hhZGVycy9iaWxsYm9hcmQuanMiLCIuLi9zcmMvc2hhZGVycy9zZW0uanMiLCIuLi9zcmMvZ2wvcHJvZ3JhbS5qcyIsIi4uL3NyYy9nbC91Ym8uanMiLCIuLi9zcmMvZ2wvdmFvLmpzIiwiLi4vc3JjL2dsL3R5cGVzLmpzIiwiLi4vc3JjL2dsL2F0dHJpYnV0ZXMuanMiLCIuLi9zcmMvZ2wvdW5pZm9ybXMuanMiLCIuLi9zcmMvY29yZS9tb2RlbC5qcyIsIi4uL3NyYy9jb3JlL21lc2guanMiLCIuLi9zcmMvaGVscGVycy9heGlzLmpzIiwiLi4vc3JjL2hlbHBlcnMvbm9ybWFsLmpzIiwiLi4vc3JjL3V0aWxzL2RvbS5qcyIsIi4uL3NyYy9jb3JlL2xpZ2h0cy5qcyIsIi4uL3NyYy9jb3JlL3NjZW5lLmpzIiwiLi4vc3JjL2NvcmUvcnQuanMiLCIuLi9zcmMvY29yZS9zaGFkb3ctbWFwLXJlbmRlcmVyLmpzIiwiLi4vc3JjL2NvcmUvcmVuZGVyZXIuanMiLCIuLi9zcmMvY29yZS9wYXNzLmpzIiwiLi4vc3JjL3Bhc3Nlcy9iYXNpYy5qcyIsIi4uL3NyYy9jb3JlL2NvbXBvc2VyLmpzIiwiLi4vc3JjL2NvcmUvcGVyZm9ybWFuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTElHSFQgPSB7XG4gICAgZmFjdG9yeTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAvLyBmYWN0b3J5IGxpZ2h0XG4gICAgICAgIHZlYzMgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uID0gbm9ybWFsaXplKHZlYzMoLTAuMjUsIC0wLjI1LCAxLjApKTtcbiAgICAgICAgdmVjMyBkaXJlY3Rpb25hbENvbG9yID0gdmVjMyhtYXgoZG90KHZfbm9ybWFsLCBpbnZlcnNlTGlnaHREaXJlY3Rpb24pLCAwLjApKTtcbiAgICAgICAgdmVjMyBmYWN0b3J5ID0gbWl4KHZlYzMoMC4wKSwgZGlyZWN0aW9uYWxDb2xvciwgMC45ODkpOyAvLyBsaWdodCBpbnRlbnNpdHlcbiAgICAgICAgYmFzZS5yZ2IgKj0gZmFjdG9yeTtcblxuICAgICAgICAke0xJR0hULmRpcmVjdGlvbmFsKCl9YDtcbiAgICB9LFxuXG4gICAgZGlyZWN0aW9uYWw6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIC8vIHZlYzMgZGNvbG9yID0gdmVjMygwLjAxKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBmb3IgKGludCBpID0gMDsgaSA8IE1BWF9ESVJFQ1RJT05BTDsgaSsrKSB7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBpbnZlcnNlTGlnaHREaXJlY3Rpb24gPSBub3JtYWxpemUoZGlyZWN0aW9uYWxMaWdodHNbaV0uZGxQb3NpdGlvbi54eXopO1xuICAgICAgICAgICAgLy8gICAgIHZlYzMgbGlnaHQgPSB2ZWMzKG1heChkb3Qodl9ub3JtYWwsIGludmVyc2VMaWdodERpcmVjdGlvbiksIDAuMCkpO1xuICAgICAgICAgICAgLy8gICAgIHZlYzMgZGlyZWN0aW9uYWxDb2xvciA9IGRpcmVjdGlvbmFsTGlnaHRzW2ldLmRsQ29sb3IucmdiICogbGlnaHQ7XG4gICAgICAgICAgICAvLyAgICAgZGNvbG9yICs9IG1peChkY29sb3IsIGRpcmVjdGlvbmFsQ29sb3IsIGRpcmVjdGlvbmFsTGlnaHRzW2ldLmZsSW50ZW5zaXR5KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGRjb2xvciAvPSBmbG9hdChNQVhfRElSRUNUSU9OQUwpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGJhc2UucmdiICo9IGRjb2xvcjtcbiAgICAgICAgYDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgTElHSFQgfTtcbiIsImZ1bmN0aW9uIGJhc2UoKSB7XG4gICAgcmV0dXJuIGBcbiAgICBmbG9hdCBmb2dTdGFydCA9IGZvZ1NldHRpbmdzLnk7XG4gICAgZmxvYXQgZm9nRW5kID0gZm9nU2V0dGluZ3MuejtcbiAgICBmbG9hdCBmb2dEZW5zaXR5ID0gZm9nU2V0dGluZ3MuYTtcblxuICAgIGZsb2F0IGRpc3QgPSAwLjA7XG4gICAgZmxvYXQgZm9nRmFjdG9yID0gMC4wO1xuICAgIGRpc3QgPSBnbF9GcmFnQ29vcmQueiAvIGdsX0ZyYWdDb29yZC53O2A7XG59XG5cbmNvbnN0IEZPRyA9IHtcbiAgICBsaW5lYXI6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgaWYgKGZvZ1NldHRpbmdzLnggPiAwLjApIHtcbiAgICAgICAgICAgICR7YmFzZSgpfVxuICAgICAgICAgICAgZm9nRmFjdG9yID0gKGZvZ0VuZCAtIGRpc3QpIC8gKGZvZ0VuZCAtIGZvZ1N0YXJ0KTtcbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IGNsYW1wKGZvZ0ZhY3RvciwgMC4wLCAxLjApO1xuICAgICAgICAgICAgYmFzZSA9IG1peChmb2dDb2xvciwgYmFzZSwgZm9nRmFjdG9yKTtcbiAgICAgICAgfWA7XG4gICAgfSxcbiAgICBleHBvbmVudGlhbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoZGlzdCAqIGZvZ0RlbnNpdHkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxuICAgIGV4cG9uZW50aWFsMjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoKGRpc3QgKiBmb2dEZW5zaXR5KSAqIChkaXN0ICogZm9nRGVuc2l0eSkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgRk9HIH07XG4iLCIvKipcbiAqIE1heCBkaXJlY3Rpb25hbCBsaWdodCBhbGxvd2VkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBNQVhfRElSRUNUSU9OQUxcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBNQVhfRElSRUNUSU9OQUwgPSAxO1xuXG4vKipcbiAqIGRpcmVjdGlvbmFsIGxpZ2h0IGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBESVJFQ1RJT05BTF9MSUdIVFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IERJUkVDVElPTkFMX0xJR0hUID0gMTAwMDtcblxuLyoqXG4gKiBiYXNpYyBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9CQVNJQ1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9CQVNJQyA9IDIwMDA7XG5cbi8qKlxuICogZGVmYXVsdCBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9ERUZBVUxUXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0RFRkFVTFQgPSAyMDAxO1xuXG4vKipcbiAqIGJpbGxib2FyZCBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9CSUxMQk9BUkRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQklMTEJPQVJEID0gMjAwMjtcblxuLyoqXG4gKiBzaGFkb3cgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfU0hBRE9XXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX1NIQURPVyA9IDIwMDM7XG5cbi8qKlxuICogc2VtIHNoYWRlciBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0hBREVSX1NFTVxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9TRU0gPSAyMDA0O1xuXG4vKipcbiAqIGN1c3RvbSBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9DVVNUT01cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQ1VTVE9NID0gMjUwMDtcblxuLyoqXG4gKiBzaGFkZXIgZHJhdyBtb2Rlc1xuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgRFJBV1xuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBQT0lOVFNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBMSU5FU1xuICogQHByb3BlcnR5IHtudW1iZXJ9IFRSSUFOR0xFU1xuICovXG5leHBvcnQgY29uc3QgRFJBVyA9IHtcbiAgICBQT0lOVFM6IDAsXG4gICAgTElORVM6IDEsXG4gICAgVFJJQU5HTEVTOiA0LFxufTtcblxuLyoqXG4gKiB0cmlhbmdsZSBzaWRlXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSURFXG4gKiBAdHlwZSB7b2JqZWN0fVxuICogQHByb3BlcnR5IHtudW1iZXJ9IEZST05UXG4gKiBAcHJvcGVydHkge251bWJlcn0gQkFDS1xuICogQHByb3BlcnR5IHtudW1iZXJ9IEJPVEhcbiAqL1xuZXhwb3J0IGNvbnN0IFNJREUgPSB7XG4gICAgRlJPTlQ6IDAsXG4gICAgQkFDSzogMSxcbiAgICBCT1RIOiAyLFxufTtcblxuLyoqXG4gKiBjb250ZXh0IHR5cGVzXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBDT05URVhUXG4gKiBAdHlwZSB7b2JqZWN0fVxuICogQHByb3BlcnR5IHtudW1iZXJ9IFdFQkdMXG4gKiBAcHJvcGVydHkge251bWJlcn0gV0VCR0wyXG4gKi9cbmV4cG9ydCBjb25zdCBDT05URVhUID0ge1xuICAgIFdFQkdMOiAnd2ViZ2wnLFxuICAgIFdFQkdMMjogJ3dlYmdsMicsXG59O1xuIiwiaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuY29uc3QgbGlicmFyeSA9IGBsb3d3dy0ke19fTElCUkFSWV9ffWA7XG5jb25zdCB2ZXJzaW9uID0gX19WRVJTSU9OX187XG5cbi8vIHBlciBzZXNzaW9uXG5sZXQgZ2wgPSBudWxsO1xubGV0IGNvbnRleHRUeXBlID0gbnVsbDtcblxuLy8gdGVzdCBjb250ZXh0IHdlYmdsIGFuZCB3ZWJnbDJcbmNvbnN0IHRlc3RDb250ZXh0MSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoQ09OVEVYVC5XRUJHTCk7XG5jb25zdCB0ZXN0Q29udGV4dDIgPSBkb2N1bWVudFxuICAgIC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIC5nZXRDb250ZXh0KENPTlRFWFQuV0VCR0wyKTtcblxuY29uc3QgZXh0ZW5zaW9ucyA9IHtcbiAgICAvLyB1c2VkIGdsb2JhbGx5XG4gICAgdmVydGV4QXJyYXlPYmplY3Q6IHRlc3RDb250ZXh0MS5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JyksXG5cbiAgICAvLyB1c2VkIGZvciBpbnN0YW5jaW5nXG4gICAgaW5zdGFuY2VkQXJyYXlzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJyksXG5cbiAgICAvLyB1c2VkIGZvciBmbGF0IHNoYWRpbmdcbiAgICBzdGFuZGFyZERlcml2YXRpdmVzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKSxcblxuICAgIC8vIGRlcHRoIHRleHR1cmVcbiAgICBkZXB0aFRleHR1cmVzOiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyksXG59O1xuXG5jb25zdCBzZXRDb250ZXh0VHlwZSA9IHByZWZlcnJlZCA9PiB7XG4gICAgY29uc3QgZ2wyID0gdGVzdENvbnRleHQyICYmIENPTlRFWFQuV0VCR0wyO1xuICAgIGNvbnN0IGdsMSA9IHRlc3RDb250ZXh0MSAmJiBDT05URVhULldFQkdMO1xuICAgIGNvbnRleHRUeXBlID0gcHJlZmVycmVkIHx8IGdsMiB8fCBnbDE7XG5cbiAgICBpZiAoY29udGV4dFR5cGUgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIGV4dGVuc2lvbnMudmVydGV4QXJyYXlPYmplY3QgPSB0cnVlO1xuICAgICAgICBleHRlbnNpb25zLmluc3RhbmNlZEFycmF5cyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuc3RhbmRhcmREZXJpdmF0aXZlcyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuZGVwdGhUZXh0dXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dFR5cGU7XG59O1xuXG5jb25zdCBnZXRDb250ZXh0VHlwZSA9ICgpID0+IGNvbnRleHRUeXBlO1xuXG5jb25zdCBzZXRDb250ZXh0ID0gY29udGV4dCA9PiB7XG4gICAgZ2wgPSBjb250ZXh0O1xuICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMKSB7XG4gICAgICAgIGV4dGVuc2lvbnMudmVydGV4QXJyYXlPYmplY3QgPSBnbC5nZXRFeHRlbnNpb24oXG4gICAgICAgICAgICAnT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnXG4gICAgICAgICk7XG4gICAgICAgIGV4dGVuc2lvbnMuaW5zdGFuY2VkQXJyYXlzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJyk7XG4gICAgICAgIGV4dGVuc2lvbnMuc3RhbmRhcmREZXJpdmF0aXZlcyA9IGdsLmdldEV4dGVuc2lvbihcbiAgICAgICAgICAgICdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnXG4gICAgICAgICk7XG4gICAgICAgIGV4dGVuc2lvbnMuZGVwdGhUZXh0dXJlcyA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldENvbnRleHQgPSAoKSA9PiBnbDtcblxuY29uc3Qgc3VwcG9ydHMgPSAoKSA9PiBleHRlbnNpb25zO1xuXG5leHBvcnQge1xuICAgIGxpYnJhcnksXG4gICAgdmVyc2lvbixcbiAgICBzZXRDb250ZXh0LFxuICAgIGdldENvbnRleHQsXG4gICAgc2V0Q29udGV4dFR5cGUsXG4gICAgZ2V0Q29udGV4dFR5cGUsXG4gICAgc3VwcG9ydHMsXG59O1xuIiwiaW1wb3J0IHsgQ09OVEVYVCwgTUFYX0RJUkVDVElPTkFMIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IGdldENvbnRleHRUeXBlIH0gZnJvbSAnLi4vLi4vc2Vzc2lvbic7XG5cbmNvbnN0IFVCTyA9IHtcbiAgICBzY2VuZTogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICB1bmlmb3JtIHBlclNjZW5lIHtcbiAgICAgICAgICAgICAgICBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgICAgICAgICAgbWF0NCB2aWV3TWF0cml4O1xuICAgICAgICAgICAgICAgIHZlYzQgZm9nU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgdmVjNCBmb2dDb2xvcjtcbiAgICAgICAgICAgICAgICBmbG9hdCBpR2xvYmFsVGltZTtcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBTZXR0aW5ncztcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBQbGFuZTA7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwUGxhbmUxO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMjtcbiAgICAgICAgICAgIH07YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuICAgICAgICB1bmlmb3JtIG1hdDQgdmlld01hdHJpeDtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGZvZ1NldHRpbmdzO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZm9nQ29sb3I7XG4gICAgICAgIHVuaWZvcm0gZmxvYXQgaUdsb2JhbFRpbWU7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwUGxhbmUwO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMTtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBQbGFuZTI7YDtcbiAgICB9LFxuXG4gICAgbW9kZWw6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgdW5pZm9ybSBwZXJNb2RlbCB7XG4gICAgICAgICAgICAgICAgbWF0NCBtb2RlbE1hdHJpeDtcbiAgICAgICAgICAgICAgICBtYXQ0IG5vcm1hbE1hdHJpeDtcbiAgICAgICAgICAgICAgICB2ZWM0IGxvY2FsQ2xpcFNldHRpbmdzO1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwUGxhbmUwO1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwUGxhbmUxO1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwUGxhbmUyO1xuICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICB1bmlmb3JtIG1hdDQgbW9kZWxNYXRyaXg7XG4gICAgICAgICAgICB1bmlmb3JtIG1hdDQgbm9ybWFsTWF0cml4O1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFNldHRpbmdzO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFBsYW5lMDtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwUGxhbmUyO2A7XG4gICAgfSxcblxuICAgIGxpZ2h0czogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgI2RlZmluZSBNQVhfRElSRUNUSU9OQUwgJHtNQVhfRElSRUNUSU9OQUx9XG5cbiAgICAgICAgICAgICAgICBzdHJ1Y3QgRGlyZWN0aW9uYWwge1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IGRsUG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgZGxDb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgZmxJbnRlbnNpdHk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHVuaWZvcm0gZGlyZWN0aW9uYWwge1xuICAgICAgICAgICAgICAgICAgICBEaXJlY3Rpb25hbCBkaXJlY3Rpb25hbExpZ2h0c1tNQVhfRElSRUNUSU9OQUxdO1xuICAgICAgICAgICAgICAgIH07YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAjZGVmaW5lIE1BWF9ESVJFQ1RJT05BTCAke01BWF9ESVJFQ1RJT05BTH1cblxuICAgICAgICAgICAgc3RydWN0IERpcmVjdGlvbmFsIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGRsUG9zaXRpb247XG4gICAgICAgICAgICAgICAgdmVjNCBkbENvbG9yO1xuICAgICAgICAgICAgICAgIGZsb2F0IGZsSW50ZW5zaXR5O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdW5pZm9ybSBEaXJlY3Rpb25hbCBkaXJlY3Rpb25hbExpZ2h0c1tNQVhfRElSRUNUSU9OQUxdO2A7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IFVCTyB9O1xuIiwiY29uc3QgTk9JU0UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICB2ZWMzIG1vZDI4OSh2ZWMzIHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IG1vZDI4OSh2ZWM0IHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IHBlcm11dGUodmVjNCB4KXtyZXR1cm4gbW9kMjg5KCh4KjM0LisxLikqeCk7fXZlYzQgdGF5bG9ySW52U3FydCh2ZWM0IHIpe3JldHVybiAxLjc5Mjg0LS44NTM3MzUqcjt9dmVjMyBmYWRlKHZlYzMgdCl7cmV0dXJuIHQqdCp0Kih0Kih0KjYuLTE1LikrMTAuKTt9ZmxvYXQgY25vaXNlKHZlYzMgUCl7dmVjMyBQaTA9Zmxvb3IoUCksUGkxPVBpMCt2ZWMzKDEuKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9ZmxvYXQgcG5vaXNlKHZlYzMgUCx2ZWMzIHJlcCl7dmVjMyBQaTA9bW9kKGZsb29yKFApLHJlcCksUGkxPW1vZChQaTArdmVjMygxLikscmVwKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9XG5gO1xufTtcblxuZXhwb3J0IHsgTk9JU0UgfTtcbiIsImNvbnN0IENMSVBQSU5HID0ge1xuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgb3V0IHZlYzQgbG9jYWxfZXllc3BhY2U7XG4gICAgICAgIG91dCB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgbG9jYWxfZXllc3BhY2UgPSBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgZ2xvYmFsX2V5ZXNwYWNlID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpbiB2ZWM0IGxvY2FsX2V5ZXNwYWNlO1xuICAgICAgICBpbiB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAobG9jYWxDbGlwU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTApIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTIpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdsb2JhbENsaXBTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICBpZihkb3QoZ2xvYmFsX2V5ZXNwYWNlLCBnbG9iYWxDbGlwUGxhbmUwKSA8IDAuMCkgZGlzY2FyZDtcbiAgICAgICAgICAgIGlmKGRvdChnbG9iYWxfZXllc3BhY2UsIGdsb2JhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGdsb2JhbF9leWVzcGFjZSwgZ2xvYmFsQ2xpcFBsYW5lMikgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgIH1gO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBDTElQUElORyB9O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuXG5jb25zdCBFWFRFTlNJT05TID0ge1xuICAgIHZlcnRleDogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIGZyYWdtZW50OiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICNleHRlbnNpb24gR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzIDogZW5hYmxlYDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgRVhURU5TSU9OUyB9O1xuIiwiZnVuY3Rpb24gaGFyZCgpIHtcbiAgICByZXR1cm4gYFxuICAgIGZsb2F0IGhhcmRTaGFkb3cxKHNhbXBsZXIyRCBzaGFkb3dNYXApIHtcbiAgICAgICAgdmVjNCBzaGFkb3dDb29yZCA9IHZTaGFkb3dDb29yZCAvIHZTaGFkb3dDb29yZC53O1xuICAgICAgICB2ZWMyIHV2ID0gc2hhZG93Q29vcmQueHk7XG4gICAgICAgIGZsb2F0IHNoYWRvdyA9IHRleHR1cmUoc2hhZG93TWFwLCB1dikucjtcblxuICAgICAgICBmbG9hdCB2aXNpYmlsaXR5ID0gMS4wO1xuICAgICAgICBmbG9hdCBzaGFkb3dBbW91bnQgPSAwLjU7XG5cbiAgICAgICAgZmxvYXQgY29zVGhldGEgPSBjbGFtcChkb3Qodl9ub3JtYWwsIHZTaGFkb3dDb29yZC54eXopLCAwLjAsIDEuMCk7XG4gICAgICAgIGZsb2F0IGJpYXMgPSAwLjAwMDA1ICogdGFuKGFjb3MoY29zVGhldGEpKTsgLy8gY29zVGhldGEgaXMgZG90KCBuLGwgKSwgY2xhbXBlZCBiZXR3ZWVuIDAgYW5kIDFcbiAgICAgICAgYmlhcyA9IGNsYW1wKGJpYXMsIDAuMCwgMC4wMDEpO1xuXG4gICAgICAgIGlmIChzaGFkb3cgPCBzaGFkb3dDb29yZC56IC0gYmlhcyl7XG4gICAgICAgICAgICB2aXNpYmlsaXR5ID0gc2hhZG93QW1vdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aXNpYmlsaXR5O1xuICAgIH1cblxuICAgIGZsb2F0IGhhcmRTaGFkb3cyKHNhbXBsZXIyRCBzaGFkb3dNYXApIHtcbiAgICAgICAgdmVjNCBzaGFkb3dDb29yZCA9IHZTaGFkb3dDb29yZCAvIHZTaGFkb3dDb29yZC53O1xuICAgICAgICB2ZWMyIHV2ID0gc2hhZG93Q29vcmQueHk7XG5cbiAgICAgICAgZmxvYXQgbGlnaHREZXB0aDEgPSB0ZXh0dXJlKHNoYWRvd01hcCwgdXYpLnI7XG4gICAgICAgIGZsb2F0IGxpZ2h0RGVwdGgyID0gY2xhbXAoc2hhZG93Q29vcmQueiwgMC4wLCAxLjApO1xuICAgICAgICBmbG9hdCBiaWFzID0gMC4wMDAxO1xuXG4gICAgICAgIHJldHVybiBzdGVwKGxpZ2h0RGVwdGgyLCBsaWdodERlcHRoMStiaWFzKTtcbiAgICB9XG5cbiAgICBmbG9hdCBoYXJkU2hhZG93MyhzYW1wbGVyMkQgc2hhZG93TWFwKSB7XG4gICAgICAgIHZlYzQgc2hhZG93Q29vcmQgPSB2U2hhZG93Q29vcmQgLyB2U2hhZG93Q29vcmQudztcbiAgICAgICAgdmVjMiB1diA9IHNoYWRvd0Nvb3JkLnh5O1xuXG4gICAgICAgIGZsb2F0IHZpc2liaWxpdHkgPSAxLjA7XG4gICAgICAgIGZsb2F0IHNoYWRvd0Ftb3VudCA9IDAuNTtcbiAgICAgICAgZmxvYXQgYmlhcyA9IDAuMDAwMDU7XG5cbiAgICAgICAgdmVjMiBwb2lzc29uRGlza1sxNl07XG4gICAgICAgIHBvaXNzb25EaXNrWzBdID0gdmVjMigtMC45NDIwMTYyNCwgLTAuMzk5MDYyMTYpO1xuICAgICAgICBwb2lzc29uRGlza1sxXSA9IHZlYzIoMC45NDU1ODYwOSwgLTAuNzY4OTA3MjUpO1xuICAgICAgICBwb2lzc29uRGlza1syXSA9IHZlYzIoLTAuMDk0MTg0MTAxLCAtMC45MjkzODg3MCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzNdID0gdmVjMigwLjM0NDk1OTM4LCAwLjI5Mzg3NzYwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbNF0gPSB2ZWMyKC0wLjkxNTg4NTgxLCAwLjQ1NzcxNDMyKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbNV0gPSB2ZWMyKC0wLjgxNTQ0MjMyLCAtMC44NzkxMjQ2NCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzZdID0gdmVjMigtMC4zODI3NzU0MywgMC4yNzY3Njg0NSk7XG4gICAgICAgIHBvaXNzb25EaXNrWzddID0gdmVjMigwLjk3NDg0Mzk4LCAwLjc1NjQ4Mzc5KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbOF0gPSB2ZWMyKDAuNDQzMjMzMjUsIC0wLjk3NTExNTU0KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbOV0gPSB2ZWMyKDAuNTM3NDI5ODEsIC0wLjQ3MzczNDIwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTBdID0gdmVjMigtMC4yNjQ5NjkxMSwgLTAuNDE4OTMwMjMpO1xuICAgICAgICBwb2lzc29uRGlza1sxMV0gPSB2ZWMyKDAuNzkxOTc1MTQsIDAuMTkwOTAxODgpO1xuICAgICAgICBwb2lzc29uRGlza1sxMl0gPSB2ZWMyKC0wLjI0MTg4ODQwLCAwLjk5NzA2NTA3KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTNdID0gdmVjMigtMC44MTQwOTk1NSwgMC45MTQzNzU5MCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzE0XSA9IHZlYzIoMC4xOTk4NDEyNiwgMC43ODY0MTM2Nyk7XG4gICAgICAgIHBvaXNzb25EaXNrWzE1XSA9IHZlYzIoMC4xNDM4MzE2MSwgLTAuMTQxMDA3OTApO1xuXG4gICAgICAgIGZvciAoaW50IGk9MDtpPDE2O2krKykge1xuICAgICAgICAgICAgaWYgKCB0ZXh0dXJlKHNoYWRvd01hcCwgdXYgKyBwb2lzc29uRGlza1tpXS83MDAuMCkuciA8IHNoYWRvd0Nvb3JkLnotYmlhcyApe1xuICAgICAgICAgICAgICAgIHZpc2liaWxpdHkgLT0gMC4wMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2aXNpYmlsaXR5O1xuICAgIH1cblxuICAgIGA7XG59XG5cbmNvbnN0IFNIQURPVyA9IHtcbiAgICB2ZXJ0ZXhfcHJlOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIHVuaWZvcm0gbWF0NCBzaGFkb3dNYXRyaXg7XG4gICAgICAgIG91dCB2ZWM0IHZTaGFkb3dDb29yZDtgO1xuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdlNoYWRvd0Nvb3JkID0gc2hhZG93TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7YDtcbiAgICB9LFxuXG4gICAgZnJhZ21lbnRfcHJlOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHNoYWRvd01hcDtcbiAgICAgICAgaW4gdmVjNCB2U2hhZG93Q29vcmQ7XG5cbiAgICAgICAgJHtoYXJkKCl9YDtcbiAgICB9LFxuXG4gICAgZnJhZ21lbnQ6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgLy8gc2hhZG93c1xuICAgICAgICBmbG9hdCBzaGFkb3cgPSAxLjA7XG5cbiAgICAgICAgLy8gT1BUSU9OIDFcbiAgICAgICAgc2hhZG93ID0gaGFyZFNoYWRvdzEoc2hhZG93TWFwKTtcblxuICAgICAgICBiYXNlICo9IHNoYWRvdztcbiAgICAgICAgYDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgU0hBRE9XIH07XG4iLCIvKipcclxuICogQ29tbW9uIHV0aWxpdGllc1xyXG4gKiBAbW9kdWxlIGdsTWF0cml4XHJcbiAqL1xuLy8gQ29uZmlndXJhdGlvbiBDb25zdGFudHNcbmV4cG9ydCB2YXIgRVBTSUxPTiA9IDAuMDAwMDAxO1xuZXhwb3J0IHZhciBBUlJBWV9UWVBFID0gdHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbmV4cG9ydCB2YXIgUkFORE9NID0gTWF0aC5yYW5kb207XG4vKipcclxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2VzXHJcbiAqXHJcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1hdHJpeEFycmF5VHlwZSh0eXBlKSB7XG4gIEFSUkFZX1RZUEUgPSB0eXBlO1xufVxudmFyIGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG4vKipcclxuICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIEFuZ2xlIGluIERlZ3JlZXNcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihhKSB7XG4gIHJldHVybiBhICogZGVncmVlO1xufVxuLyoqXHJcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudHMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHZhbHVlLCB3aXRoaW4gYW4gYWJzb2x1dGVcclxuICogb3IgcmVsYXRpdmUgdG9sZXJhbmNlIG9mIGdsTWF0cml4LkVQU0lMT04gKGFuIGFic29sdXRlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciB2YWx1ZXMgbGVzc1xyXG4gKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIFRoZSBmaXJzdCBudW1iZXIgdG8gdGVzdC5cclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG51bWJlcnMgYXJlIGFwcHJveGltYXRlbHkgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSk7XG59XG5pZiAoIU1hdGguaHlwb3QpIE1hdGguaHlwb3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB5ID0gMCxcbiAgICAgIGkgPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICB5ICs9IGFyZ3VtZW50c1tpXSAqIGFyZ3VtZW50c1tpXTtcbiAgfVxuXG4gIHJldHVybiBNYXRoLnNxcnQoeSk7XG59OyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuLyoqXHJcbiAqIDN4MyBNYXRyaXhcclxuICogQG1vZHVsZSBtYXQzXHJcbiAqL1xuXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gIH1cblxuICBvdXRbMF0gPSAxO1xuICBvdXRbNF0gPSAxO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgM3gzIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzRdO1xuICBvdXRbNF0gPSBhWzVdO1xuICBvdXRbNV0gPSBhWzZdO1xuICBvdXRbNl0gPSBhWzhdO1xuICBvdXRbN10gPSBhWzldO1xuICBvdXRbOF0gPSBhWzEwXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDkpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBtYXQzIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG4gIG91dFswXSA9IG0wMDtcbiAgb3V0WzFdID0gbTAxO1xuICBvdXRbMl0gPSBtMDI7XG4gIG91dFszXSA9IG0xMDtcbiAgb3V0WzRdID0gbTExO1xuICBvdXRbNV0gPSBtMTI7XG4gIG91dFs2XSA9IG0yMDtcbiAgb3V0WzddID0gbTIxO1xuICBvdXRbOF0gPSBtMjI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIG91dFswXSA9IG0wMDtcbiAgb3V0WzFdID0gbTAxO1xuICBvdXRbMl0gPSBtMDI7XG4gIG91dFszXSA9IG0xMDtcbiAgb3V0WzRdID0gbTExO1xuICBvdXRbNV0gPSBtMTI7XG4gIG91dFs2XSA9IG0yMDtcbiAgb3V0WzddID0gbTIxO1xuICBvdXRbOF0gPSBtMjI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIHZhciBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIG91dFsxXSA9IGFbM107XG4gICAgb3V0WzJdID0gYVs2XTtcbiAgICBvdXRbM10gPSBhMDE7XG4gICAgb3V0WzVdID0gYVs3XTtcbiAgICBvdXRbNl0gPSBhMDI7XG4gICAgb3V0WzddID0gYTEyO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGFbMV07XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGFbMl07XG4gICAgb3V0WzddID0gYVs1XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBJbnZlcnRzIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXTtcbiAgdmFyIGExMCA9IGFbM10sXG4gICAgICBhMTEgPSBhWzRdLFxuICAgICAgYTEyID0gYVs1XTtcbiAgdmFyIGEyMCA9IGFbNl0sXG4gICAgICBhMjEgPSBhWzddLFxuICAgICAgYTIyID0gYVs4XTtcbiAgdmFyIGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcbiAgdmFyIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XG4gIHZhciBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7IC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcblxuICB2YXIgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkZXQgPSAxLjAgLyBkZXQ7XG4gIG91dFswXSA9IGIwMSAqIGRldDtcbiAgb3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xuICBvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgb3V0WzNdID0gYjExICogZGV0O1xuICBvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcbiAgb3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gIG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcbiAgb3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXTtcbiAgdmFyIGExMCA9IGFbM10sXG4gICAgICBhMTEgPSBhWzRdLFxuICAgICAgYTEyID0gYVs1XTtcbiAgdmFyIGEyMCA9IGFbNl0sXG4gICAgICBhMjEgPSBhWzddLFxuICAgICAgYTIyID0gYVs4XTtcbiAgb3V0WzBdID0gYTExICogYTIyIC0gYTEyICogYTIxO1xuICBvdXRbMV0gPSBhMDIgKiBhMjEgLSBhMDEgKiBhMjI7XG4gIG91dFsyXSA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgb3V0WzNdID0gYTEyICogYTIwIC0gYTEwICogYTIyO1xuICBvdXRbNF0gPSBhMDAgKiBhMjIgLSBhMDIgKiBhMjA7XG4gIG91dFs1XSA9IGEwMiAqIGExMCAtIGEwMCAqIGExMjtcbiAgb3V0WzZdID0gYTEwICogYTIxIC0gYTExICogYTIwO1xuICBvdXRbN10gPSBhMDEgKiBhMjAgLSBhMDAgKiBhMjE7XG4gIG91dFs4XSA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl07XG4gIHZhciBhMTAgPSBhWzNdLFxuICAgICAgYTExID0gYVs0XSxcbiAgICAgIGExMiA9IGFbNV07XG4gIHZhciBhMjAgPSBhWzZdLFxuICAgICAgYTIxID0gYVs3XSxcbiAgICAgIGEyMiA9IGFbOF07XG4gIHJldHVybiBhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApO1xufVxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl07XG4gIHZhciBhMTAgPSBhWzNdLFxuICAgICAgYTExID0gYVs0XSxcbiAgICAgIGExMiA9IGFbNV07XG4gIHZhciBhMjAgPSBhWzZdLFxuICAgICAgYTIxID0gYVs3XSxcbiAgICAgIGEyMiA9IGFbOF07XG4gIHZhciBiMDAgPSBiWzBdLFxuICAgICAgYjAxID0gYlsxXSxcbiAgICAgIGIwMiA9IGJbMl07XG4gIHZhciBiMTAgPSBiWzNdLFxuICAgICAgYjExID0gYls0XSxcbiAgICAgIGIxMiA9IGJbNV07XG4gIHZhciBiMjAgPSBiWzZdLFxuICAgICAgYjIxID0gYls3XSxcbiAgICAgIGIyMiA9IGJbOF07XG4gIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG4gIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdLFxuICAgICAgYTEwID0gYVszXSxcbiAgICAgIGExMSA9IGFbNF0sXG4gICAgICBhMTIgPSBhWzVdLFxuICAgICAgYTIwID0gYVs2XSxcbiAgICAgIGEyMSA9IGFbN10sXG4gICAgICBhMjIgPSBhWzhdLFxuICAgICAgeCA9IHZbMF0sXG4gICAgICB5ID0gdlsxXTtcbiAgb3V0WzBdID0gYTAwO1xuICBvdXRbMV0gPSBhMDE7XG4gIG91dFsyXSA9IGEwMjtcbiAgb3V0WzNdID0gYTEwO1xuICBvdXRbNF0gPSBhMTE7XG4gIG91dFs1XSA9IGExMjtcbiAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gIG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxO1xuICBvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGExMCA9IGFbM10sXG4gICAgICBhMTEgPSBhWzRdLFxuICAgICAgYTEyID0gYVs1XSxcbiAgICAgIGEyMCA9IGFbNl0sXG4gICAgICBhMjEgPSBhWzddLFxuICAgICAgYTIyID0gYVs4XSxcbiAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGMgKiBhMDAgKyBzICogYTEwO1xuICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgb3V0WzJdID0gYyAqIGEwMiArIHMgKiBhMTI7XG4gIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICBvdXRbNF0gPSBjICogYTExIC0gcyAqIGEwMTtcbiAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG4gIG91dFs2XSA9IGEyMDtcbiAgb3V0WzddID0gYTIxO1xuICBvdXRbOF0gPSBhMjI7XG4gIHJldHVybiBvdXQ7XG59XG47XG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICB2YXIgeCA9IHZbMF0sXG4gICAgICB5ID0gdlsxXTtcbiAgb3V0WzBdID0geCAqIGFbMF07XG4gIG91dFsxXSA9IHggKiBhWzFdO1xuICBvdXRbMl0gPSB4ICogYVsyXTtcbiAgb3V0WzNdID0geSAqIGFbM107XG4gIG91dFs0XSA9IHkgKiBhWzRdO1xuICBvdXRbNV0gPSB5ICogYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0My50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDE7XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IHZbMF07XG4gIG91dFs3XSA9IHZbMV07XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGVcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICBvdXRbMF0gPSBjO1xuICBvdXRbMV0gPSBzO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAtcztcbiAgb3V0WzRdID0gYztcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQzLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gdlsxXTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNvcHlcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MmQob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IGFbMl07XG4gIG91dFs0XSA9IGFbM107XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IGFbNF07XG4gIG91dFs3XSA9IGFbNV07XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcbipcclxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcbipcclxuKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgdmFyIHggPSBxWzBdLFxuICAgICAgeSA9IHFbMV0sXG4gICAgICB6ID0gcVsyXSxcbiAgICAgIHcgPSBxWzNdO1xuICB2YXIgeDIgPSB4ICsgeDtcbiAgdmFyIHkyID0geSArIHk7XG4gIHZhciB6MiA9IHogKyB6O1xuICB2YXIgeHggPSB4ICogeDI7XG4gIHZhciB5eCA9IHkgKiB4MjtcbiAgdmFyIHl5ID0geSAqIHkyO1xuICB2YXIgenggPSB6ICogeDI7XG4gIHZhciB6eSA9IHogKiB5MjtcbiAgdmFyIHp6ID0geiAqIHoyO1xuICB2YXIgd3ggPSB3ICogeDI7XG4gIHZhciB3eSA9IHcgKiB5MjtcbiAgdmFyIHd6ID0gdyAqIHoyO1xuICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgb3V0WzNdID0geXggLSB3ejtcbiAgb3V0WzZdID0genggKyB3eTtcbiAgb3V0WzFdID0geXggKyB3ejtcbiAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gIG91dFs3XSA9IHp5IC0gd3g7XG4gIG91dFsyXSA9IHp4IC0gd3k7XG4gIG91dFs1XSA9IHp5ICsgd3g7XG4gIG91dFs4XSA9IDEgLSB4eCAtIHl5O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiogQ2FsY3VsYXRlcyBhIDN4MyBub3JtYWwgbWF0cml4ICh0cmFuc3Bvc2UgaW52ZXJzZSkgZnJvbSB0aGUgNHg0IG1hdHJpeFxyXG4qXHJcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4qIEBwYXJhbSB7bWF0NH0gYSBNYXQ0IHRvIGRlcml2ZSB0aGUgbm9ybWFsIG1hdHJpeCBmcm9tXHJcbipcclxuKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07XG4gIHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7IC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcblxuICB2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkZXQgPSAxLjAgLyBkZXQ7XG4gIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xuICBvdXRbMF0gPSAyIC8gd2lkdGg7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSAtMTtcbiAgb3V0WzddID0gMTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0MygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59XG4vKipcclxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XG4gIHJldHVybiBNYXRoLmh5cG90KGFbMF0sIGFbMV0sIGFbMl0sIGFbM10sIGFbNF0sIGFbNV0sIGFbNl0sIGFbN10sIGFbOF0pO1xufVxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgb3V0WzddID0gYVs3XSArIGJbN107XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICBvdXRbNF0gPSBhWzRdICogYjtcbiAgb3V0WzVdID0gYVs1XSAqIGI7XG4gIG91dFs2XSA9IGFbNl0gKiBiO1xuICBvdXRbN10gPSBhWzddICogYjtcbiAgb3V0WzhdID0gYVs4XSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQWRkcyB0d28gbWF0MydzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGU7XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGU7XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGU7XG4gIG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGU7XG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGU7XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGU7XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdICogc2NhbGU7XG4gIG91dFs3XSA9IGFbN10gKyBiWzddICogc2NhbGU7XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJiBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiYgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF07XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXSxcbiAgICAgIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XSxcbiAgICAgIGE2ID0gYVs2XSxcbiAgICAgIGE3ID0gYVs3XSxcbiAgICAgIGE4ID0gYVs4XTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXSxcbiAgICAgIGI0ID0gYls0XSxcbiAgICAgIGI1ID0gYls1XSxcbiAgICAgIGI2ID0gYls2XSxcbiAgICAgIGI3ID0gYls3XSxcbiAgICAgIGI4ID0gYls4XTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJiBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiYgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJiBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiYgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpO1xufVxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5tdWx0aXBseX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIG11bCA9IG11bHRpcGx5O1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHN1YiA9IHN1YnRyYWN0OyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuLyoqXHJcbiAqIDR4NCBNYXRyaXg8YnI+Rm9ybWF0OiBjb2x1bW4tbWFqb3IsIHdoZW4gdHlwZWQgb3V0IGl0IGxvb2tzIGxpa2Ugcm93LW1ham9yPGJyPlRoZSBtYXRyaWNlcyBhcmUgYmVpbmcgcG9zdCBtdWx0aXBsaWVkLlxyXG4gKiBAbW9kdWxlIG1hdDRcclxuICovXG5cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDRcclxuICpcclxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICB9XG5cbiAgb3V0WzBdID0gMTtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICBvdXRbOV0gPSBhWzldO1xuICBvdXRbMTBdID0gYVsxMF07XG4gIG91dFsxMV0gPSBhWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICBvdXRbOV0gPSBhWzldO1xuICBvdXRbMTBdID0gYVsxMF07XG4gIG91dFsxMV0gPSBhWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBtYXQ0IHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBBIG5ldyBtYXQ0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTAzO1xuICBvdXRbNF0gPSBtMTA7XG4gIG91dFs1XSA9IG0xMTtcbiAgb3V0WzZdID0gbTEyO1xuICBvdXRbN10gPSBtMTM7XG4gIG91dFs4XSA9IG0yMDtcbiAgb3V0WzldID0gbTIxO1xuICBvdXRbMTBdID0gbTIyO1xuICBvdXRbMTFdID0gbTIzO1xuICBvdXRbMTJdID0gbTMwO1xuICBvdXRbMTNdID0gbTMxO1xuICBvdXRbMTRdID0gbTMyO1xuICBvdXRbMTVdID0gbTMzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gIGlmIChvdXQgPT09IGEpIHtcbiAgICB2YXIgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICB2YXIgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICB2YXIgYTIzID0gYVsxMV07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGEwMTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGEwMjtcbiAgICBvdXRbOV0gPSBhMTI7XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhMDM7XG4gICAgb3V0WzEzXSA9IGExMztcbiAgICBvdXRbMTRdID0gYTIzO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGFbMV07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGFbMl07XG4gICAgb3V0WzldID0gYVs2XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhWzNdO1xuICAgIG91dFsxM10gPSBhWzddO1xuICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEludmVydHMgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdLFxuICAgICAgYTAzID0gYVszXTtcbiAgdmFyIGExMCA9IGFbNF0sXG4gICAgICBhMTEgPSBhWzVdLFxuICAgICAgYTEyID0gYVs2XSxcbiAgICAgIGExMyA9IGFbN107XG4gIHZhciBhMjAgPSBhWzhdLFxuICAgICAgYTIxID0gYVs5XSxcbiAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgYTIzID0gYVsxMV07XG4gIHZhciBhMzAgPSBhWzEyXSxcbiAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgYTMyID0gYVsxNF0sXG4gICAgICBhMzMgPSBhWzE1XTtcbiAgdmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgdmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgdmFyIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgdmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgdmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgdmFyIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgdmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgdmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgdmFyIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgdmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgdmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgdmFyIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjsgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuXG4gIHZhciBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgaWYgKCFkZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGRldCA9IDEuMCAvIGRldDtcbiAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG4gIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICBvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICBvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcbiAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgb3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xuICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG4gIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgb3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xuICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07XG4gIG91dFswXSA9IGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKTtcbiAgb3V0WzFdID0gLShhMDEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICBvdXRbMl0gPSBhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMik7XG4gIG91dFszXSA9IC0oYTAxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzRdID0gLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xuICBvdXRbNV0gPSBhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMik7XG4gIG91dFs2XSA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzddID0gYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpO1xuICBvdXRbOF0gPSBhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSk7XG4gIG91dFs5XSA9IC0oYTAwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpKTtcbiAgb3V0WzEwXSA9IGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKTtcbiAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgb3V0WzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpKTtcbiAgb3V0WzEzXSA9IGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKTtcbiAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgb3V0WzE1XSA9IGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XSxcbiAgICAgIGExMSA9IGFbNV0sXG4gICAgICBhMTIgPSBhWzZdLFxuICAgICAgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF0sXG4gICAgICBhMjEgPSBhWzldLFxuICAgICAgYTIyID0gYVsxMF0sXG4gICAgICBhMjMgPSBhWzExXTtcbiAgdmFyIGEzMCA9IGFbMTJdLFxuICAgICAgYTMxID0gYVsxM10sXG4gICAgICBhMzIgPSBhWzE0XSxcbiAgICAgIGEzMyA9IGFbMTVdO1xuICB2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICB2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICB2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICB2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICB2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICB2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICB2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICB2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICB2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICB2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICB2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICB2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyOyAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG5cbiAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn1cbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XSxcbiAgICAgIGExMSA9IGFbNV0sXG4gICAgICBhMTIgPSBhWzZdLFxuICAgICAgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF0sXG4gICAgICBhMjEgPSBhWzldLFxuICAgICAgYTIyID0gYVsxMF0sXG4gICAgICBhMjMgPSBhWzExXTtcbiAgdmFyIGEzMCA9IGFbMTJdLFxuICAgICAgYTMxID0gYVsxM10sXG4gICAgICBhMzIgPSBhWzE0XSxcbiAgICAgIGEzMyA9IGFbMTVdOyAvLyBDYWNoZSBvbmx5IHRoZSBjdXJyZW50IGxpbmUgb2YgdGhlIHNlY29uZCBtYXRyaXhcblxuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdLFxuICAgICAgYjMgPSBiWzNdO1xuICBvdXRbMF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgb3V0WzFdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gIG91dFsyXSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICBvdXRbM10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgYjAgPSBiWzRdO1xuICBiMSA9IGJbNV07XG4gIGIyID0gYls2XTtcbiAgYjMgPSBiWzddO1xuICBvdXRbNF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgb3V0WzVdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gIG91dFs2XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICBvdXRbN10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgYjAgPSBiWzhdO1xuICBiMSA9IGJbOV07XG4gIGIyID0gYlsxMF07XG4gIGIzID0gYlsxMV07XG4gIG91dFs4XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICBvdXRbOV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgb3V0WzEwXSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICBvdXRbMTFdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gIGIwID0gYlsxMl07XG4gIGIxID0gYlsxM107XG4gIGIyID0gYlsxNF07XG4gIGIzID0gYlsxNV07XG4gIG91dFsxMl0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgb3V0WzEzXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICBvdXRbMTRdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gIG91dFsxNV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIHZhciB4ID0gdlswXSxcbiAgICAgIHkgPSB2WzFdLFxuICAgICAgeiA9IHZbMl07XG4gIHZhciBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gIHZhciBhMTAsIGExMSwgYTEyLCBhMTM7XG4gIHZhciBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgaWYgKGEgPT09IG91dCkge1xuICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICB9IGVsc2Uge1xuICAgIGEwMCA9IGFbMF07XG4gICAgYTAxID0gYVsxXTtcbiAgICBhMDIgPSBhWzJdO1xuICAgIGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTtcbiAgICBhMTEgPSBhWzVdO1xuICAgIGExMiA9IGFbNl07XG4gICAgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdO1xuICAgIGEyMSA9IGFbOV07XG4gICAgYTIyID0gYVsxMF07XG4gICAgYTIzID0gYVsxMV07XG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG4gICAgb3V0WzNdID0gYTAzO1xuICAgIG91dFs0XSA9IGExMDtcbiAgICBvdXRbNV0gPSBhMTE7XG4gICAgb3V0WzZdID0gYTEyO1xuICAgIG91dFs3XSA9IGExMztcbiAgICBvdXRbOF0gPSBhMjA7XG4gICAgb3V0WzldID0gYTIxO1xuICAgIG91dFsxMF0gPSBhMjI7XG4gICAgb3V0WzExXSA9IGEyMztcbiAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgb3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdO1xuICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMyBub3QgdXNpbmcgdmVjdG9yaXphdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICB2YXIgeCA9IHZbMF0sXG4gICAgICB5ID0gdlsxXSxcbiAgICAgIHogPSB2WzJdO1xuICBvdXRbMF0gPSBhWzBdICogeDtcbiAgb3V0WzFdID0gYVsxXSAqIHg7XG4gIG91dFsyXSA9IGFbMl0gKiB4O1xuICBvdXRbM10gPSBhWzNdICogeDtcbiAgb3V0WzRdID0gYVs0XSAqIHk7XG4gIG91dFs1XSA9IGFbNV0gKiB5O1xuICBvdXRbNl0gPSBhWzZdICogeTtcbiAgb3V0WzddID0gYVs3XSAqIHk7XG4gIG91dFs4XSA9IGFbOF0gKiB6O1xuICBvdXRbOV0gPSBhWzldICogejtcbiAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgdmFyIHggPSBheGlzWzBdLFxuICAgICAgeSA9IGF4aXNbMV0sXG4gICAgICB6ID0gYXhpc1syXTtcbiAgdmFyIGxlbiA9IE1hdGguaHlwb3QoeCwgeSwgeik7XG4gIHZhciBzLCBjLCB0O1xuICB2YXIgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICB2YXIgYTEwLCBhMTEsIGExMiwgYTEzO1xuICB2YXIgYTIwLCBhMjEsIGEyMiwgYTIzO1xuICB2YXIgYjAwLCBiMDEsIGIwMjtcbiAgdmFyIGIxMCwgYjExLCBiMTI7XG4gIHZhciBiMjAsIGIyMSwgYjIyO1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZW4gPSAxIC8gbGVuO1xuICB4ICo9IGxlbjtcbiAgeSAqPSBsZW47XG4gIHogKj0gbGVuO1xuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYztcbiAgYTAwID0gYVswXTtcbiAgYTAxID0gYVsxXTtcbiAgYTAyID0gYVsyXTtcbiAgYTAzID0gYVszXTtcbiAgYTEwID0gYVs0XTtcbiAgYTExID0gYVs1XTtcbiAgYTEyID0gYVs2XTtcbiAgYTEzID0gYVs3XTtcbiAgYTIwID0gYVs4XTtcbiAgYTIxID0gYVs5XTtcbiAgYTIyID0gYVsxMF07XG4gIGEyMyA9IGFbMTFdOyAvLyBDb25zdHJ1Y3QgdGhlIGVsZW1lbnRzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXhcblxuICBiMDAgPSB4ICogeCAqIHQgKyBjO1xuICBiMDEgPSB5ICogeCAqIHQgKyB6ICogcztcbiAgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gIGIxMCA9IHggKiB5ICogdCAtIHogKiBzO1xuICBiMTEgPSB5ICogeSAqIHQgKyBjO1xuICBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7XG4gIGIyMSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICBiMjIgPSB6ICogeiAqIHQgKyBjOyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG4gIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTtcbiAgdmFyIGExMCA9IGFbNF07XG4gIHZhciBhMTEgPSBhWzVdO1xuICB2YXIgYTEyID0gYVs2XTtcbiAgdmFyIGExMyA9IGFbN107XG4gIHZhciBhMjAgPSBhWzhdO1xuICB2YXIgYTIxID0gYVs5XTtcbiAgdmFyIGEyMiA9IGFbMTBdO1xuICB2YXIgYTIzID0gYVsxMV07XG5cbiAgaWYgKGEgIT09IG91dCkge1xuICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cblxuICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcbiAgb3V0WzVdID0gYTExICogYyArIGEyMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcbiAgb3V0WzhdID0gYTIwICogYyAtIGExMCAqIHM7XG4gIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XG4gIG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogcztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7XG4gIHZhciBhMDAgPSBhWzBdO1xuICB2YXIgYTAxID0gYVsxXTtcbiAgdmFyIGEwMiA9IGFbMl07XG4gIHZhciBhMDMgPSBhWzNdO1xuICB2YXIgYTIwID0gYVs4XTtcbiAgdmFyIGEyMSA9IGFbOV07XG4gIHZhciBhMjIgPSBhWzEwXTtcbiAgdmFyIGEyMyA9IGFbMTFdO1xuXG4gIGlmIChhICE9PSBvdXQpIHtcbiAgICAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH0gLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG5cbiAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzO1xuICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogcztcbiAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjO1xuICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogYztcbiAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpO1xuICB2YXIgYTAwID0gYVswXTtcbiAgdmFyIGEwMSA9IGFbMV07XG4gIHZhciBhMDIgPSBhWzJdO1xuICB2YXIgYTAzID0gYVszXTtcbiAgdmFyIGExMCA9IGFbNF07XG4gIHZhciBhMTEgPSBhWzVdO1xuICB2YXIgYTEyID0gYVs2XTtcbiAgdmFyIGExMyA9IGFbN107XG5cbiAgaWYgKGEgIT09IG91dCkge1xuICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuXG4gIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogcztcbiAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogcztcbiAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogcztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjM30gdiBTY2FsaW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVNjYWxpbmcob3V0LCB2KSB7XG4gIG91dFswXSA9IHZbMF07XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IHZbMV07XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSB2WzJdO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGUgYXJvdW5kIGEgZ2l2ZW4gYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZShkZXN0LCBkZXN0LCByYWQsIGF4aXMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQsIGF4aXMpIHtcbiAgdmFyIHggPSBheGlzWzBdLFxuICAgICAgeSA9IGF4aXNbMV0sXG4gICAgICB6ID0gYXhpc1syXTtcbiAgdmFyIGxlbiA9IE1hdGguaHlwb3QoeCwgeSwgeik7XG4gIHZhciBzLCBjLCB0O1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZW4gPSAxIC8gbGVuO1xuICB4ICo9IGxlbjtcbiAgeSAqPSBsZW47XG4gIHogKj0gbGVuO1xuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYzsgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuICBvdXRbMF0gPSB4ICogeCAqIHQgKyBjO1xuICBvdXRbMV0gPSB5ICogeCAqIHQgKyB6ICogcztcbiAgb3V0WzJdID0geiAqIHggKiB0IC0geSAqIHM7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHggKiB5ICogdCAtIHogKiBzO1xuICBvdXRbNV0gPSB5ICogeSAqIHQgKyBjO1xuICBvdXRbNl0gPSB6ICogeSAqIHQgKyB4ICogcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geCAqIHogKiB0ICsgeSAqIHM7XG4gIG91dFs5XSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICBvdXRbMTBdID0geiAqIHogKiB0ICsgYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5yb3RhdGVYKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21YUm90YXRpb24ob3V0LCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSBjO1xuICBvdXRbNl0gPSBzO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAtcztcbiAgb3V0WzEwXSA9IGM7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpOyAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cbiAgb3V0WzBdID0gYztcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gLXM7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHM7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZVooZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVpSb3RhdGlvbihvdXQsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTsgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG4gIG91dFswXSA9IGM7XG4gIG91dFsxXSA9IHM7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IC1zO1xuICBvdXRbNV0gPSBjO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBxLCB2KSB7XG4gIC8vIFF1YXRlcm5pb24gbWF0aFxuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHh5ID0geCAqIHkyO1xuICB2YXIgeHogPSB4ICogejI7XG4gIHZhciB5eSA9IHkgKiB5MjtcbiAgdmFyIHl6ID0geSAqIHoyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gIG91dFsxXSA9IHh5ICsgd3o7XG4gIG91dFsyXSA9IHh6IC0gd3k7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHh5IC0gd3o7XG4gIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gIG91dFs2XSA9IHl6ICsgd3g7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHh6ICsgd3k7XG4gIG91dFs5XSA9IHl6IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGZyb20gYSBkdWFsIHF1YXQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IE1hdHJpeFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0MihvdXQsIGEpIHtcbiAgdmFyIHRyYW5zbGF0aW9uID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIHZhciBieCA9IC1hWzBdLFxuICAgICAgYnkgPSAtYVsxXSxcbiAgICAgIGJ6ID0gLWFbMl0sXG4gICAgICBidyA9IGFbM10sXG4gICAgICBheCA9IGFbNF0sXG4gICAgICBheSA9IGFbNV0sXG4gICAgICBheiA9IGFbNl0sXG4gICAgICBhdyA9IGFbN107XG4gIHZhciBtYWduaXR1ZGUgPSBieCAqIGJ4ICsgYnkgKiBieSArIGJ6ICogYnogKyBidyAqIGJ3OyAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcblxuICBpZiAobWFnbml0dWRlID4gMCkge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMiAvIG1hZ25pdHVkZTtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDIgLyBtYWduaXR1ZGU7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyIC8gbWFnbml0dWRlO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMjtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDI7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xuICB9XG5cbiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBhLCB0cmFuc2xhdGlvbik7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXHJcbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXHJcbiAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xuICBvdXRbMF0gPSBtYXRbMTJdO1xuICBvdXRbMV0gPSBtYXRbMTNdO1xuICBvdXRbMl0gPSBtYXRbMTRdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXHJcbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxyXG4gKiAgd2l0aCBhIG5vcm1hbGl6ZWQgUXVhdGVybmlvbiBwYXJhbXRlciwgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlXHJcbiAqICB0aGUgc2FtZSBhcyB0aGUgc2NhbGluZyB2ZWN0b3JcclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcbiAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnRcclxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuICogQHJldHVybiB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICB2YXIgbTExID0gbWF0WzBdO1xuICB2YXIgbTEyID0gbWF0WzFdO1xuICB2YXIgbTEzID0gbWF0WzJdO1xuICB2YXIgbTIxID0gbWF0WzRdO1xuICB2YXIgbTIyID0gbWF0WzVdO1xuICB2YXIgbTIzID0gbWF0WzZdO1xuICB2YXIgbTMxID0gbWF0WzhdO1xuICB2YXIgbTMyID0gbWF0WzldO1xuICB2YXIgbTMzID0gbWF0WzEwXTtcbiAgb3V0WzBdID0gTWF0aC5oeXBvdChtMTEsIG0xMiwgbTEzKTtcbiAgb3V0WzFdID0gTWF0aC5oeXBvdChtMjEsIG0yMiwgbTIzKTtcbiAgb3V0WzJdID0gTWF0aC5oeXBvdChtMzEsIG0zMiwgbTMzKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XHJcbiAqICBvZiBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aFxyXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXHJcbiAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IFF1YXRlcm5pb24gdG8gcmVjZWl2ZSB0aGUgcm90YXRpb24gY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuICogQHJldHVybiB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um90YXRpb24ob3V0LCBtYXQpIHtcbiAgdmFyIHNjYWxpbmcgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgZ2V0U2NhbGluZyhzY2FsaW5nLCBtYXQpO1xuICB2YXIgaXMxID0gMSAvIHNjYWxpbmdbMF07XG4gIHZhciBpczIgPSAxIC8gc2NhbGluZ1sxXTtcbiAgdmFyIGlzMyA9IDEgLyBzY2FsaW5nWzJdO1xuICB2YXIgc20xMSA9IG1hdFswXSAqIGlzMTtcbiAgdmFyIHNtMTIgPSBtYXRbMV0gKiBpczI7XG4gIHZhciBzbTEzID0gbWF0WzJdICogaXMzO1xuICB2YXIgc20yMSA9IG1hdFs0XSAqIGlzMTtcbiAgdmFyIHNtMjIgPSBtYXRbNV0gKiBpczI7XG4gIHZhciBzbTIzID0gbWF0WzZdICogaXMzO1xuICB2YXIgc20zMSA9IG1hdFs4XSAqIGlzMTtcbiAgdmFyIHNtMzIgPSBtYXRbOV0gKiBpczI7XG4gIHZhciBzbTMzID0gbWF0WzEwXSAqIGlzMztcbiAgdmFyIHRyYWNlID0gc20xMSArIHNtMjIgKyBzbTMzO1xuICB2YXIgUyA9IDA7XG5cbiAgaWYgKHRyYWNlID4gMCkge1xuICAgIFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMjtcbiAgICBvdXRbM10gPSAwLjI1ICogUztcbiAgICBvdXRbMF0gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICBvdXRbMV0gPSAoc20zMSAtIHNtMTMpIC8gUztcbiAgICBvdXRbMl0gPSAoc20xMiAtIHNtMjEpIC8gUztcbiAgfSBlbHNlIGlmIChzbTExID4gc20yMiAmJiBzbTExID4gc20zMykge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20xMSAtIHNtMjIgLSBzbTMzKSAqIDI7XG4gICAgb3V0WzNdID0gKHNtMjMgLSBzbTMyKSAvIFM7XG4gICAgb3V0WzBdID0gMC4yNSAqIFM7XG4gICAgb3V0WzFdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgb3V0WzJdID0gKHNtMzEgKyBzbTEzKSAvIFM7XG4gIH0gZWxzZSBpZiAoc20yMiA+IHNtMzMpIHtcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMjIgLSBzbTExIC0gc20zMykgKiAyO1xuICAgIG91dFszXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgIG91dFswXSA9IChzbTEyICsgc20yMSkgLyBTO1xuICAgIG91dFsxXSA9IDAuMjUgKiBTO1xuICAgIG91dFsyXSA9IChzbTIzICsgc20zMikgLyBTO1xuICB9IGVsc2Uge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20zMyAtIHNtMTEgLSBzbTIyKSAqIDI7XG4gICAgb3V0WzNdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gICAgb3V0WzBdID0gKHNtMzEgKyBzbTEzKSAvIFM7XG4gICAgb3V0WzFdID0gKHNtMjMgKyBzbTMyKSAvIFM7XG4gICAgb3V0WzJdID0gMC4yNSAqIFM7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUob3V0LCBxLCB2LCBzKSB7XG4gIC8vIFF1YXRlcm5pb24gbWF0aFxuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHh5ID0geCAqIHkyO1xuICB2YXIgeHogPSB4ICogejI7XG4gIHZhciB5eSA9IHkgKiB5MjtcbiAgdmFyIHl6ID0geSAqIHoyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIHZhciBzeCA9IHNbMF07XG4gIHZhciBzeSA9IHNbMV07XG4gIHZhciBzeiA9IHNbMl07XG4gIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgb3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGUsIHJvdGF0aW5nIGFuZCBzY2FsaW5nIGFyb3VuZCB0aGUgZ2l2ZW4gb3JpZ2luXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBvcmlnaW4pO1xyXG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBuZWdhdGl2ZU9yaWdpbik7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gbyBUaGUgb3JpZ2luIHZlY3RvciBhcm91bmQgd2hpY2ggdG8gc2NhbGUgYW5kIHJvdGF0ZVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbihvdXQsIHEsIHYsIHMsIG8pIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIHZhciB4ID0gcVswXSxcbiAgICAgIHkgPSBxWzFdLFxuICAgICAgeiA9IHFbMl0sXG4gICAgICB3ID0gcVszXTtcbiAgdmFyIHgyID0geCArIHg7XG4gIHZhciB5MiA9IHkgKyB5O1xuICB2YXIgejIgPSB6ICsgejtcbiAgdmFyIHh4ID0geCAqIHgyO1xuICB2YXIgeHkgPSB4ICogeTI7XG4gIHZhciB4eiA9IHggKiB6MjtcbiAgdmFyIHl5ID0geSAqIHkyO1xuICB2YXIgeXogPSB5ICogejI7XG4gIHZhciB6eiA9IHogKiB6MjtcbiAgdmFyIHd4ID0gdyAqIHgyO1xuICB2YXIgd3kgPSB3ICogeTI7XG4gIHZhciB3eiA9IHcgKiB6MjtcbiAgdmFyIHN4ID0gc1swXTtcbiAgdmFyIHN5ID0gc1sxXTtcbiAgdmFyIHN6ID0gc1syXTtcbiAgdmFyIG94ID0gb1swXTtcbiAgdmFyIG95ID0gb1sxXTtcbiAgdmFyIG96ID0gb1syXTtcbiAgdmFyIG91dDAgPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcbiAgdmFyIG91dDEgPSAoeHkgKyB3eikgKiBzeDtcbiAgdmFyIG91dDIgPSAoeHogLSB3eSkgKiBzeDtcbiAgdmFyIG91dDQgPSAoeHkgLSB3eikgKiBzeTtcbiAgdmFyIG91dDUgPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgdmFyIG91dDYgPSAoeXogKyB3eCkgKiBzeTtcbiAgdmFyIG91dDggPSAoeHogKyB3eSkgKiBzejtcbiAgdmFyIG91dDkgPSAoeXogLSB3eCkgKiBzejtcbiAgdmFyIG91dDEwID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gIG91dFswXSA9IG91dDA7XG4gIG91dFsxXSA9IG91dDE7XG4gIG91dFsyXSA9IG91dDI7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IG91dDQ7XG4gIG91dFs1XSA9IG91dDU7XG4gIG91dFs2XSA9IG91dDY7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IG91dDg7XG4gIG91dFs5XSA9IG91dDk7XG4gIG91dFsxMF0gPSBvdXQxMDtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSB2WzBdICsgb3ggLSAob3V0MCAqIG94ICsgb3V0NCAqIG95ICsgb3V0OCAqIG96KTtcbiAgb3V0WzEzXSA9IHZbMV0gKyBveSAtIChvdXQxICogb3ggKyBvdXQ1ICogb3kgKyBvdXQ5ICogb3opO1xuICBvdXRbMTRdID0gdlsyXSArIG96IC0gKG91dDIgKiBveCArIG91dDYgKiBveSArIG91dDEwICogb3opO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgdmFyIHggPSBxWzBdLFxuICAgICAgeSA9IHFbMV0sXG4gICAgICB6ID0gcVsyXSxcbiAgICAgIHcgPSBxWzNdO1xuICB2YXIgeDIgPSB4ICsgeDtcbiAgdmFyIHkyID0geSArIHk7XG4gIHZhciB6MiA9IHogKyB6O1xuICB2YXIgeHggPSB4ICogeDI7XG4gIHZhciB5eCA9IHkgKiB4MjtcbiAgdmFyIHl5ID0geSAqIHkyO1xuICB2YXIgenggPSB6ICogeDI7XG4gIHZhciB6eSA9IHogKiB5MjtcbiAgdmFyIHp6ID0geiAqIHoyO1xuICB2YXIgd3ggPSB3ICogeDI7XG4gIHZhciB3eSA9IHcgKiB5MjtcbiAgdmFyIHd6ID0gdyAqIHoyO1xuICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgb3V0WzFdID0geXggKyB3ejtcbiAgb3V0WzJdID0genggLSB3eTtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geXggLSB3ejtcbiAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gIG91dFs2XSA9IHp5ICsgd3g7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHp4ICsgd3k7XG4gIG91dFs5XSA9IHp5IC0gd3g7XG4gIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZydXN0dW0ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICB2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCk7XG4gIHZhciB0YiA9IDEgLyAodG9wIC0gYm90dG9tKTtcbiAgdmFyIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzBdID0gbmVhciAqIDIgKiBybDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gbmVhciAqIDIgKiB0YjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcbiAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICBvdXRbMTFdID0gLTE7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IGZhciAqIG5lYXIgKiAyICogbmY7XG4gIG91dFsxNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kcy5cclxuICogUGFzc2luZyBudWxsL3VuZGVmaW5lZC9ubyB2YWx1ZSBmb3IgZmFyIHdpbGwgZ2VuZXJhdGUgaW5maW5pdGUgcHJvamVjdGlvbiBtYXRyaXguXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW0sIGNhbiBiZSBudWxsIG9yIEluZmluaXR5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgbmY7XG4gIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IGY7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMV0gPSAtMTtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTVdID0gMDtcblxuICBpZiAoZmFyICE9IG51bGwgJiYgZmFyICE9PSBJbmZpbml0eSkge1xuICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XG4gIH0gZWxzZSB7XG4gICAgb3V0WzEwXSA9IC0xO1xuICAgIG91dFsxNF0gPSAtMiAqIG5lYXI7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXHJcbiAqIFRoaXMgaXMgcHJpbWFyaWx5IHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBwcm9qZWN0aW9uIG1hdHJpY2VzIHRvIGJlIHVzZWRcclxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldyhvdXQsIGZvdiwgbmVhciwgZmFyKSB7XG4gIHZhciB1cFRhbiA9IE1hdGgudGFuKGZvdi51cERlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwLjApO1xuICB2YXIgZG93blRhbiA9IE1hdGgudGFuKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMCk7XG4gIHZhciBsZWZ0VGFuID0gTWF0aC50YW4oZm92LmxlZnREZWdyZWVzICogTWF0aC5QSSAvIDE4MC4wKTtcbiAgdmFyIHJpZ2h0VGFuID0gTWF0aC50YW4oZm92LnJpZ2h0RGVncmVlcyAqIE1hdGguUEkgLyAxODAuMCk7XG4gIHZhciB4U2NhbGUgPSAyLjAgLyAobGVmdFRhbiArIHJpZ2h0VGFuKTtcbiAgdmFyIHlTY2FsZSA9IDIuMCAvICh1cFRhbiArIGRvd25UYW4pO1xuICBvdXRbMF0gPSB4U2NhbGU7XG4gIG91dFsxXSA9IDAuMDtcbiAgb3V0WzJdID0gMC4wO1xuICBvdXRbM10gPSAwLjA7XG4gIG91dFs0XSA9IDAuMDtcbiAgb3V0WzVdID0geVNjYWxlO1xuICBvdXRbNl0gPSAwLjA7XG4gIG91dFs3XSA9IDAuMDtcbiAgb3V0WzhdID0gLSgobGVmdFRhbiAtIHJpZ2h0VGFuKSAqIHhTY2FsZSAqIDAuNSk7XG4gIG91dFs5XSA9ICh1cFRhbiAtIGRvd25UYW4pICogeVNjYWxlICogMC41O1xuICBvdXRbMTBdID0gZmFyIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMTFdID0gLTEuMDtcbiAgb3V0WzEyXSA9IDAuMDtcbiAgb3V0WzEzXSA9IDAuMDtcbiAgb3V0WzE0XSA9IGZhciAqIG5lYXIgLyAobmVhciAtIGZhcik7XG4gIG91dFsxNV0gPSAwLjA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBvcnRobyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gIHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KTtcbiAgdmFyIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApO1xuICB2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSAtMiAqIGxyO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAtMiAqIGJ0O1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMiAqIG5mO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XG4gIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzLlxyXG4gKiBJZiB5b3Ugd2FudCBhIG1hdHJpeCB0aGF0IGFjdHVhbGx5IG1ha2VzIGFuIG9iamVjdCBsb29rIGF0IGFub3RoZXIgb2JqZWN0LCB5b3Ugc2hvdWxkIHVzZSB0YXJnZXRUbyBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbG9va0F0KG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW47XG4gIHZhciBleWV4ID0gZXllWzBdO1xuICB2YXIgZXlleSA9IGV5ZVsxXTtcbiAgdmFyIGV5ZXogPSBleWVbMl07XG4gIHZhciB1cHggPSB1cFswXTtcbiAgdmFyIHVweSA9IHVwWzFdO1xuICB2YXIgdXB6ID0gdXBbMl07XG4gIHZhciBjZW50ZXJ4ID0gY2VudGVyWzBdO1xuICB2YXIgY2VudGVyeSA9IGNlbnRlclsxXTtcbiAgdmFyIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgaWYgKE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IGdsTWF0cml4LkVQU0lMT04gJiYgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJiBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5KG91dCk7XG4gIH1cblxuICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuICBsZW4gPSAxIC8gTWF0aC5oeXBvdCh6MCwgejEsIHoyKTtcbiAgejAgKj0gbGVuO1xuICB6MSAqPSBsZW47XG4gIHoyICo9IGxlbjtcbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0gTWF0aC5oeXBvdCh4MCwgeDEsIHgyKTtcblxuICBpZiAoIWxlbikge1xuICAgIHgwID0gMDtcbiAgICB4MSA9IDA7XG4gICAgeDIgPSAwO1xuICB9IGVsc2Uge1xuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG4gIH1cblxuICB5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xuICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuICBsZW4gPSBNYXRoLmh5cG90KHkwLCB5MSwgeTIpO1xuXG4gIGlmICghbGVuKSB7XG4gICAgeTAgPSAwO1xuICAgIHkxID0gMDtcbiAgICB5MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB5MCAqPSBsZW47XG4gICAgeTEgKj0gbGVuO1xuICAgIHkyICo9IGxlbjtcbiAgfVxuXG4gIG91dFswXSA9IHgwO1xuICBvdXRbMV0gPSB5MDtcbiAgb3V0WzJdID0gejA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHgxO1xuICBvdXRbNV0gPSB5MTtcbiAgb3V0WzZdID0gejE7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHgyO1xuICBvdXRbOV0gPSB5MjtcbiAgb3V0WzEwXSA9IHoyO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgbWF0cml4IHRoYXQgbWFrZXMgc29tZXRoaW5nIGxvb2sgYXQgc29tZXRoaW5nIGVsc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xuICB2YXIgZXlleCA9IGV5ZVswXSxcbiAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICB1cHkgPSB1cFsxXSxcbiAgICAgIHVweiA9IHVwWzJdO1xuICB2YXIgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxuICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxuICAgICAgejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xuICB2YXIgbGVuID0gejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyO1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuICB9XG5cbiAgdmFyIHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcbiAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcbiAgICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyO1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHgwICo9IGxlbjtcbiAgICB4MSAqPSBsZW47XG4gICAgeDIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHgxO1xuICBvdXRbMl0gPSB4MjtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XG4gIG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICBvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gejA7XG4gIG91dFs5XSA9IHoxO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gZXlleDtcbiAgb3V0WzEzXSA9IGV5ZXk7XG4gIG91dFsxNF0gPSBleWV6O1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbjtcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgKyBhWzEyXSArICcsICcgKyBhWzEzXSArICcsICcgKyBhWzE0XSArICcsICcgKyBhWzE1XSArICcpJztcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcbiAgcmV0dXJuIE1hdGguaHlwb3QoYVswXSwgYVsxXSwgYVszXSwgYVs0XSwgYVs1XSwgYVs2XSwgYVs3XSwgYVs4XSwgYVs5XSwgYVsxMF0sIGFbMTFdLCBhWzEyXSwgYVsxM10sIGFbMTRdLCBhWzE1XSk7XG59XG4vKipcclxuICogQWRkcyB0d28gbWF0NCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gIG91dFs5XSA9IGFbOV0gKyBiWzldO1xuICBvdXRbMTBdID0gYVsxMF0gKyBiWzEwXTtcbiAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV07XG4gIG91dFsxMl0gPSBhWzEyXSArIGJbMTJdO1xuICBvdXRbMTNdID0gYVsxM10gKyBiWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF07XG4gIG91dFsxNV0gPSBhWzE1XSArIGJbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgb3V0WzldID0gYVs5XSAtIGJbOV07XG4gIG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdO1xuICBvdXRbMTFdID0gYVsxMV0gLSBiWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdIC0gYlsxMl07XG4gIG91dFsxM10gPSBhWzEzXSAtIGJbMTNdO1xuICBvdXRbMTRdID0gYVsxNF0gLSBiWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdIC0gYlsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgb3V0WzRdID0gYVs0XSAqIGI7XG4gIG91dFs1XSA9IGFbNV0gKiBiO1xuICBvdXRbNl0gPSBhWzZdICogYjtcbiAgb3V0WzddID0gYVs3XSAqIGI7XG4gIG91dFs4XSA9IGFbOF0gKiBiO1xuICBvdXRbOV0gPSBhWzldICogYjtcbiAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgb3V0WzExXSA9IGFbMTFdICogYjtcbiAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgb3V0WzE0XSA9IGFbMTRdICogYjtcbiAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQ0J3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgb3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZTtcbiAgb3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZTtcbiAgb3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZTtcbiAgb3V0WzldID0gYVs5XSArIGJbOV0gKiBzY2FsZTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF0gKiBzY2FsZTtcbiAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV0gKiBzY2FsZTtcbiAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl0gKiBzY2FsZTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM10gKiBzY2FsZTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF0gKiBzY2FsZTtcbiAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV0gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG4gKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XSAmJiBhWzZdID09PSBiWzZdICYmIGFbN10gPT09IGJbN10gJiYgYVs4XSA9PT0gYls4XSAmJiBhWzldID09PSBiWzldICYmIGFbMTBdID09PSBiWzEwXSAmJiBhWzExXSA9PT0gYlsxMV0gJiYgYVsxMl0gPT09IGJbMTJdICYmIGFbMTNdID09PSBiWzEzXSAmJiBhWzE0XSA9PT0gYlsxNF0gJiYgYVsxNV0gPT09IGJbMTVdO1xufVxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl0sXG4gICAgICBhMyA9IGFbM107XG4gIHZhciBhNCA9IGFbNF0sXG4gICAgICBhNSA9IGFbNV0sXG4gICAgICBhNiA9IGFbNl0sXG4gICAgICBhNyA9IGFbN107XG4gIHZhciBhOCA9IGFbOF0sXG4gICAgICBhOSA9IGFbOV0sXG4gICAgICBhMTAgPSBhWzEwXSxcbiAgICAgIGExMSA9IGFbMTFdO1xuICB2YXIgYTEyID0gYVsxMl0sXG4gICAgICBhMTMgPSBhWzEzXSxcbiAgICAgIGExNCA9IGFbMTRdLFxuICAgICAgYTE1ID0gYVsxNV07XG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl0sXG4gICAgICBiMyA9IGJbM107XG4gIHZhciBiNCA9IGJbNF0sXG4gICAgICBiNSA9IGJbNV0sXG4gICAgICBiNiA9IGJbNl0sXG4gICAgICBiNyA9IGJbN107XG4gIHZhciBiOCA9IGJbOF0sXG4gICAgICBiOSA9IGJbOV0sXG4gICAgICBiMTAgPSBiWzEwXSxcbiAgICAgIGIxMSA9IGJbMTFdO1xuICB2YXIgYjEyID0gYlsxMl0sXG4gICAgICBiMTMgPSBiWzEzXSxcbiAgICAgIGIxNCA9IGJbMTRdLFxuICAgICAgYjE1ID0gYlsxNV07XG4gIHJldHVybiBNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJiBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiYgTWF0aC5hYnMoYTQgLSBiNCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJiBNYXRoLmFicyhhNiAtIGI2KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiYgTWF0aC5hYnMoYTcgLSBiNykgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmIE1hdGguYWJzKGE4IC0gYjgpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSAmJiBNYXRoLmFicyhhOSAtIGI5KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOSksIE1hdGguYWJzKGI5KSkgJiYgTWF0aC5hYnMoYTEwIC0gYjEwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTApLCBNYXRoLmFicyhiMTApKSAmJiBNYXRoLmFicyhhMTEgLSBiMTEpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMSksIE1hdGguYWJzKGIxMSkpICYmIE1hdGguYWJzKGExMiAtIGIxMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEyKSwgTWF0aC5hYnMoYjEyKSkgJiYgTWF0aC5hYnMoYTEzIC0gYjEzKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTMpLCBNYXRoLmFicyhiMTMpKSAmJiBNYXRoLmFicyhhMTQgLSBiMTQpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNCksIE1hdGguYWJzKGIxNCkpICYmIE1hdGguYWJzKGExNSAtIGIxNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE1KSwgTWF0aC5hYnMoYjE1KSk7XG59XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0LnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3ViID0gc3VidHJhY3Q7IiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG4vKipcclxuICogMyBEaW1lbnNpb25hbCBWZWN0b3JcclxuICogQG1vZHVsZSB2ZWMzXHJcbiAqL1xuXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xyXG4gKlxyXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHJldHVybiBNYXRoLmh5cG90KHgsIHksIHopO1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeikge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQWRkcyB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogRGl2aWRlcyB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNlaWxcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBmbG9vclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXTtcbiAgdmFyIHkgPSBiWzFdIC0gYVsxXTtcbiAgdmFyIHogPSBiWzJdIC0gYVsyXTtcbiAgcmV0dXJuIE1hdGguaHlwb3QoeCwgeSwgeik7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXTtcbiAgdmFyIHkgPSBiWzFdIC0gYVsxXTtcbiAgdmFyIHogPSBiWzJdIC0gYVsyXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuLyoqXHJcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gIG91dFswXSA9IC1hWzBdO1xuICBvdXRbMV0gPSAtYVsxXTtcbiAgb3V0WzJdID0gLWFbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gIG91dFswXSA9IDEuMCAvIGFbMF07XG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTm9ybWFsaXplIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICB2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6O1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gIH1cblxuICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG4vKipcclxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl07XG4gIHZhciBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICBieiA9IGJbMl07XG4gIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgdmFyIGF4ID0gYVswXTtcbiAgdmFyIGF5ID0gYVsxXTtcbiAgdmFyIGF6ID0gYVsyXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGhlcm1pdGUgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICB2YXIgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIHZhciBmYWN0b3IxID0gZmFjdG9yVGltZXMyICogKDIgKiB0IC0gMykgKyAxO1xuICB2YXIgZmFjdG9yMiA9IGZhY3RvclRpbWVzMiAqICh0IC0gMikgKyB0O1xuICB2YXIgZmFjdG9yMyA9IGZhY3RvclRpbWVzMiAqICh0IC0gMSk7XG4gIHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogKDMgLSAyICogdCk7XG4gIG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0O1xuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcbiAgb3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUGVyZm9ybXMgYSBiZXppZXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIHZhciBpbnZlcnNlRmFjdG9yID0gMSAtIHQ7XG4gIHZhciBpbnZlcnNlRmFjdG9yVGltZXNUd28gPSBpbnZlcnNlRmFjdG9yICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvclRpbWVzMiA9IHQgKiB0O1xuICB2YXIgZmFjdG9yMSA9IGludmVyc2VGYWN0b3JUaW1lc1R3byAqIGludmVyc2VGYWN0b3I7XG4gIHZhciBmYWN0b3IyID0gMyAqIHQgKiBpbnZlcnNlRmFjdG9yVGltZXNUd287XG4gIHZhciBmYWN0b3IzID0gMyAqIGZhY3RvclRpbWVzMiAqIGludmVyc2VGYWN0b3I7XG4gIHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogdDtcbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG4gIHZhciByID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICB2YXIgeiA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wIC0gMS4wO1xuICB2YXIgelNjYWxlID0gTWF0aC5zcXJ0KDEuMCAtIHogKiB6KSAqIHNjYWxlO1xuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZTtcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XG4gIG91dFsyXSA9IHogKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxyXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTtcbiAgdmFyIHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gIHcgPSB3IHx8IDEuMDtcbiAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XG4gIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xuICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7bWF0M30gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTtcbiAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XHJcbiAqIENhbiBhbHNvIGJlIHVzZWQgZm9yIGR1YWwgcXVhdGVybmlvbnMuIChNdWx0aXBseSBpdCB3aXRoIHRoZSByZWFsIHBhcnQpXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcbiAgLy8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXG4gIHZhciBxeCA9IHFbMF0sXG4gICAgICBxeSA9IHFbMV0sXG4gICAgICBxeiA9IHFbMl0sXG4gICAgICBxdyA9IHFbM107XG4gIHZhciB4ID0gYVswXSxcbiAgICAgIHkgPSBhWzFdLFxuICAgICAgeiA9IGFbMl07IC8vIHZhciBxdmVjID0gW3F4LCBxeSwgcXpdO1xuICAvLyB2YXIgdXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCBhKTtcblxuICB2YXIgdXZ4ID0gcXkgKiB6IC0gcXogKiB5LFxuICAgICAgdXZ5ID0gcXogKiB4IC0gcXggKiB6LFxuICAgICAgdXZ6ID0gcXggKiB5IC0gcXkgKiB4OyAvLyB2YXIgdXV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgdXYpO1xuXG4gIHZhciB1dXZ4ID0gcXkgKiB1dnogLSBxeiAqIHV2eSxcbiAgICAgIHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6LFxuICAgICAgdXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dng7IC8vIHZlYzMuc2NhbGUodXYsIHV2LCAyICogdyk7XG5cbiAgdmFyIHcyID0gcXcgKiAyO1xuICB1dnggKj0gdzI7XG4gIHV2eSAqPSB3MjtcbiAgdXZ6ICo9IHcyOyAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcblxuICB1dXZ4ICo9IDI7XG4gIHV1dnkgKj0gMjtcbiAgdXV2eiAqPSAyOyAvLyByZXR1cm4gdmVjMy5hZGQob3V0LCBhLCB2ZWMzLmFkZChvdXQsIHV2LCB1dXYpKTtcblxuICBvdXRbMF0gPSB4ICsgdXZ4ICsgdXV2eDtcbiAgb3V0WzFdID0geSArIHV2eSArIHV1dnk7XG4gIG91dFsyXSA9IHogKyB1dnogKyB1dXZ6O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgYiwgYykge1xuICB2YXIgcCA9IFtdLFxuICAgICAgciA9IFtdOyAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTsgLy9wZXJmb3JtIHJvdGF0aW9uXG5cbiAgclswXSA9IHBbMF07XG4gIHJbMV0gPSBwWzFdICogTWF0aC5jb3MoYykgLSBwWzJdICogTWF0aC5zaW4oYyk7XG4gIHJbMl0gPSBwWzFdICogTWF0aC5zaW4oYykgKyBwWzJdICogTWF0aC5jb3MoYyk7IC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgYiwgYykge1xuICB2YXIgcCA9IFtdLFxuICAgICAgciA9IFtdOyAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTsgLy9wZXJmb3JtIHJvdGF0aW9uXG5cbiAgclswXSA9IHBbMl0gKiBNYXRoLnNpbihjKSArIHBbMF0gKiBNYXRoLmNvcyhjKTtcbiAgclsxXSA9IHBbMV07XG4gIHJbMl0gPSBwWzJdICogTWF0aC5jb3MoYykgLSBwWzBdICogTWF0aC5zaW4oYyk7IC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgYiwgYykge1xuICB2YXIgcCA9IFtdLFxuICAgICAgciA9IFtdOyAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTsgLy9wZXJmb3JtIHJvdGF0aW9uXG5cbiAgclswXSA9IHBbMF0gKiBNYXRoLmNvcyhjKSAtIHBbMV0gKiBNYXRoLnNpbihjKTtcbiAgclsxXSA9IHBbMF0gKiBNYXRoLnNpbihjKSArIHBbMV0gKiBNYXRoLmNvcyhjKTtcbiAgclsyXSA9IHBbMl07IC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcbiAgdmFyIHRlbXBBID0gZnJvbVZhbHVlcyhhWzBdLCBhWzFdLCBhWzJdKTtcbiAgdmFyIHRlbXBCID0gZnJvbVZhbHVlcyhiWzBdLCBiWzFdLCBiWzJdKTtcbiAgbm9ybWFsaXplKHRlbXBBLCB0ZW1wQSk7XG4gIG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpO1xuICB2YXIgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XG5cbiAgaWYgKGNvc2luZSA+IDEuMCkge1xuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKGNvc2luZSA8IC0xLjApIHtcbiAgICByZXR1cm4gTWF0aC5QSTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XG4gIH1cbn1cbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHplcm9cclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm8ob3V0KSB7XG4gIG91dFswXSA9IDAuMDtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAndmVjMygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnKSc7XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdO1xufVxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdO1xuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdO1xuICByZXR1cm4gTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJiBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSk7XG59XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3ViID0gc3VidHJhY3Q7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGRpdiA9IGRpdmlkZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBkaXN0ID0gZGlzdGFuY2U7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGxlbiA9IGxlbmd0aDtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG4vKipcclxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjM3MgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgZm9yRWFjaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHZlYyA9IGNyZWF0ZSgpO1xuICByZXR1cm4gZnVuY3Rpb24gKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgIHZhciBpLCBsO1xuXG4gICAgaWYgKCFzdHJpZGUpIHtcbiAgICAgIHN0cmlkZSA9IDM7XG4gICAgfVxuXG4gICAgaWYgKCFvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbCA9IGEubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvciAoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICB2ZWNbMF0gPSBhW2ldO1xuICAgICAgdmVjWzFdID0gYVtpICsgMV07XG4gICAgICB2ZWNbMl0gPSBhW2kgKyAyXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTtcbiAgICAgIGFbaSArIDFdID0gdmVjWzFdO1xuICAgICAgYVtpICsgMl0gPSB2ZWNbMl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG4gIH07XG59KCk7IiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG4vKipcclxuICogNCBEaW1lbnNpb25hbCBWZWN0b3JcclxuICogQG1vZHVsZSB2ZWM0XHJcbiAqL1xuXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcclxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeiwgdykge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IHc7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQWRkcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogRGl2aWRlcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gIG91dFszXSA9IGFbM10gLyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjZWlsXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLmNlaWwoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBmbG9vclxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XG4gIG91dFszXSA9IE1hdGguZmxvb3IoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIG91dFszXSA9IE1hdGgubWluKGFbM10sIGJbM10pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICBvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5yb3VuZChhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgb3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXTtcbiAgdmFyIHkgPSBiWzFdIC0gYVsxXTtcbiAgdmFyIHogPSBiWzJdIC0gYVsyXTtcbiAgdmFyIHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIE1hdGguaHlwb3QoeCwgeSwgeiwgdyk7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXTtcbiAgdmFyIHkgPSBiWzFdIC0gYVsxXTtcbiAgdmFyIHogPSBiWzJdIC0gYVsyXTtcbiAgdmFyIHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgdmFyIHggPSBhWzBdO1xuICB2YXIgeSA9IGFbMV07XG4gIHZhciB6ID0gYVsyXTtcbiAgdmFyIHcgPSBhWzNdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5LCB6LCB3KTtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICB2YXIgdyA9IGFbM107XG4gIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdztcbn1cbi8qKlxyXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICBvdXRbM10gPSAtYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgb3V0WzNdID0gMS4wIC8gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBOb3JtYWxpemUgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHZhciB3ID0gYVszXTtcbiAgdmFyIGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICB9XG5cbiAgb3V0WzBdID0geCAqIGxlbjtcbiAgb3V0WzFdID0geSAqIGxlbjtcbiAgb3V0WzJdID0geiAqIGxlbjtcbiAgb3V0WzNdID0gdyAqIGxlbjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgY3Jvc3MtcHJvZHVjdCBvZiB0aHJlZSB2ZWN0b3JzIGluIGEgNC1kaW1lbnNpb25hbCBzcGFjZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IHJlc3VsdCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IFUgdGhlIGZpcnN0IHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IFYgdGhlIHNlY29uZCB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBXIHRoZSB0aGlyZCB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzR9IHJlc3VsdFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgdSwgdiwgdykge1xuICB2YXIgQSA9IHZbMF0gKiB3WzFdIC0gdlsxXSAqIHdbMF0sXG4gICAgICBCID0gdlswXSAqIHdbMl0gLSB2WzJdICogd1swXSxcbiAgICAgIEMgPSB2WzBdICogd1szXSAtIHZbM10gKiB3WzBdLFxuICAgICAgRCA9IHZbMV0gKiB3WzJdIC0gdlsyXSAqIHdbMV0sXG4gICAgICBFID0gdlsxXSAqIHdbM10gLSB2WzNdICogd1sxXSxcbiAgICAgIEYgPSB2WzJdICogd1szXSAtIHZbM10gKiB3WzJdO1xuICB2YXIgRyA9IHVbMF07XG4gIHZhciBIID0gdVsxXTtcbiAgdmFyIEkgPSB1WzJdO1xuICB2YXIgSiA9IHVbM107XG4gIG91dFswXSA9IEggKiBGIC0gSSAqIEUgKyBKICogRDtcbiAgb3V0WzFdID0gLShHICogRikgKyBJICogQyAtIEogKiBCO1xuICBvdXRbMl0gPSBHICogRSAtIEggKiBDICsgSiAqIEE7XG4gIG91dFszXSA9IC0oRyAqIEQpICsgSCAqIEIgLSBJICogQTtcbiAgcmV0dXJuIG91dDtcbn1cbjtcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdO1xuICB2YXIgYXkgPSBhWzFdO1xuICB2YXIgYXogPSBhWzJdO1xuICB2YXIgYXcgPSBhWzNdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7IC8vIE1hcnNhZ2xpYSwgR2VvcmdlLiBDaG9vc2luZyBhIFBvaW50IGZyb20gdGhlIFN1cmZhY2Ugb2YgYVxuICAvLyBTcGhlcmUuIEFubi4gTWF0aC4gU3RhdGlzdC4gNDMgKDE5NzIpLCBuby4gMiwgNjQ1LS02NDYuXG4gIC8vIGh0dHA6Ly9wcm9qZWN0ZXVjbGlkLm9yZy9ldWNsaWQuYW9tcy8xMTc3NjkyNjQ0O1xuXG4gIHZhciB2MSwgdjIsIHYzLCB2NDtcbiAgdmFyIHMxLCBzMjtcblxuICBkbyB7XG4gICAgdjEgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHYyID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICBzMSA9IHYxICogdjEgKyB2MiAqIHYyO1xuICB9IHdoaWxlIChzMSA+PSAxKTtcblxuICBkbyB7XG4gICAgdjMgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHY0ID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICBzMiA9IHYzICogdjMgKyB2NCAqIHY0O1xuICB9IHdoaWxlIChzMiA+PSAxKTtcblxuICB2YXIgZCA9IE1hdGguc3FydCgoMSAtIHMxKSAvIHMyKTtcbiAgb3V0WzBdID0gc2NhbGUgKiB2MTtcbiAgb3V0WzFdID0gc2NhbGUgKiB2MjtcbiAgb3V0WzJdID0gc2NhbGUgKiB2MyAqIGQ7XG4gIG91dFszXSA9IHNjYWxlICogdjQgKiBkO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdLFxuICAgICAgdyA9IGFbM107XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3O1xuICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICB2YXIgcXggPSBxWzBdLFxuICAgICAgcXkgPSBxWzFdLFxuICAgICAgcXogPSBxWzJdLFxuICAgICAgcXcgPSBxWzNdOyAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuXG4gIHZhciBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcbiAgdmFyIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6O1xuICB2YXIgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHg7XG4gIHZhciBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7IC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcblxuICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gemVyb1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gemVybyhvdXQpIHtcbiAgb3V0WzBdID0gMC4wO1xuICBvdXRbMV0gPSAwLjA7XG4gIG91dFsyXSA9IDAuMDtcbiAgb3V0WzNdID0gMC4wO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3ZlYzQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM107XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl0sXG4gICAgICBhMyA9IGFbM107XG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl0sXG4gICAgICBiMyA9IGJbM107XG4gIHJldHVybiBNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJiBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSk7XG59XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3ViID0gc3VidHJhY3Q7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGRpdiA9IGRpdmlkZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGlzdGFuY2V9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBkaXN0ID0gZGlzdGFuY2U7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGxlbiA9IGxlbmd0aDtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG4vKipcclxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjNHMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgZm9yRWFjaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHZlYyA9IGNyZWF0ZSgpO1xuICByZXR1cm4gZnVuY3Rpb24gKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgIHZhciBpLCBsO1xuXG4gICAgaWYgKCFzdHJpZGUpIHtcbiAgICAgIHN0cmlkZSA9IDQ7XG4gICAgfVxuXG4gICAgaWYgKCFvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbCA9IGEubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvciAoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICB2ZWNbMF0gPSBhW2ldO1xuICAgICAgdmVjWzFdID0gYVtpICsgMV07XG4gICAgICB2ZWNbMl0gPSBhW2kgKyAyXTtcbiAgICAgIHZlY1szXSA9IGFbaSArIDNdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdO1xuICAgICAgYVtpICsgMV0gPSB2ZWNbMV07XG4gICAgICBhW2kgKyAyXSA9IHZlY1syXTtcbiAgICAgIGFbaSArIDNdID0gdmVjWzNdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSgpOyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuaW1wb3J0ICogYXMgbWF0MyBmcm9tIFwiLi9tYXQzLmpzXCI7XG5pbXBvcnQgKiBhcyB2ZWMzIGZyb20gXCIuL3ZlYzMuanNcIjtcbmltcG9ydCAqIGFzIHZlYzQgZnJvbSBcIi4vdmVjNC5qc1wiO1xuLyoqXHJcbiAqIFF1YXRlcm5pb25cclxuICogQG1vZHVsZSBxdWF0XHJcbiAqL1xuXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XHJcbiAqXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gIH1cblxuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcclxuICogdGhlbiByZXR1cm5zIGl0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xuICByYWQgPSByYWQgKiAwLjU7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBHZXRzIHRoZSByb3RhdGlvbiBheGlzIGFuZCBhbmdsZSBmb3IgYSBnaXZlblxyXG4gKiAgcXVhdGVybmlvbi4gSWYgYSBxdWF0ZXJuaW9uIGlzIGNyZWF0ZWQgd2l0aFxyXG4gKiAgc2V0QXhpc0FuZ2xlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgc2FtZVxyXG4gKiAgdmFsdWVzIGFzIHByb3ZpZGllZCBpbiB0aGUgb3JpZ2luYWwgcGFyYW1ldGVyIGxpc3RcclxuICogIE9SIGZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHZhbHVlcy5cclxuICogRXhhbXBsZTogVGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5IGF4aXMgWzAsIDAsIDFdIGFuZFxyXG4gKiAgYW5nbGUgLTkwIGlzIHRoZSBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieVxyXG4gKiAgWzAsIDAsIDFdIGFuZCAyNzAuIFRoaXMgbWV0aG9kIGZhdm9ycyB0aGUgbGF0dGVyLlxyXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXRfYXhpcyAgVmVjdG9yIHJlY2VpdmluZyB0aGUgYXhpcyBvZiByb3RhdGlvblxyXG4gKiBAcGFyYW0gIHtxdWF0fSBxICAgICBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIG9mIHRoZSByb3RhdGlvblxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEF4aXNBbmdsZShvdXRfYXhpcywgcSkge1xuICB2YXIgcmFkID0gTWF0aC5hY29zKHFbM10pICogMi4wO1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCAvIDIuMCk7XG5cbiAgaWYgKHMgPiBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgb3V0X2F4aXNbMF0gPSBxWzBdIC8gcztcbiAgICBvdXRfYXhpc1sxXSA9IHFbMV0gLyBzO1xuICAgIG91dF9heGlzWzJdID0gcVsyXSAvIHM7XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgcyBpcyB6ZXJvLCByZXR1cm4gYW55IGF4aXMgKG5vIHJvdGF0aW9uIC0gYXhpcyBkb2VzIG5vdCBtYXR0ZXIpXG4gICAgb3V0X2F4aXNbMF0gPSAxO1xuICAgIG91dF9heGlzWzFdID0gMDtcbiAgICBvdXRfYXhpc1syXSA9IDA7XG4gIH1cblxuICByZXR1cm4gcmFkO1xufVxuLyoqXHJcbiAqIEdldHMgdGhlIGFuZ3VsYXIgZGlzdGFuY2UgYmV0d2VlbiB0d28gdW5pdCBxdWF0ZXJuaW9uc1xyXG4gKlxyXG4gKiBAcGFyYW0gIHtxdWF0fSBhICAgICBPcmlnaW4gdW5pdCBxdWF0ZXJuaW9uIFxyXG4gKiBAcGFyYW0gIHtxdWF0fSBiICAgICBEZXN0aW5hdGlvbiB1bml0IHF1YXRlcm5pb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIGJldHdlZW4gdGhlIHR3byBxdWF0ZXJuaW9uc1xyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ2xlKGEsIGIpIHtcbiAgdmFyIGRvdHByb2R1Y3QgPSBkb3QoYSwgYik7XG4gIHJldHVybiBNYXRoLmFjb3MoMiAqIGRvdHByb2R1Y3QgKiBkb3Rwcm9kdWN0IC0gMSk7XG59XG4vKipcclxuICogTXVsdGlwbGllcyB0d28gcXVhdCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl0sXG4gICAgICBhdyA9IGFbM107XG4gIHZhciBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICBieiA9IGJbMl0sXG4gICAgICBidyA9IGJbM107XG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl0sXG4gICAgICBhdyA9IGFbM107XG4gIHZhciBieCA9IE1hdGguc2luKHJhZCksXG4gICAgICBidyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYXogPSBhWzJdLFxuICAgICAgYXcgPSBhWzNdO1xuICB2YXIgYnkgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGF6ID0gYVsyXSxcbiAgICAgIGF3ID0gYVszXTtcbiAgdmFyIGJ6ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcbiAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgVyBjb21wb25lbnQgb2YgYSBxdWF0IGZyb20gdGhlIFgsIFksIGFuZCBaIGNvbXBvbmVudHMuXHJcbiAqIEFzc3VtZXMgdGhhdCBxdWF0ZXJuaW9uIGlzIDEgdW5pdCBpbiBsZW5ndGguXHJcbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVcob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICAgIHkgPSBhWzFdLFxuICAgICAgeiA9IGFbMl07XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIG91dFszXSA9IE1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGUgdGhlIGV4cG9uZW50aWFsIG9mIGEgdW5pdCBxdWF0ZXJuaW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIHRoZSBleHBvbmVudGlhbCBvZlxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdLFxuICAgICAgdyA9IGFbM107XG4gIHZhciByID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIHZhciBldCA9IE1hdGguZXhwKHcpO1xuICB2YXIgcyA9IHIgPiAwID8gZXQgKiBNYXRoLnNpbihyKSAvIHIgOiAwO1xuICBvdXRbMF0gPSB4ICogcztcbiAgb3V0WzFdID0geSAqIHM7XG4gIG91dFsyXSA9IHogKiBzO1xuICBvdXRbM10gPSBldCAqIE1hdGguY29zKHIpO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgYSB1bml0IHF1YXRlcm5pb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgdGhlIGV4cG9uZW50aWFsIG9mXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsbihvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXSxcbiAgICAgIHcgPSBhWzNdO1xuICB2YXIgciA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICB2YXIgdCA9IHIgPiAwID8gTWF0aC5hdGFuMihyLCB3KSAvIHIgOiAwO1xuICBvdXRbMF0gPSB4ICogdDtcbiAgb3V0WzFdID0geSAqIHQ7XG4gIG91dFsyXSA9IHogKiB0O1xuICBvdXRbM10gPSAwLjUgKiBNYXRoLmxvZyh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdyk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSBzY2FsYXIgcG93ZXIgb2YgYSB1bml0IHF1YXRlcm5pb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgdGhlIGV4cG9uZW50aWFsIG9mXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgcXVhdGVybmlvbiBieVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcG93KG91dCwgYSwgYikge1xuICBsbihvdXQsIGEpO1xuICBzY2FsZShvdXQsIG91dCwgYik7XG4gIGV4cChvdXQsIG91dCk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2xlcnAob3V0LCBhLCBiLCB0KSB7XG4gIC8vIGJlbmNobWFya3M6XG4gIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl0sXG4gICAgICBhdyA9IGFbM107XG4gIHZhciBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICBieiA9IGJbMl0sXG4gICAgICBidyA9IGJbM107XG4gIHZhciBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTsgLy8gY2FsYyBjb3NpbmVcblxuICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7IC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuXG4gIGlmIChjb3NvbSA8IDAuMCkge1xuICAgIGNvc29tID0gLWNvc29tO1xuICAgIGJ4ID0gLWJ4O1xuICAgIGJ5ID0gLWJ5O1xuICAgIGJ6ID0gLWJ6O1xuICAgIGJ3ID0gLWJ3O1xuICB9IC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcblxuXG4gIGlmICgxLjAgLSBjb3NvbSA+IGdsTWF0cml4LkVQU0lMT04pIHtcbiAgICAvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcbiAgICBvbWVnYSA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgc2lub20gPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XG4gICAgc2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tO1xuICB9IGVsc2Uge1xuICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcbiAgICAvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgc2NhbGUwID0gMS4wIC0gdDtcbiAgICBzY2FsZTEgPSB0O1xuICB9IC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcblxuXG4gIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHVuaXQgcXVhdGVybmlvblxyXG4gKiBcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0KSB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG9mIGh0dHA6Ly9wbGFubmluZy5jcy51aXVjLmVkdS9ub2RlMTk4Lmh0bWxcbiAgLy8gVE9ETzogQ2FsbGluZyByYW5kb20gMyB0aW1lcyBpcyBwcm9iYWJseSBub3QgdGhlIGZhc3Rlc3Qgc29sdXRpb25cbiAgdmFyIHUxID0gZ2xNYXRyaXguUkFORE9NKCk7XG4gIHZhciB1MiA9IGdsTWF0cml4LlJBTkRPTSgpO1xuICB2YXIgdTMgPSBnbE1hdHJpeC5SQU5ET00oKTtcbiAgdmFyIHNxcnQxTWludXNVMSA9IE1hdGguc3FydCgxIC0gdTEpO1xuICB2YXIgc3FydFUxID0gTWF0aC5zcXJ0KHUxKTtcbiAgb3V0WzBdID0gc3FydDFNaW51c1UxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUyKTtcbiAgb3V0WzFdID0gc3FydDFNaW51c1UxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUyKTtcbiAgb3V0WzJdID0gc3FydFUxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUzKTtcbiAgb3V0WzNdID0gc3FydFUxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUzKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIGRvdCA9IGEwICogYTAgKyBhMSAqIGExICsgYTIgKiBhMiArIGEzICogYTM7XG4gIHZhciBpbnZEb3QgPSBkb3QgPyAxLjAgLyBkb3QgOiAwOyAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxuXG4gIG91dFswXSA9IC1hMCAqIGludkRvdDtcbiAgb3V0WzFdID0gLWExICogaW52RG90O1xuICBvdXRbMl0gPSAtYTIgKiBpbnZEb3Q7XG4gIG91dFszXSA9IGEzICogaW52RG90O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcclxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxyXG4gKlxyXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxyXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XG4gIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICB2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICB2YXIgZlJvb3Q7XG5cbiAgaWYgKGZUcmFjZSA+IDAuMCkge1xuICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAvLyAyd1xuXG4gICAgb3V0WzNdID0gMC41ICogZlJvb3Q7XG4gICAgZlJvb3QgPSAwLjUgLyBmUm9vdDsgLy8gMS8oNHcpXG5cbiAgICBvdXRbMF0gPSAobVs1XSAtIG1bN10pICogZlJvb3Q7XG4gICAgb3V0WzFdID0gKG1bNl0gLSBtWzJdKSAqIGZSb290O1xuICAgIG91dFsyXSA9IChtWzFdIC0gbVszXSkgKiBmUm9vdDtcbiAgfSBlbHNlIHtcbiAgICAvLyB8d3wgPD0gMS8yXG4gICAgdmFyIGkgPSAwO1xuICAgIGlmIChtWzRdID4gbVswXSkgaSA9IDE7XG4gICAgaWYgKG1bOF0gPiBtW2kgKiAzICsgaV0pIGkgPSAyO1xuICAgIHZhciBqID0gKGkgKyAxKSAlIDM7XG4gICAgdmFyIGsgPSAoaSArIDIpICUgMztcbiAgICBmUm9vdCA9IE1hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApO1xuICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgb3V0WzNdID0gKG1baiAqIDMgKyBrXSAtIG1bayAqIDMgKyBqXSkgKiBmUm9vdDtcbiAgICBvdXRbal0gPSAobVtqICogMyArIGldICsgbVtpICogMyArIGpdKSAqIGZSb290O1xuICAgIG91dFtrXSA9IChtW2sgKiAzICsgaV0gKyBtW2kgKiAzICsga10pICogZlJvb3Q7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXHJcbiAqIEBwYXJhbSB7eX0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBZIGF4aXMgaW4gZGVncmVlcy5cclxuICogQHBhcmFtIHt6fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFogYXhpcyBpbiBkZWdyZWVzLlxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIHgsIHksIHopIHtcbiAgdmFyIGhhbGZUb1JhZCA9IDAuNSAqIE1hdGguUEkgLyAxODAuMDtcbiAgeCAqPSBoYWxmVG9SYWQ7XG4gIHkgKj0gaGFsZlRvUmFkO1xuICB6ICo9IGhhbGZUb1JhZDtcbiAgdmFyIHN4ID0gTWF0aC5zaW4oeCk7XG4gIHZhciBjeCA9IE1hdGguY29zKHgpO1xuICB2YXIgc3kgPSBNYXRoLnNpbih5KTtcbiAgdmFyIGN5ID0gTWF0aC5jb3MoeSk7XG4gIHZhciBzeiA9IE1hdGguc2luKHopO1xuICB2YXIgY3ogPSBNYXRoLmNvcyh6KTtcbiAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgY2xvbmUgPSB2ZWM0LmNsb25lO1xuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBjb3B5ID0gdmVjNC5jb3B5O1xuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc2V0ID0gdmVjNC5zZXQ7XG4vKipcclxuICogQWRkcyB0d28gcXVhdCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBhZGQgPSB2ZWM0LmFkZDtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxyXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBzY2FsZSA9IHZlYzQuc2NhbGU7XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBkb3QgPSB2ZWM0LmRvdDtcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBsZXJwID0gdmVjNC5sZXJwO1xuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgdmFyIGxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5sZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBsZW4gPSBsZW5ndGg7XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIHNxdWFyZWRMZW5ndGggPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xuLyoqXHJcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgcXVhdGVybmlvbi5cclxuICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgcXVhdGVybmlvbi5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgdmFyIGV4YWN0RXF1YWxzID0gdmVjNC5leGFjdEVxdWFscztcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IHZhciBlcXVhbHMgPSB2ZWM0LmVxdWFscztcbi8qKlxyXG4gKiBTZXRzIGEgcXVhdGVybmlvbiB0byByZXByZXNlbnQgdGhlIHNob3J0ZXN0IHJvdGF0aW9uIGZyb20gb25lXHJcbiAqIHZlY3RvciB0byBhbm90aGVyLlxyXG4gKlxyXG4gKiBCb3RoIHZlY3RvcnMgYXJlIGFzc3VtZWQgdG8gYmUgdW5pdCBsZW5ndGguXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBpbml0aWFsIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIGRlc3RpbmF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgdmFyIHJvdGF0aW9uVG8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0bXB2ZWMzID0gdmVjMy5jcmVhdGUoKTtcbiAgdmFyIHhVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygxLCAwLCAwKTtcbiAgdmFyIHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgZG90ID0gdmVjMy5kb3QoYSwgYik7XG5cbiAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XG4gICAgICBpZiAodmVjMy5sZW4odG1wdmVjMykgPCAwLjAwMDAwMSkgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICBzZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgb3V0WzBdID0gMDtcbiAgICAgIG91dFsxXSA9IDA7XG4gICAgICBvdXRbMl0gPSAwO1xuICAgICAgb3V0WzNdID0gMTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgYSwgYik7XG4gICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xuICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcbiAgICAgIG91dFsyXSA9IHRtcHZlYzNbMl07XG4gICAgICBvdXRbM10gPSAxICsgZG90O1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgfVxuICB9O1xufSgpO1xuLyoqXHJcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCB2YXIgc3FsZXJwID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGVtcDEgPSBjcmVhdGUoKTtcbiAgdmFyIHRlbXAyID0gY3JlYXRlKCk7XG4gIHJldHVybiBmdW5jdGlvbiAob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gICAgc2xlcnAodGVtcDEsIGEsIGQsIHQpO1xuICAgIHNsZXJwKHRlbXAyLCBiLCBjLCB0KTtcbiAgICBzbGVycChvdXQsIHRlbXAxLCB0ZW1wMiwgMiAqIHQgKiAoMSAtIHQpKTtcbiAgICByZXR1cm4gb3V0O1xuICB9O1xufSgpO1xuLyoqXHJcbiAqIFNldHMgdGhlIHNwZWNpZmllZCBxdWF0ZXJuaW9uIHdpdGggdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuXHJcbiAqIGF4ZXMuIEVhY2ggYXhpcyBpcyBhIHZlYzMgYW5kIGlzIGV4cGVjdGVkIHRvIGJlIHVuaXQgbGVuZ3RoIGFuZFxyXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSB2aWV3ICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgdmlld2luZyBkaXJlY3Rpb25cclxuICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHVwICAgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInVwXCIgZGlyZWN0aW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCB2YXIgc2V0QXhlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuICByZXR1cm4gZnVuY3Rpb24gKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XG4gICAgbWF0clswXSA9IHJpZ2h0WzBdO1xuICAgIG1hdHJbM10gPSByaWdodFsxXTtcbiAgICBtYXRyWzZdID0gcmlnaHRbMl07XG4gICAgbWF0clsxXSA9IHVwWzBdO1xuICAgIG1hdHJbNF0gPSB1cFsxXTtcbiAgICBtYXRyWzddID0gdXBbMl07XG4gICAgbWF0clsyXSA9IC12aWV3WzBdO1xuICAgIG1hdHJbNV0gPSAtdmlld1sxXTtcbiAgICBtYXRyWzhdID0gLXZpZXdbMl07XG4gICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIGZyb21NYXQzKG91dCwgbWF0cikpO1xuICB9O1xufSgpOyIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuXG4vLyBwdnRcbmZ1bmN0aW9uIG5vcm1hbGl6ZShhcnJheSkge1xuICAgIHJldHVybiB2ZWMzLmZyb21WYWx1ZXMoYXJyYXlbMF0gLyAyNTUsIGFycmF5WzFdIC8gMjU1LCBhcnJheVsyXSAvIDI1NSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhJbnRUb1JnYihoZXgpIHtcbiAgICBjb25zdCByID0gaGV4ID4+IDE2O1xuICAgIGNvbnN0IGcgPSAoaGV4ID4+IDgpICYgMHhmZjsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGNvbnN0IGIgPSBoZXggJiAweGZmO1xuICAgIHJldHVybiB2ZWMzLmZyb21WYWx1ZXMociwgZywgYik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhTdHJpbmdUb1JnYihoZXgpIHtcbiAgICBjb25zdCByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgID8gdmVjMy5mcm9tVmFsdWVzKFxuICAgICAgICAgICAgICBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcbiAgICAgICAgICAgICAgcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgICAgICAgIHBhcnNlSW50KHJlc3VsdFszXSwgMTYpXG4gICAgICAgICAgKVxuICAgICAgICA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgaGV4UiA9IGNvbXBvbmVudFRvSGV4KHIpO1xuICAgIGNvbnN0IGhleEcgPSBjb21wb25lbnRUb0hleChnKTtcbiAgICBjb25zdCBoZXhCID0gY29tcG9uZW50VG9IZXgoYik7XG4gICAgcmV0dXJuIGAjJHtoZXhSfSR7aGV4R30ke2hleEJ9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoaGV4KSB7XG4gICAgY29uc3QgY29sb3IgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIGNvbnN0IHJnYiA9XG4gICAgICAgIHR5cGVvZiBoZXggPT09ICdudW1iZXInID8gaGV4SW50VG9SZ2IoaGV4KSA6IGhleFN0cmluZ1RvUmdiKGhleCk7XG4gICAgdmVjMy5jb3B5KGNvbG9yLCBub3JtYWxpemUocmdiKSk7XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZChtLCBuKSB7XG4gICAgcmV0dXJuICgobSAlIG4pICsgbikgJSBuO1xufVxuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jb25zdCBXT1JEX1JFR1ggPSB3b3JkID0+IHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXFxcXGIke3dvcmR9XFxcXGJgLCAnZ2knKTtcbn07XG5cbmNvbnN0IExJTkVfUkVHWCA9IHdvcmQgPT4ge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGAke3dvcmR9YCwgJ2dpJyk7XG59O1xuXG5jb25zdCBWRVJURVggPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAnYXR0cmlidXRlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0JyksXG4gICAgICAgIHJlcGxhY2U6ICd2YXJ5aW5nJyxcbiAgICB9LFxuXTtcblxuY29uc3QgRlJBR01FTlQgPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAndmFyeWluZycsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG1hdGNoOiBMSU5FX1JFR1goJ291dCB2ZWM0IG91dENvbG9yOycpLFxuICAgICAgICByZXBsYWNlOiAnJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0Q29sb3InKSxcbiAgICAgICAgcmVwbGFjZTogJ2dsX0ZyYWdDb2xvcicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ3RleHR1cmVQcm9qJyksXG4gICAgICAgIHJlcGxhY2U6ICd0ZXh0dXJlMkRQcm9qJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgndGV4dHVyZScpLFxuICAgICAgICByZXBsYWNlKHNoYWRlcikge1xuICAgICAgICAgICAgLy8gRmluZCBhbGwgdGV4dHVyZSBkZWZpbnRpb25zXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlR2xvYmFsUmVneCA9IG5ldyBSZWdFeHAoJ1xcXFxidGV4dHVyZVxcXFxiJywgJ2dpJyk7XG5cbiAgICAgICAgICAgIC8vIEZpbmQgc2luZ2xlIHRleHR1cmUgZGVmaW5pdGlvblxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZVNpbmdsZVJlZ3ggPSBuZXcgUmVnRXhwKCdcXFxcYnRleHR1cmVcXFxcYicsICdpJyk7XG5cbiAgICAgICAgICAgIC8vIEdldHMgdGhlIHRleHR1cmUgY2FsbCBzaWduYXR1cmUgZS5nIHRleHR1cmUodVRleHR1cmUxLCB2VXYpO1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZVVuaWZvcm1OYW1lUmVneCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgL3RleHR1cmVcXCgoW14pXSspXFwpLyxcbiAgICAgICAgICAgICAgICAnaSdcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEdldCBhbGwgbWF0Y2hpbmcgb2NjdXJhbmNlc1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHNoYWRlci5tYXRjaCh0ZXh0dXJlR2xvYmFsUmVneCk7XG4gICAgICAgICAgICBsZXQgcmVwbGFjZW1lbnQgPSAnJztcblxuICAgICAgICAgICAgLy8gSWYgbm90aGluZyBtYXRjaGVzIHJldHVyblxuICAgICAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHJldHVybiBzaGFkZXI7XG5cbiAgICAgICAgICAgIC8vIFJlcGxhY2UgZWFjaCBvY2N1cmFuY2UgYnkgaXQncyB1bmlmb3JtIHR5cGVcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlICovXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGkgb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gc2hhZGVyLm1hdGNoKHRleHR1cmVVbmlmb3JtTmFtZVJlZ3gpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtTmFtZSA9IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgndGV4dHVyZSgnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdW5pZm9ybVR5cGUgPSBzaGFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXRjaChgKC4qPykgJHt1bmlmb3JtTmFtZX1gLCAnaScpWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyQvZ20sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybVR5cGUgPSB1bmlmb3JtVHlwZS5zcGxpdCgnICcpWzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodW5pZm9ybVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXIyRCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSAndGV4dHVyZTJEJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NhbXBsZXJDdWJlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudCA9ICd0ZXh0dXJlQ3ViZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNoYWRlciA9IHNoYWRlci5yZXBsYWNlKHRleHR1cmVTaW5nbGVSZWd4LCByZXBsYWNlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlICovXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgICB9LFxuICAgIH0sXG5dO1xuXG5jb25zdCBHRU5FUklDID0gW1xuICAgIHtcbiAgICAgICAgbWF0Y2g6IExJTkVfUkVHWCgnI3ZlcnNpb24gMzAwIGVzJyksXG4gICAgICAgIHJlcGxhY2U6ICcnLFxuICAgIH0sXG5dO1xuXG5jb25zdCBWRVJURVhfUlVMRVMgPSBbLi4uR0VORVJJQywgLi4uVkVSVEVYXTtcbmNvbnN0IEZSQUdNRU5UX1JVTEVTID0gWy4uLkdFTkVSSUMsIC4uLkZSQUdNRU5UXTtcblxuLy8gY29uc3QgdHJhbnNmb3JtID0gKGNvZGUpID0+IHtcbi8vICAgICByZXR1cm4gY29kZVxuLy8gICAgICAgICAvLyByZW1vdmVzIC8vXG4vLyAgICAgICAgIC5yZXBsYWNlKC9bIFxcdF0qXFwvXFwvLipcXG4vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZSAvKiAqL1xuLy8gICAgICAgICAucmVwbGFjZSgvWyBcXHRdKlxcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpXG4vLyAgICAgICAgIC8vIHJlbW92ZXMgbXVsdGlwbGUgd2hpdGUgc3BhY2VzXG4vLyAgICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJHxcXHMrKD89XFxzKS9nLCAnJyk7XG4vLyB9O1xuXG4vKipcbiAqIFJlcGxhY2VzIGVzMzAwIHN5bnRheCB0byBlczEwMFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShzaGFkZXIsIHNoYWRlclR5cGUpIHtcbiAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9XG5cbiAgICBjb25zdCBydWxlcyA9IHNoYWRlclR5cGUgPT09ICd2ZXJ0ZXgnID8gVkVSVEVYX1JVTEVTIDogRlJBR01FTlRfUlVMRVM7XG4gICAgcnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBydWxlLnJlcGxhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHNoYWRlciA9IHJ1bGUucmVwbGFjZShzaGFkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hhZGVyID0gc2hhZGVyLnJlcGxhY2UocnVsZS5tYXRjaCwgcnVsZS5yZXBsYWNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuXG5jbGFzcyBWZWN0b3IzIHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsIHogPSAwKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHZlYzMuZnJvbVZhbHVlcyh4LCB5LCB6KTtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSwgeikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLnogPSB6O1xuICAgIH1cblxuICAgIHNldCB4KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGF0YVswXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdO1xuICAgIH1cblxuICAgIHNldCB5KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGF0YVsxXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzFdO1xuICAgIH1cblxuICAgIHNldCB6KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGF0YVsyXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yMztcbiIsImltcG9ydCB7IHZlYzMsIG1hdDQsIHF1YXQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi92ZWN0b3IzJztcblxubGV0IHV1aWQgPSAwO1xubGV0IGF4aXNBbmdsZSA9IDA7XG5jb25zdCBxdWF0ZXJuaW9uQXhpc0FuZ2xlID0gdmVjMy5jcmVhdGUoKTtcblxuY2xhc3MgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudWlkID0gdXVpZCsrO1xuXG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMygpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gbmV3IFZlY3RvcjMoKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IG5ldyBWZWN0b3IzKDEsIDEsIDEpO1xuXG4gICAgICAgIHRoaXMuX3RyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Zpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucXVhdGVybmlvbiA9IHF1YXQuY3JlYXRlKCk7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLnVwID0gdmVjMy5mcm9tVmFsdWVzKDAsIDEsIDApO1xuICAgICAgICB0aGlzLmxvb2tUb1RhcmdldCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMgPSB7XG4gICAgICAgICAgICBwYXJlbnQ6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBtb2RlbDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIGxvb2tBdDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpcnR5ID0ge1xuICAgICAgICAgICAgc29ydGluZzogZmFsc2UsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogZmFsc2UsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBmYWxzZSxcbiAgICAgICAgICAgIHNoYWRlcjogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zY2VuZUdyYXBoU29ydGVyID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0IHRyYW5zcGFyZW50KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkudHJhbnNwYXJlbnQgPSB0aGlzLnRyYW5zcGFyZW50ICE9PSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fdHJhbnNwYXJlbnQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdHJhbnNwYXJlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc3BhcmVudDtcbiAgICB9XG5cbiAgICBzZXQgdmlzaWJsZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRpcnR5LnNvcnRpbmcgPSB0aGlzLnZpc2libGUgIT09IHZhbHVlO1xuICAgICAgICB0aGlzLl92aXNpYmxlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHZpc2libGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92aXNpYmxlO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpY2VzKCkge1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMucGFyZW50KTtcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpY2VzLm1vZGVsKTtcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpY2VzLmxvb2tBdCk7XG4gICAgICAgIHF1YXQuaWRlbnRpdHkodGhpcy5xdWF0ZXJuaW9uKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIG1hdDQuY29weSh0aGlzLm1hdHJpY2VzLnBhcmVudCwgdGhpcy5wYXJlbnQubWF0cmljZXMubW9kZWwpO1xuICAgICAgICAgICAgbWF0NC5tdWx0aXBseShcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpY2VzLm1vZGVsLFxuICAgICAgICAgICAgICAgIHRoaXMubWF0cmljZXMubW9kZWwsXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5wYXJlbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sb29rVG9UYXJnZXQpIHtcbiAgICAgICAgICAgIG1hdDQudGFyZ2V0VG8oXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5sb29rQXQsXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5kYXRhLFxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LFxuICAgICAgICAgICAgICAgIHRoaXMudXBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtYXQ0Lm11bHRpcGx5KFxuICAgICAgICAgICAgICAgIHRoaXMubWF0cmljZXMubW9kZWwsXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5tb2RlbCxcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpY2VzLmxvb2tBdFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgIHRoaXMubWF0cmljZXMubW9kZWwsXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5tb2RlbCxcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmRhdGFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVgodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueCk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVkodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueSk7XG4gICAgICAgICAgICBxdWF0LnJvdGF0ZVoodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnF1YXRlcm5pb24sIHRoaXMucm90YXRpb24ueik7XG4gICAgICAgICAgICBheGlzQW5nbGUgPSBxdWF0LmdldEF4aXNBbmdsZShxdWF0ZXJuaW9uQXhpc0FuZ2xlLCB0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICAgICAgbWF0NC5yb3RhdGUoXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5tb2RlbCxcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpY2VzLm1vZGVsLFxuICAgICAgICAgICAgICAgIGF4aXNBbmdsZSxcbiAgICAgICAgICAgICAgICBxdWF0ZXJuaW9uQXhpc0FuZ2xlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIG1hdDQuc2NhbGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5zY2FsZS5kYXRhKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAvLyB0byBiZSBvdmVycmlkZW47XG4gICAgfVxuXG4gICAgYWRkKG1vZGVsKSB7XG4gICAgICAgIG1vZGVsLnBhcmVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChtb2RlbCk7XG4gICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKG1vZGVsKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eS5zb3J0aW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyYXZlcnNlKG9iamVjdCkge1xuICAgICAgICAvLyBpZiB0cmF2ZXJzZWQgb2JqZWN0IGlzIHRoZSBzY2VuZVxuICAgICAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG9iamVjdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMudHJhdmVyc2Uob2JqZWN0LmNoaWxkcmVuW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmplY3QucGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvYmplY3QudXBkYXRlTWF0cmljZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5PVEVcbiAgICAgICAgLy8gdG8gaW1wcm92ZSBwZXJmb3JtYW5jZSwgd2UgYWxzbyBjaGVjayBpZiB0aGUgb2JqZWN0cyBhcmUgZGlydHkgd2hlbiB3ZSB0cmF2ZXJzZSB0aGVtLlxuICAgICAgICAvLyB0aGlzIGF2b2lkcyBoYXZpbmcgYSBzZWNvbmQgbG9vcCB0aHJvdWdoIHRoZSBncmFwaCBzY2VuZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgYW55IGVsZW1lbnQgZ2V0cyBhZGRlZCAvIHJlbW92ZWQgZnJvbSBzY2VuZVxuICAgICAgICAvLyBvciBpZiBpdHMgdHJhbnNwYXJlbmN5IGNoYW5nZXMsIHdlIG5lZWQgdG8gc29ydCB0aGVtIGFnYWluIGludG9cbiAgICAgICAgLy8gb3BhcXVlIC8gdHJhbnNwYXJlbnQgYXJyYXlzXG4gICAgICAgIGlmIChvYmplY3QuZGlydHkuc29ydGluZyB8fCBvYmplY3QuZGlydHkudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS50cmFuc3BhcmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zY2VuZUdyYXBoU29ydGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnNjZW5lR3JhcGhTb3J0ZXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPYmplY3QzO1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgT2JqZWN0MyBmcm9tICcuLi9jb3JlL29iamVjdDMnO1xuXG5jbGFzcyBPcnRob2dyYXBoaWNDYW1lcmEgZXh0ZW5kcyBPYmplY3QzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxlZnQ6IC0xLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAxLFxuICAgICAgICAgICAgICAgIHRvcDogMSxcbiAgICAgICAgICAgICAgICBib3R0b206IC0xLFxuICAgICAgICAgICAgICAgIG5lYXI6IC0xMDAwLFxuICAgICAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLm1hdHJpY2VzLnByb2plY3Rpb24gPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIH1cblxuICAgIGxvb2tBdCh2KSB7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLnRhcmdldCwgdik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdXBkYXRlcyBwcm9qZWN0aW9uIG1hdHJpeFxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgbnVtYmVyIHRvIHRlc3QuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG51bWJlcnMgYXJlIGFwcHJveGltYXRlbHkgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgoKSB7XG4gICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyXG4gICAgICAgIG1hdDQub3J0aG8oXG4gICAgICAgICAgICB0aGlzLm1hdHJpY2VzLnByb2plY3Rpb24sXG4gICAgICAgICAgICB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0aGlzLnJpZ2h0LFxuICAgICAgICAgICAgdGhpcy5ib3R0b20sXG4gICAgICAgICAgICB0aGlzLnRvcCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcnRob2dyYXBoaWNDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuZWFyOiAxLFxuICAgICAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgICAgICAgICBmb3Y6IDM1LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgdGhpcy5mb3YgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICAgICAgICB3aWR0aCAvIGhlaWdodCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQZXJzcGVjdGl2ZUNhbWVyYTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgVUJPLCBGT0csIEVYVEVOU0lPTlMgfSBmcm9tICcuL2NodW5rcyc7XG5pbXBvcnQgeyBTSEFERVJfQkFTSUMsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBCYXNpYyB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHByb3BzLmNvbG9yIHx8IHZlYzMuZnJvbVZhbHVlcygxLCAxLCAxKTtcblxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSB2ZWMzIHVfY29sb3I7XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCh1X2NvbG9yLCAxLjApO1xuXG4gICAgICAgICAgICAgICAgJHtGT0cubGluZWFyKCl9XG5cbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IGJhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogU0hBREVSX0JBU0lDLFxuICAgICAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgICAgIHVfY29sb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2ZWMzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWFnRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICB3cmFwVDogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICB0cmFuc3BhcmVudDogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvcHNcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoWzI1NSwgMjU1LCAyNTUsIDI1NV0pO1xuICAgICAgICB0aGlzLnRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMubWFnRmlsdGVyKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMubWluRmlsdGVyKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgdGhpcy53cmFwUyk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMud3JhcFQpO1xuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIH1cblxuICAgIGZyb21JbWFnZSh1cmwpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoaW1nKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW1hZ2UpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBMSUdIVCwgRk9HLCBDTElQUElORywgRVhURU5TSU9OUywgU0hBRE9XIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0RFRkFVTFQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBEZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgLy8gbWFwOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vNjIwNjc4L3JlZC5qcGcnLlxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRleHR1cmU6IG5ldyBUZXh0dXJlKClcbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cbiAgICAgICAgICAgICR7U0hBRE9XLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcbiAgICAgICAgICAgIG91dCB2ZWMzIHZfbm9ybWFsO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogd29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgZnJhZ1ZlcnRleEVjID0gcG9zaXRpb24ueHl6OyAvLyB3b3JsZFBvc2l0aW9uLnh5ejtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgICAgICB2X25vcm1hbCA9IChub3JtYWxNYXRyaXggKiB2ZWM0KGFfbm9ybWFsLCAxLjApKS54eXo7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuICAgICAgICAgICAgaW4gdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgdV9jb2xvcjtcblxuICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyB2X25vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KGZyYWdWZXJ0ZXhFYyksIGRGZHkoZnJhZ1ZlcnRleEVjKSkpO1xuXG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gdmVjNCh1X2NvbG9yLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKj0gdGV4dHVyZSh1X21hcCwgdl91dik7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy5mcmFnbWVudCgpfVxuICAgICAgICAgICAgICAgICR7TElHSFQuZmFjdG9yeSgpfVxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBTSEFERVJfREVGQVVMVCxcbiAgICAgICAgICAgICAgICBtb2RlOiBwcm9wcy53aXJlZnJhbWUgPT09IHRydWUgPyBEUkFXLkxJTkVTIDogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NhbXBsZXIyRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICB1X2NvbG9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjMycsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29sb3IsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERlZmF1bHQ7XG4iLCJpbXBvcnQgeyBVQk8sIExJR0hULCBGT0csIENMSVBQSU5HLCBFWFRFTlNJT05TLCBTSEFET1cgfSBmcm9tICcuL2NodW5rcyc7XG5pbXBvcnQgeyBTSEFERVJfQklMTEJPQVJELCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQmlsbGJvYXJkIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cbiAgICAgICAgICAgICR7U0hBRE9XLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcbiAgICAgICAgICAgIG91dCB2ZWMzIHZfbm9ybWFsO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogd29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgZnJhZ1ZlcnRleEVjID0gcG9zaXRpb24ueHl6OyAvLyB3b3JsZFBvc2l0aW9uLnh5ejtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgICAgICB2X25vcm1hbCA9IChub3JtYWxNYXRyaXggKiB2ZWM0KGFfbm9ybWFsLCAxLjApKS54eXo7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuICAgICAgICAgICAgaW4gdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICAke3Byb3BzLmZyYWdtZW50IHx8XG4gICAgICAgICAgICAgICAgJ3ZvaWQgbWFpbkltYWdlKCBvdXQgdmVjNCBmcmFnQ29sb3IsIGluIHZlYzIgZnJhZ0Nvb3JkICkgeyBmcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMS4wLCAxLjAsIDEuMCk7IH0nfVxuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIG1haW5JbWFnZShiYXNlLCBnbF9GcmFnQ29vcmQueHkpO1xuXG4gICAgICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnQoKX1cbiAgICAgICAgICAgICAgICAke0xJR0hULmZhY3RvcnkoKX1cbiAgICAgICAgICAgICAgICAke0ZPRy5saW5lYXIoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IGJhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogU0hBREVSX0JJTExCT0FSRCxcbiAgICAgICAgICAgICAgICBtb2RlOiBwcm9wcy53aXJlZnJhbWUgPT09IHRydWUgPyBEUkFXLkxJTkVTIDogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgICAgICB1bmlmb3Jtczoge30sXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCaWxsYm9hcmQ7XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBGT0csIENMSVBQSU5HLCBFWFRFTlNJT05TIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX1NFTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFNlbSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKHByb3BzLm1hcCkge1xuICAgICAgICAgICAgdGhpcy5tYXAuZnJvbUltYWdlKHByb3BzLm1hcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZXh0dXJlOiBuZXcgVGV4dHVyZSgpXG4gICAgICAgIGlmIChwcm9wcy50ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcCA9IHByb3BzLnRleHR1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMudmVydGV4KCl9XG5cbiAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICBpbiB2ZWMyIGFfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuICAgICAgICAgICAgJHtDTElQUElORy52ZXJ0ZXhfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IHBvc2l0aW9uID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgdmVjMyB2X2UgPSB2ZWMzKHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICB2ZWMzIHZfbiA9IG1hdDModmlld01hdHJpeCAqIG1vZGVsTWF0cml4KSAqIGFfbm9ybWFsO1xuICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3Qobm9ybWFsaXplKHZfZSksIG5vcm1hbGl6ZSh2X24pKTtcbiAgICAgICAgICAgICAgICBmbG9hdCBtID0gMi4wICogc3FydChwb3coci54LCAyLjApICsgcG93KHIueSwgMi4wKSArIHBvdyhyLnogKyAxLjAsIDIuMCkpO1xuICAgICAgICAgICAgICAgIHZfdXYgPSByLnh5IC8gbSArIDAuNTtcblxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcudmVydGV4KCl9XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAke0VYVEVOU0lPTlMuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgICAgICAgICAke0NMSVBQSU5HLmZyYWdtZW50X3ByZSgpfVxuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cbiAgICAgICAgICAgICR7VUJPLmxpZ2h0cygpfVxuXG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X21hcDtcblxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG5cbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGJhc2UgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XG5cbiAgICAgICAgICAgICAgICBiYXNlICs9IHRleHR1cmUodV9tYXAsIHZfdXYpO1xuXG4gICAgICAgICAgICAgICAgJHtGT0cubGluZWFyKCl9XG4gICAgICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IFNIQURFUl9TRU0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NhbXBsZXIyRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VtO1xuIiwiY29uc3QgUFJPR1JBTV9QT09MID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihnbCwgc3RyLCB0eXBlKSB7XG4gICAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc3RyKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICBjb25zdCBjb21waWxlZCA9IGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKTtcblxuICAgIGlmICghY29tcGlsZWQpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG5cbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IsIHN0cik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVByb2dyYW0gPSAoZ2wsIHZlcnRleCwgZnJhZ21lbnQsIHByb2dyYW1JRCkgPT4ge1xuICAgIGNvbnN0IHBvb2wgPSBQUk9HUkFNX1BPT0xbYHBvb2xfJHtwcm9ncmFtSUR9YF07XG4gICAgaWYgKCFwb29sKSB7XG4gICAgICAgIGNvbnN0IHZzID0gY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXgsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICBjb25zdCBmcyA9IGNyZWF0ZVNoYWRlcihnbCwgZnJhZ21lbnQsIGdsLkZSQUdNRU5UX1NIQURFUik7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcblxuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdnMpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBQUk9HUkFNX1BPT0xbYHBvb2xfJHtwcm9ncmFtSUR9YF0gPSBwcm9ncmFtO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIHJldHVybiBwb29sO1xufTtcbiIsImltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICcuLi9zZXNzaW9uJztcblxuY2xhc3MgVWJvIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBib3VuZExvY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICB0aGlzLmJvdW5kTG9jYXRpb24gPSBib3VuZExvY2F0aW9uO1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG5cbiAgICAgICAgdGhpcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmRhdGEsIGdsLlNUQVRJQ19EUkFXKTsgLy8gRFlOQU1JQ19EUkFXXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyQmFzZShnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5ib3VuZExvY2F0aW9uLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIC8vIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTsgLy8gTUFZQkU/XG4gICAgfVxuXG4gICAgdXBkYXRlKGRhdGEsIG9mZnNldCA9IDApIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5kYXRhLnNldChkYXRhLCBvZmZzZXQpO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgMCwgdGhpcy5kYXRhLCAwLCBudWxsKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVYm87XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBWYW8ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMudmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKTtcbiAgICAgICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMudmFvID0gc3VwcG9ydHMoKS52ZXJ0ZXhBcnJheU9iamVjdC5jcmVhdGVWZXJ0ZXhBcnJheU9FUygpO1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuYmluZFZlcnRleEFycmF5T0VTKHRoaXMudmFvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuYmluZFZlcnRleEFycmF5T0VTKHRoaXMudmFvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuZGVsZXRlVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5kZWxldGVWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YW8gPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmFvO1xuIiwiZXhwb3J0IGNvbnN0IGdldFR5cGVTaXplID0gdHlwZSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgICAgIHJldHVybiAzO1xuICAgICAgICBjYXNlICd2ZWM0JzpcbiAgICAgICAgY2FzZSAnbWF0Mic6XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgY2FzZSAnbWF0Myc6XG4gICAgICAgICAgICByZXR1cm4gOTtcbiAgICAgICAgY2FzZSAnbWF0NCc6XG4gICAgICAgICAgICByZXR1cm4gMTY7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt0eXBlfVwiIGlzIGFuIHVua25vd24gdHlwZWApO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgaW5pdEF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcywgcHJvZ3JhbSkgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGF0dHJpYnV0ZXNbcHJvcF07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgcHJvcCk7XG5cbiAgICAgICAgbGV0IGIgPSBjdXJyZW50LmJ1ZmZlcjtcbiAgICAgICAgaWYgKCFjdXJyZW50LmJ1ZmZlcikge1xuICAgICAgICAgICAgYiA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgY3VycmVudC52YWx1ZSwgZ2wuU1RBVElDX0RSQVcpOyAvLyBvciBEWU5BTUlDX0RSQVdcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oY3VycmVudCwge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXI6IGIsXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBiaW5kQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uLCBidWZmZXIsIHNpemUsIGluc3RhbmNlZCB9ID0gYXR0cmlidXRlc1trZXldO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgc2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgZGl2aXNvciA9IGluc3RhbmNlZCA/IDEgOiAwO1xuICAgICAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcihsb2NhdGlvbiwgZGl2aXNvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRzKCkuaW5zdGFuY2VkQXJyYXlzLnZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRShcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGRpdmlzb3JcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVBdHRyaWJ1dGVzID0gYXR0cmlidXRlcyA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvY2F0aW9uLCBidWZmZXIsIHZhbHVlIH0gPSBhdHRyaWJ1dGVzW2tleV07XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9PSAtMSkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdmFsdWUsIGdsLkRZTkFNSUNfRFJBVyk7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmV4cG9ydCBjb25zdCBpbml0VW5pZm9ybXMgPSAodW5pZm9ybXMsIHByb2dyYW0pID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgIGNvbnN0IHRleHR1cmVJbmRpY2VzID0gW1xuICAgICAgICBnbC5URVhUVVJFMCxcbiAgICAgICAgZ2wuVEVYVFVSRTEsXG4gICAgICAgIGdsLlRFWFRVUkUyLFxuICAgICAgICBnbC5URVhUVVJFMyxcbiAgICAgICAgZ2wuVEVYVFVSRTQsXG4gICAgICAgIGdsLlRFWFRVUkU1LFxuICAgIF07XG5cbiAgICBsZXQgaSA9IDA7XG5cbiAgICBPYmplY3Qua2V5cyh1bmlmb3JtcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHVuaWZvcm1zW3Byb3BdO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBwcm9wKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGN1cnJlbnQsIHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY3VycmVudC50eXBlID09PSAnc2FtcGxlcjJEJykge1xuICAgICAgICAgICAgY3VycmVudC50ZXh0dXJlSW5kZXggPSBpO1xuICAgICAgICAgICAgY3VycmVudC5hY3RpdmVUZXh0dXJlID0gdGV4dHVyZUluZGljZXNbaV07XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVVbmlmb3JtcyA9IHVuaWZvcm1zID0+IHtcbiAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICBPYmplY3Qua2V5cyh1bmlmb3JtcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB1bmlmb3JtID0gdW5pZm9ybXNba2V5XTtcblxuICAgICAgICBzd2l0Y2ggKHVuaWZvcm0udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbWF0NCc6XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZlYzQnOlxuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm00ZnYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtM2Z2KHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTJmdih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUodW5pZm9ybS5hY3RpdmVUZXh0dXJlKTtcbiAgICAgICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWkodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS50ZXh0dXJlSW5kZXgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt1bmlmb3JtLnR5cGV9XCIgaXMgYW4gdW5rbm93biB1bmlmb3JtIHR5cGVgKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IGNyZWF0ZVByb2dyYW0gfSBmcm9tICcuLi9nbC9wcm9ncmFtJztcbmltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCwgRFJBVywgU0lERSwgU0hBREVSX0NVU1RPTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICAgIGJpbmRBdHRyaWJ1dGVzLFxuICAgIGdldFR5cGVTaXplLFxuICAgIGluaXRBdHRyaWJ1dGVzLFxuICAgIGluaXRVbmlmb3JtcyxcbiAgICB1cGRhdGVVbmlmb3JtcyxcbiAgICB1cGRhdGVBdHRyaWJ1dGVzLFxuICAgIFZhbyxcbn0gZnJvbSAnLi4vZ2wnO1xuaW1wb3J0IHsgZ2xzbDN0bzEgfSBmcm9tICcuLi91dGlscyc7XG5cbi8vIHVzZWQgZm9yIHNwZWVkIG9wdGltaXNhdGlvblxubGV0IFdFQkdMMiA9IGZhbHNlO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0ge307XG5cbiAgICAgICAgLy8geiBmaWdodFxuICAgICAgICB0aGlzLnBvbHlnb25PZmZzZXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0RmFjdG9yID0gMDtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0VW5pdHMgPSAxO1xuXG4gICAgICAgIC8vIGNsaXBwaW5nIHBsYW5lc1xuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW3ZlYzQuY3JlYXRlKCksIHZlYzQuY3JlYXRlKCksIHZlYzQuY3JlYXRlKCldLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGluc3RhbmNpbmdcbiAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0luc3RhbmNlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gcmVuZGVyaW5nIG1vZGVcbiAgICAgICAgdGhpcy5tb2RlID0gRFJBVy5UUklBTkdMRVM7XG5cbiAgICAgICAgLy8gcmVuZGVyaW5nIHNpZGVcbiAgICAgICAgdGhpcy5zaWRlID0gU0lERS5GUk9OVDtcblxuICAgICAgICAvLyB0eXBlXG4gICAgICAgIHRoaXMudHlwZSA9IFN0cmluZyhTSEFERVJfQ1VTVE9NKTtcblxuICAgICAgICAvLyBjcmVhdGVzIHNoYWRvd1xuICAgICAgICB0aGlzLnNoYWRvd3MgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldEF0dHJpYnV0ZShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBzaXplID0gZ2V0VHlwZVNpemUodHlwZSk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRJbmRleCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluZGljZXMgPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRVbmlmb3JtKG5hbWUsIHR5cGUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMudW5pZm9ybXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0U2hhZGVyKHZlcnRleCwgZnJhZ21lbnQpIHtcbiAgICAgICAgdGhpcy52ZXJ0ZXggPSB2ZXJ0ZXg7XG4gICAgICAgIHRoaXMuZnJhZ21lbnQgPSBmcmFnbWVudDtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZUF0dHJpYnV0ZShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBzaXplID0gZ2V0VHlwZVNpemUodHlwZSk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIGluc3RhbmNlZDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZUNvdW50KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZUNvdW50ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0luc3RhbmNlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgV0VCR0wyID0gZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDI7XG5cbiAgICAgICAgLy8gb2JqZWN0IG1hdGVyaWFsXG4gICAgICAgIGlmICh0aGlzLnZlcnRleCAmJiB0aGlzLmZyYWdtZW50KSB7XG4gICAgICAgICAgICBpZiAoIVdFQkdMMikge1xuICAgICAgICAgICAgICAgIHRoaXMudmVydGV4ID0gZ2xzbDN0bzEodGhpcy52ZXJ0ZXgsICd2ZXJ0ZXgnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gZ2xzbDN0bzEodGhpcy5mcmFnbWVudCwgJ2ZyYWdtZW50Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW0oXG4gICAgICAgICAgICAgICAgZ2wsXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0ZXgsXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCxcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG5cbiAgICAgICAgICAgIHRoaXMudmFvID0gbmV3IFZhbygpO1xuXG4gICAgICAgICAgICBpbml0QXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMsIHRoaXMucHJvZ3JhbSk7XG4gICAgICAgICAgICBpbml0VW5pZm9ybXModGhpcy51bmlmb3JtcywgdGhpcy5wcm9ncmFtKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNlcyAmJiAhdGhpcy5pbmRpY2VzLmJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhpcy52YW8uYmluZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5iaW5kKCk7XG4gICAgICAgICAgICAvLyB0aGlzLnZhby51bmJpbmQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGJpbmRBdHRyaWJ1dGVzKHRoaXMuYXR0cmlidXRlcywgdGhpcy5wcm9ncmFtKTtcblxuICAgICAgICBpZiAodGhpcy5pbmRpY2VzKSB7XG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmluZGljZXMuYnVmZmVyKTtcbiAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoXG4gICAgICAgICAgICAgICAgZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLnZhbHVlLFxuICAgICAgICAgICAgICAgIGdsLlNUQVRJQ19EUkFXXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5iaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVmVydGljZXMoZGF0YSwgaW5kZXgpIHtcbiAgICAgICAgLy8gaW5kZXggb2YgdmVydGljZSAqIDMgKHh5eikgKyAwIGZvciBYXG4gICAgICAgIC8vIGluZGV4IG9mIHZlcnRpY2UgKiAzICh4eXopICsgMSBmb3IgWVxuICAgICAgICAvLyBpbmRleCBvZiB2ZXJ0aWNlICogMyAoeHl6KSArIDIgZm9yIFpcbiAgICAgICAgdGhpcy5kaXJ0eS5hdHRyaWJ1dGVzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWUuc2V0KGRhdGEsIGluZGV4KTtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW5TaGFkb3dNYXApIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlydHkuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eS5hdHRyaWJ1dGVzID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVVbmlmb3Jtcyh0aGlzLnVuaWZvcm1zKTtcblxuICAgICAgICAvLyBlbmFibGUgZGVwdGggdGVzdCBhbmQgY3VsbGluZ1xuICAgICAgICAvLyBUT0RPOiBtYXliZSB0aGlzIGNhbiBoYXZlIG93biB2YXJpYWJsZXMgcGVyIG1vZGVsLlxuICAgICAgICAvLyBmb3IgZXhhbXBsZSByZW5kZXIgdGFyZ2V0cyBkb24ndCBuZWVkIGRlcHRoIHRlc3RcbiAgICAgICAgLy8gaWYgKHRoaXMuc2hhZG93cyA9PT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIC8vIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuXG4gICAgICAgIGlmICh0aGlzLnBvbHlnb25PZmZzZXQpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5QT0xZR09OX09GRlNFVF9GSUxMKTtcbiAgICAgICAgICAgIGdsLnBvbHlnb25PZmZzZXQodGhpcy5wb2x5Z29uT2Zmc2V0RmFjdG9yLCB0aGlzLnBvbHlnb25PZmZzZXRVbml0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLlBPTFlHT05fT0ZGU0VUX0ZJTEwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaHR0cHM6Ly93ZWJnbDJmdW5kYW1lbnRhbHMub3JnL3dlYmdsL2xlc3NvbnMvd2ViZ2wtdGV4dC10ZXh0dXJlLmh0bWxcbiAgICAgICAgLy8gVGhlIG1vc3QgY29tbW9uIHNvbHV0aW9uIGZvciBwcmV0dHkgbXVjaCBhbGwgdHJhbnNwYXJlbnQgcmVuZGVyaW5nIGlzXG4gICAgICAgIC8vIHRvIGRyYXcgYWxsIHRoZSBvcGFxdWUgc3R1ZmYgZmlyc3QsXG4gICAgICAgIC8vIHRoZW4gYWZ0ZXIsIGRyYXcgYWxsIHRoZSB0cmFuc3BhcmVudCBzdHVmZiBzb3J0ZWQgYnkgeiBkaXN0YW5jZVxuICAgICAgICAvLyB3aXRoIHRoZSBkZXB0aCBidWZmZXIgdGVzdGluZyBvbiBidXQgZGVwdGggYnVmZmVyIHVwZGF0aW5nIG9mZlxuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgICAgICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvdWJsZSBzaWRlIG1hdGVyaWFsXG4gICAgICAgIGlmICh0aGlzLnNpZGUgPT09IFNJREUuRlJPTlQpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWRlID09PSBTSURFLkJBQ0spIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2lkZSA9PT0gU0lERS5CT1RIKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5TaGFkb3dNYXApIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJbnN0YW5jZSkge1xuICAgICAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50c0luc3RhbmNlZChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljZXMudmFsdWUubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBnbC5VTlNJR05FRF9TSE9SVCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUNvdW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHMoKS5pbnN0YW5jZWRBcnJheXMuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbmRpY2VzKSB7XG4gICAgICAgICAgICBnbC5kcmF3RWxlbWVudHMoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLFxuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy52YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWUubGVuZ3RoIC8gM1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XG4iLCJpbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBEZWZhdWx0IH0gZnJvbSAnLi4vc2hhZGVycyc7XG5pbXBvcnQgeyBTSEFERVJfQ1VTVE9NIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxubGV0IHNoYWRlcklEID0gMDtcbmNsYXNzIE1lc2ggZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLl9zaGFkZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb25zLCBpbmRpY2VzLCBub3JtYWxzLCB1dnMgfSA9IHBhcmFtcy5nZW9tZXRyeSB8fCB7fTtcblxuICAgICAgICBjb25zdCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zLCB0eXBlLCBtb2RlIH0gPVxuICAgICAgICAgICAgcGFyYW1zLnNoYWRlciB8fFxuICAgICAgICAgICAgbmV3IERlZmF1bHQoeyBjb2xvcjogcGFyYW1zLmNvbG9yLCBtYXA6IHBhcmFtcy5tYXAgfSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBhIHR5cGUsIGFzc2lnbiBpdCwgc28gd2UgY2FuIHNvcnQgYnkgdHlwZSBpbiB0aGUgcmVuZGVyZXIuXG4gICAgICAgIGlmICh0eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBgJHtTSEFERVJfQ1VTVE9NfS0ke3NoYWRlcklEKyt9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV9wb3NpdGlvbicsICd2ZWMzJywgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpKTtcbiAgICAgICAgaWYgKGluZGljZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SW5kZXgobmV3IFVpbnQxNkFycmF5KGluZGljZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9ybWFscykge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2Ffbm9ybWFsJywgJ3ZlYzMnLCBuZXcgRmxvYXQzMkFycmF5KG5vcm1hbHMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXZzKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV91dicsICd2ZWMyJywgbmV3IEZsb2F0MzJBcnJheSh1dnMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFVuaWZvcm0oa2V5LCB1bmlmb3Jtc1trZXldLnR5cGUsIHVuaWZvcm1zW2tleV0udmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNoYWRlcih2ZXJ0ZXgsIGZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBzZXQgc2hhZGVyKHNoYWRlcikge1xuICAgICAgICB0aGlzLmRpcnR5LnNoYWRlciA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NoYWRlciA9IHNoYWRlcjtcbiAgICAgICAgaWYgKHNoYWRlci50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHNoYWRlci50eXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gU0hBREVSX0NVU1RPTTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFNoYWRlcihzaGFkZXIudmVydGV4LCBzaGFkZXIuZnJhZ21lbnQpO1xuICAgIH1cblxuICAgIGdldCBzaGFkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNoO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgTWVzaCBmcm9tICcuLi9jb3JlL21lc2gnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uL2NvcmUvbW9kZWwnO1xuaW1wb3J0IHsgQmFzaWMgfSBmcm9tICcuLi9zaGFkZXJzJztcblxuY2xhc3MgQXhpc0hlbHBlciBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IChwcm9wcyAmJiBwcm9wcy5zaXplKSB8fCAxMDtcbiAgICAgICAgY29uc3QgZzEgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksXG4gICAgICAgICAgICAgICAgLi4udmVjMy5mcm9tVmFsdWVzKHNpemUsIDAsIDApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZzIgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksXG4gICAgICAgICAgICAgICAgLi4udmVjMy5mcm9tVmFsdWVzKDAsIHNpemUsIDApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZzMgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksXG4gICAgICAgICAgICAgICAgLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIHNpemUpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtMSA9IG5ldyBCYXNpYyh7XG4gICAgICAgICAgICBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDEsIDAsIDApLFxuICAgICAgICAgICAgd2lyZWZyYW1lOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbTIgPSBuZXcgQmFzaWMoe1xuICAgICAgICAgICAgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKSxcbiAgICAgICAgICAgIHdpcmVmcmFtZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG0zID0gbmV3IEJhc2ljKHtcbiAgICAgICAgICAgIGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMSksXG4gICAgICAgICAgICB3aXJlZnJhbWU6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHggPSBuZXcgTWVzaCh7IGdlb21ldHJ5OiBnMSwgc2hhZGVyOiBtMSB9KTtcbiAgICAgICAgdGhpcy5hZGQoeCk7XG5cbiAgICAgICAgY29uc3QgeSA9IG5ldyBNZXNoKHsgZ2VvbWV0cnk6IGcyLCBzaGFkZXI6IG0yIH0pO1xuICAgICAgICB0aGlzLmFkZCh5KTtcblxuICAgICAgICBjb25zdCB6ID0gbmV3IE1lc2goeyBnZW9tZXRyeTogZzMsIHNoYWRlcjogbTMgfSk7XG4gICAgICAgIHRoaXMuYWRkKHopO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEF4aXNIZWxwZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBNZXNoIGZyb20gJy4uL2NvcmUvbWVzaCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vY29yZS9tb2RlbCc7XG5pbXBvcnQgeyBCYXNpYyB9IGZyb20gJy4uL3NoYWRlcnMnO1xuLy8gaW1wb3J0IHsgRFJBVyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEF4aXNIZWxwZXIgZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSAocHJvcHMgJiYgcHJvcHMuc2l6ZSkgfHwgMTtcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGV4dHJhY3QgZ2VvbWV0cnlcbiAgICAgICAgY29uc3Qgc3ggPSBwcm9wcy5tb2RlbC5zY2FsZS54O1xuICAgICAgICBjb25zdCBzeSA9IHByb3BzLm1vZGVsLnNjYWxlLnk7XG4gICAgICAgIGNvbnN0IHN6ID0gcHJvcHMubW9kZWwuc2NhbGUuejtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlLmxlbmd0aCAvIDM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGkzID0gaSAqIDM7XG4gICAgICAgICAgICBjb25zdCB2MHggPSBzeCAqIHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZVtpMyArIDBdO1xuICAgICAgICAgICAgY29uc3QgdjB5ID0gc3kgKiBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWVbaTMgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IHYweiA9IHN6ICogcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCBueCA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWVbaTMgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IG55ID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZVtpMyArIDFdO1xuICAgICAgICAgICAgY29uc3QgbnogPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCB2MXggPSB2MHggKyBzaXplICogbng7XG4gICAgICAgICAgICBjb25zdCB2MXkgPSB2MHkgKyBzaXplICogbnk7XG4gICAgICAgICAgICBjb25zdCB2MXogPSB2MHogKyBzaXplICogbno7XG4gICAgICAgICAgICBnZW9tZXRyeS5wb3NpdGlvbnMgPSBnZW9tZXRyeS5wb3NpdGlvbnMuY29uY2F0KFtcbiAgICAgICAgICAgICAgICB2MHgsXG4gICAgICAgICAgICAgICAgdjB5LFxuICAgICAgICAgICAgICAgIHYweixcbiAgICAgICAgICAgICAgICB2MXgsXG4gICAgICAgICAgICAgICAgdjF5LFxuICAgICAgICAgICAgICAgIHYxeixcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hhZGVyID0gbmV3IEJhc2ljKHtcbiAgICAgICAgICAgIGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMSksXG4gICAgICAgICAgICB3aXJlZnJhbWU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBuID0gbmV3IE1lc2goeyBnZW9tZXRyeSwgc2hhZGVyIH0pO1xuICAgICAgICB0aGlzLmFkZChuKTtcblxuICAgICAgICB0aGlzLnJlZmVyZW5jZSA9IHByb3BzLm1vZGVsO1xuICAgICAgICAvLyBtb2RlID0gRFJBVy5MSU5FU1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlKCk7XG5cbiAgICAgICAgdmVjMy5jb3B5KHRoaXMucG9zaXRpb24uZGF0YSwgdGhpcy5yZWZlcmVuY2UucG9zaXRpb24uZGF0YSk7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLnJvdGF0aW9uLmRhdGEsIHRoaXMucmVmZXJlbmNlLnJvdGF0aW9uLmRhdGEpO1xuICAgICAgICB0aGlzLmxvb2tUb1RhcmdldCA9IHRoaXMucmVmZXJlbmNlLmxvb2tUb1RhcmdldDtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBBeGlzSGVscGVyO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZShkb21FbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCByYXRpbykge1xuICAgIGRvbUVsZW1lbnQud2lkdGggPSB3aWR0aCAqIHJhdGlvO1xuICAgIGRvbUVsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0ICogcmF0aW87XG4gICAgZG9tRWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBkb21FbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnN1cHBvcnRlZCgpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID1cbiAgICAgICAgJ1lvdXIgYnJvd3NlciBkb2VzblxcJ3Qgc3VwcG9ydCBXZWJHTC48YnI+PGEgaHJlZj1cImh0dHBzOi8vZ2V0LndlYmdsLm9yZ1wiPkdldCBXZWJHTDwvYT4nO1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlJztcbiAgICBkaXYuc3R5bGUubWFyZ2luID0gJzIwcHggYXV0byAwIGF1dG8nO1xuICAgIGRpdi5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkICMzMzMnO1xuICAgIGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpJztcbiAgICBkaXYuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG4gICAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMTBweCc7XG4gICAgZGl2LnN0eWxlLmZvbnRGYW1pbHkgPSAnbW9ub3NwYWNlJztcbiAgICBkaXYuc3R5bGUuZm9udFNpemUgPSAnMTJweCc7XG4gICAgZGl2LnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHJldHVybiBkaXY7XG59XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4Jztcbi8vIGltcG9ydCBWZWN0b3IzIGZyb20gJy4uL2NvcmUvdmVjdG9yMyc7XG5pbXBvcnQgeyBESVJFQ1RJT05BTF9MSUdIVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIExpZ2h0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgLy8gVE9ET1xuICAgIH1cbn1cblxuY2xhc3MgRGlyZWN0aW9uYWwgZXh0ZW5kcyBMaWdodCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IERJUkVDVElPTkFMX0xJR0hUO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBwcm9wcy5jb2xvciB8fCB2ZWMzLmZyb21WYWx1ZXMoMSwgMSwgMSk7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gcHJvcHMuaW50ZW5zaXR5IHx8IDAuOTg5O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgRGlyZWN0aW9uYWwgfTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IERpcmVjdGlvbmFsIH0gZnJvbSAnLi9saWdodHMnO1xuaW1wb3J0IHsgRElSRUNUSU9OQUxfTElHSFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMubGlnaHRzID0ge1xuICAgICAgICAgICAgZGlyZWN0aW9uYWw6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZm9nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbG9yOiB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSksXG4gICAgICAgICAgICBzdGFydDogNTAwLFxuICAgICAgICAgICAgZW5kOiAxMDAwLFxuICAgICAgICAgICAgZGVuc2l0eTogMC4wMDAyNSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW3ZlYzQuY3JlYXRlKCksIHZlYzQuY3JlYXRlKCksIHZlYzQuY3JlYXRlKCldLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFkZCBzdW5cbiAgICAgICAgY29uc3QgZGlyZWN0aW9uYWwgPSBuZXcgRGlyZWN0aW9uYWwoe1xuICAgICAgICAgICAgbmVhcjogMSxcbiAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGRpcmVjdGlvbmFsLnBvc2l0aW9uWzBdID0gMTI1O1xuICAgICAgICBkaXJlY3Rpb25hbC5wb3NpdGlvblsxXSA9IDI1MDtcbiAgICAgICAgZGlyZWN0aW9uYWwucG9zaXRpb25bMl0gPSA1MDA7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoZGlyZWN0aW9uYWwpO1xuICAgIH1cblxuICAgIGFkZExpZ2h0KGxpZ2h0KSB7XG4gICAgICAgIHN3aXRjaCAobGlnaHQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBESVJFQ1RJT05BTF9MSUdIVDpcbiAgICAgICAgICAgICAgICB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5wdXNoKGxpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaWdodFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTGlnaHQobGlnaHQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5pbmRleE9mKGxpZ2h0KTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlnaHQuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5saWdodHMuZGlyZWN0aW9uYWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmU7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFJlbmRlclRhcmdldCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICAvLyBzb21lIGRlZmF1bHQgcHJvcHNcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDUxMixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDUxMixcbiAgICAgICAgICAgICAgICBpbnRlcm5hbGZvcm1hdDogZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgICAgIHR5cGU6IGdsLlVOU0lHTkVEX1NIT1JULFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BzXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsZm9ybWF0ID0gZ2wuREVQVEhfQ09NUE9ORU5UMjQ7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBnbC5VTlNJR05FRF9JTlQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmcmFtZSBidWZmZXJcbiAgICAgICAgdGhpcy5mcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mcmFtZUJ1ZmZlcik7XG5cbiAgICAgICAgLy8gdGV4dHVyZVxuICAgICAgICB0aGlzLnRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgbnVsbFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGRlcHRoIHRleHR1cmVcbiAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICBudWxsXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGdsLkNPTE9SX0FUVEFDSE1FTlQwLFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGdsLkRFUFRIX0FUVEFDSE1FTlQsXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUsXG4gICAgICAgICAgICAwXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIG51bGxcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5kZXB0aFRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB0aGlzLmludGVybmFsZm9ybWF0LFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgIHRoaXMudHlwZSxcbiAgICAgICAgICAgIG51bGxcbiAgICAgICAgKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlclRhcmdldDtcbiIsImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IFJlbmRlclRhcmdldCBmcm9tICcuL3J0JztcbmltcG9ydCBQZXJzcGVjdGl2ZSBmcm9tICcuLi9jYW1lcmFzL3BlcnNwZWN0aXZlJztcbmltcG9ydCBPcnRob2dyYXBoaWMgZnJvbSAnLi4vY2FtZXJhcy9vcnRob2dyYXBoaWMnO1xuXG5jbGFzcyBTaGFkb3dNYXBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICAvLyBzaXplIG9mIHRleHR1cmVcbiAgICAgICAgdGhpcy53aWR0aCA9IHByb3BzLndpZHRoIHx8IDEwMjQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcHJvcHMuaGVpZ2h0IHx8IDEwMjQ7XG5cbiAgICAgICAgLy8gY3JlYXRlIHJlbmRlciB0YXJnZXRcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzO1xuICAgICAgICB0aGlzLnJ0ID0gbmV3IFJlbmRlclRhcmdldCh7IHdpZHRoLCBoZWlnaHQgfSk7XG5cbiAgICAgICAgLy8gbWF0cmljZXNcbiAgICAgICAgdGhpcy5tYXRyaWNlcyA9IHtcbiAgICAgICAgICAgIHZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBzaGFkb3c6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBiaWFzOiBtYXQ0LmZyb21WYWx1ZXMoXG4gICAgICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICApLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG9yaWdpbiBvZiBkaXJlY3Rpb25hbCBsaWdodFxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZSh7XG4gICAgICAgICAgICBmb3Y6IDYwLFxuICAgICAgICAgICAgbmVhcjogMSxcbiAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxOyAvLyBUT0RPOiByZW1vdmUgdGhpcyB3aGVuIGZpeCBsb29rQXQgYnVnIG9uIGdsLW1hdHJpeFxuICAgICAgICB0aGlzLnNldExpZ2h0T3JpZ2luKHByb3BzLmxpZ2h0IHx8IHZlYzMuZnJvbVZhbHVlcygxMDAsIDI1MCwgNTAwKSk7XG4gICAgfVxuXG4gICAgLy8gbW92ZSB0aGUgY2FtZXJhIHRvIHRoZSBsaWdodCBwb3NpdGlvblxuICAgIHNldExpZ2h0T3JpZ2luKHZlYykge1xuICAgICAgICAvLyBDQU1FUkFcblxuICAgICAgICAvLyB1cGRhdGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgIHZlYzMuY29weSh0aGlzLmNhbWVyYS5wb3NpdGlvbi5kYXRhLCB2ZWMpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB2aWV3IG1hdHJpeFxuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMudmlldyk7XG4gICAgICAgIG1hdDQubG9va0F0KFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy52aWV3LFxuICAgICAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uZGF0YSxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnRhcmdldCxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnVwXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gU0hBRE9XXG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5zaGFkb3cpO1xuICAgICAgICBtYXQ0Lm11bHRpcGx5KFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5zaGFkb3csXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy52aWV3XG4gICAgICAgICk7XG4gICAgICAgIG1hdDQubXVsdGlwbHkoXG4gICAgICAgICAgICB0aGlzLm1hdHJpY2VzLnNoYWRvdyxcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMuYmlhcyxcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMuc2hhZG93XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLypcbiAgICBUT0RPOlxuICAgIG1heWJlIGNyZWF0ZSBhIHByb2dyYW0ganVzdCBmb3Igc2hhZG93cy4gdGhpcyBhdm9pZHMgaGF2aW5nIHRvIGNoYW5nZSBwcm9ncmFtXG4gICAgaW4gY29tcGxleCBzY2VuZXMganVzdCB0byB3cml0ZSBmb3IgdGhlIGRlcHRoIGJ1ZmZlci5cbiAgICBmaW5kIGEgd2F5IHRvIGJ5cGFzcyB0aGUgY2hhbmdlUHJvZ3JhbSBvbiB0aGUgcmVuZGVyZXIgdG8gYWNjb21vZGF0ZSB0aGlzLlxuICAgICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoYWRvd01hcFJlbmRlcmVyO1xuIiwiaW1wb3J0IHsgdmVjNCwgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQge1xuICAgIGxpYnJhcnksXG4gICAgdmVyc2lvbixcbiAgICBzZXRDb250ZXh0LFxuICAgIGdldENvbnRleHQsXG4gICAgc2V0Q29udGV4dFR5cGUsXG4gICAgZ2V0Q29udGV4dFR5cGUsXG4gICAgc3VwcG9ydHMsXG59IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCwgTUFYX0RJUkVDVElPTkFMIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IHJlc2l6ZSwgdW5zdXBwb3J0ZWQgfSBmcm9tICcuLi91dGlscy9kb20nO1xuaW1wb3J0IHsgVWJvIH0gZnJvbSAnLi4vZ2wnO1xuXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi9zY2VuZSc7XG5pbXBvcnQgU2hhZG93TWFwUmVuZGVyZXIgZnJvbSAnLi9zaGFkb3ctbWFwLXJlbmRlcmVyJztcblxubGV0IGxhc3RQcm9ncmFtO1xuXG5sZXQgc29ydCA9IGZhbHNlO1xuY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbmxldCBXRUJHTDIgPSBmYWxzZTtcblxuY29uc3QgdGltZSA9IHZlYzQuY3JlYXRlKCk7XG5jb25zdCBmb2cgPSB2ZWM0LmNyZWF0ZSgpO1xuXG5jb25zdCBtYXRyaWNlcyA9IHtcbiAgICB2aWV3OiBtYXQ0LmNyZWF0ZSgpLFxuICAgIG5vcm1hbDogbWF0NC5jcmVhdGUoKSxcbiAgICBtb2RlbFZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgaW52ZXJzZWRNb2RlbFZpZXc6IG1hdDQuY3JlYXRlKCksXG59O1xuXG5sZXQgY2FjaGVkU2NlbmUgPSBudWxsOyAvLyBzY2VuZVxubGV0IGNhY2hlZENhbWVyYSA9IG51bGw7IC8vIGNhbWVyYVxuXG5jbGFzcyBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICB0aGlzLnN1cHBvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc29ydGVkID0ge1xuICAgICAgICAgICAgb3BhcXVlOiBbXSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBbXSxcbiAgICAgICAgICAgIHNoYWRvdzogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgICAgICAgIG9wYXF1ZTogMCxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiAwLFxuICAgICAgICAgICAgc2hhZG93OiAwLFxuICAgICAgICAgICAgdmVydGljZXM6IDAsXG4gICAgICAgICAgICBpbnN0YW5jZXM6IDAsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yYXRpbyA9IHByb3BzLnJhdGlvIHx8IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLnNoYWRvd3MgPSBwcm9wcy5zaGFkb3dzIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSBwcm9wcy5jYW52YXMgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICAgICAgY29uc3QgY29udGV4dFR5cGUgPSBzZXRDb250ZXh0VHlwZShwcm9wcy5jb250ZXh0VHlwZSk7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5kb21FbGVtZW50LmdldENvbnRleHQoXG4gICAgICAgICAgICBjb250ZXh0VHlwZSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhbnRpYWxpYXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJvcHNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBzZXNzaW9uID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBnbCAmJlxuICAgICAgICAgICAgKChzZXNzaW9uLnZlcnRleEFycmF5T2JqZWN0ICYmXG4gICAgICAgICAgICAgICAgc2Vzc2lvbi5pbnN0YW5jZWRBcnJheXMgJiZcbiAgICAgICAgICAgICAgICBzZXNzaW9uLnN0YW5kYXJkRGVyaXZhdGl2ZXMgJiZcbiAgICAgICAgICAgICAgICBzZXNzaW9uLmRlcHRoVGV4dHVyZXMpIHx8XG4gICAgICAgICAgICAgICAgd2luZG93LmdsaSAhPT0gbnVsbClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuZ3JlZXRpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGliID0gJ2NvbG9yOiM2NjY7Zm9udC1zaXplOngtc21hbGw7Zm9udC13ZWlnaHQ6Ym9sZDsnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAnY29sb3I6Izc3Nztmb250LXNpemU6eC1zbWFsbCc7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gJ2NvbG9yOiNmMzM7Zm9udC1zaXplOngtc21hbGwnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICAgICAgICAgIGAlYyR7bGlicmFyeX0gLSAlY3ZlcnNpb246ICVjJHt2ZXJzaW9ufSAlY3J1bm5pbmc6ICVjJHtnbC5nZXRQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBnbC5WRVJTSU9OXG4gICAgICAgICAgICAgICAgICAgICl9YCxcbiAgICAgICAgICAgICAgICAgICAgbGliLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldENvbnRleHQoZ2wpO1xuXG4gICAgICAgICAgICBXRUJHTDIgPSBnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMjtcblxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSB1bnN1cHBvcnRlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5zdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMucGVyU2NlbmUgPSBuZXcgVWJvKFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gcHJvamVjdGlvbiBtYXRyaXhcbiAgICAgICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gdmlldyBtYXRyaXhcbiAgICAgICAgICAgICAgICAgICAgLi4uZm9nLCAvLyBmb2cgdmVjNCh1c2VfZm9nLCBzdGFydCwgZW5kLCBkZW5zaXR5KVxuICAgICAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBmb2cgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgLi4udGltZSwgLy8gdmVjNChpR2xvYmFsVGltZSwgRU1QVFksIEVNUFRZLCBFTVBUWSlcbiAgICAgICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXAgc2V0dGluZ3MgKHVzZV9jbGlwcGluZywgRU1QVFksIEVNUFRZLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAwXG4gICAgICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAxXG4gICAgICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAyXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLnBlck1vZGVsID0gbmV3IFVibyhcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIC4uLm1hdDQuY3JlYXRlKCksIC8vIG1vZGVsIG1hdHJpeFxuICAgICAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBub3JtYWwgbWF0cml4XG4gICAgICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXAgc2V0dGluZ3MgKHVzZV9jbGlwcGluZywgRU1QVFksIEVNUFRZLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXBwaW5nIHBsYW5lIDBcbiAgICAgICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcHBpbmcgcGxhbmUgMVxuICAgICAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwcGluZyBwbGFuZSAyXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsID0gbmV3IFVibyhcbiAgICAgICAgICAgICAgICBuZXcgRmxvYXQzMkFycmF5KE1BWF9ESVJFQ1RJT05BTCAqIDEyKSxcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hhZG93c1xuICAgICAgICB0aGlzLnNoYWRvd21hcCA9IG5ldyBTaGFkb3dNYXBSZW5kZXJlcigpO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG4gICAgICAgIHJlc2l6ZSh0aGlzLmRvbUVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHRoaXMucmF0aW8pO1xuICAgIH1cblxuICAgIHNldFJhdGlvKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucmF0aW8gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjaGFuZ2VQcm9ncmFtKHByb2dyYW0pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgY29uc3Qgc0xvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgJ3BlclNjZW5lJyk7XG4gICAgICAgICAgICBjb25zdCBtTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCAncGVyTW9kZWwnKTtcbiAgICAgICAgICAgIGNvbnN0IGRMb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sICdkaXJlY3Rpb25hbCcpO1xuICAgICAgICAgICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhcbiAgICAgICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgICAgIHNMb2NhdGlvbixcbiAgICAgICAgICAgICAgICB0aGlzLnBlclNjZW5lLmJvdW5kTG9jYXRpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKFxuICAgICAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICAgICAgbUxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIHRoaXMucGVyTW9kZWwuYm91bmRMb2NhdGlvblxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gaXMgZGlyZWN0aW9uYWwgbGlnaHQgaW4gc2hhZGVyXG4gICAgICAgICAgICBpZiAoZExvY2F0aW9uID09PSB0aGlzLmRpcmVjdGlvbmFsLmJvdW5kTG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgICAgICAgICBkTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwuYm91bmRMb2NhdGlvblxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KHNjZW5lLCBjYW1lcmEsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuICAgICAgICAvLyBvbmx5IG5lY2Vzc2FyeSBmb3Igd2ViZ2wxIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGNhY2hlZFNjZW5lID0gc2NlbmU7XG4gICAgICAgIGNhY2hlZENhbWVyYSA9IGNhbWVyYTtcblxuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cbiAgICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7IC8vIFRPRE86IG1heWJlIGNoYW5nZSB0aGlzIHRvIG1vZGVsLmpzID9cblxuICAgICAgICBjYW1lcmEudXBkYXRlQ2FtZXJhTWF0cml4KHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIC8vIGNvbW1vbiBtYXRyaWNlc1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLnZpZXcpO1xuICAgICAgICBtYXQ0Lmxvb2tBdChcbiAgICAgICAgICAgIG1hdHJpY2VzLnZpZXcsXG4gICAgICAgICAgICBjYW1lcmEucG9zaXRpb24uZGF0YSxcbiAgICAgICAgICAgIGNhbWVyYS50YXJnZXQsXG4gICAgICAgICAgICBjYW1lcmEudXBcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBjaGVjayBpZiBzb3J0aW5nIGlzIG5lZWRlZCB3aGlsc3QgdHJhdmVyc2luZyB0aHJvdWdoIHRoZSBzY2VuZSBncmFwaFxuICAgICAgICBzb3J0ID0gc2NlbmUudHJhdmVyc2UoKTtcblxuICAgICAgICAvLyBpZiBzb3J0aW5nIGlzIG5lZWRlZCwgcmVzZXQgc3R1ZmZcbiAgICAgICAgaWYgKHNvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLm9wYXF1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLnNoYWRvdyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBjYW4gYmUgZGVwcmVjYXRlZCwgYnV0IGl0cyBraW5kIG9mIGNvb2xcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uub3BhcXVlID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudHJhbnNwYXJlbnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5zaGFkb3cgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS52ZXJ0aWNlcyA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLmluc3RhbmNlcyA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuc29ydChzY2VuZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGltZVxuICAgICAgICB0aW1lWzBdID0gKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICAgICAgZm9nWzBdID0gc2NlbmUuZm9nLmVuYWJsZTtcbiAgICAgICAgZm9nWzFdID0gc2NlbmUuZm9nLnN0YXJ0O1xuICAgICAgICBmb2dbMl0gPSBzY2VuZS5mb2cuZW5kO1xuICAgICAgICBmb2dbM10gPSBzY2VuZS5mb2cuZGVuc2l0eTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICAvLyBiaW5kIGNvbW1vbiBidWZmZXJzXG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lLmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwuYmluZCgpO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25hbC5iaW5kKCk7XG5cbiAgICAgICAgICAgIHRoaXMucGVyU2NlbmUudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAuLi5jYW1lcmEubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgICAgICAuLi5tYXRyaWNlcy52aWV3LFxuICAgICAgICAgICAgICAgIC4uLmZvZyxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5mb2cuY29sb3IsXG4gICAgICAgICAgICAgICAgLi4udGltZSxcbiAgICAgICAgICAgICAgICAuLi5bc2NlbmUuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5jbGlwcGluZy5wbGFuZXNbMF0sXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuY2xpcHBpbmcucGxhbmVzWzFdLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmNsaXBwaW5nLnBsYW5lc1syXSxcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwudXBkYXRlKFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5bLi4uc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsW2ldLnBvc2l0aW9uLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLlsuLi5zY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbaV0uY29sb3IsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uW3NjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFtpXS5pbnRlbnNpdHksIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpICogMTJcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGxpZ2h0IGluIHNoYWRvd21hcFxuICAgICAgICB0aGlzLnNoYWRvd21hcC5zZXRMaWdodE9yaWdpbihzY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbMF0ucG9zaXRpb24pO1xuXG4gICAgICAgIC8vIDEpIHJlbmRlciBvYmplY3RzIHRvIHNoYWRvd21hcFxuICAgICAgICBpZiAodGhpcy5yZW5kZXJTaGFkb3cpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3J0ZWQuc2hhZG93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLnNoYWRvd1tpXSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQuc2hhZG93W2ldLnByb2dyYW0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMikgcmVuZGVyIG9wYXF1ZSBvYmplY3RzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3J0ZWQub3BhcXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdChcbiAgICAgICAgICAgICAgICB0aGlzLnNvcnRlZC5vcGFxdWVbaV0sXG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQub3BhcXVlW2ldLnByb2dyYW1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBzb3J0IGFuZCByZW5kZXIgdHJhbnNwYXJlbnQgb2JqZWN0c1xuICAgICAgICAvLyBleHBlbnNpdmUgdG8gc29ydCB0cmFuc3BhcmVudCBpdGVtcyBwZXIgei1pbmRleC5cbiAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueiAtIGIucG9zaXRpb24uejtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZC50cmFuc3BhcmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QoXG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnRbaV0sXG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnRbaV0ucHJvZ3JhbVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDQpIHJlbmRlciBndWlcbiAgICAgICAgLy8gVE9ET1xuICAgIH1cblxuICAgIHJ0dCh7IHJlbmRlclRhcmdldCwgc2NlbmUsIGNhbWVyYSwgY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSB9KSB7XG4gICAgICAgIC8vIG1heWJlIG9yZGVyIGlzIGltcG9ydGFudFxuICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCByZW5kZXJUYXJnZXQuZnJhbWVCdWZmZXIpO1xuXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHJlbmRlclRhcmdldC53aWR0aCwgcmVuZGVyVGFyZ2V0LmhlaWdodCk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoLi4uY2xlYXJDb2xvcik7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgICAgICB0aGlzLmRyYXcoc2NlbmUsIGNhbWVyYSwgcmVuZGVyVGFyZ2V0LndpZHRoLCByZW5kZXJUYXJnZXQuaGVpZ2h0KTtcblxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCByZW5kZXJUYXJnZXQudGV4dHVyZSk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICAvLyByZW5kZXIgc2hhZG93c1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dzKSB7XG4gICAgICAgICAgICAvLyByZW5kZXIgc2NlbmUgdG8gdGV4dHVyZVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ydHQoe1xuICAgICAgICAgICAgICAgIHJlbmRlclRhcmdldDogdGhpcy5zaGFkb3dtYXAucnQsXG4gICAgICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLnNoYWRvd21hcC5jYW1lcmEsXG4gICAgICAgICAgICAgICAgY2xlYXJDb2xvcjogWzEsIDEsIDEsIDFdLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyU2hhZG93ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW5kZXIgc2NlbmVcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLCAwLCAwLCAxKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgICAgIHRoaXMuZHJhdyhzY2VuZSwgY2FtZXJhLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vIFRPRE86IHJlbmRlciBHVUkgb2JqZWN0c1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpY2VzKG1hdHJpeCkge1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLm1vZGVsVmlldyk7XG4gICAgICAgIG1hdDQuY29weShtYXRyaWNlcy5tb2RlbFZpZXcsIG1hdHJpeCk7XG4gICAgICAgIG1hdDQuaW52ZXJ0KG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3LCBtYXRyaWNlcy5tb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LnRyYW5zcG9zZShtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldywgbWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LmlkZW50aXR5KG1hdHJpY2VzLm5vcm1hbCk7XG4gICAgICAgIG1hdDQuY29weShtYXRyaWNlcy5ub3JtYWwsIG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3KTtcbiAgICB9XG5cbiAgICBzb3J0KG9iamVjdCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9iamVjdC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zb3J0KG9iamVjdC5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqZWN0LnZpc2libGUgJiYgIShvYmplY3QgaW5zdGFuY2VvZiBTY2VuZSkpIHtcbiAgICAgICAgICAgIC8vIGFkZHMgb2JqZWN0IHRvIGEgb3BhcXVlIG9yIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBpZiAob2JqZWN0LnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQucHVzaChvYmplY3QpO1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudHJhbnNwYXJlbnQrKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0ZWQub3BhcXVlLnB1c2gob2JqZWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLm9wYXF1ZSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBzaGFkb3dzIGVuYWJsZWQgb24gcmVuZGVyZXIsIGFuZCBzaGFkb3dzIGFyZSBlbmFibGVkIG9uIG9iamVjdFxuICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93cyAmJiBvYmplY3Quc2hhZG93cykge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLnNoYWRvdy5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5zaGFkb3crKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY291bnQgdmVydGljZSBudW1iZXJcbiAgICAgICAgICAgIGlmIChvYmplY3QuYXR0cmlidXRlcy5hX3Bvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS52ZXJ0aWNlcyArPVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlLmxlbmd0aCAvIDM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvdW50IGluc3RhbmNlc1xuICAgICAgICAgICAgaWYgKG9iamVjdC5pc0luc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5pbnN0YW5jZXMgKz0gb2JqZWN0Lmluc3RhbmNlQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzb3J0aW5nIGNvbXBsZXRlXG4gICAgICAgIG9iamVjdC5kaXJ0eS5zb3J0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyT2JqZWN0KG9iamVjdCwgcHJvZ3JhbSwgaW5TaGFkb3dNYXAgPSBmYWxzZSkge1xuICAgICAgICAvLyBpdHMgdGhlIHBhcmVudCBub2RlIChzY2VuZS5qcylcbiAgICAgICAgaWYgKG9iamVjdC5wYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlTWF0cmljZXMob2JqZWN0Lm1hdHJpY2VzLm1vZGVsKTtcblxuICAgICAgICBpZiAob2JqZWN0LmRpcnR5LnNoYWRlcikge1xuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnNoYWRlciA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAocHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIG9iamVjdC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByb2dyYW0pIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KTtcbiAgICAgICAgICAgIG9iamVjdC5pbml0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdFByb2dyYW0gIT09IHByb2dyYW0pIHtcbiAgICAgICAgICAgIGxhc3RQcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlUHJvZ3JhbShsYXN0UHJvZ3JhbSwgb2JqZWN0LnR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqZWN0LmJpbmQoKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KTtcblxuICAgICAgICBvYmplY3QudXBkYXRlKGluU2hhZG93TWFwKTtcbiAgICAgICAgb2JqZWN0LmRyYXcoKTtcblxuICAgICAgICBvYmplY3QudW5iaW5kKCk7XG4gICAgfVxuXG4gICAgaW5pdFVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KSB7XG4gICAgICAgIGlmICghV0VCR0wyKSB7XG4gICAgICAgICAgICAvLyBwZXIgc2NlbmVcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdwcm9qZWN0aW9uTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCd2aWV3TWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdmb2dTZXR0aW5ncycsICd2ZWM0JywgZm9nKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdmb2dDb2xvcicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnaUdsb2JhbFRpbWUnLCAnZmxvYXQnLCB0aW1lWzBdKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwU2V0dGluZ3MnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTAnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTEnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2dsb2JhbENsaXBQbGFuZTInLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgLy8gcGVyIG9iamVjdFxuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ21vZGVsTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdub3JtYWxNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFNldHRpbmdzJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBQbGFuZTAnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFBsYW5lMScsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwUGxhbmUyJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcblxuICAgICAgICAgICAgLy8gbGlnaHRzXG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZGxQb3NpdGlvbicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZGxDb2xvcicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZmxJbnRlbnNpdHknLCAnZmxvYXQnLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dNYXAnLCAnc2FtcGxlcjJEJywgMCk7XG4gICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdzaGFkb3dNYXRyaXgnLCAnbWF0NCcsIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TmVhcicsICdmbG9hdCcsIDApO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93RmFyJywgJ2Zsb2F0JywgMCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVW5pZm9ybXNQZXJNb2RlbChvYmplY3QpIHtcbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgdGhpcy5wZXJNb2RlbC51cGRhdGUoW1xuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5tYXRyaWNlcy5tb2RlbCxcbiAgICAgICAgICAgICAgICAuLi5tYXRyaWNlcy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgLi4uW29iamVjdC5jbGlwcGluZy5lbmFibGUsIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF0sXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0LmNsaXBwaW5nLnBsYW5lc1sxXSxcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QuY2xpcHBpbmcucGxhbmVzWzJdLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBiZWNhdXNlIFVCTyBhcmUgd2ViZ2wyIG9ubHksIHdlIG5lZWQgdG8gbWFudWFsbHkgYWRkIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgIC8vIGFzIHVuaWZvcm1zXG4gICAgICAgICAgICAvLyBwZXIgc2NlbmUgdW5pZm9ybXMgdXBkYXRlXG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeC52YWx1ZSA9XG4gICAgICAgICAgICAgICAgY2FjaGVkQ2FtZXJhLm1hdHJpY2VzLnByb2plY3Rpb247XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMudmlld01hdHJpeC52YWx1ZSA9IG1hdHJpY2VzLnZpZXc7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZm9nU2V0dGluZ3MudmFsdWUgPSBmb2c7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZm9nQ29sb3IudmFsdWUgPSBjYWNoZWRTY2VuZS5mb2cuY29sb3I7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuaUdsb2JhbFRpbWUudmFsdWUgPSB0aW1lWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBTZXR0aW5ncy52YWx1ZSA9IFtcbiAgICAgICAgICAgICAgICBjYWNoZWRTY2VuZS5jbGlwcGluZy5lbmFibGUsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBQbGFuZTAudmFsdWUgPVxuICAgICAgICAgICAgICAgIGNhY2hlZFNjZW5lLmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwUGxhbmUxLnZhbHVlID1cbiAgICAgICAgICAgICAgICBjYWNoZWRTY2VuZS5jbGlwcGluZy5wbGFuZXNbMV07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFBsYW5lMi52YWx1ZSA9XG4gICAgICAgICAgICAgICAgY2FjaGVkU2NlbmUuY2xpcHBpbmcucGxhbmVzWzJdO1xuXG4gICAgICAgICAgICAvLyBwZXIgbW9kZWwgdW5pZm9ybXMgdXBkYXRlXG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubW9kZWxNYXRyaXgudmFsdWUgPSBvYmplY3QubWF0cmljZXMubW9kZWw7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubm9ybWFsTWF0cml4LnZhbHVlID0gbWF0cmljZXMubm9ybWFsO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFNldHRpbmdzLnZhbHVlID0gW1xuICAgICAgICAgICAgICAgIG9iamVjdC5jbGlwcGluZy5lbmFibGUsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFBsYW5lMC52YWx1ZSA9IG9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwUGxhbmUxLnZhbHVlID0gb2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBQbGFuZTIudmFsdWUgPSBvYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGVzdCBTSEFET1dcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd01hcC52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLnJ0LmRlcHRoVGV4dHVyZTtcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd01hdHJpeC52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLm1hdHJpY2VzLnNoYWRvdztcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd05lYXIudmFsdWUgPSB0aGlzLnNoYWRvd21hcC5jYW1lcmEubmVhcjtcbiAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnNoYWRvd0Zhci52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLmNhbWVyYS5mYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZW5kZXJlcjtcbiIsImltcG9ydCBTY2VuZSBmcm9tICcuL3NjZW5lJztcbmltcG9ydCBNZXNoIGZyb20gJy4vbWVzaCc7XG5pbXBvcnQgeyBVQk8gfSBmcm9tICcuLi9zaGFkZXJzL2NodW5rcyc7XG5cbmNsYXNzIFBhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoKTtcblxuICAgICAgICBjb25zdCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zIH0gPSBwcm9wcztcblxuICAgICAgICB0aGlzLnZlcnRleCA9IHZlcnRleDtcbiAgICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0gdW5pZm9ybXM7XG5cbiAgICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIGNvbnN0IHNoYWRlciA9IHtcbiAgICAgICAgICAgIHZlcnRleDogYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xuICAgICAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgICAgICR7dGhpcy52ZXJ0ZXh9YCxcblxuICAgICAgICAgICAgZnJhZ21lbnQ6IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgICAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuICAgICAgICAgICAgICAgICR7dGhpcy5mcmFnbWVudH1gLFxuICAgICAgICAgICAgdW5pZm9ybXM6IHRoaXMudW5pZm9ybXMsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFstMSwgLTEsIDAsIDEsIC0xLCAwLCAxLCAxLCAwLCAtMSwgMSwgMF0sXG4gICAgICAgICAgICBpbmRpY2VzOiBbMCwgMSwgMiwgMCwgMiwgM10sXG4gICAgICAgICAgICB1dnM6IFswLCAwLCAxLCAwLCAxLCAxLCAwLCAxXSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5xdWFkID0gbmV3IE1lc2goeyBnZW9tZXRyeSwgc2hhZGVyIH0pO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnF1YWQpO1xuICAgIH1cblxuICAgIHNldFVuaWZvcm0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnF1YWQudW5pZm9ybXNba2V5XS52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFzcztcbiIsImNvbnN0IEJhc2ljID0ge1xuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHVfaW5wdXQ6IHsgdHlwZTogJ3NhbXBsZXIyRCcsIHZhbHVlOiBudWxsIH0sXG4gICAgfSxcblxuICAgIHZlcnRleDogYFxuICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgIHZfdXYgPSBhX3V2O1xuICAgIH1gLFxuXG4gICAgZnJhZ21lbnQ6IGBcbiAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X2lucHV0O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBvdXRDb2xvciA9IHRleHR1cmUodV9pbnB1dCwgdl91dik7XG4gICAgfWAsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNpYztcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgT3J0aG9ncmFwaGljIH0gZnJvbSAnLi4vY2FtZXJhcyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vcnQnO1xuaW1wb3J0IFBhc3MgZnJvbSAnLi9wYXNzJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vcGFzc2VzJztcblxuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDA7XG5cbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29sb3IgPSB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSk7XG5cbiAgICAgICAgdGhpcy5zY3JlZW4gPSBuZXcgUGFzcyhCYXNpYyk7XG4gICAgICAgIHRoaXMuc2NyZWVuLmNvbXBpbGUoKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBbbmV3IFJlbmRlclRhcmdldCgpLCBuZXcgUmVuZGVyVGFyZ2V0KCldO1xuXG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMuYnVmZmVyc1sxXTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHRoaXMuYnVmZmVyc1swXTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLnJlYWQuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy53cml0ZS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIHNldFJhdGlvKHJhdGlvKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0UmF0aW8ocmF0aW8pO1xuICAgIH1cblxuICAgIHBhc3MocGFzcykge1xuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgIH1cblxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFzc2VzW2ldLmNvbXBpbGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlclRvVGV4dHVyZShyZW5kZXJUYXJnZXQsIHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5ydHQoe1xuICAgICAgICAgICAgcmVuZGVyVGFyZ2V0LFxuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICBjYW1lcmEsXG4gICAgICAgICAgICBjbGVhckNvbG9yOiB0aGlzLmNsZWFyQ29sb3IsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlc2V0QnVmZmVycygpIHtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy5idWZmZXJzWzFdO1xuICAgICAgICB0aGlzLndyaXRlID0gdGhpcy5idWZmZXJzWzBdO1xuICAgIH1cblxuICAgIHN3YXBCdWZmZXJzKCkge1xuICAgICAgICB0aGlzLnRlbXAgPSB0aGlzLnJlYWQ7XG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMud3JpdGU7XG4gICAgICAgIHRoaXMud3JpdGUgPSB0aGlzLnRlbXA7XG4gICAgfVxuXG4gICAgcmVuZGVyKHNjZW5lLCBjYW1lcmEpIHtcbiAgICAgICAgdGhpcy5yZXNldEJ1ZmZlcnMoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb1RleHR1cmUodGhpcy53cml0ZSwgc2NlbmUsIGNhbWVyYSk7XG5cbiAgICAgICAgLy8gcGluZyBwb25nIHRleHR1cmVzIHRocm91Z2ggcGFzc2VzXG4gICAgICAgIGNvbnN0IHRvdGFsID0gdGhpcy5wYXNzZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhc3Nlc1tpXS5lbmFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXBCdWZmZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzZXNbaV0uc2V0VW5pZm9ybSgndV9pbnB1dCcsIHRoaXMucmVhZC50ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRvVGV4dHVyZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53cml0ZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXNzZXNbaV0uc2NlbmUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbmRlciBsYXN0IHBhc3MgdG8gc2NyZWVuXG4gICAgICAgIHRoaXMuc2NyZWVuLnNldFVuaWZvcm0oJ3VfaW5wdXQnLCB0aGlzLndyaXRlLnRleHR1cmUpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjcmVlbi5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9zZXI7XG4iLCJjbGFzcyBQZXJmb3JtYW5jZSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgdGhpcy50aGVtZSA9IHBhcmFtcy50aGVtZSB8fCB7XG4gICAgICAgICAgICBmb250OlxuICAgICAgICAgICAgICAgICdmb250LWZhbWlseTpzYW5zLXNlcmlmO2ZvbnQtc2l6ZTp4eC1zbWFsbDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHg7LW1vei1vc3gtZm9udC1zbW9vdGhpbmc6IGdyYXlzY2FsZTstd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsnLFxuICAgICAgICAgICAgY29sb3IxOiAnIzI0MjQyNCcsXG4gICAgICAgICAgICBjb2xvcjI6ICcjMmEyYTJhJyxcbiAgICAgICAgICAgIGNvbG9yMzogJyM2NjYnLFxuICAgICAgICAgICAgY29sb3I0OiAnIzk5OScsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID1cbiAgICAgICAgICAgICdwb3NpdGlvbjpmaXhlZDtib3R0b206MDtsZWZ0OjA7bWluLXdpZHRoOjgwcHg7b3BhY2l0eTowLjk7ei1pbmRleDoxMDAwMDsnO1xuXG4gICAgICAgIHRoaXMuaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuaG9sZGVyLnN0eWxlLmNzc1RleHQgPSBgcGFkZGluZzozcHg7YmFja2dyb3VuZC1jb2xvcjoke3RoaXMudGhlbWUuY29sb3IxfTtgO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ob2xkZXIpO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBgJHt0aGlzLnRoZW1lLmZvbnR9O2NvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjN9O2A7XG4gICAgICAgIHRpdGxlLmlubmVySFRNTCA9ICdQZXJmb3JtYW5jZSc7XG4gICAgICAgIHRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgICAgICB0aGlzLm1zVGV4dHMgPSBbXTtcblxuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjb250YWluZXI7XG4gICAgfVxuXG4gICAgcmVidWlsZChwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5tc1RleHRzID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gYCR7dGhpcy50aGVtZS5mb250fTtjb2xvcjoke3RoaXMudGhlbWUuY29sb3I0fTtiYWNrZ3JvdW5kLWNvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjJ9O2A7XG4gICAgICAgICAgICB0aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMubXNUZXh0c1trZXldID0gZWxlbWVudDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKHJlbmRlcmVyKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMubXNUZXh0cykubGVuZ3RoICE9PVxuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVuZGVyZXIucGVyZm9ybWFuY2UpLmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVidWlsZChyZW5kZXJlci5wZXJmb3JtYW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyhyZW5kZXJlci5wZXJmb3JtYW5jZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tc1RleHRzW1xuICAgICAgICAgICAgICAgIGtleVxuICAgICAgICAgICAgXS50ZXh0Q29udGVudCA9IGAke2tleX06ICR7cmVuZGVyZXIucGVyZm9ybWFuY2Vba2V5XX1gO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBlcmZvcm1hbmNlO1xuIl0sIm5hbWVzIjpbIkxJR0hUIiwiZmFjdG9yeSIsImRpcmVjdGlvbmFsIiwiYmFzZSIsIkZPRyIsImxpbmVhciIsImV4cG9uZW50aWFsIiwiZXhwb25lbnRpYWwyIiwiTUFYX0RJUkVDVElPTkFMIiwiRElSRUNUSU9OQUxfTElHSFQiLCJTSEFERVJfQkFTSUMiLCJTSEFERVJfREVGQVVMVCIsIlNIQURFUl9CSUxMQk9BUkQiLCJTSEFERVJfU0hBRE9XIiwiU0hBREVSX1NFTSIsIlNIQURFUl9DVVNUT00iLCJEUkFXIiwiUE9JTlRTIiwiTElORVMiLCJUUklBTkdMRVMiLCJTSURFIiwiRlJPTlQiLCJCQUNLIiwiQk9USCIsIkNPTlRFWFQiLCJXRUJHTCIsIldFQkdMMiIsImxpYnJhcnkiLCJ2ZXJzaW9uIiwiZ2wiLCJjb250ZXh0VHlwZSIsInRlc3RDb250ZXh0MSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldENvbnRleHQiLCJ0ZXN0Q29udGV4dDIiLCJleHRlbnNpb25zIiwidmVydGV4QXJyYXlPYmplY3QiLCJnZXRFeHRlbnNpb24iLCJpbnN0YW5jZWRBcnJheXMiLCJzdGFuZGFyZERlcml2YXRpdmVzIiwiZGVwdGhUZXh0dXJlcyIsInNldENvbnRleHRUeXBlIiwiZ2wyIiwiZ2wxIiwicHJlZmVycmVkIiwiZGVwdGhUZXh0dXJlIiwiZ2V0Q29udGV4dFR5cGUiLCJzZXRDb250ZXh0IiwiY29udGV4dCIsInN1cHBvcnRzIiwiVUJPIiwic2NlbmUiLCJtb2RlbCIsImxpZ2h0cyIsIk5PSVNFIiwiQ0xJUFBJTkciLCJ2ZXJ0ZXhfcHJlIiwidmVydGV4IiwiZnJhZ21lbnRfcHJlIiwiZnJhZ21lbnQiLCJFWFRFTlNJT05TIiwiaGFyZCIsIlNIQURPVyIsIkVQU0lMT04iLCJBUlJBWV9UWVBFIiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJNYXRoIiwiaHlwb3QiLCJ5IiwiaSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInNxcnQiLCJjcmVhdGUiLCJvdXQiLCJnbE1hdHJpeCIsImNvcHkiLCJhIiwiZnJvbVZhbHVlcyIsIm0wMCIsIm0wMSIsIm0wMiIsIm0wMyIsIm0xMCIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMCIsIm0yMSIsIm0yMiIsIm0yMyIsIm0zMCIsIm0zMSIsIm0zMiIsIm0zMyIsImlkZW50aXR5IiwidHJhbnNwb3NlIiwiYTAxIiwiYTAyIiwiYTAzIiwiYTEyIiwiYTEzIiwiYTIzIiwiaW52ZXJ0IiwiYTAwIiwiYTEwIiwiYTExIiwiYTIwIiwiYTIxIiwiYTIyIiwiYTMwIiwiYTMxIiwiYTMyIiwiYTMzIiwiYjAwIiwiYjAxIiwiYjAyIiwiYjAzIiwiYjA0IiwiYjA1IiwiYjA2IiwiYjA3IiwiYjA4IiwiYjA5IiwiYjEwIiwiYjExIiwiZGV0IiwibXVsdGlwbHkiLCJiIiwiYjAiLCJiMSIsImIyIiwiYjMiLCJ0cmFuc2xhdGUiLCJ2IiwieCIsInoiLCJzY2FsZSIsInJvdGF0ZSIsInJhZCIsImF4aXMiLCJsZW4iLCJzIiwiYyIsInQiLCJiMTIiLCJiMjAiLCJiMjEiLCJiMjIiLCJzaW4iLCJjb3MiLCJwZXJzcGVjdGl2ZSIsImZvdnkiLCJhc3BlY3QiLCJuZWFyIiwiZmFyIiwiZiIsInRhbiIsIm5mIiwiSW5maW5pdHkiLCJvcnRobyIsImxlZnQiLCJyaWdodCIsImJvdHRvbSIsInRvcCIsImxyIiwiYnQiLCJsb29rQXQiLCJleWUiLCJjZW50ZXIiLCJ1cCIsIngwIiwieDEiLCJ4MiIsInkwIiwieTEiLCJ5MiIsInowIiwiejEiLCJ6MiIsImV5ZXgiLCJleWV5IiwiZXlleiIsInVweCIsInVweSIsInVweiIsImNlbnRlcngiLCJjZW50ZXJ5IiwiY2VudGVyeiIsImFicyIsInRhcmdldFRvIiwidGFyZ2V0Iiwibm9ybWFsaXplIiwiZG90IiwiY3Jvc3MiLCJheCIsImF5IiwiYXoiLCJieCIsImJ5IiwiYnoiLCJmb3JFYWNoIiwidmVjIiwic3RyaWRlIiwib2Zmc2V0IiwiY291bnQiLCJmbiIsImFyZyIsImwiLCJtaW4iLCJ3Iiwic2V0QXhpc0FuZ2xlIiwiZ2V0QXhpc0FuZ2xlIiwib3V0X2F4aXMiLCJxIiwiYWNvcyIsInJvdGF0ZVgiLCJhdyIsImJ3Iiwicm90YXRlWSIsInJvdGF0ZVoiLCJzbGVycCIsIm9tZWdhIiwiY29zb20iLCJzaW5vbSIsInNjYWxlMCIsInNjYWxlMSIsImZyb21NYXQzIiwibSIsImZUcmFjZSIsImZSb290IiwiaiIsImsiLCJ2ZWM0Iiwicm90YXRpb25UbyIsInRtcHZlYzMiLCJ2ZWMzIiwieFVuaXRWZWMzIiwieVVuaXRWZWMzIiwiUEkiLCJzcWxlcnAiLCJ0ZW1wMSIsInRlbXAyIiwiZCIsInNldEF4ZXMiLCJtYXRyIiwibWF0MyIsInZpZXciLCJhcnJheSIsImhleEludFRvUmdiIiwiaGV4IiwiciIsImciLCJoZXhTdHJpbmdUb1JnYiIsInJlc3VsdCIsImV4ZWMiLCJwYXJzZUludCIsImNvbXBvbmVudFRvSGV4IiwidG9TdHJpbmciLCJyZ2JUb0hleCIsImhleFIiLCJoZXhHIiwiaGV4QiIsImNvbnZlcnQiLCJjb2xvciIsInJnYiIsInJhbmRvbVJhbmdlIiwibWF4IiwicmFuZG9tIiwibW9kIiwibiIsIldPUkRfUkVHWCIsIlJlZ0V4cCIsIndvcmQiLCJMSU5FX1JFR1giLCJWRVJURVgiLCJtYXRjaCIsInJlcGxhY2UiLCJGUkFHTUVOVCIsInNoYWRlciIsInRleHR1cmVHbG9iYWxSZWd4IiwidGV4dHVyZVNpbmdsZVJlZ3giLCJ0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4IiwibWF0Y2hlcyIsInJlcGxhY2VtZW50IiwidW5pZm9ybU5hbWUiLCJzcGxpdCIsInVuaWZvcm1UeXBlIiwiR0VORVJJQyIsIlZFUlRFWF9SVUxFUyIsIkZSQUdNRU5UX1JVTEVTIiwicGFyc2UiLCJzaGFkZXJUeXBlIiwicnVsZXMiLCJydWxlIiwiVmVjdG9yMyIsImRhdGEiLCJ2YWx1ZSIsInV1aWQiLCJheGlzQW5nbGUiLCJxdWF0ZXJuaW9uQXhpc0FuZ2xlIiwiT2JqZWN0MyIsInVpZCIsInBhcmVudCIsImNoaWxkcmVuIiwicG9zaXRpb24iLCJyb3RhdGlvbiIsIl90cmFuc3BhcmVudCIsIl92aXNpYmxlIiwicXVhdGVybmlvbiIsInF1YXQiLCJsb29rVG9UYXJnZXQiLCJtYXRyaWNlcyIsIm1hdDQiLCJkaXJ0eSIsInNvcnRpbmciLCJ0cmFuc3BhcmVudCIsImF0dHJpYnV0ZXMiLCJzY2VuZUdyYXBoU29ydGVyIiwicHVzaCIsImluZGV4IiwiaW5kZXhPZiIsImRlc3Ryb3kiLCJzcGxpY2UiLCJvYmplY3QiLCJ1bmRlZmluZWQiLCJ0cmF2ZXJzZSIsInVwZGF0ZU1hdHJpY2VzIiwidmlzaWJsZSIsIk9ydGhvZ3JhcGhpY0NhbWVyYSIsInBhcmFtcyIsIk9iamVjdCIsImFzc2lnbiIsInByb2plY3Rpb24iLCJQZXJzcGVjdGl2ZUNhbWVyYSIsImZvdiIsIndpZHRoIiwiaGVpZ2h0IiwiQmFzaWMiLCJwcm9wcyIsInR5cGUiLCJtb2RlIiwid2lyZWZyYW1lIiwidW5pZm9ybXMiLCJ1X2NvbG9yIiwiVGV4dHVyZSIsIm1hZ0ZpbHRlciIsIk5FQVJFU1QiLCJtaW5GaWx0ZXIiLCJ3cmFwUyIsIkNMQU1QX1RPX0VER0UiLCJ3cmFwVCIsIlVpbnQ4QXJyYXkiLCJ0ZXh0dXJlIiwiY3JlYXRlVGV4dHVyZSIsImJpbmRUZXh0dXJlIiwiVEVYVFVSRV8yRCIsInRleEltYWdlMkQiLCJSR0JBIiwiVU5TSUdORURfQllURSIsInRleFBhcmFtZXRlcmkiLCJURVhUVVJFX01BR19GSUxURVIiLCJURVhUVVJFX01JTl9GSUxURVIiLCJURVhUVVJFX1dSQVBfUyIsIlRFWFRVUkVfV1JBUF9UIiwicGl4ZWxTdG9yZWkiLCJVTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wiLCJ1cmwiLCJpbWciLCJJbWFnZSIsImNyb3NzT3JpZ2luIiwib25sb2FkIiwidXBkYXRlIiwic3JjIiwiaW1hZ2UiLCJnZW5lcmF0ZU1pcG1hcCIsIlVOUEFDS19GTElQX1lfV0VCR0wiLCJEZWZhdWx0IiwibWFwIiwiZnJvbUltYWdlIiwidV9tYXAiLCJCaWxsYm9hcmQiLCJTZW0iLCJQUk9HUkFNX1BPT0wiLCJjcmVhdGVTaGFkZXIiLCJzdHIiLCJzaGFkZXJTb3VyY2UiLCJjb21waWxlU2hhZGVyIiwiY29tcGlsZWQiLCJnZXRTaGFkZXJQYXJhbWV0ZXIiLCJDT01QSUxFX1NUQVRVUyIsImVycm9yIiwiZ2V0U2hhZGVySW5mb0xvZyIsImRlbGV0ZVNoYWRlciIsImNvbnNvbGUiLCJFcnJvciIsImNyZWF0ZVByb2dyYW0iLCJwcm9ncmFtSUQiLCJwb29sIiwidnMiLCJWRVJURVhfU0hBREVSIiwiZnMiLCJGUkFHTUVOVF9TSEFERVIiLCJwcm9ncmFtIiwiYXR0YWNoU2hhZGVyIiwibGlua1Byb2dyYW0iLCJVYm8iLCJib3VuZExvY2F0aW9uIiwiYnVmZmVyIiwiY3JlYXRlQnVmZmVyIiwiYmluZEJ1ZmZlciIsIlVOSUZPUk1fQlVGRkVSIiwiYnVmZmVyRGF0YSIsIlNUQVRJQ19EUkFXIiwiYmluZEJ1ZmZlckJhc2UiLCJzZXQiLCJidWZmZXJTdWJEYXRhIiwiVmFvIiwidmFvIiwiY3JlYXRlVmVydGV4QXJyYXkiLCJiaW5kVmVydGV4QXJyYXkiLCJjcmVhdGVWZXJ0ZXhBcnJheU9FUyIsImJpbmRWZXJ0ZXhBcnJheU9FUyIsImRlbGV0ZVZlcnRleEFycmF5IiwiZGVsZXRlVmVydGV4QXJyYXlPRVMiLCJnZXRUeXBlU2l6ZSIsImluaXRBdHRyaWJ1dGVzIiwicHJvcCIsImN1cnJlbnQiLCJsb2NhdGlvbiIsImdldEF0dHJpYkxvY2F0aW9uIiwiQVJSQVlfQlVGRkVSIiwiYmluZEF0dHJpYnV0ZXMiLCJrZXlzIiwia2V5Iiwic2l6ZSIsImluc3RhbmNlZCIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJGTE9BVCIsImVuYWJsZVZlcnRleEF0dHJpYkFycmF5IiwiZGl2aXNvciIsInZlcnRleEF0dHJpYkRpdmlzb3IiLCJ2ZXJ0ZXhBdHRyaWJEaXZpc29yQU5HTEUiLCJ1cGRhdGVBdHRyaWJ1dGVzIiwiRFlOQU1JQ19EUkFXIiwiaW5pdFVuaWZvcm1zIiwidGV4dHVyZUluZGljZXMiLCJURVhUVVJFMCIsIlRFWFRVUkUxIiwiVEVYVFVSRTIiLCJURVhUVVJFMyIsIlRFWFRVUkU0IiwiVEVYVFVSRTUiLCJnZXRVbmlmb3JtTG9jYXRpb24iLCJ0ZXh0dXJlSW5kZXgiLCJhY3RpdmVUZXh0dXJlIiwidXBkYXRlVW5pZm9ybXMiLCJ1bmlmb3JtIiwidW5pZm9ybU1hdHJpeDRmdiIsInVuaWZvcm1NYXRyaXgzZnYiLCJ1bmlmb3JtNGZ2IiwidW5pZm9ybTNmdiIsInVuaWZvcm0yZnYiLCJ1bmlmb3JtMWYiLCJ1bmlmb3JtMWkiLCJNb2RlbCIsInBvbHlnb25PZmZzZXQiLCJwb2x5Z29uT2Zmc2V0RmFjdG9yIiwicG9seWdvbk9mZnNldFVuaXRzIiwiY2xpcHBpbmciLCJlbmFibGUiLCJwbGFuZXMiLCJpbnN0YW5jZUNvdW50IiwiaXNJbnN0YW5jZSIsInNpZGUiLCJTdHJpbmciLCJzaGFkb3dzIiwibmFtZSIsImluZGljZXMiLCJnbHNsM3RvMSIsInVzZVByb2dyYW0iLCJFTEVNRU5UX0FSUkFZX0JVRkZFUiIsImFfcG9zaXRpb24iLCJpblNoYWRvd01hcCIsIlBPTFlHT05fT0ZGU0VUX0ZJTEwiLCJkaXNhYmxlIiwiQkxFTkQiLCJibGVuZEZ1bmMiLCJTUkNfQUxQSEEiLCJPTkVfTUlOVVNfU1JDX0FMUEhBIiwiREVQVEhfVEVTVCIsIkNVTExfRkFDRSIsImN1bGxGYWNlIiwiZHJhd0VsZW1lbnRzSW5zdGFuY2VkIiwiVU5TSUdORURfU0hPUlQiLCJkcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSIsImRyYXdFbGVtZW50cyIsImRyYXdBcnJheXMiLCJzaGFkZXJJRCIsIk1lc2giLCJfc2hhZGVyIiwiZ2VvbWV0cnkiLCJwb3NpdGlvbnMiLCJub3JtYWxzIiwidXZzIiwic2V0QXR0cmlidXRlIiwic2V0SW5kZXgiLCJVaW50MTZBcnJheSIsInNldFVuaWZvcm0iLCJzZXRTaGFkZXIiLCJBeGlzSGVscGVyIiwiZzEiLCJnMiIsImczIiwibTEiLCJtMiIsIm0zIiwiYWRkIiwic3giLCJzeSIsInN6IiwiYV9ub3JtYWwiLCJpMyIsInYweCIsInYweSIsInYweiIsIm54IiwibnkiLCJueiIsInYxeCIsInYxeSIsInYxeiIsImNvbmNhdCIsInJlZmVyZW5jZSIsInJlc2l6ZSIsImRvbUVsZW1lbnQiLCJyYXRpbyIsInN0eWxlIiwidW5zdXBwb3J0ZWQiLCJkaXYiLCJpbm5lckhUTUwiLCJkaXNwbGF5IiwibWFyZ2luIiwiYm9yZGVyIiwiYmFja2dyb3VuZENvbG9yIiwiYm9yZGVyUmFkaXVzIiwicGFkZGluZyIsImZvbnRGYW1pbHkiLCJmb250U2l6ZSIsInRleHRBbGlnbiIsIkxpZ2h0IiwiRGlyZWN0aW9uYWwiLCJpbnRlbnNpdHkiLCJTY2VuZSIsImZvZyIsInN0YXJ0IiwiZW5kIiwiZGVuc2l0eSIsImFkZExpZ2h0IiwibGlnaHQiLCJSZW5kZXJUYXJnZXQiLCJpbnRlcm5hbGZvcm1hdCIsIkRFUFRIX0NPTVBPTkVOVCIsIkRFUFRIX0NPTVBPTkVOVDI0IiwiVU5TSUdORURfSU5UIiwiZnJhbWVCdWZmZXIiLCJjcmVhdGVGcmFtZWJ1ZmZlciIsImJpbmRGcmFtZWJ1ZmZlciIsIkZSQU1FQlVGRkVSIiwiTElORUFSIiwiZnJhbWVidWZmZXJUZXh0dXJlMkQiLCJDT0xPUl9BVFRBQ0hNRU5UMCIsIkRFUFRIX0FUVEFDSE1FTlQiLCJTaGFkb3dNYXBSZW5kZXJlciIsInJ0Iiwic2hhZG93IiwiYmlhcyIsImNhbWVyYSIsIlBlcnNwZWN0aXZlIiwiT3J0aG9ncmFwaGljIiwic2V0TGlnaHRPcmlnaW4iLCJsYXN0UHJvZ3JhbSIsInNvcnQiLCJzdGFydFRpbWUiLCJEYXRlIiwibm93IiwidGltZSIsIm5vcm1hbCIsIm1vZGVsVmlldyIsImludmVyc2VkTW9kZWxWaWV3IiwiY2FjaGVkU2NlbmUiLCJjYWNoZWRDYW1lcmEiLCJSZW5kZXJlciIsInN1cHBvcnRlZCIsInNvcnRlZCIsIm9wYXF1ZSIsInBlcmZvcm1hbmNlIiwidmVydGljZXMiLCJpbnN0YW5jZXMiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiY2FudmFzIiwiYW50aWFsaWFzIiwic2Vzc2lvbiIsImdsaSIsImdyZWV0aW5nIiwibGliIiwicGFyYW1ldGVycyIsInZhbHVlcyIsImFyZ3MiLCJnZXRQYXJhbWV0ZXIiLCJWRVJTSU9OIiwibG9nIiwiaW5pdCIsInBlclNjZW5lIiwicGVyTW9kZWwiLCJzaGFkb3dtYXAiLCJzTG9jYXRpb24iLCJnZXRVbmlmb3JtQmxvY2tJbmRleCIsIm1Mb2NhdGlvbiIsImRMb2NhdGlvbiIsInVuaWZvcm1CbG9ja0JpbmRpbmciLCJ1cGRhdGVDYW1lcmFNYXRyaXgiLCJiaW5kIiwicmVuZGVyU2hhZG93IiwicmVuZGVyT2JqZWN0IiwicmVuZGVyVGFyZ2V0IiwiY2xlYXJDb2xvciIsInZpZXdwb3J0IiwiY2xlYXIiLCJDT0xPUl9CVUZGRVJfQklUIiwiREVQVEhfQlVGRkVSX0JJVCIsImRyYXciLCJydHQiLCJtYXRyaXgiLCJpbml0VW5pZm9ybXNQZXJNb2RlbCIsImNoYW5nZVByb2dyYW0iLCJ1cGRhdGVVbmlmb3Jtc1Blck1vZGVsIiwidW5iaW5kIiwicHJvamVjdGlvbk1hdHJpeCIsInZpZXdNYXRyaXgiLCJmb2dTZXR0aW5ncyIsImZvZ0NvbG9yIiwiaUdsb2JhbFRpbWUiLCJnbG9iYWxDbGlwU2V0dGluZ3MiLCJnbG9iYWxDbGlwUGxhbmUwIiwiZ2xvYmFsQ2xpcFBsYW5lMSIsImdsb2JhbENsaXBQbGFuZTIiLCJtb2RlbE1hdHJpeCIsIm5vcm1hbE1hdHJpeCIsImxvY2FsQ2xpcFNldHRpbmdzIiwibG9jYWxDbGlwUGxhbmUwIiwibG9jYWxDbGlwUGxhbmUxIiwibG9jYWxDbGlwUGxhbmUyIiwic2hhZG93TWFwIiwic2hhZG93TWF0cml4Iiwic2hhZG93TmVhciIsInNoYWRvd0ZhciIsIlBhc3MiLCJxdWFkIiwidV9pbnB1dCIsIkNvbXBvc2VyIiwicmVuZGVyZXIiLCJwYXNzZXMiLCJzY3JlZW4iLCJjb21waWxlIiwiYnVmZmVycyIsInJlYWQiLCJ3cml0ZSIsInNldFNpemUiLCJzZXRSYXRpbyIsInBhc3MiLCJ0ZW1wIiwicmVzZXRCdWZmZXJzIiwicmVuZGVyVG9UZXh0dXJlIiwidG90YWwiLCJzd2FwQnVmZmVycyIsInJlbmRlciIsIlBlcmZvcm1hbmNlIiwidGhlbWUiLCJmb250IiwiY29sb3IxIiwiY29sb3IyIiwiY29sb3IzIiwiY29sb3I0IiwiY29udGFpbmVyIiwiY3NzVGV4dCIsImhvbGRlciIsImFwcGVuZENoaWxkIiwidGl0bGUiLCJtc1RleHRzIiwiZWxlbWVudCIsInJlYnVpbGQiLCJ0ZXh0Q29udGVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUEsSUFBTUEsUUFBUTtJQUNWQyxhQUFTLG1CQUFNO0lBQ1gsNlVBT0VELE1BQU1FLFdBQU4sRUFQRjtJQVFILEtBVlM7O0lBWVZBLGlCQUFhLHVCQUFNO0lBQ2Y7SUFhSDtJQTFCUyxDQUFkOztJQ0FBLFNBQVNDLElBQVQsR0FBZ0I7SUFDWjtJQVFIOztJQUVELElBQU1DLE1BQU07SUFDUkMsWUFBUSxrQkFBTTtJQUNWLHNFQUVNRixNQUZOO0lBT0gsS0FUTztJQVVSRyxpQkFBYSx1QkFBTTtJQUNmLHNFQUVNSCxNQUZOO0lBT0gsS0FsQk87SUFtQlJJLGtCQUFjLHdCQUFNO0lBQ2hCLHNFQUVNSixNQUZOO0lBT0g7SUEzQk8sQ0FBWjs7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
