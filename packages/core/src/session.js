import { CONTEXT } from './constants';

const library = `lowww-${__LIBRARY__}`;
const version = __VERSION__;

// per session
let gl = null;
let contextType = null;

// test context webgl and webgl2
const testContext1 = document.createElement('canvas').getContext(CONTEXT.WEBGL);
const testContext2 = document
    .createElement('canvas')
    .getContext(CONTEXT.WEBGL2);

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

const setContextType = preferred => {
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

const setContext = context => {
    gl = context;
    if (getContextType() === CONTEXT.WEBGL) {
        extensions.vertexArrayObject = gl.getExtension(
            'OES_vertex_array_object'
        );
        extensions.instancedArrays = gl.getExtension('ANGLE_instanced_arrays');
        extensions.standardDerivatives = gl.getExtension(
            'OES_standard_derivatives'
        );
        extensions.depthTextures = gl.getExtension('WEBGL_depth_texture');
    }
};

const getContext = () => gl;

const supports = () => extensions;

export {
    library,
    version,
    setContext,
    getContext,
    setContextType,
    getContextType,
    supports,
};
