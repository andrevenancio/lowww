import { vec3 } from 'gl-matrix';
import Mesh from '../core/mesh';
import Model from '../core/model';
import { Basic } from '../shaders';

class AxisHelper extends Model {
    constructor(props = {}) {
        super();

        const size = (props && props.size) || 10;
        const g1 = {
            positions: [
                ...vec3.fromValues(0, 0, 0),
                ...vec3.fromValues(size, 0, 0),
            ],
        };
        const g2 = {
            positions: [
                ...vec3.fromValues(0, 0, 0),
                ...vec3.fromValues(0, size, 0),
            ],
        };
        const g3 = {
            positions: [
                ...vec3.fromValues(0, 0, 0),
                ...vec3.fromValues(0, 0, size),
            ],
        };

        const m1 = new Basic({
            color: vec3.fromValues(1, 0, 0),
            wireframe: true,
        });
        const m2 = new Basic({
            color: vec3.fromValues(0, 1, 0),
            wireframe: true,
        });
        const m3 = new Basic({
            color: vec3.fromValues(0, 0, 1),
            wireframe: true,
        });

        const x = new Mesh({ geometry: g1, shader: m1 });
        this.add(x);

        const y = new Mesh({ geometry: g2, shader: m2 });
        this.add(y);

        const z = new Mesh({ geometry: g3, shader: m3 });
        this.add(z);
    }
}
export default AxisHelper;
