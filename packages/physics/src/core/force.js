import { vec3 } from 'gl-matrix';
import { FORCE } from '../constants';

class Force {
    constructor(force = vec3.create()) {
        this.type = FORCE;
        this.data = vec3.fromValues(force[0], force[1], force[2]);
    }
}

export default Force;
