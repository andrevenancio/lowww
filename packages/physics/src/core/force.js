import { vec3 } from 'gl-matrix';
import { FORCE } from '../constants';

class Force {
    constructor(x = 0, y = 0, z = 0) {
        this.type = FORCE;
        this.data = vec3.fromValues(x, y, z);
    }
}

export default Force;
