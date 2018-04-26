import { vec3, mat4 } from 'gl-matrix';
import Object3 from '../core/object3';

class OrthographicCamera extends Object3 {
    constructor(params = {}) {
        super();

        Object.assign(this, {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: -1000,
            far: 1000,
        }, params);

        this.matrices.projection = mat4.create();
    }

    lookAt(v) {
        vec3.copy(this.target, v);
    }

    updateCameraMatrix() {
        // left, right, bottom, top, near, far
        mat4.ortho(
            this.matrices.projection,
            this.left,
            this.right,
            this.bottom,
            this.top,
            this.near,
            this.far,
        );
    }
}

export default OrthographicCamera;
