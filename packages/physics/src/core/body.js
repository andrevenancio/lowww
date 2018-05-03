import { vec3 } from 'gl-matrix';

class Body {
    constructor() {
        this.position = vec3.create(); // center of mass
        this.velocity = vec3.create();
        this.acceleration = vec3.create();
        this.force = vec3.create();
        this.awake = false;
    }

    handleForces(force) {
        vec3.copy(this.force, force);
    }

    handleVelocity(delta) {
        // calculate acceleration
        this.acceleration[0] = this.force[0] / this.mass;
        this.acceleration[1] = this.force[1] / this.mass;
        this.acceleration[2] = this.force[2] / this.mass;

        // adding acceleration to velocity
        vec3.scaleAndAdd(this.velocity, this.velocity, this.acceleration, delta);

        // changing position
        vec3.scaleAndAdd(this.position, this.position, this.velocity, delta);

        // this.velocity[0] = 0;
        // this.velocity[1] = 0;
        // this.velocity[2] = 0;
    }

    handleMomentum() {
        //
    }

    render() {
        // updates mesh center and quaternion
        vec3.copy(this.mesh.position.data, this.position);
    }
}

export default Body;
