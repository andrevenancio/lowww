import { vec3 } from 'gl-matrix';
// import Vector3 from '../core/vector3';
import { DIRECTIONAL_LIGHT } from '../constants';

class Light {
    constructor() {
        this.position = vec3.create();
    }

    destroy() {
        // TODO
    }
}

class Directional extends Light {
    constructor(props = {}) {
        super();

        this.type = DIRECTIONAL_LIGHT;

        this.color = props.color || vec3.fromValues(1, 1, 1);
        this.intensity = props.intensity || 0.989;
    }
}

export { Directional };
