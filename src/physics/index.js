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
    Icosahedron,
    Box,
} = lowww.geometries;

const { World, Sphere, AABB } = lowww.physics;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 500);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        this.world = new World();
        this.world.start(Date.now() / 1000);

        // adds bounds
        const width = 100;
        const height = 100;
        const depth = 100;
        const thickness = 10;

        this.addBounds(0, -height, 0, width, thickness, depth, true); // bottom
        this.addBounds(0, 0, -depth, width, height, thickness); // back
        this.addBounds(0, height, 0, width, thickness, depth, true); // top
        this.addBounds(-width, 0, 0, thickness, height, depth); // left
        this.addBounds(width, 0, 0, thickness, height, depth); // right
        this.addBounds(0, 0, depth, width, height, thickness, true); // front

        // add spheres
        const amount = 2;
        const radius = 10;

        for (let i = 0; i < amount; i++) {
            const geometry = new Icosahedron(radius, 1);
            const mesh = new Mesh({ geometry });
            this.scene.add(mesh);

            const body = new Sphere({
                x: Math.random(), // (Math.random() * width) - (width / 2),
                // y: Math.random(), // (Math.random() * height) - (height / 2),
                // z: Math.random(), // (Math.random() * depth) - (depth / 2),
                restitution: 0.9,
                radius,
                mesh,
            });
            this.world.add(body);
        }
    }

    addBounds(x, y, z, width, height, depth, wireframe = false) {
        const geometry = new Box(width, height, depth);
        const shader = new shaders.Basic({ wireframe });
        const mesh = new Mesh({ geometry, shader });
        mesh.position.set(x, y, z);
        this.scene.add(mesh);

        const body = new AABB({
            x,
            y,
            z,
            width,
            height,
            depth,
            restitution: 0.3,
        });
        this.world.add(body);
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    update() {
        const timeStep = 1 / 30;
        this.world.step(timeStep, Date.now() / 1000);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
