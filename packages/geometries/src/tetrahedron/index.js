import Polyhedra from '../polyhedra';

class Tetrahedron extends Polyhedra {
    constructor(radius = 1, detail = 0) {
        const positions = [
            1, 1, 1,
            -1, -1, 1,
            -1, 1, -1,
            1, -1, -1,
        ];

        const indices = [
            2, 1, 0,
            0, 3, 2,
            1, 3, 0,
            2, 3, 1,
        ];

        super(positions, indices, radius, detail);

        return this.geometry;
    }
}

export default Tetrahedron;
