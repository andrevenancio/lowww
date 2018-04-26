import Texture from '../core/texture';
import { UBO, FOG, CLIPPING, EXTENSIONS } from './chunks';
import { SHADER_SEM } from '../constants';

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

export default Sem;
