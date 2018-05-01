import Force from './core/force';

class LinearAccelerator extends Force {
    constructor(direction) {
        super();
        this.x = direction.x;
        this.y = direction.y;
        this.z = direction.z;
    }

    perform(bodies) {
        const { x, y, z } = this;
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].accelerate(x, y, z);
        }
    }
}

export default LinearAccelerator;
