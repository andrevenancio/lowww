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

export const createProgram = (gl, vertex, fragment, programID) => {
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
