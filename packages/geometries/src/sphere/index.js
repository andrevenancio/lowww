import { mat4, vec3 } from 'gl-matrix';

const matRotY = mat4.create();
const matRotZ = mat4.create();
const up = vec3.fromValues(0, 1, 0);
const tmpVec3 = vec3.create();

class Sphere {
    constructor(props) {
        const settings = Object.assign({}, {
            radius: 0.5,
            segments: 8,
        }, props);

        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const heightSegments = 2 + settings.segments;
        const widthSegments = 2 * heightSegments;

        for (let zStep = 0; zStep <= heightSegments; zStep++) {
            const v = zStep / heightSegments;
            const angleZ = (v * Math.PI);

            for (let yStep = 0; yStep <= widthSegments; yStep++) {
                const u = yStep / widthSegments;
                const angleY = u * Math.PI * 2;

                mat4.identity(matRotZ);
                mat4.rotateZ(matRotZ, matRotZ, -angleZ);

                mat4.identity(matRotY);
                mat4.rotateY(matRotY, matRotY, angleY);

                vec3.transformMat4(tmpVec3, up, matRotZ);
                vec3.transformMat4(tmpVec3, tmpVec3, matRotY);

                vec3.scale(tmpVec3, tmpVec3, -(settings.radius * 2));
                positions.push(...tmpVec3);

                vec3.normalize(tmpVec3, tmpVec3);
                normals.push(...tmpVec3);

                uvs.push(u, v);
            }

            if (zStep > 0) {
                const vertices = positions.length / 3;
                let firstIndex = vertices - (2 * (widthSegments + 1));
                for (; (firstIndex + widthSegments + 2) < vertices; firstIndex++) {
                    indices.push(
                        firstIndex,
                        firstIndex + 1,
                        firstIndex + widthSegments + 1,
                    );
                    indices.push(
                        firstIndex + widthSegments + 1,
                        firstIndex + 1,
                        firstIndex + widthSegments + 2,
                    );
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
