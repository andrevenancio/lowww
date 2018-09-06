import Model from './model';
import { Default } from '../shaders';
import { SHADER_CUSTOM } from '../constants';

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
        } = params.geometry || {};

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

export default Mesh;
