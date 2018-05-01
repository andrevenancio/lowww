import Body from '../core/body';
import { types } from '../constants';

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

class Sphere extends Body {
    constructor(args) {
        super();
        this.type = types.SPHERE;
        this.dynamic = true;

        const params = Object.assign({}, {
            radius: 1,
        }, args);

        this.radius = params.radius;
        this.mesh = params.mesh;
        this.init(params);
    }

    computeMass() {
        return (4 / 3) * Math.PI * Math.pow(this.radius, 3) * this.density;
    }

    collideAABB(other, restitute) {
        other.collideSphere(this, restitute);
    }

    updateBoundingVolume() {
        const { x, y, z, radius } = this;

        this.left = x - radius;
        this.right = x + radius;

        this.top = y + radius;
        this.bottom = y - radius;

        this.front = z + radius;
        this.back = z - radius;

        return this;
    }

    collideSphere(b2, restitute) {
        const b1 = this;

        const x = b1.x - b2.x;
        const y = b1.y - b2.y;
        const z = b1.z - b2.z;

        const ls = (x * x) + (y * y) + (z * z);
        const target = b1.radius + b2.radius;

        if (ls !== 0 && ls < (target * target)) {
            const l = Math.sqrt(ls);
            const xn = (x / l);
            const yn = (y / l);
            const zn = (z / l);

            handleContact(b1, b2, target - l, xn, yn, zn, restitute);
            b1.onContact(b2);
        }
    }
}

export default Sphere;
