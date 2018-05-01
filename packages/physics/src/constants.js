export const types = {
    AABB: 'aabb',
    SPHERE: 'sphere',
    FORCE: 'force',
};

let bodyId = 0;
export const getID = () => {
    return bodyId++;
};
