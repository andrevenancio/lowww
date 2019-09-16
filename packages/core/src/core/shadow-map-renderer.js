import { vec3, mat4 } from 'gl-matrix';
import RenderTarget from './rt';
import Perspective from '../cameras/perspective';
import Orthographic from '../cameras/orthographic';

class ShadowMapRenderer {
    constructor(props = {}) {
        // size of texture
        this.width = props.width || 1024;
        this.height = props.height || 1024;

        // create render target
        const { width, height } = this;
        this.rt = new RenderTarget({ width, height });

        // matrices
        this.matrices = {
            view: mat4.create(),
            shadow: mat4.create(),
            bias: mat4.fromValues(
                0.5,
                0.0,
                0.0,
                0.0,
                0.0,
                0.5,
                0.0,
                0.0,
                0.0,
                0.0,
                0.5,
                0.0,
                0.5,
                0.5,
                0.5,
                1.0
            ),
        };

        // origin of directional light
        this.camera = new Perspective({
            fov: 60,
            near: 1,
            far: 1000,
        });

        this.camera = new Orthographic();
        this.camera.position.z = 1; // TODO: remove this when fix lookAt bug on gl-matrix
        this.setLightOrigin(props.light || vec3.fromValues(100, 250, 500));
    }

    // move the camera to the light position
    setLightOrigin(vec) {
        // CAMERA

        // update camera position
        vec3.copy(this.camera.position.data, vec);

        // update view matrix
        mat4.identity(this.matrices.view);
        mat4.lookAt(
            this.matrices.view,
            this.camera.position.data,
            this.camera.target,
            this.camera.up
        );

        // SHADOW
        mat4.identity(this.matrices.shadow);
        mat4.multiply(
            this.matrices.shadow,
            this.camera.matrices.projection,
            this.matrices.view
        );
        mat4.multiply(
            this.matrices.shadow,
            this.matrices.bias,
            this.matrices.shadow
        );
    }

    /*
    TODO:
    maybe create a program just for shadows. this avoids having to change program
    in complex scenes just to write for the depth buffer.
    find a way to bypass the changeProgram on the renderer to accomodate this.
    */
}

export default ShadowMapRenderer;
