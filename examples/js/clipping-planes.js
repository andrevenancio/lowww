/* global dat */
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

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.z = 500;

        this.controls = new Orbit(this.camera, this.renderer.domElement);

        this.gui = new dat.GUI();
    }

    init() {
        const size = 20;

        const geometry = new Box(size, size, size);
        this.model = new Mesh({ geometry });
        this.model.side = SIDE.BOTH;
        this.scene.add(this.model);

        // global clipping
        this.scene.clipping.enable = false;
        this.scene.clipping.planes[0] = [0, 1, 0, 10];

        // local clipping
        this.model.clipping.enable = true;
        this.model.clipping.planes[0] = [0.5, 1, 0, 10];

        // gui
        this.gui.add(this.scene.clipping, 'enable').name('global clipping').onChange(e => this.scene.clipping.enable = e);
        this.gui.add(this.model.clipping, 'enable').name('local clipping').onChange(e => this.model.clipping.enable = e);
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setRatio(window.devicePixelRatio);
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.update.bind(this));
    }
}

(() => new Main())();
