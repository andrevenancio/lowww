import { vec3 } from 'gl-matrix';
import { RIGID_BODY, SPHERE_COLLIDER, AABB_COLLIDER } from '../constants';

class RigidBody {
    constructor(params) {
        if (!params.collider) {
            throw new Error('Please provide a collider');
        }

        if (!params.mesh) {
            throw new Error('Please provide a mesh');
        }

        Object.assign(
            this,
            {
                type: RIGID_BODY,
                awake: true,
                lineardrag: 0.999,
                dynamic: true,
                velocity: vec3.create(),
                acceleration: vec3.create(),
                position: vec3.create(),
                force: vec3.create(),
            },
            params
        );

        // copy mesh position
        vec3.copy(this.position, this.mesh.position.data);
    }

    getInversemass() {
        return 1 / this.getMass();
    }

    getMass() {
        switch (this.collider.type) {
            case SPHERE_COLLIDER:
                return this.collider.radius;
            case AABB_COLLIDER:
                return 1;
            default:
                console.warn('unknown collider');
                return 1;
        }
    }

    // copies world force into body
    addForce(force) {
        vec3.copy(this.force, force);
    }

    integrate(deltatime) {
        if (!this.awake || !this.dynamic) {
            return;
        }

        // calculate acceleration
        const mass = this.getMass();
        this.acceleration[0] = this.force[0] / mass;
        this.acceleration[1] = this.force[1] / mass;
        this.acceleration[2] = this.force[2] / mass;

        // adding acceleration to velocity
        vec3.scaleAndAdd(
            this.velocity,
            this.velocity,
            this.acceleration,
            deltatime
        );

        // adding velocity to position
        vec3.scaleAndAdd(
            this.position,
            this.position,
            this.velocity,
            deltatime
        );

        // add drag to velocity
        this.velocity[0] *= this.lineardrag;
        this.velocity[1] *= this.lineardrag;
        this.velocity[2] *= this.lineardrag;
    }

    updateBounds() {
        this.collider.updateBounds(this.position);
    }

    render() {
        vec3.copy(this.mesh.position.data, this.position);
    }
}

export default RigidBody;
