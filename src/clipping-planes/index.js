import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    Mesh,
    constants,
} = lowww.core;
const { Orbit } = lowww.controls;
const { Box } = lowww.geometries;

const { SIDE } = constants;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 10);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        const geometry = new Box();
        this.model = new Mesh({ geometry });
        this.model.side = SIDE.BOTH;
        this.scene.add(this.model);

        // global clipping
        this.scene.clipping.enable = false;
        this.scene.clipping.planes[0] = [0, 1, 0, 0.5];

        // local clipping
        this.model.clipping.enable = true;
        this.model.clipping.planes[0] = [1.5, 2.5, 0, 0.5];

        // gui
        this.gui.add(this.scene.clipping, 'enable').name('global clipping').onChange(e => this.scene.clipping.enable = e);
        this.gui.add(this.model.clipping, 'enable').name('local clipping').onChange(e => this.model.clipping.enable = e);
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
