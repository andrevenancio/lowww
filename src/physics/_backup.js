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

const { World2, Body2, Sphere, AABB, LinearAccelerator } = lowww.physics;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 100);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        this.world = new World2();

        // adds bounds
        const width = 20;
        const height = 20;
        const depth = 20;
        // const thickness = 1;

        // this.addBounds(0, -height, 0, width, thickness, depth, true); // bottom
        // this.addBounds(0, 0, -depth, width, height, thickness); // back
        // this.addBounds(0, height, 0, width, thickness, depth, true); // top
        // this.addBounds(-width, 0, 0, thickness, height, depth); // left
        // this.addBounds(width, 0, 0, thickness, height, depth); // right
        // this.addBounds(0, 0, depth, width, height, thickness, true); // front

        // add spheres
        const amount = 2;
        const radius = 1;

        for (let i = 0; i < amount; i++) {
            const geometry = new Icosahedron(radius, 1);
            const mesh = new Mesh({ geometry });
            this.scene.add(mesh);

            const body = new Sphere({
                x: (Math.random() * width) - (width / 2),
                y: (Math.random() * height) - (height / 2),
                z: (Math.random() * depth) - (depth / 2),
                restitution: 0.9,
                radius,
                mesh,
            });
            this.world.add(body);
        }

        // add gravity
        // const gravity = new LinearAccelerator({ x: 0, y: -9.8, z: 0 });
        // this.world.add(gravity);
    }

    addBounds(x, y, z, width, height, depth, wireframe = true) {
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
        const timeStep = 1 / 180;
        this.world.step(timeStep, Date.now() / 1000);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
