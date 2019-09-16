import Polyhedra from '../polyhedra';

class Tetrahedron extends Polyhedra {
    constructor(props) {
        const settings = Object.assign(
            {},
            {
                radius: 0.5,
                detail: 0,
            },
            props
        );

        const positions = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];

        const indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];

        super(positions, indices, settings.radius * 2, settings.detail);

        return this.geometry;
    }
}

export default Tetrahedron;
