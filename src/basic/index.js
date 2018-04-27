import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    chunks,
    Model,
} = lowww.core;

const { UBO } = chunks;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 500);
    }

    init() {
        const vertex = `#version 300 es
            in vec3 a_position;

            ${UBO.scene()}
            ${UBO.model()}

            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
            }
        `;

        const fragment = `#version 300 es
            precision highp float;
            precision highp int;

            out vec4 outColor;

            void main() {
                outColor = vec4(1.0);
            }
        `;

        const size = 20;
        const model = new Model();
        model.setAttribute('a_position', 'vec3', new Float32Array([-size, -size, 0, size, -size, 0, 0, size, 0]));
        model.setShader(vertex, fragment);
        this.scene.add(model);
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
