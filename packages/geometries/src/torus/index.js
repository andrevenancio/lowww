import { vec3 } from 'gl-matrix';

class Torus {
    constructor(props) {
        const settings = Object.assign({}, {
            radius: 1,
            tube: 0.375,
            tubularSegments: 16,
            radialSegments: 8,
            arc: Math.PI * 2,
        }, props);

        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const center = vec3.create();
        const vertex = vec3.create();
        const normal = vec3.create();

        for (let j = 0; j <= settings.radialSegments; j++) {
            for (let i = 0; i <= settings.tubularSegments; i++) {
                const u = (i / settings.tubularSegments) * settings.arc;
                const v = (j / settings.radialSegments) * Math.PI * 2;

                vertex[0] = (settings.radius + (settings.tube * Math.cos(v))) * Math.cos(u);
                vertex[1] = (settings.radius + (settings.tube * Math.cos(v))) * Math.sin(u);
                vertex[2] = settings.tube * Math.sin(v);

                positions.push(...vertex);

                center[0] = settings.radius * Math.cos(u);
                center[1] = settings.radius * Math.sin(u);
                vec3.subtract(normal, vertex, center);
                vec3.normalize(normal, normal);

                normals.push(...normal);

                uvs.push(i / settings.tubularSegments);
                uvs.push(j / settings.radialSegments);
            }
        }

        for (let j = 1; j <= settings.radialSegments; j++) {
            for (let i = 1; i <= settings.tubularSegments; i++) {
                const a = ((settings.tubularSegments + 1) * j) + (i - 1);
                const b = ((settings.tubularSegments + 1) * (j - 1)) + (i - 1);
                const c = ((settings.tubularSegments + 1) * (j - 1)) + i;
                const d = ((settings.tubularSegments + 1) * j) + i;

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
