import Template from '../template';

const { Renderer, Scene, cameras, Mesh } = lowww.core;
const { Orbit } = lowww.controls;
const {
    Tetrahedron,
    Octahedron,
    Hexahedron,
    Icosahedron,
    Dodecahedron,
    Box,
    Plane,
    Sphere,
    Torus,
    TorusKnot,
} = lowww.geometries;

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
        const geometries = [
            Tetrahedron,
            Octahedron,
            Hexahedron,
            Icosahedron,
            Dodecahedron,
            Box,
            Plane,
            Sphere,
            Torus,
            TorusKnot,
        ];

        const radius = 4;
        const step = -(2 * Math.PI) / geometries.length;
        let angle = 0;

        for (let i = 0; i < geometries.length; i++) {
            const geometry = new geometries[i]();
            const mesh = new Mesh({ geometry });
            mesh.position.set(
                radius * Math.cos(angle),
                0,
                radius * Math.sin(angle)
            );
            this.scene.add(mesh);
            angle += step;
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
