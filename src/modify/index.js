import Template from '../template';

const {
    Renderer,
    Scene,
    cameras,
    Mesh,
} = lowww.core;
const {
    Icosahedron,
    utils,
} = lowww.geometries;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();
        this.scene.fog.enable = true;

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 500);
    }

    init() {
        this.settings = {
            data: ['none', 'modify', 'detach'],
            modifier: 'modify',
        };

        this.gui.add(this.settings, 'modifier', this.settings.data).onChange(this.rebuild.bind(this));

        this.random = [];
        for (let i = 0; i < 3000; i++) {
            this.random.push(Math.random() * 0.2);
        }

        this.original = new Icosahedron(60, 2);
        this.rebuild();
    }

    rebuild() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }

        let geometry = this.original;
        let vertices = 1;

        if (this.settings.modifier === 'modify') {
            geometry = utils.Modify.modify(this.original);
            vertices = (3 * 3) * 4; // vertices * XYZ * 4 faces (1 original + 3 generated)
        } else if (this.settings.modifier === 'detach') {
            geometry = utils.Modify.detach(this.original);
            vertices = (3 * 3) * 1; // vertices * XYZ * 1 faces
        }

        for (let face = 0; face < geometry.positions.length; face += vertices) {
            let r = 1;
            if (this.settings.modifier !== 'none') {
                r += this.random[face % this.random.length];
            }

            for (let vertice = 0; vertice < vertices; vertice++) {
                geometry.positions[face + vertice] *= r;
            }
        }

        this.mesh = new Mesh({ geometry });
        this.scene.add(this.mesh);
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    update() {
        // this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
