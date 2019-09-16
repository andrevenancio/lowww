import { vec4 } from 'gl-matrix';
import { Orthographic } from '../cameras';
import Renderer from './renderer';
import RenderTarget from './rt';
import Pass from './pass';
import { Basic } from '../passes';

class Composer {
    constructor(props) {
        this.renderer = new Renderer(props);
        this.domElement = this.renderer.domElement;

        this.camera = new Orthographic();
        this.camera.position.z = 100;

        this.passes = [];

        this.clearColor = vec4.fromValues(0, 0, 0, 1);

        this.screen = new Pass(Basic);
        this.screen.compile();

        this.buffers = [new RenderTarget(), new RenderTarget()];

        this.read = this.buffers[1];
        this.write = this.buffers[0];
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this.read.setSize(width, height);
        this.write.setSize(width, height);
    }

    setRatio(ratio) {
        this.renderer.setRatio(ratio);
    }

    pass(pass) {
        this.passes.push(pass);
    }

    compile() {
        for (let i = 0; i < this.passes.length; i++) {
            this.passes[i].compile();
        }
    }

    renderToTexture(renderTarget, scene, camera) {
        this.renderer.rtt({
            renderTarget,
            scene,
            camera,
            clearColor: this.clearColor,
        });
    }

    resetBuffers() {
        this.read = this.buffers[1];
        this.write = this.buffers[0];
    }

    swapBuffers() {
        this.temp = this.read;
        this.read = this.write;
        this.write = this.temp;
    }

    render(scene, camera) {
        this.resetBuffers();
        this.renderToTexture(this.write, scene, camera);

        // ping pong textures through passes
        const total = this.passes.length;
        for (let i = 0; i < total; i++) {
            if (this.passes[i].enable) {
                this.swapBuffers();
                this.passes[i].setUniform('u_input', this.read.texture);
                this.renderToTexture(
                    this.write,
                    this.passes[i].scene,
                    this.camera
                );
            }
        }

        // render last pass to screen
        this.screen.setUniform('u_input', this.write.texture);
        this.renderer.render(this.screen.scene, this.camera);
    }
}

export default Composer;
