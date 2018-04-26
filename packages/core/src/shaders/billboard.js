import Texture from '../core/texture';
import { UBO, EXTENSIONS } from './chunks';
import { SHADER_BILLBOARD, DRAW } from '../constants';

class Billboard {
    constructor(props = {}) {
        this.map = new Texture();

        if (props.map) {
            this.map.fromImage(props.map);
        }

        if (props.texture) {
            this.map = props.texture;
        }

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;
            in vec2 a_uv;

            ${UBO.scene()}
            ${UBO.model()}

            out vec2 v_uv;

            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
                v_uv = a_uv;
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            in vec2 v_uv;

            ${UBO.scene()}

            uniform sampler2D u_map;

            out vec4 outColor;

            void main() {
                // depth map
                float z = texture(u_map, v_uv).r;
                float n = 1.0;
                float f = 1000.0;
                float c = (2.0 * n) / (f + n - z * (f - n));

                // draw depth
                outColor = vec4(c);
            }
        `;

        return Object.assign({
            type: SHADER_BILLBOARD,
            mode: DRAW.TRIANGLES,
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

export default Billboard;
