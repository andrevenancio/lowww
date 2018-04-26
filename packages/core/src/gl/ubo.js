import { getContext } from '../session';

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

export default Ubo;
