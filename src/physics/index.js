import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    Mesh,
} = lowww.core;
const { Orbit } = lowww.controls;
const {
    Icosahedron,
} = lowww.geometries;
const {
    World,
    Force,
    RigidBody,
    SphereCollider,
} = lowww.physics;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 300);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        this.world = new World();
        // this.world.add(new Force(0, -1, 0)); // fake gravity
        this.world.add(new Force(0, -9.81, 0)); // gravity
        // this.world.add(new Force(0, -19.62, 0)); // high-gravity

        // common
        const radius = 1;
        const geometry = new Icosahedron(radius, 1);
        const collider = new SphereCollider(radius);
        let mesh;
        let body;

        // A
        mesh = new Mesh({ geometry });
        mesh.position.x = -10;
        this.scene.add(mesh);

        body = new RigidBody({ collider, mesh });
        this.world.add(body);

        // B
        mesh = new Mesh({ geometry });
        mesh.position.x = 10;
        this.scene.add(mesh);

        body = new RigidBody({ collider, mesh });
        this.world.add(body);
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    pause() {
        this.world.pause();
    }

    resume() {
        this.world.resume();
    }

    update() {
        this.world.update();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
