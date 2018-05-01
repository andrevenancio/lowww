import Body from '../core/body';
import { types } from '../constants';

/* eslint-disable */
const clamp = (left, right, value) => {
    return value < left ? left : (value > right ? right : value); // eslint-disable-line
};

const handleContact = (b1, b2, depth, xn, yn, zn, restitute) => {
    let v1x = b1.x - b1.px;
    let v1y = b1.y - b1.py;
    let v1z = b1.z - b1.pz;

    let v2x = b2.x - b2.px;
    let v2y = b2.y - b2.py;
    let v2z = b2.z - b2.pz;

    const mt = b1.inv_mass + b2.inv_mass;
    const f1 = b1.inv_mass / mt;
    const f2 = b2.inv_mass / mt;

    const off1 = depth * f1;
    const off2 = depth * f2;

    b1.x += xn * off1;
    b1.y += yn * off1;
    b1.z += zn * off1;
    b2.x -= xn * off2;
    b2.y -= yn * off2;
    b2.z -= zn * off2;

    if (restitute) {
        const vrx = v1x - v2x;
        const vry = v1y - v2y;
        const vrz = v1z - v2z;

        const vdotn = (vrx * xn) + (vry * yn) + (vrz * zn);
        const modifiedVelocity = vdotn / mt;

        const j1 = -(1 + b2.restitution) * modifiedVelocity * b1.inv_mass;
        const j2 = -(1 + b1.restitution) * modifiedVelocity * b2.inv_mass;

        v1x += j1 * xn;
        v1y += j1 * yn;
        v1z += j1 * zn;

        v2x -= j2 * xn;
        v2y -= j2 * yn;
        v2z -= j2 * zn;

        b1.setVelocity(v1x, v1y, v1z);
        b2.setVelocity(v2x, v2y, v2z);
    }
};

class AABB extends Body {
    constructor(args) {
        super(); // TODO: does nothing
        const params = Object.assign({}, {
            width: 1,
            height: 1,
            depth: 1,
        }, args);

        this.type = types.AABB;
        this.dynamic = false;
        this.width = params.width;
        this.height = params.height;
        this.depth = params.depth;

        this.mesh = params.mesh;
        this.init(params);
    }

    updateBoundingVolume() {
        const { x, y, z } = this;
        const width = this.width / 2;
        const height = this.height / 2;
        const depth = this.depth / 2;

        this.left = x - width;
        this.right = x + width;

        this.top = y + height;
        this.bottom = y - height;

        this.front = z + depth;
        this.back = z - depth;

        return this;
    }

    collideSphere(b, restitute) {
        const cx = clamp(this.left, this.right, b.x);
        const cy = clamp(this.bottom, this.top, b.y);
        const cz = clamp(this.back, this.front, b.z);

        const x = cx - b.x;
        const y = cy - b.y;
        const z = cz - b.z;

        const ls = (x * x) + (y * y) + (z * z);

        if (ls === 0) {
            const x = this.z - b.x;
            const y = this.y - b.y;
            const z = this.z - b.z;
            const ls = (x * x) + (y * y) + (z * z);
        }

        if (ls === 0) {
            return;
        }

        const radius = b.radius;
        if (ls < (radius * radius)) {
            const l = Math.sqrt(ls);
            const xn = x / l;
            const yn = y / l;
            const zn = z / l;
            handleContact(this, b, radius - l, xn, yn, zn, restitute);
            this.onContact(b);
        }
    }
}

export default AABB;
