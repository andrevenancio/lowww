import { getContext, getContextType, supports } from '../session';
import { CONTEXT } from '../constants';

export const initAttributes = (attributes, program) => {
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

export const bindAttributes = attributes => {
    const gl = getContext();

    Object.keys(attributes).forEach(key => {
        const { location, buffer, size, instanced } = attributes[key];

        if (location !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(location);

            const divisor = instanced ? 1 : 0;
            if (getContextType() === CONTEXT.WEBGL2) {
                gl.vertexAttribDivisor(location, divisor);
            } else {
                supports().instancedArrays.vertexAttribDivisorANGLE(
                    location,
                    divisor
                );
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    });
};

export const updateAttributes = attributes => {
    const gl = getContext();
    Object.keys(attributes).forEach(key => {
        const { location, buffer, value } = attributes[key];

        if (location !== -1) {
            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    });
};
