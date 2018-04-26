export const getTypeSize = (type) => {
    switch (type) {
    case 'float':
        return 1;
    case 'vec2':
        return 2;
    case 'vec3':
        return 3;
    case 'vec4':
    case 'mat2':
        return 4;
    case 'mat3':
        return 9;
    case 'mat4':
        return 16;
    default:
        throw new Error(`"${type}" is an unknown type`);
    }
};
