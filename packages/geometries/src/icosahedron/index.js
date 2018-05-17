import Polyhedra from '../polyhedra';

class Icosahedron extends Polyhedra {
    constructor(props) {
        const settings = Object.assign({}, {
            radius: 0.5,
            detail: 0,
        }, props);

        const t = 0.5 + (Math.sqrt(5) / 2);
        const r = settings.radius * 2;

        const positions = [
            -1, +t, 0,
            +1, +t, 0,
            -1, -t, 0,
            +1, -t, 0,
            0, -1, +t,
            0, +1, +t,
            0, -1, -t,
            0, +1, -t,
            +t, 0, -1,
            +t, 0, +1,
            -t, 0, -1,
            -t, 0, +1,
        ];

        const indices = [
            0, 11, 5,
            0, 5, 1,
            0, 1, 7,
            0, 7, 10,
            0, 10, 11,
            1, 5, 9,
            5, 11, 4,
            11, 10, 2,
            10, 7, 6,
            7, 1, 8,
            3, 9, 4,
            3, 4, 2,
            3, 2, 6,
            3, 6, 8,
            3, 8, 9,
            4, 9, 5,
            2, 4, 11,
            6, 2, 10,
            8, 6, 7,
            9, 8, 1,
        ];

        super(positions, indices, r, settings.detail);

        return this.geometry;
    }
}

export default Icosahedron;
