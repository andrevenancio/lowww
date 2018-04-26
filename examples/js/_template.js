const {
    Renderer,
    Scene,
    cameras,
} = lowww.core;

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
    }

    init() {

    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setRatio(window.devicePixelRatio);
    }

    update() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.update.bind(this));
    }
}

(() => new Main())();
