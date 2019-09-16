import { vec3 } from 'gl-matrix';
import { UBO, FOG, EXTENSIONS } from './chunks';
import { SHADER_BASIC, DRAW } from '../constants';

class Basic {
    constructor(props = {}) {
        const color = props.color || vec3.fromValues(1, 1, 1);

        const vertex = `#version 300 es
            ${EXTENSIONS.vertex()}

            in vec3 a_position;

            ${UBO.scene()}
            ${UBO.model()}

            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            ${UBO.scene()}

            uniform vec3 u_color;

            out vec4 outColor;

            void main() {
                vec4 base = vec4(u_color, 1.0);

                ${FOG.linear()}

                outColor = base;
            }
        `;

        return Object.assign(
            {
                type: SHADER_BASIC,
                mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES,
            },
            {
                vertex,
                fragment,
                uniforms: {
                    u_color: {
                        type: 'vec3',
                        value: color,
                    },
                },
            }
        );
    }
}

export default Basic;
