import { vec3 } from 'gl-matrix';
import { SPHERE_COLLIDER, AABB_COLLIDER } from '../constants';

const tempDirection = vec3.create();

export const handleContact = (a, b, depth, direction) => {
    const mt = a.inversemass() + b.inversemass();
    const f1 = a.inversemass() / mt;
    const f2 = b.inversemass() / mt;

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

export const sphereIntersectAABB = (a, b) => {

}

export const checkContacts = (a, b) => {
    switch (a.collider.type) {
    case SPHERE_COLLIDER:
        // surely there's a better way
        if (b.collider.type === SPHERE_COLLIDER) {
            sphereIntersectSphere(a, b);
        } else if (b.collider.type === AABB_COLLIDER) {
            // sphereIntersectAABB(a, b);
        }
        break;
    default:

    }
};
