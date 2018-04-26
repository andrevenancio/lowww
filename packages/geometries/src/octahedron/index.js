import Polyhedra from '../polyhedra';

class Octahedron extends Polyhedra {
    constructor(radius = 1, detail = 0) {
        const positions = [
            1, 0, 0, -1, 0, 0, 0, 1, 0,
            0, -1, 0, 0, 0, 1, 0, 0, -1,
        ];

        const indices = [
            0, 2, 4, 0, 4, 3, 0, 3, 5,
            0, 5, 2, 1, 2, 5, 1, 5, 3,
            1, 3, 4, 1, 4, 2,
        ];

        super(positions, indices, radius, detail);

        return this.geometry;
    }
}

export default Octahedron;
