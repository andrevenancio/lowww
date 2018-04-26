const LIGHT = {
    factory: () => {
        return `
        // factory light
        vec3 inverseLightDirection = normalize(vec3(-0.25, -0.25, 1.0));
        vec3 directionalColor = vec3(max(dot(v_normal, inverseLightDirection), 0.0));
        vec3 factory = mix(vec3(0.0), directionalColor, 0.989); // light intensity
        base.rgb *= factory;

        ${LIGHT.directional()}`;
    },

    directional: () => {
        return `
            // vec3 dcolor = vec3(0.01);
            //
            // for (int i = 0; i < MAX_DIRECTIONAL; i++) {
            //     vec3 inverseLightDirection = normalize(directionalLights[i].dlPosition.xyz);
            //     vec3 light = vec3(max(dot(v_normal, inverseLightDirection), 0.0));
            //     vec3 directionalColor = directionalLights[i].dlColor.rgb * light;
            //     dcolor += mix(dcolor, directionalColor, directionalLights[i].flIntensity);
            // }
            // dcolor /= float(MAX_DIRECTIONAL);
            //
            // base.rgb *= dcolor;
        `;
    },
};

function base() {
    return `
    float fogStart = fogSettings.y;
    float fogEnd = fogSettings.z;
    float fogDensity = fogSettings.a;

    float dist = 0.0;
    float fogFactor = 0.0;
    dist = gl_FragCoord.z / gl_FragCoord.w;`;
}

const FOG = {
    linear: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = (fogEnd - dist) / (fogEnd - fogStart);
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
    exponential: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = 1.0 / exp(dist * fogDensity);
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
    exponential2: () => {
        return `
        if (fogSettings.x > 0.0) {
            ${base()}
            fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            base = mix(fogColor, base, fogFactor);
        }`;
    },
};

/**
 * Max directional light allowed
 *
 * @static
 * @constant
 * @name MAX_DIRECTIONAL
 * @type {string}
 */
const MAX_DIRECTIONAL = 1;

/**
 * directional light id
 *
 * @static
 * @constant
 * @name DIRECTIONAL_LIGHT
 * @type {string}
 */
const DIRECTIONAL_LIGHT = 1000;

/**
 * basic shader id
 *
 * @static
 * @constant
 * @name SHADER_BASIC
 * @type {string}
 */
const SHADER_BASIC = 2000;

/**
 * default shader id
 *
 * @static
 * @constant
 * @name SHADER_DEFAULT
 * @type {string}
 */
const SHADER_DEFAULT = 2001;

/**
 * billboard shader id
 *
 * @static
 * @constant
 * @name SHADER_BILLBOARD
 * @type {string}
 */
const SHADER_BILLBOARD = 2002;

/**
 * shadow shader id
 *
 * @static
 * @constant
 * @name SHADER_SHADOW
 * @type {string}
 */
const SHADER_SHADOW = 2003;

/**
 * sem shader id
 *
 * @static
 * @constant
 * @name SHADER_SEM
 * @type {string}
 */
const SHADER_SEM = 2004;

/**
 * custom shader id
 *
 * @static
 * @constant
 * @name SHADER_CUSTOM
 * @type {string}
 */
const SHADER_CUSTOM = 2500;

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
const DRAW = {
    POINTS: 0,
    LINES: 1,
    TRIANGLES: 4,
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
const SIDE = {
    FRONT: 0,
    BACK: 1,
    BOTH: 2,
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
const CONTEXT = {
    WEBGL: 'webgl',
    WEBGL2: 'webgl2',
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

const library = 'lowww';
const version = 'dev';

// per session
let gl = null;
let contextType = null;

// test context webgl and webgl2
const testContext1 = document.createElement('canvas').getContext(CONTEXT.WEBGL);
const testContext2 = document.createElement('canvas').getContext(CONTEXT.WEBGL2);

const extensions = {
    // used globally
    vertexArrayObject: testContext1.getExtension('OES_vertex_array_object'),

    // used for instancing
    instancedArrays: testContext1.getExtension('ANGLE_instanced_arrays'),

    // used for flat shading
    standardDerivatives: testContext1.getExtension('OES_standard_derivatives'),

    // depth texture
    depthTextures: testContext1.getExtension('WEBGL_depth_texture'),
};

const setContextType = (preferred) => {
    const gl2 = testContext2 && CONTEXT.WEBGL2;
    const gl1 = testContext1 && CONTEXT.WEBGL;
    contextType = preferred || gl2 || gl1;

    if (contextType === CONTEXT.WEBGL2) {
        extensions.vertexArrayObject = true;
        extensions.instancedArrays = true;
        extensions.standardDerivatives = true;
        extensions.depthTexture = true;
    }

    return contextType;
};

const getContextType = () => contextType;

const setContext = (context) => {
    gl = context;
    if (getContextType() === CONTEXT.WEBGL) {
        extensions.vertexArrayObject = gl.getExtension('OES_vertex_array_object');
        extensions.instancedArrays = gl.getExtension('ANGLE_instanced_arrays');
        extensions.standardDerivatives = gl.getExtension('OES_standard_derivatives');
        extensions.depthTextures = gl.getExtension('WEBGL_depth_texture');
    }
};

const getContext = () => gl;

const supports = () => extensions;

const UBO = {
    scene: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
            uniform perScene {
                mat4 projectionMatrix;
                mat4 viewMatrix;
                vec4 fogSettings;
                vec4 fogColor;
                float iGlobalTime;
                vec4 globalClipSettings;
                vec4 globalClipPlane0;
                vec4 globalClipPlane1;
                vec4 globalClipPlane2;
            };`;
        }

        return `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform vec4 fogSettings;
        uniform vec4 fogColor;
        uniform float iGlobalTime;
        uniform vec4 globalClipSettings;
        uniform vec4 globalClipPlane0;
        uniform vec4 globalClipPlane1;
        uniform vec4 globalClipPlane2;`;
    },

    model: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
            uniform perModel {
                mat4 modelMatrix;
                mat4 normalMatrix;
                vec4 localClipSettings;
                vec4 localClipPlane0;
                vec4 localClipPlane1;
                vec4 localClipPlane2;
            };`;
        }
        return `
            uniform mat4 modelMatrix;
            uniform mat4 normalMatrix;
            uniform vec4 localClipSettings;
            uniform vec4 localClipPlane0;
            uniform vec4 localClipPlane1;
            uniform vec4 localClipPlane2;`;
    },

    lights: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
                #define MAX_DIRECTIONAL ${MAX_DIRECTIONAL}

                struct Directional {
                    vec4 dlPosition;
                    vec4 dlColor;
                    float flIntensity;
                };

                uniform directional {
                    Directional directionalLights[MAX_DIRECTIONAL];
                };`;
        }

        return `
            #define MAX_DIRECTIONAL ${MAX_DIRECTIONAL}

            struct Directional {
                vec4 dlPosition;
                vec4 dlColor;
                float flIntensity;
            };

            uniform Directional directionalLights[MAX_DIRECTIONAL];`;
    },
};

const NOISE = () => {
    return `
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 permute(vec4 x){return mod289((x*34.+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284-.853735*r;}vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}float cnoise(vec3 P){vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.);Pi0=mod289(Pi0);Pi1=mod289(Pi1);vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);vec4 ix=vec4(Pi0.r,Pi1.r,Pi0.r,Pi1.r),iy=vec4(Pi0.gg,Pi1.gg),iz0=Pi0.bbbb,iz1=Pi1.bbbb,ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1),gx0=ixy0*(1./7.),gy0=fract(floor(gx0)*(1./7.))-.5;gx0=fract(gx0);vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);vec4 gx1=ixy1*(1./7.),gy1=fract(floor(gx1)*(1./7.))-.5;gx1=fract(gx1);vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);vec3 g000=vec3(gx0.r,gy0.r,gz0.r),g100=vec3(gx0.g,gy0.g,gz0.g),g010=vec3(gx0.b,gy0.b,gz0.b),g110=vec3(gx0.a,gy0.a,gz0.a),g001=vec3(gx1.r,gy1.r,gz1.r),g101=vec3(gx1.g,gy1.g,gz1.g),g011=vec3(gx1.b,gy1.b,gz1.b),g111=vec3(gx1.a,gy1.a,gz1.a);vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.r;g010*=norm0.g;g100*=norm0.b;g110*=norm0.a;vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.r;g011*=norm1.g;g101*=norm1.b;g111*=norm1.a;float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.r,Pf0.gb)),n010=dot(g010,vec3(Pf0.r,Pf1.g,Pf0.b)),n110=dot(g110,vec3(Pf1.rg,Pf0.b)),n001=dot(g001,vec3(Pf0.rg,Pf1.b)),n101=dot(g101,vec3(Pf1.r,Pf0.g,Pf1.b)),n011=dot(g011,vec3(Pf0.r,Pf1.gb)),n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.b);vec2 n_yz=mix(n_z.rg,n_z.ba,fade_xyz.g);float n_xyz=mix(n_yz.r,n_yz.g,fade_xyz.r);return 2.2*n_xyz;}float pnoise(vec3 P,vec3 rep){vec3 Pi0=mod(floor(P),rep),Pi1=mod(Pi0+vec3(1.),rep);Pi0=mod289(Pi0);Pi1=mod289(Pi1);vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);vec4 ix=vec4(Pi0.r,Pi1.r,Pi0.r,Pi1.r),iy=vec4(Pi0.gg,Pi1.gg),iz0=Pi0.bbbb,iz1=Pi1.bbbb,ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1),gx0=ixy0*(1./7.),gy0=fract(floor(gx0)*(1./7.))-.5;gx0=fract(gx0);vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);vec4 gx1=ixy1*(1./7.),gy1=fract(floor(gx1)*(1./7.))-.5;gx1=fract(gx1);vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);vec3 g000=vec3(gx0.r,gy0.r,gz0.r),g100=vec3(gx0.g,gy0.g,gz0.g),g010=vec3(gx0.b,gy0.b,gz0.b),g110=vec3(gx0.a,gy0.a,gz0.a),g001=vec3(gx1.r,gy1.r,gz1.r),g101=vec3(gx1.g,gy1.g,gz1.g),g011=vec3(gx1.b,gy1.b,gz1.b),g111=vec3(gx1.a,gy1.a,gz1.a);vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.r;g010*=norm0.g;g100*=norm0.b;g110*=norm0.a;vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.r;g011*=norm1.g;g101*=norm1.b;g111*=norm1.a;float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.r,Pf0.gb)),n010=dot(g010,vec3(Pf0.r,Pf1.g,Pf0.b)),n110=dot(g110,vec3(Pf1.rg,Pf0.b)),n001=dot(g001,vec3(Pf0.rg,Pf1.b)),n101=dot(g101,vec3(Pf1.r,Pf0.g,Pf1.b)),n011=dot(g011,vec3(Pf0.r,Pf1.gb)),n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.b);vec2 n_yz=mix(n_z.rg,n_z.ba,fade_xyz.g);float n_xyz=mix(n_yz.r,n_yz.g,fade_xyz.r);return 2.2*n_xyz;}
`;
};

const CLIPPING = {

    vertex_pre: () => {
        return `
        out vec4 local_eyespace;
        out vec4 global_eyespace;`;
    },

    vertex: () => {
        return `
        local_eyespace = modelMatrix * vec4(a_position, 1.0);
        global_eyespace = viewMatrix * modelMatrix * vec4(a_position, 1.0);`;
    },

    fragment_pre: () => {
        return `
        in vec4 local_eyespace;
        in vec4 global_eyespace;`;
    },

    fragment: () => {
        return `
        if (localClipSettings.x > 0.0) {
            if(dot(local_eyespace, localClipPlane0) < 0.0) discard;
            if(dot(local_eyespace, localClipPlane1) < 0.0) discard;
            if(dot(local_eyespace, localClipPlane2) < 0.0) discard;
        }

        if (globalClipSettings.x > 0.0) {
            if(dot(global_eyespace, globalClipPlane0) < 0.0) discard;
            if(dot(global_eyespace, globalClipPlane1) < 0.0) discard;
            if(dot(global_eyespace, globalClipPlane2) < 0.0) discard;
        }`;
    },

};

const EXTENSIONS = {

    vertex: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return '';
        }
        return '';
    },

    fragment: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return '';
        }
        return `
        #extension GL_OES_standard_derivatives : enable`;
    },

};

function hard() {
    return `
    float hardShadow1(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;
        float shadow = texture(shadowMap, uv).r;

        float visibility = 1.0;
        float shadowAmount = 0.5;

        float cosTheta = clamp(dot(v_normal, vShadowCoord.xyz), 0.0, 1.0);
        float bias = 0.00005 * tan(acos(cosTheta)); // cosTheta is dot( n,l ), clamped between 0 and 1
        bias = clamp(bias, 0.0, 0.001);

        if (shadow < shadowCoord.z - bias){
            visibility = shadowAmount;
        }
        return visibility;
    }

    float hardShadow2(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;

        float lightDepth1 = texture(shadowMap, uv).r;
        float lightDepth2 = clamp(shadowCoord.z, 0.0, 1.0);
        float bias = 0.0001;

        return step(lightDepth2, lightDepth1+bias);
    }

    float hardShadow3(sampler2D shadowMap) {
        vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
        vec2 uv = shadowCoord.xy;

        float visibility = 1.0;
        float shadowAmount = 0.5;
        float bias = 0.00005;

        vec2 poissonDisk[16];
        poissonDisk[0] = vec2(-0.94201624, -0.39906216);
        poissonDisk[1] = vec2(0.94558609, -0.76890725);
        poissonDisk[2] = vec2(-0.094184101, -0.92938870);
        poissonDisk[3] = vec2(0.34495938, 0.29387760);
        poissonDisk[4] = vec2(-0.91588581, 0.45771432);
        poissonDisk[5] = vec2(-0.81544232, -0.87912464);
        poissonDisk[6] = vec2(-0.38277543, 0.27676845);
        poissonDisk[7] = vec2(0.97484398, 0.75648379);
        poissonDisk[8] = vec2(0.44323325, -0.97511554);
        poissonDisk[9] = vec2(0.53742981, -0.47373420);
        poissonDisk[10] = vec2(-0.26496911, -0.41893023);
        poissonDisk[11] = vec2(0.79197514, 0.19090188);
        poissonDisk[12] = vec2(-0.24188840, 0.99706507);
        poissonDisk[13] = vec2(-0.81409955, 0.91437590);
        poissonDisk[14] = vec2(0.19984126, 0.78641367);
        poissonDisk[15] = vec2(0.14383161, -0.14100790);

        for (int i=0;i<16;i++) {
            if ( texture(shadowMap, uv + poissonDisk[i]/700.0).r < shadowCoord.z-bias ){
                visibility -= 0.02;
            }
        }

        return visibility;
    }

    `;
}

const SHADOW = {
    vertex_pre: () => {
        return `
        uniform mat4 shadowMatrix;
        out vec4 vShadowCoord;`;
    },

    vertex: () => {
        return `
        vShadowCoord = shadowMatrix * modelMatrix * vec4(a_position, 1.0);`;
    },

    fragment_pre: () => {
        return `
        uniform sampler2D shadowMap;
        in vec4 vShadowCoord;

        ${hard()}`;
    },

    fragment: () => {
        return `
        // shadows
        float shadow = 1.0;

        // OPTION 1
        shadow = hardShadow1(shadowMap);

        base *= shadow;
        `;
    },

};



var chunks = /*#__PURE__*/Object.freeze({
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
const EPSILON = 0.000001;
let ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

const degree = Math.PI / 180;

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
  let out = new ARRAY_TYPE(9);
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
  let out = new ARRAY_TYPE(16);
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
  let out = new ARRAY_TYPE(16);
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
    let a01 = a[1], a02 = a[2], a03 = a[3];
    let a12 = a[6], a13 = a[7];
    let a23 = a[11];

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
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

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
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  // Cache only the current line of the second matrix
  let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
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
  let x = v[0], y = v[1], z = v[2];
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

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
  let x = v[0], y = v[1], z = v[2];

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
  let x = axis[0], y = axis[1], z = axis[2];
  let len = Math.sqrt(x * x + y * y + z * z);
  let s, c, t;
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  let b00, b01, b02;
  let b10, b11, b12;
  let b20, b21, b22;

  if (Math.abs(len) < EPSILON) { return null; }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
  a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
  a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

  // Construct the elements of the rotation matrix
  b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
  b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
  b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

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

  if (a !== out) { // If the source and destination differ, copy the unchanged last row
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
  let f = 1.0 / Math.tan(fovy / 2);
  let nf = 1 / (near - far);
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
  out[14] = (2 * far * near) * nf;
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
  let lr = 1 / (left - right);
  let bt = 1 / (bottom - top);
  let nf = 1 / (near - far);
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
  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  let eyex = eye[0];
  let eyey = eye[1];
  let eyez = eye[2];
  let upx = up[0];
  let upy = up[1];
  let upz = up[2];
  let centerx = center[0];
  let centery = center[1];
  let centerz = center[2];

  if (Math.abs(eyex - centerx) < EPSILON &&
      Math.abs(eyey - centery) < EPSILON &&
      Math.abs(eyez - centerz) < EPSILON) {
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
  let eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];

  let z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];

  let len = z0*z0 + z1*z1 + z2*z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  let x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;

  len = x0*x0 + x1*x1 + x2*x2;
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
  let out = new ARRAY_TYPE(3);
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
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return Math.sqrt(x*x + y*y + z*z);
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
  let out = new ARRAY_TYPE(3);
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
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x*x + y*y + z*z;
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
  let ax = a[0], ay = a[1], az = a[2];
  let bx = b[0], by = b[1], bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

/**
 * Alias for {@link vec3.length}
 * @function
 */
const len = length;

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
const forEach = (function() {
  let vec = create$4();

  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 3;
    }

    if(!offset) {
      offset = 0;
    }

    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }

    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
    }

    return a;
  };
})();

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
  let out = new ARRAY_TYPE(4);
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
  let out = new ARRAY_TYPE(4);
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
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x*x + y*y + z*z + w*w;
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
const forEach$1 = (function() {
  let vec = create$5();

  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 4;
    }

    if(!offset) {
      offset = 0;
    }

    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }

    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
    }

    return a;
  };
})();

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
  let out = new ARRAY_TYPE(4);
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
  let s = Math.sin(rad);
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
  let rad = Math.acos(q[3]) * 2.0;
  let s = Math.sin(rad / 2.0);
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

  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = Math.sin(rad), bw = Math.cos(rad);

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

  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let by = Math.sin(rad), bw = Math.cos(rad);

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

  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bz = Math.sin(rad), bw = Math.cos(rad);

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
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];

  let omega, cosom, sinom, scale0, scale1;

  // calc cosine
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  // adjust signs (if necessary)
  if ( cosom < 0.0 ) {
    cosom = -cosom;
    bx = - bx;
    by = - by;
    bz = - bz;
    bw = - bw;
  }
  // calculate coefficients
  if ( (1.0 - cosom) > 0.000001 ) {
    // standard case (slerp)
    omega  = Math.acos(cosom);
    sinom  = Math.sin(omega);
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
  let fTrace = m[0] + m[4] + m[8];
  let fRoot;

  if ( fTrace > 0.0 ) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0);  // 2w
    out[3] = 0.5 * fRoot;
    fRoot = 0.5/fRoot;  // 1/(4w)
    out[0] = (m[5]-m[7])*fRoot;
    out[1] = (m[6]-m[2])*fRoot;
    out[2] = (m[1]-m[3])*fRoot;
  } else {
    // |w| <= 1/2
    let i = 0;
    if ( m[4] > m[0] )
      i = 1;
    if ( m[8] > m[i*3+i] )
      i = 2;
    let j = (i+1)%3;
    let k = (i+2)%3;

    fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
    out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
    out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
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
const normalize$2 = normalize$1;

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
const rotationTo = (function() {
  let tmpvec3 = create$4();
  let xUnitVec3 = fromValues$4(1,0,0);
  let yUnitVec3 = fromValues$4(0,1,0);

  return function(out, a, b) {
    let dot$$1 = dot(a, b);
    if (dot$$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001)
        cross(tmpvec3, yUnitVec3, a);
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
})();

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
const sqlerp = (function () {
  let temp1 = create$6();
  let temp2 = create$6();

  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));

    return out;
  };
}());

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
const setAxes = (function() {
  let matr = create$2();

  return function(out, view, right, up) {
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
})();

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
  let out = new ARRAY_TYPE(2);
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
const forEach$2 = (function() {
  let vec = create$8();

  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 2;
    }

    if(!offset) {
      offset = 0;
    }

    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }

    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1];
    }

    return a;
  };
})();

/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.4.0
 */

// pvt
function normalize$5(array) {
    return fromValues$4(
        array[0] / 255,
        array[1] / 255,
        array[2] / 255,
    );
}

function hexIntToRgb(hex) {
    const r = hex >> 16;
    const g = hex >> 8 & 0xFF; // eslint-disable-line
    const b = hex & 0xFF;
    return fromValues$4(r, g, b);
}

function hexStringToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? fromValues$4(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ) : null;
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(r, g, b) {
    const hexR = componentToHex(r);
    const hexG = componentToHex(g);
    const hexB = componentToHex(b);
    return `#${hexR}${hexG}${hexB}`;
}

function convert(hex) {
    const color = create$4();
    const rgb = typeof hex === 'number' ? hexIntToRgb(hex) : hexStringToRgb(hex);
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
    return (Math.random() * (max - min)) + min;
}

function mod(m, n) {
    return ((m % n) + n) % n;
}

var math = /*#__PURE__*/Object.freeze({
    randomRange: randomRange,
    mod: mod
});

const WORD_REGX = (word) => {
    return new RegExp(`\\b${word}\\b`, 'gi');
};

const LINE_REGX = (word) => {
    return new RegExp(`${word}`, 'gi');
};

const VERTEX = [
    {
        match: WORD_REGX('in'),
        replace: 'attribute',
    }, {
        match: WORD_REGX('out'),
        replace: 'varying',
    },
];

const FRAGMENT = [
    {
        match: WORD_REGX('in'),
        replace: 'varying',
    }, {
        match: LINE_REGX('out vec4 outColor;'),
        replace: '',
    }, {
        match: WORD_REGX('outColor'),
        replace: 'gl_FragColor',
    }, {
        match: WORD_REGX('textureProj'),
        replace: 'texture2DProj',
    }, {
        match: WORD_REGX('texture'),
        replace(shader) {
            // Find all texture defintions
            const textureGlobalRegx = new RegExp('\\btexture\\b', 'gi');

            // Find single texture definition
            const textureSingleRegx = new RegExp('\\btexture\\b', 'i');

            // Gets the texture call signature e.g texture(uTexture1, vUv);
            const textureUniformNameRegx = new RegExp(/texture\(([^)]+)\)/, 'i');

            // Get all matching occurances
            const matches = shader.match(textureGlobalRegx);
            let replacement = '';

            // If nothing matches return
            if (matches === null) return shader;

            // Replace each occurance by it's uniform type
            /* eslint-disable */
            for (const i of matches) {
                const match = shader.match(textureUniformNameRegx)[0];
                if (match) {
                    const uniformName = match.replace('texture(', '').split(',')[0];
                    let uniformType = shader.match(`(.*?) ${uniformName}`, 'i')[1].replace(/^\s+|\s+$/gm, '');
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
            return shader;
        },
    }];

const GENERIC = [{
    match: LINE_REGX('#version 300 es'),
    replace: '',
}];

const VERTEX_RULES = [...GENERIC, ...VERTEX];
const FRAGMENT_RULES = [...GENERIC, ...FRAGMENT];

/**
 * Replaces es300 syntax to es100
 */
function parse(shader, shaderType) {
    if (getContextType() === CONTEXT.WEBGL2) {
        return shader;
    }

    const rules = shaderType === 'vertex' ? VERTEX_RULES : FRAGMENT_RULES;
    rules.forEach((rule) => {
        if (typeof rule.replace === 'function') {
            shader = rule.replace(shader);
        } else {
            shader = shader.replace(rule.match, rule.replace);
        }
    });

    return shader; // .replace(/^\s+|\s+$/gm, '');
}



var utils = /*#__PURE__*/Object.freeze({
    color: color,
    math: math,
    glsl3to1: parse
});

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.data = fromValues$4(x, y, z);
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set x(value) {
        this.data[0] = value;
    }

    get x() {
        return this.data[0];
    }

    set y(value) {
        this.data[1] = value;
    }

    get y() {
        return this.data[1];
    }

    set z(value) {
        this.data[2] = value;
    }

    get z() {
        return this.data[2];
    }
}

let uuid = 0;
let axisAngle = 0;
const quaternionAxisAngle = create$4();

class Object3 {
    constructor() {
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
            lookAt: create$3(),
        };

        this.dirty = {
            sorting: false,
            transparent: false,
            attributes: false,
            shader: false,
        };

        this.sceneGraphSorter = false;
    }

    set transparent(value) {
        this.dirty.transparent = this.transparent !== value;
        this._transparent = value;
    }

    get transparent() {
        return this._transparent;
    }

    set visible(value) {
        this.dirty.sorting = this.visible !== value;
        this._visible = value;
    }

    get visible() {
        return this._visible;
    }

    updateMatrices() {
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

    init() {
        // to be overriden;
    }

    add(model) {
        model.parent = this;
        this.children.push(model);
        this.dirty.sorting = true;
    }

    remove(model) {
        const index = this.children.indexOf(model);
        if (index !== -1) {
            model.destroy();
            this.children.splice(index, 1);
            this.dirty.sorting = true;
        }
    }

    traverse(object) {
        // if traversed object is the scene
        if (object === undefined) {
            object = this;
            this.sceneGraphSorter = true;
        }

        for (let i = 0; i < object.children.length; i++) {
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
        if (object.dirty.sorting ||
            object.dirty.transparent) {
            object.dirty.transparent = false;
            this.sceneGraphSorter = true;
        }

        return this.sceneGraphSorter;
    }
}

class OrthographicCamera extends Object3 {
    constructor(params = {}) {
        super();

        Object.assign(this, {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: -1000,
            far: 1000,
        }, params);

        this.matrices.projection = create$3();
    }

    lookAt(v) {
        copy$4(this.target, v);
    }

    updateCameraMatrix() {
        // left, right, bottom, top, near, far
        ortho(
            this.matrices.projection,
            this.left,
            this.right,
            this.bottom,
            this.top,
            this.near,
            this.far,
        );
    }
}

class PerspectiveCamera extends Object3 {
    constructor(params = {}) {
        super();

        Object.assign(this, {
            near: 1,
            far: 1000,
            fov: 35,
        }, params);

        this.matrices.projection = create$3();
    }

    lookAt(v) {
        copy$4(this.target, v);
    }

    updateCameraMatrix(width, height) {
        perspective(
            this.matrices.projection,
            this.fov * (Math.PI / 180),
            width / height,
            this.near,
            this.far,
        );
    }
}



var cameras = /*#__PURE__*/Object.freeze({
    Orthographic: OrthographicCamera,
    Perspective: PerspectiveCamera
});

class Basic {
    constructor(props = {}) {
        const color = props.color || fromValues$4(1, 1, 1);

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;

            ${UBO.scene()}
            ${UBO.model()}

            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            ${UBO.scene()}

            uniform vec3 u_color;

            out vec4 outColor;

            void main() {
                vec4 base = vec4(u_color, 1.0);

                ${FOG.linear()}

                outColor = base;
            }
        `;

        return Object.assign({
            type: SHADER_BASIC,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES,
        }, {
            vertex,
            fragment,
            uniforms: {
                u_color: {
                    type: 'vec3',
                    value: color,
                },
            },
        });
    }
}

class Texture {
    constructor(props = {}) {
        const gl = getContext();

        Object.assign(this, {
            magFilter: gl.NEAREST,
            minFilter: gl.NEAREST,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            transparent: false,
        }, props);

        const data = new Uint8Array([255, 255, 255, 255]);
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

    fromImage(url) {
        const img = new Image();
        img.crossOrigin = '';
        img.onload = () => {
            this.update(img);
        };
        img.src = url;
    }

    update(image) {
        const gl = getContext();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

class Default {
    constructor(props = {}) {
        const color = props.color || fromValues$4(1, 1, 1);
        this.map = new Texture({ transparent: true });

        // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/620678/red.jpg'.
        if (props.map) {
            this.map.fromImage(props.map);
        }

        // texture: new Texture()
        if (props.texture) {
            this.map = props.texture;
        }

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;
            in vec3 a_normal;
            in vec2 a_uv;

            ${UBO.scene()}
            ${UBO.model()}
            ${CLIPPING.vertex_pre()}
            ${SHADOW.vertex_pre()}

            out vec3 fragVertexEc;
            out vec2 v_uv;
            out vec3 v_normal;

            void main() {
                vec4 worldPosition = modelMatrix * vec4(a_position, 1.0);
                vec4 position = projectionMatrix * viewMatrix * worldPosition;
                gl_Position = position;

                fragVertexEc = position.xyz; // worldPosition.xyz;
                v_uv = a_uv;
                v_normal = (normalMatrix * vec4(a_normal, 1.0)).xyz;

                ${SHADOW.vertex()}
                ${CLIPPING.vertex()}
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            in vec3 fragVertexEc;
            in vec2 v_uv;
            in vec3 v_normal;

            ${CLIPPING.fragment_pre()}

            ${UBO.scene()}
            ${UBO.model()}
            ${UBO.lights()}

            uniform sampler2D u_map;
            uniform vec3 u_color;

            ${SHADOW.fragment_pre()}

            out vec4 outColor;

            void main() {
                vec3 v_normal = normalize(cross(dFdx(fragVertexEc), dFdy(fragVertexEc)));

                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);
                base += vec4(u_color, 1.0);
                base *= texture(u_map, v_uv);

                ${SHADOW.fragment()}
                ${LIGHT.factory()}
                ${FOG.linear()}
                ${CLIPPING.fragment()}

                outColor = base;
            }
        `;

        return Object.assign({
            type: SHADER_DEFAULT,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES,
        }, {
            vertex,
            fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture,
                },

                u_color: {
                    type: 'vec3',
                    value: color,
                },
            },
        });
    }
}

class Billboard {
    constructor(props = {}) {
        this.map = new Texture();

        if (props.map) {
            this.map.fromImage(props.map);
        }

        if (props.texture) {
            this.map = props.texture;
        }

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;
            in vec2 a_uv;

            ${UBO.scene()}
            ${UBO.model()}

            out vec2 v_uv;

            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
                v_uv = a_uv;
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            in vec2 v_uv;

            ${UBO.scene()}

            uniform sampler2D u_map;

            out vec4 outColor;

            void main() {
                // depth map
                float z = texture(u_map, v_uv).r;
                float n = 1.0;
                float f = 1000.0;
                float c = (2.0 * n) / (f + n - z * (f - n));

                // draw depth
                outColor = vec4(c);
            }
        `;

        return Object.assign({
            type: SHADER_BILLBOARD,
            mode: DRAW.TRIANGLES,
        }, {
            vertex,
            fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture,
                },
            },
        });
    }
}

class Sem {
    constructor(props = {}) {
        this.map = new Texture({ transparent: true });

        if (props.map) {
            this.map.fromImage(props.map);
        }

        // texture: new Texture()
        if (props.texture) {
            this.map = props.texture;
        }

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;
            in vec3 a_normal;
            in vec2 a_uv;

            ${UBO.scene()}
            ${UBO.model()}
            ${CLIPPING.vertex_pre()}

            out vec2 v_uv;

            void main() {
                vec4 position = viewMatrix * modelMatrix * vec4(a_position, 1.0);
                gl_Position = projectionMatrix * position;

                vec3 v_e = vec3(position);
                vec3 v_n = mat3(viewMatrix * modelMatrix) * a_normal;
                vec3 r = reflect(normalize(v_e), normalize(v_n));
                float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.0, 2.0));
                v_uv = r.xy / m + 0.5;

                ${CLIPPING.vertex()}
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            in vec2 v_uv;

            ${CLIPPING.fragment_pre()}

            ${UBO.scene()}
            ${UBO.model()}
            ${UBO.lights()}

            uniform sampler2D u_map;

            out vec4 outColor;

            void main() {
                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);

                base += texture(u_map, v_uv);

                ${FOG.linear()}
                ${CLIPPING.fragment()}

                outColor = base;
            }
        `;

        return Object.assign({
            type: SHADER_SEM,
        }, {
            vertex,
            fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture,
                },
            },
        });
    }
}



var shaders = /*#__PURE__*/Object.freeze({
    Basic: Basic,
    Default: Default,
    Billboard: Billboard,
    Sem: Sem
});

const PROGRAM_POOL = {};

function createShader(gl, str, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {
        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);
        console.error(error, str);
        throw new Error(error);
    }

    return shader;
}

const createProgram = (gl, vertex, fragment, programID) => {
    const pool = PROGRAM_POOL[`pool_${programID}`];
    if (!pool) {
        const vs = createShader(gl, vertex, gl.VERTEX_SHADER);
        const fs = createShader(gl, fragment, gl.FRAGMENT_SHADER);

        const program = gl.createProgram();

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        PROGRAM_POOL[`pool_${programID}`] = program;

        return program;
    }

    return pool;
};

class Ubo {
    constructor(data, boundLocation) {
        const gl = getContext();
        this.boundLocation = boundLocation;

        this.data = new Float32Array(data);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, this.data, gl.STATIC_DRAW); // DYNAMIC_DRAW
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    bind() {
        const gl = getContext();
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
        // gl.bindBufferBase(gl.UNIFORM_BUFFER, null); // MAYBE?
    }

    update(data, offset = 0) {
        const gl = getContext();

        this.data.set(data, offset);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.data, 0, null);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }
}

class Vao {
    constructor() {
        const gl = getContext();
        const { vertexArrayObject } = supports();

        if (getContextType() === CONTEXT.WEBGL2) {
            this.vao = gl.createVertexArray();
            gl.bindVertexArray(this.vao);
        } else if (vertexArrayObject) {
            this.vao = supports().vertexArrayObject.createVertexArrayOES();
            vertexArrayObject.bindVertexArrayOES(this.vao);
        }
    }

    bind() {
        const gl = getContext();
        const { vertexArrayObject } = supports();

        if (getContextType() === CONTEXT.WEBGL2) {
            gl.bindVertexArray(this.vao);
        } else if (vertexArrayObject) {
            vertexArrayObject.bindVertexArrayOES(this.vao);
        }
    }

    unbind() {
        const gl = getContext();
        const { vertexArrayObject } = supports();

        if (getContextType() === CONTEXT.WEBGL2) {
            gl.bindVertexArray(null);
        } else if (vertexArrayObject) {
            vertexArrayObject.bindVertexArrayOES(null);
        }
    }

    destroy() {
        const gl = getContext();
        const { vertexArrayObject } = supports();

        if (getContextType() === CONTEXT.WEBGL2) {
            gl.deleteVertexArray(this.vao);
        } else if (vertexArrayObject) {
            vertexArrayObject.deleteVertexArrayOES(this.vao);
        }
        this.vao = null;
    }
}

const getTypeSize = (type) => {
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
        throw new Error(`"${type}" is an unknown type`);
    }
};

const initAttributes = (attributes, program) => {
    const gl = getContext();

    for (const prop in attributes) {
        const current = attributes[prop];
        const location = gl.getAttribLocation(program, prop);

        let b = current.buffer;
        if (!current.buffer) {
            b = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, current.value, gl.STATIC_DRAW); // or DYNAMIC_DRAW
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        Object.assign(current, {
            location,
            buffer: b,
        });
    }
};

const bindAttributes = (attributes) => {
    const gl = getContext();

    Object.keys(attributes).forEach((key) => {
        const {
            location,
            buffer,
            size,
            instanced,
        } = attributes[key];

        if (location !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(location);

            const divisor = instanced ? 1 : 0;
            if (getContextType() === CONTEXT.WEBGL2) {
                gl.vertexAttribDivisor(location, divisor);
            } else {
                supports().instancedArrays.vertexAttribDivisorANGLE(location, divisor);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    });
};

const updateAttributes = (attributes) => {
    const gl = getContext();
    Object.keys(attributes).forEach((key) => {
        const {
            location,
            buffer,
            value,
        } = attributes[key];

        if (location !== -1) {
            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    });
};

const initUniforms = (uniforms, program) => {
    const gl = getContext();

    const textureIndices = [
        gl.TEXTURE0,
        gl.TEXTURE1,
        gl.TEXTURE2,
        gl.TEXTURE3,
        gl.TEXTURE4,
        gl.TEXTURE5,
    ];

    let i = 0;

    Object.keys(uniforms).forEach((prop) => {
        const current = uniforms[prop];
        const location = gl.getUniformLocation(program, prop);

        Object.assign(current, {
            location,
        });

        if (current.type === 'sampler2D') {
            current.textureIndex = i;
            current.activeTexture = textureIndices[i];
            i++;
        }
    });
};

const updateUniforms = (uniforms) => {
    const gl = getContext();
    Object.keys(uniforms).forEach((key) => {
        const uniform = uniforms[key];

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
            throw new Error(`"${uniform.type}" is an unknown uniform type`);
        }
    });
};

// used for speed optimisation
let WEBGL2 = false;

class Model extends Object3 {
    constructor() {
        super();

        this.attributes = {};
        this.uniforms = {};

        // z fight
        this.polygonOffset = false;
        this.polygonOffsetFactor = 0;
        this.polygonOffsetUnits = 1;

        // clipping planes
        this.clipping = {
            enable: false,
            planes: [
                create$5(),
                create$5(),
                create$5(),
            ],
        };

        // instancing
        this.instanceCount = 0;
        this.isInstance = false;

        // rendering mode
        this.mode = DRAW.TRIANGLES;

        // rendering side
        this.side = SIDE.FRONT;

        // type
        this.type = String(SHADER_CUSTOM);

        // creates shadow
        this.shadows = true;
    }

    setAttribute(name, type, value) {
        const size = getTypeSize(type);
        this.attributes[name] = {
            value,
            size,
        };
    }

    setIndex(value) {
        this.indices = {
            value,
        };
    }

    setUniform(name, type, value) {
        this.uniforms[name] = {
            value,
            type,
        };
    }

    setShader(vertex, fragment) {
        this.vertex = vertex;
        this.fragment = fragment;
    }

    setInstanceAttribute(name, type, value) {
        const size = getTypeSize(type);
        this.attributes[name] = {
            value,
            size,
            instanced: true,
        };
    }

    setInstanceCount(value) {
        this.instanceCount = value;
        if (this.instanceCount > 0) {
            this.isInstance = true;
        } else {
            this.isInstance = false;
        }
    }

    init() {
        const gl = getContext();

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

    destroy() {
        this.program = null;
    }

    bind() {
        const gl = getContext();

        bindAttributes(this.attributes, this.program);

        if (this.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices.value, gl.STATIC_DRAW);
        }
    }

    unbind() {
        const gl = getContext();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    update(inShadowMap) {
        const gl = getContext();

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

    draw() {
        const gl = getContext();

        if (this.isInstance) {
            if (WEBGL2) {
                gl.drawElementsInstanced(
                    this.mode,
                    this.indices.value.length,
                    gl.UNSIGNED_SHORT,
                    0,
                    this.instanceCount,
                );
            } else {
                supports().instancedArrays.drawElementsInstancedANGLE(
                    this.mode,
                    this.indices.value.length,
                    gl.UNSIGNED_SHORT,
                    0,
                    this.instanceCount,
                );
            }
        } else if (this.indices) {
            gl.drawElements(this.mode, this.indices.value.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(this.mode, 0, this.attributes.a_position.value.length / 3);
        }
    }
}

let shaderID = 0;
class Mesh extends Model {
    constructor(params = {}) {
        super();

        this._shader = null;

        const {
            positions,
            indices,
            normals,
            uvs,
        } = params.geometry;

        const {
            vertex,
            fragment,
            uniforms,
            type,
            mode,
        } = params.shader || new Default({ color: params.color, map: params.map });

        // if there's a type, assign it, so we can sort by type in the renderer.
        if (type !== undefined) {
            this.type = type;
        } else {
            this.type = `${SHADER_CUSTOM}-${shaderID++}`;
        }

        if (mode !== undefined) {
            this.mode = mode;
        }

        this.setAttribute('a_position', 'vec3', new Float32Array(positions));
        if (indices) {
            this.setIndex(new Uint16Array(indices));
        }
        if (normals) {
            this.setAttribute('a_normal', 'vec3', new Float32Array(normals));
        }
        if (uvs) {
            this.setAttribute('a_uv', 'vec2', new Float32Array(uvs));
        }

        Object.keys(uniforms).forEach((key) => {
            this.setUniform(key, uniforms[key].type, uniforms[key].value);
        });

        this.setShader(vertex, fragment);
    }

    set shader(shader) {
        this.dirty.shader = true;
        this._shader = shader;
        if (shader.type !== undefined) {
            this.type = shader.type;
        } else {
            this.type = SHADER_CUSTOM;
        }
        this.setShader(shader.vertex, shader.fragment);
    }

    get shader() {
        return this._shader;
    }
}

class AxisHelper extends Model {
    constructor(props = {}) {
        super();

        const size = (props && props.size) || 10;
        const g1 = { positions: [...fromValues$4(0, 0, 0), ...fromValues$4(size, 0, 0)] };
        const g2 = { positions: [...fromValues$4(0, 0, 0), ...fromValues$4(0, size, 0)] };
        const g3 = { positions: [...fromValues$4(0, 0, 0), ...fromValues$4(0, 0, size)] };

        const m1 = new Basic({ color: fromValues$4(1, 0, 0), wireframe: true });
        const m2 = new Basic({ color: fromValues$4(0, 1, 0), wireframe: true });
        const m3 = new Basic({ color: fromValues$4(0, 0, 1), wireframe: true });


        const x = new Mesh({ geometry: g1, shader: m1 });
        this.add(x);

        const y = new Mesh({ geometry: g2, shader: m2 });
        this.add(y);

        const z = new Mesh({ geometry: g3, shader: m3 });
        this.add(z);
    }
}

// import { DRAW } from '../constants';

class AxisHelper$1 extends Model {
    constructor(props = {}) {
        super();

        const size = (props && props.size) || 1;
        const geometry = {
            positions: [],
        };

        // extract geometry
        const sx = props.model.scale.x;
        const sy = props.model.scale.y;
        const sz = props.model.scale.z;

        const length$$1 = props.model.attributes.a_normal.value.length / 3;
        for (let i = 0; i < length$$1; i++) {
            const i3 = i * 3;
            const v0x = sx * props.model.attributes.a_position.value[i3 + 0];
            const v0y = sy * props.model.attributes.a_position.value[i3 + 1];
            const v0z = sz * props.model.attributes.a_position.value[i3 + 2];
            const nx = props.model.attributes.a_normal.value[i3 + 0];
            const ny = props.model.attributes.a_normal.value[i3 + 1];
            const nz = props.model.attributes.a_normal.value[i3 + 2];
            const v1x = v0x + (size * nx);
            const v1y = v0y + (size * ny);
            const v1z = v0z + (size * nz);
            geometry.positions = geometry.positions.concat([v0x, v0y, v0z, v1x, v1y, v1z]);
        }

        const shader = new Basic({ color: fromValues$4(0, 1, 1), wireframe: true });
        const n = new Mesh({ geometry, shader });
        this.add(n);

        this.reference = props.model;
        // mode = DRAW.LINES
    }

    update() {
        super.update();

        copy$4(this.position.data, this.reference.position.data);
        copy$4(this.rotation.data, this.reference.rotation.data);
        this.lookToTarget = this.reference.lookToTarget;
    }
}



var helpers = /*#__PURE__*/Object.freeze({
    Axis: AxisHelper,
    Normals: AxisHelper$1
});

function resize(domElement, width, height, ratio) {
    domElement.width = width * ratio;
    domElement.height = height * ratio;
    domElement.style.width = `${width}px`;
    domElement.style.height = `${height}px`;
}

function unsupported() {
    const div = document.createElement('div');
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

class Light {
    constructor() {
        this.position = create$4();
    }

    destroy() {
        // TODO
    }
}

class Directional extends Light {
    constructor(props = {}) {
        super();

        this.type = DIRECTIONAL_LIGHT;

        this.color = props.color || fromValues$4(1, 1, 1);
        this.intensity = props.intensity || 0.989;
    }
}

class Scene extends Object3 {
    constructor() {
        super();

        this.lights = {
            directional: [],
        };

        this.fog = {
            enable: false,
            color: fromValues$5(0, 0, 0, 1),
            start: 500,
            end: 1000,
            density: 0.00025,
        };

        this.clipping = {
            enable: false,
            planes: [
                create$5(),
                create$5(),
                create$5(),
            ],
        };

        // add sun
        const directional = new Directional({
            near: 1,
            far: 1000,
        });
        directional.position[0] = 125;
        directional.position[1] = 250;
        directional.position[2] = 500;
        this.addLight(directional);
    }

    addLight(light) {
        switch (light.type) {
        case DIRECTIONAL_LIGHT:
            this.lights.directional.push(light);
            break;
        default:
            // unsupported light
        }
    }

    removeLight(light) {
        const index = this.lights.directional.indexOf(light);
        if (index !== -1) {
            light.destroy();
            this.lights.directional.splice(index, 1);
        }
    }
}

class RenderTarget {
    constructor(props = {}) {
        const gl = getContext();

        // some default props
        Object.assign(this, {
            width: 512,
            height: 512,
            internalformat: gl.DEPTH_COMPONENT,
            type: gl.UNSIGNED_SHORT,
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
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );

        // depth texture
        this.depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            this.internalformat,
            this.width,
            this.height,
            0,
            gl.DEPTH_COMPONENT,
            this.type,
            null,
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture,
            0,
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthTexture,
            0,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    setSize(width, height) {
        const gl = getContext();
        this.width = width;
        this.height = height;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            this.internalformat,
            this.width,
            this.height,
            0,
            gl.DEPTH_COMPONENT,
            this.type,
            null,
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

class ShadowMapRenderer {
    constructor(props = {}) {
        // size of texture
        this.width = props.width || 1024;
        this.height = props.height || 1024;

        // create render target
        const { width, height } = this;
        this.rt = new RenderTarget({ width, height });

        // matrices
        this.matrices = {
            view: create$3(),
            shadow: create$3(),
            bias: fromValues$3(
                0.5, 0.0, 0.0, 0.0,
                0.0, 0.5, 0.0, 0.0,
                0.0, 0.0, 0.5, 0.0,
                0.5, 0.5, 0.5, 1.0,
            ),
        };

        // origin of directional light
        this.camera = new PerspectiveCamera({
            fov: 60,
            near: 1,
            far: 1000,
        });

        this.camera = new OrthographicCamera();
        this.camera.position.z = 1; // TODO: remove this when fix lookAt bug on gl-matrix
        this.setLightOrigin(props.light || fromValues$4(100, 250, 500));
    }

    // move the camera to the light position
    setLightOrigin(vec) {
        // CAMERA

        // update camera position
        copy$4(this.camera.position.data, vec);

        // update view matrix
        identity$3(this.matrices.view);
        lookAt(
            this.matrices.view,
            this.camera.position.data,
            this.camera.target,
            this.camera.up,
        );

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
}

let lastProgram;

let sort = false;
const startTime = Date.now();
let WEBGL2$1 = false;

const time = create$5();
const fog = create$5();

const matrices = {
    view: create$3(),
    normal: create$3(),
    modelView: create$3(),
    inversedModelView: create$3(),
};

let cachedScene = null; // scene
let cachedCamera = null; // camera

class Renderer {
    constructor(props = {}) {
        this.supported = false;

        this.sorted = {
            opaque: [],
            transparent: [],
            shadow: [],
        };

        this.performance = {
            opaque: 0,
            transparent: 0,
            shadow: 0,
            vertices: 0,
            instances: 0,
        };

        this.ratio = props.ratio || window.devicePixelRatio;
        this.shadows = props.shadows || false;
        this.domElement = props.canvas || document.createElement('canvas');

        const contextType = setContextType(props.contextType);
        const gl = this.domElement.getContext(contextType, Object.assign({}, {
            antialias: false,
        }, props));

        const session = supports();

        if (gl &&
            ((session.vertexArrayObject &&
            session.instancedArrays &&
            session.standardDerivatives &&
            session.depthTextures) || window.gli !== null)
        ) {
            if (props.greeting !== false) {
                const lib = 'color:#666;font-size:x-small;font-weight:bold;';
                const parameters = 'color:#777;font-size:x-small';
                const values = 'color:#f33;font-size:x-small';
                const args = [
                    `%c${library} - %cversion: %c${version} %crunning: %c${gl.getParameter(gl.VERSION)}`,
                    lib, parameters, values, parameters, values,
               ];

                console.log(...args);
            }

            setContext(gl);

            WEBGL2$1 = getContextType() === CONTEXT.WEBGL2;

            this.init();
        } else {
            this.domElement = unsupported();
        }
    }

    init() {
        this.supported = true;

        if (WEBGL2$1) {
            this.perScene = new Ubo([
                ...create$3(), // projection matrix
                ...create$3(), // view matrix
                ...fog, // fog vec4(use_fog, start, end, density)
                ...create$5(), // fog color
                ...time, // vec4(iGlobalTime, EMPTY, EMPTY, EMPTY)
                ...create$5(), // global clip settings (use_clipping, EMPTY, EMPTY, EMPTY);
                ...create$5(), // global clipping plane 0
                ...create$5(), // global clipping plane 1
                ...create$5(), // global clipping plane 2
            ], 0);

            this.perModel = new Ubo([
                ...create$3(), // model matrix
                ...create$3(), // normal matrix
                ...create$5(), // local clip settings (use_clipping, EMPTY, EMPTY, EMPTY);
                ...create$5(), // local clipping plane 0
                ...create$5(), // local clipping plane 1
                ...create$5(), // local clipping plane 2
            ], 1);

            this.directional = new Ubo(new Float32Array(MAX_DIRECTIONAL * 12), 2);
        }

        // shadows
        this.shadowmap = new ShadowMapRenderer();
    }

    setSize(width, height) {
        if (!this.supported) return;
        resize(this.domElement, width, height, this.ratio);
    }

    setRatio(value) {
        this.ratio = value;
    }

    changeProgram(program) {
        const gl = getContext();
        gl.useProgram(program);

        if (WEBGL2$1) {
            const sLocation = gl.getUniformBlockIndex(program, 'perScene');
            const mLocation = gl.getUniformBlockIndex(program, 'perModel');
            const dLocation = gl.getUniformBlockIndex(program, 'directional');
            gl.uniformBlockBinding(program, sLocation, this.perScene.boundLocation);
            gl.uniformBlockBinding(program, mLocation, this.perModel.boundLocation);

            // is directional light in shader
            if (dLocation === this.directional.boundLocation) {
                gl.uniformBlockBinding(program, dLocation, this.directional.boundLocation);
            }
        }
    }

    draw(scene, camera, width, height) {
        if (!this.supported) return;
        // only necessary for webgl1 compatibility.
        cachedScene = scene;
        cachedCamera = camera;

        const gl = getContext();

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

            this.perScene.update([
                ...camera.matrices.projection,
                ...matrices.view,
                ...fog,
                ...scene.fog.color,
                ...time,
                ...[scene.clipping.enable, 0, 0, 0],
                ...scene.clipping.planes[0],
                ...scene.clipping.planes[1],
                ...scene.clipping.planes[2],
            ]);

            for (let i = 0; i < scene.lights.directional.length; i++) {
                this.directional.update([
                    ...[...scene.lights.directional[i].position, 0],
                    ...[...scene.lights.directional[i].color, 0],
                    ...[scene.lights.directional[i].intensity, 0, 0, 0],
                ], i * 12);
            }
        }

        // update light in shadowmap
        this.shadowmap.setLightOrigin(scene.lights.directional[0].position);

        // 1) render objects to shadowmap
        if (this.renderShadow) {
            for (let i = 0; i < this.sorted.shadow.length; i++) {
                this.renderObject(this.sorted.shadow[i], this.sorted.shadow[i].program, true);
            }
            // return;
        }

        // 2) render opaque objects
        for (let i = 0; i < this.sorted.opaque.length; i++) {
            this.renderObject(this.sorted.opaque[i], this.sorted.opaque[i].program);
        }

        // 3) sort and render transparent objects
        // expensive to sort transparent items per z-index.
        this.sorted.transparent.sort((a, b) => {
            return (a.position.z - b.position.z);
        });

        for (let i = 0; i < this.sorted.transparent.length; i++) {
            this.renderObject(this.sorted.transparent[i], this.sorted.transparent[i].program);
        }

        // 4) render gui
        // TODO
    }

    rtt({
        renderTarget,
        scene,
        camera,
        clearColor = [0, 0, 0, 1],
    }) { // maybe order is important
        if (!this.supported) return;

        const gl = getContext();

        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.frameBuffer);

        gl.viewport(0, 0, renderTarget.width, renderTarget.height);
        gl.clearColor(...clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.draw(scene, camera, renderTarget.width, renderTarget.height);

        gl.bindTexture(gl.TEXTURE_2D, renderTarget.texture);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render(scene, camera) {
        if (!this.supported) return;
        const gl = getContext();

        // render shadows
        if (this.shadows) {
            // render scene to texture
            this.renderShadow = true;
            this.rtt({
                renderTarget: this.shadowmap.rt,
                scene,
                camera: this.shadowmap.camera,
                clearColor: [1, 1, 1, 1],
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

    updateMatrices(matrix) {
        identity$3(matrices.modelView);
        copy$3(matrices.modelView, matrix);
        invert$3(matrices.inversedModelView, matrices.modelView);
        transpose$2(matrices.inversedModelView, matrices.inversedModelView);
        identity$3(matrices.normal);
        copy$3(matrices.normal, matrices.inversedModelView);
    }

    sort(object) {
        for (let i = 0; i < object.children.length; i++) {
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

    renderObject(object, program, inShadowMap = false) {
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

    initUniformsPerModel(object) {
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

    updateUniformsPerModel(object) {
        if (WEBGL2$1) {
            this.perModel.update([
                ...object.matrices.model,
                ...matrices.normal,
                ...[object.clipping.enable, 0, 0, 0],
                ...object.clipping.planes[0],
                ...object.clipping.planes[1],
                ...object.clipping.planes[2],
            ]);
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
}

class Pass {
    constructor(props) {
        this.scene = new Scene();

        const { vertex, fragment, uniforms } = props;

        this.vertex = vertex;
        this.fragment = fragment;
        this.uniforms = uniforms;

        this.enable = true;
    }

    compile() {
        const shader = {
            vertex: `#version 300 es
                in vec3 a_position;
                in vec3 a_normal;
                in vec2 a_uv;

                ${UBO.scene()}
                ${UBO.model()}

                ${this.vertex}`,

            fragment: `#version 300 es
                precision highp float;
                precision highp int;

                ${UBO.scene()}
                ${UBO.model()}

                out vec4 outColor;
                ${this.fragment}`,
            uniforms: this.uniforms,
        };

        const geometry = {
            positions: [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0],
            indices: [0, 1, 2, 0, 2, 3],
            uvs: [0, 0, 1, 0, 1, 1, 0, 1],
        };
        this.quad = new Mesh({ geometry, shader });
        this.scene.add(this.quad);
    }

    setUniform(key, value) {
        this.quad.uniforms[key].value = value;
    }
}

const Basic$1 = {

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

class Composer {
    constructor(props) {
        this.renderer = new Renderer(props);
        this.domElement = this.renderer.domElement;

        this.camera = new OrthographicCamera();
        this.camera.position.z = 100;

        this.passes = [];

        this.clearColor = fromValues$5(0, 0, 0, 1);

        this.screen = new Pass(Basic$1);
        this.screen.compile();

        this.buffers = [
            new RenderTarget(),
            new RenderTarget(),
        ];

        this.read = this.buffers[1];
        this.write = this.buffers[0];
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this.read.setSize(width, height);
        this.write.setSize(width, height);
    }

    setRatio(ratio) {
        this.renderer.setRatio(ratio);
    }

    pass(pass) {
        this.passes.push(pass);
    }

    compile() {
        for (let i = 0; i < this.passes.length; i++) {
            this.passes[i].compile();
        }
    }

    renderToTexture(renderTarget, scene, camera) {
        this.renderer.rtt({
            renderTarget,
            scene,
            camera,
            clearColor: this.clearColor,
        });
    }

    resetBuffers() {
        this.read = this.buffers[1];
        this.write = this.buffers[0];
    }

    swapBuffers() {
        this.temp = this.read;
        this.read = this.write;
        this.write = this.temp;
    }

    render(scene, camera) {
        this.resetBuffers();
        this.renderToTexture(this.write, scene, camera);

        // ping pong textures through passes
        const total = this.passes.length;
        for (let i = 0; i < total; i++) {
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
}

class Performance {
    constructor(params = {}) {
        this.theme = params.theme || {
            font: 'font-family:sans-serif;font-size:xx-small;font-weight:bold;line-height:15px;-moz-osx-font-smoothing: grayscale;-webkit-font-smoothing: antialiased;',
            color1: '#242424',
            color2: '#2a2a2a',
            color3: '#666',
            color4: '#999',
        };

        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;bottom:0;left:0;min-width:80px;opacity:0.9;z-index:10000;';

        this.holder = document.createElement('div');
        this.holder.style.cssText = `padding:3px;background-color:${this.theme.color1};`;
        container.appendChild(this.holder);

        const title = document.createElement('div');
        title.style.cssText = `${this.theme.font};color:${this.theme.color3};`;
        title.innerHTML = 'Performance';
        this.holder.appendChild(title);

        this.msTexts = [];

        this.domElement = container;
    }

    rebuild(params) {
        this.msTexts = [];
        Object.keys(params).forEach((key) => {
            const element = document.createElement('div');
            element.style.cssText = `${this.theme.font};color:${this.theme.color4};background-color:${this.theme.color2};`;
            this.holder.appendChild(element);
            this.msTexts[key] = element;
        });
    }

    update(renderer) {
        if (Object.keys(this.msTexts).length !== Object.keys(renderer.performance).length) {
            this.rebuild(renderer.performance);
        }

        Object.keys(renderer.performance).forEach((key) => {
            this.msTexts[key].textContent = `${key}: ${renderer.performance[key]}`;
        });
    }
}

var index = {
    chunks,
    utils,
    cameras,
    shaders,
    helpers,

    constants,

    Renderer,
    Object3,
    Scene,
    Model,
    Mesh,
    Texture,
    RenderTarget,

    Composer,
    Pass,

    Performance,
};

// TODO:
// change import * as blablabla to export * as blablabla and remove the final default export

export default index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5tb2R1bGUuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9saWdodC5qcyIsIi4uL3NyYy9zaGFkZXJzL2NodW5rcy9mb2cuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL3Nlc3Npb24uanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3MvdWJvLmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL25vaXNlLmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2NsaXBwaW5nLmpzIiwiLi4vc3JjL3NoYWRlcnMvY2h1bmtzL2V4dGVuc2lvbnMuanMiLCIuLi9zcmMvc2hhZGVycy9jaHVua3Mvc2hhZG93LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L2NvbW1vbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9tYXQyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDJkLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvbWF0NC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvcXVhdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9xdWF0Mi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWMyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4LmpzIiwiLi4vc3JjL3V0aWxzL2NvbG9yLmpzIiwiLi4vc3JjL3V0aWxzL21hdGguanMiLCIuLi9zcmMvdXRpbHMvZ2xzbC1wYXJzZXIuanMiLCIuLi9zcmMvY29yZS92ZWN0b3IzLmpzIiwiLi4vc3JjL2NvcmUvb2JqZWN0My5qcyIsIi4uL3NyYy9jYW1lcmFzL29ydGhvZ3JhcGhpYy5qcyIsIi4uL3NyYy9jYW1lcmFzL3BlcnNwZWN0aXZlLmpzIiwiLi4vc3JjL3NoYWRlcnMvYmFzaWMuanMiLCIuLi9zcmMvY29yZS90ZXh0dXJlLmpzIiwiLi4vc3JjL3NoYWRlcnMvZGVmYXVsdC5qcyIsIi4uL3NyYy9zaGFkZXJzL2JpbGxib2FyZC5qcyIsIi4uL3NyYy9zaGFkZXJzL3NlbS5qcyIsIi4uL3NyYy9nbC9wcm9ncmFtLmpzIiwiLi4vc3JjL2dsL3Viby5qcyIsIi4uL3NyYy9nbC92YW8uanMiLCIuLi9zcmMvZ2wvdHlwZXMuanMiLCIuLi9zcmMvZ2wvYXR0cmlidXRlcy5qcyIsIi4uL3NyYy9nbC91bmlmb3Jtcy5qcyIsIi4uL3NyYy9jb3JlL21vZGVsLmpzIiwiLi4vc3JjL2NvcmUvbWVzaC5qcyIsIi4uL3NyYy9oZWxwZXJzL2F4aXMuanMiLCIuLi9zcmMvaGVscGVycy9ub3JtYWwuanMiLCIuLi9zcmMvdXRpbHMvZG9tLmpzIiwiLi4vc3JjL2NvcmUvbGlnaHRzLmpzIiwiLi4vc3JjL2NvcmUvc2NlbmUuanMiLCIuLi9zcmMvY29yZS9ydC5qcyIsIi4uL3NyYy9jb3JlL3NoYWRvdy1tYXAtcmVuZGVyZXIuanMiLCIuLi9zcmMvY29yZS9yZW5kZXJlci5qcyIsIi4uL3NyYy9jb3JlL3Bhc3MuanMiLCIuLi9zcmMvcGFzc2VzL2Jhc2ljLmpzIiwiLi4vc3JjL2NvcmUvY29tcG9zZXIuanMiLCIuLi9zcmMvY29yZS9wZXJmb3JtYW5jZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBMSUdIVCA9IHtcbiAgICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgIC8vIGZhY3RvcnkgbGlnaHRcbiAgICAgICAgdmVjMyBpbnZlcnNlTGlnaHREaXJlY3Rpb24gPSBub3JtYWxpemUodmVjMygtMC4yNSwgLTAuMjUsIDEuMCkpO1xuICAgICAgICB2ZWMzIGRpcmVjdGlvbmFsQ29sb3IgPSB2ZWMzKG1heChkb3Qodl9ub3JtYWwsIGludmVyc2VMaWdodERpcmVjdGlvbiksIDAuMCkpO1xuICAgICAgICB2ZWMzIGZhY3RvcnkgPSBtaXgodmVjMygwLjApLCBkaXJlY3Rpb25hbENvbG9yLCAwLjk4OSk7IC8vIGxpZ2h0IGludGVuc2l0eVxuICAgICAgICBiYXNlLnJnYiAqPSBmYWN0b3J5O1xuXG4gICAgICAgICR7TElHSFQuZGlyZWN0aW9uYWwoKX1gO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25hbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgLy8gdmVjMyBkY29sb3IgPSB2ZWMzKDAuMDEpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGZvciAoaW50IGkgPSAwOyBpIDwgTUFYX0RJUkVDVElPTkFMOyBpKyspIHtcbiAgICAgICAgICAgIC8vICAgICB2ZWMzIGludmVyc2VMaWdodERpcmVjdGlvbiA9IG5vcm1hbGl6ZShkaXJlY3Rpb25hbExpZ2h0c1tpXS5kbFBvc2l0aW9uLnh5eik7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBsaWdodCA9IHZlYzMobWF4KGRvdCh2X25vcm1hbCwgaW52ZXJzZUxpZ2h0RGlyZWN0aW9uKSwgMC4wKSk7XG4gICAgICAgICAgICAvLyAgICAgdmVjMyBkaXJlY3Rpb25hbENvbG9yID0gZGlyZWN0aW9uYWxMaWdodHNbaV0uZGxDb2xvci5yZ2IgKiBsaWdodDtcbiAgICAgICAgICAgIC8vICAgICBkY29sb3IgKz0gbWl4KGRjb2xvciwgZGlyZWN0aW9uYWxDb2xvciwgZGlyZWN0aW9uYWxMaWdodHNbaV0uZmxJbnRlbnNpdHkpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gZGNvbG9yIC89IGZsb2F0KE1BWF9ESVJFQ1RJT05BTCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gYmFzZS5yZ2IgKj0gZGNvbG9yO1xuICAgICAgICBgO1xuICAgIH0sXG59O1xuXG5leHBvcnQge1xuICAgIExJR0hULFxufTtcbiIsImZ1bmN0aW9uIGJhc2UoKSB7XG4gICAgcmV0dXJuIGBcbiAgICBmbG9hdCBmb2dTdGFydCA9IGZvZ1NldHRpbmdzLnk7XG4gICAgZmxvYXQgZm9nRW5kID0gZm9nU2V0dGluZ3MuejtcbiAgICBmbG9hdCBmb2dEZW5zaXR5ID0gZm9nU2V0dGluZ3MuYTtcblxuICAgIGZsb2F0IGRpc3QgPSAwLjA7XG4gICAgZmxvYXQgZm9nRmFjdG9yID0gMC4wO1xuICAgIGRpc3QgPSBnbF9GcmFnQ29vcmQueiAvIGdsX0ZyYWdDb29yZC53O2A7XG59XG5cbmNvbnN0IEZPRyA9IHtcbiAgICBsaW5lYXI6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgaWYgKGZvZ1NldHRpbmdzLnggPiAwLjApIHtcbiAgICAgICAgICAgICR7YmFzZSgpfVxuICAgICAgICAgICAgZm9nRmFjdG9yID0gKGZvZ0VuZCAtIGRpc3QpIC8gKGZvZ0VuZCAtIGZvZ1N0YXJ0KTtcbiAgICAgICAgICAgIGZvZ0ZhY3RvciA9IGNsYW1wKGZvZ0ZhY3RvciwgMC4wLCAxLjApO1xuICAgICAgICAgICAgYmFzZSA9IG1peChmb2dDb2xvciwgYmFzZSwgZm9nRmFjdG9yKTtcbiAgICAgICAgfWA7XG4gICAgfSxcbiAgICBleHBvbmVudGlhbDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoZGlzdCAqIGZvZ0RlbnNpdHkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxuICAgIGV4cG9uZW50aWFsMjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAoZm9nU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgJHtiYXNlKCl9XG4gICAgICAgICAgICBmb2dGYWN0b3IgPSAxLjAgLyBleHAoKGRpc3QgKiBmb2dEZW5zaXR5KSAqIChkaXN0ICogZm9nRGVuc2l0eSkpO1xuICAgICAgICAgICAgZm9nRmFjdG9yID0gY2xhbXAoZm9nRmFjdG9yLCAwLjAsIDEuMCk7XG4gICAgICAgICAgICBiYXNlID0gbWl4KGZvZ0NvbG9yLCBiYXNlLCBmb2dGYWN0b3IpO1xuICAgICAgICB9YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBGT0csXG59O1xuIiwiLyoqXG4gKiBNYXggZGlyZWN0aW9uYWwgbGlnaHQgYWxsb3dlZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgTUFYX0RJUkVDVElPTkFMXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgTUFYX0RJUkVDVElPTkFMID0gMTtcblxuLyoqXG4gKiBkaXJlY3Rpb25hbCBsaWdodCBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgRElSRUNUSU9OQUxfTElHSFRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBESVJFQ1RJT05BTF9MSUdIVCA9IDEwMDA7XG5cbi8qKlxuICogYmFzaWMgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQkFTSUNcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfQkFTSUMgPSAyMDAwO1xuXG4vKipcbiAqIGRlZmF1bHQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfREVGQVVMVFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9ERUZBVUxUID0gMjAwMTtcblxuLyoqXG4gKiBiaWxsYm9hcmQgc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQklMTEJPQVJEXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0JJTExCT0FSRCA9IDIwMDI7XG5cbi8qKlxuICogc2hhZG93IHNoYWRlciBpZFxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0hBREVSX1NIQURPV1xuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFNIQURFUl9TSEFET1cgPSAyMDAzO1xuXG4vKipcbiAqIHNlbSBzaGFkZXIgaWRcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIFNIQURFUl9TRU1cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTSEFERVJfU0VNID0gMjAwNDtcblxuLyoqXG4gKiBjdXN0b20gc2hhZGVyIGlkXG4gKlxuICogQHN0YXRpY1xuICogQGNvbnN0YW50XG4gKiBAbmFtZSBTSEFERVJfQ1VTVE9NXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgU0hBREVSX0NVU1RPTSA9IDI1MDA7XG5cbi8qKlxuICogc2hhZGVyIGRyYXcgbW9kZXNcbiAqXG4gKiBAc3RhdGljXG4gKiBAY29uc3RhbnRcbiAqIEBuYW1lIERSQVdcbiAqIEB0eXBlIHtvYmplY3R9XG4gKiBAcHJvcGVydHkge251bWJlcn0gUE9JTlRTXG4gKiBAcHJvcGVydHkge251bWJlcn0gTElORVNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBUUklBTkdMRVNcbiAqL1xuZXhwb3J0IGNvbnN0IERSQVcgPSB7XG4gICAgUE9JTlRTOiAwLFxuICAgIExJTkVTOiAxLFxuICAgIFRSSUFOR0xFUzogNCxcbn07XG5cbi8qKlxuICogdHJpYW5nbGUgc2lkZVxuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgU0lERVxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBGUk9OVFxuICogQHByb3BlcnR5IHtudW1iZXJ9IEJBQ0tcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCT1RIXG4gKi9cbmV4cG9ydCBjb25zdCBTSURFID0ge1xuICAgIEZST05UOiAwLFxuICAgIEJBQ0s6IDEsXG4gICAgQk9USDogMixcbn07XG5cbi8qKlxuICogY29udGV4dCB0eXBlc1xuICpcbiAqIEBzdGF0aWNcbiAqIEBjb25zdGFudFxuICogQG5hbWUgQ09OVEVYVFxuICogQHR5cGUge29iamVjdH1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBXRUJHTFxuICogQHByb3BlcnR5IHtudW1iZXJ9IFdFQkdMMlxuICovXG5leHBvcnQgY29uc3QgQ09OVEVYVCA9IHtcbiAgICBXRUJHTDogJ3dlYmdsJyxcbiAgICBXRUJHTDI6ICd3ZWJnbDInLFxufTtcbiIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IGxpYnJhcnkgPSBfX0xJQlJBUllfXyB8fCAnbG93d3cnO1xuY29uc3QgdmVyc2lvbiA9IF9fVkVSU0lPTl9fIHx8ICdkZXYnO1xuXG4vLyBwZXIgc2Vzc2lvblxubGV0IGdsID0gbnVsbDtcbmxldCBjb250ZXh0VHlwZSA9IG51bGw7XG5cbi8vIHRlc3QgY29udGV4dCB3ZWJnbCBhbmQgd2ViZ2wyXG5jb25zdCB0ZXN0Q29udGV4dDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KENPTlRFWFQuV0VCR0wpO1xuY29uc3QgdGVzdENvbnRleHQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dChDT05URVhULldFQkdMMik7XG5cbmNvbnN0IGV4dGVuc2lvbnMgPSB7XG4gICAgLy8gdXNlZCBnbG9iYWxseVxuICAgIHZlcnRleEFycmF5T2JqZWN0OiB0ZXN0Q29udGV4dDEuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcpLFxuXG4gICAgLy8gdXNlZCBmb3IgaW5zdGFuY2luZ1xuICAgIGluc3RhbmNlZEFycmF5czogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpLFxuXG4gICAgLy8gdXNlZCBmb3IgZmxhdCBzaGFkaW5nXG4gICAgc3RhbmRhcmREZXJpdmF0aXZlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyksXG5cbiAgICAvLyBkZXB0aCB0ZXh0dXJlXG4gICAgZGVwdGhUZXh0dXJlczogdGVzdENvbnRleHQxLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpLFxufTtcblxuY29uc3Qgc2V0Q29udGV4dFR5cGUgPSAocHJlZmVycmVkKSA9PiB7XG4gICAgY29uc3QgZ2wyID0gdGVzdENvbnRleHQyICYmIENPTlRFWFQuV0VCR0wyO1xuICAgIGNvbnN0IGdsMSA9IHRlc3RDb250ZXh0MSAmJiBDT05URVhULldFQkdMO1xuICAgIGNvbnRleHRUeXBlID0gcHJlZmVycmVkIHx8IGdsMiB8fCBnbDE7XG5cbiAgICBpZiAoY29udGV4dFR5cGUgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIGV4dGVuc2lvbnMudmVydGV4QXJyYXlPYmplY3QgPSB0cnVlO1xuICAgICAgICBleHRlbnNpb25zLmluc3RhbmNlZEFycmF5cyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuc3RhbmRhcmREZXJpdmF0aXZlcyA9IHRydWU7XG4gICAgICAgIGV4dGVuc2lvbnMuZGVwdGhUZXh0dXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGV4dFR5cGU7XG59O1xuXG5jb25zdCBnZXRDb250ZXh0VHlwZSA9ICgpID0+IGNvbnRleHRUeXBlO1xuXG5jb25zdCBzZXRDb250ZXh0ID0gKGNvbnRleHQpID0+IHtcbiAgICBnbCA9IGNvbnRleHQ7XG4gICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wpIHtcbiAgICAgICAgZXh0ZW5zaW9ucy52ZXJ0ZXhBcnJheU9iamVjdCA9IGdsLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5pbnN0YW5jZWRBcnJheXMgPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5zdGFuZGFyZERlcml2YXRpdmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKTtcbiAgICAgICAgZXh0ZW5zaW9ucy5kZXB0aFRleHR1cmVzID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyk7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0Q29udGV4dCA9ICgpID0+IGdsO1xuXG5jb25zdCBzdXBwb3J0cyA9ICgpID0+IGV4dGVuc2lvbnM7XG5cbmV4cG9ydCB7XG4gICAgbGlicmFyeSxcbiAgICB2ZXJzaW9uLFxuICAgIHNldENvbnRleHQsXG4gICAgZ2V0Q29udGV4dCxcbiAgICBzZXRDb250ZXh0VHlwZSxcbiAgICBnZXRDb250ZXh0VHlwZSxcbiAgICBzdXBwb3J0cyxcbn07XG4iLCJpbXBvcnQgeyBDT05URVhULCBNQVhfRElSRUNUSU9OQUwgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcblxuY29uc3QgVUJPID0ge1xuICAgIHNjZW5lOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gcGVyU2NlbmUge1xuICAgICAgICAgICAgICAgIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgICAgICAgICBtYXQ0IHZpZXdNYXRyaXg7XG4gICAgICAgICAgICAgICAgdmVjNCBmb2dTZXR0aW5ncztcbiAgICAgICAgICAgICAgICB2ZWM0IGZvZ0NvbG9yO1xuICAgICAgICAgICAgICAgIGZsb2F0IGlHbG9iYWxUaW1lO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFNldHRpbmdzO1xuICAgICAgICAgICAgICAgIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMDtcbiAgICAgICAgICAgICAgICB2ZWM0IGdsb2JhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBnbG9iYWxDbGlwUGxhbmUyO1xuICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgIHVuaWZvcm0gbWF0NCB2aWV3TWF0cml4O1xuICAgICAgICB1bmlmb3JtIHZlYzQgZm9nU2V0dGluZ3M7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBmb2dDb2xvcjtcbiAgICAgICAgdW5pZm9ybSBmbG9hdCBpR2xvYmFsVGltZTtcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBTZXR0aW5ncztcbiAgICAgICAgdW5pZm9ybSB2ZWM0IGdsb2JhbENsaXBQbGFuZTA7XG4gICAgICAgIHVuaWZvcm0gdmVjNCBnbG9iYWxDbGlwUGxhbmUxO1xuICAgICAgICB1bmlmb3JtIHZlYzQgZ2xvYmFsQ2xpcFBsYW5lMjtgO1xuICAgIH0sXG5cbiAgICBtb2RlbDogKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICB1bmlmb3JtIHBlck1vZGVsIHtcbiAgICAgICAgICAgICAgICBtYXQ0IG1vZGVsTWF0cml4O1xuICAgICAgICAgICAgICAgIG1hdDQgbm9ybWFsTWF0cml4O1xuICAgICAgICAgICAgICAgIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTA7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTE7XG4gICAgICAgICAgICAgICAgdmVjNCBsb2NhbENsaXBQbGFuZTI7XG4gICAgICAgICAgICB9O2A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcbiAgICAgICAgICAgIHVuaWZvcm0gbWF0NCBub3JtYWxNYXRyaXg7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwU2V0dGluZ3M7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgbG9jYWxDbGlwUGxhbmUwO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IGxvY2FsQ2xpcFBsYW5lMTtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCBsb2NhbENsaXBQbGFuZTI7YDtcbiAgICB9LFxuXG4gICAgbGlnaHRzOiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAjZGVmaW5lIE1BWF9ESVJFQ1RJT05BTCAke01BWF9ESVJFQ1RJT05BTH1cblxuICAgICAgICAgICAgICAgIHN0cnVjdCBEaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBkbENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBmbEludGVuc2l0eTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBkaXJlY3Rpb25hbCB7XG4gICAgICAgICAgICAgICAgICAgIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07XG4gICAgICAgICAgICAgICAgfTtgO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICNkZWZpbmUgTUFYX0RJUkVDVElPTkFMICR7TUFYX0RJUkVDVElPTkFMfVxuXG4gICAgICAgICAgICBzdHJ1Y3QgRGlyZWN0aW9uYWwge1xuICAgICAgICAgICAgICAgIHZlYzQgZGxQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB2ZWM0IGRsQ29sb3I7XG4gICAgICAgICAgICAgICAgZmxvYXQgZmxJbnRlbnNpdHk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB1bmlmb3JtIERpcmVjdGlvbmFsIGRpcmVjdGlvbmFsTGlnaHRzW01BWF9ESVJFQ1RJT05BTF07YDtcbiAgICB9LFxufTtcblxuZXhwb3J0IHtcbiAgICBVQk8sXG59O1xuIiwiY29uc3QgTk9JU0UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGBcbiAgICB2ZWMzIG1vZDI4OSh2ZWMzIHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IG1vZDI4OSh2ZWM0IHgpe3JldHVybiB4LWZsb29yKHgqKDEuLzI4OS4pKSoyODkuO312ZWM0IHBlcm11dGUodmVjNCB4KXtyZXR1cm4gbW9kMjg5KCh4KjM0LisxLikqeCk7fXZlYzQgdGF5bG9ySW52U3FydCh2ZWM0IHIpe3JldHVybiAxLjc5Mjg0LS44NTM3MzUqcjt9dmVjMyBmYWRlKHZlYzMgdCl7cmV0dXJuIHQqdCp0Kih0Kih0KjYuLTE1LikrMTAuKTt9ZmxvYXQgY25vaXNlKHZlYzMgUCl7dmVjMyBQaTA9Zmxvb3IoUCksUGkxPVBpMCt2ZWMzKDEuKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9ZmxvYXQgcG5vaXNlKHZlYzMgUCx2ZWMzIHJlcCl7dmVjMyBQaTA9bW9kKGZsb29yKFApLHJlcCksUGkxPW1vZChQaTArdmVjMygxLikscmVwKTtQaTA9bW9kMjg5KFBpMCk7UGkxPW1vZDI4OShQaTEpO3ZlYzMgUGYwPWZyYWN0KFApLFBmMT1QZjAtdmVjMygxLik7dmVjNCBpeD12ZWM0KFBpMC5yLFBpMS5yLFBpMC5yLFBpMS5yKSxpeT12ZWM0KFBpMC5nZyxQaTEuZ2cpLGl6MD1QaTAuYmJiYixpejE9UGkxLmJiYmIsaXh5PXBlcm11dGUocGVybXV0ZShpeCkraXkpLGl4eTA9cGVybXV0ZShpeHkraXowKSxpeHkxPXBlcm11dGUoaXh5K2l6MSksZ3gwPWl4eTAqKDEuLzcuKSxneTA9ZnJhY3QoZmxvb3IoZ3gwKSooMS4vNy4pKS0uNTtneDA9ZnJhY3QoZ3gwKTt2ZWM0IGd6MD12ZWM0KC41KS1hYnMoZ3gwKS1hYnMoZ3kwKSxzejA9c3RlcChnejAsdmVjNCgwLikpO2d4MC09c3owKihzdGVwKDAuLGd4MCktLjUpO2d5MC09c3owKihzdGVwKDAuLGd5MCktLjUpO3ZlYzQgZ3gxPWl4eTEqKDEuLzcuKSxneTE9ZnJhY3QoZmxvb3IoZ3gxKSooMS4vNy4pKS0uNTtneDE9ZnJhY3QoZ3gxKTt2ZWM0IGd6MT12ZWM0KC41KS1hYnMoZ3gxKS1hYnMoZ3kxKSxzejE9c3RlcChnejEsdmVjNCgwLikpO2d4MS09c3oxKihzdGVwKDAuLGd4MSktLjUpO2d5MS09c3oxKihzdGVwKDAuLGd5MSktLjUpO3ZlYzMgZzAwMD12ZWMzKGd4MC5yLGd5MC5yLGd6MC5yKSxnMTAwPXZlYzMoZ3gwLmcsZ3kwLmcsZ3owLmcpLGcwMTA9dmVjMyhneDAuYixneTAuYixnejAuYiksZzExMD12ZWMzKGd4MC5hLGd5MC5hLGd6MC5hKSxnMDAxPXZlYzMoZ3gxLnIsZ3kxLnIsZ3oxLnIpLGcxMDE9dmVjMyhneDEuZyxneTEuZyxnejEuZyksZzAxMT12ZWMzKGd4MS5iLGd5MS5iLGd6MS5iKSxnMTExPXZlYzMoZ3gxLmEsZ3kxLmEsZ3oxLmEpO3ZlYzQgbm9ybTA9dGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLGcwMDApLGRvdChnMDEwLGcwMTApLGRvdChnMTAwLGcxMDApLGRvdChnMTEwLGcxMTApKSk7ZzAwMCo9bm9ybTAucjtnMDEwKj1ub3JtMC5nO2cxMDAqPW5vcm0wLmI7ZzExMCo9bm9ybTAuYTt2ZWM0IG5vcm0xPXRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSxnMDAxKSxkb3QoZzAxMSxnMDExKSxkb3QoZzEwMSxnMTAxKSxkb3QoZzExMSxnMTExKSkpO2cwMDEqPW5vcm0xLnI7ZzAxMSo9bm9ybTEuZztnMTAxKj1ub3JtMS5iO2cxMTEqPW5vcm0xLmE7ZmxvYXQgbjAwMD1kb3QoZzAwMCxQZjApLG4xMDA9ZG90KGcxMDAsdmVjMyhQZjEucixQZjAuZ2IpKSxuMDEwPWRvdChnMDEwLHZlYzMoUGYwLnIsUGYxLmcsUGYwLmIpKSxuMTEwPWRvdChnMTEwLHZlYzMoUGYxLnJnLFBmMC5iKSksbjAwMT1kb3QoZzAwMSx2ZWMzKFBmMC5yZyxQZjEuYikpLG4xMDE9ZG90KGcxMDEsdmVjMyhQZjEucixQZjAuZyxQZjEuYikpLG4wMTE9ZG90KGcwMTEsdmVjMyhQZjAucixQZjEuZ2IpKSxuMTExPWRvdChnMTExLFBmMSk7dmVjMyBmYWRlX3h5ej1mYWRlKFBmMCk7dmVjNCBuX3o9bWl4KHZlYzQobjAwMCxuMTAwLG4wMTAsbjExMCksdmVjNChuMDAxLG4xMDEsbjAxMSxuMTExKSxmYWRlX3h5ei5iKTt2ZWMyIG5feXo9bWl4KG5fei5yZyxuX3ouYmEsZmFkZV94eXouZyk7ZmxvYXQgbl94eXo9bWl4KG5feXoucixuX3l6LmcsZmFkZV94eXoucik7cmV0dXJuIDIuMipuX3h5ejt9XG5gO1xufTtcblxuZXhwb3J0IHtcbiAgICBOT0lTRSxcbn07XG4iLCJjb25zdCBDTElQUElORyA9IHtcblxuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgb3V0IHZlYzQgbG9jYWxfZXllc3BhY2U7XG4gICAgICAgIG91dCB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgbG9jYWxfZXllc3BhY2UgPSBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgZ2xvYmFsX2V5ZXNwYWNlID0gdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO2A7XG4gICAgfSxcblxuICAgIGZyYWdtZW50X3ByZTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpbiB2ZWM0IGxvY2FsX2V5ZXNwYWNlO1xuICAgICAgICBpbiB2ZWM0IGdsb2JhbF9leWVzcGFjZTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICBpZiAobG9jYWxDbGlwU2V0dGluZ3MueCA+IDAuMCkge1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTApIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGxvY2FsX2V5ZXNwYWNlLCBsb2NhbENsaXBQbGFuZTIpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdsb2JhbENsaXBTZXR0aW5ncy54ID4gMC4wKSB7XG4gICAgICAgICAgICBpZihkb3QoZ2xvYmFsX2V5ZXNwYWNlLCBnbG9iYWxDbGlwUGxhbmUwKSA8IDAuMCkgZGlzY2FyZDtcbiAgICAgICAgICAgIGlmKGRvdChnbG9iYWxfZXllc3BhY2UsIGdsb2JhbENsaXBQbGFuZTEpIDwgMC4wKSBkaXNjYXJkO1xuICAgICAgICAgICAgaWYoZG90KGdsb2JhbF9leWVzcGFjZSwgZ2xvYmFsQ2xpcFBsYW5lMikgPCAwLjApIGRpc2NhcmQ7XG4gICAgICAgIH1gO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgQ0xJUFBJTkcsXG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dFR5cGUgfSBmcm9tICcuLi8uLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuXG5jb25zdCBFWFRFTlNJT05TID0ge1xuXG4gICAgdmVydGV4OiAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuXG4gICAgZnJhZ21lbnQ6ICgpID0+IHtcbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGVgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgRVhURU5TSU9OUyxcbn07XG4iLCJmdW5jdGlvbiBoYXJkKCkge1xuICAgIHJldHVybiBgXG4gICAgZmxvYXQgaGFyZFNoYWRvdzEoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcbiAgICAgICAgZmxvYXQgc2hhZG93ID0gdGV4dHVyZShzaGFkb3dNYXAsIHV2KS5yO1xuXG4gICAgICAgIGZsb2F0IHZpc2liaWxpdHkgPSAxLjA7XG4gICAgICAgIGZsb2F0IHNoYWRvd0Ftb3VudCA9IDAuNTtcblxuICAgICAgICBmbG9hdCBjb3NUaGV0YSA9IGNsYW1wKGRvdCh2X25vcm1hbCwgdlNoYWRvd0Nvb3JkLnh5eiksIDAuMCwgMS4wKTtcbiAgICAgICAgZmxvYXQgYmlhcyA9IDAuMDAwMDUgKiB0YW4oYWNvcyhjb3NUaGV0YSkpOyAvLyBjb3NUaGV0YSBpcyBkb3QoIG4sbCApLCBjbGFtcGVkIGJldHdlZW4gMCBhbmQgMVxuICAgICAgICBiaWFzID0gY2xhbXAoYmlhcywgMC4wLCAwLjAwMSk7XG5cbiAgICAgICAgaWYgKHNoYWRvdyA8IHNoYWRvd0Nvb3JkLnogLSBiaWFzKXtcbiAgICAgICAgICAgIHZpc2liaWxpdHkgPSBzaGFkb3dBbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgZmxvYXQgaGFyZFNoYWRvdzIoc2FtcGxlcjJEIHNoYWRvd01hcCkge1xuICAgICAgICB2ZWM0IHNoYWRvd0Nvb3JkID0gdlNoYWRvd0Nvb3JkIC8gdlNoYWRvd0Nvb3JkLnc7XG4gICAgICAgIHZlYzIgdXYgPSBzaGFkb3dDb29yZC54eTtcblxuICAgICAgICBmbG9hdCBsaWdodERlcHRoMSA9IHRleHR1cmUoc2hhZG93TWFwLCB1dikucjtcbiAgICAgICAgZmxvYXQgbGlnaHREZXB0aDIgPSBjbGFtcChzaGFkb3dDb29yZC56LCAwLjAsIDEuMCk7XG4gICAgICAgIGZsb2F0IGJpYXMgPSAwLjAwMDE7XG5cbiAgICAgICAgcmV0dXJuIHN0ZXAobGlnaHREZXB0aDIsIGxpZ2h0RGVwdGgxK2JpYXMpO1xuICAgIH1cblxuICAgIGZsb2F0IGhhcmRTaGFkb3czKHNhbXBsZXIyRCBzaGFkb3dNYXApIHtcbiAgICAgICAgdmVjNCBzaGFkb3dDb29yZCA9IHZTaGFkb3dDb29yZCAvIHZTaGFkb3dDb29yZC53O1xuICAgICAgICB2ZWMyIHV2ID0gc2hhZG93Q29vcmQueHk7XG5cbiAgICAgICAgZmxvYXQgdmlzaWJpbGl0eSA9IDEuMDtcbiAgICAgICAgZmxvYXQgc2hhZG93QW1vdW50ID0gMC41O1xuICAgICAgICBmbG9hdCBiaWFzID0gMC4wMDAwNTtcblxuICAgICAgICB2ZWMyIHBvaXNzb25EaXNrWzE2XTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMF0gPSB2ZWMyKC0wLjk0MjAxNjI0LCAtMC4zOTkwNjIxNik7XG4gICAgICAgIHBvaXNzb25EaXNrWzFdID0gdmVjMigwLjk0NTU4NjA5LCAtMC43Njg5MDcyNSk7XG4gICAgICAgIHBvaXNzb25EaXNrWzJdID0gdmVjMigtMC4wOTQxODQxMDEsIC0wLjkyOTM4ODcwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbM10gPSB2ZWMyKDAuMzQ0OTU5MzgsIDAuMjkzODc3NjApO1xuICAgICAgICBwb2lzc29uRGlza1s0XSA9IHZlYzIoLTAuOTE1ODg1ODEsIDAuNDU3NzE0MzIpO1xuICAgICAgICBwb2lzc29uRGlza1s1XSA9IHZlYzIoLTAuODE1NDQyMzIsIC0wLjg3OTEyNDY0KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbNl0gPSB2ZWMyKC0wLjM4Mjc3NTQzLCAwLjI3Njc2ODQ1KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbN10gPSB2ZWMyKDAuOTc0ODQzOTgsIDAuNzU2NDgzNzkpO1xuICAgICAgICBwb2lzc29uRGlza1s4XSA9IHZlYzIoMC40NDMyMzMyNSwgLTAuOTc1MTE1NTQpO1xuICAgICAgICBwb2lzc29uRGlza1s5XSA9IHZlYzIoMC41Mzc0Mjk4MSwgLTAuNDczNzM0MjApO1xuICAgICAgICBwb2lzc29uRGlza1sxMF0gPSB2ZWMyKC0wLjI2NDk2OTExLCAtMC40MTg5MzAyMyk7XG4gICAgICAgIHBvaXNzb25EaXNrWzExXSA9IHZlYzIoMC43OTE5NzUxNCwgMC4xOTA5MDE4OCk7XG4gICAgICAgIHBvaXNzb25EaXNrWzEyXSA9IHZlYzIoLTAuMjQxODg4NDAsIDAuOTk3MDY1MDcpO1xuICAgICAgICBwb2lzc29uRGlza1sxM10gPSB2ZWMyKC0wLjgxNDA5OTU1LCAwLjkxNDM3NTkwKTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTRdID0gdmVjMigwLjE5OTg0MTI2LCAwLjc4NjQxMzY3KTtcbiAgICAgICAgcG9pc3NvbkRpc2tbMTVdID0gdmVjMigwLjE0MzgzMTYxLCAtMC4xNDEwMDc5MCk7XG5cbiAgICAgICAgZm9yIChpbnQgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgICAgICBpZiAoIHRleHR1cmUoc2hhZG93TWFwLCB1diArIHBvaXNzb25EaXNrW2ldLzcwMC4wKS5yIDwgc2hhZG93Q29vcmQuei1iaWFzICl7XG4gICAgICAgICAgICAgICAgdmlzaWJpbGl0eSAtPSAwLjAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZpc2liaWxpdHk7XG4gICAgfVxuXG4gICAgYDtcbn1cblxuY29uc3QgU0hBRE9XID0ge1xuICAgIHZlcnRleF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBtYXQ0IHNoYWRvd01hdHJpeDtcbiAgICAgICAgb3V0IHZlYzQgdlNoYWRvd0Nvb3JkO2A7XG4gICAgfSxcblxuICAgIHZlcnRleDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICB2U2hhZG93Q29vcmQgPSBzaGFkb3dNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtgO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudF9wcmU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgc2hhZG93TWFwO1xuICAgICAgICBpbiB2ZWM0IHZTaGFkb3dDb29yZDtcblxuICAgICAgICAke2hhcmQoKX1gO1xuICAgIH0sXG5cbiAgICBmcmFnbWVudDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAvLyBzaGFkb3dzXG4gICAgICAgIGZsb2F0IHNoYWRvdyA9IDEuMDtcblxuICAgICAgICAvLyBPUFRJT04gMVxuICAgICAgICBzaGFkb3cgPSBoYXJkU2hhZG93MShzaGFkb3dNYXApO1xuXG4gICAgICAgIGJhc2UgKj0gc2hhZG93O1xuICAgICAgICBgO1xuICAgIH0sXG5cbn07XG5cbmV4cG9ydCB7XG4gICAgU0hBRE9XLFxufTtcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG4vKipcclxuICogQ29tbW9uIHV0aWxpdGllc1xyXG4gKiBAbW9kdWxlIGdsTWF0cml4XHJcbiAqL1xyXG5cclxuLy8gQ29uZmlndXJhdGlvbiBDb25zdGFudHNcclxuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcclxuZXhwb3J0IGxldCBBUlJBWV9UWVBFID0gKHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xyXG5leHBvcnQgY29uc3QgUkFORE9NID0gTWF0aC5yYW5kb207XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2VzXHJcbiAqXHJcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldE1hdHJpeEFycmF5VHlwZSh0eXBlKSB7XHJcbiAgQVJSQVlfVFlQRSA9IHR5cGU7XHJcbn1cclxuXHJcbmNvbnN0IGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XHJcblxyXG4vKipcclxuICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIEFuZ2xlIGluIERlZ3JlZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihhKSB7XHJcbiAgcmV0dXJuIGEgKiBkZWdyZWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXHJcbiAqIG9yIHJlbGF0aXZlIHRvbGVyYW5jZSBvZiBnbE1hdHJpeC5FUFNJTE9OIChhbiBhYnNvbHV0ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgdmFsdWVzIGxlc3NcclxuICogdGhhbiBvciBlcXVhbCB0byAxLjAsIGFuZCBhIHJlbGF0aXZlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciBsYXJnZXIgdmFsdWVzKVxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgbnVtYmVyIHRvIHRlc3QuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpO1xyXG59XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIlxyXG5cclxuLyoqXHJcbiAqIDJ4MiBNYXRyaXhcclxuICogQG1vZHVsZSBtYXQyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBtYXQyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gY2xvbmVcclxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCBhIG1hdDIgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IG1hdDIgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHJldHVybnMge21hdDJ9IG91dCBBIG5ldyAyeDIgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTEwLCBtMTEpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMTA7XHJcbiAgb3V0WzNdID0gbTExO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAzKVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0xMCwgbTExKSB7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMTA7XHJcbiAgb3V0WzNdID0gbTExO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDJcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XHJcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZVxyXG4gIC8vIHNvbWUgdmFsdWVzXHJcbiAgaWYgKG91dCA9PT0gYSkge1xyXG4gICAgbGV0IGExID0gYVsxXTtcclxuICAgIG91dFsxXSA9IGFbMl07XHJcbiAgICBvdXRbMl0gPSBhMTtcclxuICB9IGVsc2Uge1xyXG4gICAgb3V0WzBdID0gYVswXTtcclxuICAgIG91dFsxXSA9IGFbMl07XHJcbiAgICBvdXRbMl0gPSBhWzFdO1xyXG4gICAgb3V0WzNdID0gYVszXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbnZlcnRzIGEgbWF0MlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcbiAgbGV0IGRldCA9IGEwICogYTMgLSBhMiAqIGExO1xyXG5cclxuICBpZiAoIWRldCkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGRldCA9IDEuMCAvIGRldDtcclxuXHJcbiAgb3V0WzBdID0gIGEzICogZGV0O1xyXG4gIG91dFsxXSA9IC1hMSAqIGRldDtcclxuICBvdXRbMl0gPSAtYTIgKiBkZXQ7XHJcbiAgb3V0WzNdID0gIGEwICogZGV0O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcclxuICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXHJcbiAgbGV0IGEwID0gYVswXTtcclxuICBvdXRbMF0gPSAgYVszXTtcclxuICBvdXRbMV0gPSAtYVsxXTtcclxuICBvdXRbMl0gPSAtYVsyXTtcclxuICBvdXRbM10gPSAgYTA7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XHJcbiAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyJ3NcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XHJcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcclxuICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcclxuICBvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMTtcclxuICBvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiMztcclxuICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdDIgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG4gIG91dFswXSA9IGEwICogIGMgKyBhMiAqIHM7XHJcbiAgb3V0WzFdID0gYTEgKiAgYyArIGEzICogcztcclxuICBvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjO1xyXG4gIG91dFszXSA9IGExICogLXMgKyBhMyAqIGM7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDJ9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xyXG4gIGxldCB2MCA9IHZbMF0sIHYxID0gdlsxXTtcclxuICBvdXRbMF0gPSBhMCAqIHYwO1xyXG4gIG91dFsxXSA9IGExICogdjA7XHJcbiAgb3V0WzJdID0gYTIgKiB2MTtcclxuICBvdXRbM10gPSBhMyAqIHYxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQyLnJvdGF0ZShkZXN0LCBkZXN0LCByYWQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCBtYXQyIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQpIHtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG4gIG91dFswXSA9IGM7XHJcbiAgb3V0WzFdID0gcztcclxuICBvdXRbMl0gPSAtcztcclxuICBvdXRbM10gPSBjO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQyLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcclxuICBvdXRbMF0gPSB2WzBdO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSB2WzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdtYXQyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XHJcbiAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIEwsIEQgYW5kIFUgbWF0cmljZXMgKExvd2VyIHRyaWFuZ3VsYXIsIERpYWdvbmFsIGFuZCBVcHBlciB0cmlhbmd1bGFyKSBieSBmYWN0b3JpemluZyB0aGUgaW5wdXQgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0Mn0gTCB0aGUgbG93ZXIgdHJpYW5ndWxhciBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBEIHRoZSBkaWFnb25hbCBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBVIHRoZSB1cHBlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGlucHV0IG1hdHJpeCB0byBmYWN0b3JpemVcclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTERVKEwsIEQsIFUsIGEpIHtcclxuICBMWzJdID0gYVsyXS9hWzBdO1xyXG4gIFVbMF0gPSBhWzBdO1xyXG4gIFVbMV0gPSBhWzFdO1xyXG4gIFVbM10gPSBhWzNdIC0gTFsyXSAqIFVbMV07XHJcbiAgcmV0dXJuIFtMLCBELCBVXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xyXG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xyXG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDIncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XHJcblxyXG4vKipcclxuICogMngzIE1hdHJpeFxyXG4gKiBAbW9kdWxlIG1hdDJkXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBBIG1hdDJkIGNvbnRhaW5zIHNpeCBlbGVtZW50cyBkZWZpbmVkIGFzOlxyXG4gKiA8cHJlPlxyXG4gKiBbYSwgYywgdHgsXHJcbiAqICBiLCBkLCB0eV1cclxuICogPC9wcmU+XHJcbiAqIFRoaXMgaXMgYSBzaG9ydCBmb3JtIGZvciB0aGUgM3gzIG1hdHJpeDpcclxuICogPHByZT5cclxuICogW2EsIGMsIHR4LFxyXG4gKiAgYiwgZCwgdHksXHJcbiAqICAwLCAwLCAxXVxyXG4gKiA8L3ByZT5cclxuICogVGhlIGxhc3Qgcm93IGlzIGlnbm9yZWQgc28gdGhlIGFycmF5IGlzIHNob3J0ZXIgYW5kIG9wZXJhdGlvbnMgYXJlIGZhc3Rlci5cclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyZFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDYpO1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDE7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDJkIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNik7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyZCB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IGFbNF07XHJcbiAgb3V0WzVdID0gYVs1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IGEgbWF0MmQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHJldHVybnMge21hdDJkfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gMDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IG1hdDJkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gYSBDb21wb25lbnQgQSAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgQ29tcG9uZW50IEIgKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZCBDb21wb25lbnQgRCAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IHR4IENvbXBvbmVudCBUWCAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcclxuICogQHJldHVybnMge21hdDJkfSBBIG5ldyBtYXQyZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoYSwgYiwgYywgZCwgdHgsIHR5KSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDYpO1xyXG4gIG91dFswXSA9IGE7XHJcbiAgb3V0WzFdID0gYjtcclxuICBvdXRbMl0gPSBjO1xyXG4gIG91dFszXSA9IGQ7XHJcbiAgb3V0WzRdID0gdHg7XHJcbiAgb3V0WzVdID0gdHk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDJkIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBDb21wb25lbnQgQiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGMgQ29tcG9uZW50IEMgKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdHggQ29tcG9uZW50IFRYIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdHkgQ29tcG9uZW50IFRZIChpbmRleCA1KVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIGEsIGIsIGMsIGQsIHR4LCB0eSkge1xyXG4gIG91dFswXSA9IGE7XHJcbiAgb3V0WzFdID0gYjtcclxuICBvdXRbMl0gPSBjO1xyXG4gIG91dFszXSA9IGQ7XHJcbiAgb3V0WzRdID0gdHg7XHJcbiAgb3V0WzVdID0gdHk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEludmVydHMgYSBtYXQyZFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuICBsZXQgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdO1xyXG4gIGxldCBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xyXG5cclxuICBsZXQgZGV0ID0gYWEgKiBhZCAtIGFiICogYWM7XHJcbiAgaWYoIWRldCl7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgZGV0ID0gMS4wIC8gZGV0O1xyXG5cclxuICBvdXRbMF0gPSBhZCAqIGRldDtcclxuICBvdXRbMV0gPSAtYWIgKiBkZXQ7XHJcbiAgb3V0WzJdID0gLWFjICogZGV0O1xyXG4gIG91dFszXSA9IGFhICogZGV0O1xyXG4gIG91dFs0XSA9IChhYyAqIGF0eSAtIGFkICogYXR4KSAqIGRldDtcclxuICBvdXRbNV0gPSAoYWIgKiBhdHggLSBhYSAqIGF0eSkgKiBkZXQ7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xyXG4gIHJldHVybiBhWzBdICogYVszXSAtIGFbMV0gKiBhWzJdO1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdO1xyXG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdO1xyXG4gIG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxO1xyXG4gIG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxO1xyXG4gIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xyXG4gIG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzO1xyXG4gIG91dFs0XSA9IGEwICogYjQgKyBhMiAqIGI1ICsgYTQ7XHJcbiAgb3V0WzVdID0gYTEgKiBiNCArIGEzICogYjUgKyBhNTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdO1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgb3V0WzBdID0gYTAgKiAgYyArIGEyICogcztcclxuICBvdXRbMV0gPSBhMSAqICBjICsgYTMgKiBzO1xyXG4gIG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGM7XHJcbiAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcclxuICBvdXRbNF0gPSBhNDtcclxuICBvdXRbNV0gPSBhNTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XTtcclxuICBsZXQgdjAgPSB2WzBdLCB2MSA9IHZbMV07XHJcbiAgb3V0WzBdID0gYTAgKiB2MDtcclxuICBvdXRbMV0gPSBhMSAqIHYwO1xyXG4gIG91dFsyXSA9IGEyICogdjE7XHJcbiAgb3V0WzNdID0gYTMgKiB2MTtcclxuICBvdXRbNF0gPSBhNDtcclxuICBvdXRbNV0gPSBhNTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHRyYW5zbGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XTtcclxuICBsZXQgdjAgPSB2WzBdLCB2MSA9IHZbMV07XHJcbiAgb3V0WzBdID0gYTA7XHJcbiAgb3V0WzFdID0gYTE7XHJcbiAgb3V0WzJdID0gYTI7XHJcbiAgb3V0WzNdID0gYTM7XHJcbiAgb3V0WzRdID0gYTAgKiB2MCArIGEyICogdjEgKyBhNDtcclxuICBvdXRbNV0gPSBhMSAqIHYwICsgYTMgKiB2MSArIGE1O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0MmQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKSwgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgb3V0WzBdID0gYztcclxuICBvdXRbMV0gPSBzO1xyXG4gIG91dFsyXSA9IC1zO1xyXG4gIG91dFszXSA9IGM7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0MmQuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjMn0gdiBTY2FsaW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xyXG4gIG91dFswXSA9IHZbMF07XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IHZbMV07XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDJkLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIG91dFs0XSA9IHZbMF07XHJcbiAgb3V0WzVdID0gdlsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJkXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdtYXQyZCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICtcclxuICAgICAgICAgIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJkXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcclxuICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIDEpKVxyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0MmQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICsgYlszXTtcclxuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcclxuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuICpcclxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDJkfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcclxuICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcclxuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKiBiO1xyXG4gIG91dFsxXSA9IGFbMV0gKiBiO1xyXG4gIG91dFsyXSA9IGFbMl0gKiBiO1xyXG4gIG91dFszXSA9IGFbM10gKiBiO1xyXG4gIG91dFs0XSA9IGFbNF0gKiBiO1xyXG4gIG91dFs1XSA9IGFbNV0gKiBiO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQyZCdzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcclxuICBvdXRbNF0gPSBhWzRdICsgKGJbNF0gKiBzY2FsZSk7XHJcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQyZH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJiBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQyZH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV07XHJcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXSwgYjQgPSBiWzRdLCBiNSA9IGJbNV07XHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNSAtIGI1KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XHJcblxyXG4vKipcclxuICogM3gzIE1hdHJpeFxyXG4gKiBAbW9kdWxlIG1hdDNcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IDE7XHJcbiAgb3V0WzVdID0gMDtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDQob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVs0XTtcclxuICBvdXRbNF0gPSBhWzVdO1xyXG4gIG91dFs1XSA9IGFbNl07XHJcbiAgb3V0WzZdID0gYVs4XTtcclxuICBvdXRbN10gPSBhWzldO1xyXG4gIG91dFs4XSA9IGFbMTBdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIG91dFs4XSA9IGFbOF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICBvdXRbMl0gPSBhWzJdO1xyXG4gIG91dFszXSA9IGFbM107XHJcbiAgb3V0WzRdID0gYVs0XTtcclxuICBvdXRbNV0gPSBhWzVdO1xyXG4gIG91dFs2XSA9IGFbNl07XHJcbiAgb3V0WzddID0gYVs3XTtcclxuICBvdXRbOF0gPSBhWzhdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgbWF0MyB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDcpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcclxuICogQHJldHVybnMge21hdDN9IEEgbmV3IG1hdDNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMDI7XHJcbiAgb3V0WzNdID0gbTEwO1xyXG4gIG91dFs0XSA9IG0xMTtcclxuICBvdXRbNV0gPSBtMTI7XHJcbiAgb3V0WzZdID0gbTIwO1xyXG4gIG91dFs3XSA9IG0yMTtcclxuICBvdXRbOF0gPSBtMjI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDMgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG4gIG91dFswXSA9IG0wMDtcclxuICBvdXRbMV0gPSBtMDE7XHJcbiAgb3V0WzJdID0gbTAyO1xyXG4gIG91dFszXSA9IG0xMDtcclxuICBvdXRbNF0gPSBtMTE7XHJcbiAgb3V0WzVdID0gbTEyO1xyXG4gIG91dFs2XSA9IG0yMDtcclxuICBvdXRbN10gPSBtMjE7XHJcbiAgb3V0WzhdID0gbTIyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMTtcclxuICBvdXRbNV0gPSAwO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XHJcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xyXG4gIGlmIChvdXQgPT09IGEpIHtcclxuICAgIGxldCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xyXG4gICAgb3V0WzFdID0gYVszXTtcclxuICAgIG91dFsyXSA9IGFbNl07XHJcbiAgICBvdXRbM10gPSBhMDE7XHJcbiAgICBvdXRbNV0gPSBhWzddO1xyXG4gICAgb3V0WzZdID0gYTAyO1xyXG4gICAgb3V0WzddID0gYTEyO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXRbMF0gPSBhWzBdO1xyXG4gICAgb3V0WzFdID0gYVszXTtcclxuICAgIG91dFsyXSA9IGFbNl07XHJcbiAgICBvdXRbM10gPSBhWzFdO1xyXG4gICAgb3V0WzRdID0gYVs0XTtcclxuICAgIG91dFs1XSA9IGFbN107XHJcbiAgICBvdXRbNl0gPSBhWzJdO1xyXG4gICAgb3V0WzddID0gYVs1XTtcclxuICAgIG91dFs4XSA9IGFbOF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogSW52ZXJ0cyBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XHJcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XHJcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XHJcblxyXG4gIGxldCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XHJcbiAgbGV0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XHJcbiAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG4gIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XHJcblxyXG4gIGlmICghZGV0KSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgZGV0ID0gMS4wIC8gZGV0O1xyXG5cclxuICBvdXRbMF0gPSBiMDEgKiBkZXQ7XHJcbiAgb3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xyXG4gIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xyXG4gIG91dFszXSA9IGIxMSAqIGRldDtcclxuICBvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcclxuICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XHJcbiAgb3V0WzZdID0gYjIxICogZGV0O1xyXG4gIG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcclxuICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcclxuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcclxuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcclxuXHJcbiAgb3V0WzBdID0gKGExMSAqIGEyMiAtIGExMiAqIGEyMSk7XHJcbiAgb3V0WzFdID0gKGEwMiAqIGEyMSAtIGEwMSAqIGEyMik7XHJcbiAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XHJcbiAgb3V0WzNdID0gKGExMiAqIGEyMCAtIGExMCAqIGEyMik7XHJcbiAgb3V0WzRdID0gKGEwMCAqIGEyMiAtIGEwMiAqIGEyMCk7XHJcbiAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XHJcbiAgb3V0WzZdID0gKGExMCAqIGEyMSAtIGExMSAqIGEyMCk7XHJcbiAgb3V0WzddID0gKGEwMSAqIGEyMCAtIGEwMCAqIGEyMSk7XHJcbiAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcclxuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcclxuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcclxuXHJcbiAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xyXG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xyXG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xyXG5cclxuICBsZXQgYjAwID0gYlswXSwgYjAxID0gYlsxXSwgYjAyID0gYlsyXTtcclxuICBsZXQgYjEwID0gYlszXSwgYjExID0gYls0XSwgYjEyID0gYls1XTtcclxuICBsZXQgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcclxuXHJcbiAgb3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xyXG4gIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcclxuICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XHJcblxyXG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcclxuICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XHJcbiAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xyXG5cclxuICBvdXRbNl0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjA7XHJcbiAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xyXG4gIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxyXG4gICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcclxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXHJcbiAgICB4ID0gdlswXSwgeSA9IHZbMV07XHJcblxyXG4gIG91dFswXSA9IGEwMDtcclxuICBvdXRbMV0gPSBhMDE7XHJcbiAgb3V0WzJdID0gYTAyO1xyXG5cclxuICBvdXRbM10gPSBhMTA7XHJcbiAgb3V0WzRdID0gYTExO1xyXG4gIG91dFs1XSA9IGExMjtcclxuXHJcbiAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XHJcbiAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XHJcbiAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxyXG4gICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcclxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXHJcblxyXG4gICAgcyA9IE1hdGguc2luKHJhZCksXHJcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XHJcbiAgb3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTE7XHJcbiAgb3V0WzJdID0gYyAqIGEwMiArIHMgKiBhMTI7XHJcblxyXG4gIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xyXG4gIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xyXG4gIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xyXG5cclxuICBvdXRbNl0gPSBhMjA7XHJcbiAgb3V0WzddID0gYTIxO1xyXG4gIG91dFs4XSA9IGEyMjtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcclxuICBsZXQgeCA9IHZbMF0sIHkgPSB2WzFdO1xyXG5cclxuICBvdXRbMF0gPSB4ICogYVswXTtcclxuICBvdXRbMV0gPSB4ICogYVsxXTtcclxuICBvdXRbMl0gPSB4ICogYVsyXTtcclxuXHJcbiAgb3V0WzNdID0geSAqIGFbM107XHJcbiAgb3V0WzRdID0geSAqIGFbNF07XHJcbiAgb3V0WzVdID0geSAqIGFbNV07XHJcblxyXG4gIG91dFs2XSA9IGFbNl07XHJcbiAgb3V0WzddID0gYVs3XTtcclxuICBvdXRbOF0gPSBhWzhdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0My50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XHJcbiAgb3V0WzBdID0gMTtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAxO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgb3V0WzZdID0gdlswXTtcclxuICBvdXRbN10gPSB2WzFdO1xyXG4gIG91dFs4XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDMucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKSwgYyA9IE1hdGguY29zKHJhZCk7XHJcblxyXG4gIG91dFswXSA9IGM7XHJcbiAgb3V0WzFdID0gcztcclxuICBvdXRbMl0gPSAwO1xyXG5cclxuICBvdXRbM10gPSAtcztcclxuICBvdXRbNF0gPSBjO1xyXG4gIG91dFs1XSA9IDA7XHJcblxyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQzLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcclxuICBvdXRbMF0gPSB2WzBdO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuXHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSB2WzFdO1xyXG4gIG91dFs1XSA9IDA7XHJcblxyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNvcHlcclxuICogQHJldHVybnMge21hdDN9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MmQob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IDA7XHJcblxyXG4gIG91dFszXSA9IGFbMl07XHJcbiAgb3V0WzRdID0gYVszXTtcclxuICBvdXRbNV0gPSAwO1xyXG5cclxuICBvdXRbNl0gPSBhWzRdO1xyXG4gIG91dFs3XSA9IGFbNV07XHJcbiAgb3V0WzhdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcbipcclxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcbipcclxuKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcclxuICBsZXQgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM107XHJcbiAgbGV0IHgyID0geCArIHg7XHJcbiAgbGV0IHkyID0geSArIHk7XHJcbiAgbGV0IHoyID0geiArIHo7XHJcblxyXG4gIGxldCB4eCA9IHggKiB4MjtcclxuICBsZXQgeXggPSB5ICogeDI7XHJcbiAgbGV0IHl5ID0geSAqIHkyO1xyXG4gIGxldCB6eCA9IHogKiB4MjtcclxuICBsZXQgenkgPSB6ICogeTI7XHJcbiAgbGV0IHp6ID0geiAqIHoyO1xyXG4gIGxldCB3eCA9IHcgKiB4MjtcclxuICBsZXQgd3kgPSB3ICogeTI7XHJcbiAgbGV0IHd6ID0gdyAqIHoyO1xyXG5cclxuICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcclxuICBvdXRbM10gPSB5eCAtIHd6O1xyXG4gIG91dFs2XSA9IHp4ICsgd3k7XHJcblxyXG4gIG91dFsxXSA9IHl4ICsgd3o7XHJcbiAgb3V0WzRdID0gMSAtIHh4IC0geno7XHJcbiAgb3V0WzddID0genkgLSB3eDtcclxuXHJcbiAgb3V0WzJdID0genggLSB3eTtcclxuICBvdXRbNV0gPSB6eSArIHd4O1xyXG4gIG91dFs4XSA9IDEgLSB4eCAtIHl5O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XHJcbipcclxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cclxuKlxyXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xyXG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XHJcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xyXG5cclxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xyXG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XHJcbiAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcclxuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xyXG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XHJcbiAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcclxuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xyXG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XHJcbiAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcclxuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xyXG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XHJcbiAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG4gIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XHJcblxyXG4gIGlmICghZGV0KSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgZGV0ID0gMS4wIC8gZGV0O1xyXG5cclxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcclxuICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcclxuICBvdXRbMl0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcclxuXHJcbiAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XHJcbiAgb3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XHJcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XHJcblxyXG4gIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xyXG4gIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xyXG4gIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xyXG4gICAgb3V0WzFdID0gMDtcclxuICAgIG91dFsyXSA9IDA7XHJcbiAgICBvdXRbM10gPSAwO1xyXG4gICAgb3V0WzRdID0gLTIgLyBoZWlnaHQ7XHJcbiAgICBvdXRbNV0gPSAwO1xyXG4gICAgb3V0WzZdID0gLTE7XHJcbiAgICBvdXRbN10gPSAxO1xyXG4gICAgb3V0WzhdID0gMTtcclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdtYXQzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgK1xyXG4gICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICtcclxuICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcclxuICpcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XHJcbiAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikpKVxyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0MydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSArIGJbM107XHJcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XHJcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XHJcbiAgb3V0WzZdID0gYVs2XSArIGJbNl07XHJcbiAgb3V0WzddID0gYVs3XSArIGJbN107XHJcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcclxuICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcclxuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcclxuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcclxuICBvdXRbN10gPSBhWzddIC0gYls3XTtcclxuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgb3V0WzRdID0gYVs0XSAqIGI7XHJcbiAgb3V0WzVdID0gYVs1XSAqIGI7XHJcbiAgb3V0WzZdID0gYVs2XSAqIGI7XHJcbiAgb3V0WzddID0gYVs3XSAqIGI7XHJcbiAgb3V0WzhdID0gYVs4XSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDMncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcclxuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XHJcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xyXG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcclxuICBvdXRbNF0gPSBhWzRdICsgKGJbNF0gKiBzY2FsZSk7XHJcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xyXG4gIG91dFs2XSA9IGFbNl0gKyAoYls2XSAqIHNjYWxlKTtcclxuICBvdXRbN10gPSBhWzddICsgKGJbN10gKiBzY2FsZSk7XHJcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG4gKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XHJcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmXHJcbiAgICAgICAgIGFbM10gPT09IGJbM10gJiYgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmXHJcbiAgICAgICAgIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XSAmJiBhWzhdID09PSBiWzhdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSwgYTYgPSBhWzZdLCBhNyA9IGFbN10sIGE4ID0gYVs4XTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdLCBiNCA9IGJbNF0sIGI1ID0gYls1XSwgYjYgPSBiWzZdLCBiNyA9IGJbN10sIGI4ID0gYls4XTtcclxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE3IC0gYjcpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGE4IC0gYjgpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkpO1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XHJcblxyXG4vKipcclxuICogQGNsYXNzIDR4NCBNYXRyaXg8YnI+Rm9ybWF0OiBjb2x1bW4tbWFqb3IsIHdoZW4gdHlwZWQgb3V0IGl0IGxvb2tzIGxpa2Ugcm93LW1ham9yPGJyPlRoZSBtYXRyaWNlcyBhcmUgYmVpbmcgcG9zdCBtdWx0aXBsaWVkLlxyXG4gKiBAbmFtZSBtYXQ0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAxO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IDE7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIG91dFs4XSA9IGFbOF07XHJcbiAgb3V0WzldID0gYVs5XTtcclxuICBvdXRbMTBdID0gYVsxMF07XHJcbiAgb3V0WzExXSA9IGFbMTFdO1xyXG4gIG91dFsxMl0gPSBhWzEyXTtcclxuICBvdXRbMTNdID0gYVsxM107XHJcbiAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gIG91dFsxNV0gPSBhWzE1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIG91dFs4XSA9IGFbOF07XHJcbiAgb3V0WzldID0gYVs5XTtcclxuICBvdXRbMTBdID0gYVsxMF07XHJcbiAgb3V0WzExXSA9IGFbMTFdO1xyXG4gIG91dFsxMl0gPSBhWzEyXTtcclxuICBvdXRbMTNdID0gYVsxM107XHJcbiAgb3V0WzE0XSA9IGFbMTRdO1xyXG4gIG91dFsxNV0gPSBhWzE1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IG1hdDQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuICogQHJldHVybnMge21hdDR9IEEgbmV3IG1hdDRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMDI7XHJcbiAgb3V0WzNdID0gbTAzO1xyXG4gIG91dFs0XSA9IG0xMDtcclxuICBvdXRbNV0gPSBtMTE7XHJcbiAgb3V0WzZdID0gbTEyO1xyXG4gIG91dFs3XSA9IG0xMztcclxuICBvdXRbOF0gPSBtMjA7XHJcbiAgb3V0WzldID0gbTIxO1xyXG4gIG91dFsxMF0gPSBtMjI7XHJcbiAgb3V0WzExXSA9IG0yMztcclxuICBvdXRbMTJdID0gbTMwO1xyXG4gIG91dFsxM10gPSBtMzE7XHJcbiAgb3V0WzE0XSA9IG0zMjtcclxuICBvdXRbMTVdID0gbTMzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQ0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMyBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA2KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA5KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMwIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDAgcG9zaXRpb24gKGluZGV4IDEyKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTMzIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDMgcG9zaXRpb24gKGluZGV4IDE1KVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKSB7XHJcbiAgb3V0WzBdID0gbTAwO1xyXG4gIG91dFsxXSA9IG0wMTtcclxuICBvdXRbMl0gPSBtMDI7XHJcbiAgb3V0WzNdID0gbTAzO1xyXG4gIG91dFs0XSA9IG0xMDtcclxuICBvdXRbNV0gPSBtMTE7XHJcbiAgb3V0WzZdID0gbTEyO1xyXG4gIG91dFs3XSA9IG0xMztcclxuICBvdXRbOF0gPSBtMjA7XHJcbiAgb3V0WzldID0gbTIxO1xyXG4gIG91dFsxMF0gPSBtMjI7XHJcbiAgb3V0WzExXSA9IG0yMztcclxuICBvdXRbMTJdID0gbTMwO1xyXG4gIG91dFsxM10gPSBtMzE7XHJcbiAgb3V0WzE0XSA9IG0zMjtcclxuICBvdXRbMTVdID0gbTMzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuICBvdXRbMF0gPSAxO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gMTtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gMDtcclxuICBvdXRbOV0gPSAwO1xyXG4gIG91dFsxMF0gPSAxO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSAwO1xyXG4gIG91dFsxM10gPSAwO1xyXG4gIG91dFsxNF0gPSAwO1xyXG4gIG91dFsxNV0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XHJcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xyXG4gIGlmIChvdXQgPT09IGEpIHtcclxuICAgIGxldCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xyXG4gICAgbGV0IGExMiA9IGFbNl0sIGExMyA9IGFbN107XHJcbiAgICBsZXQgYTIzID0gYVsxMV07XHJcblxyXG4gICAgb3V0WzFdID0gYVs0XTtcclxuICAgIG91dFsyXSA9IGFbOF07XHJcbiAgICBvdXRbM10gPSBhWzEyXTtcclxuICAgIG91dFs0XSA9IGEwMTtcclxuICAgIG91dFs2XSA9IGFbOV07XHJcbiAgICBvdXRbN10gPSBhWzEzXTtcclxuICAgIG91dFs4XSA9IGEwMjtcclxuICAgIG91dFs5XSA9IGExMjtcclxuICAgIG91dFsxMV0gPSBhWzE0XTtcclxuICAgIG91dFsxMl0gPSBhMDM7XHJcbiAgICBvdXRbMTNdID0gYTEzO1xyXG4gICAgb3V0WzE0XSA9IGEyMztcclxuICB9IGVsc2Uge1xyXG4gICAgb3V0WzBdID0gYVswXTtcclxuICAgIG91dFsxXSA9IGFbNF07XHJcbiAgICBvdXRbMl0gPSBhWzhdO1xyXG4gICAgb3V0WzNdID0gYVsxMl07XHJcbiAgICBvdXRbNF0gPSBhWzFdO1xyXG4gICAgb3V0WzVdID0gYVs1XTtcclxuICAgIG91dFs2XSA9IGFbOV07XHJcbiAgICBvdXRbN10gPSBhWzEzXTtcclxuICAgIG91dFs4XSA9IGFbMl07XHJcbiAgICBvdXRbOV0gPSBhWzZdO1xyXG4gICAgb3V0WzEwXSA9IGFbMTBdO1xyXG4gICAgb3V0WzExXSA9IGFbMTRdO1xyXG4gICAgb3V0WzEyXSA9IGFbM107XHJcbiAgICBvdXRbMTNdID0gYVs3XTtcclxuICAgIG91dFsxNF0gPSBhWzExXTtcclxuICAgIG91dFsxNV0gPSBhWzE1XTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbnZlcnRzIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcclxuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcclxuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xyXG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcclxuXHJcbiAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcclxuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xyXG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XHJcbiAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcclxuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xyXG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XHJcbiAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcclxuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xyXG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XHJcbiAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcclxuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xyXG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XHJcblxyXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xyXG5cclxuICBpZiAoIWRldCkge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGRldCA9IDEuMCAvIGRldDtcclxuXHJcbiAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XHJcbiAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XHJcbiAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XHJcbiAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XHJcbiAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XHJcbiAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XHJcbiAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XHJcbiAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XHJcbiAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XHJcbiAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XHJcbiAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xyXG4gIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcclxuICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XHJcbiAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xyXG4gIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcclxuICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xyXG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xyXG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XHJcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xyXG5cclxuICBvdXRbMF0gID0gIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xyXG4gIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XHJcbiAgb3V0WzJdICA9ICAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcclxuICBvdXRbM10gID0gLShhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xyXG4gIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XHJcbiAgb3V0WzVdICA9ICAoYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcclxuICBvdXRbNl0gID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xyXG4gIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XHJcbiAgb3V0WzhdICA9ICAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpKTtcclxuICBvdXRbOV0gID0gLShhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkpO1xyXG4gIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XHJcbiAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcclxuICBvdXRbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpO1xyXG4gIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XHJcbiAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcclxuICBvdXRbMTVdID0gIChhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XHJcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XHJcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XHJcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcclxuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XHJcblxyXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XHJcbiAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcclxuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xyXG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XHJcbiAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcclxuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xyXG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XHJcbiAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcclxuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xyXG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XHJcbiAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcclxuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcbiAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcclxuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcclxuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xyXG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcclxuXHJcbiAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XHJcbiAgbGV0IGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XHJcbiAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xyXG4gIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcclxuICBvdXRbMl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XHJcbiAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xyXG5cclxuICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XHJcbiAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xyXG4gIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcclxuICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XHJcbiAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xyXG5cclxuICBiMCA9IGJbOF07IGIxID0gYls5XTsgYjIgPSBiWzEwXTsgYjMgPSBiWzExXTtcclxuICBvdXRbOF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XHJcbiAgb3V0WzldID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xyXG4gIG91dFsxMF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XHJcbiAgb3V0WzExXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcclxuXHJcbiAgYjAgPSBiWzEyXTsgYjEgPSBiWzEzXTsgYjIgPSBiWzE0XTsgYjMgPSBiWzE1XTtcclxuICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xyXG4gIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XHJcbiAgb3V0WzE0XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcclxuICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XHJcbiAgbGV0IHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl07XHJcbiAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcclxuICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xyXG4gIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XHJcblxyXG4gIGlmIChhID09PSBvdXQpIHtcclxuICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XHJcbiAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xyXG4gICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcclxuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcclxuXHJcbiAgICBvdXRbMF0gPSBhMDA7IG91dFsxXSA9IGEwMTsgb3V0WzJdID0gYTAyOyBvdXRbM10gPSBhMDM7XHJcbiAgICBvdXRbNF0gPSBhMTA7IG91dFs1XSA9IGExMTsgb3V0WzZdID0gYTEyOyBvdXRbN10gPSBhMTM7XHJcbiAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcclxuXHJcbiAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XHJcbiAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XHJcbiAgICBvdXRbMTRdID0gYTAyICogeCArIGExMiAqIHkgKyBhMjIgKiB6ICsgYVsxNF07XHJcbiAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICoqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XHJcbiAgbGV0IHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl07XHJcblxyXG4gIG91dFswXSA9IGFbMF0gKiB4O1xyXG4gIG91dFsxXSA9IGFbMV0gKiB4O1xyXG4gIG91dFsyXSA9IGFbMl0gKiB4O1xyXG4gIG91dFszXSA9IGFbM10gKiB4O1xyXG4gIG91dFs0XSA9IGFbNF0gKiB5O1xyXG4gIG91dFs1XSA9IGFbNV0gKiB5O1xyXG4gIG91dFs2XSA9IGFbNl0gKiB5O1xyXG4gIG91dFs3XSA9IGFbN10gKiB5O1xyXG4gIG91dFs4XSA9IGFbOF0gKiB6O1xyXG4gIG91dFs5XSA9IGFbOV0gKiB6O1xyXG4gIG91dFsxMF0gPSBhWzEwXSAqIHo7XHJcbiAgb3V0WzExXSA9IGFbMTFdICogejtcclxuICBvdXRbMTJdID0gYVsxMl07XHJcbiAgb3V0WzEzXSA9IGFbMTNdO1xyXG4gIG91dFsxNF0gPSBhWzE0XTtcclxuICBvdXRbMTVdID0gYVsxNV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQsIGF4aXMpIHtcclxuICBsZXQgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXTtcclxuICBsZXQgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XHJcbiAgbGV0IHMsIGMsIHQ7XHJcbiAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcclxuICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xyXG4gIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XHJcbiAgbGV0IGIwMCwgYjAxLCBiMDI7XHJcbiAgbGV0IGIxMCwgYjExLCBiMTI7XHJcbiAgbGV0IGIyMCwgYjIxLCBiMjI7XHJcblxyXG4gIGlmIChNYXRoLmFicyhsZW4pIDwgZ2xNYXRyaXguRVBTSUxPTikgeyByZXR1cm4gbnVsbDsgfVxyXG5cclxuICBsZW4gPSAxIC8gbGVuO1xyXG4gIHggKj0gbGVuO1xyXG4gIHkgKj0gbGVuO1xyXG4gIHogKj0gbGVuO1xyXG5cclxuICBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBjID0gTWF0aC5jb3MocmFkKTtcclxuICB0ID0gMSAtIGM7XHJcblxyXG4gIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XHJcbiAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcclxuICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XHJcblxyXG4gIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxyXG4gIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcclxuICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XHJcbiAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xyXG5cclxuICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcclxuICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XHJcbiAgb3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xyXG4gIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcclxuICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XHJcbiAgb3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xyXG4gIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcclxuICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XHJcbiAgb3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xyXG4gIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcclxuICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xyXG4gIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XHJcblxyXG4gIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcclxuICAgIG91dFsxMl0gPSBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhWzE1XTtcclxuICB9XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgbGV0IGExMCA9IGFbNF07XHJcbiAgbGV0IGExMSA9IGFbNV07XHJcbiAgbGV0IGExMiA9IGFbNl07XHJcbiAgbGV0IGExMyA9IGFbN107XHJcbiAgbGV0IGEyMCA9IGFbOF07XHJcbiAgbGV0IGEyMSA9IGFbOV07XHJcbiAgbGV0IGEyMiA9IGFbMTBdO1xyXG4gIGxldCBhMjMgPSBhWzExXTtcclxuXHJcbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcbiAgICBvdXRbMF0gID0gYVswXTtcclxuICAgIG91dFsxXSAgPSBhWzFdO1xyXG4gICAgb3V0WzJdICA9IGFbMl07XHJcbiAgICBvdXRbM10gID0gYVszXTtcclxuICAgIG91dFsxMl0gPSBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhWzE1XTtcclxuICB9XHJcblxyXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcclxuICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcclxuICBvdXRbNl0gPSBhMTIgKiBjICsgYTIyICogcztcclxuICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcclxuICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcclxuICBvdXRbOV0gPSBhMjEgKiBjIC0gYTExICogcztcclxuICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XHJcbiAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG4gIGxldCBhMDAgPSBhWzBdO1xyXG4gIGxldCBhMDEgPSBhWzFdO1xyXG4gIGxldCBhMDIgPSBhWzJdO1xyXG4gIGxldCBhMDMgPSBhWzNdO1xyXG4gIGxldCBhMjAgPSBhWzhdO1xyXG4gIGxldCBhMjEgPSBhWzldO1xyXG4gIGxldCBhMjIgPSBhWzEwXTtcclxuICBsZXQgYTIzID0gYVsxMV07XHJcblxyXG4gIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xyXG4gICAgb3V0WzRdICA9IGFbNF07XHJcbiAgICBvdXRbNV0gID0gYVs1XTtcclxuICAgIG91dFs2XSAgPSBhWzZdO1xyXG4gICAgb3V0WzddICA9IGFbN107XHJcbiAgICBvdXRbMTJdID0gYVsxMl07XHJcbiAgICBvdXRbMTNdID0gYVsxM107XHJcbiAgICBvdXRbMTRdID0gYVsxNF07XHJcbiAgICBvdXRbMTVdID0gYVsxNV07XHJcbiAgfVxyXG5cclxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcbiAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XHJcbiAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XHJcbiAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XHJcbiAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XHJcbiAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XHJcbiAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XHJcbiAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xyXG4gIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuICBsZXQgYTAwID0gYVswXTtcclxuICBsZXQgYTAxID0gYVsxXTtcclxuICBsZXQgYTAyID0gYVsyXTtcclxuICBsZXQgYTAzID0gYVszXTtcclxuICBsZXQgYTEwID0gYVs0XTtcclxuICBsZXQgYTExID0gYVs1XTtcclxuICBsZXQgYTEyID0gYVs2XTtcclxuICBsZXQgYTEzID0gYVs3XTtcclxuXHJcbiAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xyXG4gICAgb3V0WzhdICA9IGFbOF07XHJcbiAgICBvdXRbOV0gID0gYVs5XTtcclxuICAgIG91dFsxMF0gPSBhWzEwXTtcclxuICAgIG91dFsxMV0gPSBhWzExXTtcclxuICAgIG91dFsxMl0gPSBhWzEyXTtcclxuICAgIG91dFsxM10gPSBhWzEzXTtcclxuICAgIG91dFsxNF0gPSBhWzE0XTtcclxuICAgIG91dFsxNV0gPSBhWzE1XTtcclxuICB9XHJcblxyXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICBvdXRbMF0gPSBhMDAgKiBjICsgYTEwICogcztcclxuICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogcztcclxuICBvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogcztcclxuICBvdXRbM10gPSBhMDMgKiBjICsgYTEzICogcztcclxuICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogcztcclxuICBvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogcztcclxuICBvdXRbNl0gPSBhMTIgKiBjIC0gYTAyICogcztcclxuICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogcztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xyXG4gIG91dFswXSA9IDE7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSAxO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IDE7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IHZbMF07XHJcbiAgb3V0WzEzXSA9IHZbMV07XHJcbiAgb3V0WzE0XSA9IHZbMl07XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgU2NhbGluZyB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xyXG4gIG91dFswXSA9IHZbMF07XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSB2WzFdO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IHZbMl07XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlIGFyb3VuZCBhIGdpdmVuIGF4aXNcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkLCBheGlzKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkLCBheGlzKSB7XHJcbiAgbGV0IHggPSBheGlzWzBdLCB5ID0gYXhpc1sxXSwgeiA9IGF4aXNbMl07XHJcbiAgbGV0IGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xyXG4gIGxldCBzLCBjLCB0O1xyXG5cclxuICBpZiAoTWF0aC5hYnMobGVuKSA8IGdsTWF0cml4LkVQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cclxuXHJcbiAgbGVuID0gMSAvIGxlbjtcclxuICB4ICo9IGxlbjtcclxuICB5ICo9IGxlbjtcclxuICB6ICo9IGxlbjtcclxuXHJcbiAgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgYyA9IE1hdGguY29zKHJhZCk7XHJcbiAgdCA9IDEgLSBjO1xyXG5cclxuICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFswXSA9IHggKiB4ICogdCArIGM7XHJcbiAgb3V0WzFdID0geSAqIHggKiB0ICsgeiAqIHM7XHJcbiAgb3V0WzJdID0geiAqIHggKiB0IC0geSAqIHM7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSB4ICogeSAqIHQgLSB6ICogcztcclxuICBvdXRbNV0gPSB5ICogeSAqIHQgKyBjO1xyXG4gIG91dFs2XSA9IHogKiB5ICogdCArIHggKiBzO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0geCAqIHogKiB0ICsgeSAqIHM7XHJcbiAgb3V0WzldID0geSAqIHogKiB0IC0geCAqIHM7XHJcbiAgb3V0WzEwXSA9IHogKiB6ICogdCArIGM7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5yb3RhdGVYKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21YUm90YXRpb24ob3V0LCByYWQpIHtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcbiAgb3V0WzBdICA9IDE7XHJcbiAgb3V0WzFdICA9IDA7XHJcbiAgb3V0WzJdICA9IDA7XHJcbiAgb3V0WzNdICA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSBjO1xyXG4gIG91dFs2XSA9IHM7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IC1zO1xyXG4gIG91dFsxMF0gPSBjO1xyXG4gIG91dFsxMV0gPSAwO1xyXG4gIG91dFsxMl0gPSAwO1xyXG4gIG91dFsxM10gPSAwO1xyXG4gIG91dFsxNF0gPSAwO1xyXG4gIG91dFsxNV0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gIG91dFswXSAgPSBjO1xyXG4gIG91dFsxXSAgPSAwO1xyXG4gIG91dFsyXSAgPSAtcztcclxuICBvdXRbM10gID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDE7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IHM7XHJcbiAgb3V0WzldID0gMDtcclxuICBvdXRbMTBdID0gYztcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gMDtcclxuICBvdXRbMTVdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZVooZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVpSb3RhdGlvbihvdXQsIHJhZCkge1xyXG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcclxuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XHJcblxyXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICBvdXRbMF0gID0gYztcclxuICBvdXRbMV0gID0gcztcclxuICBvdXRbMl0gID0gMDtcclxuICBvdXRbM10gID0gMDtcclxuICBvdXRbNF0gPSAtcztcclxuICBvdXRbNV0gPSBjO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IDE7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IDA7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBxLCB2KSB7XHJcbiAgLy8gUXVhdGVybmlvbiBtYXRoXHJcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xyXG4gIGxldCB4MiA9IHggKyB4O1xyXG4gIGxldCB5MiA9IHkgKyB5O1xyXG4gIGxldCB6MiA9IHogKyB6O1xyXG5cclxuICBsZXQgeHggPSB4ICogeDI7XHJcbiAgbGV0IHh5ID0geCAqIHkyO1xyXG4gIGxldCB4eiA9IHggKiB6MjtcclxuICBsZXQgeXkgPSB5ICogeTI7XHJcbiAgbGV0IHl6ID0geSAqIHoyO1xyXG4gIGxldCB6eiA9IHogKiB6MjtcclxuICBsZXQgd3ggPSB3ICogeDI7XHJcbiAgbGV0IHd5ID0gdyAqIHkyO1xyXG4gIGxldCB3eiA9IHcgKiB6MjtcclxuXHJcbiAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcclxuICBvdXRbMV0gPSB4eSArIHd6O1xyXG4gIG91dFsyXSA9IHh6IC0gd3k7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSB4eSAtIHd6O1xyXG4gIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XHJcbiAgb3V0WzZdID0geXogKyB3eDtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IHh6ICsgd3k7XHJcbiAgb3V0WzldID0geXogLSB3eDtcclxuICBvdXRbMTBdID0gMSAtICh4eCArIHl5KTtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gdlswXTtcclxuICBvdXRbMTNdID0gdlsxXTtcclxuICBvdXRbMTRdID0gdlsyXTtcclxuICBvdXRbMTVdID0gMTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBmcm9tIGEgZHVhbCBxdWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBNYXRyaXhcclxuICogQHBhcmFtIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuICogQHJldHVybnMge21hdDR9IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdDIob3V0LCBhKSB7XHJcbiAgbGV0IHRyYW5zbGF0aW9uID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XHJcbiAgbGV0IGJ4ID0gLWFbMF0sIGJ5ID0gLWFbMV0sIGJ6ID0gLWFbMl0sIGJ3ID0gYVszXSxcclxuICBheCA9IGFbNF0sIGF5ID0gYVs1XSwgYXogPSBhWzZdLCBhdyA9IGFbN107XHJcbiAgXHJcbiAgbGV0IG1hZ25pdHVkZSA9IGJ4ICogYnggKyBieSAqIGJ5ICsgYnogKiBieiArIGJ3ICogYnc7XHJcbiAgLy9Pbmx5IHNjYWxlIGlmIGl0IG1ha2VzIHNlbnNlXHJcbiAgaWYgKG1hZ25pdHVkZSA+IDApIHtcclxuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMiAvIG1hZ25pdHVkZTtcclxuICAgIHRyYW5zbGF0aW9uWzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMiAvIG1hZ25pdHVkZTtcclxuICAgIHRyYW5zbGF0aW9uWzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMiAvIG1hZ25pdHVkZTtcclxuICB9IGVsc2Uge1xyXG4gICAgdHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyO1xyXG4gICAgdHJhbnNsYXRpb25bMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyO1xyXG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xyXG4gIH1cclxuICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXHJcbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXHJcbiAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xyXG4gIG91dFswXSA9IG1hdFsxMl07XHJcbiAgb3V0WzFdID0gbWF0WzEzXTtcclxuICBvdXRbMl0gPSBtYXRbMTRdO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlXHJcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcclxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxyXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XHJcbiAgbGV0IG0xMSA9IG1hdFswXTtcclxuICBsZXQgbTEyID0gbWF0WzFdO1xyXG4gIGxldCBtMTMgPSBtYXRbMl07XHJcbiAgbGV0IG0yMSA9IG1hdFs0XTtcclxuICBsZXQgbTIyID0gbWF0WzVdO1xyXG4gIGxldCBtMjMgPSBtYXRbNl07XHJcbiAgbGV0IG0zMSA9IG1hdFs4XTtcclxuICBsZXQgbTMyID0gbWF0WzldO1xyXG4gIGxldCBtMzMgPSBtYXRbMTBdO1xyXG5cclxuICBvdXRbMF0gPSBNYXRoLnNxcnQobTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzKTtcclxuICBvdXRbMV0gPSBNYXRoLnNxcnQobTIxICogbTIxICsgbTIyICogbTIyICsgbTIzICogbTIzKTtcclxuICBvdXRbMl0gPSBNYXRoLnNxcnQobTMxICogbTMxICsgbTMyICogbTMyICsgbTMzICogbTMzKTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb25hbCBjb21wb25lbnRcclxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXHJcbiAqICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiwgdGhlIHJldHVybmVkIHF1YXRlcm5pb24gd2lsbCBiZSB0aGVcclxuICogIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcclxuICogQHBhcmFtIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3RhdGlvbihvdXQsIG1hdCkge1xyXG4gIC8vIEFsZ29yaXRobSB0YWtlbiBmcm9tIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9tYXRyaXhUb1F1YXRlcm5pb24vaW5kZXguaHRtXHJcbiAgbGV0IHRyYWNlID0gbWF0WzBdICsgbWF0WzVdICsgbWF0WzEwXTtcclxuICBsZXQgUyA9IDA7XHJcblxyXG4gIGlmICh0cmFjZSA+IDApIHtcclxuICAgIFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMjtcclxuICAgIG91dFszXSA9IDAuMjUgKiBTO1xyXG4gICAgb3V0WzBdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTO1xyXG4gICAgb3V0WzFdID0gKG1hdFs4XSAtIG1hdFsyXSkgLyBTO1xyXG4gICAgb3V0WzJdID0gKG1hdFsxXSAtIG1hdFs0XSkgLyBTO1xyXG4gIH0gZWxzZSBpZiAoKG1hdFswXSA+IG1hdFs1XSkgJiYgKG1hdFswXSA+IG1hdFsxMF0pKSB7XHJcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFswXSAtIG1hdFs1XSAtIG1hdFsxMF0pICogMjtcclxuICAgIG91dFszXSA9IChtYXRbNl0gLSBtYXRbOV0pIC8gUztcclxuICAgIG91dFswXSA9IDAuMjUgKiBTO1xyXG4gICAgb3V0WzFdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTO1xyXG4gICAgb3V0WzJdID0gKG1hdFs4XSArIG1hdFsyXSkgLyBTO1xyXG4gIH0gZWxzZSBpZiAobWF0WzVdID4gbWF0WzEwXSkge1xyXG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbNV0gLSBtYXRbMF0gLSBtYXRbMTBdKSAqIDI7XHJcbiAgICBvdXRbM10gPSAobWF0WzhdIC0gbWF0WzJdKSAvIFM7XHJcbiAgICBvdXRbMF0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFM7XHJcbiAgICBvdXRbMV0gPSAwLjI1ICogUztcclxuICAgIG91dFsyXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gUztcclxuICB9IGVsc2Uge1xyXG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMTBdIC0gbWF0WzBdIC0gbWF0WzVdKSAqIDI7XHJcbiAgICBvdXRbM10gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFM7XHJcbiAgICBvdXRbMF0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFM7XHJcbiAgICBvdXRbMV0gPSAobWF0WzZdICsgbWF0WzldKSAvIFM7XHJcbiAgICBvdXRbMl0gPSAwLjI1ICogUztcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZVxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xyXG4gIC8vIFF1YXRlcm5pb24gbWF0aFxyXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcclxuICBsZXQgeDIgPSB4ICsgeDtcclxuICBsZXQgeTIgPSB5ICsgeTtcclxuICBsZXQgejIgPSB6ICsgejtcclxuXHJcbiAgbGV0IHh4ID0geCAqIHgyO1xyXG4gIGxldCB4eSA9IHggKiB5MjtcclxuICBsZXQgeHogPSB4ICogejI7XHJcbiAgbGV0IHl5ID0geSAqIHkyO1xyXG4gIGxldCB5eiA9IHkgKiB6MjtcclxuICBsZXQgenogPSB6ICogejI7XHJcbiAgbGV0IHd4ID0gdyAqIHgyO1xyXG4gIGxldCB3eSA9IHcgKiB5MjtcclxuICBsZXQgd3ogPSB3ICogejI7XHJcbiAgbGV0IHN4ID0gc1swXTtcclxuICBsZXQgc3kgPSBzWzFdO1xyXG4gIGxldCBzeiA9IHNbMl07XHJcblxyXG4gIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xyXG4gIG91dFsxXSA9ICh4eSArIHd6KSAqIHN4O1xyXG4gIG91dFsyXSA9ICh4eiAtIHd5KSAqIHN4O1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gKHh5IC0gd3opICogc3k7XHJcbiAgb3V0WzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XHJcbiAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAoeHogKyB3eSkgKiBzejtcclxuICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcclxuICBvdXRbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IHZbMF07XHJcbiAgb3V0WzEzXSA9IHZbMV07XHJcbiAgb3V0WzE0XSA9IHZbMl07XHJcbiAgb3V0WzE1XSA9IDE7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZSwgcm90YXRpbmcgYW5kIHNjYWxpbmcgYXJvdW5kIHRoZSBnaXZlbiBvcmlnaW5cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG9yaWdpbik7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luKG91dCwgcSwgdiwgcywgbykge1xyXG4gIC8vIFF1YXRlcm5pb24gbWF0aFxyXG4gIGxldCB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXTtcclxuICBsZXQgeDIgPSB4ICsgeDtcclxuICBsZXQgeTIgPSB5ICsgeTtcclxuICBsZXQgejIgPSB6ICsgejtcclxuXHJcbiAgbGV0IHh4ID0geCAqIHgyO1xyXG4gIGxldCB4eSA9IHggKiB5MjtcclxuICBsZXQgeHogPSB4ICogejI7XHJcbiAgbGV0IHl5ID0geSAqIHkyO1xyXG4gIGxldCB5eiA9IHkgKiB6MjtcclxuICBsZXQgenogPSB6ICogejI7XHJcbiAgbGV0IHd4ID0gdyAqIHgyO1xyXG4gIGxldCB3eSA9IHcgKiB5MjtcclxuICBsZXQgd3ogPSB3ICogejI7XHJcblxyXG4gIGxldCBzeCA9IHNbMF07XHJcbiAgbGV0IHN5ID0gc1sxXTtcclxuICBsZXQgc3ogPSBzWzJdO1xyXG5cclxuICBsZXQgb3ggPSBvWzBdO1xyXG4gIGxldCBveSA9IG9bMV07XHJcbiAgbGV0IG96ID0gb1syXTtcclxuXHJcbiAgbGV0IG91dDAgPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcclxuICBsZXQgb3V0MSA9ICh4eSArIHd6KSAqIHN4O1xyXG4gIGxldCBvdXQyID0gKHh6IC0gd3kpICogc3g7XHJcbiAgbGV0IG91dDQgPSAoeHkgLSB3eikgKiBzeTtcclxuICBsZXQgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xyXG4gIGxldCBvdXQ2ID0gKHl6ICsgd3gpICogc3k7XHJcbiAgbGV0IG91dDggPSAoeHogKyB3eSkgKiBzejtcclxuICBsZXQgb3V0OSA9ICh5eiAtIHd4KSAqIHN6O1xyXG4gIGxldCBvdXQxMCA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xyXG5cclxuICBvdXRbMF0gPSBvdXQwO1xyXG4gIG91dFsxXSA9IG91dDE7XHJcbiAgb3V0WzJdID0gb3V0MjtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IG91dDQ7XHJcbiAgb3V0WzVdID0gb3V0NTtcclxuICBvdXRbNl0gPSBvdXQ2O1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gb3V0ODtcclxuICBvdXRbOV0gPSBvdXQ5O1xyXG4gIG91dFsxMF0gPSBvdXQxMDtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveik7XHJcbiAgb3V0WzEzXSA9IHZbMV0gKyBveSAtIChvdXQxICogb3ggKyBvdXQ1ICogb3kgKyBvdXQ5ICogb3opO1xyXG4gIG91dFsxNF0gPSB2WzJdICsgb3ogLSAob3V0MiAqIG94ICsgb3V0NiAqIG95ICsgb3V0MTAgKiBveik7XHJcbiAgb3V0WzE1XSA9IDE7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcbiAqXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcclxuICBsZXQgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM107XHJcbiAgbGV0IHgyID0geCArIHg7XHJcbiAgbGV0IHkyID0geSArIHk7XHJcbiAgbGV0IHoyID0geiArIHo7XHJcblxyXG4gIGxldCB4eCA9IHggKiB4MjtcclxuICBsZXQgeXggPSB5ICogeDI7XHJcbiAgbGV0IHl5ID0geSAqIHkyO1xyXG4gIGxldCB6eCA9IHogKiB4MjtcclxuICBsZXQgenkgPSB6ICogeTI7XHJcbiAgbGV0IHp6ID0geiAqIHoyO1xyXG4gIGxldCB3eCA9IHcgKiB4MjtcclxuICBsZXQgd3kgPSB3ICogeTI7XHJcbiAgbGV0IHd6ID0gdyAqIHoyO1xyXG5cclxuICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcclxuICBvdXRbMV0gPSB5eCArIHd6O1xyXG4gIG91dFsyXSA9IHp4IC0gd3k7XHJcbiAgb3V0WzNdID0gMDtcclxuXHJcbiAgb3V0WzRdID0geXggLSB3ejtcclxuICBvdXRbNV0gPSAxIC0geHggLSB6ejtcclxuICBvdXRbNl0gPSB6eSArIHd4O1xyXG4gIG91dFs3XSA9IDA7XHJcblxyXG4gIG91dFs4XSA9IHp4ICsgd3k7XHJcbiAgb3V0WzldID0genkgLSB3eDtcclxuICBvdXRbMTBdID0gMSAtIHh4IC0geXk7XHJcbiAgb3V0WzExXSA9IDA7XHJcblxyXG4gIG91dFsxMl0gPSAwO1xyXG4gIG91dFsxM10gPSAwO1xyXG4gIG91dFsxNF0gPSAwO1xyXG4gIG91dFsxNV0gPSAxO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJ1c3R1bShvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XHJcbiAgbGV0IHJsID0gMSAvIChyaWdodCAtIGxlZnQpO1xyXG4gIGxldCB0YiA9IDEgLyAodG9wIC0gYm90dG9tKTtcclxuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gIG91dFswXSA9IChuZWFyICogMikgKiBybDtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IChuZWFyICogMikgKiB0YjtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcclxuICBvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiO1xyXG4gIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcclxuICBvdXRbMTFdID0gLTE7XHJcbiAgb3V0WzEyXSA9IDA7XHJcbiAgb3V0WzEzXSA9IDA7XHJcbiAgb3V0WzE0XSA9IChmYXIgKiBuZWFyICogMikgKiBuZjtcclxuICBvdXRbMTVdID0gMDtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcclxuICBsZXQgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKTtcclxuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gIG91dFswXSA9IGYgLyBhc3BlY3Q7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gMDtcclxuICBvdXRbNV0gPSBmO1xyXG4gIG91dFs2XSA9IDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSAwO1xyXG4gIG91dFs5XSA9IDA7XHJcbiAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xyXG4gIG91dFsxMV0gPSAtMTtcclxuICBvdXRbMTJdID0gMDtcclxuICBvdXRbMTNdID0gMDtcclxuICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xyXG4gIG91dFsxNV0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBmaWVsZCBvZiB2aWV3LlxyXG4gKiBUaGlzIGlzIHByaW1hcmlseSB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgcHJvamVjdGlvbiBtYXRyaWNlcyB0byBiZSB1c2VkXHJcbiAqIHdpdGggdGhlIHN0aWxsIGV4cGVyaWVtZW50YWwgV2ViVlIgQVBJLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBmb3YgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZvbGxvd2luZyB2YWx1ZXM6IHVwRGVncmVlcywgZG93bkRlZ3JlZXMsIGxlZnREZWdyZWVzLCByaWdodERlZ3JlZXNcclxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xyXG4gIGxldCB1cFRhbiA9IE1hdGgudGFuKGZvdi51cERlZ3JlZXMgKiBNYXRoLlBJLzE4MC4wKTtcclxuICBsZXQgZG93blRhbiA9IE1hdGgudGFuKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xyXG4gIGxldCBsZWZ0VGFuID0gTWF0aC50YW4oZm92LmxlZnREZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XHJcbiAgbGV0IHJpZ2h0VGFuID0gTWF0aC50YW4oZm92LnJpZ2h0RGVncmVlcyAqIE1hdGguUEkvMTgwLjApO1xyXG4gIGxldCB4U2NhbGUgPSAyLjAgLyAobGVmdFRhbiArIHJpZ2h0VGFuKTtcclxuICBsZXQgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbik7XHJcblxyXG4gIG91dFswXSA9IHhTY2FsZTtcclxuICBvdXRbMV0gPSAwLjA7XHJcbiAgb3V0WzJdID0gMC4wO1xyXG4gIG91dFszXSA9IDAuMDtcclxuICBvdXRbNF0gPSAwLjA7XHJcbiAgb3V0WzVdID0geVNjYWxlO1xyXG4gIG91dFs2XSA9IDAuMDtcclxuICBvdXRbN10gPSAwLjA7XHJcbiAgb3V0WzhdID0gLSgobGVmdFRhbiAtIHJpZ2h0VGFuKSAqIHhTY2FsZSAqIDAuNSk7XHJcbiAgb3V0WzldID0gKCh1cFRhbiAtIGRvd25UYW4pICogeVNjYWxlICogMC41KTtcclxuICBvdXRbMTBdID0gZmFyIC8gKG5lYXIgLSBmYXIpO1xyXG4gIG91dFsxMV0gPSAtMS4wO1xyXG4gIG91dFsxMl0gPSAwLjA7XHJcbiAgb3V0WzEzXSA9IDAuMDtcclxuICBvdXRbMTRdID0gKGZhciAqIG5lYXIpIC8gKG5lYXIgLSBmYXIpO1xyXG4gIG91dFsxNV0gPSAwLjA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xyXG4gIGxldCBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KTtcclxuICBsZXQgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XHJcbiAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcclxuICBvdXRbMF0gPSAtMiAqIGxyO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIG91dFs0XSA9IDA7XHJcbiAgb3V0WzVdID0gLTIgKiBidDtcclxuICBvdXRbNl0gPSAwO1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgb3V0WzhdID0gMDtcclxuICBvdXRbOV0gPSAwO1xyXG4gIG91dFsxMF0gPSAyICogbmY7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XHJcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XHJcbiAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xyXG4gIG91dFsxNV0gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpcy4gXHJcbiAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcclxuICBsZXQgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuO1xyXG4gIGxldCBleWV4ID0gZXllWzBdO1xyXG4gIGxldCBleWV5ID0gZXllWzFdO1xyXG4gIGxldCBleWV6ID0gZXllWzJdO1xyXG4gIGxldCB1cHggPSB1cFswXTtcclxuICBsZXQgdXB5ID0gdXBbMV07XHJcbiAgbGV0IHVweiA9IHVwWzJdO1xyXG4gIGxldCBjZW50ZXJ4ID0gY2VudGVyWzBdO1xyXG4gIGxldCBjZW50ZXJ5ID0gY2VudGVyWzFdO1xyXG4gIGxldCBjZW50ZXJ6ID0gY2VudGVyWzJdO1xyXG5cclxuICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJlxyXG4gICAgICBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcbiAgICAgIE1hdGguYWJzKGV5ZXogLSBjZW50ZXJ6KSA8IGdsTWF0cml4LkVQU0lMT04pIHtcclxuICAgIHJldHVybiBpZGVudGl0eShvdXQpO1xyXG4gIH1cclxuXHJcbiAgejAgPSBleWV4IC0gY2VudGVyeDtcclxuICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xyXG4gIHoyID0gZXlleiAtIGNlbnRlcno7XHJcblxyXG4gIGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKTtcclxuICB6MCAqPSBsZW47XHJcbiAgejEgKj0gbGVuO1xyXG4gIHoyICo9IGxlbjtcclxuXHJcbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xyXG4gIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcclxuICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XHJcbiAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XHJcbiAgaWYgKCFsZW4pIHtcclxuICAgIHgwID0gMDtcclxuICAgIHgxID0gMDtcclxuICAgIHgyID0gMDtcclxuICB9IGVsc2Uge1xyXG4gICAgbGVuID0gMSAvIGxlbjtcclxuICAgIHgwICo9IGxlbjtcclxuICAgIHgxICo9IGxlbjtcclxuICAgIHgyICo9IGxlbjtcclxuICB9XHJcblxyXG4gIHkwID0gejEgKiB4MiAtIHoyICogeDE7XHJcbiAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcclxuICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xyXG5cclxuICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcclxuICBpZiAoIWxlbikge1xyXG4gICAgeTAgPSAwO1xyXG4gICAgeTEgPSAwO1xyXG4gICAgeTIgPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZW4gPSAxIC8gbGVuO1xyXG4gICAgeTAgKj0gbGVuO1xyXG4gICAgeTEgKj0gbGVuO1xyXG4gICAgeTIgKj0gbGVuO1xyXG4gIH1cclxuXHJcbiAgb3V0WzBdID0geDA7XHJcbiAgb3V0WzFdID0geTA7XHJcbiAgb3V0WzJdID0gejA7XHJcbiAgb3V0WzNdID0gMDtcclxuICBvdXRbNF0gPSB4MTtcclxuICBvdXRbNV0gPSB5MTtcclxuICBvdXRbNl0gPSB6MTtcclxuICBvdXRbN10gPSAwO1xyXG4gIG91dFs4XSA9IHgyO1xyXG4gIG91dFs5XSA9IHkyO1xyXG4gIG91dFsxMF0gPSB6MjtcclxuICBvdXRbMTFdID0gMDtcclxuICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xyXG4gIG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleik7XHJcbiAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcclxuICBvdXRbMTVdID0gMTtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0VG8ob3V0LCBleWUsIHRhcmdldCwgdXApIHtcclxuICBsZXQgZXlleCA9IGV5ZVswXSxcclxuICAgICAgZXlleSA9IGV5ZVsxXSxcclxuICAgICAgZXlleiA9IGV5ZVsyXSxcclxuICAgICAgdXB4ID0gdXBbMF0sXHJcbiAgICAgIHVweSA9IHVwWzFdLFxyXG4gICAgICB1cHogPSB1cFsyXTtcclxuXHJcbiAgbGV0IHowID0gZXlleCAtIHRhcmdldFswXSxcclxuICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxyXG4gICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XHJcblxyXG4gIGxldCBsZW4gPSB6MCp6MCArIHoxKnoxICsgejIqejI7XHJcbiAgaWYgKGxlbiA+IDApIHtcclxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuICAgIHowICo9IGxlbjtcclxuICAgIHoxICo9IGxlbjtcclxuICAgIHoyICo9IGxlbjtcclxuICB9XHJcblxyXG4gIGxldCB4MCA9IHVweSAqIHoyIC0gdXB6ICogejEsXHJcbiAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcclxuICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xyXG5cclxuICBsZW4gPSB4MCp4MCArIHgxKngxICsgeDIqeDI7XHJcbiAgaWYgKGxlbiA+IDApIHtcclxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuICAgIHgwICo9IGxlbjtcclxuICAgIHgxICo9IGxlbjtcclxuICAgIHgyICo9IGxlbjtcclxuICB9XHJcblxyXG4gIG91dFswXSA9IHgwO1xyXG4gIG91dFsxXSA9IHgxO1xyXG4gIG91dFsyXSA9IHgyO1xyXG4gIG91dFszXSA9IDA7XHJcbiAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XHJcbiAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XHJcbiAgb3V0WzZdID0gejAgKiB4MSAtIHoxICogeDA7XHJcbiAgb3V0WzddID0gMDtcclxuICBvdXRbOF0gPSB6MDtcclxuICBvdXRbOV0gPSB6MTtcclxuICBvdXRbMTBdID0gejI7XHJcbiAgb3V0WzExXSA9IDA7XHJcbiAgb3V0WzEyXSA9IGV5ZXg7XHJcbiAgb3V0WzEzXSA9IGV5ZXk7XHJcbiAgb3V0WzE0XSA9IGV5ZXo7XHJcbiAgb3V0WzE1XSA9IDE7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdtYXQ0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArXHJcbiAgICAgICAgICBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArXHJcbiAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICtcclxuICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XHJcbiAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikgKyBNYXRoLnBvdyhhWzldLCAyKSArIE1hdGgucG93KGFbMTBdLCAyKSArIE1hdGgucG93KGFbMTFdLCAyKSArIE1hdGgucG93KGFbMTJdLCAyKSArIE1hdGgucG93KGFbMTNdLCAyKSArIE1hdGgucG93KGFbMTRdLCAyKSArIE1hdGgucG93KGFbMTVdLCAyKSApKVxyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gbWF0NCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSArIGJbM107XHJcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XHJcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XHJcbiAgb3V0WzZdID0gYVs2XSArIGJbNl07XHJcbiAgb3V0WzddID0gYVs3XSArIGJbN107XHJcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XHJcbiAgb3V0WzldID0gYVs5XSArIGJbOV07XHJcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XHJcbiAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV07XHJcbiAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl07XHJcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XHJcbiAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF07XHJcbiAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcclxuICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcclxuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcclxuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcclxuICBvdXRbN10gPSBhWzddIC0gYls3XTtcclxuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcclxuICBvdXRbOV0gPSBhWzldIC0gYls5XTtcclxuICBvdXRbMTBdID0gYVsxMF0gLSBiWzEwXTtcclxuICBvdXRbMTFdID0gYVsxMV0gLSBiWzExXTtcclxuICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcclxuICBvdXRbMTNdID0gYVsxM10gLSBiWzEzXTtcclxuICBvdXRbMTRdID0gYVsxNF0gLSBiWzE0XTtcclxuICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKiBiO1xyXG4gIG91dFsxXSA9IGFbMV0gKiBiO1xyXG4gIG91dFsyXSA9IGFbMl0gKiBiO1xyXG4gIG91dFszXSA9IGFbM10gKiBiO1xyXG4gIG91dFs0XSA9IGFbNF0gKiBiO1xyXG4gIG91dFs1XSA9IGFbNV0gKiBiO1xyXG4gIG91dFs2XSA9IGFbNl0gKiBiO1xyXG4gIG91dFs3XSA9IGFbN10gKiBiO1xyXG4gIG91dFs4XSA9IGFbOF0gKiBiO1xyXG4gIG91dFs5XSA9IGFbOV0gKiBiO1xyXG4gIG91dFsxMF0gPSBhWzEwXSAqIGI7XHJcbiAgb3V0WzExXSA9IGFbMTFdICogYjtcclxuICBvdXRbMTJdID0gYVsxMl0gKiBiO1xyXG4gIG91dFsxM10gPSBhWzEzXSAqIGI7XHJcbiAgb3V0WzE0XSA9IGFbMTRdICogYjtcclxuICBvdXRbMTVdID0gYVsxNV0gKiBiO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQ0J3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XHJcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xyXG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcclxuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XHJcbiAgb3V0WzRdID0gYVs0XSArIChiWzRdICogc2NhbGUpO1xyXG4gIG91dFs1XSA9IGFbNV0gKyAoYls1XSAqIHNjYWxlKTtcclxuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XHJcbiAgb3V0WzddID0gYVs3XSArIChiWzddICogc2NhbGUpO1xyXG4gIG91dFs4XSA9IGFbOF0gKyAoYls4XSAqIHNjYWxlKTtcclxuICBvdXRbOV0gPSBhWzldICsgKGJbOV0gKiBzY2FsZSk7XHJcbiAgb3V0WzEwXSA9IGFbMTBdICsgKGJbMTBdICogc2NhbGUpO1xyXG4gIG91dFsxMV0gPSBhWzExXSArIChiWzExXSAqIHNjYWxlKTtcclxuICBvdXRbMTJdID0gYVsxMl0gKyAoYlsxMl0gKiBzY2FsZSk7XHJcbiAgb3V0WzEzXSA9IGFbMTNdICsgKGJbMTNdICogc2NhbGUpO1xyXG4gIG91dFsxNF0gPSBhWzE0XSArIChiWzE0XSAqIHNjYWxlKTtcclxuICBvdXRbMTVdID0gYVsxNV0gKyAoYlsxNV0gKiBzY2FsZSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJlxyXG4gICAgICAgICBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiYgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmXHJcbiAgICAgICAgIGFbOF0gPT09IGJbOF0gJiYgYVs5XSA9PT0gYls5XSAmJiBhWzEwXSA9PT0gYlsxMF0gJiYgYVsxMV0gPT09IGJbMTFdICYmXHJcbiAgICAgICAgIGFbMTJdID09PSBiWzEyXSAmJiBhWzEzXSA9PT0gYlsxM10gJiYgYVsxNF0gPT09IGJbMTRdICYmIGFbMTVdID09PSBiWzE1XTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwICA9IGFbMF0sICBhMSAgPSBhWzFdLCAgYTIgID0gYVsyXSwgIGEzICA9IGFbM107XHJcbiAgbGV0IGE0ICA9IGFbNF0sICBhNSAgPSBhWzVdLCAgYTYgID0gYVs2XSwgIGE3ICA9IGFbN107XHJcbiAgbGV0IGE4ICA9IGFbOF0sICBhOSAgPSBhWzldLCAgYTEwID0gYVsxMF0sIGExMSA9IGFbMTFdO1xyXG4gIGxldCBhMTIgPSBhWzEyXSwgYTEzID0gYVsxM10sIGExNCA9IGFbMTRdLCBhMTUgPSBhWzE1XTtcclxuXHJcbiAgbGV0IGIwICA9IGJbMF0sICBiMSAgPSBiWzFdLCAgYjIgID0gYlsyXSwgIGIzICA9IGJbM107XHJcbiAgbGV0IGI0ICA9IGJbNF0sICBiNSAgPSBiWzVdLCAgYjYgID0gYls2XSwgIGI3ICA9IGJbN107XHJcbiAgbGV0IGI4ICA9IGJbOF0sICBiOSAgPSBiWzldLCAgYjEwID0gYlsxMF0sIGIxMSA9IGJbMTFdO1xyXG4gIGxldCBiMTIgPSBiWzEyXSwgYjEzID0gYlsxM10sIGIxNCA9IGJbMTRdLCBiMTUgPSBiWzE1XTtcclxuXHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNSAtIGI1KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNiAtIGI2KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhOCAtIGI4KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhOSAtIGI5KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTkpLCBNYXRoLmFicyhiOSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMTAgLSBiMTApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTApLCBNYXRoLmFicyhiMTApKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTExIC0gYjExKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTExKSwgTWF0aC5hYnMoYjExKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExMiAtIGIxMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMiksIE1hdGguYWJzKGIxMikpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMTMgLSBiMTMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTMpLCBNYXRoLmFicyhiMTMpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTE0IC0gYjE0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE0KSwgTWF0aC5hYnMoYjE0KSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExNSAtIGIxNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNSksIE1hdGguYWJzKGIxNSkpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0LnN1YnRyYWN0fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIDMgRGltZW5zaW9uYWwgVmVjdG9yXHJcbiAqIEBtb2R1bGUgdmVjM1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXHJcbiAqXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xyXG4gIG91dFswXSA9IDA7XHJcbiAgb3V0WzFdID0gMDtcclxuICBvdXRbMl0gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xyXG4gIGxldCB4ID0gYVswXTtcclxuICBsZXQgeSA9IGFbMV07XHJcbiAgbGV0IHogPSBhWzJdO1xyXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeikge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcclxuICBvdXRbMF0gPSB4O1xyXG4gIG91dFsxXSA9IHk7XHJcbiAgb3V0WzJdID0gejtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xyXG4gIG91dFswXSA9IHg7XHJcbiAgb3V0WzFdID0geTtcclxuICBvdXRbMl0gPSB6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xyXG4gIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNlaWxcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gZmxvb3JcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcm91bmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcclxuICBvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XHJcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xyXG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XHJcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcclxuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xyXG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XHJcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcclxuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xyXG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XHJcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcclxuICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIGxldCB6ID0gYVsyXTtcclxuICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xyXG59XHJcblxyXG4vKipcclxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAtYVswXTtcclxuICBvdXRbMV0gPSAtYVsxXTtcclxuICBvdXRbMl0gPSAtYVsyXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcclxuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xyXG4gIG91dFsyXSA9IDEuMCAvIGFbMl07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIGxldCB6ID0gYVsyXTtcclxuICBsZXQgbGVuID0geCp4ICsgeSp5ICsgeip6O1xyXG4gIGlmIChsZW4gPiAwKSB7XHJcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcclxuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XHJcbiAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcclxuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xyXG59XHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XHJcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl07XHJcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XHJcblxyXG4gIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xyXG4gIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xyXG4gIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xyXG4gIGxldCBheCA9IGFbMF07XHJcbiAgbGV0IGF5ID0gYVsxXTtcclxuICBsZXQgYXogPSBhWzJdO1xyXG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xyXG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xyXG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGhlcm1pdGUgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcclxuICBsZXQgZmFjdG9yMSA9IGZhY3RvclRpbWVzMiAqICgyICogdCAtIDMpICsgMTtcclxuICBsZXQgZmFjdG9yMiA9IGZhY3RvclRpbWVzMiAqICh0IC0gMikgKyB0O1xyXG4gIGxldCBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKTtcclxuICBsZXQgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqICgzIC0gMiAqIHQpO1xyXG5cclxuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcclxuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcclxuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgYmV6aWVyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBjIHRoZSB0aGlyZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYmV6aWVyKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG4gIGxldCBpbnZlcnNlRmFjdG9yID0gMSAtIHQ7XHJcbiAgbGV0IGludmVyc2VGYWN0b3JUaW1lc1R3byA9IGludmVyc2VGYWN0b3IgKiBpbnZlcnNlRmFjdG9yO1xyXG4gIGxldCBmYWN0b3JUaW1lczIgPSB0ICogdDtcclxuICBsZXQgZmFjdG9yMSA9IGludmVyc2VGYWN0b3JUaW1lc1R3byAqIGludmVyc2VGYWN0b3I7XHJcbiAgbGV0IGZhY3RvcjIgPSAzICogdCAqIGludmVyc2VGYWN0b3JUaW1lc1R3bztcclxuICBsZXQgZmFjdG9yMyA9IDMgKiBmYWN0b3JUaW1lczIgKiBpbnZlcnNlRmFjdG9yO1xyXG4gIGxldCBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogdDtcclxuXHJcbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjQ7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcclxuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcclxuXHJcbiAgbGV0IHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XHJcbiAgbGV0IHogPSAoZ2xNYXRyaXguUkFORE9NKCkgKiAyLjApIC0gMS4wO1xyXG4gIGxldCB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wLXoqeikgKiBzY2FsZTtcclxuXHJcbiAgb3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGU7XHJcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XHJcbiAgb3V0WzJdID0geiAqIHNjYWxlO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxyXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcclxuICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcclxuICB3ID0gdyB8fCAxLjA7XHJcbiAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XHJcbiAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XHJcbiAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xyXG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xyXG4gIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcclxuICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XHJcbiAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XHJcbiAqIENhbiBhbHNvIGJlIHVzZWQgZm9yIGR1YWwgcXVhdGVybmlvbnMuIChNdWx0aXBseSBpdCB3aXRoIHRoZSByZWFsIHBhcnQpXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcclxuICAgIC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxyXG4gICAgbGV0IHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXTtcclxuICAgIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xyXG4gICAgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XHJcbiAgICAvLyB2YXIgdXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCBhKTtcclxuICAgIGxldCB1dnggPSBxeSAqIHogLSBxeiAqIHksXHJcbiAgICAgICAgdXZ5ID0gcXogKiB4IC0gcXggKiB6LFxyXG4gICAgICAgIHV2eiA9IHF4ICogeSAtIHF5ICogeDtcclxuICAgIC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XHJcbiAgICBsZXQgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnksXHJcbiAgICAgICAgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXHJcbiAgICAgICAgdXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dng7XHJcbiAgICAvLyB2ZWMzLnNjYWxlKHV2LCB1diwgMiAqIHcpO1xyXG4gICAgbGV0IHcyID0gcXcgKiAyO1xyXG4gICAgdXZ4ICo9IHcyO1xyXG4gICAgdXZ5ICo9IHcyO1xyXG4gICAgdXZ6ICo9IHcyO1xyXG4gICAgLy8gdmVjMy5zY2FsZSh1dXYsIHV1diwgMik7XHJcbiAgICB1dXZ4ICo9IDI7XHJcbiAgICB1dXZ5ICo9IDI7XHJcbiAgICB1dXZ6ICo9IDI7XHJcbiAgICAvLyByZXR1cm4gdmVjMy5hZGQob3V0LCBhLCB2ZWMzLmFkZChvdXQsIHV2LCB1dXYpKTtcclxuICAgIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xyXG4gICAgb3V0WzFdID0geSArIHV2eSArIHV1dnk7XHJcbiAgICBvdXRbMl0gPSB6ICsgdXZ6ICsgdXV2ejtcclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB4LWF4aXNcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIGIsIGMpe1xyXG4gIGxldCBwID0gW10sIHI9W107XHJcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcclxuICBwWzFdID0gYVsxXSAtIGJbMV07XHJcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xyXG5cclxuICAvL3BlcmZvcm0gcm90YXRpb25cclxuICByWzBdID0gcFswXTtcclxuICByWzFdID0gcFsxXSpNYXRoLmNvcyhjKSAtIHBbMl0qTWF0aC5zaW4oYyk7XHJcbiAgclsyXSA9IHBbMV0qTWF0aC5zaW4oYykgKyBwWzJdKk1hdGguY29zKGMpO1xyXG5cclxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgb3V0WzBdID0gclswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIGIsIGMpe1xyXG4gIGxldCBwID0gW10sIHI9W107XHJcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcclxuICBwWzFdID0gYVsxXSAtIGJbMV07XHJcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xyXG5cclxuICAvL3BlcmZvcm0gcm90YXRpb25cclxuICByWzBdID0gcFsyXSpNYXRoLnNpbihjKSArIHBbMF0qTWF0aC5jb3MoYyk7XHJcbiAgclsxXSA9IHBbMV07XHJcbiAgclsyXSA9IHBbMl0qTWF0aC5jb3MoYykgLSBwWzBdKk1hdGguc2luKGMpO1xyXG5cclxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgb3V0WzBdID0gclswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIGIsIGMpe1xyXG4gIGxldCBwID0gW10sIHI9W107XHJcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcclxuICBwWzFdID0gYVsxXSAtIGJbMV07XHJcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xyXG5cclxuICAvL3BlcmZvcm0gcm90YXRpb25cclxuICByWzBdID0gcFswXSpNYXRoLmNvcyhjKSAtIHBbMV0qTWF0aC5zaW4oYyk7XHJcbiAgclsxXSA9IHBbMF0qTWF0aC5zaW4oYykgKyBwWzFdKk1hdGguY29zKGMpO1xyXG4gIHJbMl0gPSBwWzJdO1xyXG5cclxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgb3V0WzBdID0gclswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDNEIHZlY3RvcnNcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhbmdsZShhLCBiKSB7XHJcbiAgbGV0IHRlbXBBID0gZnJvbVZhbHVlcyhhWzBdLCBhWzFdLCBhWzJdKTtcclxuICBsZXQgdGVtcEIgPSBmcm9tVmFsdWVzKGJbMF0sIGJbMV0sIGJbMl0pO1xyXG5cclxuICBub3JtYWxpemUodGVtcEEsIHRlbXBBKTtcclxuICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTtcclxuXHJcbiAgbGV0IGNvc2luZSA9IGRvdCh0ZW1wQSwgdGVtcEIpO1xyXG5cclxuICBpZihjb3NpbmUgPiAxLjApIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuICBlbHNlIGlmKGNvc2luZSA8IC0xLjApIHtcclxuICAgIHJldHVybiBNYXRoLlBJO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XHJcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl07XHJcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl07XHJcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWRMZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XHJcblxyXG4vKipcclxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjM3MgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xyXG4gIGxldCB2ZWMgPSBjcmVhdGUoKTtcclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG4gICAgbGV0IGksIGw7XHJcbiAgICBpZighc3RyaWRlKSB7XHJcbiAgICAgIHN0cmlkZSA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIW9mZnNldCkge1xyXG4gICAgICBvZmZzZXQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGNvdW50KSB7XHJcbiAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsID0gYS5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG4gICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcclxuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XHJcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhO1xyXG4gIH07XHJcbn0pKCk7XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcclxuXHJcbi8qKlxyXG4gKiA0IERpbWVuc2lvbmFsIFZlY3RvclxyXG4gKiBAbW9kdWxlIHZlYzRcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSBhWzBdO1xyXG4gIG91dFsxXSA9IGFbMV07XHJcbiAgb3V0WzJdID0gYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHksIHosIHcpIHtcclxuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XHJcbiAgb3V0WzBdID0geDtcclxuICBvdXRbMV0gPSB5O1xyXG4gIG91dFsyXSA9IHo7XHJcbiAgb3V0WzNdID0gdztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XHJcbiAgb3V0WzBdID0geDtcclxuICBvdXRbMV0gPSB5O1xyXG4gIG91dFsyXSA9IHo7XHJcbiAgb3V0WzNdID0gdztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQWRkcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSArIGJbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcclxuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICogYlszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogRGl2aWRlcyB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XHJcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XHJcbiAgb3V0WzNdID0gYVszXSAvIGJbM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjZWlsXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pO1xyXG4gIG91dFszXSA9IE1hdGguY2VpbChhWzNdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBmbG9vclxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XHJcbiAgb3V0WzNdID0gTWF0aC5mbG9vcihhWzNdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XHJcbiAgb3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzQnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xyXG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xyXG4gIG91dFszXSA9IE1hdGgubWF4KGFbM10sIGJbM10pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XHJcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcclxuICBvdXRbM10gPSBNYXRoLnJvdW5kKGFbM10pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XHJcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xyXG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcclxuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xyXG4gIGxldCB4ID0gYlswXSAtIGFbMF07XHJcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcclxuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xyXG4gIGxldCB3ID0gYlszXSAtIGFbM107XHJcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcclxuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xyXG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XHJcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcclxuICBsZXQgdyA9IGJbM10gLSBhWzNdO1xyXG4gIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XHJcbiAgbGV0IHggPSBhWzBdO1xyXG4gIGxldCB5ID0gYVsxXTtcclxuICBsZXQgeiA9IGFbMl07XHJcbiAgbGV0IHcgPSBhWzNdO1xyXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XHJcbiAgbGV0IHggPSBhWzBdO1xyXG4gIGxldCB5ID0gYVsxXTtcclxuICBsZXQgeiA9IGFbMl07XHJcbiAgbGV0IHcgPSBhWzNdO1xyXG4gIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xyXG4gIG91dFswXSA9IC1hWzBdO1xyXG4gIG91dFsxXSA9IC1hWzFdO1xyXG4gIG91dFsyXSA9IC1hWzJdO1xyXG4gIG91dFszXSA9IC1hWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xyXG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XHJcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcclxuICBvdXRbM10gPSAxLjAgLyBhWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxpemUgYSB2ZWM0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XHJcbiAgbGV0IHggPSBhWzBdO1xyXG4gIGxldCB5ID0gYVsxXTtcclxuICBsZXQgeiA9IGFbMl07XHJcbiAgbGV0IHcgPSBhWzNdO1xyXG4gIGxldCBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XHJcbiAgaWYgKGxlbiA+IDApIHtcclxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuICAgIG91dFswXSA9IHggKiBsZW47XHJcbiAgICBvdXRbMV0gPSB5ICogbGVuO1xyXG4gICAgb3V0WzJdID0geiAqIGxlbjtcclxuICAgIG91dFszXSA9IHcgKiBsZW47XHJcbiAgfVxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xyXG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XHJcbiAgbGV0IGF4ID0gYVswXTtcclxuICBsZXQgYXkgPSBhWzFdO1xyXG4gIGxldCBheiA9IGFbMl07XHJcbiAgbGV0IGF3ID0gYVszXTtcclxuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcclxuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcclxuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcclxuICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHZlY3RvclNjYWxlKSB7XHJcbiAgdmVjdG9yU2NhbGUgPSB2ZWN0b3JTY2FsZSB8fCAxLjA7XHJcblxyXG4gIC8vVE9ETzogVGhpcyBpcyBhIHByZXR0eSBhd2Z1bCB3YXkgb2YgZG9pbmcgdGhpcy4gRmluZCBzb21ldGhpbmcgYmV0dGVyLlxyXG4gIG91dFswXSA9IGdsTWF0cml4LlJBTkRPTSgpO1xyXG4gIG91dFsxXSA9IGdsTWF0cml4LlJBTkRPTSgpO1xyXG4gIG91dFsyXSA9IGdsTWF0cml4LlJBTkRPTSgpO1xyXG4gIG91dFszXSA9IGdsTWF0cml4LlJBTkRPTSgpO1xyXG4gIG5vcm1hbGl6ZShvdXQsIG91dCk7XHJcbiAgc2NhbGUob3V0LCBvdXQsIHZlY3RvclNjYWxlKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuICogQHJldHVybnMge3ZlYzR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XHJcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sIHcgPSBhWzNdO1xyXG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcclxuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSAqIHc7XHJcbiAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogdztcclxuICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcclxuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcclxuICBsZXQgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdO1xyXG5cclxuICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xyXG4gIGxldCBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcclxuICBsZXQgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XHJcbiAgbGV0IGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xyXG4gIGxldCBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XHJcblxyXG4gIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcclxuICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xyXG4gIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XHJcbiAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcclxuICByZXR1cm4gJ3ZlYzQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcclxuICBsZXQgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xyXG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG4gICAgICAgICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGl2ID0gZGl2aWRlO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGlzdCA9IGRpc3RhbmNlO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkTGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cclxuICpcclxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxyXG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzRzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcclxuICBsZXQgdmVjID0gY3JlYXRlKCk7XHJcblxyXG4gIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuICAgIGxldCBpLCBsO1xyXG4gICAgaWYoIXN0cmlkZSkge1xyXG4gICAgICBzdHJpZGUgPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFvZmZzZXQpIHtcclxuICAgICAgb2Zmc2V0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZihjb3VudCkge1xyXG4gICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbCA9IGEubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07IHZlY1szXSA9IGFbaSszXTtcclxuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XHJcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGE7XHJcbiAgfTtcclxufSkoKTtcclxuIiwiLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiXHJcbmltcG9ydCAqIGFzIG1hdDMgZnJvbSBcIi4vbWF0My5qc1wiXHJcbmltcG9ydCAqIGFzIHZlYzMgZnJvbSBcIi4vdmVjMy5qc1wiXHJcbmltcG9ydCAqIGFzIHZlYzQgZnJvbSBcIi4vdmVjNC5qc1wiXHJcblxyXG4vKipcclxuICogUXVhdGVybmlvblxyXG4gKiBAbW9kdWxlIHF1YXRcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XHJcbiAqXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcbiAgb3V0WzBdID0gMDtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXHJcbiAqIHRoZW4gcmV0dXJucyBpdC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcclxuICByYWQgPSByYWQgKiAwLjU7XHJcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG4gIG91dFswXSA9IHMgKiBheGlzWzBdO1xyXG4gIG91dFsxXSA9IHMgKiBheGlzWzFdO1xyXG4gIG91dFsyXSA9IHMgKiBheGlzWzJdO1xyXG4gIG91dFszXSA9IE1hdGguY29zKHJhZCk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHJvdGF0aW9uIGF4aXMgYW5kIGFuZ2xlIGZvciBhIGdpdmVuXHJcbiAqICBxdWF0ZXJuaW9uLiBJZiBhIHF1YXRlcm5pb24gaXMgY3JlYXRlZCB3aXRoXHJcbiAqICBzZXRBeGlzQW5nbGUsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBzYW1lXHJcbiAqICB2YWx1ZXMgYXMgcHJvdmlkaWVkIGluIHRoZSBvcmlnaW5hbCBwYXJhbWV0ZXIgbGlzdFxyXG4gKiAgT1IgZnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdmFsdWVzLlxyXG4gKiBFeGFtcGxlOiBUaGUgcXVhdGVybmlvbiBmb3JtZWQgYnkgYXhpcyBbMCwgMCwgMV0gYW5kXHJcbiAqICBhbmdsZSAtOTAgaXMgdGhlIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5XHJcbiAqICBbMCwgMCwgMV0gYW5kIDI3MC4gVGhpcyBtZXRob2QgZmF2b3JzIHRoZSBsYXR0ZXIuXHJcbiAqIEBwYXJhbSAge3ZlYzN9IG91dF9heGlzICBWZWN0b3IgcmVjZWl2aW5nIHRoZSBheGlzIG9mIHJvdGF0aW9uXHJcbiAqIEBwYXJhbSAge3F1YXR9IHEgICAgIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBBbmdsZSwgaW4gcmFkaWFucywgb2YgdGhlIHJvdGF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXhpc0FuZ2xlKG91dF9heGlzLCBxKSB7XHJcbiAgbGV0IHJhZCA9IE1hdGguYWNvcyhxWzNdKSAqIDIuMDtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCAvIDIuMCk7XHJcbiAgaWYgKHMgIT0gMC4wKSB7XHJcbiAgICBvdXRfYXhpc1swXSA9IHFbMF0gLyBzO1xyXG4gICAgb3V0X2F4aXNbMV0gPSBxWzFdIC8gcztcclxuICAgIG91dF9heGlzWzJdID0gcVsyXSAvIHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIElmIHMgaXMgemVybywgcmV0dXJuIGFueSBheGlzIChubyByb3RhdGlvbiAtIGF4aXMgZG9lcyBub3QgbWF0dGVyKVxyXG4gICAgb3V0X2F4aXNbMF0gPSAxO1xyXG4gICAgb3V0X2F4aXNbMV0gPSAwO1xyXG4gICAgb3V0X2F4aXNbMl0gPSAwO1xyXG4gIH1cclxuICByZXR1cm4gcmFkO1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gcXVhdCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcclxuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xyXG5cclxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xyXG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XHJcbiAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcclxuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcclxuICByYWQgKj0gMC41O1xyXG5cclxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xyXG4gIGxldCBieCA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XHJcbiAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XHJcbiAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XHJcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xyXG4gIHJhZCAqPSAwLjU7XHJcblxyXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XHJcbiAgbGV0IGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xyXG5cclxuICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcclxuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieTtcclxuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieTtcclxuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XHJcbiAgcmFkICo9IDAuNTtcclxuXHJcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcclxuICBsZXQgYnogPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XHJcblxyXG4gIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xyXG4gIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xyXG4gIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xyXG4gIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cclxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cclxuICogQW55IGV4aXN0aW5nIFcgY29tcG9uZW50IHdpbGwgYmUgaWdub3JlZC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlVyhvdXQsIGEpIHtcclxuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcclxuXHJcbiAgb3V0WzBdID0geDtcclxuICBvdXRbMV0gPSB5O1xyXG4gIG91dFsyXSA9IHo7XHJcbiAgb3V0WzNdID0gTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcclxuICAvLyBiZW5jaG1hcmtzOlxyXG4gIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXHJcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcclxuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xyXG5cclxuICBsZXQgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTE7XHJcblxyXG4gIC8vIGNhbGMgY29zaW5lXHJcbiAgY29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3O1xyXG4gIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxyXG4gIGlmICggY29zb20gPCAwLjAgKSB7XHJcbiAgICBjb3NvbSA9IC1jb3NvbTtcclxuICAgIGJ4ID0gLSBieDtcclxuICAgIGJ5ID0gLSBieTtcclxuICAgIGJ6ID0gLSBiejtcclxuICAgIGJ3ID0gLSBidztcclxuICB9XHJcbiAgLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xyXG4gIGlmICggKDEuMCAtIGNvc29tKSA+IDAuMDAwMDAxICkge1xyXG4gICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXHJcbiAgICBvbWVnYSAgPSBNYXRoLmFjb3MoY29zb20pO1xyXG4gICAgc2lub20gID0gTWF0aC5zaW4ob21lZ2EpO1xyXG4gICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XHJcbiAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcclxuICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cclxuICAgIHNjYWxlMCA9IDEuMCAtIHQ7XHJcbiAgICBzY2FsZTEgPSB0O1xyXG4gIH1cclxuICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXHJcbiAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcclxuICBvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5O1xyXG4gIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XHJcbiAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xyXG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XHJcbiAgbGV0IGRvdCA9IGEwKmEwICsgYTEqYTEgKyBhMiphMiArIGEzKmEzO1xyXG4gIGxldCBpbnZEb3QgPSBkb3QgPyAxLjAvZG90IDogMDtcclxuXHJcbiAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcclxuXHJcbiAgb3V0WzBdID0gLWEwKmludkRvdDtcclxuICBvdXRbMV0gPSAtYTEqaW52RG90O1xyXG4gIG91dFsyXSA9IC1hMippbnZEb3Q7XHJcbiAgb3V0WzNdID0gYTMqaW52RG90O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XHJcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb25qdWdhdGUob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gLWFbMF07XHJcbiAgb3V0WzFdID0gLWFbMV07XHJcbiAgb3V0WzJdID0gLWFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cclxuICpcclxuICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcclxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQzKG91dCwgbSkge1xyXG4gIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXHJcbiAgLy8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXHJcbiAgbGV0IGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcclxuICBsZXQgZlJvb3Q7XHJcblxyXG4gIGlmICggZlRyYWNlID4gMC4wICkge1xyXG4gICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxyXG4gICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgIC8vIDJ3XHJcbiAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcclxuICAgIGZSb290ID0gMC41L2ZSb290OyAgLy8gMS8oNHcpXHJcbiAgICBvdXRbMF0gPSAobVs1XS1tWzddKSpmUm9vdDtcclxuICAgIG91dFsxXSA9IChtWzZdLW1bMl0pKmZSb290O1xyXG4gICAgb3V0WzJdID0gKG1bMV0tbVszXSkqZlJvb3Q7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIHx3fCA8PSAxLzJcclxuICAgIGxldCBpID0gMDtcclxuICAgIGlmICggbVs0XSA+IG1bMF0gKVxyXG4gICAgICBpID0gMTtcclxuICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcclxuICAgICAgaSA9IDI7XHJcbiAgICBsZXQgaiA9IChpKzEpJTM7XHJcbiAgICBsZXQgayA9IChpKzIpJTM7XHJcblxyXG4gICAgZlJvb3QgPSBNYXRoLnNxcnQobVtpKjMraV0tbVtqKjMral0tbVtrKjMra10gKyAxLjApO1xyXG4gICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XHJcbiAgICBmUm9vdCA9IDAuNSAvIGZSb290O1xyXG4gICAgb3V0WzNdID0gKG1baiozK2tdIC0gbVtrKjMral0pICogZlJvb3Q7XHJcbiAgICBvdXRbal0gPSAobVtqKjMraV0gKyBtW2kqMytqXSkgKiBmUm9vdDtcclxuICAgIG91dFtrXSA9IChtW2sqMytpXSArIG1baSozK2tdKSAqIGZSb290O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXHJcbiAqIEBwYXJhbSB7eX0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBZIGF4aXMgaW4gZGVncmVlcy5cclxuICogQHBhcmFtIHt6fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFogYXhpcyBpbiBkZWdyZWVzLlxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIHgsIHksIHopIHtcclxuICAgIGxldCBoYWxmVG9SYWQgPSAwLjUgKiBNYXRoLlBJIC8gMTgwLjA7XHJcbiAgICB4ICo9IGhhbGZUb1JhZDtcclxuICAgIHkgKj0gaGFsZlRvUmFkO1xyXG4gICAgeiAqPSBoYWxmVG9SYWQ7XHJcblxyXG4gICAgbGV0IHN4ID0gTWF0aC5zaW4oeCk7XHJcbiAgICBsZXQgY3ggPSBNYXRoLmNvcyh4KTtcclxuICAgIGxldCBzeSA9IE1hdGguc2luKHkpO1xyXG4gICAgbGV0IGN5ID0gTWF0aC5jb3MoeSk7XHJcbiAgICBsZXQgc3ogPSBNYXRoLnNpbih6KTtcclxuICAgIGxldCBjeiA9IE1hdGguY29zKHopO1xyXG5cclxuICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcclxuICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcclxuICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcclxuICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHF1YXRlbmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdxdWF0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBjbG9uZSA9IHZlYzQuY2xvbmU7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBmcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xyXG5cclxuLyoqXHJcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBjb3B5ID0gdmVjNC5jb3B5O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzZXQgPSB2ZWM0LnNldDtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIHR3byBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYWRkID0gdmVjNC5hZGQ7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNjYWxlID0gdmVjNC5zY2FsZTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZG90ID0gdmVjNC5kb3Q7XHJcblxyXG4vKipcclxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZXJwID0gdmVjNC5sZXJwO1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGVuZ3RoID0gdmVjNC5sZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxdWFyZWRMZW5ndGggPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XHJcblxyXG4vKipcclxuICogTm9ybWFsaXplIGEgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHF1YXRlcm5pb24uXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHF1YXRlcm5pb24uXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGV4YWN0RXF1YWxzID0gdmVjNC5leGFjdEVxdWFscztcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVxdWFscyA9IHZlYzQuZXF1YWxzO1xyXG5cclxuLyoqXHJcbiAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcclxuICogdmVjdG9yIHRvIGFub3RoZXIuXHJcbiAqXHJcbiAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgZGVzdGluYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuICovXHJcbmV4cG9ydCBjb25zdCByb3RhdGlvblRvID0gKGZ1bmN0aW9uKCkge1xyXG4gIGxldCB0bXB2ZWMzID0gdmVjMy5jcmVhdGUoKTtcclxuICBsZXQgeFVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDEsMCwwKTtcclxuICBsZXQgeVVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDAsMSwwKTtcclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYikge1xyXG4gICAgbGV0IGRvdCA9IHZlYzMuZG90KGEsIGIpO1xyXG4gICAgaWYgKGRvdCA8IC0wLjk5OTk5OSkge1xyXG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XHJcbiAgICAgIGlmICh2ZWMzLmxlbih0bXB2ZWMzKSA8IDAuMDAwMDAxKVxyXG4gICAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeVVuaXRWZWMzLCBhKTtcclxuICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XHJcbiAgICAgIHNldEF4aXNBbmdsZShvdXQsIHRtcHZlYzMsIE1hdGguUEkpO1xyXG4gICAgICByZXR1cm4gb3V0O1xyXG4gICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xyXG4gICAgICBvdXRbMF0gPSAwO1xyXG4gICAgICBvdXRbMV0gPSAwO1xyXG4gICAgICBvdXRbMl0gPSAwO1xyXG4gICAgICBvdXRbM10gPSAxO1xyXG4gICAgICByZXR1cm4gb3V0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCBhLCBiKTtcclxuICAgICAgb3V0WzBdID0gdG1wdmVjM1swXTtcclxuICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcclxuICAgICAgb3V0WzJdID0gdG1wdmVjM1syXTtcclxuICAgICAgb3V0WzNdID0gMSArIGRvdDtcclxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSkoKTtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0fSBjIHRoZSB0aGlyZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdH0gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnRcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxbGVycCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgbGV0IHRlbXAxID0gY3JlYXRlKCk7XHJcbiAgbGV0IHRlbXAyID0gY3JlYXRlKCk7XHJcblxyXG4gIHJldHVybiBmdW5jdGlvbiAob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcbiAgICBzbGVycCh0ZW1wMSwgYSwgZCwgdCk7XHJcbiAgICBzbGVycCh0ZW1wMiwgYiwgYywgdCk7XHJcbiAgICBzbGVycChvdXQsIHRlbXAxLCB0ZW1wMiwgMiAqIHQgKiAoMSAtIHQpKTtcclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH07XHJcbn0oKSk7XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgc3BlY2lmaWVkIHF1YXRlcm5pb24gd2l0aCB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW5cclxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXHJcbiAqIHBlcnBlbmRpY3VsYXIgdG8gYWxsIG90aGVyIHNwZWNpZmllZCBheGVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHJpZ2h0IHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInJpZ2h0XCIgZGlyZWN0aW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gdXAgICAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwidXBcIiBkaXJlY3Rpb25cclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNldEF4ZXMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgbGV0IG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24ob3V0LCB2aWV3LCByaWdodCwgdXApIHtcclxuICAgIG1hdHJbMF0gPSByaWdodFswXTtcclxuICAgIG1hdHJbM10gPSByaWdodFsxXTtcclxuICAgIG1hdHJbNl0gPSByaWdodFsyXTtcclxuXHJcbiAgICBtYXRyWzFdID0gdXBbMF07XHJcbiAgICBtYXRyWzRdID0gdXBbMV07XHJcbiAgICBtYXRyWzddID0gdXBbMl07XHJcblxyXG4gICAgbWF0clsyXSA9IC12aWV3WzBdO1xyXG4gICAgbWF0cls1XSA9IC12aWV3WzFdO1xyXG4gICAgbWF0cls4XSA9IC12aWV3WzJdO1xyXG5cclxuICAgIHJldHVybiBub3JtYWxpemUob3V0LCBmcm9tTWF0MyhvdXQsIG1hdHIpKTtcclxuICB9O1xyXG59KSgpO1xyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLiAqL1xyXG5cclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xyXG5pbXBvcnQgKiBhcyBxdWF0IGZyb20gXCIuL3F1YXQuanNcIjtcclxuaW1wb3J0ICogYXMgbWF0NCBmcm9tIFwiLi9tYXQ0LmpzXCI7XHJcblxyXG4vKipcclxuICogRHVhbCBRdWF0ZXJuaW9uPGJyPlxyXG4gKiBGb3JtYXQ6IFtyZWFsLCBkdWFsXTxicj5cclxuICogUXVhdGVybmlvbiBmb3JtYXQ6IFhZWlc8YnI+XHJcbiAqIE1ha2Ugc3VyZSB0byBoYXZlIG5vcm1hbGl6ZWQgZHVhbCBxdWF0ZXJuaW9ucywgb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbnMgbWF5IG5vdCB3b3JrIGFzIGludGVuZGVkLjxicj5cclxuICogQG1vZHVsZSBxdWF0MlxyXG4gKi9cclxuXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBkdWFsIHF1YXRcclxuICpcclxuICogQHJldHVybnMge3F1YXQyfSBhIG5ldyBkdWFsIHF1YXRlcm5pb24gW3JlYWwgLT4gcm90YXRpb24sIGR1YWwgLT4gdHJhbnNsYXRpb25dXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBkcSA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDgpO1xyXG4gIGRxWzBdID0gMDtcclxuICBkcVsxXSA9IDA7XHJcbiAgZHFbMl0gPSAwO1xyXG4gIGRxWzNdID0gMTtcclxuICBkcVs0XSA9IDA7XHJcbiAgZHFbNV0gPSAwO1xyXG4gIGRxWzZdID0gMDtcclxuICBkcVs3XSA9IDA7XHJcbiAgcmV0dXJuIGRxO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byBjbG9uZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xyXG4gIGxldCBkcSA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDgpO1xyXG4gIGRxWzBdID0gYVswXTtcclxuICBkcVsxXSA9IGFbMV07XHJcbiAgZHFbMl0gPSBhWzJdO1xyXG4gIGRxWzNdID0gYVszXTtcclxuICBkcVs0XSA9IGFbNF07XHJcbiAgZHFbNV0gPSBhWzVdO1xyXG4gIGRxWzZdID0gYVs2XTtcclxuICBkcVs3XSA9IGFbN107XHJcbiAgcmV0dXJuIGRxO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XHJcbiAgbGV0IGRxID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOCk7XHJcbiAgZHFbMF0gPSB4MTtcclxuICBkcVsxXSA9IHkxO1xyXG4gIGRxWzJdID0gejE7XHJcbiAgZHFbM10gPSB3MTtcclxuICBkcVs0XSA9IHgyO1xyXG4gIGRxWzVdID0geTI7XHJcbiAgZHFbNl0gPSB6MjtcclxuICBkcVs3XSA9IHcyO1xyXG4gIHJldHVybiBkcTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgZHVhbCBxdWF0IGZyb20gdGhlIGdpdmVuIHZhbHVlcyAocXVhdCBhbmQgdHJhbnNsYXRpb24pXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG4gKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25WYWx1ZXMoeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIpIHtcclxuICBsZXQgZHEgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg4KTtcclxuICBkcVswXSA9IHgxO1xyXG4gIGRxWzFdID0geTE7XHJcbiAgZHFbMl0gPSB6MTtcclxuICBkcVszXSA9IHcxO1xyXG4gIGxldCBheCA9IHgyICogMC41LFxyXG4gICAgYXkgPSB5MiAqIDAuNSxcclxuICAgIGF6ID0gejIgKiAwLjU7XHJcbiAgZHFbNF0gPSBheCAqIHcxICsgYXkgKiB6MSAtIGF6ICogeTE7XHJcbiAgZHFbNV0gPSBheSAqIHcxICsgYXogKiB4MSAtIGF4ICogejE7XHJcbiAgZHFbNl0gPSBheiAqIHcxICsgYXggKiB5MSAtIGF5ICogeDE7XHJcbiAgZHFbN10gPSAtYXggKiB4MSAtIGF5ICogeTEgLSBheiAqIHoxO1xyXG4gIHJldHVybiBkcTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb24gYW5kIGEgdHJhbnNsYXRpb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7dmVjM30gdCB0cmFubGF0aW9uIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHQpIHtcclxuICBsZXQgYXggPSB0WzBdICogMC41LFxyXG4gICAgYXkgPSB0WzFdICogMC41LFxyXG4gICAgYXogPSB0WzJdICogMC41LFxyXG4gICAgYnggPSBxWzBdLFxyXG4gICAgYnkgPSBxWzFdLFxyXG4gICAgYnogPSBxWzJdLFxyXG4gICAgYncgPSBxWzNdO1xyXG4gIG91dFswXSA9IGJ4O1xyXG4gIG91dFsxXSA9IGJ5O1xyXG4gIG91dFsyXSA9IGJ6O1xyXG4gIG91dFszXSA9IGJ3O1xyXG4gIG91dFs0XSA9IGF4ICogYncgKyBheSAqIGJ6IC0gYXogKiBieTtcclxuICBvdXRbNV0gPSBheSAqIGJ3ICsgYXogKiBieCAtIGF4ICogYno7XHJcbiAgb3V0WzZdID0gYXogKiBidyArIGF4ICogYnkgLSBheSAqIGJ4O1xyXG4gIG91dFs3XSA9IC1heCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHRyYW5zbGF0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHQgdHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHQpIHtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgb3V0WzJdID0gMDtcclxuICBvdXRbM10gPSAxO1xyXG4gIG91dFs0XSA9IHRbMF0gKiAwLjU7XHJcbiAgb3V0WzVdID0gdFsxXSAqIDAuNTtcclxuICBvdXRbNl0gPSB0WzJdICogMC41O1xyXG4gIG91dFs3XSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gcSB0aGUgcXVhdGVybmlvblxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCBxKSB7XHJcbiAgb3V0WzBdID0gcVswXTtcclxuICBvdXRbMV0gPSBxWzFdO1xyXG4gIG91dFsyXSA9IHFbMl07XHJcbiAgb3V0WzNdID0gcVszXTtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBmcm9tIGEgbWF0cml4ICg0eDQpXHJcbiAqIFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcclxuICAvL1RPRE8gT3B0aW1pemUgdGhpcyBcclxuICBsZXQgb3V0ZXIgPSBxdWF0LmNyZWF0ZSgpO1xyXG4gIG1hdDQuZ2V0Um90YXRpb24ob3V0ZXIsIGEpO1xyXG4gIGxldCB0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XHJcbiAgbWF0NC5nZXRUcmFuc2xhdGlvbih0LCBhKTtcclxuICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIG91dGVyLCB0KTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIGR1YWwgcXVhdCB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBzb3VyY2UgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIG91dFsyXSA9IGFbMl07XHJcbiAgb3V0WzNdID0gYVszXTtcclxuICBvdXRbNF0gPSBhWzRdO1xyXG4gIG91dFs1XSA9IGFbNV07XHJcbiAgb3V0WzZdID0gYVs2XTtcclxuICBvdXRbN10gPSBhWzddO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgYSBkdWFsIHF1YXQgdG8gdGhlIGlkZW50aXR5IGR1YWwgcXVhdGVybmlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcbiAgb3V0WzBdID0gMDtcclxuICBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IDA7XHJcbiAgb3V0WzNdID0gMTtcclxuICBvdXRbNF0gPSAwO1xyXG4gIG91dFs1XSA9IDA7XHJcbiAgb3V0WzZdID0gMDtcclxuICBvdXRbN10gPSAwO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XHJcbiAgb3V0WzBdID0geDE7XHJcbiAgb3V0WzFdID0geTE7XHJcbiAgb3V0WzJdID0gejE7XHJcbiAgb3V0WzNdID0gdzE7XHJcblxyXG4gIG91dFs0XSA9IHgyO1xyXG4gIG91dFs1XSA9IHkyO1xyXG4gIG91dFs2XSA9IHoyO1xyXG4gIG91dFs3XSA9IHcyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSByZWFsIHBhcnQgb2YgYSBkdWFsIHF1YXRcclxuICogQHBhcmFtICB7cXVhdH0gb3V0IHJlYWwgcGFydFxyXG4gKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuICogQHJldHVybiB7cXVhdH0gcmVhbCBwYXJ0XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZ2V0UmVhbCA9IHF1YXQuY29weTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBkdWFsIHBhcnQgb2YgYSBkdWFsIHF1YXRcclxuICogQHBhcmFtICB7cXVhdH0gb3V0IGR1YWwgcGFydFxyXG4gKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuICogQHJldHVybiB7cXVhdH0gZHVhbCBwYXJ0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHVhbChvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBhWzRdO1xyXG4gIG91dFsxXSA9IGFbNV07XHJcbiAgb3V0WzJdID0gYVs2XTtcclxuICBvdXRbM10gPSBhWzddO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHJlYWwgY29tcG9uZW50IG9mIGEgZHVhbCBxdWF0IHRvIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0fSBxIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJlYWwgcGFydFxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBzZXRSZWFsID0gcXVhdC5jb3B5O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgZHVhbCBjb21wb25lbnQgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgZHVhbCBwYXJ0XHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldER1YWwob3V0LCBxKSB7XHJcbiAgb3V0WzRdID0gcVswXTtcclxuICBvdXRbNV0gPSBxWzFdO1xyXG4gIG91dFs2XSA9IHFbMl07XHJcbiAgb3V0WzddID0gcVszXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgdHJhbnNsYXRpb24gb2YgYSBub3JtYWxpemVkIGR1YWwgcXVhdFxyXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgdHJhbnNsYXRpb25cclxuICogQHBhcmFtICB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcclxuICogQHJldHVybiB7dmVjM30gdHJhbnNsYXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIGEpIHtcclxuICBsZXQgYXggPSBhWzRdLFxyXG4gICAgYXkgPSBhWzVdLFxyXG4gICAgYXogPSBhWzZdLFxyXG4gICAgYXcgPSBhWzddLFxyXG4gICAgYnggPSAtYVswXSxcclxuICAgIGJ5ID0gLWFbMV0sXHJcbiAgICBieiA9IC1hWzJdLFxyXG4gICAgYncgPSBhWzNdO1xyXG4gIG91dFswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDI7XHJcbiAgb3V0WzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMjtcclxuICBvdXRbMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2xhdGVzIGEgZHVhbCBxdWF0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byB0cmFuc2xhdGVcclxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XHJcbiAgbGV0IGF4MSA9IGFbMF0sXHJcbiAgICBheTEgPSBhWzFdLFxyXG4gICAgYXoxID0gYVsyXSxcclxuICAgIGF3MSA9IGFbM10sXHJcbiAgICBieDEgPSB2WzBdICogMC41LFxyXG4gICAgYnkxID0gdlsxXSAqIDAuNSxcclxuICAgIGJ6MSA9IHZbMl0gKiAwLjUsXHJcbiAgICBheDIgPSBhWzRdLFxyXG4gICAgYXkyID0gYVs1XSxcclxuICAgIGF6MiA9IGFbNl0sXHJcbiAgICBhdzIgPSBhWzddO1xyXG4gIG91dFswXSA9IGF4MTtcclxuICBvdXRbMV0gPSBheTE7XHJcbiAgb3V0WzJdID0gYXoxO1xyXG4gIG91dFszXSA9IGF3MTtcclxuICBvdXRbNF0gPSBhdzEgKiBieDEgKyBheTEgKiBiejEgLSBhejEgKiBieTEgKyBheDI7XHJcbiAgb3V0WzVdID0gYXcxICogYnkxICsgYXoxICogYngxIC0gYXgxICogYnoxICsgYXkyO1xyXG4gIG91dFs2XSA9IGF3MSAqIGJ6MSArIGF4MSAqIGJ5MSAtIGF5MSAqIGJ4MSArIGF6MjtcclxuICBvdXRbN10gPSAtYXgxICogYngxIC0gYXkxICogYnkxIC0gYXoxICogYnoxICsgYXcyO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWCBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xyXG4gIGxldCBieCA9IC1hWzBdLFxyXG4gICAgYnkgPSAtYVsxXSxcclxuICAgIGJ6ID0gLWFbMl0sXHJcbiAgICBidyA9IGFbM10sXHJcbiAgICBheCA9IGFbNF0sXHJcbiAgICBheSA9IGFbNV0sXHJcbiAgICBheiA9IGFbNl0sXHJcbiAgICBhdyA9IGFbN10sXHJcbiAgICBheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG4gICAgYXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuICAgIGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcbiAgICBhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xyXG4gIHF1YXQucm90YXRlWChvdXQsIGEsIHJhZCk7XHJcbiAgYnggPSBvdXRbMF07XHJcbiAgYnkgPSBvdXRbMV07XHJcbiAgYnogPSBvdXRbMl07XHJcbiAgYncgPSBvdXRbM107XHJcbiAgb3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnk7XHJcbiAgb3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYno7XHJcbiAgb3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYng7XHJcbiAgb3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYno7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBZIGF4aXNcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XHJcbiAgbGV0IGJ4ID0gLWFbMF0sXHJcbiAgICBieSA9IC1hWzFdLFxyXG4gICAgYnogPSAtYVsyXSxcclxuICAgIGJ3ID0gYVszXSxcclxuICAgIGF4ID0gYVs0XSxcclxuICAgIGF5ID0gYVs1XSxcclxuICAgIGF6ID0gYVs2XSxcclxuICAgIGF3ID0gYVs3XSxcclxuICAgIGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcbiAgICBheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG4gICAgYXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuICAgIGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XHJcbiAgcXVhdC5yb3RhdGVZKG91dCwgYSwgcmFkKTtcclxuICBieCA9IG91dFswXTtcclxuICBieSA9IG91dFsxXTtcclxuICBieiA9IG91dFsyXTtcclxuICBidyA9IG91dFszXTtcclxuICBvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieTtcclxuICBvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBiejtcclxuICBvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieDtcclxuICBvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBiejtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFogYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcclxuICBsZXQgYnggPSAtYVswXSxcclxuICAgIGJ5ID0gLWFbMV0sXHJcbiAgICBieiA9IC1hWzJdLFxyXG4gICAgYncgPSBhWzNdLFxyXG4gICAgYXggPSBhWzRdLFxyXG4gICAgYXkgPSBhWzVdLFxyXG4gICAgYXogPSBhWzZdLFxyXG4gICAgYXcgPSBhWzddLFxyXG4gICAgYXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuICAgIGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcbiAgICBhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG4gICAgYXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcclxuICBxdWF0LnJvdGF0ZVoob3V0LCBhLCByYWQpO1xyXG4gIGJ4ID0gb3V0WzBdO1xyXG4gIGJ5ID0gb3V0WzFdO1xyXG4gIGJ6ID0gb3V0WzJdO1xyXG4gIGJ3ID0gb3V0WzNdO1xyXG4gIG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5O1xyXG4gIG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6O1xyXG4gIG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4O1xyXG4gIG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGJ5IGEgZ2l2ZW4gcXVhdGVybmlvbiAoYSAqIHEpXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHJvdGF0ZSBieVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdEFwcGVuZChvdXQsIGEsIHEpIHtcclxuICBsZXQgcXggPSBxWzBdLFxyXG4gICAgcXkgPSBxWzFdLFxyXG4gICAgcXogPSBxWzJdLFxyXG4gICAgcXcgPSBxWzNdLFxyXG4gICAgYXggPSBhWzBdLFxyXG4gICAgYXkgPSBhWzFdLFxyXG4gICAgYXogPSBhWzJdLFxyXG4gICAgYXcgPSBhWzNdO1xyXG5cclxuICBvdXRbMF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5O1xyXG4gIG91dFsxXSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXo7XHJcbiAgb3V0WzJdID0gYXogKiBxdyArIGF3ICogcXogKyBheCAqIHF5IC0gYXkgKiBxeDtcclxuICBvdXRbM10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6O1xyXG4gIGF4ID0gYVs0XTtcclxuICBheSA9IGFbNV07XHJcbiAgYXogPSBhWzZdO1xyXG4gIGF3ID0gYVs3XTtcclxuICBvdXRbNF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5O1xyXG4gIG91dFs1XSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXo7XHJcbiAgb3V0WzZdID0gYXogKiBxdyArIGF3ICogcXogKyBheCAqIHF5IC0gYXkgKiBxeDtcclxuICBvdXRbN10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6O1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGJ5IGEgZ2l2ZW4gcXVhdGVybmlvbiAocSAqIGEpXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byByb3RhdGUgYnlcclxuICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdFByZXBlbmQob3V0LCBxLCBhKSB7XHJcbiAgbGV0IHF4ID0gcVswXSxcclxuICAgIHF5ID0gcVsxXSxcclxuICAgIHF6ID0gcVsyXSxcclxuICAgIHF3ID0gcVszXSxcclxuICAgIGJ4ID0gYVswXSxcclxuICAgIGJ5ID0gYVsxXSxcclxuICAgIGJ6ID0gYVsyXSxcclxuICAgIGJ3ID0gYVszXTtcclxuXHJcbiAgb3V0WzBdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieTtcclxuICBvdXRbMV0gPSBxeSAqIGJ3ICsgcXcgKiBieSArIHF6ICogYnggLSBxeCAqIGJ6O1xyXG4gIG91dFsyXSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYng7XHJcbiAgb3V0WzNdID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBiejtcclxuICBieCA9IGFbNF07XHJcbiAgYnkgPSBhWzVdO1xyXG4gIGJ6ID0gYVs2XTtcclxuICBidyA9IGFbN107XHJcbiAgb3V0WzRdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieTtcclxuICBvdXRbNV0gPSBxeSAqIGJ3ICsgcXcgKiBieSArIHF6ICogYnggLSBxeCAqIGJ6O1xyXG4gIG91dFs2XSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYng7XHJcbiAgb3V0WzddID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBiejtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgYSBnaXZlbiBheGlzLiBEb2VzIHRoZSBub3JtYWxpc2F0aW9uIGF1dG9tYXRpY2FsbHlcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCBob3cgZmFyIHRoZSByb3RhdGlvbiBzaG91bGQgYmVcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVBcm91bmRBeGlzKG91dCwgYSwgYXhpcywgcmFkKSB7XHJcbiAgLy9TcGVjaWFsIGNhc2UgZm9yIHJhZCA9IDBcclxuICBpZiAoTWF0aC5hYnMocmFkKSA8IGdsTWF0cml4LkVQU0lMT04pIHtcclxuICAgIHJldHVybiBjb3B5KG91dCwgYSk7XHJcbiAgfVxyXG4gIGxldCBheGlzTGVuZ3RoID0gTWF0aC5zcXJ0KGF4aXNbMF0gKiBheGlzWzBdICsgYXhpc1sxXSAqIGF4aXNbMV0gKyBheGlzWzJdICogYXhpc1syXSk7XHJcblxyXG4gIHJhZCA9IHJhZCAqIDAuNTtcclxuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcbiAgbGV0IGJ4ID0gcyAqIGF4aXNbMF0gLyBheGlzTGVuZ3RoO1xyXG4gIGxldCBieSA9IHMgKiBheGlzWzFdIC8gYXhpc0xlbmd0aDtcclxuICBsZXQgYnogPSBzICogYXhpc1syXSAvIGF4aXNMZW5ndGg7XHJcbiAgbGV0IGJ3ID0gTWF0aC5jb3MocmFkKTtcclxuXHJcbiAgbGV0IGF4MSA9IGFbMF0sXHJcbiAgICBheTEgPSBhWzFdLFxyXG4gICAgYXoxID0gYVsyXSxcclxuICAgIGF3MSA9IGFbM107XHJcbiAgb3V0WzBdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnk7XHJcbiAgb3V0WzFdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYno7XHJcbiAgb3V0WzJdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYng7XHJcbiAgb3V0WzNdID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYno7XHJcblxyXG4gIGxldCBheCA9IGFbNF0sXHJcbiAgICBheSA9IGFbNV0sXHJcbiAgICBheiA9IGFbNl0sXHJcbiAgICBhdyA9IGFbN107XHJcbiAgb3V0WzRdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcclxuICBvdXRbNV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xyXG4gIG91dFs2XSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XHJcbiAgb3V0WzddID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcclxuXHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIGR1YWwgcXVhdCdzXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcclxuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcclxuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcclxuICBvdXRbM10gPSBhWzNdICsgYlszXTtcclxuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcclxuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcclxuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcclxuICBvdXRbN10gPSBhWzddICsgYls3XTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTXVsdGlwbGllcyB0d28gZHVhbCBxdWF0J3NcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuICBsZXQgYXgwID0gYVswXSxcclxuICAgIGF5MCA9IGFbMV0sXHJcbiAgICBhejAgPSBhWzJdLFxyXG4gICAgYXcwID0gYVszXSxcclxuICAgIGJ4MSA9IGJbNF0sXHJcbiAgICBieTEgPSBiWzVdLFxyXG4gICAgYnoxID0gYls2XSxcclxuICAgIGJ3MSA9IGJbN10sXHJcbiAgICBheDEgPSBhWzRdLFxyXG4gICAgYXkxID0gYVs1XSxcclxuICAgIGF6MSA9IGFbNl0sXHJcbiAgICBhdzEgPSBhWzddLFxyXG4gICAgYngwID0gYlswXSxcclxuICAgIGJ5MCA9IGJbMV0sXHJcbiAgICBiejAgPSBiWzJdLFxyXG4gICAgYncwID0gYlszXTtcclxuICBvdXRbMF0gPSBheDAgKiBidzAgKyBhdzAgKiBieDAgKyBheTAgKiBiejAgLSBhejAgKiBieTA7XHJcbiAgb3V0WzFdID0gYXkwICogYncwICsgYXcwICogYnkwICsgYXowICogYngwIC0gYXgwICogYnowO1xyXG4gIG91dFsyXSA9IGF6MCAqIGJ3MCArIGF3MCAqIGJ6MCArIGF4MCAqIGJ5MCAtIGF5MCAqIGJ4MDtcclxuICBvdXRbM10gPSBhdzAgKiBidzAgLSBheDAgKiBieDAgLSBheTAgKiBieTAgLSBhejAgKiBiejA7XHJcbiAgb3V0WzRdID0gYXgwICogYncxICsgYXcwICogYngxICsgYXkwICogYnoxIC0gYXowICogYnkxICsgYXgxICogYncwICsgYXcxICogYngwICsgYXkxICogYnowIC0gYXoxICogYnkwO1xyXG4gIG91dFs1XSA9IGF5MCAqIGJ3MSArIGF3MCAqIGJ5MSArIGF6MCAqIGJ4MSAtIGF4MCAqIGJ6MSArIGF5MSAqIGJ3MCArIGF3MSAqIGJ5MCArIGF6MSAqIGJ4MCAtIGF4MSAqIGJ6MDtcclxuICBvdXRbNl0gPSBhejAgKiBidzEgKyBhdzAgKiBiejEgKyBheDAgKiBieTEgLSBheTAgKiBieDEgKyBhejEgKiBidzAgKyBhdzEgKiBiejAgKyBheDEgKiBieTAgLSBheTEgKiBieDA7XHJcbiAgb3V0WzddID0gYXcwICogYncxIC0gYXgwICogYngxIC0gYXkwICogYnkxIC0gYXowICogYnoxICsgYXcxICogYncwIC0gYXgxICogYngwIC0gYXkxICogYnkwIC0gYXoxICogYnowO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBTY2FsZXMgYSBkdWFsIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdFxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXQgdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBkdWFsIHF1YXQgYnlcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGI7XHJcbiAgb3V0WzFdID0gYVsxXSAqIGI7XHJcbiAgb3V0WzJdID0gYVsyXSAqIGI7XHJcbiAgb3V0WzNdID0gYVszXSAqIGI7XHJcbiAgb3V0WzRdID0gYVs0XSAqIGI7XHJcbiAgb3V0WzVdID0gYVs1XSAqIGI7XHJcbiAgb3V0WzZdID0gYVs2XSAqIGI7XHJcbiAgb3V0WzddID0gYVs3XSAqIGI7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBkdWFsIHF1YXQncyAoVGhlIGRvdCBwcm9kdWN0IG9mIHRoZSByZWFsIHBhcnRzKVxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZG90ID0gcXVhdC5kb3Q7XHJcblxyXG4vKipcclxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBkdWFsIHF1YXRzJ3NcclxuICogTk9URTogVGhlIHJlc3VsdGluZyBkdWFsIHF1YXRlcm5pb25zIHdvbid0IGFsd2F5cyBiZSBub3JtYWxpemVkIChUaGUgZXJyb3IgaXMgbW9zdCBub3RpY2VhYmxlIHdoZW4gdCA9IDAuNSlcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0XHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XHJcbiAgbGV0IG10ID0gMSAtIHQ7XHJcbiAgaWYgKGRvdChhLCBiKSA8IDApIHQgPSAtdDtcclxuXHJcbiAgb3V0WzBdID0gYVswXSAqIG10ICsgYlswXSAqIHQ7XHJcbiAgb3V0WzFdID0gYVsxXSAqIG10ICsgYlsxXSAqIHQ7XHJcbiAgb3V0WzJdID0gYVsyXSAqIG10ICsgYlsyXSAqIHQ7XHJcbiAgb3V0WzNdID0gYVszXSAqIG10ICsgYlszXSAqIHQ7XHJcbiAgb3V0WzRdID0gYVs0XSAqIG10ICsgYls0XSAqIHQ7XHJcbiAgb3V0WzVdID0gYVs1XSAqIG10ICsgYls1XSAqIHQ7XHJcbiAgb3V0WzZdID0gYVs2XSAqIG10ICsgYls2XSAqIHQ7XHJcbiAgb3V0WzddID0gYVs3XSAqIG10ICsgYls3XSAqIHQ7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgZHVhbCBxdWF0LiBJZiB0aGV5IGFyZSBub3JtYWxpemVkLCBjb25qdWdhdGUgaXMgY2hlYXBlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcbiAgbGV0IHNxbGVuID0gc3F1YXJlZExlbmd0aChhKTtcclxuICBvdXRbMF0gPSAtYVswXSAvIHNxbGVuO1xyXG4gIG91dFsxXSA9IC1hWzFdIC8gc3FsZW47XHJcbiAgb3V0WzJdID0gLWFbMl0gLyBzcWxlbjtcclxuICBvdXRbM10gPSBhWzNdIC8gc3FsZW47XHJcbiAgb3V0WzRdID0gLWFbNF0gLyBzcWxlbjtcclxuICBvdXRbNV0gPSAtYVs1XSAvIHNxbGVuO1xyXG4gIG91dFs2XSA9IC1hWzZdIC8gc3FsZW47XHJcbiAgb3V0WzddID0gYVs3XSAvIHNxbGVuO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBkdWFsIHF1YXRcclxuICogSWYgdGhlIGR1YWwgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQyLmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxyXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAtYVswXTtcclxuICBvdXRbMV0gPSAtYVsxXTtcclxuICBvdXRbMl0gPSAtYVsyXTtcclxuICBvdXRbM10gPSBhWzNdO1xyXG4gIG91dFs0XSA9IC1hWzRdO1xyXG4gIG91dFs1XSA9IC1hWzVdO1xyXG4gIG91dFs2XSA9IC1hWzZdO1xyXG4gIG91dFs3XSA9IGFbN107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIGR1YWwgcXVhdFxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxlbmd0aCA9IHF1YXQubGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBkdWFsIHF1YXRcclxuICpcclxuICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3F1YXJlZExlbmd0aCA9IHF1YXQuc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLnNxdWFyZWRMZW5ndGh9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XHJcblxyXG4vKipcclxuICogTm9ybWFsaXplIGEgZHVhbCBxdWF0XHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xyXG4gIGxldCBtYWduaXR1ZGUgPSBzcXVhcmVkTGVuZ3RoKGEpO1xyXG4gIGlmIChtYWduaXR1ZGUgPiAwKSB7XHJcbiAgICBtYWduaXR1ZGUgPSBNYXRoLnNxcnQobWFnbml0dWRlKTtcclxuICAgIG91dFswXSA9IGFbMF0gLyBtYWduaXR1ZGU7XHJcbiAgICBvdXRbMV0gPSBhWzFdIC8gbWFnbml0dWRlO1xyXG4gICAgb3V0WzJdID0gYVsyXSAvIG1hZ25pdHVkZTtcclxuICAgIG91dFszXSA9IGFbM10gLyBtYWduaXR1ZGU7XHJcbiAgICBvdXRbNF0gPSBhWzRdIC8gbWFnbml0dWRlO1xyXG4gICAgb3V0WzVdID0gYVs1XSAvIG1hZ25pdHVkZTtcclxuICAgIG91dFs2XSA9IGFbNl0gLyBtYWduaXR1ZGU7XHJcbiAgICBvdXRbN10gPSBhWzddIC8gbWFnbml0dWRlO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIGR1YWwgcXVhdGVuaW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGR1YWwgcXVhdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XHJcbiAgcmV0dXJuICdxdWF0MignICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xyXG4gICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcpJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBkdWFsIHF1YXRlcm5pb24uXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXRlcm5pb24uXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIHRoZSBkdWFsIHF1YXRlcm5pb25zIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJlxyXG4gICAgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBkdWFsIHF1YXQuXHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXQuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIHRoZSBkdWFsIHF1YXRzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSxcclxuICAgIGExID0gYVsxXSxcclxuICAgIGEyID0gYVsyXSxcclxuICAgIGEzID0gYVszXSxcclxuICAgIGE0ID0gYVs0XSxcclxuICAgIGE1ID0gYVs1XSxcclxuICAgIGE2ID0gYVs2XSxcclxuICAgIGE3ID0gYVs3XTtcclxuICBsZXQgYjAgPSBiWzBdLFxyXG4gICAgYjEgPSBiWzFdLFxyXG4gICAgYjIgPSBiWzJdLFxyXG4gICAgYjMgPSBiWzNdLFxyXG4gICAgYjQgPSBiWzRdLFxyXG4gICAgYjUgPSBiWzVdLFxyXG4gICAgYjYgPSBiWzZdLFxyXG4gICAgYjcgPSBiWzddO1xyXG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcbiAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG4gICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcbiAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuICAgIE1hdGguYWJzKGE1IC0gYjUpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG4gICAgTWF0aC5hYnMoYTYgLSBiNikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcbiAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkpO1xyXG59XHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAxNSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuICovXHJcblxyXG5pbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcclxuXHJcbi8qKlxyXG4gKiAyIERpbWVuc2lvbmFsIFZlY3RvclxyXG4gKiBAbW9kdWxlIHZlYzJcclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcclxuICBvdXRbMF0gPSAwO1xyXG4gIG91dFsxXSA9IDA7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xyXG4gIG91dFswXSA9IGFbMF07XHJcbiAgb3V0WzFdID0gYVsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5KSB7XHJcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xyXG4gIG91dFswXSA9IHg7XHJcbiAgb3V0WzFdID0geTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gYVswXTtcclxuICBvdXRbMV0gPSBhWzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHkpIHtcclxuICBvdXRbMF0gPSB4O1xyXG4gIG91dFsxXSA9IHk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XHJcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcclxuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjZWlsXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGZsb29yXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcclxuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcclxuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xyXG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xyXG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByb3VuZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcm91bmQgKG91dCwgYSkge1xyXG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XHJcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcclxuICBvdXRbMF0gPSBhWzBdICogYjtcclxuICBvdXRbMV0gPSBhWzFdICogYjtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgdHdvIHZlYzIncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XHJcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XHJcbiAgdmFyIHggPSBiWzBdIC0gYVswXSxcclxuICAgIHkgPSBiWzFdIC0gYVsxXTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcclxuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxyXG4gICAgeSA9IGJbMV0gLSBhWzFdO1xyXG4gIHJldHVybiB4KnggKyB5Knk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xyXG4gIHZhciB4ID0gYVswXSxcclxuICAgIHkgPSBhWzFdO1xyXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGggKGEpIHtcclxuICB2YXIgeCA9IGFbMF0sXHJcbiAgICB5ID0gYVsxXTtcclxuICByZXR1cm4geCp4ICsgeSp5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XHJcbiAgb3V0WzBdID0gLWFbMF07XHJcbiAgb3V0WzFdID0gLWFbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcclxuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xyXG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxpemUgYSB2ZWMyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XHJcbiAgdmFyIHggPSBhWzBdLFxyXG4gICAgeSA9IGFbMV07XHJcbiAgdmFyIGxlbiA9IHgqeCArIHkqeTtcclxuICBpZiAobGVuID4gMCkge1xyXG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XHJcbiAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XHJcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xyXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xyXG4gIHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcclxuICBvdXRbMF0gPSBvdXRbMV0gPSAwO1xyXG4gIG91dFsyXSA9IHo7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xyXG4gIHZhciBheCA9IGFbMF0sXHJcbiAgICBheSA9IGFbMV07XHJcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XHJcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcclxuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcclxuICB2YXIgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcclxuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHNjYWxlO1xyXG4gIG91dFsxXSA9IE1hdGguc2luKHIpICogc2NhbGU7XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyKG91dCwgYSwgbSkge1xyXG4gIHZhciB4ID0gYVswXSxcclxuICAgIHkgPSBhWzFdO1xyXG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XHJcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MmQob3V0LCBhLCBtKSB7XHJcbiAgdmFyIHggPSBhWzBdLFxyXG4gICAgeSA9IGFbMV07XHJcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XHJcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXHJcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xyXG4gIHZhciB4ID0gYVswXSxcclxuICAgIHkgPSBhWzFdO1xyXG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xyXG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxyXG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xyXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuICBsZXQgeCA9IGFbMF07XHJcbiAgbGV0IHkgPSBhWzFdO1xyXG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzEyXTtcclxuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuICpcclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xyXG4gIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdO1xyXG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXTtcclxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkpO1xyXG59XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmxlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zdWJ0cmFjdH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XHJcblxyXG4vKipcclxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcclxuXHJcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZExlbmd0aH1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcclxuXHJcbi8qKlxyXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuICogQHJldHVybnMge0FycmF5fSBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHZlYyA9IGNyZWF0ZSgpO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XHJcbiAgICBsZXQgaSwgbDtcclxuICAgIGlmKCFzdHJpZGUpIHtcclxuICAgICAgc3RyaWRlID0gMjtcclxuICAgIH1cclxuXHJcbiAgICBpZighb2Zmc2V0KSB7XHJcbiAgICAgIG9mZnNldCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoY291bnQpIHtcclxuICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGwgPSBhLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XHJcbiAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcclxuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XHJcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYTtcclxuICB9O1xyXG59KSgpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcclxuICogQGF1dGhvciBCcmFuZG9uIEpvbmVzXHJcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXHJcbiAqIEB2ZXJzaW9uIDIuNC4wXHJcbiAqL1xyXG5cclxuLyogQ29weXJpZ2h0IChjKSAyMDE1LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS4gKi9cclxuLy8gRU5EIEhFQURFUlxyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vZ2wtbWF0cml4L2NvbW1vbi5qc1wiO1xyXG5pbXBvcnQgKiBhcyBtYXQyIGZyb20gXCIuL2dsLW1hdHJpeC9tYXQyLmpzXCI7XHJcbmltcG9ydCAqIGFzIG1hdDJkIGZyb20gXCIuL2dsLW1hdHJpeC9tYXQyZC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBtYXQzIGZyb20gXCIuL2dsLW1hdHJpeC9tYXQzLmpzXCI7XHJcbmltcG9ydCAqIGFzIG1hdDQgZnJvbSBcIi4vZ2wtbWF0cml4L21hdDQuanNcIjtcclxuaW1wb3J0ICogYXMgcXVhdCBmcm9tIFwiLi9nbC1tYXRyaXgvcXVhdC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBxdWF0MiBmcm9tIFwiLi9nbC1tYXRyaXgvcXVhdDIuanNcIjtcclxuaW1wb3J0ICogYXMgdmVjMiBmcm9tIFwiLi9nbC1tYXRyaXgvdmVjMi5qc1wiO1xyXG5pbXBvcnQgKiBhcyB2ZWMzIGZyb20gXCIuL2dsLW1hdHJpeC92ZWMzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHZlYzQgZnJvbSBcIi4vZ2wtbWF0cml4L3ZlYzQuanNcIjtcclxuXHJcbmV4cG9ydCB7XHJcbiAgZ2xNYXRyaXgsXHJcbiAgbWF0MiwgbWF0MmQsIG1hdDMsIG1hdDQsXHJcbiAgcXVhdCwgcXVhdDIsXHJcbiAgdmVjMiwgdmVjMywgdmVjNCxcclxufTtcclxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbi8vIHB2dFxuZnVuY3Rpb24gbm9ybWFsaXplKGFycmF5KSB7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhcbiAgICAgICAgYXJyYXlbMF0gLyAyNTUsXG4gICAgICAgIGFycmF5WzFdIC8gMjU1LFxuICAgICAgICBhcnJheVsyXSAvIDI1NSxcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4SW50VG9SZ2IoaGV4KSB7XG4gICAgY29uc3QgciA9IGhleCA+PiAxNjtcbiAgICBjb25zdCBnID0gaGV4ID4+IDggJiAweEZGOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgY29uc3QgYiA9IGhleCAmIDB4RkY7XG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyhyLCBnLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleFN0cmluZ1RvUmdiKGhleCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHJldHVybiByZXN1bHQgPyB2ZWMzLmZyb21WYWx1ZXMoXG4gICAgICAgIHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgICBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcbiAgICAgICAgcGFyc2VJbnQocmVzdWx0WzNdLCAxNiksXG4gICAgKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XG4gICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gICAgY29uc3QgaGV4UiA9IGNvbXBvbmVudFRvSGV4KHIpO1xuICAgIGNvbnN0IGhleEcgPSBjb21wb25lbnRUb0hleChnKTtcbiAgICBjb25zdCBoZXhCID0gY29tcG9uZW50VG9IZXgoYik7XG4gICAgcmV0dXJuIGAjJHtoZXhSfSR7aGV4R30ke2hleEJ9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoaGV4KSB7XG4gICAgY29uc3QgY29sb3IgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIGNvbnN0IHJnYiA9IHR5cGVvZiBoZXggPT09ICdudW1iZXInID8gaGV4SW50VG9SZ2IoaGV4KSA6IGhleFN0cmluZ1RvUmdiKGhleCk7XG4gICAgdmVjMy5jb3B5KGNvbG9yLCBub3JtYWxpemUocmdiKSk7XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVJhbmdlKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kKG0sIG4pIHtcbiAgICByZXR1cm4gKChtICUgbikgKyBuKSAlIG47XG59XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IFdPUkRfUkVHWCA9ICh3b3JkKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYFxcXFxiJHt3b3JkfVxcXFxiYCwgJ2dpJyk7XG59O1xuXG5jb25zdCBMSU5FX1JFR1ggPSAod29yZCkgPT4ge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGAke3dvcmR9YCwgJ2dpJyk7XG59O1xuXG5jb25zdCBWRVJURVggPSBbXG4gICAge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCdpbicpLFxuICAgICAgICByZXBsYWNlOiAnYXR0cmlidXRlJyxcbiAgICB9LCB7XG4gICAgICAgIG1hdGNoOiBXT1JEX1JFR1goJ291dCcpLFxuICAgICAgICByZXBsYWNlOiAndmFyeWluZycsXG4gICAgfSxcbl07XG5cbmNvbnN0IEZSQUdNRU5UID0gW1xuICAgIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnaW4nKSxcbiAgICAgICAgcmVwbGFjZTogJ3ZhcnlpbmcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IExJTkVfUkVHWCgnb3V0IHZlYzQgb3V0Q29sb3I7JyksXG4gICAgICAgIHJlcGxhY2U6ICcnLFxuICAgIH0sIHtcbiAgICAgICAgbWF0Y2g6IFdPUkRfUkVHWCgnb3V0Q29sb3InKSxcbiAgICAgICAgcmVwbGFjZTogJ2dsX0ZyYWdDb2xvcicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlUHJvaicpLFxuICAgICAgICByZXBsYWNlOiAndGV4dHVyZTJEUHJvaicsXG4gICAgfSwge1xuICAgICAgICBtYXRjaDogV09SRF9SRUdYKCd0ZXh0dXJlJyksXG4gICAgICAgIHJlcGxhY2Uoc2hhZGVyKSB7XG4gICAgICAgICAgICAvLyBGaW5kIGFsbCB0ZXh0dXJlIGRlZmludGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmVHbG9iYWxSZWd4ID0gbmV3IFJlZ0V4cCgnXFxcXGJ0ZXh0dXJlXFxcXGInLCAnZ2knKTtcblxuICAgICAgICAgICAgLy8gRmluZCBzaW5nbGUgdGV4dHVyZSBkZWZpbml0aW9uXG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlU2luZ2xlUmVneCA9IG5ldyBSZWdFeHAoJ1xcXFxidGV4dHVyZVxcXFxiJywgJ2knKTtcblxuICAgICAgICAgICAgLy8gR2V0cyB0aGUgdGV4dHVyZSBjYWxsIHNpZ25hdHVyZSBlLmcgdGV4dHVyZSh1VGV4dHVyZTEsIHZVdik7XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4ID0gbmV3IFJlZ0V4cCgvdGV4dHVyZVxcKChbXildKylcXCkvLCAnaScpO1xuXG4gICAgICAgICAgICAvLyBHZXQgYWxsIG1hdGNoaW5nIG9jY3VyYW5jZXNcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBzaGFkZXIubWF0Y2godGV4dHVyZUdsb2JhbFJlZ3gpO1xuICAgICAgICAgICAgbGV0IHJlcGxhY2VtZW50ID0gJyc7XG5cbiAgICAgICAgICAgIC8vIElmIG5vdGhpbmcgbWF0Y2hlcyByZXR1cm5cbiAgICAgICAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSByZXR1cm4gc2hhZGVyO1xuXG4gICAgICAgICAgICAvLyBSZXBsYWNlIGVhY2ggb2NjdXJhbmNlIGJ5IGl0J3MgdW5pZm9ybSB0eXBlXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IHNoYWRlci5tYXRjaCh0ZXh0dXJlVW5pZm9ybU5hbWVSZWd4KVswXTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pZm9ybU5hbWUgPSBtYXRjaC5yZXBsYWNlKCd0ZXh0dXJlKCcsICcnKS5zcGxpdCgnLCcpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdW5pZm9ybVR5cGUgPSBzaGFkZXIubWF0Y2goYCguKj8pICR7dW5pZm9ybU5hbWV9YCwgJ2knKVsxXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtVHlwZSA9IHVuaWZvcm1UeXBlLnNwbGl0KCcgJylbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh1bmlmb3JtVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSAndGV4dHVyZTJEJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzYW1wbGVyQ3ViZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudCA9ICd0ZXh0dXJlQ3ViZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNoYWRlciA9IHNoYWRlci5yZXBsYWNlKHRleHR1cmVTaW5nbGVSZWd4LCByZXBsYWNlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlICovXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgICB9LFxuICAgIH1dO1xuXG5jb25zdCBHRU5FUklDID0gW3tcbiAgICBtYXRjaDogTElORV9SRUdYKCcjdmVyc2lvbiAzMDAgZXMnKSxcbiAgICByZXBsYWNlOiAnJyxcbn1dO1xuXG5jb25zdCBWRVJURVhfUlVMRVMgPSBbLi4uR0VORVJJQywgLi4uVkVSVEVYXTtcbmNvbnN0IEZSQUdNRU5UX1JVTEVTID0gWy4uLkdFTkVSSUMsIC4uLkZSQUdNRU5UXTtcblxuLyoqXG4gKiBSZXBsYWNlcyBlczMwMCBzeW50YXggdG8gZXMxMDBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2Uoc2hhZGVyLCBzaGFkZXJUeXBlKSB7XG4gICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfVxuXG4gICAgY29uc3QgcnVsZXMgPSBzaGFkZXJUeXBlID09PSAndmVydGV4JyA/IFZFUlRFWF9SVUxFUyA6IEZSQUdNRU5UX1JVTEVTO1xuICAgIHJ1bGVzLmZvckVhY2goKHJ1bGUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBydWxlLnJlcGxhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHNoYWRlciA9IHJ1bGUucmVwbGFjZShzaGFkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hhZGVyID0gc2hhZGVyLnJlcGxhY2UocnVsZS5tYXRjaCwgcnVsZS5yZXBsYWNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNoYWRlcjsgLy8gLnJlcGxhY2UoL15cXHMrfFxccyskL2dtLCAnJyk7XG59XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcblxuY2xhc3MgVmVjdG9yMyB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLCB6ID0gMCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB2ZWMzLmZyb21WYWx1ZXMoeCwgeSwgeik7XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHopIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICB9XG5cbiAgICBzZXQgeCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRhdGFbMF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbiAgICB9XG5cbiAgICBzZXQgeSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRhdGFbMV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVsxXTtcbiAgICB9XG5cbiAgICBzZXQgeih2YWx1ZSkge1xuICAgICAgICB0aGlzLmRhdGFbMl0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVsyXTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZlY3RvcjM7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0LCBxdWF0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vdmVjdG9yMyc7XG5cbmxldCB1dWlkID0gMDtcbmxldCBheGlzQW5nbGUgPSAwO1xuY29uc3QgcXVhdGVybmlvbkF4aXNBbmdsZSA9IHZlYzMuY3JlYXRlKCk7XG5cbmNsYXNzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnVpZCA9IHV1aWQrKztcblxuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjMoKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBWZWN0b3IzKCk7XG4gICAgICAgIHRoaXMuc2NhbGUgPSBuZXcgVmVjdG9yMygxLCAxLCAxKTtcblxuICAgICAgICB0aGlzLl90cmFuc3BhcmVudCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl92aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnF1YXRlcm5pb24gPSBxdWF0LmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy51cCA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKTtcbiAgICAgICAgdGhpcy5sb29rVG9UYXJnZXQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLm1hdHJpY2VzID0ge1xuICAgICAgICAgICAgcGFyZW50OiBtYXQ0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgbW9kZWw6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgICAgICBsb29rQXQ6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXJ0eSA9IHtcbiAgICAgICAgICAgIHNvcnRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgYXR0cmlidXRlczogZmFsc2UsXG4gICAgICAgICAgICBzaGFkZXI6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2NlbmVHcmFwaFNvcnRlciA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldCB0cmFuc3BhcmVudCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRpcnR5LnRyYW5zcGFyZW50ID0gdGhpcy50cmFuc3BhcmVudCAhPT0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3RyYW5zcGFyZW50ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHRyYW5zcGFyZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNwYXJlbnQ7XG4gICAgfVxuXG4gICAgc2V0IHZpc2libGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS5zb3J0aW5nID0gdGhpcy52aXNpYmxlICE9PSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fdmlzaWJsZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmlzaWJsZTtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaWNlcygpIHtcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpY2VzLnBhcmVudCk7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5tb2RlbCk7XG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tYXRyaWNlcy5sb29rQXQpO1xuICAgICAgICBxdWF0LmlkZW50aXR5KHRoaXMucXVhdGVybmlvbik7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICBtYXQ0LmNvcHkodGhpcy5tYXRyaWNlcy5wYXJlbnQsIHRoaXMucGFyZW50Lm1hdHJpY2VzLm1vZGVsKTtcbiAgICAgICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5wYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubG9va1RvVGFyZ2V0KSB7XG4gICAgICAgICAgICBtYXQ0LnRhcmdldFRvKHRoaXMubWF0cmljZXMubG9va0F0LCB0aGlzLnBvc2l0aW9uLmRhdGEsIHRoaXMudGFyZ2V0LCB0aGlzLnVwKTtcbiAgICAgICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5sb29rQXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5wb3NpdGlvbi5kYXRhKTtcbiAgICAgICAgICAgIHF1YXQucm90YXRlWCh0aGlzLnF1YXRlcm5pb24sIHRoaXMucXVhdGVybmlvbiwgdGhpcy5yb3RhdGlvbi54KTtcbiAgICAgICAgICAgIHF1YXQucm90YXRlWSh0aGlzLnF1YXRlcm5pb24sIHRoaXMucXVhdGVybmlvbiwgdGhpcy5yb3RhdGlvbi55KTtcbiAgICAgICAgICAgIHF1YXQucm90YXRlWih0aGlzLnF1YXRlcm5pb24sIHRoaXMucXVhdGVybmlvbiwgdGhpcy5yb3RhdGlvbi56KTtcbiAgICAgICAgICAgIGF4aXNBbmdsZSA9IHF1YXQuZ2V0QXhpc0FuZ2xlKHF1YXRlcm5pb25BeGlzQW5nbGUsIHRoaXMucXVhdGVybmlvbik7XG4gICAgICAgICAgICBtYXQ0LnJvdGF0ZSh0aGlzLm1hdHJpY2VzLm1vZGVsLCB0aGlzLm1hdHJpY2VzLm1vZGVsLCBheGlzQW5nbGUsIHF1YXRlcm5pb25BeGlzQW5nbGUpO1xuICAgICAgICB9XG4gICAgICAgIG1hdDQuc2NhbGUodGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5tYXRyaWNlcy5tb2RlbCwgdGhpcy5zY2FsZS5kYXRhKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAvLyB0byBiZSBvdmVycmlkZW47XG4gICAgfVxuXG4gICAgYWRkKG1vZGVsKSB7XG4gICAgICAgIG1vZGVsLnBhcmVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChtb2RlbCk7XG4gICAgICAgIHRoaXMuZGlydHkuc29ydGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKG1vZGVsKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eS5zb3J0aW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyYXZlcnNlKG9iamVjdCkge1xuICAgICAgICAvLyBpZiB0cmF2ZXJzZWQgb2JqZWN0IGlzIHRoZSBzY2VuZVxuICAgICAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG9iamVjdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLnNjZW5lR3JhcGhTb3J0ZXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMudHJhdmVyc2Uob2JqZWN0LmNoaWxkcmVuW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmplY3QucGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvYmplY3QudXBkYXRlTWF0cmljZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5PVEVcbiAgICAgICAgLy8gdG8gaW1wcm92ZSBwZXJmb3JtYW5jZSwgd2UgYWxzbyBjaGVjayBpZiB0aGUgb2JqZWN0cyBhcmUgZGlydHkgd2hlbiB3ZSB0cmF2ZXJzZSB0aGVtLlxuICAgICAgICAvLyB0aGlzIGF2b2lkcyBoYXZpbmcgYSBzZWNvbmQgbG9vcCB0aHJvdWdoIHRoZSBncmFwaCBzY2VuZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgYW55IGVsZW1lbnQgZ2V0cyBhZGRlZCAvIHJlbW92ZWQgZnJvbSBzY2VuZVxuICAgICAgICAvLyBvciBpZiBpdHMgdHJhbnNwYXJlbmN5IGNoYW5nZXMsIHdlIG5lZWQgdG8gc29ydCB0aGVtIGFnYWluIGludG9cbiAgICAgICAgLy8gb3BhcXVlIC8gdHJhbnNwYXJlbnQgYXJyYXlzXG4gICAgICAgIGlmIChvYmplY3QuZGlydHkuc29ydGluZyB8fFxuICAgICAgICAgICAgb2JqZWN0LmRpcnR5LnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBvYmplY3QuZGlydHkudHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmVHcmFwaFNvcnRlciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5zY2VuZUdyYXBoU29ydGVyO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0MztcbiIsImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi4vY29yZS9vYmplY3QzJztcblxuY2xhc3MgT3J0aG9ncmFwaGljQ2FtZXJhIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIGxlZnQ6IC0xLFxuICAgICAgICAgICAgcmlnaHQ6IDEsXG4gICAgICAgICAgICB0b3A6IDEsXG4gICAgICAgICAgICBib3R0b206IC0xLFxuICAgICAgICAgICAgbmVhcjogLTEwMDAsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5tYXRyaWNlcy5wcm9qZWN0aW9uID0gbWF0NC5jcmVhdGUoKTtcbiAgICB9XG5cbiAgICBsb29rQXQodikge1xuICAgICAgICB2ZWMzLmNvcHkodGhpcy50YXJnZXQsIHYpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNhbWVyYU1hdHJpeCgpIHtcbiAgICAgICAgLy8gbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXJcbiAgICAgICAgbWF0NC5vcnRobyhcbiAgICAgICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbixcbiAgICAgICAgICAgIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRoaXMucmlnaHQsXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSxcbiAgICAgICAgICAgIHRoaXMudG9wLFxuICAgICAgICAgICAgdGhpcy5uZWFyLFxuICAgICAgICAgICAgdGhpcy5mYXIsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcnRob2dyYXBoaWNDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBPYmplY3QzIGZyb20gJy4uL2NvcmUvb2JqZWN0Myc7XG5cbmNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgT2JqZWN0MyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgICAgICBmb3Y6IDM1LFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubWF0cmljZXMucHJvamVjdGlvbiA9IG1hdDQuY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgbG9va0F0KHYpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMudGFyZ2V0LCB2KTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYW1lcmFNYXRyaXgod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy5wcm9qZWN0aW9uLFxuICAgICAgICAgICAgdGhpcy5mb3YgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICAgICAgICB3aWR0aCAvIGhlaWdodCxcbiAgICAgICAgICAgIHRoaXMubmVhcixcbiAgICAgICAgICAgIHRoaXMuZmFyLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyc3BlY3RpdmVDYW1lcmE7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFVCTywgRk9HLCBFWFRFTlNJT05TIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0JBU0lDLCBEUkFXIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgQmFzaWMge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSBwcm9wcy5jb2xvciB8fCB2ZWMzLmZyb21WYWx1ZXMoMSwgMSwgMSk7XG5cbiAgICAgICAgY29uc3QgdmVydGV4ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLnZlcnRleCgpfVxuXG4gICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG4gICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gdmVjMyB1X2NvbG9yO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgYmFzZSA9IHZlYzQodV9jb2xvciwgMS4wKTtcblxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuXG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBiYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHR5cGU6IFNIQURFUl9CQVNJQyxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfY29sb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlYzMnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29sb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWM7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBtYWdGaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KFsyNTUsIDI1NSwgMjU1LCAyNTVdKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIDEsIDEsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5tYWdGaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5taW5GaWx0ZXIpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLndyYXBTKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgdGhpcy53cmFwVCk7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZnJvbUltYWdlKHVybCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShpbWcpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgIH1cblxuICAgIHVwZGF0ZShpbWFnZSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IHsgVUJPLCBMSUdIVCwgRk9HLCBDTElQUElORywgRVhURU5TSU9OUywgU0hBRE9XIH0gZnJvbSAnLi9jaHVua3MnO1xuaW1wb3J0IHsgU0hBREVSX0RFRkFVTFQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBEZWZhdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcHJvcHMuY29sb3IgfHwgdmVjMy5mcm9tVmFsdWVzKDEsIDEsIDEpO1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBUZXh0dXJlKHsgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XG5cbiAgICAgICAgLy8gbWFwOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vNjIwNjc4L3JlZC5qcGcnLlxuICAgICAgICBpZiAocHJvcHMubWFwKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5mcm9tSW1hZ2UocHJvcHMubWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRleHR1cmU6IG5ldyBUZXh0dXJlKClcbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMyBhX25vcm1hbDtcbiAgICAgICAgICAgIGluIHZlYzIgYV91djtcblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleF9wcmUoKX1cbiAgICAgICAgICAgICR7U0hBRE9XLnZlcnRleF9wcmUoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcbiAgICAgICAgICAgIG91dCB2ZWMzIHZfbm9ybWFsO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2aWV3TWF0cml4ICogd29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgZnJhZ1ZlcnRleEVjID0gcG9zaXRpb24ueHl6OyAvLyB3b3JsZFBvc2l0aW9uLnh5ejtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgICAgICB2X25vcm1hbCA9IChub3JtYWxNYXRyaXggKiB2ZWM0KGFfbm9ybWFsLCAxLjApKS54eXo7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy52ZXJ0ZXgoKX1cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzMgZnJhZ1ZlcnRleEVjO1xuICAgICAgICAgICAgaW4gdmVjMiB2X3V2O1xuICAgICAgICAgICAgaW4gdmVjMyB2X25vcm1hbDtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgdV9jb2xvcjtcblxuICAgICAgICAgICAgJHtTSEFET1cuZnJhZ21lbnRfcHJlKCl9XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyB2X25vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KGZyYWdWZXJ0ZXhFYyksIGRGZHkoZnJhZ1ZlcnRleEVjKSkpO1xuXG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKz0gdmVjNCh1X2NvbG9yLCAxLjApO1xuICAgICAgICAgICAgICAgIGJhc2UgKj0gdGV4dHVyZSh1X21hcCwgdl91dik7XG5cbiAgICAgICAgICAgICAgICAke1NIQURPVy5mcmFnbWVudCgpfVxuICAgICAgICAgICAgICAgICR7TElHSFQuZmFjdG9yeSgpfVxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfREVGQVVMVCxcbiAgICAgICAgICAgIG1vZGU6IHByb3BzLndpcmVmcmFtZSA9PT0gdHJ1ZSA/IERSQVcuTElORVMgOiBEUkFXLlRSSUFOR0xFUyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHVfbWFwOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzYW1wbGVyMkQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5tYXAudGV4dHVyZSxcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgdV9jb2xvcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjMycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb2xvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0O1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vY29yZS90ZXh0dXJlJztcbmltcG9ydCB7IFVCTywgRVhURU5TSU9OUyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9CSUxMQk9BUkQsIERSQVcgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBCaWxsYm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgVGV4dHVyZSgpO1xuXG4gICAgICAgIGlmIChwcm9wcy5tYXApIHtcbiAgICAgICAgICAgIHRoaXMubWFwLmZyb21JbWFnZShwcm9wcy5tYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb3BzLnRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gcHJvcHMudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy52ZXJ0ZXgoKX1cblxuICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cblxuICAgICAgICAgICAgb3V0IHZlYzIgdl91djtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgICAgICAgICB2X3V2ID0gYV91djtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IGAjdmVyc2lvbiAzMDAgZXNcbiAgICAgICAgICAgICR7RVhURU5TSU9OUy5mcmFnbWVudCgpfVxuXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICBpbiB2ZWMyIHZfdXY7XG5cbiAgICAgICAgICAgICR7VUJPLnNjZW5lKCl9XG5cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfbWFwO1xuXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIC8vIGRlcHRoIG1hcFxuICAgICAgICAgICAgICAgIGZsb2F0IHogPSB0ZXh0dXJlKHVfbWFwLCB2X3V2KS5yO1xuICAgICAgICAgICAgICAgIGZsb2F0IG4gPSAxLjA7XG4gICAgICAgICAgICAgICAgZmxvYXQgZiA9IDEwMDAuMDtcbiAgICAgICAgICAgICAgICBmbG9hdCBjID0gKDIuMCAqIG4pIC8gKGYgKyBuIC0geiAqIChmIC0gbikpO1xuXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBkZXB0aFxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gdmVjNChjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfQklMTEJPQVJELFxuICAgICAgICAgICAgbW9kZTogRFJBVy5UUklBTkdMRVMsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB1X21hcDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2FtcGxlcjJEJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMubWFwLnRleHR1cmUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmlsbGJvYXJkO1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vY29yZS90ZXh0dXJlJztcbmltcG9ydCB7IFVCTywgRk9HLCBDTElQUElORywgRVhURU5TSU9OUyB9IGZyb20gJy4vY2h1bmtzJztcbmltcG9ydCB7IFNIQURFUl9TRU0gfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBTZW0ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgVGV4dHVyZSh7IHRyYW5zcGFyZW50OiB0cnVlIH0pO1xuXG4gICAgICAgIGlmIChwcm9wcy5tYXApIHtcbiAgICAgICAgICAgIHRoaXMubWFwLmZyb21JbWFnZShwcm9wcy5tYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGV4dHVyZTogbmV3IFRleHR1cmUoKVxuICAgICAgICBpZiAocHJvcHMudGV4dHVyZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAgPSBwcm9wcy50ZXh0dXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmVydGV4ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLnZlcnRleCgpfVxuXG4gICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XG4gICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xuICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAke1VCTy5zY2VuZSgpfVxuICAgICAgICAgICAgJHtVQk8ubW9kZWwoKX1cbiAgICAgICAgICAgICR7Q0xJUFBJTkcudmVydGV4X3ByZSgpfVxuXG4gICAgICAgICAgICBvdXQgdmVjMiB2X3V2O1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBwb3NpdGlvbiA9IHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcbiAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBwb3NpdGlvbjtcblxuICAgICAgICAgICAgICAgIHZlYzMgdl9lID0gdmVjMyhwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdmVjMyB2X24gPSBtYXQzKHZpZXdNYXRyaXggKiBtb2RlbE1hdHJpeCkgKiBhX25vcm1hbDtcbiAgICAgICAgICAgICAgICB2ZWMzIHIgPSByZWZsZWN0KG5vcm1hbGl6ZSh2X2UpLCBub3JtYWxpemUodl9uKSk7XG4gICAgICAgICAgICAgICAgZmxvYXQgbSA9IDIuMCAqIHNxcnQocG93KHIueCwgMi4wKSArIHBvdyhyLnksIDIuMCkgKyBwb3coci56ICsgMS4wLCAyLjApKTtcbiAgICAgICAgICAgICAgICB2X3V2ID0gci54eSAvIG0gKyAwLjU7XG5cbiAgICAgICAgICAgICAgICAke0NMSVBQSU5HLnZlcnRleCgpfVxuICAgICAgICAgICAgfVxuICAgICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgJHtFWFRFTlNJT05TLmZyYWdtZW50KCl9XG5cbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICAgICAgICAgIGluIHZlYzIgdl91djtcblxuICAgICAgICAgICAgJHtDTElQUElORy5mcmFnbWVudF9wcmUoKX1cblxuICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICR7VUJPLm1vZGVsKCl9XG4gICAgICAgICAgICAke1VCTy5saWdodHMoKX1cblxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9tYXA7XG5cbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjNCBiYXNlID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1xuXG4gICAgICAgICAgICAgICAgYmFzZSArPSB0ZXh0dXJlKHVfbWFwLCB2X3V2KTtcblxuICAgICAgICAgICAgICAgICR7Rk9HLmxpbmVhcigpfVxuICAgICAgICAgICAgICAgICR7Q0xJUFBJTkcuZnJhZ21lbnQoKX1cblxuICAgICAgICAgICAgICAgIG91dENvbG9yID0gYmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICB0eXBlOiBTSEFERVJfU0VNLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdV9tYXA6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3NhbXBsZXIyRCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1hcC50ZXh0dXJlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbTtcbiIsImNvbnN0IFBST0dSQU1fUE9PTCA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVTaGFkZXIoZ2wsIHN0ciwgdHlwZSkge1xuICAgIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHN0cik7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgY29uc3QgY29tcGlsZWQgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyk7XG5cbiAgICBpZiAoIWNvbXBpbGVkKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihzaGFkZXIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLCBzdHIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVQcm9ncmFtID0gKGdsLCB2ZXJ0ZXgsIGZyYWdtZW50LCBwcm9ncmFtSUQpID0+IHtcbiAgICBjb25zdCBwb29sID0gUFJPR1JBTV9QT09MW2Bwb29sXyR7cHJvZ3JhbUlEfWBdO1xuICAgIGlmICghcG9vbCkge1xuICAgICAgICBjb25zdCB2cyA9IGNyZWF0ZVNoYWRlcihnbCwgdmVydGV4LCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgY29uc3QgZnMgPSBjcmVhdGVTaGFkZXIoZ2wsIGZyYWdtZW50LCBnbC5GUkFHTUVOVF9TSEFERVIpO1xuXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG5cbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgUFJPR1JBTV9QT09MW2Bwb29sXyR7cHJvZ3JhbUlEfWBdID0gcHJvZ3JhbTtcblxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9vbDtcbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0IH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5cbmNsYXNzIFVibyB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgYm91bmRMb2NhdGlvbikge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgdGhpcy5ib3VuZExvY2F0aW9uID0gYm91bmRMb2NhdGlvbjtcblxuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy5kYXRhLCBnbC5TVEFUSUNfRFJBVyk7IC8vIERZTkFNSUNfRFJBV1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYm91bmRMb2NhdGlvbiwgdGhpcy5idWZmZXIpO1xuICAgICAgICAvLyBnbC5iaW5kQnVmZmVyQmFzZShnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7IC8vIE1BWUJFP1xuICAgIH1cblxuICAgIHVwZGF0ZShkYXRhLCBvZmZzZXQgPSAwKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIHRoaXMuZGF0YS5zZXQoZGF0YSwgb2Zmc2V0KTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIDAsIHRoaXMuZGF0YSwgMCwgbnVsbCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVWJvO1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgVmFvIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IHsgdmVydGV4QXJyYXlPYmplY3QgfSA9IHN1cHBvcnRzKCk7XG5cbiAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLnZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnZhbyA9IHN1cHBvcnRzKCkudmVydGV4QXJyYXlPYmplY3QuY3JlYXRlVmVydGV4QXJyYXlPRVMoKTtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICAgIHZlcnRleEFycmF5T2JqZWN0LmJpbmRWZXJ0ZXhBcnJheU9FUyh0aGlzLnZhbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5T2JqZWN0IH0gPSBzdXBwb3J0cygpO1xuXG4gICAgICAgIGlmIChnZXRDb250ZXh0VHlwZSgpID09PSBDT05URVhULldFQkdMMikge1xuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheU9iamVjdC5iaW5kVmVydGV4QXJyYXlPRVMobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgY29uc3QgeyB2ZXJ0ZXhBcnJheU9iamVjdCB9ID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIGdsLmRlbGV0ZVZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgICAgdmVydGV4QXJyYXlPYmplY3QuZGVsZXRlVmVydGV4QXJyYXlPRVModGhpcy52YW8pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFvID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZhbztcbiIsImV4cG9ydCBjb25zdCBnZXRUeXBlU2l6ZSA9ICh0eXBlKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnZmxvYXQnOlxuICAgICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndmVjMyc6XG4gICAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ3ZlYzQnOlxuICAgIGNhc2UgJ21hdDInOlxuICAgICAgICByZXR1cm4gNDtcbiAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgcmV0dXJuIDk7XG4gICAgY2FzZSAnbWF0NCc6XG4gICAgICAgIHJldHVybiAxNjtcbiAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt0eXBlfVwiIGlzIGFuIHVua25vd24gdHlwZWApO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSwgc3VwcG9ydHMgfSBmcm9tICcuLi9zZXNzaW9uJztcbmltcG9ydCB7IENPTlRFWFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgaW5pdEF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcywgcHJvZ3JhbSkgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGF0dHJpYnV0ZXNbcHJvcF07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgcHJvcCk7XG5cbiAgICAgICAgbGV0IGIgPSBjdXJyZW50LmJ1ZmZlcjtcbiAgICAgICAgaWYgKCFjdXJyZW50LmJ1ZmZlcikge1xuICAgICAgICAgICAgYiA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgY3VycmVudC52YWx1ZSwgZ2wuU1RBVElDX0RSQVcpOyAvLyBvciBEWU5BTUlDX0RSQVdcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oY3VycmVudCwge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXI6IGIsXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBiaW5kQXR0cmlidXRlcyA9IChhdHRyaWJ1dGVzKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgaW5zdGFuY2VkLFxuICAgICAgICB9ID0gYXR0cmlidXRlc1trZXldO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgc2l6ZSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgZGl2aXNvciA9IGluc3RhbmNlZCA/IDEgOiAwO1xuICAgICAgICAgICAgaWYgKGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcihsb2NhdGlvbiwgZGl2aXNvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRzKCkuaW5zdGFuY2VkQXJyYXlzLnZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRShsb2NhdGlvbiwgZGl2aXNvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUF0dHJpYnV0ZXMgPSAoYXR0cmlidXRlcykgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9ID0gYXR0cmlidXRlc1trZXldO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xuICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZhbHVlLCBnbC5EWU5BTUlDX0RSQVcpO1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q29udGV4dCB9IGZyb20gJy4uL3Nlc3Npb24nO1xuXG5leHBvcnQgY29uc3QgaW5pdFVuaWZvcm1zID0gKHVuaWZvcm1zLCBwcm9ncmFtKSA9PiB7XG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICBjb25zdCB0ZXh0dXJlSW5kaWNlcyA9IFtcbiAgICAgICAgZ2wuVEVYVFVSRTAsXG4gICAgICAgIGdsLlRFWFRVUkUxLFxuICAgICAgICBnbC5URVhUVVJFMixcbiAgICAgICAgZ2wuVEVYVFVSRTMsXG4gICAgICAgIGdsLlRFWFRVUkU0LFxuICAgICAgICBnbC5URVhUVVJFNSxcbiAgICBdO1xuXG4gICAgbGV0IGkgPSAwO1xuXG4gICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHVuaWZvcm1zW3Byb3BdO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBwcm9wKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGN1cnJlbnQsIHtcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY3VycmVudC50eXBlID09PSAnc2FtcGxlcjJEJykge1xuICAgICAgICAgICAgY3VycmVudC50ZXh0dXJlSW5kZXggPSBpO1xuICAgICAgICAgICAgY3VycmVudC5hY3RpdmVUZXh0dXJlID0gdGV4dHVyZUluZGljZXNbaV07XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVVbmlmb3JtcyA9ICh1bmlmb3JtcykgPT4ge1xuICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdW5pZm9ybSA9IHVuaWZvcm1zW2tleV07XG5cbiAgICAgICAgc3dpdGNoICh1bmlmb3JtLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbWF0NCc6XG4gICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtYXQzJzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYodW5pZm9ybS5sb2NhdGlvbiwgZmFsc2UsIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZlYzQnOlxuICAgICAgICAgICAgZ2wudW5pZm9ybTRmdih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd2ZWMzJzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm0zZnYodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICBnbC51bmlmb3JtMmZ2KHVuaWZvcm0ubG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgIGdsLnVuaWZvcm0xZih1bmlmb3JtLmxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzYW1wbGVyMkQnOlxuICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZSh1bmlmb3JtLmFjdGl2ZVRleHR1cmUpO1xuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICBnbC51bmlmb3JtMWkodW5pZm9ybS5sb2NhdGlvbiwgdW5pZm9ybS50ZXh0dXJlSW5kZXgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt1bmlmb3JtLnR5cGV9XCIgaXMgYW4gdW5rbm93biB1bmlmb3JtIHR5cGVgKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IGNyZWF0ZVByb2dyYW0gfSBmcm9tICcuLi9nbC9wcm9ncmFtJztcbmltcG9ydCB7IGdldENvbnRleHQsIGdldENvbnRleHRUeXBlLCBzdXBwb3J0cyB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCwgRFJBVywgU0lERSwgU0hBREVSX0NVU1RPTSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICAgIGJpbmRBdHRyaWJ1dGVzLFxuICAgIGdldFR5cGVTaXplLFxuICAgIGluaXRBdHRyaWJ1dGVzLFxuICAgIGluaXRVbmlmb3JtcyxcbiAgICB1cGRhdGVVbmlmb3JtcyxcbiAgICB1cGRhdGVBdHRyaWJ1dGVzLFxuICAgIFZhbyxcbn0gZnJvbSAnLi4vZ2wnO1xuaW1wb3J0IHsgZ2xzbDN0bzEgfSBmcm9tICcuLi91dGlscyc7XG5cbi8vIHVzZWQgZm9yIHNwZWVkIG9wdGltaXNhdGlvblxubGV0IFdFQkdMMiA9IGZhbHNlO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0ge307XG5cbiAgICAgICAgLy8geiBmaWdodFxuICAgICAgICB0aGlzLnBvbHlnb25PZmZzZXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0RmFjdG9yID0gMDtcbiAgICAgICAgdGhpcy5wb2x5Z29uT2Zmc2V0VW5pdHMgPSAxO1xuXG4gICAgICAgIC8vIGNsaXBwaW5nIHBsYW5lc1xuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW1xuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpbnN0YW5jaW5nXG4gICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHJlbmRlcmluZyBtb2RlXG4gICAgICAgIHRoaXMubW9kZSA9IERSQVcuVFJJQU5HTEVTO1xuXG4gICAgICAgIC8vIHJlbmRlcmluZyBzaWRlXG4gICAgICAgIHRoaXMuc2lkZSA9IFNJREUuRlJPTlQ7XG5cbiAgICAgICAgLy8gdHlwZVxuICAgICAgICB0aGlzLnR5cGUgPSBTdHJpbmcoU0hBREVSX0NVU1RPTSk7XG5cbiAgICAgICAgLy8gY3JlYXRlcyBzaGFkb3dcbiAgICAgICAgdGhpcy5zaGFkb3dzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXRBdHRyaWJ1dGUobmFtZSwgdHlwZSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdldFR5cGVTaXplKHR5cGUpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0SW5kZXgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbmRpY2VzID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0VW5pZm9ybShuYW1lLCB0eXBlLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnVuaWZvcm1zW25hbWVdID0ge1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHNldFNoYWRlcih2ZXJ0ZXgsIGZyYWdtZW50KSB7XG4gICAgICAgIHRoaXMudmVydGV4ID0gdmVydGV4O1xuICAgICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG4gICAgfVxuXG4gICAgc2V0SW5zdGFuY2VBdHRyaWJ1dGUobmFtZSwgdHlwZSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdldFR5cGVTaXplKHR5cGUpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICBpbnN0YW5jZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0SW5zdGFuY2VDb3VudCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbnN0YW5jZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5zdGFuY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIFdFQkdMMiA9IGdldENvbnRleHRUeXBlKCkgPT09IENPTlRFWFQuV0VCR0wyO1xuXG4gICAgICAgIC8vIG9iamVjdCBtYXRlcmlhbFxuICAgICAgICBpZiAodGhpcy52ZXJ0ZXggJiYgdGhpcy5mcmFnbWVudCkge1xuICAgICAgICAgICAgaWYgKCFXRUJHTDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnRleCA9IGdsc2wzdG8xKHRoaXMudmVydGV4LCAndmVydGV4Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IGdsc2wzdG8xKHRoaXMuZnJhZ21lbnQsICdmcmFnbWVudCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBjcmVhdGVQcm9ncmFtKGdsLCB0aGlzLnZlcnRleCwgdGhpcy5mcmFnbWVudCwgdGhpcy50eXBlKTtcbiAgICAgICAgICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcblxuICAgICAgICAgICAgdGhpcy52YW8gPSBuZXcgVmFvKCk7XG5cbiAgICAgICAgICAgIGluaXRBdHRyaWJ1dGVzKHRoaXMuYXR0cmlidXRlcywgdGhpcy5wcm9ncmFtKTtcbiAgICAgICAgICAgIGluaXRVbmlmb3Jtcyh0aGlzLnVuaWZvcm1zLCB0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbmRpY2VzICYmICF0aGlzLmluZGljZXMuYnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLmJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGlzLnZhby5iaW5kKCk7XG4gICAgICAgICAgICAvLyB0aGlzLmJpbmQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMudmFvLnVuYmluZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy51bmJpbmQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgYmluZEF0dHJpYnV0ZXModGhpcy5hdHRyaWJ1dGVzLCB0aGlzLnByb2dyYW0pO1xuXG4gICAgICAgIGlmICh0aGlzLmluZGljZXMpIHtcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kaWNlcy5idWZmZXIpO1xuICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5pbmRpY2VzLnZhbHVlLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW5TaGFkb3dNYXApIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlydHkuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlcyh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eS5hdHRyaWJ1dGVzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZVVuaWZvcm1zKHRoaXMudW5pZm9ybXMpO1xuXG4gICAgICAgIC8vIGVuYWJsZSBkZXB0aCB0ZXN0IGFuZCBjdWxsaW5nXG4gICAgICAgIC8vIFRPRE86IG1heWJlIHRoaXMgY2FuIGhhdmUgb3duIHZhcmlhYmxlcyBwZXIgbW9kZWwuXG4gICAgICAgIC8vIGZvciBleGFtcGxlIHJlbmRlciB0YXJnZXRzIGRvbid0IG5lZWQgZGVwdGggdGVzdFxuICAgICAgICAvLyBpZiAodGhpcy5zaGFkb3dzID09PSBmYWxzZSkge1xuICAgICAgICAvLyAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgLy8gZ2wuZGlzYWJsZShnbC5CTEVORCk7XG5cbiAgICAgICAgaWYgKHRoaXMucG9seWdvbk9mZnNldCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLlBPTFlHT05fT0ZGU0VUX0ZJTEwpO1xuICAgICAgICAgICAgZ2wucG9seWdvbk9mZnNldCh0aGlzLnBvbHlnb25PZmZzZXRGYWN0b3IsIHRoaXMucG9seWdvbk9mZnNldFVuaXRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuUE9MWUdPTl9PRkZTRVRfRklMTCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBodHRwczovL3dlYmdsMmZ1bmRhbWVudGFscy5vcmcvd2ViZ2wvbGVzc29ucy93ZWJnbC10ZXh0LXRleHR1cmUuaHRtbFxuICAgICAgICAvLyBUaGUgbW9zdCBjb21tb24gc29sdXRpb24gZm9yIHByZXR0eSBtdWNoIGFsbCB0cmFuc3BhcmVudCByZW5kZXJpbmcgaXNcbiAgICAgICAgLy8gdG8gZHJhdyBhbGwgdGhlIG9wYXF1ZSBzdHVmZiBmaXJzdCxcbiAgICAgICAgLy8gdGhlbiBhZnRlciwgZHJhdyBhbGwgdGhlIHRyYW5zcGFyZW50IHN0dWZmIHNvcnRlZCBieSB6IGRpc3RhbmNlXG4gICAgICAgIC8vIHdpdGggdGhlIGRlcHRoIGJ1ZmZlciB0ZXN0aW5nIG9uIGJ1dCBkZXB0aCBidWZmZXIgdXBkYXRpbmcgb2ZmXG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgICAgICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG91YmxlIHNpZGUgbWF0ZXJpYWxcbiAgICAgICAgaWYgKHRoaXMuc2lkZSA9PT0gU0lERS5GUk9OVCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNpZGUgPT09IFNJREUuQkFDSykge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWRlID09PSBTSURFLkJPVEgpIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpblNoYWRvd01hcCkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBnbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICBpZiAodGhpcy5pc0luc3RhbmNlKSB7XG4gICAgICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzSW5zdGFuY2VkKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlcy52YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JULFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlQ291bnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHMoKS5pbnN0YW5jZWRBcnJheXMuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VDb3VudCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW5kaWNlcykge1xuICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKHRoaXMubW9kZSwgdGhpcy5pbmRpY2VzLnZhbHVlLmxlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyh0aGlzLm1vZGUsIDAsIHRoaXMuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlLmxlbmd0aCAvIDMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb2RlbDtcbiIsImltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IERlZmF1bHQgfSBmcm9tICcuLi9zaGFkZXJzJztcbmltcG9ydCB7IFNIQURFUl9DVVNUT00gfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5sZXQgc2hhZGVySUQgPSAwO1xuY2xhc3MgTWVzaCBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX3NoYWRlciA9IG51bGw7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgaW5kaWNlcyxcbiAgICAgICAgICAgIG5vcm1hbHMsXG4gICAgICAgICAgICB1dnMsXG4gICAgICAgIH0gPSBwYXJhbXMuZ2VvbWV0cnk7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBtb2RlLFxuICAgICAgICB9ID0gcGFyYW1zLnNoYWRlciB8fCBuZXcgRGVmYXVsdCh7IGNvbG9yOiBwYXJhbXMuY29sb3IsIG1hcDogcGFyYW1zLm1hcCB9KTtcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIGEgdHlwZSwgYXNzaWduIGl0LCBzbyB3ZSBjYW4gc29ydCBieSB0eXBlIGluIHRoZSByZW5kZXJlci5cbiAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IGAke1NIQURFUl9DVVNUT019LSR7c2hhZGVySUQrK31gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhX3Bvc2l0aW9uJywgJ3ZlYzMnLCBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucykpO1xuICAgICAgICBpZiAoaW5kaWNlcykge1xuICAgICAgICAgICAgdGhpcy5zZXRJbmRleChuZXcgVWludDE2QXJyYXkoaW5kaWNlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3JtYWxzKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYV9ub3JtYWwnLCAndmVjMycsIG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1dnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhX3V2JywgJ3ZlYzInLCBuZXcgRmxvYXQzMkFycmF5KHV2cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRVbmlmb3JtKGtleSwgdW5pZm9ybXNba2V5XS50eXBlLCB1bmlmb3Jtc1trZXldLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaGFkZXIodmVydGV4LCBmcmFnbWVudCk7XG4gICAgfVxuXG4gICAgc2V0IHNoYWRlcihzaGFkZXIpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS5zaGFkZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zaGFkZXIgPSBzaGFkZXI7XG4gICAgICAgIGlmIChzaGFkZXIudHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBzaGFkZXIudHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFNIQURFUl9DVVNUT007XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTaGFkZXIoc2hhZGVyLnZlcnRleCwgc2hhZGVyLmZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBnZXQgc2hhZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhZGVyO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzaDtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi4vY29yZS9tZXNoJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9jb3JlL21vZGVsJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vc2hhZGVycyc7XG5cbmNsYXNzIEF4aXNIZWxwZXIgZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSAocHJvcHMgJiYgcHJvcHMuc2l6ZSkgfHwgMTA7XG4gICAgICAgIGNvbnN0IGcxID0geyBwb3NpdGlvbnM6IFsuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksIC4uLnZlYzMuZnJvbVZhbHVlcyhzaXplLCAwLCAwKV0gfTtcbiAgICAgICAgY29uc3QgZzIgPSB7IHBvc2l0aW9uczogWy4uLnZlYzMuZnJvbVZhbHVlcygwLCAwLCAwKSwgLi4udmVjMy5mcm9tVmFsdWVzKDAsIHNpemUsIDApXSB9O1xuICAgICAgICBjb25zdCBnMyA9IHsgcG9zaXRpb25zOiBbLi4udmVjMy5mcm9tVmFsdWVzKDAsIDAsIDApLCAuLi52ZWMzLmZyb21WYWx1ZXMoMCwgMCwgc2l6ZSldIH07XG5cbiAgICAgICAgY29uc3QgbTEgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDEsIDAsIDApLCB3aXJlZnJhbWU6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IG0yID0gbmV3IEJhc2ljKHsgY29sb3I6IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKSwgd2lyZWZyYW1lOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBtMyA9IG5ldyBCYXNpYyh7IGNvbG9yOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMSksIHdpcmVmcmFtZTogdHJ1ZSB9KTtcblxuXG4gICAgICAgIGNvbnN0IHggPSBuZXcgTWVzaCh7IGdlb21ldHJ5OiBnMSwgc2hhZGVyOiBtMSB9KTtcbiAgICAgICAgdGhpcy5hZGQoeCk7XG5cbiAgICAgICAgY29uc3QgeSA9IG5ldyBNZXNoKHsgZ2VvbWV0cnk6IGcyLCBzaGFkZXI6IG0yIH0pO1xuICAgICAgICB0aGlzLmFkZCh5KTtcblxuICAgICAgICBjb25zdCB6ID0gbmV3IE1lc2goeyBnZW9tZXRyeTogZzMsIHNoYWRlcjogbTMgfSk7XG4gICAgICAgIHRoaXMuYWRkKHopO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEF4aXNIZWxwZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCBNZXNoIGZyb20gJy4uL2NvcmUvbWVzaCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vY29yZS9tb2RlbCc7XG5pbXBvcnQgeyBCYXNpYyB9IGZyb20gJy4uL3NoYWRlcnMnO1xuLy8gaW1wb3J0IHsgRFJBVyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEF4aXNIZWxwZXIgZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSAocHJvcHMgJiYgcHJvcHMuc2l6ZSkgfHwgMTtcbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGV4dHJhY3QgZ2VvbWV0cnlcbiAgICAgICAgY29uc3Qgc3ggPSBwcm9wcy5tb2RlbC5zY2FsZS54O1xuICAgICAgICBjb25zdCBzeSA9IHByb3BzLm1vZGVsLnNjYWxlLnk7XG4gICAgICAgIGNvbnN0IHN6ID0gcHJvcHMubW9kZWwuc2NhbGUuejtcblxuICAgICAgICBjb25zdCBsZW5ndGggPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlLmxlbmd0aCAvIDM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGkzID0gaSAqIDM7XG4gICAgICAgICAgICBjb25zdCB2MHggPSBzeCAqIHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZVtpMyArIDBdO1xuICAgICAgICAgICAgY29uc3QgdjB5ID0gc3kgKiBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfcG9zaXRpb24udmFsdWVbaTMgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IHYweiA9IHN6ICogcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX3Bvc2l0aW9uLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCBueCA9IHByb3BzLm1vZGVsLmF0dHJpYnV0ZXMuYV9ub3JtYWwudmFsdWVbaTMgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IG55ID0gcHJvcHMubW9kZWwuYXR0cmlidXRlcy5hX25vcm1hbC52YWx1ZVtpMyArIDFdO1xuICAgICAgICAgICAgY29uc3QgbnogPSBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzLmFfbm9ybWFsLnZhbHVlW2kzICsgMl07XG4gICAgICAgICAgICBjb25zdCB2MXggPSB2MHggKyAoc2l6ZSAqIG54KTtcbiAgICAgICAgICAgIGNvbnN0IHYxeSA9IHYweSArIChzaXplICogbnkpO1xuICAgICAgICAgICAgY29uc3QgdjF6ID0gdjB6ICsgKHNpemUgKiBueik7XG4gICAgICAgICAgICBnZW9tZXRyeS5wb3NpdGlvbnMgPSBnZW9tZXRyeS5wb3NpdGlvbnMuY29uY2F0KFt2MHgsIHYweSwgdjB6LCB2MXgsIHYxeSwgdjF6XSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGFkZXIgPSBuZXcgQmFzaWMoeyBjb2xvcjogdmVjMy5mcm9tVmFsdWVzKDAsIDEsIDEpLCB3aXJlZnJhbWU6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IG4gPSBuZXcgTWVzaCh7IGdlb21ldHJ5LCBzaGFkZXIgfSk7XG4gICAgICAgIHRoaXMuYWRkKG4pO1xuXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gcHJvcHMubW9kZWw7XG4gICAgICAgIC8vIG1vZGUgPSBEUkFXLkxJTkVTXG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBzdXBlci51cGRhdGUoKTtcblxuICAgICAgICB2ZWMzLmNvcHkodGhpcy5wb3NpdGlvbi5kYXRhLCB0aGlzLnJlZmVyZW5jZS5wb3NpdGlvbi5kYXRhKTtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMucm90YXRpb24uZGF0YSwgdGhpcy5yZWZlcmVuY2Uucm90YXRpb24uZGF0YSk7XG4gICAgICAgIHRoaXMubG9va1RvVGFyZ2V0ID0gdGhpcy5yZWZlcmVuY2UubG9va1RvVGFyZ2V0O1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEF4aXNIZWxwZXI7XG4iLCJleHBvcnQgZnVuY3Rpb24gcmVzaXplKGRvbUVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHJhdGlvKSB7XG4gICAgZG9tRWxlbWVudC53aWR0aCA9IHdpZHRoICogcmF0aW87XG4gICAgZG9tRWxlbWVudC5oZWlnaHQgPSBoZWlnaHQgKiByYXRpbztcbiAgICBkb21FbGVtZW50LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIGRvbUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc3VwcG9ydGVkKCkge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5pbm5lckhUTUwgPSAnWW91ciBicm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IFdlYkdMLjxicj48YSBocmVmPVwiaHR0cHM6Ly9nZXQud2ViZ2wub3JnXCI+R2V0IFdlYkdMPC9hPic7XG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgIGRpdi5zdHlsZS5tYXJnaW4gPSAnMjBweCBhdXRvIDAgYXV0byc7XG4gICAgZGl2LnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzMzMyc7XG4gICAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSknO1xuICAgIGRpdi5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcbiAgICBkaXYuc3R5bGUucGFkZGluZyA9ICcxMHB4JztcbiAgICBkaXYuc3R5bGUuZm9udEZhbWlseSA9ICdtb25vc3BhY2UnO1xuICAgIGRpdi5zdHlsZS5mb250U2l6ZSA9ICcxMnB4JztcbiAgICBkaXYuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgcmV0dXJuIGRpdjtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuLy8gaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vY29yZS92ZWN0b3IzJztcbmltcG9ydCB7IERJUkVDVElPTkFMX0xJR0hUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgTGlnaHQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gdmVjMy5jcmVhdGUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICAvLyBUT0RPXG4gICAgfVxufVxuXG5jbGFzcyBEaXJlY3Rpb25hbCBleHRlbmRzIExpZ2h0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gRElSRUNUSU9OQUxfTElHSFQ7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IHByb3BzLmNvbG9yIHx8IHZlYzMuZnJvbVZhbHVlcygxLCAxLCAxKTtcbiAgICAgICAgdGhpcy5pbnRlbnNpdHkgPSBwcm9wcy5pbnRlbnNpdHkgfHwgMC45ODk7XG4gICAgfVxufVxuXG5leHBvcnQge1xuICAgIERpcmVjdGlvbmFsLFxufTtcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IE9iamVjdDMgZnJvbSAnLi9vYmplY3QzJztcbmltcG9ydCB7IERpcmVjdGlvbmFsIH0gZnJvbSAnLi9saWdodHMnO1xuaW1wb3J0IHsgRElSRUNUSU9OQUxfTElHSFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIE9iamVjdDMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMubGlnaHRzID0ge1xuICAgICAgICAgICAgZGlyZWN0aW9uYWw6IFtdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZm9nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbG9yOiB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSksXG4gICAgICAgICAgICBzdGFydDogNTAwLFxuICAgICAgICAgICAgZW5kOiAxMDAwLFxuICAgICAgICAgICAgZGVuc2l0eTogMC4wMDAyNSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsaXBwaW5nID0ge1xuICAgICAgICAgICAgZW5hYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYW5lczogW1xuICAgICAgICAgICAgICAgIHZlYzQuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgdmVjNC5jcmVhdGUoKSxcbiAgICAgICAgICAgICAgICB2ZWM0LmNyZWF0ZSgpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGQgc3VuXG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbmFsID0gbmV3IERpcmVjdGlvbmFsKHtcbiAgICAgICAgICAgIG5lYXI6IDEsXG4gICAgICAgICAgICBmYXI6IDEwMDAsXG4gICAgICAgIH0pO1xuICAgICAgICBkaXJlY3Rpb25hbC5wb3NpdGlvblswXSA9IDEyNTtcbiAgICAgICAgZGlyZWN0aW9uYWwucG9zaXRpb25bMV0gPSAyNTA7XG4gICAgICAgIGRpcmVjdGlvbmFsLnBvc2l0aW9uWzJdID0gNTAwO1xuICAgICAgICB0aGlzLmFkZExpZ2h0KGRpcmVjdGlvbmFsKTtcbiAgICB9XG5cbiAgICBhZGRMaWdodChsaWdodCkge1xuICAgICAgICBzd2l0Y2ggKGxpZ2h0LnR5cGUpIHtcbiAgICAgICAgY2FzZSBESVJFQ1RJT05BTF9MSUdIVDpcbiAgICAgICAgICAgIHRoaXMubGlnaHRzLmRpcmVjdGlvbmFsLnB1c2gobGlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB1bnN1cHBvcnRlZCBsaWdodFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlTGlnaHQobGlnaHQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmxpZ2h0cy5kaXJlY3Rpb25hbC5pbmRleE9mKGxpZ2h0KTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlnaHQuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5saWdodHMuZGlyZWN0aW9uYWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmU7XG4iLCJpbXBvcnQgeyBnZXRDb250ZXh0LCBnZXRDb250ZXh0VHlwZSB9IGZyb20gJy4uL3Nlc3Npb24nO1xuaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFJlbmRlclRhcmdldCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMgPSB7fSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcblxuICAgICAgICAvLyBzb21lIGRlZmF1bHQgcHJvcHNcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICB3aWR0aDogNTEyLFxuICAgICAgICAgICAgaGVpZ2h0OiA1MTIsXG4gICAgICAgICAgICBpbnRlcm5hbGZvcm1hdDogZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgdHlwZTogZ2wuVU5TSUdORURfU0hPUlQsXG4gICAgICAgIH0sIHByb3BzKTtcblxuICAgICAgICBpZiAoZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxmb3JtYXQgPSBnbC5ERVBUSF9DT01QT05FTlQyNDtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IGdsLlVOU0lHTkVEX0lOVDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZyYW1lIGJ1ZmZlclxuICAgICAgICB0aGlzLmZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZyYW1lQnVmZmVyKTtcblxuICAgICAgICAvLyB0ZXh0dXJlXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGdsLlJHQkEsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGRlcHRoIHRleHR1cmVcbiAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuXG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgICAgICBnbC5DT0xPUl9BVFRBQ0hNRU5UMCxcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUsXG4gICAgICAgICAgICAwLFxuICAgICAgICApO1xuICAgICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcbiAgICAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgZ2wuREVQVEhfQVRUQUNITUVOVCxcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgZ2wuUkdCQSxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5SR0JBLFxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlKTtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBnbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyVGFyZ2V0O1xuIiwiaW1wb3J0IHsgdmVjMywgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vcnQnO1xuaW1wb3J0IFBlcnNwZWN0aXZlIGZyb20gJy4uL2NhbWVyYXMvcGVyc3BlY3RpdmUnO1xuaW1wb3J0IE9ydGhvZ3JhcGhpYyBmcm9tICcuLi9jYW1lcmFzL29ydGhvZ3JhcGhpYyc7XG5cbmNsYXNzIFNoYWRvd01hcFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIC8vIHNpemUgb2YgdGV4dHVyZVxuICAgICAgICB0aGlzLndpZHRoID0gcHJvcHMud2lkdGggfHwgMTAyNDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBwcm9wcy5oZWlnaHQgfHwgMTAyNDtcblxuICAgICAgICAvLyBjcmVhdGUgcmVuZGVyIHRhcmdldFxuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXM7XG4gICAgICAgIHRoaXMucnQgPSBuZXcgUmVuZGVyVGFyZ2V0KHsgd2lkdGgsIGhlaWdodCB9KTtcblxuICAgICAgICAvLyBtYXRyaWNlc1xuICAgICAgICB0aGlzLm1hdHJpY2VzID0ge1xuICAgICAgICAgICAgdmlldzogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIHNoYWRvdzogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgICAgIGJpYXM6IG1hdDQuZnJvbVZhbHVlcyhcbiAgICAgICAgICAgICAgICAwLjUsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAgICAgICAgICAgMC4wLCAwLjUsIDAuMCwgMC4wLFxuICAgICAgICAgICAgICAgIDAuMCwgMC4wLCAwLjUsIDAuMCxcbiAgICAgICAgICAgICAgICAwLjUsIDAuNSwgMC41LCAxLjAsXG4gICAgICAgICAgICApLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG9yaWdpbiBvZiBkaXJlY3Rpb25hbCBsaWdodFxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZSh7XG4gICAgICAgICAgICBmb3Y6IDYwLFxuICAgICAgICAgICAgbmVhcjogMSxcbiAgICAgICAgICAgIGZhcjogMTAwMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxOyAvLyBUT0RPOiByZW1vdmUgdGhpcyB3aGVuIGZpeCBsb29rQXQgYnVnIG9uIGdsLW1hdHJpeFxuICAgICAgICB0aGlzLnNldExpZ2h0T3JpZ2luKHByb3BzLmxpZ2h0IHx8IHZlYzMuZnJvbVZhbHVlcygxMDAsIDI1MCwgNTAwKSk7XG4gICAgfVxuXG4gICAgLy8gbW92ZSB0aGUgY2FtZXJhIHRvIHRoZSBsaWdodCBwb3NpdGlvblxuICAgIHNldExpZ2h0T3JpZ2luKHZlYykge1xuICAgICAgICAvLyBDQU1FUkFcblxuICAgICAgICAvLyB1cGRhdGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgIHZlYzMuY29weSh0aGlzLmNhbWVyYS5wb3NpdGlvbi5kYXRhLCB2ZWMpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB2aWV3IG1hdHJpeFxuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMudmlldyk7XG4gICAgICAgIG1hdDQubG9va0F0KFxuICAgICAgICAgICAgdGhpcy5tYXRyaWNlcy52aWV3LFxuICAgICAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uZGF0YSxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnRhcmdldCxcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnVwLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNIQURPV1xuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWF0cmljZXMuc2hhZG93KTtcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLm1hdHJpY2VzLnNoYWRvdywgdGhpcy5jYW1lcmEubWF0cmljZXMucHJvamVjdGlvbiwgdGhpcy5tYXRyaWNlcy52aWV3KTtcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLm1hdHJpY2VzLnNoYWRvdywgdGhpcy5tYXRyaWNlcy5iaWFzLCB0aGlzLm1hdHJpY2VzLnNoYWRvdyk7XG4gICAgfVxuXG4gICAgLypcbiAgICBUT0RPOlxuICAgIG1heWJlIGNyZWF0ZSBhIHByb2dyYW0ganVzdCBmb3Igc2hhZG93cy4gdGhpcyBhdm9pZHMgaGF2aW5nIHRvIGNoYW5nZSBwcm9ncmFtXG4gICAgaW4gY29tcGxleCBzY2VuZXMganVzdCB0byB3cml0ZSBmb3IgdGhlIGRlcHRoIGJ1ZmZlci5cbiAgICBmaW5kIGEgd2F5IHRvIGJ5cGFzcyB0aGUgY2hhbmdlUHJvZ3JhbSBvbiB0aGUgcmVuZGVyZXIgdG8gYWNjb21vZGF0ZSB0aGlzLlxuICAgICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoYWRvd01hcFJlbmRlcmVyO1xuIiwiaW1wb3J0IHsgdmVjNCwgbWF0NCB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBsaWJyYXJ5LCB2ZXJzaW9uLCBzZXRDb250ZXh0LCBnZXRDb250ZXh0LCBzZXRDb250ZXh0VHlwZSwgZ2V0Q29udGV4dFR5cGUsIHN1cHBvcnRzIH0gZnJvbSAnLi4vc2Vzc2lvbic7XG5pbXBvcnQgeyBDT05URVhULCBNQVhfRElSRUNUSU9OQUwgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVzaXplLCB1bnN1cHBvcnRlZCB9IGZyb20gJy4uL3V0aWxzL2RvbSc7XG5pbXBvcnQgeyBVYm8gfSBmcm9tICcuLi9nbCc7XG5cbmltcG9ydCBTY2VuZSBmcm9tICcuL3NjZW5lJztcbmltcG9ydCBTaGFkb3dNYXBSZW5kZXJlciBmcm9tICcuL3NoYWRvdy1tYXAtcmVuZGVyZXInO1xuXG5sZXQgbGFzdFByb2dyYW07XG5cbmxldCBzb3J0ID0gZmFsc2U7XG5jb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xubGV0IFdFQkdMMiA9IGZhbHNlO1xuXG5jb25zdCB0aW1lID0gdmVjNC5jcmVhdGUoKTtcbmNvbnN0IGZvZyA9IHZlYzQuY3JlYXRlKCk7XG5cbmNvbnN0IG1hdHJpY2VzID0ge1xuICAgIHZpZXc6IG1hdDQuY3JlYXRlKCksXG4gICAgbm9ybWFsOiBtYXQ0LmNyZWF0ZSgpLFxuICAgIG1vZGVsVmlldzogbWF0NC5jcmVhdGUoKSxcbiAgICBpbnZlcnNlZE1vZGVsVmlldzogbWF0NC5jcmVhdGUoKSxcbn07XG5cbmxldCBjYWNoZWRTY2VuZSA9IG51bGw7IC8vIHNjZW5lXG5sZXQgY2FjaGVkQ2FtZXJhID0gbnVsbDsgLy8gY2FtZXJhXG5cbmNsYXNzIFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcyA9IHt9KSB7XG4gICAgICAgIHRoaXMuc3VwcG9ydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zb3J0ZWQgPSB7XG4gICAgICAgICAgICBvcGFxdWU6IFtdLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IFtdLFxuICAgICAgICAgICAgc2hhZG93OiBbXSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBlcmZvcm1hbmNlID0ge1xuICAgICAgICAgICAgb3BhcXVlOiAwLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IDAsXG4gICAgICAgICAgICBzaGFkb3c6IDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogMCxcbiAgICAgICAgICAgIGluc3RhbmNlczogMCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJhdGlvID0gcHJvcHMucmF0aW8gfHwgd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuc2hhZG93cyA9IHByb3BzLnNoYWRvd3MgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IHByb3BzLmNhbnZhcyB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICAgICAgICBjb25zdCBjb250ZXh0VHlwZSA9IHNldENvbnRleHRUeXBlKHByb3BzLmNvbnRleHRUeXBlKTtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmRvbUVsZW1lbnQuZ2V0Q29udGV4dChjb250ZXh0VHlwZSwgT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgYW50aWFsaWFzOiBmYWxzZSxcbiAgICAgICAgfSwgcHJvcHMpKTtcblxuICAgICAgICBjb25zdCBzZXNzaW9uID0gc3VwcG9ydHMoKTtcblxuICAgICAgICBpZiAoZ2wgJiZcbiAgICAgICAgICAgICgoc2Vzc2lvbi52ZXJ0ZXhBcnJheU9iamVjdCAmJlxuICAgICAgICAgICAgc2Vzc2lvbi5pbnN0YW5jZWRBcnJheXMgJiZcbiAgICAgICAgICAgIHNlc3Npb24uc3RhbmRhcmREZXJpdmF0aXZlcyAmJlxuICAgICAgICAgICAgc2Vzc2lvbi5kZXB0aFRleHR1cmVzKSB8fCB3aW5kb3cuZ2xpICE9PSBudWxsKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5ncmVldGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaWIgPSAnY29sb3I6IzY2Njtmb250LXNpemU6eC1zbWFsbDtmb250LXdlaWdodDpib2xkOyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9ICdjb2xvcjojNzc3O2ZvbnQtc2l6ZTp4LXNtYWxsJztcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSAnY29sb3I6I2YzMztmb250LXNpemU6eC1zbWFsbCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgICAgICAgICAgYCVjJHtsaWJyYXJ5fSAtICVjdmVyc2lvbjogJWMke3ZlcnNpb259ICVjcnVubmluZzogJWMke2dsLmdldFBhcmFtZXRlcihnbC5WRVJTSU9OKX1gLFxuICAgICAgICAgICAgICAgICAgICBsaWIsIHBhcmFtZXRlcnMsIHZhbHVlcywgcGFyYW1ldGVycywgdmFsdWVzLFxuICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRDb250ZXh0KGdsKTtcblxuICAgICAgICAgICAgV0VCR0wyID0gZ2V0Q29udGV4dFR5cGUoKSA9PT0gQ09OVEVYVC5XRUJHTDI7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gdW5zdXBwb3J0ZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuc3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lID0gbmV3IFVibyhbXG4gICAgICAgICAgICAgICAgLi4ubWF0NC5jcmVhdGUoKSwgLy8gcHJvamVjdGlvbiBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyB2aWV3IG1hdHJpeFxuICAgICAgICAgICAgICAgIC4uLmZvZywgLy8gZm9nIHZlYzQodXNlX2ZvZywgc3RhcnQsIGVuZCwgZGVuc2l0eSlcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBmb2cgY29sb3JcbiAgICAgICAgICAgICAgICAuLi50aW1lLCAvLyB2ZWM0KGlHbG9iYWxUaW1lLCBFTVBUWSwgRU1QVFksIEVNUFRZKVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwIHNldHRpbmdzICh1c2VfY2xpcHBpbmcsIEVNUFRZLCBFTVBUWSwgRU1QVFkpO1xuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGdsb2JhbCBjbGlwcGluZyBwbGFuZSAwXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gZ2xvYmFsIGNsaXBwaW5nIHBsYW5lIDFcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBnbG9iYWwgY2xpcHBpbmcgcGxhbmUgMlxuICAgICAgICAgICAgXSwgMCk7XG5cbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwgPSBuZXcgVWJvKFtcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBtb2RlbCBtYXRyaXhcbiAgICAgICAgICAgICAgICAuLi5tYXQ0LmNyZWF0ZSgpLCAvLyBub3JtYWwgbWF0cml4XG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcCBzZXR0aW5ncyAodXNlX2NsaXBwaW5nLCBFTVBUWSwgRU1QVFksIEVNUFRZKTtcbiAgICAgICAgICAgICAgICAuLi52ZWM0LmNyZWF0ZSgpLCAvLyBsb2NhbCBjbGlwcGluZyBwbGFuZSAwXG4gICAgICAgICAgICAgICAgLi4udmVjNC5jcmVhdGUoKSwgLy8gbG9jYWwgY2xpcHBpbmcgcGxhbmUgMVxuICAgICAgICAgICAgICAgIC4uLnZlYzQuY3JlYXRlKCksIC8vIGxvY2FsIGNsaXBwaW5nIHBsYW5lIDJcbiAgICAgICAgICAgIF0sIDEpO1xuXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsID0gbmV3IFVibyhuZXcgRmxvYXQzMkFycmF5KE1BWF9ESVJFQ1RJT05BTCAqIDEyKSwgMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaGFkb3dzXG4gICAgICAgIHRoaXMuc2hhZG93bWFwID0gbmV3IFNoYWRvd01hcFJlbmRlcmVyKCk7XG4gICAgfVxuXG4gICAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgcmVzaXplKHRoaXMuZG9tRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgdGhpcy5yYXRpbyk7XG4gICAgfVxuXG4gICAgc2V0UmF0aW8odmFsdWUpIHtcbiAgICAgICAgdGhpcy5yYXRpbyA9IHZhbHVlO1xuICAgIH1cblxuICAgIGNoYW5nZVByb2dyYW0ocHJvZ3JhbSkge1xuICAgICAgICBjb25zdCBnbCA9IGdldENvbnRleHQoKTtcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBpZiAoV0VCR0wyKSB7XG4gICAgICAgICAgICBjb25zdCBzTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCAncGVyU2NlbmUnKTtcbiAgICAgICAgICAgIGNvbnN0IG1Mb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sICdwZXJNb2RlbCcpO1xuICAgICAgICAgICAgY29uc3QgZExvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgJ2RpcmVjdGlvbmFsJyk7XG4gICAgICAgICAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIHNMb2NhdGlvbiwgdGhpcy5wZXJTY2VuZS5ib3VuZExvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgbUxvY2F0aW9uLCB0aGlzLnBlck1vZGVsLmJvdW5kTG9jYXRpb24pO1xuXG4gICAgICAgICAgICAvLyBpcyBkaXJlY3Rpb25hbCBsaWdodCBpbiBzaGFkZXJcbiAgICAgICAgICAgIGlmIChkTG9jYXRpb24gPT09IHRoaXMuZGlyZWN0aW9uYWwuYm91bmRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgZExvY2F0aW9uLCB0aGlzLmRpcmVjdGlvbmFsLmJvdW5kTG9jYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdyhzY2VuZSwgY2FtZXJhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgLy8gb25seSBuZWNlc3NhcnkgZm9yIHdlYmdsMSBjb21wYXRpYmlsaXR5LlxuICAgICAgICBjYWNoZWRTY2VuZSA9IHNjZW5lO1xuICAgICAgICBjYWNoZWRDYW1lcmEgPSBjYW1lcmE7XG5cbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG4gICAgICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpOyAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdGhpcyB0byBtb2RlbC5qcyA/XG5cbiAgICAgICAgY2FtZXJhLnVwZGF0ZUNhbWVyYU1hdHJpeCh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAvLyBjb21tb24gbWF0cmljZXNcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy52aWV3KTtcbiAgICAgICAgbWF0NC5sb29rQXQobWF0cmljZXMudmlldywgY2FtZXJhLnBvc2l0aW9uLmRhdGEsIGNhbWVyYS50YXJnZXQsIGNhbWVyYS51cCk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgc29ydGluZyBpcyBuZWVkZWQgd2hpbHN0IHRyYXZlcnNpbmcgdGhyb3VnaCB0aGUgc2NlbmUgZ3JhcGhcbiAgICAgICAgc29ydCA9IHNjZW5lLnRyYXZlcnNlKCk7XG5cbiAgICAgICAgLy8gaWYgc29ydGluZyBpcyBuZWVkZWQsIHJlc2V0IHN0dWZmXG4gICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICB0aGlzLnNvcnRlZC5vcGFxdWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50ID0gW107XG4gICAgICAgICAgICB0aGlzLnNvcnRlZC5zaGFkb3cgPSBbXTtcblxuICAgICAgICAgICAgLy8gY2FuIGJlIGRlcHJlY2F0ZWQsIGJ1dCBpdHMga2luZCBvZiBjb29sXG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLm9wYXF1ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnRyYW5zcGFyZW50ID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uuc2hhZG93ID0gMDtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudmVydGljZXMgPSAwO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5pbnN0YW5jZXMgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLnNvcnQoc2NlbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIHRpbWVcbiAgICAgICAgdGltZVswXSA9IChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgIGZvZ1swXSA9IHNjZW5lLmZvZy5lbmFibGU7XG4gICAgICAgIGZvZ1sxXSA9IHNjZW5lLmZvZy5zdGFydDtcbiAgICAgICAgZm9nWzJdID0gc2NlbmUuZm9nLmVuZDtcbiAgICAgICAgZm9nWzNdID0gc2NlbmUuZm9nLmRlbnNpdHk7XG5cbiAgICAgICAgaWYgKFdFQkdMMikge1xuICAgICAgICAgICAgLy8gYmluZCBjb21tb24gYnVmZmVyc1xuICAgICAgICAgICAgdGhpcy5wZXJTY2VuZS5iaW5kKCk7XG4gICAgICAgICAgICB0aGlzLnBlck1vZGVsLmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uYWwuYmluZCgpO1xuXG4gICAgICAgICAgICB0aGlzLnBlclNjZW5lLnVwZGF0ZShbXG4gICAgICAgICAgICAgICAgLi4uY2FtZXJhLm1hdHJpY2VzLnByb2plY3Rpb24sXG4gICAgICAgICAgICAgICAgLi4ubWF0cmljZXMudmlldyxcbiAgICAgICAgICAgICAgICAuLi5mb2csXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuZm9nLmNvbG9yLFxuICAgICAgICAgICAgICAgIC4uLnRpbWUsXG4gICAgICAgICAgICAgICAgLi4uW3NjZW5lLmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgLi4uc2NlbmUuY2xpcHBpbmcucGxhbmVzWzBdLFxuICAgICAgICAgICAgICAgIC4uLnNjZW5lLmNsaXBwaW5nLnBsYW5lc1sxXSxcbiAgICAgICAgICAgICAgICAuLi5zY2VuZS5jbGlwcGluZy5wbGFuZXNbMl0sXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2VuZS5saWdodHMuZGlyZWN0aW9uYWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbmFsLnVwZGF0ZShbXG4gICAgICAgICAgICAgICAgICAgIC4uLlsuLi5zY2VuZS5saWdodHMuZGlyZWN0aW9uYWxbaV0ucG9zaXRpb24sIDBdLFxuICAgICAgICAgICAgICAgICAgICAuLi5bLi4uc2NlbmUubGlnaHRzLmRpcmVjdGlvbmFsW2ldLmNvbG9yLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgLi4uW3NjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFtpXS5pbnRlbnNpdHksIDAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIF0sIGkgKiAxMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgbGlnaHQgaW4gc2hhZG93bWFwXG4gICAgICAgIHRoaXMuc2hhZG93bWFwLnNldExpZ2h0T3JpZ2luKHNjZW5lLmxpZ2h0cy5kaXJlY3Rpb25hbFswXS5wb3NpdGlvbik7XG5cbiAgICAgICAgLy8gMSkgcmVuZGVyIG9iamVjdHMgdG8gc2hhZG93bWFwXG4gICAgICAgIGlmICh0aGlzLnJlbmRlclNoYWRvdykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZC5zaGFkb3cubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdCh0aGlzLnNvcnRlZC5zaGFkb3dbaV0sIHRoaXMuc29ydGVkLnNoYWRvd1tpXS5wcm9ncmFtLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIpIHJlbmRlciBvcGFxdWUgb2JqZWN0c1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkLm9wYXF1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJPYmplY3QodGhpcy5zb3J0ZWQub3BhcXVlW2ldLCB0aGlzLnNvcnRlZC5vcGFxdWVbaV0ucHJvZ3JhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBzb3J0IGFuZCByZW5kZXIgdHJhbnNwYXJlbnQgb2JqZWN0c1xuICAgICAgICAvLyBleHBlbnNpdmUgdG8gc29ydCB0cmFuc3BhcmVudCBpdGVtcyBwZXIgei1pbmRleC5cbiAgICAgICAgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnQuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChhLnBvc2l0aW9uLnogLSBiLnBvc2l0aW9uLnopO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkLnRyYW5zcGFyZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck9iamVjdCh0aGlzLnNvcnRlZC50cmFuc3BhcmVudFtpXSwgdGhpcy5zb3J0ZWQudHJhbnNwYXJlbnRbaV0ucHJvZ3JhbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0KSByZW5kZXIgZ3VpXG4gICAgICAgIC8vIFRPRE9cbiAgICB9XG5cbiAgICBydHQoe1xuICAgICAgICByZW5kZXJUYXJnZXQsXG4gICAgICAgIHNjZW5lLFxuICAgICAgICBjYW1lcmEsXG4gICAgICAgIGNsZWFyQ29sb3IgPSBbMCwgMCwgMCwgMV0sXG4gICAgfSkgeyAvLyBtYXliZSBvcmRlciBpcyBpbXBvcnRhbnRcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGdsID0gZ2V0Q29udGV4dCgpO1xuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgcmVuZGVyVGFyZ2V0LmZyYW1lQnVmZmVyKTtcblxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCByZW5kZXJUYXJnZXQud2lkdGgsIHJlbmRlclRhcmdldC5oZWlnaHQpO1xuICAgICAgICBnbC5jbGVhckNvbG9yKC4uLmNsZWFyQ29sb3IpO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgdGhpcy5kcmF3KHNjZW5lLCBjYW1lcmEsIHJlbmRlclRhcmdldC53aWR0aCwgcmVuZGVyVGFyZ2V0LmhlaWdodCk7XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgcmVuZGVyVGFyZ2V0LnRleHR1cmUpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcblxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIH1cblxuICAgIHJlbmRlcihzY2VuZSwgY2FtZXJhKSB7XG4gICAgICAgIGlmICghdGhpcy5zdXBwb3J0ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KCk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHNoYWRvd3NcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93cykge1xuICAgICAgICAgICAgLy8gcmVuZGVyIHNjZW5lIHRvIHRleHR1cmVcbiAgICAgICAgICAgIHRoaXMucmVuZGVyU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucnR0KHtcbiAgICAgICAgICAgICAgICByZW5kZXJUYXJnZXQ6IHRoaXMuc2hhZG93bWFwLnJ0LFxuICAgICAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5zaGFkb3dtYXAuY2FtZXJhLFxuICAgICAgICAgICAgICAgIGNsZWFyQ29sb3I6IFsxLCAxLCAxLCAxXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlclNoYWRvdyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVuZGVyIHNjZW5lXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgICAgICB0aGlzLmRyYXcoc2NlbmUsIGNhbWVyYSwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAvLyBUT0RPOiByZW5kZXIgR1VJIG9iamVjdHNcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaWNlcyhtYXRyaXgpIHtcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy5tb2RlbFZpZXcpO1xuICAgICAgICBtYXQ0LmNvcHkobWF0cmljZXMubW9kZWxWaWV3LCBtYXRyaXgpO1xuICAgICAgICBtYXQ0LmludmVydChtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldywgbWF0cmljZXMubW9kZWxWaWV3KTtcbiAgICAgICAgbWF0NC50cmFuc3Bvc2UobWF0cmljZXMuaW52ZXJzZWRNb2RlbFZpZXcsIG1hdHJpY2VzLmludmVyc2VkTW9kZWxWaWV3KTtcbiAgICAgICAgbWF0NC5pZGVudGl0eShtYXRyaWNlcy5ub3JtYWwpO1xuICAgICAgICBtYXQ0LmNvcHkobWF0cmljZXMubm9ybWFsLCBtYXRyaWNlcy5pbnZlcnNlZE1vZGVsVmlldyk7XG4gICAgfVxuXG4gICAgc29ydChvYmplY3QpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc29ydChvYmplY3QuY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iamVjdC52aXNpYmxlICYmICEob2JqZWN0IGluc3RhbmNlb2YgU2NlbmUpKSB7XG4gICAgICAgICAgICAvLyBhZGRzIG9iamVjdCB0byBhIG9wYXF1ZSBvciB0cmFuc3BhcmVudFxuICAgICAgICAgICAgaWYgKG9iamVjdC50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLnRyYW5zcGFyZW50LnB1c2gob2JqZWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1hbmNlLnRyYW5zcGFyZW50Kys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVkLm9wYXF1ZS5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtYW5jZS5vcGFxdWUrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgc2hhZG93cyBlbmFibGVkIG9uIHJlbmRlcmVyLCBhbmQgc2hhZG93cyBhcmUgZW5hYmxlZCBvbiBvYmplY3RcbiAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvd3MgJiYgb2JqZWN0LnNoYWRvd3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvcnRlZC5zaGFkb3cucHVzaChvYmplY3QpO1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2Uuc2hhZG93Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvdW50IHZlcnRpY2UgbnVtYmVyXG4gICAgICAgICAgICBpZiAob2JqZWN0LmF0dHJpYnV0ZXMuYV9wb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UudmVydGljZXMgKz0gb2JqZWN0LmF0dHJpYnV0ZXMuYV9wb3NpdGlvbi52YWx1ZS5sZW5ndGggLyAzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb3VudCBpbnN0YW5jZXNcbiAgICAgICAgICAgIGlmIChvYmplY3QuaXNJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2UuaW5zdGFuY2VzICs9IG9iamVjdC5pbnN0YW5jZUNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc29ydGluZyBjb21wbGV0ZVxuICAgICAgICBvYmplY3QuZGlydHkuc29ydGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlbmRlck9iamVjdChvYmplY3QsIHByb2dyYW0sIGluU2hhZG93TWFwID0gZmFsc2UpIHtcbiAgICAgICAgLy8gaXRzIHRoZSBwYXJlbnQgbm9kZSAoc2NlbmUuanMpXG4gICAgICAgIGlmIChvYmplY3QucGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZU1hdHJpY2VzKG9iamVjdC5tYXRyaWNlcy5tb2RlbCk7XG5cbiAgICAgICAgaWYgKG9iamVjdC5kaXJ0eS5zaGFkZXIpIHtcbiAgICAgICAgICAgIG9iamVjdC5kaXJ0eS5zaGFkZXIgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0pIHtcbiAgICAgICAgICAgICAgICBvYmplY3QuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCk7XG4gICAgICAgICAgICBvYmplY3QuaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxhc3RQcm9ncmFtICE9PSBwcm9ncmFtKSB7XG4gICAgICAgICAgICBsYXN0UHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVByb2dyYW0obGFzdFByb2dyYW0sIG9iamVjdC50eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9iamVjdC5iaW5kKCk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCk7XG5cbiAgICAgICAgb2JqZWN0LnVwZGF0ZShpblNoYWRvd01hcCk7XG4gICAgICAgIG9iamVjdC5kcmF3KCk7XG5cbiAgICAgICAgb2JqZWN0LnVuYmluZCgpO1xuICAgIH1cblxuICAgIGluaXRVbmlmb3Jtc1Blck1vZGVsKG9iamVjdCkge1xuICAgICAgICBpZiAoIVdFQkdMMikge1xuICAgICAgICAgICAgLy8gcGVyIHNjZW5lXG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgncHJvamVjdGlvbk1hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgndmlld01hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZm9nU2V0dGluZ3MnLCAndmVjNCcsIGZvZyk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZm9nQ29sb3InLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2lHbG9iYWxUaW1lJywgJ2Zsb2F0JywgdGltZVswXSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnZ2xvYmFsQ2xpcFNldHRpbmdzJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUwJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUxJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdnbG9iYWxDbGlwUGxhbmUyJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIC8vIHBlciBvYmplY3RcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdtb2RlbE1hdHJpeCcsICdtYXQ0JywgbWF0NC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbm9ybWFsTWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBTZXR0aW5ncycsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG4gICAgICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnbG9jYWxDbGlwUGxhbmUwJywgJ3ZlYzQnLCB2ZWM0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG9iamVjdC5zZXRVbmlmb3JtKCdsb2NhbENsaXBQbGFuZTEnLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2xvY2FsQ2xpcFBsYW5lMicsICd2ZWM0JywgdmVjNC5jcmVhdGUoKSk7XG5cbiAgICAgICAgICAgIC8vIGxpZ2h0c1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2RsUG9zaXRpb24nLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2RsQ29sb3InLCAndmVjNCcsIHZlYzQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ2ZsSW50ZW5zaXR5JywgJ2Zsb2F0JywgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TWFwJywgJ3NhbXBsZXIyRCcsIDApO1xuICAgICAgICBvYmplY3Quc2V0VW5pZm9ybSgnc2hhZG93TWF0cml4JywgJ21hdDQnLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd05lYXInLCAnZmxvYXQnLCAwKTtcbiAgICAgICAgb2JqZWN0LnNldFVuaWZvcm0oJ3NoYWRvd0ZhcicsICdmbG9hdCcsIDApO1xuICAgIH1cblxuICAgIHVwZGF0ZVVuaWZvcm1zUGVyTW9kZWwob2JqZWN0KSB7XG4gICAgICAgIGlmIChXRUJHTDIpIHtcbiAgICAgICAgICAgIHRoaXMucGVyTW9kZWwudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QubWF0cmljZXMubW9kZWwsXG4gICAgICAgICAgICAgICAgLi4ubWF0cmljZXMubm9ybWFsLFxuICAgICAgICAgICAgICAgIC4uLltvYmplY3QuY2xpcHBpbmcuZW5hYmxlLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAuLi5vYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdLFxuICAgICAgICAgICAgICAgIC4uLm9iamVjdC5jbGlwcGluZy5wbGFuZXNbMV0sXG4gICAgICAgICAgICAgICAgLi4ub2JqZWN0LmNsaXBwaW5nLnBsYW5lc1syXSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYmVjYXVzZSBVQk8gYXJlIHdlYmdsMiBvbmx5LCB3ZSBuZWVkIHRvIG1hbnVhbGx5IGFkZCBldmVyeXRoaW5nXG4gICAgICAgICAgICAvLyBhcyB1bmlmb3Jtc1xuICAgICAgICAgICAgLy8gcGVyIHNjZW5lIHVuaWZvcm1zIHVwZGF0ZVxuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgudmFsdWUgPSBjYWNoZWRDYW1lcmEubWF0cmljZXMucHJvamVjdGlvbjtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy52aWV3TWF0cml4LnZhbHVlID0gbWF0cmljZXMudmlldztcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5mb2dTZXR0aW5ncy52YWx1ZSA9IGZvZztcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5mb2dDb2xvci52YWx1ZSA9IGNhY2hlZFNjZW5lLmZvZy5jb2xvcjtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5pR2xvYmFsVGltZS52YWx1ZSA9IHRpbWVbMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFNldHRpbmdzLnZhbHVlID0gW2NhY2hlZFNjZW5lLmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMuZ2xvYmFsQ2xpcFBsYW5lMC52YWx1ZSA9IGNhY2hlZFNjZW5lLmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5nbG9iYWxDbGlwUGxhbmUxLnZhbHVlID0gY2FjaGVkU2NlbmUuY2xpcHBpbmcucGxhbmVzWzFdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmdsb2JhbENsaXBQbGFuZTIudmFsdWUgPSBjYWNoZWRTY2VuZS5jbGlwcGluZy5wbGFuZXNbMl07XG5cbiAgICAgICAgICAgIC8vIHBlciBtb2RlbCB1bmlmb3JtcyB1cGRhdGVcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5tb2RlbE1hdHJpeC52YWx1ZSA9IG9iamVjdC5tYXRyaWNlcy5tb2RlbDtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5ub3JtYWxNYXRyaXgudmFsdWUgPSBtYXRyaWNlcy5ub3JtYWw7XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwU2V0dGluZ3MudmFsdWUgPSBbb2JqZWN0LmNsaXBwaW5nLmVuYWJsZSwgMCwgMCwgMF07XG4gICAgICAgICAgICBvYmplY3QudW5pZm9ybXMubG9jYWxDbGlwUGxhbmUwLnZhbHVlID0gb2JqZWN0LmNsaXBwaW5nLnBsYW5lc1swXTtcbiAgICAgICAgICAgIG9iamVjdC51bmlmb3Jtcy5sb2NhbENsaXBQbGFuZTEudmFsdWUgPSBvYmplY3QuY2xpcHBpbmcucGxhbmVzWzBdO1xuICAgICAgICAgICAgb2JqZWN0LnVuaWZvcm1zLmxvY2FsQ2xpcFBsYW5lMi52YWx1ZSA9IG9iamVjdC5jbGlwcGluZy5wbGFuZXNbMF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0ZXN0IFNIQURPV1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TWFwLnZhbHVlID0gdGhpcy5zaGFkb3dtYXAucnQuZGVwdGhUZXh0dXJlO1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TWF0cml4LnZhbHVlID0gdGhpcy5zaGFkb3dtYXAubWF0cmljZXMuc2hhZG93O1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93TmVhci52YWx1ZSA9IHRoaXMuc2hhZG93bWFwLmNhbWVyYS5uZWFyO1xuICAgICAgICBvYmplY3QudW5pZm9ybXMuc2hhZG93RmFyLnZhbHVlID0gdGhpcy5zaGFkb3dtYXAuY2FtZXJhLmZhcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyO1xuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi9tZXNoJztcbmltcG9ydCB7IFVCTyB9IGZyb20gJy4uL3NoYWRlcnMvY2h1bmtzJztcblxuY2xhc3MgUGFzcyB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZSgpO1xuXG4gICAgICAgIGNvbnN0IHsgdmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMgfSA9IHByb3BzO1xuXG4gICAgICAgIHRoaXMudmVydGV4ID0gdmVydGV4O1xuICAgICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB1bmlmb3JtcztcblxuICAgICAgICB0aGlzLmVuYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgY29tcGlsZSgpIHtcbiAgICAgICAgY29uc3Qgc2hhZGVyID0ge1xuICAgICAgICAgICAgdmVydGV4OiBgI3ZlcnNpb24gMzAwIGVzXG4gICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xuICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XG4gICAgICAgICAgICAgICAgaW4gdmVjMiBhX3V2O1xuXG4gICAgICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICAgICAgJHt0aGlzLnZlcnRleH1gLFxuXG4gICAgICAgICAgICBmcmFnbWVudDogYCN2ZXJzaW9uIDMwMCBlc1xuICAgICAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgICAgICAgICAgICAgJHtVQk8uc2NlbmUoKX1cbiAgICAgICAgICAgICAgICAke1VCTy5tb2RlbCgpfVxuXG4gICAgICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG4gICAgICAgICAgICAgICAgJHt0aGlzLmZyYWdtZW50fWAsXG4gICAgICAgICAgICB1bmlmb3JtczogdGhpcy51bmlmb3JtcyxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogWy0xLCAtMSwgMCwgMSwgLTEsIDAsIDEsIDEsIDAsIC0xLCAxLCAwXSxcbiAgICAgICAgICAgIGluZGljZXM6IFswLCAxLCAyLCAwLCAyLCAzXSxcbiAgICAgICAgICAgIHV2czogWzAsIDAsIDEsIDAsIDEsIDEsIDAsIDFdLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnF1YWQgPSBuZXcgTWVzaCh7IGdlb21ldHJ5LCBzaGFkZXIgfSk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucXVhZCk7XG4gICAgfVxuXG4gICAgc2V0VW5pZm9ybShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucXVhZC51bmlmb3Jtc1trZXldLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXNzO1xuIiwiY29uc3QgQmFzaWMgPSB7XG5cbiAgICB1bmlmb3Jtczoge1xuICAgICAgICB1X2lucHV0OiB7IHR5cGU6ICdzYW1wbGVyMkQnLCB2YWx1ZTogbnVsbCB9LFxuICAgIH0sXG5cbiAgICB2ZXJ0ZXg6IGBcbiAgICBvdXQgdmVjMiB2X3V2O1xuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdmlld01hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xuICAgICAgICB2X3V2ID0gYV91djtcbiAgICB9YCxcblxuICAgIGZyYWdtZW50OiBgXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbnB1dDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgb3V0Q29sb3IgPSB0ZXh0dXJlKHVfaW5wdXQsIHZfdXYpO1xuICAgIH1gLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNpYztcbiIsImltcG9ydCB7IHZlYzQgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgT3J0aG9ncmFwaGljIH0gZnJvbSAnLi4vY2FtZXJhcyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQgUmVuZGVyVGFyZ2V0IGZyb20gJy4vcnQnO1xuaW1wb3J0IFBhc3MgZnJvbSAnLi9wYXNzJztcbmltcG9ydCB7IEJhc2ljIH0gZnJvbSAnLi4vcGFzc2VzJztcblxuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgT3J0aG9ncmFwaGljKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDA7XG5cbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29sb3IgPSB2ZWM0LmZyb21WYWx1ZXMoMCwgMCwgMCwgMSk7XG5cbiAgICAgICAgdGhpcy5zY3JlZW4gPSBuZXcgUGFzcyhCYXNpYyk7XG4gICAgICAgIHRoaXMuc2NyZWVuLmNvbXBpbGUoKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBbXG4gICAgICAgICAgICBuZXcgUmVuZGVyVGFyZ2V0KCksXG4gICAgICAgICAgICBuZXcgUmVuZGVyVGFyZ2V0KCksXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy5idWZmZXJzWzFdO1xuICAgICAgICB0aGlzLndyaXRlID0gdGhpcy5idWZmZXJzWzBdO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMucmVhZC5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLndyaXRlLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgc2V0UmF0aW8ocmF0aW8pIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRSYXRpbyhyYXRpbyk7XG4gICAgfVxuXG4gICAgcGFzcyhwYXNzKSB7XG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgfVxuXG4gICAgY29tcGlsZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXNzZXNbaV0uY29tcGlsZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyVG9UZXh0dXJlKHJlbmRlclRhcmdldCwgc2NlbmUsIGNhbWVyYSkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJ0dCh7XG4gICAgICAgICAgICByZW5kZXJUYXJnZXQsXG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgIGNhbWVyYSxcbiAgICAgICAgICAgIGNsZWFyQ29sb3I6IHRoaXMuY2xlYXJDb2xvcixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXRCdWZmZXJzKCkge1xuICAgICAgICB0aGlzLnJlYWQgPSB0aGlzLmJ1ZmZlcnNbMV07XG4gICAgICAgIHRoaXMud3JpdGUgPSB0aGlzLmJ1ZmZlcnNbMF07XG4gICAgfVxuXG4gICAgc3dhcEJ1ZmZlcnMoKSB7XG4gICAgICAgIHRoaXMudGVtcCA9IHRoaXMucmVhZDtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy53cml0ZTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHRoaXMudGVtcDtcbiAgICB9XG5cbiAgICByZW5kZXIoc2NlbmUsIGNhbWVyYSkge1xuICAgICAgICB0aGlzLnJlc2V0QnVmZmVycygpO1xuICAgICAgICB0aGlzLnJlbmRlclRvVGV4dHVyZSh0aGlzLndyaXRlLCBzY2VuZSwgY2FtZXJhKTtcblxuICAgICAgICAvLyBwaW5nIHBvbmcgdGV4dHVyZXMgdGhyb3VnaCBwYXNzZXNcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLnBhc3Nlcy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFzc2VzW2ldLmVuYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3dhcEJ1ZmZlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3Nlc1tpXS5zZXRVbmlmb3JtKCd1X2lucHV0JywgdGhpcy5yZWFkLnRleHR1cmUpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVG9UZXh0dXJlKHRoaXMud3JpdGUsIHRoaXMucGFzc2VzW2ldLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW5kZXIgbGFzdCBwYXNzIHRvIHNjcmVlblxuICAgICAgICB0aGlzLnNjcmVlbi5zZXRVbmlmb3JtKCd1X2lucHV0JywgdGhpcy53cml0ZS50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY3JlZW4uc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvc2VyO1xuIiwiY2xhc3MgUGVyZm9ybWFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHRoaXMudGhlbWUgPSBwYXJhbXMudGhlbWUgfHwge1xuICAgICAgICAgICAgZm9udDogJ2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zaXplOnh4LXNtYWxsO2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweDstbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlOy13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkOycsXG4gICAgICAgICAgICBjb2xvcjE6ICcjMjQyNDI0JyxcbiAgICAgICAgICAgIGNvbG9yMjogJyMyYTJhMmEnLFxuICAgICAgICAgICAgY29sb3IzOiAnIzY2NicsXG4gICAgICAgICAgICBjb2xvcjQ6ICcjOTk5JyxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246Zml4ZWQ7Ym90dG9tOjA7bGVmdDowO21pbi13aWR0aDo4MHB4O29wYWNpdHk6MC45O3otaW5kZXg6MTAwMDA7JztcblxuICAgICAgICB0aGlzLmhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmhvbGRlci5zdHlsZS5jc3NUZXh0ID0gYHBhZGRpbmc6M3B4O2JhY2tncm91bmQtY29sb3I6JHt0aGlzLnRoZW1lLmNvbG9yMX07YDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKTtcblxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aXRsZS5zdHlsZS5jc3NUZXh0ID0gYCR7dGhpcy50aGVtZS5mb250fTtjb2xvcjoke3RoaXMudGhlbWUuY29sb3IzfTtgO1xuICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnUGVyZm9ybWFuY2UnO1xuICAgICAgICB0aGlzLmhvbGRlci5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgdGhpcy5tc1RleHRzID0gW107XG5cbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHJlYnVpbGQocGFyYW1zKSB7XG4gICAgICAgIHRoaXMubXNUZXh0cyA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gYCR7dGhpcy50aGVtZS5mb250fTtjb2xvcjoke3RoaXMudGhlbWUuY29sb3I0fTtiYWNrZ3JvdW5kLWNvbG9yOiR7dGhpcy50aGVtZS5jb2xvcjJ9O2A7XG4gICAgICAgICAgICB0aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMubXNUZXh0c1trZXldID0gZWxlbWVudDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKHJlbmRlcmVyKSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLm1zVGV4dHMpLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMocmVuZGVyZXIucGVyZm9ybWFuY2UpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkKHJlbmRlcmVyLnBlcmZvcm1hbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKHJlbmRlcmVyLnBlcmZvcm1hbmNlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMubXNUZXh0c1trZXldLnRleHRDb250ZW50ID0gYCR7a2V5fTogJHtyZW5kZXJlci5wZXJmb3JtYW5jZVtrZXldfWA7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGVyZm9ybWFuY2U7XG4iLCJpbXBvcnQgKiBhcyBjaHVua3MgZnJvbSAnLi9zaGFkZXJzL2NodW5rcyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAqIGFzIGNhbWVyYXMgZnJvbSAnLi9jYW1lcmFzJztcbmltcG9ydCAqIGFzIHNoYWRlcnMgZnJvbSAnLi9zaGFkZXJzJztcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJztcblxuaW1wb3J0ICogYXMgY29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcblxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vY29yZS9yZW5kZXJlcic7XG5pbXBvcnQgT2JqZWN0MyBmcm9tICcuL2NvcmUvb2JqZWN0Myc7XG5pbXBvcnQgU2NlbmUgZnJvbSAnLi9jb3JlL3NjZW5lJztcbmltcG9ydCBNb2RlbCBmcm9tICcuL2NvcmUvbW9kZWwnO1xuaW1wb3J0IE1lc2ggZnJvbSAnLi9jb3JlL21lc2gnO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi9jb3JlL3RleHR1cmUnO1xuaW1wb3J0IFJlbmRlclRhcmdldCBmcm9tICcuL2NvcmUvcnQnO1xuaW1wb3J0IENvbXBvc2VyIGZyb20gJy4vY29yZS9jb21wb3Nlcic7XG5pbXBvcnQgUGFzcyBmcm9tICcuL2NvcmUvcGFzcyc7XG5cbmltcG9ydCBQZXJmb3JtYW5jZSBmcm9tICcuL2NvcmUvcGVyZm9ybWFuY2UnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY2h1bmtzLFxuICAgIHV0aWxzLFxuICAgIGNhbWVyYXMsXG4gICAgc2hhZGVycyxcbiAgICBoZWxwZXJzLFxuXG4gICAgY29uc3RhbnRzLFxuXG4gICAgUmVuZGVyZXIsXG4gICAgT2JqZWN0MyxcbiAgICBTY2VuZSxcbiAgICBNb2RlbCxcbiAgICBNZXNoLFxuICAgIFRleHR1cmUsXG4gICAgUmVuZGVyVGFyZ2V0LFxuXG4gICAgQ29tcG9zZXIsXG4gICAgUGFzcyxcblxuICAgIFBlcmZvcm1hbmNlLFxufTtcblxuLy8gVE9ETzpcbi8vIGNoYW5nZSBpbXBvcnQgKiBhcyBibGFibGFibGEgdG8gZXhwb3J0ICogYXMgYmxhYmxhYmxhIGFuZCByZW1vdmUgdGhlIGZpbmFsIGRlZmF1bHQgZXhwb3J0XG4iXSwibmFtZXMiOlsiY3JlYXRlIiwiZ2xNYXRyaXguQVJSQVlfVFlQRSIsImNvcHkiLCJmcm9tVmFsdWVzIiwiaWRlbnRpdHkiLCJ0cmFuc3Bvc2UiLCJpbnZlcnQiLCJtdWx0aXBseSIsInRyYW5zbGF0ZSIsInNjYWxlIiwicm90YXRlIiwiZ2xNYXRyaXguRVBTSUxPTiIsIm5vcm1hbGl6ZSIsImZvckVhY2giLCJyb3RhdGVYIiwicm90YXRlWSIsInJvdGF0ZVoiLCJ2ZWM0Lm5vcm1hbGl6ZSIsInZlYzMuY3JlYXRlIiwidmVjMy5mcm9tVmFsdWVzIiwiZG90IiwidmVjMy5kb3QiLCJ2ZWMzLmNyb3NzIiwidmVjMy5sZW4iLCJ2ZWMzLm5vcm1hbGl6ZSIsIm1hdDMuY3JlYXRlIiwidmVjMy5jb3B5IiwicXVhdC5jcmVhdGUiLCJtYXQ0LmNyZWF0ZSIsIm1hdDQuaWRlbnRpdHkiLCJxdWF0LmlkZW50aXR5IiwibWF0NC5jb3B5IiwibWF0NC5tdWx0aXBseSIsIm1hdDQudGFyZ2V0VG8iLCJtYXQ0LnRyYW5zbGF0ZSIsInF1YXQucm90YXRlWCIsInF1YXQucm90YXRlWSIsInF1YXQucm90YXRlWiIsInF1YXQuZ2V0QXhpc0FuZ2xlIiwibWF0NC5yb3RhdGUiLCJtYXQ0LnNjYWxlIiwibWF0NC5vcnRobyIsIm1hdDQucGVyc3BlY3RpdmUiLCJ2ZWM0LmNyZWF0ZSIsImdsc2wzdG8xIiwiQXhpc0hlbHBlciIsImxlbmd0aCIsInZlYzQuZnJvbVZhbHVlcyIsIm1hdDQuZnJvbVZhbHVlcyIsIlBlcnNwZWN0aXZlIiwiT3J0aG9ncmFwaGljIiwibWF0NC5sb29rQXQiLCJXRUJHTDIiLCJtYXQ0LmludmVydCIsIm1hdDQudHJhbnNwb3NlIiwiQmFzaWMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sS0FBSyxHQUFHO0lBQ1YsT0FBTyxFQUFFLE1BQU07UUFDWCxPQUFPLENBQUM7Ozs7Ozs7UUFPUixFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0I7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U0EsUUFBTSxHQUFHO0VBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUlDLFVBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsT0FBTyxHQUFHLENBQUM7Q0FDWjs7QUM1Q0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsQUFFQTs7Ozs7Ozs7Ozs7QUFXQSxBQUFPLFNBQVNELFFBQU0sR0FBRztFQUN2QixJQUFJLEdBQUcsR0FBRyxJQUFJQyxVQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3RDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWixPQUFPLEdBQUcsQ0FBQztDQUNaO0FBQ0QsQUEyQkE7Ozs7Ozs7O0FBUUEsQUFBTyxTQUFTQyxNQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtFQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDaEIsT0FBTyxHQUFHLENBQUM7Q0FDWjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkQsQUFBTyxTQUFTQyxZQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0VBQ3pHLElBQUksR0FBRyxHQUFHLElBQUlGLFVBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDdEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNkLE9BQU8sR0FBRyxDQUFDO0NBQ1o7QUFDRCxBQTBDQTs7Ozs7Ozs7QUFRQSxBQUFPLFNBQVNHLFVBQVEsQ0FBQyxHQUFHLEVBQUU7RUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNaLE9BQU8sR0FBRyxDQUFDO0NBQ1o7Ozs7Ozs7OztBQVNELEFBQU8sU0FBU0MsV0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7O0VBRWhDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtJQUNiLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUVoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0dBQ2YsTUFBTTtJQUNMLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDakI7O0VBRUQsT0FBTyxHQUFHLENBQUM7Q0FDWjs7Ozs7Ozs7O0FBU0QsQUFBTyxTQUFTQyxRQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtFQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25ELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0VBRXZELElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUNoQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDOzs7RUFHaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7O0VBRWhGLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDUixPQUFPLElBQUksQ0FBQztHQUNiO0VBQ0QsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7O0VBRWhCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7RUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7RUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7RUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7RUFDcEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0VBQ3BELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztFQUNwRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7RUFDcEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0VBQ3BELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQzs7RUFFcEQsT0FBTyxHQUFHLENBQUM7Q0FDWjtBQUNELEFBNkRBOzs7Ozs7Ozs7QUFTQSxBQUFPLFNBQVNDLFVBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25ELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7OztFQUd2RCxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7O0VBRTNDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7O0VBRTNDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7O0VBRTVDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDL0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDNUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDNUMsT0FBTyxHQUFHLENBQUM7Q0FDWjs7Ozs7Ozs7OztBQVVELEFBQU8sU0FBU0MsV0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0VBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakMsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdkIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdkIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7O0VBRXZCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtJQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDbkQsTUFBTTtJQUNMLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUVqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3ZELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDdkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7SUFFekQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUMvQzs7RUFFRCxPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7O0FBVUQsQUFBTyxTQUFTQyxPQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFakMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDcEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDcEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoQixPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7OztBQVdELEFBQU8sU0FBU0MsUUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtFQUN4QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUMzQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ1osSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdkIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdkIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdkIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUNsQixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ2xCLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7O0VBRWxCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBR0MsT0FBZ0IsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUU7O0VBRXRELEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ2QsQ0FBQyxJQUFJLEdBQUcsQ0FBQztFQUNULENBQUMsSUFBSSxHQUFHLENBQUM7RUFDVCxDQUFDLElBQUksR0FBRyxDQUFDOztFQUVULENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2xCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2xCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztFQUVWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0MsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzs7RUFHakQsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdEUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdEUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7OztFQUd0RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQzNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQzNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQzNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDM0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQzVDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcs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QUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtFQUM3QyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQ2IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztNQUNiLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ1gsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDWCxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUVoQixJQUFJLEVBQUUsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztNQUNyQixFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7TUFDckIsRUFBRSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBRTFCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ2hDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtJQUNYLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixFQUFFLElBQUksR0FBRyxDQUFDO0lBQ1YsRUFBRSxJQUFJLEdBQUcsQ0FBQztJQUNWLEVBQUUsSUFBSSxHQUFHLENBQUM7R0FDWDs7RUFFRCxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO01BQ3hCLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO01BQ3hCLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7O0VBRTdCLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUM1QixJQUFJLEdB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QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDZCxPQUFPLEdBQUcsQ0FBQztDQUNaO0FBQ0QsQUF3UEE7Ozs7Ozs7O0FBUUEsQUFBTyxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0VBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNiLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTs7SUFFWCxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDckI7RUFDRCxPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7QUFTRCxBQUFPLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDeEIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFH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QUFJLEdBQUcsR0FBRyxJQUFJQyxVQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxPQUFPLEdBQUcsQ0FBQztDQUNaO0FBQ0QsQUFlQTs7Ozs7Ozs7OztBQVVBLEFBQU8sU0FBU0UsWUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJRixVQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxPQUFPLEdBQUcsQ0FBQztDQUNaO0FBQ0QsQUF1U0E7Ozs7Ozs7O0FBUUEsQUFBTyxTQUFTVyxXQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtFQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFD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Ozs7O0FBUUQsQUFBTyxTQUFTRyxVQUFRLENBQUMsR0FBRyxFQUFFO0VBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDWCxPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7OztBQVdELEFBQU8sU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7RUFDM0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDaEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUN2QixPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7Ozs7Ozs7QUFlRCxBQUFPLFNBQVMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7RUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDaEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7RUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO0lBQ1osUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDeEIsTUFBTTs7SUFFTCxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNqQjtFQUNELE9BQU8sR0FBRyxDQUFDO0NBQ1o7QUFDRCxBQW1CQTs7Ozs7Ozs7O0FBU0EsQUFBTyxTQUFTVSxTQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7RUFDbkMsR0FBRyxJQUFJLEdBQUcsQ0FBQzs7RUFFWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7RUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7O0FBVUQsQUFBTyxTQUFTQyxTQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7RUFDbkMsR0FBRyxJQUFJLEdBQUcsQ0FBQzs7RUFFWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7RUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixPQUFPLEdBQUcsQ0FBQztDQUNaOzs7Ozs7Ozs7O0FBVUQsQUFBTyxTQUFTQyxTQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7RUFDbkMsR0FBRyxJQUFJLEdBQUcsQ0FBQzs7RUFFWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7RUFFM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7RUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztFQUMzQixPQUFPLEdBQUcsQ0FBQztDQUNaO0FBQ0QsQUFtQkE7Ozs7Ozs7Ozs7QUFVQSxBQUFPLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTs7O0VBR2xDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVB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QUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2QsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNsQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUVoQixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNwRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNyQixLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO0lBQ3ZDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FB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QUNwQixLQUFLLEVBQUUsQ0FBQzs7UUFFUixNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLEdBQUd6QixZQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHQSxZQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEYsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHQSxZQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHQSxZQUFlLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEYsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFHQSxZQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHQSxZQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7O1FBRXhGLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFQSxZQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRUEsWUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDM0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUVBLFlBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNB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
