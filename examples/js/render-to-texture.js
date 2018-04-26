const {
    Renderer,
    Scene,
    cameras,
    Mesh,
    RenderTarget,
    chunks,
} = lowww.core;
const { Orbit } = lowww.controls;
const { Plane, Icosahedron } = lowww.geometries;

const { UBO } = chunks;

class Main {
    constructor() {
        window.addEventListener('resize', this.resize.bind(this), false);
        this.setup();
        this.init();
        this.resize();
        this.update();
    }

    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        // first scene to render
        this.scene1 = new Scene();
        this.camera1 = new cameras.Perspective();
        this.camera1.position.set(0, 0, 500);

        // second scene rendering plane with 1st scene as texture.
        this.scene2 = new Scene();
        this.camera2 = new cameras.Orthographic();
        this.camera2.position.z = 100;

        this.controls = new Orbit(this.camera1, this.renderer.domElement);
    }

    init() {
        // original scene
        const geometry1 = new Icosahedron(100, 1);
        const model1 = new Mesh({ geometry: geometry1 });
        this.scene1.add(model1);

        // render texture
        this.rt = new RenderTarget({
            width: 512,
            height: 512,
            ratio: window.devicePixelRatio,
        });

        const geometry2 = new Plane(1, 1);
        const shader = {
            vertex: `#version 300 es
                in vec3 a_position;
                in vec3 a_normal;
                in vec2 a_uv;

                ${UBO.scene()}
                ${UBO.model()}

                out vec2 v_uv;

                void main() {
                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
                    v_uv = a_uv;
                }
            `,

            fragment: `#version 300 es
                precision highp float;
                precision highp int;

                in vec2 v_uv;

                uniform sampler2D u_image;
                uniform sampler2D u_depth;

                out vec4 outColor;

                void main() {
                    if (v_uv.x < 0.5) {
                        outColor = texture(u_image, v_uv);
                    } else {
                        float z = texture(u_depth, v_uv).r;
                        float n = 1.0;
                        float f = 1000.0;
                        float c = (2.0 * n) / (f + n - z * (f - n));
                        outColor = vec4(vec3(c), 1.0);
                    }
                }
            `,

            uniforms: {
                u_image: {
                    type: 'sampler2D',
                    value: this.rt.texture,
                },
                u_depth: {
                    type: 'sampler2D',
                    value: this.rt.depthTexture,
                },
            },
        };

        this.plane = new Mesh({ geometry: geometry2, shader });
        this.scene2.add(this.plane);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.renderer.setRatio(window.devicePixelRatio);
        this.rt.setSize(width, height);
    }

    update() {
        this.controls.update();

        // render original scene to a texture
        this.renderer.rtt({
            renderTarget: this.rt, // the texture to render to
            scene: this.scene1, // the scene
            camera: this.camera1, // the camera
            clearColor: [0, 0, 0, 1], // clear colour
        });

        // render the second scene
        this.renderer.render(this.scene2, this.camera2);
        requestAnimationFrame(this.update.bind(this));
    }
}

(() => new Main())();
