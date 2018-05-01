// inspired on microphysics
import { types } from '../constants';
/* eslint-disable */
const byLeft = (b1, b2) => {
    return b1.left - b2.left;
};

class World {
    constructor() {
        this.u = 0;
        this.bodies = [];
        this.forces = [];
        this.managed = [this.bodies, this.forces];
    }

    add() {
        for (let i = 0; i < arguments.length; i++) {
            const obj = arguments[i];
            obj.world = this;

            if (obj.type === types.FORCE) {
                this.forces.push(obj);
            } else {
                this.bodies.push(obj);
            }
        }
        return this;
    }

    remove() {
        for (let i = 0; i < arguments.length; i++) {
            const obj = arguments[i];
            obj.remove();
        }
    }

    onContact(body1, body2) {
        // TODO: empty
    }

    momentum() {
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].momentum();
        }
    }

    applyAcceleration(delta) {
        const sdelta = delta * delta;
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].applyAcceleration(sdelta);
        }
    }

    collide(restitute) {
        this.updateBoundingVolumes();
        this.bodies.sort(byLeft);

        for (let i = 0; i < this.bodies.length - 1; i++) {
            const b1 = this.bodies[i];
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b2 = this.bodies[j];

                if (b1.dynamic || b2.dynamic) {
                    if (b1.right > b2.left) {
                        // console.log('back', b1.back, 'front', b2.front); // && b1.front > b2.back && b1.bottom < b2.top && b1.top > b2.bottom);
                        if (b1.back < b2.front && b1.front > b2.back && b1.bottom < b2.top && b1.top > b2.bottom) {
                            b1.collide(b2, restitute);
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        // debugger;
    }

    getCollection() {
        var c = [];
        this.managed.push(c);
        return c;
    }

    cleanupCollection(c) {
        for (let i = 0; i < c.length; i++) {
            if (c[i].to_remove) {
                c.splice(i, 1);
                i--;
            }
        }
    }

    cleanup() {
        const managed = this.managed;
        const l = managed.length;
        for (let i = 0; i < l; i++) {
            this.cleanupCollection(managed[i]);
        }
    }

    updateBoundingVolumes() {
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].updateBoundingVolume();
        }
    }

    onestep(delta) {
        this.time += delta;
        this.accelerate(delta);
        this.applyAcceleration(delta);
        this.collide(false);
        this.momentum();
        this.collide(true);
        this.updateMeshPosition();
        this.cleanup();
    }

    step(timestep, now) {
        if (now - this.time > 0.25) {
            this.time = now - 0.25;
        }

        while (this.time < now) {
            this.onestep(timestep);
        }

        const diff = this.time - now;
        if (diff > 0){
            this.u = (timestep - diff) / timestep;
        } else {
            this.u = 1.0;
        }
    }

    start(time) {
        this.time = time;
    }

    accelerate(delta) {
        for (let i = 0; i < this.forces.length; i++) {
            this.forces[i].perform(this.bodies, delta);
        }
    }

    updateMeshPosition() {
        let mesh;
        let position;
        for (let i = 0; i < this.bodies.length; i++) {
            mesh = this.bodies[i].mesh;
            if (mesh) {
                const position = this.bodies[i].getPosition();
                mesh.position.set(position[0], position[1], position[2]);
            }
        }
    }
}

export default World;
