import { vec4 } from 'gl-matrix';
import Object3 from './object3';
import { createProgram } from '../gl/program';
import { getContext, getContextType, supports } from '../session';
import { CONTEXT, DRAW, SIDE, SHADER_CUSTOM } from '../constants';
import {
    bindAttributes,
    getTypeSize,
    initAttributes,
    initUniforms,
    updateUniforms,
    updateAttributes,
    Vao,
} from '../gl';
import { glsl3to1 } from '../utils';

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
            planes: [vec4.create(), vec4.create(), vec4.create()],
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
                this.vertex = glsl3to1(this.vertex, 'vertex');
                this.fragment = glsl3to1(this.fragment, 'fragment');
            }

            this.program = createProgram(
                gl,
                this.vertex,
                this.fragment,
                this.type
            );
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
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                this.indices.value,
                gl.STATIC_DRAW
            );
        }
    }

    unbind() {
        const gl = getContext();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    updateVertices(data, index) {
        // index of vertice * 3 (xyz) + 0 for X
        // index of vertice * 3 (xyz) + 1 for Y
        // index of vertice * 3 (xyz) + 2 for Z
        this.dirty.attributes = true;
        this.attributes.a_position.value.set(data, index);
    }

    update(inShadowMap) {
        const gl = getContext();

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

    draw() {
        const gl = getContext();

        if (this.isInstance) {
            if (WEBGL2) {
                gl.drawElementsInstanced(
                    this.mode,
                    this.indices.value.length,
                    gl.UNSIGNED_SHORT,
                    0,
                    this.instanceCount
                );
            } else {
                supports().instancedArrays.drawElementsInstancedANGLE(
                    this.mode,
                    this.indices.value.length,
                    gl.UNSIGNED_SHORT,
                    0,
                    this.instanceCount
                );
            }
        } else if (this.indices) {
            gl.drawElements(
                this.mode,
                this.indices.value.length,
                gl.UNSIGNED_SHORT,
                0
            );
        } else {
            gl.drawArrays(
                this.mode,
                0,
                this.attributes.a_position.value.length / 3
            );
        }
    }
}

export default Model;
