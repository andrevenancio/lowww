import { vec3 } from 'gl-matrix';

import Body from '../core/body';
import { RIGID_BODY } from '../constants';

class RigidBody extends Body {
    constructor(params = {}) {
        super();
        if (!params.collider) {
            throw new Error('Please provide a collider');
        }

        if (!params.mesh) {
            throw new Error('Please provide a mesh');
        }

        Object.assign(this, {
            type: RIGID_BODY,
            mass: 1,
        }, params);

        vec3.copy(this.position, this.mesh.position.data);
    }
}

export default RigidBody;
