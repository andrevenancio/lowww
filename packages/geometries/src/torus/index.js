import { vec3 } from 'gl-matrix';

class Torus {
    constructor(
        radius = 1,
        tube = 0.375,
        tubularSegments = 16,
        radialSegments = 8,
        arc = Math.PI * 2,
    ) {
        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const center = vec3.create();
        const vertex = vec3.create();
        const normal = vec3.create();

        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++) {
                const u = (i / tubularSegments) * arc;
                const v = (j / radialSegments) * Math.PI * 2;

                vertex[0] = (radius + (tube * Math.cos(v))) * Math.cos(u);
                vertex[1] = (radius + (tube * Math.cos(v))) * Math.sin(u);
                vertex[2] = tube * Math.sin(v);

                positions.push(...vertex);

                center[0] = radius * Math.cos(u);
                center[1] = radius * Math.sin(u);
                vec3.subtract(normal, vertex, center);
                vec3.normalize(normal, normal);

                normals.push(...normal);

                uvs.push(i / tubularSegments);
                uvs.push(j / radialSegments);
            }
        }

        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                const a = ((tubularSegments + 1) * j) + (i - 1);
                const b = ((tubularSegments + 1) * (j - 1)) + (i - 1);
                const c = ((tubularSegments + 1) * (j - 1)) + i;
                const d = ((tubularSegments + 1) * j) + i;

                indices.push(a, b, d);
                indices.push(b, c, d);
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

export default Torus;
