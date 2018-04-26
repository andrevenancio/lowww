import { vec3 } from 'gl-matrix';
import Texture from '../core/texture';
import { UBO, LIGHT, FOG, CLIPPING, EXTENSIONS, SHADOW } from './chunks';
import { SHADER_DEFAULT, DRAW } from '../constants';

class Default {
    constructor(props = {}) {
        const color = props.color || vec3.fromValues(1, 1, 1);
        this.map = new Texture({ transparent: true });

        // map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/620678/red.jpg'.
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
            ${SHADOW.vertex_pre()}

            out vec3 fragVertexEc;
            out vec2 v_uv;
            out vec3 v_normal;

            void main() {
                vec4 worldPosition = modelMatrix * vec4(a_position, 1.0);
                vec4 position = projectionMatrix * viewMatrix * worldPosition;
                gl_Position = position;

                fragVertexEc = position.xyz; // worldPosition.xyz;
                v_uv = a_uv;
                v_normal = (normalMatrix * vec4(a_normal, 1.0)).xyz;

                ${SHADOW.vertex()}
                ${CLIPPING.vertex()}
            }
        `;

        const fragment = `#version 300 es
            ${EXTENSIONS.fragment()}

            precision highp float;
            precision highp int;

            in vec3 fragVertexEc;
            in vec2 v_uv;
            in vec3 v_normal;

            ${CLIPPING.fragment_pre()}

            ${UBO.scene()}
            ${UBO.model()}
            ${UBO.lights()}

            uniform sampler2D u_map;
            uniform vec3 u_color;

            ${SHADOW.fragment_pre()}

            out vec4 outColor;

            void main() {
                vec3 v_normal = normalize(cross(dFdx(fragVertexEc), dFdy(fragVertexEc)));

                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);
                base += vec4(u_color, 1.0);
                base *= texture(u_map, v_uv);

                ${SHADOW.fragment()}
                ${LIGHT.factory()}
                ${FOG.linear()}
                ${CLIPPING.fragment()}

                outColor = base;
            }
        `;

        return Object.assign({
            type: SHADER_DEFAULT,
            mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES,
        }, {
            vertex,
            fragment,
            uniforms: {
                u_map: {
                    type: 'sampler2D',
                    value: this.map.texture,
                },

                u_color: {
                    type: 'vec3',
                    value: color,
                },
            },
        });
    }
}

export default Default;
