import { vec3 } from 'gl-matrix';

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.data = vec3.fromValues(x, y, z);
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set x(value) {
        this.data[0] = value;
    }

    get x() {
        return this.data[0];
    }

    set y(value) {
        this.data[1] = value;
    }

    get y() {
        return this.data[1];
    }

    set z(value) {
        this.data[2] = value;
    }

    get z() {
        return this.data[2];
    }
}

export default Vector3;
