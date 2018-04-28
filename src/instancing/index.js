import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    chunks,
    Model,
} = lowww.core;
const { Box } = lowww.geometries;

const { UBO, FOG, LIGHT } = chunks;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();
        this.scene.fog.start = 50;
        this.scene.fog.end = 900;
        this.scene.fog.enable = true;

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 500);
    }

    init() {
        const vertex = `#version 300 es
            in vec3 a_position;
            in vec3 a_offset;
            in vec3 a_normal;
            in vec3 a_color;

            ${UBO.scene()}
            ${UBO.model()}

            uniform float u_distance;

            out vec3 v_normal;
            out vec4 v_color;

            vec2 rotate(vec2 v, float a) {
                float s = sin(a);
                float c = cos(a);
                mat2 m = mat2(c, -s, s, c);
                return m * v;
            }

            mat4 rotationMatrix(vec3 axis, float angle) {
                axis = normalize(axis);
                float s = sin(angle);
                float c = cos(angle);
                float oc = 1.0 - c;

                return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);
            }

            vec3 rotate(vec3 v, vec3 axis, float angle) {
                mat4 m = rotationMatrix(axis, angle);
                return (m * vec4(v, 1.0)).xyz;
            }

            const float PI = 3.141592653;

            void main() {
                float speed = 150.0;

                vec3 offset = a_offset;
                offset.z = mod(offset.z + (iGlobalTime * speed), u_distance) - u_distance / 2.0;

                vec2 dir = normalize(offset.xy);
                dir = rotate(dir, PI * 0.5);

                vec3 axis = normalize(a_color);
                float angle = a_color.z + iGlobalTime * mix(a_color.x, 1.0, 0.5) * 5.0;

                vec3 position = rotate(a_position, axis, angle);
                position = position + offset;

                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                v_color = vec4(a_color, 1.0);
                v_normal = normalize(mat3(normalMatrix) * rotate(a_normal, axis, angle));
            }
        `;

        const fragment = `#version 300 es
            precision highp float;
            precision highp int;

            ${UBO.scene()}
            ${UBO.lights()}

            in vec3 v_normal;
            in vec4 v_color;

            out vec4 outColor;

            void main() {
                vec4 base = v_color;
                ${LIGHT.factory()};
                ${FOG.linear()}
                outColor = base;
            }
        `;

        // settings
        const size = 1;
        const distance = 1000; // distance of random generated x, y, z;
        const instances = 100 * 1000; // 100k

        // offsets and colors
        const offsets = [];
        const colors = [];
        for (let i = 0; i < instances; i++) {
            const x = (Math.random() * distance) - (distance / 2);
            const y = (Math.random() * distance) - (distance / 2);
            const z = (Math.random() * distance) - (distance / 2);
            offsets.push(x, y, z);
            colors.push(Math.random(), Math.random(), Math.random());
        }

        // geometry
        const geometry = new Box(size, size, size);
        this.model = new Model();
        this.model.setAttribute('a_position', 'vec3', new Float32Array(geometry.positions));
        this.model.setIndex(new Uint16Array(geometry.indices));
        this.model.setAttribute('a_normal', 'vec3', new Float32Array(geometry.normals));
        this.model.setUniform('u_distance', 'float', distance);
        this.model.setInstanceAttribute('a_offset', 'vec3', new Float32Array(offsets));
        this.model.setInstanceAttribute('a_color', 'vec3', new Float32Array(colors));
        this.model.setInstanceCount(instances);
        this.model.setShader(vertex, fragment);
        this.scene.add(this.model);
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    update() {
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
