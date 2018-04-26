import { vec3 } from 'gl-matrix';

class TorusKnot {
    constructor(radius = 1, tube = 0.375, tubularSegments = 64, radialSegments = 8, p = 2, q = 3) {
        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const vertex = vec3.create();
        const normal = vec3.create();

        const P1 = vec3.create();
        const P2 = vec3.create();

        const B = vec3.create();
        const T = vec3.create();
        const N = vec3.create();

        for (let i = 0; i <= tubularSegments; i++) {
            const u = (i / tubularSegments) * p * Math.PI * 2;
            this.calculatePositionOnCurve(u, p, q, radius, P1);
            this.calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

            vec3.subtract(T, P2, P1);
            vec3.add(N, P2, P1);
            vec3.cross(B, T, N);
            vec3.cross(N, B, T);

            vec3.normalize(B, B);
            vec3.normalize(N, N);

            for (let j = 0; j <= radialSegments; j++) {
                const v = (j / radialSegments) * Math.PI * 2;
                const cx = -tube * Math.cos(v);
                const cy = tube * Math.sin(v);

                vertex[0] = P1[0] + ((cx * N[0]) + (cy * B[0]));
                vertex[1] = P1[1] + ((cx * N[1]) + (cy * B[1]));
                vertex[2] = P1[2] + ((cx * N[2]) + (cy * B[2]));
                positions.push(...vertex);

                vec3.subtract(normal, vertex, P1);
                vec3.normalize(normal, normal);
                normals.push(...normal);

                uvs.push(i / tubularSegments, j / radialSegments);
            }
        }

        for (let j = 1; j <= tubularSegments; j++) {
            for (let i = 1; i <= radialSegments; i++) {
                const a = ((radialSegments + 1) * (j - 1)) + (i - 1);
                const b = ((radialSegments + 1) * j) + (i - 1);
                const c = ((radialSegments + 1) * j) + i;
                const d = ((radialSegments + 1) * (j - 1)) + i;

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

    calculatePositionOnCurve(u, p, q, radius, position) {
        const cu = Math.cos(u);
        const su = Math.sin(u);
        const quOverP = (q / p) * u;
        const cs = Math.cos(quOverP);

        position[0] = radius * (2 + cs) * 0.5 * cu;
        position[1] = radius * (2 + cs) * su * 0.5;
        position[2] = radius * Math.sin(quOverP) * 0.5;
    }
}

export default TorusKnot;
