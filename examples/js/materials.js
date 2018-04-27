const {
    Renderer,
    Scene,
    cameras,
    Mesh,
    shaders,
} = lowww.core;
const { Orbit } = lowww.controls;
const { Icosahedron, Suzanne } = lowww.geometries;

const { Basic, Default, Sem } = shaders;

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
    }

    init() {
        const size = 20;
        const space = 50;
        let geometry = new Icosahedron(size, 1);

        const wireframe = new Mesh({ geometry, shader: new Basic({ wireframe: true }) });
        wireframe.position.set(-space, 0, 0);
        this.scene.add(wireframe);

        const basic = new Mesh({ geometry, shader: new Basic() });
        basic.position.set(0, 0, 0);
        this.scene.add(basic);

        const d = new Mesh({ geometry, shader: new Default() });
        d.position.set(space, 0, 0);
        this.scene.add(d);

        geometry = new Suzanne(size);
        const sem = new Mesh({ geometry, shader: new Sem({ map: './img/matcap/black-gloss.jpg' }) });
        sem.position.set(0, space, 0);
        this.scene.add(sem);
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