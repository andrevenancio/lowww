import { vec3 } from 'gl-matrix';
import { AABB_COLLIDER } from '../constants';

class AABBCollider {
    constructor(params = {}) {
        Object.assign(
            this,
            {
                type: AABB_COLLIDER,
                width: 1,
                height: 1,
                depth: 1,
                bounds: vec3.create(),
            },
            params
        );
    }

    updateBounds(position) {
        const width = this.width / 2;
        const height = this.height / 2;
        const depth = this.depth / 2;

        // world space
        this.left = position[0] - width;
        this.right = position[0] + width;

        this.top = position[1] + height;
        this.bottom = position[1] - height;

        this.front = position[2] + depth;
        this.back = position[2] - depth;

        // local space
        this.bounds[0] = this.width;
        this.bounds[1] = this.height;
        this.bounds[2] = this.depth;
    }
}

export default AABBCollider;
