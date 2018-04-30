class Modify {
    static getData = (index, step, array) => {
        const i = index * step;
        const data = [];
        for (let j = 0; j < step; j++) {
            data.push(array[i + j]);
        }

        return data;
    }

    static detach = (geometry) => {
        const positions = [];
        const normals = [];
        const uvs = [];

        for (let i = 0; i < geometry.indices.length; i += 3) {
            const fa = geometry.indices[i + 0];
            const fb = geometry.indices[i + 1];
            const fc = geometry.indices[i + 2];

            // gets faces
            positions.push(...Modify.getData(fa, 3, geometry.positions));
            positions.push(...Modify.getData(fb, 3, geometry.positions));
            positions.push(...Modify.getData(fc, 3, geometry.positions));

            // gets normals
            normals.push(...Modify.getData(fa, 3, geometry.normals));
            normals.push(...Modify.getData(fb, 3, geometry.normals));
            normals.push(...Modify.getData(fc, 3, geometry.normals));

            // gets uvs
            uvs.push(...Modify.getData(fa, 2, geometry.uvs));
            uvs.push(...Modify.getData(fb, 2, geometry.uvs));
            uvs.push(...Modify.getData(fc, 2, geometry.uvs));
        }

        return {
            positions,
            normals,
            uvs,
        };
    }

    // every face (3 points) becomes 1 tetrahedron
    static modify = (geometry) => {
        const positions = [];
        const normals = [];
        const uvs = [];

        for (let i = 0; i < geometry.indices.length; i += 3) {
            const fa = geometry.indices[i + 0];
            const fb = geometry.indices[i + 1];
            const fc = geometry.indices[i + 2];

            // gets faces CBA order
            positions.push(...Modify.getData(fa, 3, geometry.positions));
            positions.push(...Modify.getData(fb, 3, geometry.positions));
            positions.push(...Modify.getData(fc, 3, geometry.positions));

            // gets normals
            normals.push(...Modify.getData(fa, 3, geometry.normals));
            normals.push(...Modify.getData(fb, 3, geometry.normals));
            normals.push(...Modify.getData(fc, 3, geometry.normals));

            // gets uvs
            uvs.push(...Modify.getData(fa, 2, geometry.uvs));
            uvs.push(...Modify.getData(fb, 2, geometry.uvs));
            uvs.push(...Modify.getData(fc, 2, geometry.uvs));

            // EXTRAS
            positions.push(...Modify.getData(fa, 3, geometry.positions));
            positions.push(...Modify.getData(fc, 3, geometry.positions));
            positions.push(0, 0, 0);
            positions.push(...Modify.getData(fc, 3, geometry.positions));
            positions.push(...Modify.getData(fb, 3, geometry.positions));
            positions.push(0, 0, 0);
            positions.push(...Modify.getData(fb, 3, geometry.positions));
            positions.push(...Modify.getData(fa, 3, geometry.positions));
            positions.push(0, 0, 0);

            normals.push(...Modify.getData(fa, 3, geometry.normals));
            normals.push(...Modify.getData(fc, 3, geometry.normals));
            normals.push(0, 0, 0);
            normals.push(...Modify.getData(fc, 3, geometry.normals));
            normals.push(...Modify.getData(fb, 3, geometry.normals));
            normals.push(0, 0, 0);
            normals.push(...Modify.getData(fb, 3, geometry.normals));
            normals.push(...Modify.getData(fa, 3, geometry.normals));
            normals.push(0, 0, 0);

            uvs.push(...Modify.getData(fa, 2, geometry.uvs));
            uvs.push(...Modify.getData(fc, 2, geometry.uvs));
            uvs.push(0, 0);
            uvs.push(...Modify.getData(fc, 2, geometry.uvs));
            uvs.push(...Modify.getData(fb, 2, geometry.uvs));
            uvs.push(0, 0);
            uvs.push(...Modify.getData(fb, 2, geometry.uvs));
            uvs.push(...Modify.getData(fa, 2, geometry.uvs));
            uvs.push(0, 0);
        }

        return {
            positions,
            normals,
            uvs,
        };
    }
}

export { Modify };
