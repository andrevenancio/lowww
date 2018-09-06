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
    Force,
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
        this.world.add(new Force(0, -0, 0)); // gravity

        // mesh ----------------------------------------------------------------
        // const radius = 2;
        // const detail = 3;
        const width = 10;
        const height = 10;
        const depth = 10;
        // let geometry = new Icosahedron({ radius, detail });
        let geometry = new Box({ width, height, depth });
        const mesh = new Mesh({ geometry });
        mesh.position.set(5.4, 0, 0);
        this.scene.add(mesh);

        const shader = new shaders.Basic({ color: [0, 1, 1], wireframe: true });
        geometry = new Box();
        this.sphereBounds = new Mesh({ geometry, shader });
        this.scene.add(this.sphereBounds);

        // physics -------------------------------------------------------------
        // const collider = new SphereCollider({ radius });
        const collider = new AABBCollider({ width, height, depth });
        const body = new RigidBody({
            collider,
            mesh,
        });
        this.world.add(body);

        // walls ---------------------------------------------------------------
        this.addWall();
    }

    addWall() {
        const width = 1;
        const height = 1;
        const depth = 1;
        // mesh ----------------------------------------------------------------
        let geometry = new Box({ width, height, depth });
        const mesh = new Mesh({ geometry });
        this.scene.add(mesh);

        const shader = new shaders.Basic({ color: [0, 1, 1], wireframe: true });
        geometry = new Box();
        this.floorBounds = new Mesh({ geometry, shader });
        this.scene.add(this.floorBounds);

        // physics -------------------------------------------------------------
        const collider = new AABBCollider({ width, height, depth });
        const body = new RigidBody({
            collider,
            mesh,
            dynamic: false,
        });
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

        // debug sphere collider
        vec3.copy(this.sphereBounds.scale.data, this.world.bodies[0].collider.bounds);
        vec3.copy(this.sphereBounds.position.data, this.world.bodies[0].position);

        // debug floor collider
        vec3.copy(this.floorBounds.scale.data, this.world.bodies[1].collider.bounds);
        vec3.copy(this.floorBounds.position.data, this.world.bodies[1].position);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };

// scale.x = Math.abs(body.collider.left) + Math.abs(body.collider.right);
// scale.y = Math.abs(body.collider.top) + Math.abs(body.collider.bottom);
// scale.z = Math.abs(body.collider.front) + Math.abs(body.collider.back);
// vec3.copy(this.spherebounding.position.data, body.position);
