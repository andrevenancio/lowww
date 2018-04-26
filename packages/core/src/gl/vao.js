import { getContext, getContextType, supports } from '../session';
import { CONTEXT } from '../constants';

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

export default Vao;
