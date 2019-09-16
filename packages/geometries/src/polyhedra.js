import { generateVertexNormals, flatten, unflatten } from './utils';

class Polyhedra {
    constructor(positions, faces, radius, detail = 0) {
        const uvs = [];

        let complex = {
            faces: unflatten(faces, 3),
            positions: unflatten(positions, 3),
        };

        let d = Math.min(detail, 4);

        while (d-- > 0) {
            complex = this.subdivide(complex);
        }

        // generate uvs
        for (let i = 0; i < complex.positions.length; i++) {
            const position = this.normalize(complex.positions[i]);
            const u =
                0.5 *
                (-(Math.atan2(position[2], -position[0]) / Math.PI) + 1.0);
            const v = 0.5 + Math.asin(position[1]) / Math.PI;
            uvs.push([1 - u, 1 - v]);
        }

        // http://mft-dev.dk/uv-mapping-sphere/
        // this.fixPoleUVs(complex.positions, complex.faces, uvs);

        // scale positions
        positions = complex.positions; // eslint-disable-line
        for (let i = 0; i < positions.length; i++) {
            // this.normalize(positions[i]);
            this.scale(positions[i], radius);
        }

        const geometry = {
            positions: flatten(complex.positions),
            indices: flatten(complex.faces),
            normals: null,
            uvs: flatten(uvs, 2),
        };

        this.geometry = {
            positions: geometry.positions,
            indices: geometry.indices,
            normals: generateVertexNormals(
                geometry.positions,
                geometry.indices
            ),
            uvs: flatten(uvs, 2),
        };
    }

    fixPoleUVs(positions, cells, uvs) {
        const northIndex = this.firstYIndex(positions, 1);
        const southIndex = this.firstYIndex(positions, -1);

        if (northIndex === -1 || southIndex === -1) {
            // could not find any poles, bail early
            return;
        }

        const newVertices = positions.slice();
        const newUvs = uvs.slice();
        let verticeIndex = newVertices.length - 1;

        function visit(cell, poleIndex, b, c) {
            const uv1 = uvs[b];
            const uv2 = uvs[c];
            uvs[poleIndex][0] = (uv1[0] + uv2[0]) / 2;
            verticeIndex++;
            newVertices.push(positions[poleIndex].slice());
            newUvs.push(uvs[poleIndex].slice());
            cell[0] = verticeIndex;
        }

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const a = cell[0];
            const b = cell[1];
            const c = cell[2];

            if (a === northIndex) {
                visit(cell, northIndex, b, c);
            } else if (a === southIndex) {
                visit(cell, southIndex, b, c);
            }
        }

        positions = newVertices;
        uvs = newUvs;
    }

    firstYIndex(list, value) {
        for (let i = 0; i < list.length; i++) {
            const vec = list[i];
            if (Math.abs(vec[1] - value) <= 1e-4) {
                return i;
            }
        }
        return -1;
    }

    normalize(vec) {
        let mag = 0;
        for (let n = 0; n < vec.length; n++) {
            mag += vec[n] * vec[n];
        }
        mag = Math.sqrt(mag);

        // avoid dividing by zero
        if (mag === 0) {
            return Array.apply(null, new Array(vec.length)).map(
                Number.prototype.valueOf,
                0
            ); // eslint-disable-line
        }

        for (let n = 0; n < vec.length; n++) {
            vec[n] /= mag;
        }

        return vec;
    }

    scale(vec, factor) {
        for (let n = 0; n < vec.length; n++) {
            vec[n] *= factor;
        }
        return vec;
    }

    subdivide(complex) {
        const { positions, faces } = complex;

        const newCells = [];
        const newPositions = [];
        const midpoints = {};
        let l = 0;

        function midpoint(a, b) {
            return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        }

        function pointToKey(point) {
            return `${point[0].toPrecision(6)},${point[1].toPrecision(
                6
            )},${point[2].toPrecision(6)}`;
        }

        function getMidpoint(a, b) {
            const point = midpoint(a, b);
            const pointKey = pointToKey(point);
            const cachedPoint = midpoints[pointKey];
            if (cachedPoint) {
                return cachedPoint;
            }
            midpoints[pointKey] = point;
            return midpoints[pointKey];
        }

        for (let i = 0; i < faces.length; i++) {
            const cell = faces[i];
            const c0 = cell[0];
            const c1 = cell[1];
            const c2 = cell[2];
            const v0 = positions[c0];
            const v1 = positions[c1];
            const v2 = positions[c2];

            const a = getMidpoint(v0, v1);
            const b = getMidpoint(v1, v2);
            const c = getMidpoint(v2, v0);

            let ai = newPositions.indexOf(a);
            if (ai === -1) {
                ai = l++;
                newPositions.push(a);
            }
            let bi = newPositions.indexOf(b);
            if (bi === -1) {
                bi = l++;
                newPositions.push(b);
            }
            let ci = newPositions.indexOf(c);
            if (ci === -1) {
                ci = l++;
                newPositions.push(c);
            }

            let v0i = newPositions.indexOf(v0);
            if (v0i === -1) {
                v0i = l++;
                newPositions.push(v0);
            }
            let v1i = newPositions.indexOf(v1);
            if (v1i === -1) {
                v1i = l++;
                newPositions.push(v1);
            }
            let v2i = newPositions.indexOf(v2);
            if (v2i === -1) {
                v2i = l++;
                newPositions.push(v2);
            }

            newCells.push([v0i, ai, ci]);
            newCells.push([v1i, bi, ai]);
            newCells.push([v2i, ci, bi]);
            newCells.push([ai, bi, ci]);
        }

        return {
            faces: newCells,
            positions: newPositions,
        };
    }
}

export default Polyhedra;
