import Scene from './scene';
import Mesh from './mesh';
import { UBO } from '../shaders/chunks';

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

export default Pass;
