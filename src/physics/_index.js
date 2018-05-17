import { vec3 } from 'gl-matrix';
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
const {
    World,
    // Force,
    RigidBody,
    SphereCollider,
    AABBCollider,
} = lowww.physics;

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
        this.world = new World();
        // this.world.add(new Force(0, -20, 0)); // gravity

        // common
        let geometry;
        let shader;
        let collider;
        let mesh;
        let body;

        // sphere --------------------------------------------------------------
        const radius = Math.random() * 5;
        geometry = new Icosahedron(radius, 2);
        shader = new shaders.Default({ color: [0, 1, 0] });
        mesh = new Mesh({ geometry, shader });
        this.scene.add(mesh);

        collider = new SphereCollider({ radius });
        body = new RigidBody({
            collider,
            mesh,
            mass: radius,
        });
        this.world.add(body);

        geometry = new Box(1, 1, 1);
        shader = new shaders.Basic({ color: [0, 1, 1], wireframe: true });
        this.spherebounding = new Mesh({ geometry, shader });
        this.scene.add(this.spherebounding);

        // floor
        // geometry = new Box(50, 1, 50);
        // shader = new shaders.Default({ color: [1, 1, 1] });
        // mesh = new Mesh({ geometry, shader });
        // this.scene.add(mesh);
        //
        // // TODO: maybe API picks up this values
        // collider = new AABBCollider({ width: 50, height: 1, depth: 50 });
        // body = new RigidBody({ collider, mesh });
        // this.world.add(body);

        // window.addEventListener('mousedown', () => {
        //     // body.setImpulse(vec3.fromValues(0, -10, 0));
        // }, false);
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
        this.spherebounding.scale.x = Math.abs(this.world.bodies[0].collider.left) + Math.abs(this.world.bodies[0].collider.right);
        this.spherebounding.scale.y = Math.abs(this.world.bodies[0].collider.top) + Math.abs(this.world.bodies[0].collider.bottom);
        this.spherebounding.scale.z = Math.abs(this.world.bodies[0].collider.front) + Math.abs(this.world.bodies[0].collider.back);
        vec3.copy(this.spherebounding.position.data, this.world.bodies[0].position);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
