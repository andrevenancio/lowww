import { vec3 } from 'gl-matrix';

class Sphere {
    constructor(
        radius = 1,
        widthSegments = 8,
        heightSegments = 6,
        phiStart = -Math.PI * 2, // 0
        phiLength = Math.PI * 2,
        thetaStart = Math.PI, // 0
        thetaLength = Math.PI,
    ) {
        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const vertex = vec3.create();
        const normal = vec3.create();
        const thetaEnd = thetaStart + thetaLength;
        let index = 0;
        const grid = [];

        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow = [];
            const v = iy / heightSegments;

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;

                // vertex
                vertex[0] = -radius * Math.cos(phiStart + (u * phiLength)) *
                    Math.sin(thetaStart + (v * thetaLength));
                vertex[1] = radius * Math.cos(thetaStart + (v * thetaLength));
                vertex[2] = radius * Math.sin(phiStart + (u * phiLength)) *
                    Math.sin(thetaStart + (v * thetaLength));

                positions.push(...vertex);

                // normal
                vec3.normalize(normal, vertex);
                normals.push(...normal);

                // uv
                uvs.push(u, 1 - v);
                verticesRow.push(index++);
            }
            grid.push(verticesRow);
        }

        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0 || thetaStart > 0) {
                    indices.push(a, b, d);
                }
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
                    indices.push(b, c, d);
                }
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

export default Sphere;
