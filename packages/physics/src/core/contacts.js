import { vec3 } from 'gl-matrix';
import { SPHERE_COLLIDER, AABB_COLLIDER } from '../constants';

const tempDirection = vec3.create();

export const handleContact = (a, b, depth, direction) => {
    const mt = a.getInversemass() + b.getInversemass();
    const f1 = a.getInversemass() / mt;
    const f2 = b.getInversemass() / mt;

    const off1 = depth * f1;
    const off2 = depth * f2;

    a.velocity[0] += direction[0] * off1;
    a.velocity[1] += direction[1] * off1;
    a.velocity[2] += direction[2] * off1;

    b.velocity[0] -= direction[0] * off2;
    b.velocity[1] -= direction[1] * off2;
    b.velocity[2] -= direction[2] * off2;

    // restitute
};

export const sphereIntersectSphere = (a, b) => {
    const r = (a.collider.radius * 2) + (b.collider.radius * 2);
    const target = r * r;
    const length = vec3.squaredDistance(a.position, b.position);

    if (length < target) {
        vec3.subtract(tempDirection, a.position, b.position);
        vec3.normalize(tempDirection, tempDirection);

        handleContact(a, b, target - length, tempDirection);
    }
};

export const clamp = (min, max, value) => {
    return value < min ? min : (value > max ? max : value); // eslint-disable-line
};

export const AABBIntersectAABB = (a, b) => {
    // TODO: is this the fastest thing I can do?
    const amin = vec3.fromValues(a.collider.left, a.collider.bottom, a.collider.back);
    const amax = vec3.fromValues(a.collider.right, a.collider.top, a.collider.front);

    const bmin = vec3.fromValues(b.collider.left, b.collider.bottom, b.collider.back);
    const bmax = vec3.fromValues(b.collider.right, b.collider.top, b.collider.front);

    if (amax[0] > bmin[0] &&
        amin[0] < bmax[0] &&
        amax[1] > bmin[1] &&
        amin[1] < bmax[1] &&
        amax[2] > bmin[2] &&
        amin[2] < bmax[2]) {
        // when colliding check how much
        vec3.subtract(tempDirection, a.position, b.position);
        vec3.normalize(tempDirection, tempDirection);

        // TODO: WRONG!
        // const x1 = bmax[0] - amin[0];
        // const x2 = amin[0] - bmax[0];
        //
        // const y1 = bmax[1] - amin[1];
        // const y2 = amin[1] - bmax[1];
        //
        // const z1 = bmax[2] - amin[2];
        // const z2 = amin[2] - bmax[2];
        //
        // const x = Math.max(x1, x2);
        // const y = Math.max(y1, y2);
        // const z = Math.max(z1, z2);
        // console.log(amin, amax, bmin, bmax);
        // console.log(x1, x2, x);

        // const aa = x * y * z;
        // const bb = x + y + z;
        // // const length = vec3.squaredDistance(a.position, b.position);
        // console.log(x, y, z, aa, bb);
        // // debugger;

        // handleContact(a, b, target - length, tempDirection);
    }
};

export const checkContacts = (a, b) => {
    // switch (a.collider.type) {
    // case AABB_COLLIDER:
    //     // surely there's a better way
    //     if (b.collider.type === SPHERE_COLLIDER) {
    //         sphereIntersectSphere(a, b);
    //     } else if (b.collider.type === AABB_COLLIDER) {
    //         AABBIntersectAABB(a, b);
    //     }
    //     break;
    // default:
    // }
    AABBIntersectAABB(a, b);
};
