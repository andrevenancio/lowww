import { getContext } from '../session';

export const initUniforms = (uniforms, program) => {
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

export const updateUniforms = (uniforms) => {
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
