export const merge = (...props) => {
    console.log('merge', props);

    const positions = [];
    const indices = [];
    const normals = [];
    const uvs = [];

    return {
        positions,
        indices,
        normals,
        uvs,
    };
};
