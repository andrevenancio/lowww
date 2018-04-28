import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    Mesh,
} = lowww.core;
const { Orbit } = lowww.controls;
const {
    Tetrahedron,
    Octahedron,
    Hexahedron,
    Icosahedron,
    Dodecahedron,
} = lowww.geometries;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 100, 500);

        this.controls = new Orbit(this.camera, this.renderer.domElement);
    }

    init() {
        const size = 20;
        const space = 50;

        let geometry;
        let mesh;
        const meshes = [];

        // Tetrahedron
        geometry = new Tetrahedron(size, 0);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -0);
        meshes.push(mesh);

        geometry = new Tetrahedron(size, 1);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -1);
        meshes.push(mesh);

        geometry = new Tetrahedron(size, 2);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -2);
        meshes.push(mesh);

        // Octahedron
        geometry = new Octahedron(size, 0);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -0);
        meshes.push(mesh);

        geometry = new Octahedron(size, 1);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -1);
        meshes.push(mesh);

        geometry = new Octahedron(size, 2);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -2);
        meshes.push(mesh);

        // Hexahedron
        geometry = new Hexahedron(size, 0);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -0);
        meshes.push(mesh);

        geometry = new Hexahedron(size, 1);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -1);
        meshes.push(mesh);

        geometry = new Hexahedron(size, 2);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -2);
        meshes.push(mesh);

        // Icosahedron
        geometry = new Icosahedron(size, 0);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -0);
        meshes.push(mesh);

        geometry = new Icosahedron(size, 1);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -1);
        meshes.push(mesh);

        geometry = new Icosahedron(size, 2);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -2);
        meshes.push(mesh);

        // Dodecahedron
        geometry = new Dodecahedron(size, 0);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -0);
        meshes.push(mesh);

        geometry = new Dodecahedron(size, 1);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -1);
        meshes.push(mesh);

        geometry = new Dodecahedron(size, 2);
        mesh = new Mesh({ geometry });
        mesh.position.set(0, 0, space * -2);
        meshes.push(mesh);

        const cols = 5;
        const rows = 3;
        let index = 0;

        for (let i = 0; i < cols; i++) { // X
            for (let j = 0; j < rows; j++) { // Z
                const x = Math.floor(index / rows);
                const y = 0;
                const z = index % rows;

                const sx = ((cols - 1) * space) / -2;
                const sz = ((rows - 1) * space) / 2;

                meshes[index].position.set(
                    sx + (x * space),
                    y,
                    sz - (z * space),
                );
                this.scene.add(meshes[index]);
                index++;
            }
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
