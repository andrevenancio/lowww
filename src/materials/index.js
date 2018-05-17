import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    Mesh,
    shaders,
} = lowww.core;
const { Orbit } = lowww.controls;
const {
    TorusKnot,
} = lowww.geometries;

const { Basic, Default, Sem } = shaders;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 10, 20);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        const materials = [
            new Basic({ wireframe: true }),
            new Basic(),
            new Default(),
            new Sem({ map: './img/matcap/black-gloss.jpg' }),
        ];

        const geometry = new TorusKnot();
        for (let i = 0; i < materials.length; i++) {
            const mesh = new Mesh({ geometry, shader: materials[i] });
            mesh.position.set(
                (3 * i) - ((3 * (materials.length - 1)) / 2),
                0,
                0,
            );
            this.scene.add(mesh);
        }
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
