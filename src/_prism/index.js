import Template from '../template';
import { L } from './letters';

const { Renderer, Scene, cameras } = lowww.core;
const { Orbit } = lowww.controls;

class Main extends Template {
    setup() {
        this.renderer = new Renderer();
        document.body.appendChild(this.renderer.domElement);

        this.scene = new Scene();

        this.camera = new cameras.Perspective();
        this.camera.position.set(25, 25, 50);

        this.controls = new Orbit(this.camera, this.renderer.domElement);

        this.show = false;

        window.addEventListener(
            'click',
            () => {
                console.log('toggle');
                if (this.show) {
                    this.mesh.hide();
                    this.show = false;
                } else {
                    this.mesh.show();
                    this.show = true;
                }
            },
            false
        );
    }

    init() {
        this.mesh = new L();
        this.scene.add(this.mesh);
    }

    resize(width, height, ratio) {
        this.renderer.setSize(width, height);
        this.renderer.setRatio(ratio);
    }

    pause() {}

    resume() {}

    update() {
        // const y = Math.cos(Date.now() / 500) * 0.5;
        // this.mesh.container.updateVertices([y], (2 * 3) + 1); // index 0 * xyz + 1 (y)
        // this.mesh.updateVertices([y], (3 * 3) + 1); // index 0 * xyz + 1 (y)
        // this.mesh.show();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Main };
