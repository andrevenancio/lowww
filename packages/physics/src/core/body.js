import { types, getID } from '../constants';

class Body {
    init(args) {
        const params = Object.assign({}, {
            hardness: 1,
            restitution: 1,
            x: 0,
            y: 0,
            z: 0,
            density: 1,
        }, args);

        this.id = getID();

        this.restitution = params.restitution;
        this.hardness = params.hardness;
        this.density = params.density;

        if (params.mass === 0 || this.dynamic === false) {
            this.mass = 0;
            this.inv_mass = 0;
        } else {
            this.mass = params.mass || this.computeMass();
            this.inv_mass = 1 / this.mass;
        }

        this.ax = 0;
        this.ay = 0;
        this.az = 0;

        this.x = params.x;
        this.y = params.y;
        this.z = params.z;

        this.px = this.x;
        this.py = this.y;
        this.pz = this.z;
    }

    onContact(other) {
        this.world.onContact(this, other);
    }

    remove() {
        this.to_remove = true;
    }

    computeMass() {
        return this.density;
    }

    setVelocity(x, y, z) {
        this.px = this.x - x;
        this.py = this.y - y;
        this.pz = this.z - z;
    }

    getVelocity() {
        return [
            this.x - this.px,
            this.y - this.py,
            this.z - this.pz,
        ];
    }

    setPosition(x, y, z) {
        // TODO: does the order matter?
        const velocity = this.getVelocity();
        this.x = x;
        this.y = y;
        this.z = z;
        this.setVelocity(velocity[0], velocity[1], velocity[2]);
    }

    getPosition() {
        const { u } = this.world;
        return [
            this.px + ((this.x - this.px) * u),
            this.py + ((this.y - this.py) * u),
            this.pz + ((this.z - this.pz) * u),
        ];
    }

    separatingVelocity(other) {
        const b1 = this;
        const b2 = other;

        const x = b1.x - b2.x;
        const y = b1.y - b2.y;
        const z = b1.z - b2.z;
        const l = Math.sqrt((x * x) + (y * y) + (z * z));
        const xn = x / l;
        const yn = y / l;
        const zn = z / l;

        const v1 = b1.getVelocity();
        const v2 = b2.getVelocity();

        const vrx = v1[0] - v2[0];
        const vry = v1[1] - v2[1];
        const vrz = v1[2] - v2[2];

        const vdotn = (vrx * xn) + (vry * yn) + (vrz * zn);
        const xs = vrx * vdotn;
        const ys = vry * vdotn;
        const zs = vrz * vdotn;
        const speed = Math.sqrt((xs * xs) + (ys * ys) + (zs * zs));

        return speed;
    }

    collide(other, restitute) {
        switch (other.type) {
        case types.AABB:
            this.collideAABB(other, restitute);
            break;
        case types.SPHERE:
            this.collideSphere(other, restitute);
            break;
        default:
            break;
        }
    }

    collideAABB() {
        // to be overriden by Sphere of AABB
    }

    collideSphere() {
        // to be overriden by Sphere of AABB
    }

    momentum() {
        if (this.dynamic) {
            const { x, y, z } = this;

            const xn = (x * 2) - this.px;
            const yn = (y * 2) - this.py;
            const zn = (z * 2) - this.pz;

            this.px = x;
            this.py = y;
            this.pz = z;

            this.x = xn;
            this.y = yn;
            this.z = zn;
        }
    }

    applyAcceleration(sdelta) {
        if (this.dynamic) {
            this.x += this.ax * sdelta;
            this.y += this.ay * sdelta;
            this.z += this.az * sdelta;

            this.ax = 0;
            this.ay = 0;
            this.az = 0;
        }
    }

    accelerate(x, y, z) {
        if (this.dynamic) {
            this.ax += x;
            this.ay += y;
            this.az += z;
        }
    }
}

export default Body;
