class Plane {
    constructor(width = 1, height = 1, subdivisionsX = 1, subdivisionsY = 1, axis = 'XY') {
        let positions = [];
        const indices = [];
        let normals = [];
        let uvs = [];
        let index = 0;

        const w = width * 2;
        const h = height * 2;
        const spacerX = w / subdivisionsX;
        const spacerY = h / subdivisionsY;
        const offsetX = -w * 0.5;
        const offsetY = -h * 0.5;
        const spacerU = 1 / subdivisionsX;
        const spacerV = 1 / subdivisionsY;

        for (let y = 0; y < subdivisionsY; y++) {
            for (let x = 0; x < subdivisionsX; x++) {
                const triangleX = (spacerX * x) + offsetX;
                const triangleY = (spacerY * y) + offsetY;

                const u = x / subdivisionsX;
                const v = y / subdivisionsY;

                switch (axis) {
                case 'XZ':
                    // Facing towards y
                    positions = positions.concat([triangleX, 0, triangleY]);
                    positions = positions.concat([triangleX + spacerX, 0, triangleY]);
                    positions = positions.concat([triangleX + spacerX, 0, triangleY + spacerY]);
                    positions = positions.concat([triangleX, 0, triangleY + spacerY]);

                    normals = normals.concat([0, 1, 0]);
                    normals = normals.concat([0, 1, 0]);
                    normals = normals.concat([0, 1, 0]);
                    normals = normals.concat([0, 1, 0]);

                    uvs = uvs.concat([u, 1 - v]);
                    uvs = uvs.concat([u + spacerU, 1 - v]);
                    uvs = uvs.concat([u + spacerU, 1 - (v + spacerV)]);
                    uvs = uvs.concat([u, 1 - (v + spacerV)]);
                    break;
                case 'YZ':
                    // Facing towards x

                    positions = positions.concat([0, triangleY, triangleX]);
                    positions = positions.concat([0, triangleY, triangleX + spacerX]);
                    positions = positions.concat([0, triangleY + spacerY, triangleX + spacerX]);
                    positions = positions.concat([0, triangleY + spacerY, triangleX]);

                    normals = normals.concat([1, 0, 0]);
                    normals = normals.concat([1, 0, 0]);
                    normals = normals.concat([1, 0, 0]);
                    normals = normals.concat([1, 0, 0]);

                    uvs = uvs.concat([1 - u, v]);
                    uvs = uvs.concat([1 - (u + spacerU), v]);
                    uvs = uvs.concat([1 - (u + spacerU), v + spacerV]);
                    uvs = uvs.concat([1 - u, v + spacerV]);
                    break;
                default:
                    // Facing towards z
                    positions = positions.concat([triangleX, triangleY, 0]);
                    positions = positions.concat([triangleX + spacerX, triangleY, 0]);
                    positions = positions.concat([triangleX + spacerX, triangleY + spacerY, 0]);
                    positions = positions.concat([triangleX, triangleY + spacerY, 0]);

                    normals = normals.concat([0, 0, 1]);
                    normals = normals.concat([0, 0, 1]);
                    normals = normals.concat([0, 0, 1]);
                    normals = normals.concat([0, 0, 1]);

                    uvs = uvs.concat([u, v]);
                    uvs = uvs.concat([u + spacerU, v]);
                    uvs = uvs.concat([u + spacerU, v + spacerV]);
                    uvs = uvs.concat([u, v + spacerV]);
                }

                indices.push((index * 4) + 0);
                indices.push((index * 4) + 1);
                indices.push((index * 4) + 2);
                indices.push((index * 4) + 0);
                indices.push((index * 4) + 2);
                indices.push((index * 4) + 3);

                index++;
            }
        }

        return {
            positions,
            indices,
            normals,
            uvs,
        };
    }
}

export default Plane;
