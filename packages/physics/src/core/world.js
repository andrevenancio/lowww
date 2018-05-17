import { vec3 } from 'gl-matrix';
import { RIGID_BODY, FORCE, DEFAULT_TIMESTEP } from '../constants';
import { checkContacts } from './contacts';

let time = 0;
let timestep = 0;

let currenttime = 0;
let accumulator = 0;
let newtime = 0;
let frametime = 0;

class World {
    constructor(params = {}) {
        timestep = params.timestep || DEFAULT_TIMESTEP;
        currenttime = params.time || Date.now() / 1000;

        this.force = vec3.create();
        this.bodies = [];
        this.forces = [];

        this.paused = true;
    }

    add(body) {
        if (body.type === RIGID_BODY) {
            this.bodies.push(body);
        }

        if (body.type === FORCE) {
            this.forces.push(body);
        }
    }

    remove(body) {
        if (body.type === RIGID_BODY) {
            const index = this.bodies.indexOf(body);
            if (index !== -1) {
                this.bodies.splice(index, 1);
            }
        }

        if (body.type === FORCE) {
            const index = this.forces.indexOf(body);
            if (index !== -1) {
                this.forces.splice(index, 1);
            }
        }
    }

    pause() {
        if (this.paused === false) {
            this.paused = true;
        }
    }

    resume() {
        if (this.paused === true) {
            this.paused = false;
        }
    }

    update() {
        if (this.paused) {
            return;
        }
        newtime = Date.now() / 1000;
        frametime = newtime - currenttime;

        if (frametime > 0.25) {
            frametime = 0.25;
        }

        currenttime = newtime;
        accumulator += frametime;

        while (accumulator >= timestep) {
            this.step();
            time += timestep;
            accumulator -= timestep;
        }

        this.render();
    }

    // calculates physics
    step() {
        this.calculateWorldForces();

        // update bounding volumes (used later for collision detection)
        this.updateBounds();

        // check for collisions
        this.collision();

        // sort which bodies are awake and integrate them
        this.integrate();
    }

    calculateWorldForces() {
        // calculates all forces in the world
        this.force[0] = 0;
        this.force[1] = 0;
        this.force[2] = 0;

        for (let i = 0; i < this.forces.length; i++) {
            this.force[0] += this.forces[i].data[0];
            this.force[1] += this.forces[i].data[1];
            this.force[2] += this.forces[i].data[2];
        }

        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].addForce(this.force);
        }
    }

    updateBounds() {
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].updateBounds();
        }
    }

    collision() {
        let a;
        let b;
        for (let i = 0; i < this.bodies.length - 1; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                a = this.bodies[i];
                b = this.bodies[j];
                checkContacts(a, b);

                if (i === 0 && j === 1) {
                    console.log(a.collider);
                }
            }
        }
    }

    integrate() {
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].integrate(timestep);
        }
    }

    render() {
        // console.log('render', this.time);
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].render(time);
        }
    }

    debug() {
        // TODO: debugs the world in a canvas 2d
    }
}

export default World;
