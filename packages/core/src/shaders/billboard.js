import { UBO, LIGHT, FOG, CLIPPING, EXTENSIONS, SHADOW } from './chunks';
import { SHADER_BILLBOARD, DRAW } from '../constants';

class Billboard {
    constructor(props = {}) {
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

            ${SHADOW.fragment_pre()}

            out vec4 outColor;

            ${props.fragment ||
                'void mainImage( out vec4 fragColor, in vec2 fragCoord ) { fragColor = vec4(0.0, 1.0, 1.0, 1.0); }'}

            void main() {
                vec4 base = vec4(0.0, 0.0, 0.0, 1.0);
                mainImage(base, gl_FragCoord.xy);

                ${SHADOW.fragment()}
                ${LIGHT.factory()}
                ${FOG.linear()}
                ${CLIPPING.fragment()}

                outColor = base;
            }
        `;

        return Object.assign(
            {
                type: SHADER_BILLBOARD,
                mode: props.wireframe === true ? DRAW.LINES : DRAW.TRIANGLES,
            },
            {
                vertex,
                fragment,
                uniforms: {},
            }
        );
    }
}

export default Billboard;
