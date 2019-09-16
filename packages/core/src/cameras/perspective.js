import { vec3, mat4 } from 'gl-matrix';
import Object3 from '../core/object3';

class PerspectiveCamera extends Object3 {
    constructor(params = {}) {
        super();

        Object.assign(
            this,
            {
                near: 1,
                far: 1000,
                fov: 35,
            },
            params
        );

        this.matrices.projection = mat4.create();
    }

    lookAt(v) {
        vec3.copy(this.target, v);
    }

    updateCameraMatrix(width, height) {
        mat4.perspective(
            this.matrices.projection,
            this.fov * (Math.PI / 180),
            width / height,
            this.near,
            this.far
        );
    }
}

export default PerspectiveCamera;
