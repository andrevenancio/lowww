import { SPHERE_COLLIDER } from '../constants';

class SphereCollider {
    constructor(params = {}) {
        Object.assign(this, {
            type: SPHERE_COLLIDER,
            radius: 1,
        }, params);
    }

    updateBounds(position) {
        this.left = position[0] - this.radius;
        this.right = position[0] + this.radius;

        this.top = position[1] + this.radius;
        this.bottom = position[1] - this.radius;

        this.front = position[2] + this.radius;
        this.back = position[2] - this.radius;
    }
}

export default SphereCollider;
