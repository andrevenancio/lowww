import Collider from '../core/collider';
import { SPHERE_COLLIDER } from '../constants';

class SphereCollider extends Collider {
    constructor(params = {}) {
        super(SPHERE_COLLIDER);

        this.radius = params.radius || 1;
    }
}

export default SphereCollider;
