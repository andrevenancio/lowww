import { AABB_COLLIDER } from '../constants';

class AABBCollider {
    constructor(params = {}) {
        Object.assign(this, {
            type: AABB_COLLIDER,
            width: 1,
            height: 1,
            depth: 1,
        }, params);
    }

    updateBounds(position) {
        const width = this.width / 2;
        const height = this.height / 2;
        const depth = this.depth / 2;

        this.left = position[0] - width;
        this.right = position[0] + width;

        this.top = position[1] + height;
        this.bottom = position[1] - height;

        this.front = position[2] + depth;
        this.back = position[2] - depth;
    }
}

export default AABBCollider;
