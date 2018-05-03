import { SPHERE_COLLIDER } from '../constants';

class Collider {
    constructor(type) {
        this.type = type;
    }

    collideSphere() {
        // to be overriden
    }

    collideAABB() {
        // to be overriden
    }

    collide(other) {
        if (other.type === SPHERE_COLLIDER) {
            // two spheres colliding
            this.collideSphere();
        }
    }
}

export default Collider;
